// Banco de preguntas SOLO para las pruebas. No depende de preguntas.js, así que
// agregar o borrar preguntas reales no rompe estas pruebas.
//
// 12 preguntas: 3 cursos × 4, con 4 de cada dificultad. Cada enunciado empieza
// con su id entre corchetes ("[f03] …") para saber qué pregunta está en pantalla
// aunque el orden sea aleatorio.
//
//  id   curso          dificultad  examen                     clave  opción E
//  f01  Pediatría      Fácil       ENAM, Preinternado          A      sí
//  f02  Pediatría      Media       ENAM, RM                    B      no
//  f03  Pediatría      Difícil     RM                          C      sí
//  f04  Pediatría      Fácil       Preinternado                D      sí
//  f05  Cardiología    Media       ENAM                        E      sí
//  f06  Cardiología    Difícil     ENAM, RM                    A      no
//  f07  Cardiología    Fácil       Preinternado                B      sí
//  f08  Cardiología    Media       RM                          C      sí
//  f09  Salud Pública  Difícil     ENAM, RM, Preinternado      D      sí
//  f10  Salud Pública  Fácil       ENAM                        E      sí
//  f11  Salud Pública  Media       Preinternado                A      sí
//  f12  Salud Pública  Difícil     RM                          B      sí
'use strict';

const FILAS = [
  ['f01', 'Pediatría', 'Fácil', ['ENAM', 'Preinternado'], 'A', true],
  ['f02', 'Pediatría', 'Media', ['ENAM', 'RM'], 'B', false],
  ['f03', 'Pediatría', 'Difícil', ['RM'], 'C', true],
  ['f04', 'Pediatría', 'Fácil', ['Preinternado'], 'D', true],
  ['f05', 'Cardiología', 'Media', ['ENAM'], 'E', true],
  ['f06', 'Cardiología', 'Difícil', ['ENAM', 'RM'], 'A', false],
  ['f07', 'Cardiología', 'Fácil', ['Preinternado'], 'B', true],
  ['f08', 'Cardiología', 'Media', ['RM'], 'C', true],
  ['f09', 'Salud Pública', 'Difícil', ['ENAM', 'RM', 'Preinternado'], 'D', true],
  ['f10', 'Salud Pública', 'Fácil', ['ENAM'], 'E', true],
  ['f11', 'Salud Pública', 'Media', ['Preinternado'], 'A', true],
  ['f12', 'Salud Pública', 'Difícil', ['RM'], 'B', true],
];

const BANCO = FILAS.map(([id, curso, dificultad, examen, correcta, conE], i) => {
  const opciones = {};
  for (const l of conE ? 'ABCDE' : 'ABCD') opciones[l] = `Opción ${l} de ${id}`;
  return {
    id,
    examen,
    curso,
    tema: `Tema ${i + 1}`,
    dificultad,
    enunciado: `[${id}] Enunciado de prueba número ${i + 1} sobre ${curso.toLowerCase()}, con texto suficiente para pasar de noventa caracteres en la revisión.`,
    opciones,
    correcta,
    explicacion: `Explicación de ${id}.`,
    ...(i % 2 === 0 ? { perla: `Perla de ${id}.` } : {}),
    ...(i % 3 === 0 ? { fuente: `Fuente de ${id}` } : {}),
  };
});

const porId = (id) => BANCO.find((q) => q.id === id);

module.exports = { BANCO, porId };
