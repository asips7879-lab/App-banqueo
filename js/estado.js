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
  custom: [],
  logros: [],
  total: 0,
  ok: 0,
  hardOk: 0,
  course: {},
});
let S = def();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) S = Object.assign(def(), JSON.parse(raw));
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
};
const allQ = () => [...(window.PREGUNTAS || []), ...S.custom];

let Q = null; // sesión de preguntas activa
