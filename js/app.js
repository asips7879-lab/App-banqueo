// Arranque: navegación, encabezado, rutas por hash (#inicio, #banquear…) y atajos de teclado.
// Se carga al final, cuando ya existen todas las vistas.

const IC = {
  inicio: 'M3 11l9-8 9 8v10h-6v-6H9v6H3z',
  banquear: 'M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z M8 9h8 M8 13h6',
  repaso: 'M4 12a8 8 0 0114-5l2-2v6h-6l2-2a5 5 0 10.9 6',
  tienda: 'M4 8h16l-1 12H5z M8 8a4 4 0 018 0',
  progreso: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  ajustes: 'M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3',
};
const TABS = [
  ['inicio', 'Inicio'],
  ['banquear', 'Banquear'],
  ['repaso', 'Repaso'],
  ['tienda', 'Tienda'],
  ['progreso', 'Progreso'],
  ['ajustes', 'Ajustes'],
];
function renderNav(v) {
  $('#nav').innerHTML = TABS.map(
    ([id, n]) =>
      `<a href="#${id}" class="${v === id ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[id]}"/></svg>${n}</a>`,
  ).join('');
}
function header() {
  const li = levelInfo(S.xp);
  $('#h-lvl').textContent = 'Nv ' + li.l;
  $('#h-coins').textContent = S.coins;
}

function route() {
  const v = (location.hash || '#inicio').slice(1);
  const view = VIEWS[v] ? v : 'inicio';
  ensureDaily();
  renderNav(PESTANA_DE[view] || view);
  header();
  VIEWS[view]();
  window.scrollTo(0, 0);
}

const VIEWS = {
  inicio: vInicio,
  banquear: vBanquear,
  repaso: vRepaso,
  tienda: vTienda,
  progreso: vProgreso,
  ajustes: vAjustes,
  cuaderno: vCuaderno, // se entra desde Ajustes
};
// Vistas sin pestaña propia: qué pestaña queda marcada en la navegación.
const PESTANA_DE = { cuaderno: 'ajustes' };
window.addEventListener('hashchange', route);
document.addEventListener('keydown', (e) => {
  if (!Q || Q.finished || !$('#opts') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.toUpperCase();
  if (LET.includes(k)) pick(k);
  else if ('12345'.includes(k) && k) pick(LET[+k - 1]);
  else if (k === 'S') setConf(Q.conf === 'seguro' ? 'dudo' : 'seguro');
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (Q.sel) doConfirm();
  }
});
route();
