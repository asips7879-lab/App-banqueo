// Repaso espaciado.
'use strict';

const { test, expect, HOY, dia, neutro } = require('./ayudantes');

test('fallar en práctica manda la pregunta al repaso de hoy; con Seguro, como peligrosa', async ({
  app,
  page,
}) => {
  await app.abrir({ estado: neutro() });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
  await app.responder({ acertar: false, seguro: true });
  expect((await app.estado()).srs.f03).toEqual({ box: 0, due: HOY, danger: true });
  await app.ir('repaso');
  await expect(page.locator('#view .stat')).toHaveText(['1', '1', '1']); // para hoy, peligrosos, en seguimiento
  await expect(page.locator('#view .mission')).toContainText('Peligroso');
});

test('los errores peligrosos van primero', async ({ app, page }) => {
  await app.abrir({
    vista: 'repaso',
    estado: neutro({
      srs: { f01: { box: 0, due: HOY, danger: false }, f05: { box: 0, due: HOY, danger: true } },
    }),
  });
  await expect(page.locator('#view .mission').first()).toContainText('[f05]');
  await page.locator('#rgo').click();
  await expect(page.getByText('Repaso · 1/2')).toBeVisible();
  await expect(page.locator('.q')).toContainText('[f05]');
  await expect(page.locator('.tag.D', { hasText: 'Error peligroso' })).toBeVisible();
});

test('solo aparecen las que vencen hoy o antes', async ({ app, page }) => {
  await app.abrir({
    vista: 'repaso',
    estado: neutro({
      srs: { f01: { box: 1, due: dia(1), danger: false }, f02: { box: 0, due: dia(-2), danger: false } },
    }),
  });
  await expect(page.locator('#view .stat')).toHaveText(['1', '0', '2']);
  await expect(page.locator('#view .mission')).toHaveCount(1);
  await expect(page.locator('#view .mission')).toContainText('[f02]');
});

test('sin pendientes, el botón de repasar queda desactivado', async ({ app, page }) => {
  await app.abrir({
    vista: 'repaso',
    estado: neutro({ srs: { f01: { box: 1, due: dia(1), danger: false } } }),
  });
  await expect(page.locator('#rgo')).toBeDisabled();
  await expect(page.locator('#rgo')).toHaveText('Nada pendiente por hoy');
});

// Tras cada acierto en el repaso, la pregunta vuelve a los 1, 3, 7 y 15 días (REPASO_DIAS);
// al 5.º acierto seguido sale del repaso. (Corregido en la fase 3: antes eran 3, 7 y 15.)
for (const [caja, vuelve] of [
  [0, dia(1)],
  [1, dia(3)],
  [2, dia(7)],
  [3, dia(15)],
  [4, null],
]) {
  test(`repaso: acertar con caja ${caja} → ${vuelve ? `vuelve el ${vuelve}` : 'sale del repaso'}`, async ({
    app,
    page,
  }) => {
    await app.abrir({
      vista: 'repaso',
      estado: neutro({ srs: { f01: { box: caja, due: HOY, danger: true } } }),
    });
    await page.locator('#rgo').click();
    await expect(page.getByText('Repaso · 1/1')).toBeVisible();
    await app.responder();
    const s = await app.estado();
    if (vuelve) expect(s.srs.f01).toEqual({ box: caja + 1, due: vuelve, danger: false });
    else expect(s.srs.f01).toBeUndefined();
    expect(s.daily.rev).toBe(1); // cuenta para la misión "Repasa 3 preguntas"
  });
}

test('repaso: fallar devuelve la pregunta a la caja 0 para mañana y conserva el peligro', async ({
  app,
  page,
}) => {
  await app.abrir({ vista: 'repaso', estado: neutro({ srs: { f01: { box: 2, due: HOY, danger: true } } }) });
  await page.locator('#rgo').click();
  await app.responder({ acertar: false });
  expect((await app.estado()).srs.f01).toEqual({ box: 0, due: dia(1), danger: true });
});

test('repaso: fallar marcando Seguro la vuelve peligrosa', async ({ app, page }) => {
  await app.abrir({ vista: 'repaso', estado: neutro({ srs: { f01: { box: 1, due: HOY, danger: false } } }) });
  await page.locator('#rgo').click();
  await app.responder({ acertar: false, seguro: true });
  expect((await app.estado()).srs.f01).toEqual({ box: 0, due: dia(1), danger: true });
});

test('acertar en práctica una pregunta que está en repaso no cambia su repaso', async ({ app }) => {
  const enRepaso = { box: 1, due: dia(5), danger: false };
  await app.abrir({ estado: neutro({ srs: { f03: enRepaso } }) });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
  await app.responder();
  expect((await app.estado()).srs.f03).toEqual(enRepaso);
});

test('fallar en práctica una pregunta peligrosa no borra la marca (corregido en la fase 3)', async ({
  app,
}) => {
  await app.abrir({ estado: neutro({ srs: { f03: { box: 2, due: dia(5), danger: true } } }) });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
  await app.responder({ acertar: false });
  expect((await app.estado()).srs.f03.danger).toBe(true);
});

test('la vista explica los intervalos reales del repaso', async ({ app, page }) => {
  await app.abrir({ vista: 'repaso' });
  await expect(page.locator('#view p').first()).toHaveText(
    'Las preguntas que fallas vuelven hoy. Cada vez que las aciertas aquí, vuelven a los 1, 3, 7 y 15 días. Al acertarlas 5 veces seguidas, salen del repaso.',
  );
});

test('fallar en práctica una pregunta del repaso la devuelve a hoy desde cero', async ({ app }) => {
  await app.abrir({ estado: neutro({ srs: { f03: { box: 3, due: dia(9), danger: false } } }) });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
  await app.responder({ acertar: false });
  expect((await app.estado()).srs.f03).toEqual({ box: 0, due: HOY, danger: false });
});

test('empezar el repaso con un banqueo a medias pide confirmación', async ({ app, page }) => {
  await app.abrir({ estado: neutro({ srs: { f01: { box: 0, due: HOY, danger: false } } }) });
  await app.empezar({ cantidad: 10 });
  await app.responder();
  await app.siguiente();
  await app.ir('repaso');
  await page.locator('#rgo').click();
  await expect(page.locator('#r-aviso')).toContainText('Tienes un banqueo a medias (1 de 10 respondidas)');
  await page.getByRole('link', { name: 'Volver a mi banqueo' }).click();
  await expect(page.getByText('Práctica · 2/10')).toBeVisible();

  await app.ir('repaso');
  await page.locator('#rgo').click();
  await page.getByRole('button', { name: 'Cerrarlo y empezar' }).click();
  await expect(page.getByText('Repaso · 1/1')).toBeVisible();
});

test('sin un banqueo a medias, el repaso empieza directo', async ({ app, page }) => {
  await app.abrir({ vista: 'repaso', estado: neutro({ srs: { f01: { box: 0, due: HOY, danger: false } } }) });
  await page.locator('#rgo').click();
  await expect(page.getByText('Repaso · 1/1')).toBeVisible();
  await expect(page.locator('.aviso')).toHaveCount(0);
});
