// Ajustes: nombre de la mascota, copia de seguridad, preguntas propias y reinicio.
'use strict';

const { test, expect } = require('./ayudantes');

async function llenarPregunta(page, { clave = 'C', conE = false } = {}) {
  await page.fill('#qc', 'Neurología');
  await page.fill('#qt', 'Cefaleas');
  await page.fill('#qe', 'Enunciado propio de prueba');
  for (const l of conE ? 'ABCDE' : 'ABCD') await page.fill(`#q${l}`, `Opción ${l}`);
  await page.selectOption('#qk', clave);
  await page.fill('#qx', 'Explicación propia');
  await page.getByRole('button', { name: 'Guardar pregunta' }).click();
}

test('cambiar el nombre de la mascota', async ({ app, page }) => {
  await app.abrir({ vista: 'ajustes' });
  await expect(page.locator('#mn')).toHaveAttribute('maxlength', '20');
  await page.fill('#mn', 'Globulín');
  await page.locator('#fname button').click();
  await expect(app.toasts()).toContainText('Ahora se llama Globulín');
  await app.ir('inicio');
  await expect(page.locator('.hero h1')).toHaveText('Globulín');
});

test('un nombre vacío vuelve a "Hemi"', async ({ app, page }) => {
  await app.abrir({ vista: 'ajustes', estado: { name: 'Otro' } });
  await page.fill('#mn', '   ');
  await page.locator('#fname button').click();
  await expect(app.toasts()).toContainText('Ahora se llama Hemi');
  expect((await app.estado()).name).toBe('Hemi');
});

test('la copia de seguridad muestra el progreso y lo restaura', async ({ app, page }) => {
  await app.abrir({ vista: 'ajustes', estado: { xp: 300, coins: 77 } });
  expect(JSON.parse(await page.locator('#bk').inputValue())).toMatchObject({ xp: 300, coins: 77, name: 'Hemi' });
  await page.fill('#imp', JSON.stringify({ xp: 500, coins: 9, name: 'Rojito' }));
  await page.locator('#doimp').click();
  await expect(app.toasts()).toContainText('Progreso restaurado');
  await expect(page.locator('#h-coins')).toHaveText('9');
  const s = await app.estado();
  expect(s).toMatchObject({ xp: 500, coins: 9, name: 'Rojito', streak: 0 }); // lo que falta se completa
  expect(s.premios).toHaveLength(2);
});

for (const texto of ['hola', '{"coins": 5}', '[1, 2]', 'null']) {
  test(`restaurar un texto inválido avisa y no cambia nada: ${texto}`, async ({ app, page }) => {
    await app.abrir({ vista: 'ajustes', estado: { xp: 300, coins: 77 } });
    await page.fill('#imp', texto);
    await page.locator('#doimp').click();
    await expect(app.toasts()).toContainText('Ese texto no es una copia válida');
    expect((await app.estado()).coins).toBe(77);
  });
}

test('el botón Copiar copia la copia de seguridad', async ({ app, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await app.abrir({ vista: 'ajustes', estado: { coins: 12 } });
  await page.locator('#cp').click();
  await expect(app.toasts()).toContainText('Copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.locator('#bk').inputValue());
});

test('agregar una pregunta propia la suma al banco', async ({ app, page }) => {
  await app.abrir({ vista: 'ajustes' });
  await expect(page.locator('input[name=ex]:checked')).toHaveCount(3);
  await expect(page.locator('#qd')).toHaveValue('Media');
  await llenarPregunta(page);
  await expect(app.toasts()).toContainText('Pregunta guardada');

  const [propia] = (await app.estado()).custom;
  expect(propia.id).toMatch(/^u\d+$/);
  expect(propia).toMatchObject({
    examen: ['ENAM', 'RM', 'Preinternado'], curso: 'Neurología', tema: 'Cefaleas', dificultad: 'Media',
    enunciado: 'Enunciado propio de prueba', opciones: { A: 'Opción A', B: 'Opción B', C: 'Opción C', D: 'Opción D' },
    correcta: 'C', explicacion: 'Explicación propia', perla: '', fuente: 'Propia',
  });
  await expect(page.getByRole('button', { name: 'Copiar para enviar a Claude' })).toBeVisible();

  await app.ir('banquear');
  await expect(page.locator('#f-count')).toHaveText('13 preguntas coinciden');
  await page.selectOption('#f-cu', 'Neurología');
  await expect(page.locator('#f-count')).toHaveText('1 preguntas coinciden');
});

test('una pregunta propia cuya clave no tiene texto no se guarda', async ({ app, page }) => {
  await app.abrir({ vista: 'ajustes' });
  await llenarPregunta(page, { clave: 'E' });
  await expect(app.toasts()).toContainText('La clave elegida no tiene texto');
  expect((await app.estado())?.custom ?? []).toHaveLength(0);
});

test('borrar todo el progreso pide confirmación y conserva las preguntas propias', async ({ app, page }) => {
  const propia = {
    id: 'u1', examen: ['ENAM'], curso: 'X', dificultad: 'Media', enunciado: 'e',
    opciones: { A: 'a', B: 'b', C: 'c', D: 'd' }, correcta: 'A', explicacion: 'x',
  };
  await app.abrir({ vista: 'ajustes', estado: { xp: 900, coins: 500, custom: [propia] } });
  await page.locator('#rst').click();
  await expect(page.locator('#rstc')).toContainText('¿Seguro?');
  expect((await app.estado()).coins).toBe(500);
  await page.locator('#rsy').click();
  await expect(app.toasts()).toContainText('Progreso reiniciado');
  await expect(page).toHaveURL(/#inicio$/);
  expect(await app.estado()).toMatchObject({ xp: 0, coins: 0, custom: [propia] });
});
