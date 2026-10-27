// Pruebas end-to-end con el ejecutable real (BMLANG_PATH o ../compilador/bmlang).
// Si el binario no puede iniciar en esta máquina, se omiten mostrando el motivo.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { describe, test } from 'node:test';
import { checkSyntax, CompilerUnavailableError } from '../src/compiler/index.js';

const fixture = (name) => fs.readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const validProgram = await fs.readFile(new URL('../../compilador/entrada_valida.txt', import.meta.url), 'utf8');

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
  test('entrada_valida.txt es aceptada', async () => {
    const r = await checkSyntax(validProgram);
    assert.equal(r.ok, true, r.raw);
    assert.deepEqual(r.errors, []);
    assert.match(r.raw, /Programa v.lido/);
  });

  test('falta ";" produce error', async () => {
    const r = await checkSyntax(await fixture('falta_punto_y_coma.bml'));
    assert.equal(r.ok, false);
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0].message, /syntax error/);
  });

  test('falta "}" produce error', async () => {
    const r = await checkSyntax(await fixture('falta_llave.bml'));
    assert.equal(r.ok, false);
    assert.match(r.errors[0].message, /syntax error/);
  });

  test('los tres ejemplos del IDE son válidos', async () => {
    const { EXAMPLES } = await import('../../frontend/src/examples.js');
    for (const ex of EXAMPLES) {
      const r = await checkSyntax(ex.code);
      assert.equal(r.ok, true, `${ex.name}: ${r.raw}`);
    }
  });
});
