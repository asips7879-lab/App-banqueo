// Capturas de pantalla para revisar a ojo (no comparan píxeles).
//
//   npm run capturas   → guarda las imágenes en tests/capturas/ (la carpeta no se sube al repositorio)
'use strict';

const path = require('path');
const { test, HOY, dia, CLAVE, entradaBanco, entradaExterna } = require('./ayudantes');

const DIR = path.join(__dirname, 'capturas');
const VISTAS = ['inicio', 'banquear', 'repaso', 'tienda', 'progreso', 'ajustes'];

// Un progreso "de uso real" para que las vistas no salgan vacías.
const ESTADO = {
  xp: 820,
  coins: 340,
  lastAct: HOY,
  streak: 4,
  lastDay: HOY,
  bestRun: 9,
  run: 3,
  total: 64,
  ok: 47,
  hardOk: 6,
  owned: ['lentes'],
  equip: ['lentes'],
  logros: ['l1', 'l5'],
  daily: { date: HOY, n: 12, ok: 9, run: 5, courses: ['Pediatría', 'Cardiología'], rev: 1, claimed: ['m1'] },
  srs: {
    f03: { box: 0, due: HOY, danger: true },
    f06: { box: 1, due: HOY, danger: false },
    f09: { box: 2, due: dia(4), danger: false },
  },
  course: { Pediatría: { n: 30, ok: 25 }, Cardiología: { n: 20, ok: 12 }, 'Salud Pública': { n: 14, ok: 6 } },
  canjes: [{ nombre: 'Un episodio de mi serie', costo: 150, fecha: dia(-2) }],
};

const foto = (page, nombre) => page.screenshot({ path: path.join(DIR, `${nombre}.png`), fullPage: true });

for (const [ancho, alto] of [
  [390, 844],
  [1280, 900],
]) {
  test(`vistas a ${ancho} px`, async ({ app, page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await app.abrir({ estado: ESTADO });
    await page.evaluate(() => document.fonts.ready);
    for (const v of VISTAS) {
      await app.ir(v);
      await foto(page, `${ancho}-${v}`);
    }
    await app.empezar({ curso: 'Cardiología', dificultad: 'Fácil' }); // f07: con perla y fuente
    await foto(page, `${ancho}-pregunta`);
    await app.responder({ seguro: true });
    await foto(page, `${ancho}-explicacion`);
  });
}

test('modo oscuro', async ({ app, page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 390, height: 844 });
  await app.abrir({ estado: ESTADO });
  await page.evaluate(() => document.fonts.ready);
  await foto(page, 'oscuro-inicio');
  await app.empezar({ curso: 'Cardiología', dificultad: 'Fácil' });
  await app.responder({ acertar: false, seguro: true });
  await foto(page, 'oscuro-explicacion');
});

test('las cinco etapas y los tres ánimos de la mascota', async ({ app, page }) => {
  const dibujos = [];
  const casos = [
    [0, HOY, 'Nivel 1 · Célula madre'],
    [225, HOY, 'Nivel 3 · Reticulocito'],
    [750, HOY, 'Nivel 6 · Interno'],
    [1800, HOY, 'Nivel 10 · Residente'],
    [3675, HOY, 'Nivel 15 · Especialista'],
    [225, dia(-1), 'Ánimo normal (ayer)'],
    [225, dia(-3), 'Ánimo triste (hace 3 días)'],
  ];
  await app.abrir({ estado: { xp: 0, lastAct: HOY } });
  for (const [xp, lastAct, titulo] of casos) {
    // Cambia el progreso guardado y recarga Inicio (en http el sembrado inicial no se repite).
    await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [CLAVE, { xp, lastAct }]);
    await page.reload();
    dibujos.push([titulo, await page.locator('.hero svg').evaluate((s) => s.outerHTML)]);
  }
  await page.setViewportSize({ width: 1100, height: 600 });
  await page.setContent(`<body style="margin:0;font:600 15px system-ui;background:#f3f7f7;color:#10232a">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:20px">
    ${dibujos
      .map(
        ([
          t,
          svg,
        ]) => `<figure style="margin:0;background:#fff;border-radius:16px;padding:12px;text-align:center">
      <div style="width:200px;margin:auto">${svg}</div><figcaption>${t}</figcaption></figure>`,
      )
      .join('')}
    </div></body>`);
  await foto(page, 'mascota-etapas');
});

for (const [ancho, alto] of [
  [390, 844],
  [1280, 900],
]) {
  test(`cuaderno de errores a ${ancho} px`, async ({ app, page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await app.abrir({
      estado: {
        ...ESTADO,
        cuaderno: [
          entradaBanco('f01', {
            nota: 'La clave es la secuencia: primero fiebre, luego el exantema.',
            miRespuesta: 'C',
            acerto: false,
          }),
          entradaExterna(),
        ],
      },
    });
    await page.evaluate(() => document.fonts.ready);
    // Resultados: agregar al cuaderno y editar la premisa extra
    await app.empezar({ curso: 'Cardiología', dificultad: 'Fácil' });
    await app.responder({ acertar: false });
    await app.siguiente();
    await page.locator('.cu-panel button').click();
    await page.locator('.rev-item details').evaluate((d) => (d.open = true));
    await foto(page, `${ancho}-cuaderno-agregar`);
    await page.getByRole('button', { name: 'Sí, editarla' }).click();
    await page
      .locator('.cu-panel textarea')
      .fill('Explicación de f07.\nMi premisa: revisar siempre la opción B.');
    await foto(page, `${ancho}-cuaderno-premisa`);
    await page.getByRole('button', { name: 'Guardar en mi cuaderno' }).click();
    // Ajustes y la vista del cuaderno
    await app.ir('ajustes');
    await foto(page, `${ancho}-ajustes-cuaderno`);
    await page.getByRole('link', { name: 'Abrir mi cuaderno' }).click();
    await page.locator('.entrada').nth(2).locator('summary').click();
    await foto(page, `${ancho}-cuaderno`);
  });
}
