import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCompilerOutput } from '../src/compiler/parseCompilerOutput.js';
import { toWslPath } from '../src/compiler/runner.js';

test('programa válido: exit 0 y "Programa válido" en stdout', () => {
  assert.deepEqual(parseCompilerOutput({ stdout: 'Programa válido\n', stderr: '', exitCode: 0 }), {
    ok: true,
    errors: [],
    raw: 'Programa válido',
  });
});

test('formato actual del binario: "Error: syntax error" sin línea', () => {
  const r = parseCompilerOutput({ stdout: '', stderr: 'Error: syntax error\n', exitCode: 1 });
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, [{ line: null, message: 'syntax error' }]);
  assert.equal(r.raw, 'Error: syntax error');
});

test('formato propuesto: "Error línea N: texto"', () => {
  const r = parseCompilerOutput({ stderr: 'Error línea 3: syntax error, unexpected WRITE\n', exitCode: 1 });
  assert.deepEqual(r.errors, [{ line: 3, message: 'syntax error, unexpected WRITE' }]);
});

test('variantes de línea: "en la línea", "linea" sin tilde y "line"', () => {
  for (const text of ['Error en la línea 7: x', 'Error linea 7: x', 'ERROR line 7 - x', 'Error: x en la línea 7']) {
    assert.equal(parseCompilerOutput({ stderr: text, exitCode: 1 }).errors[0].line, 7, text);
  }
});

test('exit distinto de 0 sin mensaje reconocible igual es un error', () => {
  const r = parseCompilerOutput({ stdout: '', stderr: 'Segmentation fault', exitCode: 139 });
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, [{ line: null, message: 'Segmentation fault' }]);
});

test('toWslPath convierte rutas de Windows', () => {
  assert.equal(toWslPath('C:\\Users\\Ebal\\Mi Proyecto\\bmlang'), '/mnt/c/Users/Ebal/Mi Proyecto/bmlang');
  assert.equal(toWslPath('/home/u/bmlang'), '/home/u/bmlang');
});
