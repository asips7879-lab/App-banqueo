// Ayudantes compartidos por las pruebas.
//
// - `app.abrir({ estado, fecha, banco, vista, reloj })` abre la app con un progreso
//   guardado, una fecha simulada y el banco de prueba (o el real con banco: null).
// - Cualquier error en la consola de la página hace fallar la prueba.
// - La tipografía de Google se reemplaza por una hoja vacía (salvo en las capturas)
//   para que las pruebas funcionen sin internet.
'use strict';

const base = require('@playwright/test');
const { BANCO, porId } = require('./banco-prueba');

const CLAVE = 'banqueo-jorg-v1';
const HOY = '2026-11-24';
const LOGROS = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8'];
const REW = { 'Fácil': 3, Media: 5, 'Difícil': 8 };
const XPR = { 'Fácil': 8, Media: 12, 'Difícil': 18 };

// dia(-1) → ayer, dia(3) → dentro de 3 días (formato YYYY-MM-DD).
function dia(n, desde = HOY) {
  const d = new Date(`${desde}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Progreso con todos los logros ya obtenidos, para que sus +50 monedas no alteren las cuentas.
const neutro = (extra = {}) => ({ logros: [...LOGROS], ...extra });

class App {
  constructor(page) {
    this.page = page;
    this.banco = BANCO;
  }

  async abrir({ estado, fecha = HOY, banco = BANCO, vista = 'inicio', reloj = false } = {}) {
    const { page } = this;
    this.banco = banco;
    const momento = new Date(`${fecha}T10:00:00-05:00`);
    // reloj: true controla también los temporizadores (para el cronómetro del simulacro).
    if (reloj) await page.clock.install({ time: momento });
    else await page.clock.setFixedTime(momento);
    await page.addInitScript(({ clave, estado, banco }) => {
      if (banco) Object.defineProperty(window, 'PREGUNTAS', { configurable: true, get: () => banco, set: () => {} });
      // Siembra el progreso solo la primera vez: al recargar se conserva lo que guardó la app.
      if (estado && !sessionStorage.getItem('__sembrado')) {
        localStorage.setItem(clave, JSON.stringify(estado));
        sessionStorage.setItem('__sembrado', '1');
      }
    }, { clave: CLAVE, estado: estado || null, banco });
    await page.goto(`index.html#${vista}`);
    await base.expect(page.locator('#view')).not.toBeEmpty();
  }

  async cambiarFecha(fecha) {
    await this.page.clock.setFixedTime(new Date(`${fecha}T10:00:00-05:00`));
  }

  async ir(vista) {
    await this.page.locator(`#nav a[href="#${vista}"]`).click();
    await base.expect(this.page.locator(`#nav a.on[href="#${vista}"]`)).toBeVisible();
  }

  // Progreso guardado en localStorage (null si la app aún no guardó nada).
  estado() {
    return this.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), CLAVE);
  }

  toasts() {
    return this.page.locator('#toasts');
  }

  // Arma un banqueo con los filtros indicados y lo empieza.
  // cantidad: 10 | 20 | 50 | 'todas'; filtro: 'new' | 'bad'; modo: 'practica' | 'simulacro'
  async empezar({ examen, curso, dificultad, filtro, cantidad, modo } = {}) {
    const { page } = this;
    if (!/#banquear$/.test(page.url())) await this.ir('banquear');
    const nuevo = page.locator('#again');
    if (await nuevo.isVisible()) await nuevo.click();
    const elegir = async (sel, valor) => {
      if (valor !== undefined) await page.selectOption(sel, String(valor));
    };
    await elegir('#f-ex', examen);
    await elegir('#f-cu', curso);
    await elegir('#f-di', dificultad);
    await elegir('#f-st', filtro);
    await elegir('#f-n', cantidad === 'todas' ? '9999' : cantidad);
    await elegir('#f-mo', modo);
    await page.locator('#go').click();
    await base.expect(page.locator('.q')).toBeVisible();
  }

  // La pregunta que está en pantalla.
  async preguntaActual() {
    const texto = (await this.page.locator('.q').textContent()).trim();
    if (this.banco) return porId(texto.match(/^\[(f\d+)\]/)[1]);
    const reales = await this.page.evaluate(() => window.PREGUNTAS);
    return reales.find((q) => q.enunciado.trim() === texto);
  }

  // Responde la pregunta en pantalla (acertando o fallando) y devuelve cuál era.
  async responder({ acertar = true, seguro = false, teclado = false } = {}) {
    const { page } = this;
    const q = await this.preguntaActual();
    const letra = acertar ? q.correcta : Object.keys(q.opciones).find((l) => l !== q.correcta);
    if (teclado) {
      await page.keyboard.press(letra.toLowerCase());
      if (seguro) await page.keyboard.press('s');
      await page.keyboard.press('Enter');
    } else {
      await page.locator(`.opt[data-l="${letra}"]`).click();
      if (seguro) await page.locator('.conf button[data-c="seguro"]').click();
      await page.locator('#ok').click();
    }
    return q;
  }

  // Pasa a la siguiente pregunta (o a los resultados) en práctica y repaso.
  async siguiente() {
    await this.page.locator('#ok').click();
  }

  // Responde n preguntas seguidas en práctica o repaso.
  async responderVarias(n, opciones) {
    const hechas = [];
    for (let i = 0; i < n; i++) {
      hechas.push(await this.responder(opciones));
      await this.siguiente();
    }
    return hechas;
  }
}

const test = base.test.extend({
  vigilarConsola: [
    async ({ page }, use, testInfo) => {
      const errores = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errores.push(m.text());
      });
      page.on('pageerror', (e) => errores.push(e.message));
      if (testInfo.project.name !== 'capturas') {
        await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      }
      await use();
      base.expect(errores, 'La página no debe mostrar errores en la consola').toEqual([]);
    },
    { auto: true },
  ],
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

module.exports = { test, expect: base.expect, App, BANCO, porId, CLAVE, HOY, LOGROS, REW, XPR, dia, neutro };
