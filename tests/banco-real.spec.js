// El banco REAL (preguntas.js): formato correcto y cada pregunta se puede responder en la app.
// Estas pruebas crecen solas a medida que se agregan preguntas.
'use strict';

const path = require('path');
const { test, expect, neutro } = require('./ayudantes');
const { cargarBanco, validar } = require('../scripts/validar');

const REALES = cargarBanco(path.join(__dirname, '..', 'preguntas.js'));

test('preguntas.js no tiene errores de formato', () => {
  const { errores } = validar(REALES);
  expect(errores, 'Corre "npm run validar" para ver el detalle').toEqual([]);
});

test('cada pregunta del banco real se muestra y se puede responder', async ({ app, page }) => {
  test.setTimeout(30_000 + REALES.length * 1_000);
  await app.abrir({ banco: null, estado: neutro() });
  await app.empezar({ cantidad: 'todas' });
  for (let i = 0; i < REALES.length; i++) {
    await expect(page.getByText(`Práctica · ${i + 1}/${REALES.length}`)).toBeVisible();
    const q = await app.preguntaActual();
    expect(q, 'la pregunta en pantalla debe estar en preguntas.js').toBeTruthy();
    await expect(page.locator('.opt')).toHaveCount(Object.keys(q.opciones).length);
    await expect(page.locator('#view .tag').first()).toHaveText(q.curso);
    await app.responder();
    await expect(page.locator('#fb h3'), `pregunta ${q.id}`).toHaveText('¡Correcto!');
    await app.siguiente();
  }
  await expect(page.locator('#view h1')).toHaveText(`${REALES.length}/${REALES.length} correctas · 100%`);
});
