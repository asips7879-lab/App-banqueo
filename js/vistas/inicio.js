// Vista Inicio (#inicio): mascota, misiones del día y resumen.

function vInicio() {
  const li = levelInfo(S.xp),
    st = stageOf(li.l),
    md = mood(),
    d = S.daily,
    due = dueList().length;
  const msg = {
    feliz: '¡Listo para seguir sumando! Cada pregunta me hace crecer.',
    normal: 'Ayer no banqueamos… ¿empezamos con unas cuantas?',
    triste: 'Te extrañé. Diez preguntas hoy y vuelvo a sonreír.',
  }[md];
  const allDone = MIS.every((m) => d.claimed.includes(m.id));
  $('#view').innerHTML = `
 <section class="hero">
  <div><div class="small" style="opacity:.85;font-weight:800">${STAGES[st].n} · Nivel ${li.l}</div>
   <h1>${esc(S.name)}</h1><p>${msg}</p>
   <div class="bar" aria-label="Experiencia"><i style="width:${(li.r / li.need) * 100}%"></i></div>
   <p class="small">${li.r} / ${li.need} XP para el nivel ${li.l + 1}${st < 4 ? ' · evoluciona en el nivel ' + STAGES[st + 1].min : ''}</p>
   <div class="row"><a class="btn gold" href="#banquear" style="text-decoration:none">Banquear ahora</a>
   <a class="btn alt" href="#repaso" style="text-decoration:none;color:#fff">Repaso (${due})</a></div></div>
  ${mascot(st, S.equip, md)}
 </section>
 <div class="grid">
  <div class="card"><h2>Misiones de hoy</h2>
   ${MIS.map((m) => {
     const v = Math.min(m.v(d), m.g),
       done = v >= m.g,
       cl = d.claimed.includes(m.id);
     return `<div class="mission"><div class="t"><b>${m.t}</b><div class="bar" style="margin-top:6px"><i style="width:${(v / m.g) * 100}%"></i></div><span class="small mute">${v}/${m.g} · +${m.r} monedas</span></div>
    <button class="btn ${cl ? 'alt' : 'gold'}" data-claim="${m.id}" ${!done || cl ? 'disabled' : ''}>${cl ? 'Hecho' : 'Reclamar'}</button></div>`;
   }).join('')}
   <div class="mission"><div class="t"><b>Cofre del día</b><br><span class="small mute">Completa todas las misiones · +60 monedas</span></div>
   <button class="btn gold" data-claim="all" ${!allDone || d.claimed.includes('all') ? 'disabled' : ''}>${d.claimed.includes('all') ? 'Abierto' : 'Abrir'}</button></div>
  </div>
  <div class="card"><h2>Tu día</h2>
   <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center">
    <div><div class="stat">${d.n}</div><span class="small mute">respondidas</span></div>
    <div><div class="stat">${d.n ? Math.round((d.ok / d.n) * 100) : 0}%</div><span class="small mute">aciertos</span></div>
    <div><div class="stat">${streakNow()}</div><span class="small mute">días de racha</span></div></div>
   <p class="small mute" style="margin-top:14px">La racha suma un día cuando respondes 10 preguntas. Pendientes de repaso: <b>${due}</b>. Banco disponible: <b>${allQ().length}</b> preguntas.</p>
   <h3 class="sec">Cómo ganas</h3>
   <p class="small">Acierto fácil +3, media +5, difícil +8 monedas. Si marcas <b>“Seguro”</b> y aciertas, ganas ×1.5; si fallas estando seguro, la pregunta va primero a tu repaso como <b>error peligroso</b>. Cada 5 aciertos seguidos: +10.</p>
  </div>
 </div>`;
  document.querySelectorAll('[data-claim]').forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.claim;
        if (S.daily.claimed.includes(id)) return;
        S.daily.claimed.push(id);
        const r = id === 'all' ? 60 : MIS.find((m) => m.id === id).r;
        gain(r, 10);
        toast('+' + r + ' monedas');
        checkLog();
        save();
        route();
      }),
  );
}
