// Pruebas de las fases de generación: contrato con bmlang (--tac/--asm),
// nasm + ld con un .asm escrito a mano y ejecución con stdin.
// Se omiten con aviso si falta bmlang, nasm o ld.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';
import {
  assembleAndLink,
  buildExecutable,
  checkSyntax,
  CompilerUnavailableError,
  generateAsm,
  generateTac,
  GENERATOR_PENDING,
  runExecutable,
  runProgram,
} from '../src/compiler/index.js';
import { withTempDir } from '../src/compiler/runner.js';

const fixturePath = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const holaAsm = await fs.readFile(fixturePath('hola_mundo.asm'), 'utf8');
const fakeGenerator = fixturePath('generador_falso.sh');
const program = 'MAIN {\n    DEC $a;\n    READ $a;\n    WRITE $a;\n}\n';

let bmlangSkip = false;
try {
  await checkSyntax(program);
} catch (err) {
  if (!(err instanceof CompilerUnavailableError)) throw err;
  bmlangSkip = `binario no disponible: ${err.message}`;
}

const missingTool = ['nasm', 'ld'].find((tool) => spawnSync(tool, ['--version']).error);
const toolchainSkip = process.platform === 'win32'
  ? 'las pruebas de nasm/ld corren en Linux'
  : missingTool && `${missingTool} no está instalado`;

describe('bmlang real: TAC listo, NASM pendiente', { skip: bmlangSkip }, () => {
  test('--tac devuelve el código de tres direcciones', async () => {
    const r = await generateTac({ code: 'MAIN {\n    DEC $a;\n    $a => 2 + 3 * 4;\n    WRITE $a;\n}\n' });
    assert.equal(r.ok, true);
    assert.equal(r.output, 'main:\nvar $a;\nt1 = 3 * 4;\nt2 = 2 + t1;\n$a = t2;\npush $a;\ncall output;');
  });

  test('--tac traduce el menos unario como resta desde cero', async () => {
    const r = await generateTac({ code: 'MAIN {\n    DEC $a, $b;\n    $a => $b-(-2);\n}\n' });
    assert.equal(r.ok, true);
    assert.match(r.output, /t1 = 0 - 2;\nt2 = \$b - t1;\n\$a = t2;/);
  });

  for (const [name, phase] of [['--asm', generateAsm], ['build', buildExecutable], ['run', runProgram]]) {
    test(`${name}: "Generador aún no implementado"`, async () => {
      const r = await phase({ code: program, stdin: '1\n' });
      assert.equal(r.ok, false);
      assert.equal(r.pending, true);
      assert.deepEqual(r.errors, [{ line: null, message: GENERATOR_PENDING }]);
    });
  }

  test('los errores de sintaxis tienen prioridad y llevan línea', async () => {
    const r = await generateTac({ code: 'MAIN {\n    DEC $a\n}\n' });
    assert.equal(r.ok, false);
    assert.equal(r.pending, undefined);
    assert.equal(r.errors[0].line, 3);
  });
});

describe('nasm + ld con hola_mundo.asm', { skip: toolchainSkip }, () => {
  for (const [stdin, expected] of [['42\n', '42'], ['-7\n', '-7'], ['', '0']]) {
    test(`stdin ${JSON.stringify(stdin)} imprime ${expected}`, () => withTempDir(async (dir) => {
      const linked = await assembleAndLink(holaAsm, dir);
      assert.equal(linked.ok, true, JSON.stringify(linked.errors));
      const r = await runExecutable(linked.exe, stdin);
      assert.equal(r.ok, true, JSON.stringify(r.errors));
      assert.equal(r.output, `Hola mundo\nNumero: ${expected}\n`);
    }));
  }

  test('un error de nasm se reporta con línea', () => withTempDir(async (dir) => {
    const r = await assembleAndLink('section .text\nglobal _start\n_start:\n    mov rax, rbz\n', dir);
    assert.equal(r.ok, false);
    assert.equal(r.stage, 'nasm');
    assert.equal(r.errors[0].line, 4);
  }));

  test('un programa que no termina se detiene a los 5 s', () => withTempDir(async (dir) => {
    const linked = await assembleAndLink('section .text\nglobal _start\n_start:\n    jmp _start\n', dir);
    assert.equal(linked.ok, true);
    const r = await runExecutable(linked.exe);
    assert.equal(r.ok, false);
    assert.match(r.errors[0].message, /tiempo límite/);
  }));
});

describe('flujo completo con un generador falso', { skip: toolchainSkip }, () => {
  test('--tac devuelve el código intermedio', async () => {
    const r = await generateTac({ code: program }, fakeGenerator);
    assert.equal(r.ok, true);
    assert.equal(r.output, 't1 = 10\n$a = t1\nwrite $a');
  });

  test('Generar ejecutable devuelve un ELF en base64', async () => {
    const r = await buildExecutable({ code: program }, fakeGenerator);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(Buffer.from(r.executable, 'base64').subarray(0, 4).toString('latin1'), '\x7fELF');
  });

  test('Ejecutar alimenta stdin al programa', async () => {
    const r = await runProgram({ code: program, stdin: '123\n' }, fakeGenerator);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, 'Hola mundo\nNumero: 123\n');
  });
});
