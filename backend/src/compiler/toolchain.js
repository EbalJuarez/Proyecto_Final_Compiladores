import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { CompilerUnavailableError, runProcess, toWslPath } from './runner.js';

// En Windows nasm, ld y el ejecutable ELF resultante corren dentro de WSL
// (salvo BMLANG_RUNNER=native); en Linux, directo.
const viaWsl = () => process.platform === 'win32' && config.runner !== 'native';

function hostCommand(bin, args) {
  if (!viaWsl()) return { command: bin, args, mode: 'native' };
  const distro = config.wslDistro ? ['-d', config.wslDistro] : [];
  const mapped = args.map((a) => (path.isAbsolute(a) ? toWslPath(a) : a));
  return { command: 'wsl.exe', args: [...distro, '-e', toWslPath(bin), ...mapped], mode: 'wsl' };
}

/** Ejecuta una herramienta externa; si no existe, lanza un error con la variable a configurar. */
async function runTool(label, envVar, bin, args, { isProgram = false, ...options } = {}) {
  const cmd = hostCommand(bin, args);
  let result;
  try {
    result = await runProcess({ ...cmd, ...options });
  } catch (err) {
    throw new CompilerUnavailableError(
      err.code === 'ENOENT'
        ? `No se encontró ${label} ("${bin}"). Instálalo o configura la variable ${envVar}.`
        : `No se pudo ejecutar ${label} (${err.code || err.message}).`,
    );
  }
  // 127: el comando no existe dentro de WSL (o el shell no lo encontró).
  if (!isProgram && result.exitCode === 127 && !result.timedOut) {
    throw new CompilerUnavailableError(`No se encontró ${label} ("${bin}"). Instálalo o configura la variable ${envVar}.`);
  }
  return result;
}

const timeoutError = (what) => ({ line: null, message: `${what} excedió el tiempo límite de ${config.timeoutMs / 1000} s y fue detenido.` });

/** "programa.asm:12: error: ..." -> { line: 12, message: "error: ..." } */
export function parseNasmErrors(stderr) {
  const errors = [];
  for (const text of stderr.split(/\r?\n/)) {
    const match = /^[^:]*\.asm:(\d+):\s*(.*)$/.exec(text.trim());
    if (match && !/^warning/i.test(match[2])) errors.push({ line: Number(match[1]), message: match[2] });
  }
  return errors;
}

/**
 * Ensambla `asmText` con `nasm -f elf32` y enlaza con `ld -m elf_i386` dentro de `dir`.
 * @returns {Promise<{ ok: true, exe: string, log: string } | { ok: false, stage: 'nasm'|'ld', errors: {line: number|null, message: string}[], raw: string }>}
 */
export async function assembleAndLink(asmText, dir) {
  const asmFile = path.join(dir, 'programa.asm');
  const objFile = path.join(dir, 'programa.o');
  const exe = path.join(dir, 'programa');
  await fs.writeFile(asmFile, asmText, 'utf8');

  const nasm = await runTool('nasm', 'NASM_PATH', config.nasmPath, ['-f', 'elf32', '-o', objFile, asmFile]);
  if (nasm.timedOut) return { ok: false, stage: 'nasm', errors: [timeoutError('nasm')], raw: nasm.stderr };
  if (nasm.exitCode !== 0) {
    const errors = parseNasmErrors(nasm.stderr);
    return {
      ok: false,
      stage: 'nasm',
      errors: errors.length ? errors : [{ line: null, message: nasm.stderr.trim() || `nasm terminó con código ${nasm.exitCode}` }],
      raw: nasm.stderr.trim(),
    };
  }

  const ld = await runTool('ld', 'LD_PATH', config.ldPath, ['-m', 'elf_i386', '-o', exe, objFile]);
  if (ld.timedOut) return { ok: false, stage: 'ld', errors: [timeoutError('ld')], raw: ld.stderr };
  if (ld.exitCode !== 0) {
    return {
      ok: false,
      stage: 'ld',
      errors: [{ line: null, message: ld.stderr.trim() || `ld terminó con código ${ld.exitCode}` }],
      raw: ld.stderr.trim(),
    };
  }

  const log = [nasm.stderr, ld.stderr].map((s) => s.trim()).filter(Boolean).join('\n');
  return { ok: true, exe, log };
}

/**
 * Ejecuta el programa compilado alimentando `stdin`, con el mismo timeout y límite de salida.
 * @returns {Promise<{ ok: boolean, output: string, exitCode: number|null, errors: {line: null, message: string}[] }>}
 */
export async function runExecutable(exe, stdin = '') {
  const result = await runTool('el programa', 'BMLANG_RUNNER', exe, [], { isProgram: true, input: stdin, cwd: path.dirname(exe) });
  const output = [result.stdout, result.stderr].filter(Boolean).join('');
  if (result.timedOut) {
    return { ok: false, output, exitCode: null, errors: [timeoutError('El programa')] };
  }
  if (result.exitCode !== 0) {
    const why = result.signal ? `la señal ${result.signal}` : `código ${result.exitCode}`;
    return { ok: false, output, exitCode: result.exitCode, errors: [{ line: null, message: `El programa terminó con ${why}.` }] };
  }
  return { ok: true, output, exitCode: 0, errors: [] };
}
