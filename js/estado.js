// Estado guardado del usuario (localStorage) y sesión de preguntas activa.
// Todo cambio del progreso pasa por save(). En la fase 5 este archivo se conectará a la nube.

const KEY = 'banqueo-jorg-v1';
const def = () => ({
  xp: 0,
  coins: 0,
  name: 'Hemi',
  ans: {},
  srs: {},
  daily: {},
  run: 0,
  bestRun: 0,
  streak: 0,
  lastDay: '',
  lastAct: '',
  owned: [],
  equip: [],
  premios: [
    { id: 'p1', nombre: 'Un episodio de mi serie', costo: 150 },
    { id: 'p2', nombre: 'Mi postre favorito', costo: 300 },
  ],
  canjes: [],
  cuaderno: [], // Cuaderno de errores (ver js/cuaderno.js)
  logros: [],
  total: 0,
  ok: 0,
  hardOk: 0,
  course: {},
});
let S = def();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
};

// Banco oficial. Solo el moderador lo cambia (en preguntas.js); los estudiantes no agregan preguntas.
const allQ = () => [...(window.PREGUNTAS || [])];

// Carga un progreso (del navegador o de una copia de seguridad) y completa lo que falte.
// Devuelve true si hubo que adaptarlo desde una versión anterior.
function cargarEstado(guardado) {
  S = Object.assign(def(), guardado);
  return migrar();
}

// Adapta progresos guardados con versiones anteriores de la app.
function migrar() {
  let cambio = false;
  if (!Array.isArray(S.cuaderno)) {
    S.cuaderno = [];
    cambio = true;
  }
  // Versión 1: las "preguntas propias" (S.custom) pasan al Cuaderno de errores como preguntas externas.
  if ('custom' in S) {
    for (const q of Array.isArray(S.custom) ? S.custom : []) {
      S.cuaderno.push({
        id: nuevoId('c'),
        origen: 'externa',
        pregunta: {
          curso: q.curso || '',
          tema: q.tema || '',
          dificultad: q.dificultad || 'Media',
          enunciado: q.enunciado || '',
          opciones: { ...(q.opciones || {}) },
          correcta: q.correcta,
          perla: q.perla || '',
          fuente: q.fuente || '',
        },
        nota: q.explicacion || '',
        fecha: today(),
        archivada: false,
      });
    }
    delete S.custom;
    cambio = true;
  }
  return cambio;
}

try {
  const raw = localStorage.getItem(KEY);
  if (raw && cargarEstado(JSON.parse(raw))) save();
} catch (e) {}

let Q = null; // sesión de preguntas activa
