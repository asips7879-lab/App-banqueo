// Ajustes: nombre de la mascota, copia de seguridad, preguntas propias y reinicio.
'use strict';

const { test, expect } = require('./ayudantes');

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
  expect(JSON.parse(await page.locator('#bk').inputValue())).toMatchObject({
    xp: 300,
    coins: 77,
    name: 'Hemi',
  });
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
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await page.locator('#bk').inputValue(),
  );
});

test('borrar todo el progreso pide confirmación y conserva el cuaderno de errores', async ({ app, page }) => {
  const entrada = {
    id: 'c1',
    origen: 'externa',
    nota: 'Mi nota',
    fecha: '2026-11-20',
    archivada: false,
    pregunta: {
      curso: 'X',
      tema: '',
      dificultad: 'Media',
      enunciado: 'e',
      opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
      correcta: 'A',
      perla: '',
      fuente: '',
    },
  };
  await app.abrir({ vista: 'ajustes', estado: { xp: 900, coins: 500, cuaderno: [entrada] } });
  await page.locator('#rst').click();
  await expect(page.locator('#rstc')).toContainText('Tu cuaderno de errores se conserva. ¿Seguro?');
  expect((await app.estado()).coins).toBe(500);
  await page.locator('#rsy').click();
  await expect(app.toasts()).toContainText('Progreso reiniciado');
  await expect(page).toHaveURL(/#inicio$/);
  expect(await app.estado()).toMatchObject({ xp: 0, coins: 0, cuaderno: [entrada] });
});

test('ya no existe "Agregar pregunta propia": los estudiantes no agregan preguntas al banco', async ({
  app,
  page,
}) => {
  await app.abrir({ vista: 'ajustes' });
  await expect(page.locator('#view')).not.toContainText('Agregar pregunta propia');
  await expect(page.locator('#view')).not.toContainText('Copiar para enviar a Claude');
  await expect(page.locator('#cu-card h2')).toHaveText('Cuaderno de errores');
});
