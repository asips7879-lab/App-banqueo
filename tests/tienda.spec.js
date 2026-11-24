// Tienda: premios personales y accesorios de la mascota.
'use strict';

const { test, expect, HOY } = require('./ayudantes');

test('sin monedas suficientes no se puede canjear ni comprar', async ({ app, page }) => {
  await app.abrir({ vista: 'tienda', estado: { coins: 100 } });
  await expect(page.locator('[data-buy="p1"]')).toBeDisabled(); // 150
  await expect(page.locator('[data-buy="p2"]')).toBeDisabled(); // 300
  await expect(page.locator('[data-acc="lentes"]')).toBeEnabled(); // 60
  await expect(page.locator('[data-acc="mascarilla"]')).toBeEnabled(); // 80
  await expect(page.locator('[data-acc="gorro"]')).toBeDisabled(); // 120
});

test('canjear un premio pide confirmación y lo registra', async ({ app, page }) => {
  await app.abrir({ vista: 'tienda', estado: { coins: 200 } });
  await page.locator('[data-buy="p1"]').click();
  await expect(page.locator('#confirmBox')).toContainText('¿Canjear “Un episodio de mi serie” por 150 monedas?');
  await page.locator('#cn').click();
  await expect(page.locator('#confirmBox')).toBeEmpty();
  expect((await app.estado()).coins).toBe(200);

  await page.locator('[data-buy="p1"]').click();
  await page.locator('#cy').click();
  await expect(app.toasts()).toContainText('¡Disfruta: Un episodio de mi serie!');
  await expect(page.locator('#h-coins')).toHaveText('50');
  expect((await app.estado()).canjes).toEqual([{ nombre: 'Un episodio de mi serie', costo: 150, fecha: HOY }]);
  await expect(page.locator('#view')).toContainText(`${HOY} · Un episodio de mi serie · 150`);
});

test('agregar y quitar premios', async ({ app, page }) => {
  await app.abrir({ vista: 'tienda' });
  await page.fill('#pn', 'Salida al cine');
  await page.fill('#pc', '250');
  await page.getByRole('button', { name: 'Agregar' }).click();
  const tarjeta = page.locator('.card', { hasText: 'Salida al cine' });
  await expect(tarjeta).toContainText('250');
  expect((await app.estado()).premios.at(-1)).toMatchObject({ nombre: 'Salida al cine', costo: 250 });

  await tarjeta.getByRole('button', { name: 'Quitar' }).click();
  await expect(page.locator('.card', { hasText: 'Salida al cine' })).toHaveCount(0);
  expect((await app.estado()).premios).toHaveLength(2);
});

test('un premio sin nombre no se agrega', async ({ app, page }) => {
  await app.abrir({ vista: 'tienda' });
  await page.getByRole('button', { name: 'Agregar' }).click();
  expect(await app.estado()).toBeNull(); // el formulario no se envió: nada se guardó
});

test.fail('ERROR DETECTADO EN LA FASE 1: un premio con nombre de solo espacios no debería agregarse', async ({ app, page }) => {
  // El campo es obligatorio, pero "   " pasa la validación del navegador y se guarda con nombre vacío.
  // Se corrige en la fase 3 (entonces se quita el ".fail").
  await app.abrir({ vista: 'tienda' });
  await page.fill('#pn', '   ');
  await page.getByRole('button', { name: 'Agregar' }).click();
  const premios = (await app.estado())?.premios ?? [];
  expect(premios.filter((p) => !p.nombre.trim())).toEqual([]);
});

test('comprar un accesorio lo equipa, y se puede quitar y volver a poner', async ({ app, page }) => {
  await app.abrir({ vista: 'tienda', estado: { coins: 100 } });
  await page.locator('[data-acc="lentes"]').click();
  await expect(app.toasts()).toContainText('Hemi estrena lentes de lectura');
  await expect(page.locator('[data-eq="lentes"]')).toHaveText('Puesto');
  await expect(page.locator('[data-acc="mascarilla"]')).toBeDisabled(); // quedan 40
  expect(await app.estado()).toMatchObject({ coins: 40, owned: ['lentes'], equip: ['lentes'] });

  await page.locator('[data-eq="lentes"]').click();
  await expect(page.locator('[data-eq="lentes"]')).toHaveText('Ponérselo');
  expect(await app.estado()).toMatchObject({ owned: ['lentes'], equip: [] });
  await page.locator('[data-eq="lentes"]').click();
  await expect(page.locator('[data-eq="lentes"]')).toHaveText('Puesto');
});

test('los accesorios puestos se ven en la mascota del inicio', async ({ app, page }) => {
  await app.abrir({ estado: { owned: ['lentes', 'corona', 'mascarilla'], equip: ['lentes', 'corona', 'mascarilla'] } });
  const svg = page.locator('.hero svg');
  await expect(svg.locator('circle[r="15"]')).toHaveCount(2); // lentes
  await expect(svg.locator('path[d^="M72 50"]')).toHaveCount(1); // corona
  await expect(svg.locator('path[d^="M84 120"]')).toHaveCount(0); // la mascarilla tapa la boca
});

for (const conGorro of [false, true]) {
  test(`etapa Especialista ${conGorro ? 'con gorro quirúrgico: el gorro reemplaza al birrete' : 'sin gorro: lleva birrete'}`, async ({ app, page }) => {
    const accesorios = conGorro ? ['gorro'] : [];
    await app.abrir({ estado: { xp: 3675, owned: accesorios, equip: accesorios } });
    await expect(page.locator('.hero svg path[d^="M58 52"]')).toHaveCount(conGorro ? 0 : 1); // birrete
    await expect(page.locator('.hero svg path[d^="M46 74"]')).toHaveCount(conGorro ? 1 : 0); // gorro
  });
}
