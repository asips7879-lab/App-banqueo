// Validador del banco (scripts/validar.js). No usa el navegador.
'use strict';

const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { validar, cargarBanco } = require('../scripts/validar');

const buena = (extra = {}) => ({
  id: 'p1',
  examen: ['ENAM'],
  curso: 'Pediatría',
  tema: 'T',
  dificultad: 'Media',
  enunciado: '¿Pregunta?',
  opciones: { A: 'a', B: 'b', C: 'c', D: 'd' },
  correcta: 'B',
  explicacion: 'Porque sí.',
  ...extra,
});

test('una pregunta bien escrita pasa sin errores ni avisos', () => {
  expect(
    validar([
      buena(),
      buena({
        id: 'p2',
        enunciado: 'Otra',
        opciones: { A: 'a', B: 'b', C: 'c', D: 'd', E: 'e' },
        correcta: 'E',
      }),
    ]),
  ).toMatchObject({ errores: [], avisos: [] });
});

test('dificultad sin tilde: error con sugerencia', () => {
  const { errores } = validar([buena({ dificultad: 'Facil' })]);
  expect(errores).toEqual([expect.stringContaining('¿quisiste decir "Fácil"?')]);
});

test('falta la dificultad o no existe', () => {
  expect(validar([buena({ dificultad: undefined })]).errores[0]).toContain('falta "dificultad"');
  expect(validar([buena({ dificultad: 'Dura' })]).errores[0]).toContain('no es válida');
});

test('ids repetidos', () => {
  expect(validar([buena(), buena({ enunciado: 'Otra' })]).errores).toEqual([
    expect.stringContaining('ya lo usa la pregunta 1'),
  ]);
});

test('la clave debe existir entre las opciones', () => {
  expect(validar([buena({ correcta: 'E' })]).errores).toEqual([
    expect.stringContaining('la clave es E, pero esa opción no existe'),
  ]);
  expect(validar([buena({ correcta: 'b' })]).errores).toEqual([
    expect.stringContaining('¿quisiste decir "B"?'),
  ]);
  expect(validar([buena({ correcta: undefined })]).errores).toEqual([
    expect.stringContaining('falta "correcta"'),
  ]);
});

test('opciones obligatorias, vacías o con letras que no existen', () => {
  const { errores } = validar([buena({ opciones: { A: 'a', B: 'b', D: 'd', E: '', F: 'f' } })]);
  expect(errores).toEqual([
    expect.stringContaining('falta el texto de la opción C'),
    expect.stringContaining('la opción E está vacía'),
    expect.stringContaining('la opción "F" no es válida'),
  ]);
});

test('examen mal escrito', () => {
  expect(validar([buena({ examen: ['enam', 'Residentado'] })]).errores).toEqual([
    expect.stringContaining('¿quisiste decir "ENAM"?'),
    expect.stringContaining('"Residentado" no es válido'),
  ]);
  expect(validar([buena({ examen: [] })]).errores[0]).toContain('al menos uno');
});

test('avisos: sin explicación, campo mal escrito, enunciado repetido y curso escrito de dos formas', () => {
  const { errores, avisos } = validar([
    buena({ explicacion: '' }),
    buena({ id: 'p2', curso: 'Pediatria', dificultdad: 'Media' }),
  ]);
  expect(errores).toEqual([]);
  expect(avisos).toEqual([
    expect.stringContaining('todavía no tiene explicación'),
    expect.stringContaining('"dificultdad" no se usa (¿quisiste decir "dificultad"?)'),
    expect.stringContaining('el enunciado es igual al de la pregunta 1'),
    expect.stringContaining('"Pediatría" (1), "Pediatria" (1)'),
  ]);
});

test('resumen por curso y dificultad', () => {
  const { resumen } = validar([
    buena(),
    buena({ id: 'p2', enunciado: 'b', dificultad: 'Fácil' }),
    buena({ id: 'p3', enunciado: 'c', curso: 'Cardiología', dificultad: 'Difícil', ejemplo: true }),
  ]);
  expect(resumen).toEqual({
    total: 3,
    ejemplos: 1,
    porCurso: {
      Pediatría: { Fácil: 1, Media: 1, Difícil: 0, otra: 0, total: 2 },
      Cardiología: { Fácil: 0, Media: 0, Difícil: 1, otra: 0, total: 1 },
    },
  });
});

test('un archivo con error de sintaxis indica la línea y la causa probable', ({}, testInfo) => {
  const ruta = testInfo.outputPath('preguntas.js');
  fs.writeFileSync(ruta, 'window.PREGUNTAS = [\n  { id: "a", curso: "X"\n    dificultad: "Media" }\n];\n');
  expect(() => cargarBanco(ruta)).toThrow(/cerca de la línea 3.*coma que falta/s);
});

test('un archivo sin window.PREGUNTAS da un error claro', ({}, testInfo) => {
  const ruta = testInfo.outputPath('vacio.js');
  fs.writeFileSync(ruta, '// nada\n');
  expect(validar(cargarBanco(ruta)).errores).toEqual([expect.stringContaining('window.PREGUNTAS = [ ... ]')]);
});
