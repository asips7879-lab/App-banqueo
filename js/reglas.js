// Reglas del juego: todos los valores ajustables están aquí.
//   REW / XPR  monedas y XP por acierto según dificultad
//   STAGES     etapas de la mascota y nivel en que se alcanzan
//   ACC        accesorios de la tienda y su precio
//   MIS        misiones diarias
//   LOG        logros
//   levelInfo  XP necesaria por nivel (100, 125, 150…)
//   REPASO_DIAS  días hasta la próxima vez que vuelve una pregunta del repaso tras cada acierto

const REW = { Fácil: 3, Media: 5, Difícil: 8 },
  XPR = { Fácil: 8, Media: 12, Difícil: 18 };
// Repaso espaciado: una pregunta fallada vuelve hoy; tras cada acierto en el repaso vuelve a los
// 1, 3, 7 y 15 días. Con un acierto más que intervalos (5 seguidos), sale del repaso.
const REPASO_DIAS = [1, 3, 7, 15];
// Simulacro: segundos por pregunta (tiempo total = SIM_SEGUNDOS × número de preguntas).
const SIM_SEGUNDOS = 72;
const STAGES = [
  { min: 1, n: 'Célula madre' },
  { min: 3, n: 'Reticulocito' },
  { min: 6, n: 'Interno' },
  { min: 10, n: 'Residente' },
  { min: 15, n: 'Especialista' },
];
const ACC = [
  { id: 'lentes', n: 'Lentes de lectura', c: 60 },
  { id: 'mascarilla', n: 'Mascarilla N95', c: 80 },
  { id: 'gorro', n: 'Gorro quirúrgico', c: 120 },
  { id: 'medalla', n: 'Medalla al mérito', c: 200 },
  { id: 'corona', n: 'Corona del primer puesto', c: 500 },
];
const MIS = [
  { id: 'm1', t: 'Responde 10 preguntas', g: 10, v: (d) => d.n, r: 30 },
  { id: 'm2', t: 'Acierta 7 preguntas', g: 7, v: (d) => d.ok, r: 40 },
  { id: 'm3', t: 'Encadena 5 aciertos seguidos', g: 5, v: (d) => d.run, r: 30 },
  { id: 'm4', t: 'Banquea 2 cursos distintos', g: 2, v: (d) => d.courses.length, r: 20 },
  { id: 'm5', t: 'Repasa 3 preguntas pendientes', g: 3, v: (d) => d.rev, r: 30 },
];
const levelInfo = (xp) => {
  let l = 1,
    need = 100,
    r = xp;
  while (r >= need) {
    r -= need;
    l++;
    need = 100 + (l - 1) * 25;
  }
  return { l, r, need };
};
const stageOf = (l) => {
  let i = 0;
  STAGES.forEach((s, k) => {
    if (l >= s.min) i = k;
  });
  return i;
};
const LOG = [
  { id: 'l1', n: 'Primera pregunta', d: 'Responde tu primera pregunta', f: () => S.total >= 1 },
  { id: 'l2', n: 'Banqueador', d: '100 preguntas respondidas', f: () => S.total >= 100 },
  { id: 'l3', n: 'Maratonista', d: '500 preguntas respondidas', f: () => S.total >= 500 },
  { id: 'l4', n: 'Constancia', d: 'Racha de 7 días', f: () => S.streak >= 7 },
  { id: 'l5', n: 'Imparable', d: '15 aciertos seguidos', f: () => S.bestRun >= 15 },
  { id: 'l6', n: 'Nivel 5', d: 'Llega al nivel 5', f: () => levelInfo(S.xp).l >= 5 },
  { id: 'l7', n: 'Cazador de difíciles', d: 'Acierta 10 preguntas difíciles', f: () => S.hardOk >= 10 },
  {
    id: 'l8',
    n: 'Ojo clínico',
    d: '80% de aciertos con 50+ respondidas',
    f: () => S.total >= 50 && S.ok / S.total >= 0.8,
  },
];
