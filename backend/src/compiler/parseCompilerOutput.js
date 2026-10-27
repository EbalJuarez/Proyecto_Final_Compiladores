/**
 * Adaptador entre la salida cruda del ejecutable `bmlang` y la API del IDE.
 *
 * Formato actual del binario (ver yyerror en bmlang.y):
 *   - Válido:  stdout "Programa válido", exit 0
 *   - Error:   stderr "Error: syntax error", exit 1   (sin número de línea)
 *
 * También acepta el formato propuesto "Error línea N: texto" (y variantes como
 * "Error en la línea N: ..." o "Error line N: ..."), de modo que si se agrega
 * yylineno al analizador, el IDE marcará la línea sin cambiar este código.
 *
 * @param {{ stdout?: string, stderr?: string, exitCode?: number|null }} result
 * @returns {{ ok: boolean, errors: { line: number|null, message: string }[], raw: string }}
 */
const ERROR_LINE = /^\s*error\b(?:\s+(?:en\s+(?:la\s+)?)?(?:l[ií]nea|line)\s+(\d+))?\s*[:,-]?\s*(.*)$/i;
const LINE_IN_TEXT = /\b(?:l[ií]nea|line)\s+(\d+)/i;

export function parseCompilerOutput({ stdout = '', stderr = '', exitCode = 0 } = {}) {
  const raw = [stdout, stderr].map((s) => s.trim()).filter(Boolean).join('\n');
  const errors = [];

  for (const text of `${stderr}\n${stdout}`.split(/\r?\n/)) {
    const match = ERROR_LINE.exec(text);
    if (!match) continue;
    const message = match[2].trim() || 'Error de sintaxis';
    let line = match[1] ? Number(match[1]) : null;
    if (line === null) {
      const inner = LINE_IN_TEXT.exec(message);
      if (inner) line = Number(inner[1]);
    }
    errors.push({ line, message });
  }

  if (exitCode !== 0 && errors.length === 0) {
    errors.push({ line: null, message: raw || `El analizador terminó con código ${exitCode}` });
  }

  return { ok: exitCode === 0 && errors.length === 0, errors, raw };
}
