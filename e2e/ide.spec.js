// Recorre el IDE en Chromium con el bmlang real y guarda capturas en test-results/capturas/.
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../frontend/src/examples.js';

const capture = (page, name) => page.screenshot({ path: `test-results/capturas/${name}.png` });
const consoleBox = (page) => page.getByTestId('console');

async function openIde(page) {
  await page.goto('/');
  await expect(page.locator('.editor-host .monaco-editor')).toBeVisible();
  await expect(page.getByTestId('status')).toHaveText(/Listo/);
  await expect(page.getByText(/Analizador: bmlang/)).toBeVisible();
}

async function loadExample(page, name) {
  await page.getByRole('button', { name: /Cargar ejemplo/ }).click();
  await page.getByRole('menuitem', { name: new RegExp(name) }).click();
}

async function openBml(page, name, text) {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(text) });
}

test('encabezado con logo (o su placeholder) y estado listo', async ({ page }) => {
  await openIde(page);
  await expect(page.locator('.brand').locator('.logo, .logo-placeholder')).toBeVisible();
  await capture(page, '01-inicio');
});

test('los tres ejemplos cargan y validan con F5', async ({ page }) => {
  await openIde(page);
  for (const [i, ex] of EXAMPLES.entries()) {
    await loadExample(page, ex.name);
    await expect(page.getByTestId('file-name')).toHaveText(`${ex.id}.bml`);
    await page.keyboard.press('F5');
    await expect(consoleBox(page).locator('.log-ok')).toHaveCount(i + 1);
    await expect(consoleBox(page).locator('.log-ok').last()).toBeInViewport();
    await capture(page, `02-ejemplo-${ex.id}`);
  }
  await expect(consoleBox(page)).toContainText('✔ Sintaxis correcta');
});

test('un error marca la línea con marker y decoración', async ({ page }) => {
  await openIde(page);
  await openBml(page, 'falta_pyc.bml', 'MAIN {\n    DEC $a, $b;\n    $a => 10\n    WRITE $a;\n}\n');
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(consoleBox(page)).toContainText('✖ Línea 4: error de sintaxis en la linea 4 cerca de WRITE');
  await expect(page.locator('.editor-host .error-line')).toHaveCount(1);
  await expect(page.locator('.editor-host .squiggly-error')).toHaveCount(1);
  await expect(page.locator('.editor-host .error-glyph')).toHaveCount(1);
  // Los pasos siguientes quedan deshabilitados hasta validar bien.
  await expect(page.locator('[data-step=tac]')).toBeDisabled();
  await capture(page, '03-error-marcado');
});

test('abrir rechaza archivos que no son .bml', async ({ page }) => {
  await openIde(page);
  await openBml(page, 'notas.txt', 'hola');
  await expect(consoleBox(page)).toContainText('"notas.txt" no es un archivo .bml');
});

test('estado visible, pasos en orden, TAC real y NASM pendiente', async ({ page }) => {
  await openIde(page);
  for (const id of ['tac', 'asm', 'build', 'run']) await expect(page.locator(`[data-step=${id}]`)).toBeDisabled();

  // Respuesta lenta para ver el estado "Validando…" y los botones deshabilitados.
  await page.route('**/api/check', async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });
  await page.keyboard.press('F5');
  await expect(page.getByTestId('status')).toHaveText(/Validando/);
  await expect(page.getByRole('button', { name: 'Abrir' })).toBeDisabled();
  await expect(page.getByTestId('status')).toHaveText(/Listo/);

  await expect(page.locator('[data-step=tac]')).toBeEnabled();
  await expect(page.locator('[data-step=asm]')).toBeEnabled();
  await expect(page.locator('[data-step=build]')).toBeDisabled();
  await expect(page.locator('[data-step=build]')).toHaveAttribute('title', 'Primero genera el código NASM');

  // El TAC ya lo genera el bmlang real; el NASM sigue pendiente.
  await page.locator('[data-step=tac]').click();
  await expect(page.getByTestId('result-editor')).toContainText('call output;');
  await capture(page, '04-codigo-intermedio');
  await page.locator('[data-step=asm]').click();
  await expect(page.locator('.toast')).toHaveText('Generador aún no implementado');
  await expect(page.locator('.side-pane')).toContainText('Generador aún no implementado');
  await expect(page.locator('[data-step=build]')).toBeDisabled();
  await capture(page, '04-generador-pendiente');
});

test('indicador de cambios sin guardar y Ctrl+S', async ({ page }) => {
  await openIde(page);
  await page.locator('.editor-host .monaco-editor').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('\n');
  await expect(page.getByTestId('file-name')).toContainText('sin guardar');
  await expect(page).toHaveTitle(/^● /);
  // Sin File System Access disponible, Ctrl+S cae en la descarga.
  await page.evaluate(() => { delete window.showSaveFilePicker; });
  const download = page.waitForEvent('download');
  await page.keyboard.press('Control+s');
  expect((await download).suggestedFilename()).toBe('programa.bml');
  await expect(page.getByTestId('file-name')).not.toContainText('sin guardar');
});

test('modal "Acerca de" con integrantes y carnés', async ({ page }) => {
  await openIde(page);
  await page.getByRole('button', { name: 'Acerca de' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(modal.locator('tbody tr')).toHaveCount(2);
  await expect(modal).toContainText('Carné');
  await capture(page, '05-acerca-de');
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('con un generador simulado: TAC, NASM, ejecutable y ejecución con stdin', async ({ page }) => {
  // Respuestas como las que dará el backend cuando bmlang soporte --tac/--asm.
  const json = (body) => (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/api/tac', json({ ok: true, errors: [], output: 't1 = $base * $altura\nt2 = t1 / 2\n$area = t2' }));
  await page.route('**/api/asm', json({ ok: true, errors: [], output: 'section .text\nglobal _start\n_start:\n    mov rax, 60\n    syscall' }));
  await page.route('**/api/build', json({ ok: true, errors: [], output: 'Ejecutable generado (4 bytes).', fileName: 'programa', executable: btoa('\x7fELF') }));
  let sentStdin = null;
  await page.route('**/api/run', (route) => {
    sentStdin = route.request().postDataJSON().stdin;
    return json({ ok: true, errors: [], output: 'Hola mundo\nNumero: 42\n', exitCode: 0 })(route);
  });

  await openIde(page);
  await page.keyboard.press('F5');
  await expect(page.locator('[data-step=tac]')).toBeEnabled();
  await page.locator('[data-step=tac]').click();
  await expect(page.getByTestId('result-editor')).toContainText('t2 = t1 / 2');
  await page.locator('[data-step=asm]').click();
  await expect(page.getByTestId('result-editor')).toContainText('global _start');
  await expect(page.locator('[data-step=build]')).toBeEnabled();

  const download = page.waitForEvent('download');
  await page.locator('[data-step=build]').click();
  expect((await download).suggestedFilename()).toBe('programa');
  await expect(page.locator('[data-step=run]')).toBeEnabled();

  await page.getByRole('tab', { name: 'Entrada (stdin)' }).click();
  await page.locator('textarea.stdin').fill('42');
  await page.locator('[data-step=run]').click();
  await expect(consoleBox(page).getByText('Numero: 42')).toBeInViewport();
  expect(sentStdin).toBe('42');
  await capture(page, '06-generador-simulado');

  // Editar el código invalida los pasos hechos.
  await page.locator('.editor-host .monaco-editor').click();
  await page.keyboard.type(' ');
  await expect(page.locator('[data-step=run]')).toBeDisabled();
  await expect(page.locator('[data-step=tac]')).toBeDisabled();
});
