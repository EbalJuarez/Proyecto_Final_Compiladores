// Pruebas de las fases de generación con BMLang, el traductor TAC → NASM y la toolchain real.
// Se omiten con aviso si falta alguna herramienta requerida.
import assert from 'node:assert/strict';
import { constants } from 'node:fs';
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
  runExecutable,
  runProgram,
} from '../src/compiler/index.js';
import { withTempDir } from '../src/compiler/runner.js';
import { EXAMPLES } from '../../frontend/src/examples.js';

const fixturePath = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const holaAsm = await fs.readFile(fixturePath('hola_mundo.asm'), 'utf8');
const fakeGenerator = fixturePath('generador_falso.sh');
const translatorPath = fileURLToPath(new URL('../../tdc_nasm/tdc_nasm', import.meta.url));
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
let translatorSkip = false;
try {
  await fs.access(translatorPath, constants.X_OK);
} catch {
  translatorSkip = `traductor TAC → NASM no disponible o sin permiso de ejecución: ${translatorPath}`;
}

describe('bmlang real: generación de TAC', { skip: bmlangSkip }, () => {
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

  test('los errores de sintaxis tienen prioridad y llevan línea', async () => {
    const r = await generateTac({ code: 'MAIN {\n    DEC $a\n}\n' });
    assert.equal(r.ok, false);
    assert.equal(r.pending, undefined);
    assert.equal(r.errors[0].line, 3);
  });
});

describe('flujo real BMLang → TAC → NASM de 32 bits → ejecutable', {
  skip: bmlangSkip || toolchainSkip || translatorSkip,
}, () => {
  test('genera NASM elf32 con el traductor real', async () => {
    const r = await generateAsm({ code: program });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.errors, []);
    assert.match(r.output, /^BITS 32/m);
    assert.match(r.output, /^global _start$/m);
  });

  test('traduce aritmética y potenciación y muestra la salida', async () => {
    const code = `MAIN {
    DEC $a, $b;
    $a => 2 + 3 * 4;
    $b => 2 : 3;
    WRITE $a;
    WRITE $b;
}
`;
    const r = await runProgram({ code });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, '14\n8\n');
  });

  test('traduce IF/ELSE, READ y WRITE', async () => {
    const r = await runProgram({ code: EXAMPLES.find(({ id }) => id === 'if').code, stdin: '95\n0\n' });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, '3\n');
  });

  test('traduce ciclos FOR y WHILE con READ y WRITE', async () => {
    const r = await runProgram({ code: EXAMPLES.find(({ id }) => id === 'loops').code, stdin: '5\n' });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, '15\n120\n');
  });

  test('el ejemplo de E/S integra TAC, NASM, ensamblado y ejecución', async () => {
    const r = await runProgram({ code: EXAMPLES.find(({ id }) => id === 'io').code, stdin: '4\n3\n' });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, '6\n64\n');
  });

  test('los errores sintácticos se conservan al solicitar NASM', async () => {
    const r = await generateAsm({ code: 'MAIN {\n    DEC $a\n}\n' });
    assert.equal(r.ok, false);
    assert.equal(r.errors[0].line, 3);
    assert.match(r.errors[0].message, /error de sintaxis/);
  });

  test('los errores del traductor se devuelven en lugar de NASM', async () => {
    const r = await generateAsm({ code: 'MAIN {\n    DEC $a;\n    $a => 2147483649;\n    WRITE $a;\n}\n' });
    assert.equal(r.ok, false);
    assert.equal(r.pending, undefined);
    assert.ok(r.errors[0].message.length > 0);
    assert.notEqual(r.raw, '');
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

describe('flujo completo con un generador falso', { skip: toolchainSkip || translatorSkip }, () => {
  test('--tac devuelve el código intermedio', async () => {
    const r = await generateTac({ code: program }, fakeGenerator);
    assert.equal(r.ok, true);
    assert.equal(r.output, 'main:\nvar $a;\n$a = 10;\npush $a;\ncall output;');
  });

  test('Generar ejecutable devuelve un ELF en base64', async () => {
    const r = await buildExecutable({ code: program }, fakeGenerator);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(Buffer.from(r.executable, 'base64').subarray(0, 4).toString('latin1'), '\x7fELF');
  });

  test('Ejecutar alimenta stdin al programa', async () => {
    const r = await runProgram({ code: program, stdin: '123\n' }, fakeGenerator);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.equal(r.output, '10\n');
  });
});
