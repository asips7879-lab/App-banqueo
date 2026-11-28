// Vistas, navegación, encabezado, mascota y diseño responsive.
'use strict';

const { test, expect, HOY, dia } = require('./ayudantes');

const VISTAS = [
  ['inicio', 'Hemi'],
  ['banquear', 'Arma tu banqueo'],
  ['repaso', 'Repaso espaciado'],
  ['tienda', 'Tienda'],
  ['progreso', 'Progreso'],
  ['ajustes', 'Ajustes'],
];

test('las seis vistas cargan desde la navegación', async ({ app, page }) => {
  await app.abrir();
  for (const [vista, titulo] of VISTAS) {
    await app.ir(vista);
    await expect(page.locator('#view h1').first()).toHaveText(titulo);
    await expect(page).toHaveURL(new RegExp(`#${vista}$`));
  }
});

test('una dirección desconocida muestra Inicio', async ({ app, page }) => {
  await app.abrir({ vista: 'no-existe' });
  await expect(page.locator('.hero h1')).toHaveText('Hemi');
  await expect(page.locator('#nav a.on')).toHaveText('Inicio');
});

test('el encabezado muestra el nivel y las monedas', async ({ app, page }) => {
  await app.abrir({ estado: { xp: 225, coins: 42 } });
  await expect(page.locator('#h-lvl')).toHaveText('Nv 3');
  await expect(page.locator('#h-coins')).toHaveText('42');
});

for (const [caso, lastAct, mensaje] of [
  ['sin actividad', '', '¡Listo para seguir sumando! Cada pregunta me hace crecer.'],
  ['actividad hoy', HOY, '¡Listo para seguir sumando! Cada pregunta me hace crecer.'],
  ['última actividad ayer', dia(-1), 'Ayer no banqueamos… ¿empezamos con unas cuantas?'],
  ['última actividad hace 3 días', dia(-3), 'Te extrañé. Diez preguntas hoy y vuelvo a sonreír.'],
]) {
  test(`ánimo de la mascota: ${caso}`, async ({ app, page }) => {
    await app.abrir({ estado: { lastAct } });
    await expect(page.locator('.hero p').first()).toHaveText(mensaje);
    // La lágrima solo aparece cuando está triste.
    await expect(page.locator('.hero svg path[d^="M126 106"]')).toHaveCount(caso.includes('3 días') ? 1 : 0);
  });
}

for (const [xp, nivel, etapa] of [
  [0, 1, 'Célula madre'],
  [224, 2, 'Célula madre'],
  [225, 3, 'Reticulocito'],
  [750, 6, 'Interno'],
  [1800, 10, 'Residente'],
  [3675, 15, 'Especialista'],
]) {
  test(`${xp} XP → nivel ${nivel}, etapa ${etapa}`, async ({ app, page }) => {
    await app.abrir({ estado: { xp } });
    await expect(page.locator('.hero .small').first()).toHaveText(`${etapa} · Nivel ${nivel}`);
  });
}

test('en móvil la navegación va abajo y ninguna vista se desborda a lo ancho', async ({ app, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await app.abrir();
  for (const [vista] of VISTAS) {
    await app.ir(vista);
    const caja = await page.locator('#nav').boundingBox();
    expect(caja.y + caja.height).toBeGreaterThan(800);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});

test('en escritorio la navegación va arriba', async ({ app, page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await app.abrir();
  const caja = await page.locator('#nav').boundingBox();
  expect(caja.y).toBeLessThan(10);
});

for (const ancho of [1000, 1023]) {
  test(`a ${ancho} px (tablet) la navegación va abajo, con íconos`, async ({ app, page }) => {
    await page.setViewportSize({ width: ancho, height: 800 });
    await app.abrir();
    const caja = await page.locator('#nav').boundingBox();
    expect(caja.y).toBeGreaterThan(700);
    await expect(page.locator('#nav a svg').first()).toBeVisible();
  });
}

for (const ancho of [1024, 1100, 1280]) {
  test(`a ${ancho} px la navegación va arriba sin chocar con el nivel y las monedas`, async ({
    app,
    page,
  }) => {
    await page.setViewportSize({ width: ancho, height: 800 });
    await app.abrir({ estado: { xp: 3675, coins: 12345 } }); // píldoras anchas: "Nv 15" y 12345
    const espacio = await page.evaluate(() => {
      const pildoras = [...document.querySelectorAll('header .pill')].map(
        (e) => e.getBoundingClientRect().right,
      );
      return document.querySelector('#nav a').getBoundingClientRect().left - Math.max(...pildoras);
    });
    expect(espacio).toBeGreaterThanOrEqual(40);
    expect((await page.locator('#nav').boundingBox()).y).toBeLessThan(10);
  });
}

for (const lastAct of [HOY, dia(-1), dia(-3)]) {
  test(`reticulocito: los puntitos no tocan la boca (última actividad ${lastAct})`, async ({ app, page }) => {
    await app.abrir({ estado: { xp: 225, lastAct } });
    const choques = await page.locator('.hero svg').evaluate((svg) => {
      const caja = (e) => e.getBBox();
      const boca = caja(svg.querySelector('path[stroke="#3b0a14"]'));
      const margen = 2.5; // medio grosor del trazo de la boca
      const puntos = [...svg.querySelectorAll('circle[fill="#9f1239"]')];
      if (puntos.length !== 3) return -1; // deben verse los 3 puntitos
      return puntos
        .map(caja)
        .filter(
          (p) =>
            p.x < boca.x + boca.width + margen &&
            p.x + p.width > boca.x - margen &&
            p.y < boca.y + boca.height + margen &&
            p.y + p.height > boca.y - margen,
        ).length;
    });
    expect(choques).toBe(0);
  });
}
