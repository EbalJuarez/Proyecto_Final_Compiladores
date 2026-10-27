import { config } from '../config.js';
import { parseCompilerOutput } from './parseCompilerOutput.js';
import { runBmlang } from './runner.js';

export { CompilerUnavailableError, resolveCommand } from './runner.js';
export { parseCompilerOutput } from './parseCompilerOutput.js';

/** Análisis léxico/sintáctico con el ejecutable real de BMLang. */
export async function checkSyntax(code) {
  const result = await runBmlang(code);
  if (result.timedOut) {
    return {
      ok: false,
      errors: [{ line: null, message: `El analizador excedió el tiempo límite de ${config.timeoutMs / 1000} s y fue detenido.` }],
      raw: [result.stdout, result.stderr].filter(Boolean).join('\n'),
    };
  }
  return parseCompilerOutput(result);
}

// ---------------------------------------------------------------------------
// Fases pendientes. Cada función recibe { code, stdin? } y debe devolver
// { ok, errors: [{ line?, message }], output? }. Para conectarlas, reemplaza el
// cuerpo usando runProcess/resolveCommand de ./runner.js con el binario que toque.
// ---------------------------------------------------------------------------

const notImplemented = () => ({ ok: false, errors: [{ message: 'Aún no implementado' }] });

/** Código intermedio (código de tres direcciones). */
export async function generateTac(/* { code } */) {
  return notImplemented();
}

/** Traducción a NASM. */
export async function generateAsm(/* { code } */) {
  return notImplemented();
}

/** Ensamblar y enlazar el ejecutable. */
export async function buildExecutable(/* { code } */) {
  return notImplemented();
}

/** Ejecutar el programa compilado alimentando `stdin`. */
export async function runProgram(/* { code, stdin } */) {
  return notImplemented();
}
