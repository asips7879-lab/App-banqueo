// Configuración de las pruebas (Playwright).
//
//   npm test            → todas las pruebas, por http:// (servidor local) y por file:// (doble clic)
//   npm run capturas    → capturas de pantalla para revisar a ojo (carpeta tests/capturas/)
'use strict';

const { defineConfig, devices } = require('@playwright/test');
const { pathToFileURL } = require('url');

const PUERTO = 4173;

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    // Las fechas de la app son locales: se fija la zona horaria para que las pruebas no dependan del equipo.
    timezoneId: 'America/Lima',
    locale: 'es-PE',
    trace: 'off',
  },
  projects: [
    {
      name: 'http',
      testIgnore: /capturas\.spec\.js/,
      use: { baseURL: `http://127.0.0.1:${PUERTO}/` },
    },
    {
      name: 'file',
      // El validador no usa el navegador: basta con correrlo una vez (proyecto http).
      testIgnore: /capturas\.spec\.js|validar\.spec\.js/,
      use: { baseURL: pathToFileURL(__dirname).href + '/' },
    },
    {
      name: 'capturas',
      testMatch: /capturas\.spec\.js/,
      use: { baseURL: `http://127.0.0.1:${PUERTO}/`, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: 'node scripts/servidor.js',
    env: { PORT: String(PUERTO) },
    url: `http://127.0.0.1:${PUERTO}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});
