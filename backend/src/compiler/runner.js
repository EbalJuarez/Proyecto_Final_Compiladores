import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { config } from '../config.js';

/** El binario no existe, no es ejecutable o no puede iniciar: no es culpa del código del usuario. */
export class CompilerUnavailableError extends Error {}

const ELF_MAGIC = Buffer.from([0x7f, 0x45, 0x4c, 0x46]);

async function isElf(file) {
  const handle = await fs.open(file, 'r');
  try {
    const buf = Buffer.alloc(4);
    await handle.read(buf, 0, 4, 0);
    return buf.equals(ELF_MAGIC);
  } finally {
    await handle.close();
  }
}

/** C:\Users\x\bmlang -> /mnt/c/Users/x/bmlang */
export function toWslPath(winPath) {
  const match = /^([a-zA-Z]):[\\/](.*)$/.exec(winPath);
  if (!match) return winPath.replace(/\\/g, '/');
  return `/mnt/${match[1].toLowerCase()}/${match[2].replace(/\\/g, '/')}`;
}

/**
 * Decide cómo lanzar un binario del compilador. Siempre devuelve comando + argumentos
 * en arreglo (nunca una línea de shell).
 */
export async function resolveCommand(binPath = config.bmlangPath, runner = config.runner) {
  try {
    await fs.access(binPath);
  } catch {
    throw new CompilerUnavailableError(
      `No se encontró el binario de BMLang en "${binPath}". Compílalo o configura la variable BMLANG_PATH.`,
    );
  }

  let mode = runner;
  if (mode === 'auto') {
    mode = process.platform === 'win32' && (await isElf(binPath)) ? 'wsl' : 'native';
  }

  if (mode === 'wsl') {
    const distro = config.wslDistro ? ['-d', config.wslDistro] : [];
    return { command: 'wsl.exe', args: [...distro, '-e', toWslPath(binPath)], mode };
  }

  if (process.platform !== 'win32') {
    try {
      await fs.access(binPath, fs.constants.X_OK);
    } catch {
      throw new CompilerUnavailableError(
        `El binario "${binPath}" no tiene permiso de ejecución. Ejecuta: chmod +x "${binPath}"`,
      );
    }
  }
  return { command: binPath, args: [], mode };
}

function collector(limit) {
  const chunks = [];
  let size = 0;
  let truncated = false;
  return {
    push(chunk) {
      if (size >= limit) {
        truncated = true;
        return;
      }
      const room = limit - size;
      const part = chunk.length > room ? chunk.subarray(0, room) : chunk;
      if (part.length < chunk.length) truncated = true;
      chunks.push(part);
      size += part.length;
    },
    text() {
      const buf = Buffer.concat(chunks);
      // Los mensajes propios de wsl.exe llegan en UTF-16LE ("E\0r\0r\0...").
      const utf16 = buf.length >= 4 && buf[1] === 0 && buf[3] === 0;
      const out = buf.toString(utf16 ? 'utf16le' : 'utf8');
      return truncated ? `${out}\n[... salida truncada a ${limit} bytes]` : out;
    },
  };
}

/**
 * Ejecuta un proceso alimentando `inputFile` por stdin, con timeout y límite de salida.
 * Rechaza solo si el proceso no pudo lanzarse (ENOENT, EACCES...).
 */
export function runProcess({ command, args, inputFile, cwd, timeoutMs = config.timeoutMs, maxOutputBytes = config.maxOutputBytes }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timedOut = false;
    const stdout = collector(maxOutputBytes);
    const stderr = collector(maxOutputBytes);

    const child = spawn(command, args, { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (c) => stdout.push(c));
    child.stderr.on('data', (c) => stderr.push(c));
    // EPIPE si el analizador termina antes de leer toda la entrada (p. ej. tras un error).
    child.stdin.on('error', () => {});

    child.on('error', (err) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve({ exitCode, signal, timedOut, stdout: stdout.text(), stderr: stderr.text() });
    });

    if (inputFile) {
      const input = createReadStream(inputFile);
      input.on('error', () => child.kill('SIGKILL'));
      input.pipe(child.stdin);
    } else {
      child.stdin.end();
    }
  });
}

function spawnErrorMessage(err, { command, mode }) {
  if (err.code === 'ENOENT') {
    return mode === 'wsl'
      ? 'No se encontró wsl.exe. El binario es de Linux: instala WSL o compílalo para Windows y configura BMLANG_PATH.'
      : `No se pudo ejecutar "${command}": el archivo no existe.`;
  }
  if (err.code === 'EACCES') return `El binario "${command}" no tiene permiso de ejecución (chmod +x).`;
  return `No se pudo ejecutar el analizador (${err.code || err.message}).`;
}

/** Fallos del binario al arrancar (no son errores de sintaxis del programa). */
function startupFailure({ exitCode, stdout, stderr }, mode) {
  const firstLine = stderr.trim().split(/\r?\n/)[0] || '';
  // wsl.exe termina con -1 (4294967295 en Windows) cuando falla el propio servicio de WSL.
  if (mode === 'wsl' && (exitCode === -1 || exitCode === 4294967295)) {
    const detail = `${stdout}\n${stderr}`.replace(/\s+/g, ' ').trim();
    return `WSL no pudo ejecutar el analizador (${detail || `código ${exitCode}`}). Ejecuta "wsl --shutdown" en una terminal y vuelve a intentar.`;
  }
  if (exitCode === 127 && /error while loading shared libraries/i.test(stderr)) {
    const lib = /libraries:\s*([^:]+):/.exec(stderr)?.[1] ?? 'una librería';
    const hint = /libfl/.test(lib)
      ? ' Instala la librería de Flex en WSL/Linux (sudo apt install libfl2) o recompila sin -lfl.'
      : '';
    return `El binario de BMLang no pudo iniciar: falta ${lib}.${hint}`;
  }
  if (exitCode === 127 || exitCode === 126) {
    return `El binario de BMLang no pudo iniciar (código ${exitCode}): ${firstLine}`;
  }
  return null;
}

/**
 * Guarda el código en un directorio temporal único, lo pasa por stdin a `bmlang`
 * y devuelve el resultado crudo { exitCode, stdout, stderr, timedOut }.
 */
export async function runBmlang(code, binPath = config.bmlangPath) {
  const cmd = await resolveCommand(binPath);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmlang-'));
  try {
    const inputFile = path.join(dir, 'programa.bml');
    await fs.writeFile(inputFile, code, 'utf8');

    let result;
    try {
      result = await runProcess({ ...cmd, inputFile });
    } catch (err) {
      throw new CompilerUnavailableError(spawnErrorMessage(err, cmd));
    }

    if (!result.timedOut) {
      const failure = startupFailure(result, cmd.mode);
      if (failure) throw new CompilerUnavailableError(failure);
    }
    return result;
  } finally {
    await fs.rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
