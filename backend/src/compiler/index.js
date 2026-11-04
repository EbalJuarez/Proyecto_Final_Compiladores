import fs from 'node:fs/promises';
import { config } from '../config.js';
import { parseCompilerOutput } from './parseCompilerOutput.js';
import { runBmlang, withTempDir } from './runner.js';
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
// Contrato con el generador de código (ver README):
//   bmlang --tac archivo.bml  -> TAC por stdout, exit 0
//   bmlang --asm archivo.bml  -> NASM por stdout, exit 0
//   errores por stderr con el mismo formato que la validación.
// Mientras la opción no exista, bmlang responde "opcion no soportada" y el IDE
// muestra "Generador aún no implementado" (pending: true, HTTP 501).
// ---------------------------------------------------------------------------

const UNSUPPORTED = /opci[oó]n no soportada|unsupported option|unrecognized option|unknown option|invalid option/i;
const VALID_BANNER = /^\s*Programa v.lido\s*$/i;

const pendingResult = (raw = '') => ({ ok: false, pending: true, errors: [{ line: null, message: GENERATOR_PENDING }], raw });

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
export function generateAsm({ code }, binPath) {
  return generate('--asm', code, binPath);
}

/** NASM -> nasm -f elf64 -> ld. Devuelve el ejecutable en base64 para descargarlo. */
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
