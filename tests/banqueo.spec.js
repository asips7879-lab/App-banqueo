// Armar un banqueo, responder (práctica y simulacro), atajos de teclado y resultados.
'use strict';

const { test, expect } = require('./ayudantes');

test('los filtros cuentan las coincidencias y desactivan Empezar si no hay', async ({ app, page }) => {
  await app.abrir({ vista: 'banquear' });
  const cuenta = page.locator('#f-count');
  await expect(cuenta).toHaveText('12 preguntas coinciden');
  await expect(page.locator('#f-cu option')).toHaveText([
    'Todos',
    'Cardiología',
    'Pediatría',
    'Salud Pública',
  ]);
  await page.selectOption('#f-di', 'Fácil');
  await expect(cuenta).toHaveText('4 preguntas coinciden');
  await page.selectOption('#f-ex', 'ENAM');
  await expect(cuenta).toHaveText('2 preguntas coinciden');
  await page.selectOption('#f-cu', 'Pediatría');
  await expect(cuenta).toHaveText('1 preguntas coinciden');
  await expect(page.locator('#go')).toBeEnabled();
  await page.selectOption('#f-ex', 'RM');
  await expect(cuenta).toHaveText('0 preguntas coinciden');
  await expect(page.locator('#go')).toBeDisabled();
});

test('filtro de estado: no vistas y falladas alguna vez', async ({ app, page }) => {
  await app.abrir({
    vista: 'banquear',
    estado: { ans: { f01: { n: 1, ok: 1, last: true }, f02: { n: 2, ok: 1, last: true } } },
  });
  await page.selectOption('#f-st', 'new');
  await expect(page.locator('#f-count')).toHaveText('10 preguntas coinciden');
  await page.selectOption('#f-st', 'bad');
  await expect(page.locator('#f-count')).toHaveText('1 preguntas coinciden');
});

test('la cantidad limita el tamaño de la sesión', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ cantidad: 10 });
  await expect(page.getByText('Práctica · 1/10')).toBeVisible();
  await page.locator('#quit').click();
  await app.empezar({ cantidad: 'todas' });
  await expect(page.getByText('Práctica · 1/12')).toBeVisible();
});

test('práctica con teclado: elegir, marcar Seguro, confirmar y ver resultados', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' }); // solo f03 (clave C)
  await expect(page.locator('#ok')).toHaveText('Confirmar');
  await expect(page.locator('#ok')).toBeDisabled();
  await expect(page.locator('.conf button.on')).toHaveText('Dudo');

  await page.keyboard.press('c');
  await expect(page.locator('.opt.sel')).toHaveAttribute('data-l', 'C');
  await expect(page.locator('#ok')).toBeEnabled();
  await page.keyboard.press('s');
  await expect(page.locator('.conf button.on')).toHaveText('Seguro');
  await page.keyboard.press('Enter');

  await expect(page.locator('.opt.ok')).toHaveAttribute('data-l', 'C');
  await expect(page.locator('#fb h3')).toHaveText('¡Correcto! · bono de seguridad ×1.5');
  await expect(page.locator('#fb')).toContainText('Explicación de f03.');
  await expect(page.locator('#fb .perla')).toHaveText('Perla: Perla de f03.');
  await expect(page.locator('.conf')).toBeHidden();
  await expect(page.locator('#ok')).toHaveText('Ver resultados');

  await page.keyboard.press('Enter');
  await expect(page.locator('#view h1')).toHaveText('1/1 correctas · 100%');
});

test('práctica: una respuesta incorrecta marca la clave y la elegida', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Cardiología', dificultad: 'Fácil' }); // solo f07 (clave B)
  await app.responder({ acertar: false }); // elige A
  await expect(page.locator('.opt.bad')).toHaveAttribute('data-l', 'A');
  await expect(page.locator('.opt.ok')).toHaveAttribute('data-l', 'B');
  await expect(page.locator('#fb h3')).toHaveText('Incorrecto · la respuesta es B');
  await expect(page.locator('#fb')).toContainText('Fuente: Fuente de f07');
});

test('práctica: fallar estando Seguro avisa del error peligroso', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Cardiología', dificultad: 'Difícil' }); // solo f06
  await app.responder({ acertar: false, seguro: true });
  await expect(page.locator('#fb h3')).toHaveText(
    'Incorrecto · la respuesta es A · error peligroso, irá primero a tu repaso',
  );
});

test('atajos 1–5; si la pregunta no tiene opción E, la E no se puede elegir', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Pediatría', dificultad: 'Media' }); // solo f02 (sin E)
  await expect(page.locator('.opt')).toHaveCount(4);
  await page.keyboard.press('5');
  await page.keyboard.press('e');
  await expect(page.locator('#ok')).toBeDisabled();
  await page.keyboard.press('2');
  await expect(page.locator('.opt.sel')).toHaveAttribute('data-l', 'B');
});

test('Terminar sin responder vuelve a armar el banqueo', async ({ app, page }) => {
  await app.abrir();
  await app.empezar();
  await page.locator('#quit').click();
  await expect(page.locator('#view h1')).toHaveText('Arma tu banqueo');
});

test('Terminar a mitad muestra los resultados de lo respondido', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ cantidad: 10 });
  await app.responder({ acertar: false });
  await app.siguiente();
  await page.locator('#quit').click();
  await expect(page.locator('#view h1')).toHaveText('0/1 correctas · 0%');
  await expect(page.locator('#view')).toContainText('1 preguntas pasan a tu repaso');
  await expect(page.locator('details')).toHaveCount(1);
  await page.locator('#again').click();
  await expect(page.locator('#view h1')).toHaveText('Arma tu banqueo');
});

test('simulacro: sin explicación, con cronómetro, y termina solo al acabarse el tiempo', async ({
  app,
  page,
}) => {
  await app.abrir({ reloj: true });
  await app.empezar({ curso: 'Pediatría', modo: 'simulacro' }); // 4 preguntas × 72 s = 4:48
  await expect(page.getByText('Simulacro · 1/4')).toBeVisible();
  await expect(page.locator('#timer')).toHaveText('4:48');
  await expect(page.locator('#ok')).toHaveText('Responder');

  await app.responder({ acertar: false });
  await expect(page.getByText('Simulacro · 2/4')).toBeVisible();
  await expect(page.locator('#fb')).toBeEmpty();
  await app.responder();
  await expect(page.getByText('Simulacro · 3/4')).toBeVisible();

  await page.clock.fastForward('04:50');
  await expect(page.locator('#view h1')).toHaveText('1/2 correctas · 50%');
  // En simulacro, las falladas aparecen abiertas en la revisión.
  await expect(page.locator('details')).toHaveCount(2);
  await expect(page.locator('details[open]')).toHaveCount(1);
});

test('al salir de los resultados, Banquear vuelve a empezar de cero', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Pediatría', dificultad: 'Difícil' });
  await app.responder();
  await app.siguiente();
  await expect(page.locator('#view h1')).toHaveText('1/1 correctas · 100%');
  await page.getByRole('link', { name: 'Ver misiones' }).click();
  await app.ir('banquear');
  await expect(page.locator('#view h1')).toHaveText('Arma tu banqueo');
});

test('Hemi reacciona al responder: salta al acertar y no aparece en la revisión', async ({ app, page }) => {
  await app.abrir();
  await app.empezar({ curso: 'Pediatría' });
  await app.responder();
  await expect(page.locator('#fb .fb-hemi svg.hop')).toHaveCount(1);
  await expect(page.locator('#fb .fb-hemi path[d^="M84 120"]')).toHaveCount(1); // sonríe
  await app.siguiente();
  await app.responder({ acertar: false });
  await expect(page.locator('#fb .fb-hemi svg.hop')).toHaveCount(0);
  await expect(page.locator('#fb .fb-hemi path[d^="M88 125"]')).toHaveCount(1); // boca recta
  await app.siguiente();
  await page.locator('#quit').click();
  await expect(page.locator('.rev-fb .fb-hemi')).toHaveCount(0);
});
