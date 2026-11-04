/**
 * Adaptador entre la salida cruda del ejecutable `bmlang` y la API del IDE.
 *
 * Formato actual del binario (ver yyerror en bmlang.y):
 *   - Válido:  stdout "Programa válido", exit 0
 *   - Error:   stderr "Error: syntax error en la linea N cerca de TOKEN", exit 1
 *
 * También acepta el formato anterior sin número de línea y variantes localizadas.
 *
 * @param {{ stdout?: string, stderr?: string, exitCode?: number|null }} result
 * @returns {{ ok: boolean, errors: { line: number|null, message: string }[], raw: string }}
 */
const ERROR_LINE = /^\s*error\b(?:\s+(?:en\s+(?:la\s+)?)?(?:l[ií]nea|line)\s+(\d+))?\s*[:,-]?\s*(.*)$/i;
const LINE_IN_TEXT = /\b(?:l[ií]nea|line)\s+(\d+)/i;

/** Mensaje en español; al final del archivo yytext está vacío y queda "cerca de" sin token. */
const humanize = (message) =>
  message
    .replace(/^syntax error\b/i, 'error de sintaxis')
    .replace(/\bcerca de\s*$/i, 'cerca del fin del archivo');

export function parseCompilerOutput({ stdout = '', stderr = '', exitCode = 0 } = {}) {
  const raw = [stdout, stderr].map((s) => s.trim()).filter(Boolean).join('\n');
  const errors = [];

  for (const text of `${stderr}\n${stdout}`.split(/\r?\n/)) {
    const match = ERROR_LINE.exec(text);
    if (!match) continue;
    const message = humanize(match[2].trim()) || 'Error de sintaxis';
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
