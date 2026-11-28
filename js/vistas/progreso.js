// Vista Progreso (#progreso): estadísticas, aciertos por curso y logros.

function vProgreso() {
  const cs = Object.entries(S.course).sort((a, b) => b[1].n - a[1].n);
  $('#view').innerHTML =
    `<h1>Progreso</h1><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))">
 ${[
   [S.total, 'respondidas'],
   [S.total ? Math.round((S.ok / S.total) * 100) + '%' : '—', 'aciertos totales'],
   [S.bestRun, 'mejor racha de aciertos'],
   [streakNow(), 'días de racha'],
   [S.canjes.length, 'premios canjeados'],
 ]
   .map(
     ([v, l]) => `<div class="card"><div class="stat">${v}</div><span class="small mute">${l}</span></div>`,
   )
   .join('')}</div>
 <div class="grid" style="margin-top:14px"><div class="card"><h2>Aciertos por curso</h2>${
   cs.length
     ? cs
         .map(([c, v]) => {
           const p = Math.round((v.ok / v.n) * 100);
           return `<div class="hbar"><span class="small"><b>${esc(c)}</b><br><span class="mute">${v.n} resp.</span></span><div class="bar"><i style="width:${p}%;background:${p >= 70 ? 'var(--ok)' : p >= 50 ? 'var(--gold)' : 'var(--bad)'}"></i></div><span>${p}%</span></div>`;
         })
         .join('')
     : '<p class="mute">Aún no hay datos. Banquea unas preguntas y aquí verás tus fortalezas y debilidades.</p>'
 }</div>
 <div class="card"><h2>Logros</h2>${LOG.map((l) => {
   const g = S.logros.includes(l.id);
   return `<div class="logro ${g ? 'got' : ''}"><div class="ic">${g ? '★' : '·'}</div><div><b>${l.n}</b><br><span class="small mute">${l.d}${g ? '' : ' · +50 monedas'}</span></div></div>`;
 }).join('')}</div></div>`;
}
