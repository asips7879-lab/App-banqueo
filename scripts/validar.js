// Validador del banco de preguntas.
//
//   npm run validar                    → revisa preguntas.js
//   node scripts/validar.js otro.js    → revisa otro archivo con el mismo formato
//
// Muestra un resumen por curso y dificultad, los AVISOS (no impiden usar la app)
// y los ERRORES (hay que corregirlos). Termina con código 1 si hay errores.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const EXAMENES = ['ENAM', 'RM', 'Preinternado'];
const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];
const LETRAS = ['A', 'B', 'C', 'D', 'E'];
const OBLIGATORIAS = ['A', 'B', 'C', 'D'];
const CAMPOS = ['id', 'ejemplo', 'examen', 'curso', 'tema', 'dificultad', 'enunciado', 'opciones', 'correcta', 'explicacion', 'perla', 'fuente'];

// "Pediatría " → "pediatria": para comparar sin tildes, mayúsculas ni espacios sobrantes.
const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

// Distancia de edición (cuántas letras cambiar, quitar o poner para pasar de a a b).
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

// Propone el valor válido más parecido: igual sin tildes/mayúsculas, o a 1–2 letras de distancia.
function sugerir(valor, validos) {
  const v = normalizar(valor);
  if (!v) return undefined;
  const igual = validos.find((x) => normalizar(x) === v);
  if (igual) return igual;
  const tope = v.length >= 6 ? 2 : 1;
  const [mejor] = validos
    .map((x) => [x, distancia(v, normalizar(x))])
    .filter(([, dist]) => dist <= tope)
    .sort((a, b) => a[1] - b[1]);
  return mejor && mejor[0];
}

// Ejecuta el archivo en un entorno aislado y devuelve window.PREGUNTAS.
function cargarBanco(ruta) {
  const nombre = path.basename(ruta);
  const codigo = fs.readFileSync(ruta, 'utf8');
  const entorno = { window: {} };
  try {
    new vm.Script(codigo, { filename: nombre }).runInNewContext(entorno, { timeout: 2000 });
  } catch (e) {
    const linea = (String(e.stack).match(new RegExp(nombre.replace(/\./g, '\\.') + ':(\\d+)')) || [])[1];
    const pista = /Unexpected|missing|Invalid or unexpected/i.test(e.message)
      ? ' Suele ser una coma que falta entre dos campos o entre dos preguntas, o unas comillas sin cerrar.'
      : '';
    throw new Error(`${nombre} no se puede leer${linea ? ` (cerca de la línea ${linea})` : ''}: ${e.message}.${pista}`);
  }
  return entorno.window.PREGUNTAS;
}

function validar(preguntas) {
  const errores = [];
  const avisos = [];
  if (!Array.isArray(preguntas)) {
    errores.push('El archivo debe definir window.PREGUNTAS = [ ... ] (una lista de preguntas).');
    return { errores, avisos, resumen: null };
  }

  const ids = new Map(); // id → nº de pregunta
  const enunciados = new Map(); // enunciado normalizado → nº de pregunta
  const cursos = new Map(); // curso normalizado → Map(forma escrita → cantidad)

  preguntas.forEach((q, i) => {
    const n = i + 1;
    const donde = `Pregunta ${n}${q && typeof q.id === 'string' && q.id ? ` (${q.id})` : ''}`;
    const error = (m) => errores.push(`${donde}: ${m}`);
    const aviso = (m) => avisos.push(`${donde}: ${m}`);

    if (!q || typeof q !== 'object' || Array.isArray(q)) return error('no tiene el formato { ... }.');

    Object.keys(q).filter((k) => !CAMPOS.includes(k)).forEach((k) => {
      const s = sugerir(k, CAMPOS);
      aviso(`el campo "${k}" no se usa${s ? ` (¿quisiste decir "${s}"?)` : ''}.`);
    });

    // id
    if (typeof q.id !== 'string' || !q.id.trim()) error('falta "id" (por ejemplo "ped-001").');
    else if (ids.has(q.id)) error(`el id "${q.id}" ya lo usa la pregunta ${ids.get(q.id)}. Cada id debe ser único.`);
    else ids.set(q.id, n);

    // examen
    if (!Array.isArray(q.examen) || !q.examen.length) {
      error(`"examen" debe ser una lista con al menos uno de: ${EXAMENES.map((e) => `"${e}"`).join(', ')}.`);
    } else {
      q.examen.filter((e) => !EXAMENES.includes(e)).forEach((e) => {
        const s = sugerir(e, EXAMENES);
        error(`el examen "${e}" no es válido${s ? ` (¿quisiste decir "${s}"?)` : ''}. Usa: ${EXAMENES.join(', ')}.`);
      });
    }

    // curso
    if (typeof q.curso !== 'string' || !q.curso.trim()) {
      error('falta "curso".');
    } else {
      const k = normalizar(q.curso);
      if (!cursos.has(k)) cursos.set(k, new Map());
      const formas = cursos.get(k);
      formas.set(q.curso, (formas.get(q.curso) || 0) + 1);
    }

    // dificultad
    if (q.dificultad === undefined || q.dificultad === '') {
      error(`falta "dificultad": "Fácil", "Media" o "Difícil".`);
    } else if (!DIFICULTADES.includes(q.dificultad)) {
      const s = sugerir(q.dificultad, DIFICULTADES);
      error(`la dificultad "${q.dificultad}" no es válida${s ? ` (¿quisiste decir "${s}"?)` : ''}. Usa exactamente "Fácil", "Media" o "Difícil", con tilde.`);
    }

    // enunciado
    if (typeof q.enunciado !== 'string' || !q.enunciado.trim()) {
      error('falta "enunciado".');
    } else {
      const k = normalizar(q.enunciado);
      if (enunciados.has(k)) aviso(`el enunciado es igual al de la pregunta ${enunciados.get(k)}.`);
      else enunciados.set(k, n);
    }

    // opciones y clave
    const op = q.opciones;
    if (!op || typeof op !== 'object' || Array.isArray(op)) {
      error('"opciones" debe tener la forma { A: "...", B: "...", C: "...", D: "..." } (E es opcional).');
    } else {
      OBLIGATORIAS.forEach((l) => {
        if (typeof op[l] !== 'string' || !op[l].trim()) error(`falta el texto de la opción ${l}.`);
      });
      if (op.E !== undefined && (typeof op.E !== 'string' || !op.E.trim())) error('la opción E está vacía: quítala o escríbele texto.');
      Object.keys(op).filter((l) => !LETRAS.includes(l)).forEach((l) => error(`la opción "${l}" no es válida; solo se usan A, B, C, D y E.`));

      if (typeof q.correcta !== 'string' || !LETRAS.includes(q.correcta)) {
        const s = typeof q.correcta === 'string' && LETRAS.includes(q.correcta.trim().toUpperCase()) ? q.correcta.trim().toUpperCase() : null;
        error(q.correcta === undefined
          ? 'falta "correcta" (la clave: una letra de A a E).'
          : `"correcta" debe ser una letra mayúscula de A a E (dice "${q.correcta}")${s ? `; ¿quisiste decir "${s}"?` : '.'}`);
      } else if (typeof op[q.correcta] !== 'string' || !op[q.correcta].trim()) {
        error(`la clave es ${q.correcta}, pero esa opción no existe o está vacía.`);
      }
    }

    // explicación y campos opcionales
    if (typeof q.explicacion !== 'string' || !q.explicacion.trim()) aviso('todavía no tiene explicación.');
    ['tema', 'perla', 'fuente'].forEach((c) => {
      if (q[c] !== undefined && typeof q[c] !== 'string') error(`"${c}" debe ser texto entre comillas.`);
    });
  });

  cursos.forEach((formas) => {
    if (formas.size > 1) {
      avisos.push(`El mismo curso está escrito de varias formas: ${[...formas].map(([f, c]) => `"${f}" (${c})`).join(', ')}. Usa siempre la misma para que el filtro las agrupe.`);
    }
  });

  // Resumen por curso y dificultad
  const porCurso = {};
  preguntas.forEach((q) => {
    if (!q || typeof q !== 'object') return;
    const c = typeof q.curso === 'string' && q.curso.trim() ? q.curso : '(sin curso)';
    const fila = (porCurso[c] ||= { 'Fácil': 0, Media: 0, 'Difícil': 0, otra: 0, total: 0 });
    fila[DIFICULTADES.includes(q.dificultad) ? q.dificultad : 'otra']++;
    fila.total++;
  });
  const ejemplos = preguntas.filter((q) => q && q.ejemplo === true).length;

  return { errores, avisos, resumen: { total: preguntas.length, ejemplos, porCurso } };
}

function imprimirResumen({ total, ejemplos, porCurso }) {
  const filas = Object.entries(porCurso).sort(([a], [b]) => a.localeCompare(b, 'es'));
  const ancho = Math.max(5, ...filas.map(([c]) => c.length));
  const hayOtra = filas.some(([, f]) => f.otra);
  const cols = ['Fácil', 'Media', 'Difícil', ...(hayOtra ? ['otra'] : []), 'total'];
  const linea = (nombre, valores) => '  ' + nombre.padEnd(ancho) + valores.map((v) => String(v).padStart(9)).join('');

  console.log(`\nBanco de preguntas: ${total} pregunta${total === 1 ? '' : 's'}` +
    (ejemplos ? ` (${ejemplos} de ejemplo: bórralas cuando tengas las tuyas)` : '') + '\n');
  console.log(linea('Curso', cols.map((c) => (c === 'total' ? 'Total' : c === 'otra' ? '¿?' : c))));
  filas.forEach(([c, f]) => console.log(linea(c, cols.map((k) => f[k]))));
  const tot = Object.fromEntries(cols.map((k) => [k, filas.reduce((s, [, f]) => s + f[k], 0)]));
  console.log(linea('Total', cols.map((k) => tot[k])) + '\n');
}

if (require.main === module) {
  const ruta = path.resolve(process.argv[2] || path.join(__dirname, '..', 'preguntas.js'));
  let preguntas;
  try {
    preguntas = cargarBanco(ruta);
  } catch (e) {
    console.error('ERROR: ' + e.message);
    process.exit(1);
  }
  const { errores, avisos, resumen } = validar(preguntas);
  if (resumen) imprimirResumen(resumen);
  avisos.forEach((a) => console.log('AVISO: ' + a));
  errores.forEach((e) => console.log('ERROR: ' + e));
  if (avisos.length || errores.length) console.log('');
  if (errores.length) {
    console.log(`Hay ${errores.length} error${errores.length === 1 ? '' : 'es'} que corregir.`);
    process.exit(1);
  }
  console.log(`Todo bien${avisos.length ? ` (${avisos.length} aviso${avisos.length === 1 ? '' : 's'})` : ''}.`);
}

module.exports = { validar, cargarBanco, EXAMENES, DIFICULTADES };
