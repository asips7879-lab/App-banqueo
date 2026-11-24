// Repaso espaciado.
'use strict';

const { test, expect, HOY, dia, neutro } = require('./ayudantes');

test('fallar en práctica manda la pregunta al repaso de hoy; con Seguro, como peligrosa', async ({ app, page }) => {
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
    estado: neutro({ srs: { f01: { box: 0, due: HOY, danger: false }, f05: { box: 0, due: HOY, danger: true } } }),
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
    estado: neutro({ srs: { f01: { box: 1, due: dia(1), danger: false }, f02: { box: 0, due: dia(-2), danger: false } } }),
  });
  await expect(page.locator('#view .stat')).toHaveText(['1', '0', '2']);
  await expect(page.locator('#view .mission')).toHaveCount(1);
  await expect(page.locator('#view .mission')).toContainText('[f02]');
});

test('sin pendientes, el botón de repasar queda desactivado', async ({ app, page }) => {
  await app.abrir({ vista: 'repaso', estado: neutro({ srs: { f01: { box: 1, due: dia(1), danger: false } } }) });
  await expect(page.locator('#rgo')).toBeDisabled();
  await expect(page.locator('#rgo')).toHaveText('Nada pendiente por hoy');
});

// Comportamiento ACTUAL: al acertar en repaso la caja sube y después se usa [1, 3, 7, 15][caja],
// así que los intervalos reales son 3, 7 y 15 días, y la pregunta sale al 4.º acierto.
// La vista dice "1, 3, 7 y 15 días": ERROR CONOCIDO (SPEC §5), se decide y corrige en la fase 3.
for (const [caja, vuelve] of [[0, dia(3)], [1, dia(7)], [2, dia(15)], [3, null]]) {
  test(`repaso: acertar con caja ${caja} → ${vuelve ? `vuelve el ${vuelve}` : 'sale del repaso'}`, async ({ app, page }) => {
    await app.abrir({ vista: 'repaso', estado: neutro({ srs: { f01: { box: caja, due: HOY, danger: true } } }) });
    await page.locator('#rgo').click();
    await expect(page.getByText('Repaso · 1/1')).toBeVisible();
    await app.responder();
    const s = await app.estado();
    if (vuelve) expect(s.srs.f01).toEqual({ box: caja + 1, due: vuelve, danger: false });
    else expect(s.srs.f01).toBeUndefined();
    expect(s.daily.rev).toBe(1); // cuenta para la misión "Repasa 3 preguntas"
  });
}

test('repaso: fallar devuelve la pregunta a la caja 0 para mañana y conserva el peligro', async ({ app, page }) => {
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

test.fail('ERROR CONOCIDO: fallar en práctica una pregunta peligrosa no debería borrar la marca', async ({ app }) => {
  // SPEC §5: el registro de repaso se sobrescribe y "danger" pasa a false si esta vez se marcó "Dudo".
  // Se corrige en la fase 3 (entonces se quita el ".fail").
  await app.abrir({ estado: neutro({ srs: { f03: { box: 2, due: dia(5), danger: true } } }) });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
  await app.responder({ acertar: false });
  expect((await app.estado()).srs.f03.danger).toBe(true);
});
