// Pruebas end-to-end con el ejecutable real (BMLANG_PATH o ../compilador/bmlang).
// Si el binario no puede iniciar en esta máquina, se omiten mostrando el motivo.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { describe, test } from 'node:test';
import { checkSyntax, CompilerUnavailableError } from '../src/compiler/index.js';

const fixture = (name) => fs.readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const validProgram = await fs.readFile(new URL('../../ejemplos/entrada_valida.bml', import.meta.url), 'utf8');

let skip = false;
// La primera llamada puede arrancar la VM de WSL y exceder el timeout; no cuenta como sonda.
await checkSyntax('').catch(() => {});
try {
  await checkSyntax(validProgram);
} catch (err) {
  if (!(err instanceof CompilerUnavailableError)) throw err;
  skip = `binario no disponible: ${err.message}`;
}

describe('bmlang real', { skip }, () => {
  test('entrada_valida.bml es aceptada', async () => {
    const r = await checkSyntax(validProgram);
    assert.equal(r.ok, true, r.raw);
    assert.deepEqual(r.errors, []);
    assert.match(r.raw, /Programa v.lido/);
  });

  // Cada caso inválido debe reportar línea y texto (lo exige el enunciado).
  const invalid = [
    ['falta ";"', () => fixture('falta_punto_y_coma.bml'), 4, /error de sintaxis .*cerca de WRITE/],
    ['falta "}"', () => fixture('falta_llave.bml'), 8, /cerca del fin del archivo/],
    ['token desconocido', async () => 'MAIN {\n    DEC $a;\n    $a => 1 @ 2;\n}\n', 3, /cerca de @/],
    ['IF sin cerrar ")"', async () => 'MAIN {\n    DEC $a;\n    IF ($a < 5 {\n        WRITE $a;\n    }\n}\n', 3, /cerca de \{/],
    ['comentario sin cerrar', async () => 'MAIN {\n    DEC $a;\n    #! sin cierre\n}\n', 3, /comentario sin cerrar/],
  ];
  for (const [name, source, line, message] of invalid) {
    test(`${name} produce error con línea y texto`, async () => {
      const r = await checkSyntax(await source());
      assert.equal(r.ok, false, r.raw);
      assert.equal(r.errors.length, 1);
      assert.equal(r.errors[0].line, line, r.raw);
      assert.match(r.errors[0].message, message);
    });
  }

  const body = (lines) => `MAIN {\n    DEC $a, $b, $x;\n${lines}\n}\n`;
  const valid = [
    ['potencia $x:2', body('    $x => $a : 2;\n    $x=>$x:2:3;')],
    ['DEC $a,$b; sin espacios', 'MAIN {\n    DEC $a,$b;\n}\n'],
    ['IF anidado con ELSE', body('    IF ($a > 0) {\n        IF ($b > 0) { WRITE $a; } ELSE { WRITE $b; }\n    } ELSE {\n        WRITE $b;\n    }')],
    ['&& y ||', body('    IF ($a > 0 && $b < 10 || $a == $b) { WRITE $a; }')],
    ['WHILE', body('    WHILE ($a <> 10) { $a => $a + 1; }')],
    ['FOR', body('    FOR ($a => 0; $a <= 10; $a => $a + 1) { WRITE $a; }')],
    ['comentarios #! !# antes y dentro de MAIN', '#! programa !#\nMAIN {\n    #! comentario !#\n    DEC $a;\n}\n'],
    ['READ / WRITE y aritmética', body('    READ $a;\n    $x => ($a + $b) * 2 - $a / 3;\n    WRITE $x;')],
  ];
  for (const [name, code] of valid) {
    test(`válido: ${name}`, async () => {
      const r = await checkSyntax(code);
      assert.equal(r.ok, true, r.raw);
    });
  }

  test('los tres ejemplos del IDE son válidos', async () => {
    const { EXAMPLES } = await import('../../frontend/src/examples.js');
    for (const ex of EXAMPLES) {
      const r = await checkSyntax(ex.code);
      assert.equal(r.ok, true, `${ex.name}: ${r.raw}`);
    }
  });
});
