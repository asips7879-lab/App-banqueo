// Reglas del juego: monedas, XP, niveles, misiones, racha de días, logros y Progreso.
'use strict';

const { test, expect, HOY, LOGROS, REW, XPR, dia, neutro } = require('./ayudantes');

for (const dif of ['Fácil', 'Media', 'Difícil']) {
  test(`acierto ${dif}: +${REW[dif]} monedas y +${XPR[dif]} XP`, async ({ app, page }) => {
    await app.abrir({ estado: neutro() });
    await app.empezar({ dificultad: dif });
    await app.responder();
    const s = await app.estado();
    expect(s.coins).toBe(REW[dif]);
    expect(s.xp).toBe(XPR[dif]);
    await expect(page.locator('#h-coins')).toHaveText(String(REW[dif]));
  });

  test(`acierto ${dif} marcando Seguro: monedas ×1.5 redondeado, misma XP`, async ({ app }) => {
    await app.abrir({ estado: neutro() });
    await app.empezar({ dificultad: dif });
    await app.responder({ seguro: true });
    const s = await app.estado();
    expect(s.coins).toBe(Math.round(REW[dif] * 1.5)); // 5, 8 y 12
    expect(s.xp).toBe(XPR[dif]);
  });
}

test('un error da +3 XP y ninguna moneda', async ({ app }) => {
  await app.abrir({ estado: neutro() });
  await app.empezar();
  await app.responder({ acertar: false });
  const s = await app.estado();
  expect(s).toMatchObject({ coins: 0, xp: 3, total: 1, ok: 0 });
});

test('cada 5 aciertos seguidos: +10 monedas y aviso', async ({ app }) => {
  await app.abrir({ estado: neutro() });
  await app.empezar({ cantidad: 10 });
  const hechas = await app.responderVarias(5);
  await expect(app.toasts()).toContainText('5 aciertos seguidos · +10');
  const s = await app.estado();
  expect(s.coins).toBe(hechas.reduce((t, q) => t + REW[q.dificultad], 0) + 10);
  expect(s).toMatchObject({ run: 5, bestRun: 5 });
});

test('fallar reinicia los aciertos seguidos, pero no el récord', async ({ app }) => {
  await app.abrir({ estado: neutro({ run: 4, bestRun: 4 }) });
  await app.empezar();
  await app.responder({ acertar: false });
  expect(await app.estado()).toMatchObject({ run: 0, bestRun: 4 });
});

test('subir de nivel muestra un aviso', async ({ app, page }) => {
  await app.abrir({ estado: neutro({ xp: 95 }) });
  await app.empezar({ dificultad: 'Fácil' });
  await app.responder();
  await expect(app.toasts()).toContainText('¡Subiste a nivel 2!');
  await expect(page.locator('#h-lvl')).toHaveText('Nv 2');
});

test('al llegar a una etapa nueva, la mascota evoluciona', async ({ app }) => {
  await app.abrir({ estado: neutro({ xp: 220 }) });
  await app.empezar({ dificultad: 'Fácil' });
  await app.responder(); // 228 XP: nivel 3
  await expect(app.toasts()).toContainText('¡Subiste a nivel 3!');
  await expect(app.toasts()).toContainText('¡Hemi evolucionó a Reticulocito!');
});

test('misiones: cada una se reclama una vez y el cofre se abre al tenerlas todas', async ({ app, page }) => {
  await app.abrir({
    estado: neutro({
      daily: { date: HOY, n: 10, ok: 7, run: 5, courses: ['Pediatría', 'Cardiología'], rev: 3, claimed: [] },
    }),
  });
  await expect(page.locator('[data-claim="all"]')).toBeDisabled();
  for (const id of ['m1', 'm2', 'm3', 'm4', 'm5']) {
    await page.locator(`[data-claim="${id}"]`).click();
    await expect(page.locator(`[data-claim="${id}"]`)).toHaveText('Hecho');
    await expect(page.locator(`[data-claim="${id}"]`)).toBeDisabled();
  }
  await page.locator('[data-claim="all"]').click();
  await expect(page.locator('[data-claim="all"]')).toHaveText('Abierto');
  await expect(page.locator('[data-claim="all"]')).toBeDisabled();
  const s = await app.estado();
  expect(s.coins).toBe(30 + 40 + 30 + 20 + 30 + 60);
  expect(s.xp).toBe(6 * 10);
  expect(s.daily.claimed).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'all']);
});

test('una misión sin cumplir no se puede reclamar y muestra su avance', async ({ app, page }) => {
  await app.abrir({
    estado: neutro({
      daily: { date: HOY, n: 3, ok: 1, run: 1, courses: ['Pediatría'], rev: 0, claimed: [] },
    }),
  });
  const m1 = page.locator('.mission', { hasText: 'Responde 10 preguntas' });
  await expect(m1).toContainText('3/10 · +30 monedas');
  await expect(m1.locator('button')).toBeDisabled();
});

test('las misiones avanzan al banquear', async ({ app, page }) => {
  await app.abrir({ estado: neutro() });
  await app.empezar({ curso: 'Pediatría' });
  await app.responder();
  await app.siguiente();
  await page.locator('#quit').click();
  await app.empezar({ curso: 'Cardiología' });
  await app.responder();
  expect((await app.estado()).daily).toMatchObject({
    date: HOY,
    n: 2,
    ok: 2,
    run: 2,
    courses: ['Pediatría', 'Cardiología'],
  });
  await app.ir('inicio');
  await expect(page.locator('.mission', { hasText: 'Banquea 2 cursos distintos' })).toContainText('2/2');
});

test('al cambiar de día se reinician las misiones', async ({ app, page }) => {
  await app.abrir({
    estado: neutro({ daily: { date: dia(-1), n: 10, ok: 7, run: 5, courses: [], rev: 0, claimed: ['m1'] } }),
  });
  const m1 = page.locator('.mission', { hasText: 'Responde 10 preguntas' });
  await expect(m1).toContainText('0/10');
  await expect(m1.locator('button')).toHaveText('Reclamar');
});

test('la racha de aciertos de ayer no cuenta para la misión de hoy (corregido en la fase 3)', async ({
  app,
}) => {
  await app.abrir({
    estado: neutro({
      run: 4,
      bestRun: 4,
      daily: { date: dia(-1), n: 4, ok: 4, run: 4, courses: [], rev: 0, claimed: [] },
    }),
  });
  await app.empezar();
  await app.responder();
  expect((await app.estado()).daily.run).toBe(1);
});

test('racha de días: suma 1 al llegar a 10 respuestas si ayer también se cumplió', async ({ app }) => {
  await app.abrir({ estado: neutro({ streak: 3, lastDay: dia(-1) }) });
  await app.empezar({ cantidad: 10 });
  await app.responderVarias(9);
  expect((await app.estado()).streak).toBe(3);
  await app.responder();
  await expect(app.toasts()).toContainText('Racha: 4 días');
  expect(await app.estado()).toMatchObject({ streak: 4, lastDay: HOY });
});

test('racha de días: vuelve a 1 si se saltó un día', async ({ app }) => {
  await app.abrir({ estado: neutro({ streak: 5, lastDay: dia(-2) }) });
  await app.empezar({ cantidad: 10 });
  await app.responderVarias(10);
  await expect(app.toasts()).toContainText('Racha: 1 día');
  expect(await app.estado()).toMatchObject({ streak: 1, lastDay: HOY });
});

for (const [lastDay, mostrada] of [
  [HOY, '5'],
  [dia(-1), '5'],
  [dia(-2), '0'],
]) {
  test(`racha mostrada con el último día cumplido ${lastDay}: ${mostrada}`, async ({ app, page }) => {
    await app.abrir({ estado: { streak: 5, lastDay } });
    await expect(page.locator('.card', { hasText: 'Tu día' }).locator('.stat').nth(2)).toHaveText(mostrada);
  });
}

test('logro Primera pregunta: +50 monedas y aviso, una sola vez', async ({ app }) => {
  await app.abrir();
  await app.empezar({ dificultad: 'Fácil' });
  await app.responder();
  await expect(app.toasts()).toContainText('Logro: Primera pregunta (+50)');
  expect(await app.estado()).toMatchObject({ logros: ['l1'], coins: 3 + 50 });
  await app.siguiente();
  await app.responder();
  expect((await app.estado()).logros).toEqual(['l1']);
});

for (const [id, nombre, extra, dificultad = 'Fácil'] of [
  ['l2', 'Banqueador', { total: 99 }],
  ['l3', 'Maratonista', { total: 499 }],
  ['l4', 'Constancia', { streak: 7 }],
  ['l5', 'Imparable', { run: 14, bestRun: 14 }],
  ['l6', 'Nivel 5', { xp: 545 }], // +8 → 553; el nivel 5 empieza en 550
  ['l7', 'Cazador de difíciles', { hardOk: 9 }, 'Difícil'],
  ['l8', 'Ojo clínico', { total: 49, ok: 40 }], // 41/50 = 82 %
]) {
  test(`logro ${nombre}`, async ({ app }) => {
    await app.abrir({ estado: { logros: LOGROS.filter((l) => l !== id), ...extra } });
    await app.empezar({ dificultad });
    await app.responder();
    await expect(app.toasts()).toContainText(`Logro: ${nombre} (+50)`);
    expect((await app.estado()).logros).toContain(id);
  });
}

test('Progreso: tarjetas, aciertos por curso y logros', async ({ app, page }) => {
  await app.abrir({
    vista: 'progreso',
    estado: {
      total: 19,
      ok: 11,
      bestRun: 6,
      streak: 2,
      lastDay: HOY,
      logros: ['l1', 'l2'],
      canjes: [{ nombre: 'Algo', costo: 10, fecha: HOY }],
      course: { Pediatría: { n: 10, ok: 8 }, Cardiología: { n: 4, ok: 2 }, 'Salud Pública': { n: 5, ok: 1 } },
    },
  });
  await expect(page.locator('#view .stat')).toHaveText(['19', '58%', '6', '2', '1']);
  const barras = page.locator('.hbar');
  await expect(barras.locator('b')).toHaveText(['Pediatría', 'Salud Pública', 'Cardiología']); // por nº de respuestas
  await expect(barras.locator('> span:last-child')).toHaveText(['80%', '20%', '50%']);
  await expect(barras.nth(0).locator('.bar i')).toHaveAttribute('style', /var\(--ok\)/);
  await expect(barras.nth(1).locator('.bar i')).toHaveAttribute('style', /var\(--bad\)/);
  await expect(barras.nth(2).locator('.bar i')).toHaveAttribute('style', /var\(--gold\)/);
  await expect(page.locator('.logro.got')).toHaveCount(2);
  await expect(page.locator('.logro')).toHaveCount(8);
});

test('Progreso sin datos muestra un mensaje', async ({ app, page }) => {
  await app.abrir({ vista: 'progreso' });
  await expect(page.locator('#view')).toContainText('Aún no hay datos');
});

test('la racha de aciertos del día se reinicia al fallar, pero conserva la mejor del día', async ({
  app,
}) => {
  await app.abrir({ estado: neutro() });
  await app.empezar({ cantidad: 10 });
  await app.responderVarias(3);
  await app.responder({ acertar: false });
  await app.siguiente();
  await app.responder();
  expect((await app.estado()).daily).toMatchObject({ run: 3, runHoy: 1 });
});

test('la racha de aciertos sigue contando entre días para el récord y el bono de 5', async ({ app }) => {
  await app.abrir({
    estado: neutro({
      run: 4,
      bestRun: 4,
      daily: { date: dia(-1), n: 4, ok: 4, run: 4, courses: [], rev: 0, claimed: [] },
    }),
  });
  await app.empezar();
  await app.responder();
  await expect(app.toasts()).toContainText('5 aciertos seguidos · +10');
  expect(await app.estado()).toMatchObject({ run: 5, bestRun: 5 });
});

test('los resultados separan las monedas ganadas por logros', async ({ app, page }) => {
  await app.abrir({ estado: { logros: LOGROS.filter((l) => l !== 'l1') } });
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // solo f03: +8 monedas, +18 XP
  await app.responder(); // y el logro "Primera pregunta": +50
  await app.siguiente();
  await expect(page.locator('#view p.mute').first()).toHaveText(
    '+58 monedas (incluye +50 por logros) · +18 XP',
  );
});
