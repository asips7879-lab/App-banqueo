// Utilidades generales: selección de elementos, escape de HTML, fechas locales (YYYY-MM-DD),
// barajado, formato del cronómetro y avisos (toasts).

const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => fmt(new Date());
const addDays = (s, n) => {
  const d = new Date(s + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return fmt(d);
};
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const LET = ['A', 'B', 'C', 'D', 'E'];
const clock = (ms) => {
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ':' + pad(s % 60);
};
function toast(m) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = m;
  $('#toasts').appendChild(d);
  setTimeout(() => d.remove(), 3200);
}

// Identificador único corto: prefijo + tiempo + azar (p. ej. "clz3k9a4f2q").
const nuevoId = (prefijo) => prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
