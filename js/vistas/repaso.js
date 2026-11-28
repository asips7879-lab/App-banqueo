// Vista Repaso (#repaso): preguntas pendientes del repaso espaciado.

function vRepaso() {
  if (Q && Q.mode === 'repaso' && !Q.finished) {
    location.hash = '#banquear';
    return;
  }
  const due = dueList(),
    all = Object.keys(S.srs).length,
    danger = due.filter((q) => S.srs[q.id].danger).length;
  $('#view').innerHTML = `<div class="card" style="max-width:720px;margin:auto"><h1>Repaso espaciado</h1>
 <p>Las preguntas que fallas vuelven hoy. Cada vez que las aciertas aquí, vuelven a los ${REPASO_DIAS.slice(0, -1).join(', ')} y ${REPASO_DIAS.at(-1)} días. Al acertarlas ${REPASO_DIAS.length + 1} veces seguidas, salen del repaso.</p>
 <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));text-align:center;margin:16px 0">
  <div><div class="stat">${due.length}</div><span class="small mute">para hoy</span></div>
  <div><div class="stat" style="color:var(--bad)">${danger}</div><span class="small mute">errores peligrosos</span></div>
  <div><div class="stat">${all}</div><span class="small mute">en seguimiento</span></div></div>
 <button class="btn" id="rgo" style="width:100%" ${due.length ? '' : 'disabled'}>${due.length ? 'Repasar ahora' : 'Nada pendiente por hoy'}</button><div id="r-aviso"></div>
 ${due.length ? `<h3 class="sec">Pendientes</h3>${due.map((q) => `<div class="mission"><div class="t">${esc(q.enunciado.slice(0, 100))}…<br><span class="tag">${esc(q.curso)}</span>${S.srs[q.id].danger ? '<span class="tag D">Peligroso</span>' : ''}</div></div>`).join('')}` : ''}</div>`;
  $('#rgo').onclick = () => empezarConAviso(due, 'repaso', $('#r-aviso'));
}
