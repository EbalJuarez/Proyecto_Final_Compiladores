import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { parseCompilerOutput } from './parseCompilerOutput.js';
import { CompilerUnavailableError, resolveCommand, runBmlang, runProcess, withTempDir } from './runner.js';
import { assembleAndLink, runExecutable } from './toolchain.js';

export { CompilerUnavailableError, resolveCommand } from './runner.js';
export { parseCompilerOutput } from './parseCompilerOutput.js';
export { assembleAndLink, runExecutable } from './toolchain.js';

export const GENERATOR_PENDING = 'Generador aún no implementado';

const timedOutResult = (result) => ({
  ok: false,
  errors: [{ line: null, message: `El analizador excedió el tiempo límite de ${config.timeoutMs / 1000} s y fue detenido.` }],
  raw: [result.stdout, result.stderr].filter(Boolean).join('\n'),
});

/** Análisis léxico/sintáctico con el ejecutable real de BMLang. */
export async function checkSyntax(code, binPath) {
  const result = await runBmlang(code, { binPath });
  if (result.timedOut) return timedOutResult(result);
  return parseCompilerOutput(result);
}

// ---------------------------------------------------------------------------
// El TAC lo produce bmlang; el traductor independiente lo recibe por stdin y
// devuelve NASM por stdout.
// ---------------------------------------------------------------------------

const UNSUPPORTED = /opci[oó]n no soportada|unsupported option|unrecognized option|unknown option|invalid option/i;
const VALID_BANNER = /^\s*Programa v.lido\s*$/i;

const pendingResult = (raw = '') => ({ ok: false, pending: true, errors: [{ line: null, message: GENERATOR_PENDING }], raw });

const compilerDirectory = path.dirname(fileURLToPath(import.meta.url));
const tacTranslator = path.resolve(compilerDirectory, '../../../tdc_nasm/tdc_nasm');

/** Ejecuta `bmlang <flag> archivo.bml` y devuelve { ok, output } o los errores. */
async function generate(flag, code, binPath) {
  // Primero la sintaxis: los errores llegan con línea aunque el generador no exista.
  const check = await checkSyntax(code, binPath);
  if (!check.ok) return check;

  const result = await runBmlang(code, { binPath, flag });
  if (result.timedOut) return timedOutResult(result);
  const raw = [result.stdout, result.stderr].map((s) => s.trim()).filter(Boolean).join('\n');

  if (result.exitCode !== 0) {
    if (UNSUPPORTED.test(raw)) return pendingResult(raw);
    return parseCompilerOutput(result);
  }
  // Un binario que ignora la opción solo imprime "Programa válido": no hay código generado.
  const output = result.stdout.split(/\r?\n/).filter((l) => !VALID_BANNER.test(l)).join('\n').trim();
  if (!output) return pendingResult(raw);
  return { ok: true, errors: [], output, raw };
}

/** Código intermedio (código de tres direcciones). */
export function generateTac({ code }, binPath) {
  return generate('--tac', code, binPath);
}

/** Traducción a NASM. */
export async function generateAsm({ code }, binPath) {
  const tac = await generateTac({ code }, binPath);
  if (!tac.ok) return tac;

  return withTempDir(async (dir) => {
    let command;
    try {
      command = await resolveCommand(tacTranslator);
    } catch (err) {
      if (!(err instanceof CompilerUnavailableError)) throw err;
      const message = /permiso de ejecución/.test(err.message)
        ? `El traductor "${tacTranslator}" no tiene permiso de ejecución. Ejecuta chmod +x "${tacTranslator}".`
        : `No se encontró el traductor TAC → NASM en "${tacTranslator}". Compílalo desde tdc_nasm/tdc_nasm.l y tdc_nasm/tdc_nasm.y.`;
      throw new CompilerUnavailableError(message);
    }

    let result;
    try {
      result = await runProcess({
        ...command,
        input: tac.output,
        cwd: dir,
      });
    } catch (err) {
      let message;
      if (err.code === 'ENOENT') {
        message = command.mode === 'wsl'
          ? 'No se encontró wsl.exe para ejecutar el traductor TAC → NASM.'
          : `No se encontró el traductor TAC → NASM en "${tacTranslator}".`;
      } else if (err.code === 'EACCES') {
        message = `El traductor "${tacTranslator}" no tiene permiso de ejecución. Ejecuta chmod +x "${tacTranslator}".`;
      } else {
        message = `No se pudo ejecutar el traductor TAC → NASM (${err.code || err.message}).`;
      }
      throw new CompilerUnavailableError(message);
    }

    const raw = [result.stdout, result.stderr].map((text) => text.trim()).filter(Boolean).join('\n');
    if (result.timedOut) {
      return {
        ok: false,
        errors: [{ line: null, message: `El traductor TAC → NASM excedió el tiempo límite de ${config.timeoutMs / 1000} s y fue detenido.` }],
        raw,
      };
    }

    if (result.exitCode !== 0) {
      const status = result.signal ? `la señal ${result.signal}` : `código ${result.exitCode}`;
      return {
        ok: false,
        errors: [{ line: null, message: result.stderr.trim() || result.stdout.trim() || `El traductor TAC → NASM terminó con ${status}.` }],
        raw,
      };
    }

    if (!result.stdout.trim()) {
      return {
        ok: false,
        errors: [{ line: null, message: result.stderr.trim() || 'El traductor TAC → NASM no produjo código ensamblador.' }],
        raw,
      };
    }

    return { ok: true, output: result.stdout, errors: [] };
  });
}

/** NASM -> nasm -f elf32 -> ld -m elf_i386. Devuelve el ejecutable en base64. */
export async function buildExecutable({ code }, binPath) {
  const asm = await generateAsm({ code }, binPath);
  if (!asm.ok) return asm;
  return withTempDir(async (dir) => {
    const linked = await assembleAndLink(asm.output, dir);
    if (!linked.ok) return { ...linked, asm: asm.output };
    const binary = await fs.readFile(linked.exe);
    return {
      ok: true,
      errors: [],
      output: linked.log || `Ejecutable generado (${binary.length} bytes).`,
      asm: asm.output,
      fileName: 'programa',
      executable: binary.toString('base64'),
    };
  });
}

/** Genera, ensambla, enlaza y ejecuta el programa alimentando `stdin` (timeout de 5 s). */
export async function runProgram({ code, stdin = '' }, binPath) {
  const asm = await generateAsm({ code }, binPath);
  if (!asm.ok) return asm;
  return withTempDir(async (dir) => {
    const linked = await assembleAndLink(asm.output, dir);
    if (!linked.ok) return linked;
    return runExecutable(linked.exe, stdin);
  });
}
