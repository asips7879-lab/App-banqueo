// Cuaderno de errores: agregar desde los resultados, premisa extra, vista en Ajustes,
// preguntas externas, repaso del cuaderno y migración de las antiguas "preguntas propias".
'use strict';

const { test, expect, HOY, REW, XPR, porId, neutro, entradaBanco, entradaExterna } = require('./ayudantes');

const otraLetra = (q) => Object.keys(q.opciones).find((l) => l !== q.correcta);

test.describe('desde los resultados del banqueo', () => {
  test('cada pregunta de la revisión, acertada o fallada, se puede agregar al cuaderno', async ({
    app,
    page,
  }) => {
    await app.abrir({ estado: neutro() });
    await app.empezar({ curso: 'Pediatría' });
    const fallada = await app.responder({ acertar: false });
    await app.siguiente();
    const acertada = await app.responder();
    await app.siguiente();
    await page.locator('#quit').click();

    const paneles = page.locator('.cu-panel');
    await expect(paneles.getByRole('button', { name: '¿Agregar al cuaderno de errores?' })).toHaveCount(2);

    await paneles.nth(0).getByRole('button').click();
    await expect(app.toasts()).toContainText('Agregada a tu cuaderno de errores');
    await expect(paneles.nth(0)).toContainText('¿Quieres añadir alguna premisa extra a la explicación?');
    await paneles.nth(0).getByRole('button', { name: 'No, dejar la explicación de la app' }).click();
    await expect(paneles.nth(0)).toContainText('✓ En tu cuaderno de errores');
    await expect(paneles.nth(0).getByRole('button')).toHaveText('Añadir premisa extra');

    await paneles.nth(1).getByRole('button').click();
    await paneles.nth(1).getByRole('button', { name: 'No, dejar la explicación de la app' }).click();

    const { cuaderno } = await app.estado();
    expect(cuaderno).toHaveLength(2);
    expect(cuaderno[0]).toMatchObject({
      origen: 'banco',
      qid: fallada.id,
      miRespuesta: otraLetra(fallada),
      acerto: false,
      nota: '',
      fecha: HOY,
      archivada: false,
      pregunta: {
        enunciado: fallada.enunciado,
        correcta: fallada.correcta,
        opciones: fallada.opciones,
        explicacion: fallada.explicacion,
      },
    });
    expect(cuaderno[1]).toMatchObject({ qid: acertada.id, miRespuesta: acertada.correcta, acerto: true });
  });

  test('premisa extra: se edita la explicación y la de la app se conserva aparte', async ({ app, page }) => {
    await app.abrir({ estado: neutro() });
    await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // f03
    await app.responder({ acertar: false });
    await app.siguiente();
    const panel = page.locator('.cu-panel');
    await panel.getByRole('button', { name: '¿Agregar al cuaderno de errores?' }).click();
    await panel.getByRole('button', { name: 'Sí, editarla' }).click();

    const nota = panel.locator('textarea');
    await expect(nota).toHaveValue('Explicación de f03.'); // parte de la explicación de la app
    await nota.fill('Explicación de f03.\nRecordar: en Difícil siempre leer dos veces.');
    await panel.getByRole('button', { name: 'Guardar en mi cuaderno' }).click();
    await expect(app.toasts()).toContainText('Tu explicación quedó guardada');
    await expect(panel).toContainText('✓ En tu cuaderno de errores · con tu explicación');

    const fb = page.locator('.rev-fb');
    await expect(fb.locator('.mia')).toContainText('Recordar: en Difícil siempre leer dos veces.');
    await expect(fb.locator('.oficial')).toContainText('Explicación de f03.');
    expect((await app.estado()).cuaderno[0].nota).toBe(
      'Explicación de f03.\nRecordar: en Difícil siempre leer dos veces.',
    );
    // El banco oficial no cambia.
    expect(await page.evaluate(() => window.PREGUNTAS.find((q) => q.id === 'f03').explicacion)).toBe(
      'Explicación de f03.',
    );
  });

  test('si la premisa queda igual o se cancela, se guarda la explicación de la app', async ({
    app,
    page,
  }) => {
    await app.abrir({ estado: neutro() });
    await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' });
    await app.responder();
    await app.siguiente();
    const panel = page.locator('.cu-panel');
    await panel.getByRole('button').click();
    await panel.getByRole('button', { name: 'Sí, editarla' }).click();
    await panel.getByRole('button', { name: 'Guardar en mi cuaderno' }).click(); // sin cambios
    expect((await app.estado()).cuaderno[0].nota).toBe('');
    await panel.getByRole('button', { name: 'Añadir premisa extra' }).click();
    await panel.locator('textarea').fill('Otra cosa');
    await panel.getByRole('button', { name: 'Cancelar' }).click();
    expect((await app.estado()).cuaderno).toMatchObject([{ qid: 'f03', nota: '' }]);
  });

  test('una pregunta que ya está en el cuaderno aparece marcada y muestra la explicación del estudiante', async ({
    app,
    page,
  }) => {
    await app.abrir({
      estado: neutro({ cuaderno: [entradaBanco('f03', { nota: 'Mi premisa sobre f03' })] }),
    });
    await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' });
    await app.responder();
    await expect(page.locator('#fb .mia')).toContainText('Tu explicación');
    await expect(page.locator('#fb .mia')).toContainText('Mi premisa sobre f03');
    await expect(page.locator('#fb .oficial')).toContainText('Explicación de la app');
    await app.siguiente();
    await expect(page.locator('.cu-panel')).toContainText('✓ En tu cuaderno de errores · con tu explicación');
    await expect(page.locator('.cu-panel').getByRole('button')).toHaveText('Editar mi explicación');
  });
});

test.describe('vista del cuaderno (desde Ajustes)', () => {
  test('se abre desde Ajustes y muestra cada pregunta con las dos explicaciones', async ({ app, page }) => {
    await app.abrir({
      vista: 'ajustes',
      estado: {
        cuaderno: [
          entradaBanco('f01', { nota: 'Nota uno', miRespuesta: 'B', acerto: false }),
          entradaExterna(),
        ],
      },
    });
    await expect(page.locator('#cu-card')).toContainText('2 preguntas guardadas (1 del banco · 1 externa)');
    await page.getByRole('link', { name: 'Abrir mi cuaderno' }).click();
    await expect(page).toHaveURL(/#cuaderno$/);
    await expect(page.locator('#view h1')).toHaveText('Cuaderno de errores');
    await expect(page.locator('#nav a.on')).toHaveText('Ajustes');
    await expect(page.locator('#view .stat')).toHaveText(['2', '1', '1']);

    const entradas = page.locator('.entrada');
    await expect(entradas).toHaveCount(2);
    await expect(entradas.nth(0)).toContainText('Externa'); // lo más reciente primero
    const f01 = entradas.nth(1);
    await f01.locator('summary').click();
    await expect(f01.locator('.mia')).toContainText('Nota uno');
    await expect(f01.locator('.oficial')).toContainText('Explicación de f01.');
    await expect(f01).toContainText('Respondiste B (incorrecta)');
    await expect(f01.locator('li.ok')).toContainText('Opción A de f01');
    await expect(f01.locator('li.bad')).toContainText('Opción B de f01');

    const externa = entradas.nth(0);
    await externa.locator('summary').click();
    await expect(externa.locator('.mia')).toContainText('Los triptanes abortan la crisis.');
    await expect(externa.locator('.oficial')).toHaveCount(0);
    await expect(externa).toContainText('Fuente: Simulacro externo');
  });

  test('filtrar por curso, buscar sin tildes y archivar lo que ya domina', async ({ app, page }) => {
    await app.abrir({
      vista: 'cuaderno',
      estado: { cuaderno: [entradaBanco('f01'), entradaBanco('f05'), entradaExterna()] },
    });
    const entradas = page.locator('.entrada');
    await expect(entradas).toHaveCount(3);
    await page.selectOption('#cu-cu', 'Cardiología');
    await expect(entradas).toHaveCount(1);
    await expect(page.locator('#cu-go')).toHaveText('Repasar cuaderno (1 pregunta)');
    await page.selectOption('#cu-cu', '');
    await page.fill('#cu-tx', 'migrana');
    await expect(entradas).toHaveCount(1);
    await expect(entradas.first()).toContainText('Externa');
    await page.fill('#cu-tx', '');

    const f01 = page.locator('.entrada[data-id="c-f01"]');
    await f01.locator('summary').click();
    await f01.getByRole('button', { name: 'Ya lo domino' }).click();
    await expect(app.toasts()).toContainText('Archivada');
    await expect(entradas).toHaveCount(2);
    await expect(page.locator('#cu-go')).toHaveText('Repasar cuaderno (2 preguntas)');
    await page.locator('#cu-arch').check();
    await expect(entradas).toHaveCount(3);
    await expect(f01).toContainText('Archivada');
    await f01.locator('summary').click();
    await f01.getByRole('button', { name: 'Volver a repasar' }).click();
    expect((await app.estado()).cuaderno.every((e) => !e.archivada)).toBe(true);
  });

  test('editar la explicación y quitar una pregunta del cuaderno', async ({ app, page }) => {
    await app.abrir({ vista: 'cuaderno', estado: { cuaderno: [entradaBanco('f01')] } });
    const f01 = page.locator('.entrada');
    await f01.locator('summary').click();
    await f01.getByRole('button', { name: 'Añadir mi explicación' }).click();
    await expect(f01.locator('textarea')).toHaveValue('Explicación de f01.');
    await f01.locator('textarea').fill('Mi forma de entenderla');
    await f01.getByRole('button', { name: 'Guardar en mi cuaderno' }).click();
    await expect(f01.locator('.mia')).toContainText('Mi forma de entenderla');
    await expect(f01.getByRole('button', { name: 'Editar mi explicación' })).toBeVisible();
    expect((await app.estado()).cuaderno[0].nota).toBe('Mi forma de entenderla');

    await f01.getByRole('button', { name: 'Quitar' }).click();
    await expect(f01).toContainText('¿Quitar esta pregunta de tu cuaderno?');
    await f01.getByRole('button', { name: 'Sí, quitar' }).click();
    await expect(app.toasts()).toContainText('Quitada de tu cuaderno');
    await expect(page.locator('.entrada')).toHaveCount(0);
    await expect(page.locator('#cu-lista')).toContainText('Todavía no guardas preguntas');
    expect((await app.estado()).cuaderno).toEqual([]);
  });

  test('anotar una pregunta externa: queda solo en el cuaderno, no en el banco', async ({ app, page }) => {
    await app.abrir({ vista: 'cuaderno' });
    await page.locator('#cu-nueva summary').click();
    await page.fill('#ce-curso', 'Neurología');
    await page.fill('#ce-tema', 'ACV');
    await page.fill('#ce-enun', 'Ventana para trombólisis en ACV isquémico');
    for (const [l, t] of Object.entries({ A: '1 hora', B: '3 horas', C: '4.5 horas', D: '12 horas' }))
      await page.fill(`#ce-${l}`, t);
    await page.selectOption('#ce-clave', 'C');
    await page.fill('#ce-fuente', 'Simulacro externo 2025');
    await page.fill('#ce-nota', 'Hasta 4.5 h desde el inicio de los síntomas.');
    await page.getByRole('button', { name: 'Guardar en mi cuaderno' }).click();
    await expect(app.toasts()).toContainText('Pregunta anotada en tu cuaderno');
    await expect(page.locator('.entrada')).toHaveCount(1);

    expect((await app.estado()).cuaderno[0]).toMatchObject({
      origen: 'externa',
      nota: 'Hasta 4.5 h desde el inicio de los síntomas.',
      fecha: HOY,
      archivada: false,
      pregunta: {
        curso: 'Neurología',
        tema: 'ACV',
        dificultad: 'Media',
        correcta: 'C',
        fuente: 'Simulacro externo 2025',
        opciones: { C: '4.5 horas' },
      },
    });
    await app.ir('banquear');
    await expect(page.locator('#f-count')).toHaveText('12 preguntas coinciden');
    await expect(page.locator('#f-cu option', { hasText: 'Neurología' })).toHaveCount(0);
  });

  test('una pregunta externa cuya respuesta correcta no tiene texto no se guarda', async ({ app, page }) => {
    await app.abrir({ vista: 'cuaderno' });
    await page.locator('#cu-nueva summary').click();
    await page.fill('#ce-curso', 'X');
    await page.fill('#ce-enun', 'Enunciado');
    for (const l of 'ABCD') await page.fill(`#ce-${l}`, `Opción ${l}`);
    await page.selectOption('#ce-clave', 'E');
    await page.getByRole('button', { name: 'Guardar en mi cuaderno' }).click();
    await expect(app.toasts()).toContainText('La respuesta correcta elegida no tiene texto');
    expect((await app.estado())?.cuaderno ?? []).toEqual([]);
  });
});

test.describe('repasar el cuaderno', () => {
  test('incluye lo guardado y, si se quiere, las preguntas del banco que se fallaron', async ({
    app,
    page,
  }) => {
    await app.abrir({
      vista: 'cuaderno',
      estado: neutro({
        cuaderno: [entradaBanco('f01'), entradaExterna()],
        ans: { f05: { n: 1, ok: 0, last: false }, f06: { n: 2, ok: 2, last: true } },
      }),
    });
    await expect(
      page.locator('label', { hasText: 'Incluir las preguntas del banco que fallaste' }),
    ).toContainText('(1)');
    await expect(page.locator('#cu-go')).toHaveText('Repasar cuaderno (3 preguntas)');
    await page.locator('#cu-fall').uncheck();
    await expect(page.locator('#cu-go')).toHaveText('Repasar cuaderno (2 preguntas)');
    await page.locator('#cu-fall').check();
    await page.locator('#cu-go').click();
    await expect(page.getByText('Cuaderno · 1/3')).toBeVisible();

    const respondidas = await app.responderVarias(3);
    expect(respondidas.map((q) => q.id || 'externa').sort()).toEqual(['externa', 'f01', 'f05']);
    await expect(page.locator('#view h1')).toHaveText('3/3 correctas · 100%');

    // La pregunta externa no da monedas ni XP ni cuenta en las estadísticas.
    const s = await app.estado();
    expect(s.coins).toBe(REW[porId('f01').dificultad] + REW[porId('f05').dificultad]);
    expect(s.xp).toBe(XPR[porId('f01').dificultad] + XPR[porId('f05').dificultad]);
    expect(s.total).toBe(2);
    // En la revisión: f01 y la externa ya están en el cuaderno; f05 se puede agregar.
    await expect(page.locator('.cu-panel', { hasText: '✓ En tu cuaderno' })).toHaveCount(2);
    await expect(page.getByRole('button', { name: '¿Agregar al cuaderno de errores?' })).toHaveCount(1);
  });

  test('una pregunta externa fallada no va al repaso ni se marca como error peligroso', async ({
    app,
    page,
  }) => {
    await app.abrir({ vista: 'ajustes', estado: neutro({ cuaderno: [entradaExterna()] }) });
    await page.locator('#cu-repasar').click();
    await expect(page.getByText('Cuaderno · 1/1')).toBeVisible();
    await app.responder({ acertar: false, seguro: true });
    await expect(page.locator('#fb h3')).toHaveText('Incorrecto · la respuesta es A');
    await expect(page.locator('#fb .mia')).toContainText('Los triptanes abortan la crisis.');
    await app.siguiente();
    await expect(page.locator('#view')).not.toContainText('pasan a tu repaso');
    const s = await app.estado();
    expect(s).toMatchObject({ srs: {}, total: 0, coins: 0, xp: 0 });
  });

  test('sin nada guardado ni fallado, el botón de repasar queda desactivado', async ({ app, page }) => {
    await app.abrir({ vista: 'ajustes' });
    await expect(page.locator('#cu-repasar')).toBeDisabled();
    await page.getByRole('link', { name: 'Abrir mi cuaderno' }).click();
    await expect(page.locator('#cu-go')).toBeDisabled();
    await expect(page.locator('#cu-go')).toHaveText('Nada que repasar todavía');
  });
});

test.describe('migración desde la versión anterior', () => {
  const antigua = {
    id: 'u1',
    examen: ['ENAM'],
    curso: 'Neurología',
    tema: 'T',
    dificultad: 'Difícil',
    enunciado: 'Pregunta propia antigua',
    opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
    correcta: 'B',
    explicacion: 'Mi explicación antigua',
    perla: '',
    fuente: 'Propia',
  };
  const esperada = {
    origen: 'externa',
    nota: 'Mi explicación antigua',
    archivada: false,
    pregunta: {
      enunciado: 'Pregunta propia antigua',
      correcta: 'B',
      dificultad: 'Difícil',
      curso: 'Neurología',
      fuente: 'Propia',
    },
  };

  test('las "preguntas propias" guardadas pasan al cuaderno como externas y salen del banco', async ({
    app,
    page,
  }) => {
    await app.abrir({ estado: { xp: 40, custom: [antigua] } });
    const s = await app.estado();
    expect(s.cuaderno).toMatchObject([esperada]);
    expect('custom' in s).toBe(false);
    expect(s.xp).toBe(40);
    await app.ir('banquear');
    await expect(page.locator('#f-count')).toHaveText('12 preguntas coinciden');
  });

  test('restaurar una copia de seguridad antigua también las pasa al cuaderno', async ({ app, page }) => {
    await app.abrir({ vista: 'ajustes' });
    await page.fill('#imp', JSON.stringify({ xp: 10, coins: 3, custom: [antigua] }));
    await page.locator('#doimp').click();
    await expect(app.toasts()).toContainText('Progreso restaurado');
    await expect(page.locator('#cu-card')).toContainText('1 pregunta guardada (0 del banco · 1 externa)');
    expect((await app.estado()).cuaderno).toMatchObject([esperada]);
  });
});
