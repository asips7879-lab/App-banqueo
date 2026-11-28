// Vista Banquear (#banquear): armar el banqueo, responder (práctica, simulacro y repaso) y resultados.

function vBanquear() {
  if (Q && !Q.finished) return renderQuiz();
  if (Q && Q.finished) return renderResults();
  const qs = allQ(),
    cursos = [...new Set(qs.map((q) => q.curso))].sort();
  $('#view').innerHTML = `<div class="card" style="max-width:720px;margin:auto"><h1>Arma tu banqueo</h1>
 <p class="mute">Elige qué quieres practicar. ${qs.length} preguntas en el banco.</p>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">
  <div><label for="f-ex">Examen</label><select id="f-ex"><option value="">Todos</option><option>ENAM</option><option>RM</option><option>Preinternado</option></select></div>
  <div><label for="f-cu">Curso</label><select id="f-cu"><option value="">Todos</option>${cursos.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
  <div><label for="f-di">Dificultad</label><select id="f-di"><option value="">Todas</option><option>Fácil</option><option>Media</option><option>Difícil</option></select></div>
  <div><label for="f-st">Estado</label><select id="f-st"><option value="">Todas</option><option value="new">No vistas</option><option value="bad">Falladas alguna vez</option></select></div>
  <div><label for="f-n">Cantidad</label><select id="f-n"><option>10</option><option>20</option><option>50</option><option value="9999">Todas</option></select></div>
  <div><label for="f-mo">Modo</label><select id="f-mo"><option value="practica">Práctica (explicación al instante)</option><option value="simulacro">Simulacro (cronometrado)</option></select></div>
 </div>
 <p class="small mute" id="f-count"></p>
 <button class="btn" id="go" style="width:100%">Empezar</button></div>`;
  const pool = () => {
    const ex = $('#f-ex').value,
      cu = $('#f-cu').value,
      di = $('#f-di').value,
      st = $('#f-st').value;
    return qs.filter(
      (q) =>
        (!ex || (q.examen || []).includes(ex)) &&
        (!cu || q.curso === cu) &&
        (!di || q.dificultad === di) &&
        (!st || (st === 'new' ? !S.ans[q.id] : S.ans[q.id] && S.ans[q.id].ok < S.ans[q.id].n)),
    );
  };
  const upd = () => {
    const n = pool().length;
    $('#f-count').textContent = n + ' preguntas coinciden';
    $('#go').disabled = !n;
  };
  ['f-ex', 'f-cu', 'f-di', 'f-st'].forEach((id) => ($('#' + id).onchange = upd));
  upd();
  $('#go').onclick = () => startQuiz(shuffle(pool()).slice(0, +$('#f-n').value), $('#f-mo').value);
}
function startQuiz(list, mode) {
  if (!list.length) return;
  if (Q) clearInterval(Q.tick);
  Q = {
    list,
    mode,
    i: 0,
    sel: null,
    conf: 'dudo',
    shown: false,
    res: [],
    coins0: S.coins,
    xp0: S.xp,
    finished: false,
  };
  if (mode === 'simulacro') {
    Q.end = Date.now() + list.length * 72000;
    Q.tick = setInterval(() => {
      const t = $('#timer');
      if (!t) return;
      const left = Q.end - Date.now();
      if (left <= 0) {
        finishQuiz();
      } else t.textContent = clock(left);
    }, 1000);
  }
  location.hash = '#banquear';
  route();
}
function renderQuiz() {
  const q = Q.list[Q.i],
    sim = Q.mode === 'simulacro',
    dc = (q.dificultad || 'M')[0];
  $('#view').innerHTML = `<div class="card" style="max-width:780px;margin:auto">
 <div class="row" style="justify-content:space-between"><b>${{ repaso: 'Repaso', simulacro: 'Simulacro', cuaderno: 'Cuaderno' }[Q.mode] || 'Práctica'} · ${Q.i + 1}/${Q.list.length}</b>
 ${sim ? `<span class="pill" style="background:var(--line)" id="timer">${clock(Q.end - Date.now())}</span>` : ''}
 <button class="btn alt" id="quit" style="min-height:38px;padding:6px 12px">Terminar</button></div>
 <div class="bar" style="margin:10px 0"><i style="width:${(Q.i / Q.list.length) * 100}%"></i></div>
 <span class="tag">${esc(q.curso)}</span><span class="tag ${dc}">${esc(q.dificultad)}</span>${(q.examen || []).map((e) => `<span class="tag">${esc(e)}</span>`).join('')}${S.srs[q.id] && S.srs[q.id].danger ? '<span class="tag D">Error peligroso</span>' : ''}
 <div class="q">${esc(q.enunciado)}</div>
 <div id="opts">${LET.filter((l) => q.opciones[l])
   .map((l) => `<button class="opt" data-l="${l}"><b>${l}</b><span>${esc(q.opciones[l])}</span></button>`)
   .join('')}</div>
 <div class="row" style="justify-content:space-between;margin-top:6px" id="ctl">
  <div class="conf" role="group" aria-label="Confianza"><button data-c="dudo" class="on">Dudo</button><button data-c="seguro">Seguro</button></div>
  <button class="btn" id="ok" disabled>${sim ? 'Responder' : 'Confirmar'}</button></div>
 <div id="fb"></div><p class="kbd hide-s">Atajos: A–E o 1–5 para elegir · S para “Seguro” · Enter para confirmar / siguiente</p></div>`;
  Q.sel = null;
  Q.conf = 'dudo';
  Q.shown = false;
  document.querySelectorAll('.opt').forEach((b) => (b.onclick = () => pick(b.dataset.l)));
  document.querySelectorAll('.conf button').forEach((b) => (b.onclick = () => setConf(b.dataset.c)));
  $('#ok').onclick = doConfirm;
  $('#quit').onclick = finishQuiz;
}
function pick(l) {
  if (Q.shown || !Q.list[Q.i].opciones[l]) return;
  Q.sel = l;
  document.querySelectorAll('.opt').forEach((b) => b.classList.toggle('sel', b.dataset.l === l));
  $('#ok').disabled = false;
}
function setConf(c) {
  if (Q.shown) return;
  Q.conf = c;
  document.querySelectorAll('.conf button').forEach((b) => b.classList.toggle('on', b.dataset.c === c));
}
function doConfirm() {
  if (!Q.sel) return;
  if (Q.shown) return next();
  const q = Q.list[Q.i],
    ok = Q.sel === q.correcta;
  // Las preguntas externas del cuaderno no dan monedas ni XP, ni cuentan en estadísticas o repaso.
  if (!q.externa) record(q, Q.sel, Q.conf, Q.mode);
  Q.res.push({ q, sel: Q.sel, ok, conf: Q.conf });
  if (Q.mode === 'simulacro') return next();
  Q.shown = true;
  document.querySelectorAll('.opt').forEach((b) => {
    if (b.dataset.l === q.correcta) b.classList.add('ok');
    else if (b.dataset.l === Q.sel) b.classList.add('bad');
  });
  $('#fb').innerHTML = fbHtml(q, ok, Q.conf);
  $('#ok').textContent = Q.i + 1 < Q.list.length ? 'Siguiente' : 'Ver resultados';
  document.querySelector('.conf').style.visibility = 'hidden';
  header();
  $('#fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function fbHtml(q, ok, conf) {
  const e = entradaDe(q),
    nota = e && e.nota,
    peligro = !ok && conf === 'seguro' && !q.externa;
  const mia = nota ? `<div class="mia"><b>Tu explicación</b><div>${esc(nota)}</div></div>` : '';
  const oficial = q.externa
    ? nota
      ? ''
      : '<div class="mute">Todavía no tiene explicación.</div>'
    : nota
      ? `<div class="oficial"><b>Explicación de la app</b><div>${esc(q.explicacion)}</div></div>`
      : `<div>${esc(q.explicacion)}</div>`;
  return `<div class="fb ${ok ? 'ok' : 'bad'}"><h3>${ok ? '¡Correcto!' : 'Incorrecto · la respuesta es ' + q.correcta}${ok && conf === 'seguro' ? ' · bono de seguridad ×1.5' : ''}${peligro ? ' · error peligroso, irá primero a tu repaso' : ''}</h3>
 ${mia}${oficial}${q.perla ? `<div class="perla">Perla: ${esc(q.perla)}</div>` : ''}${q.fuente ? `<p class="small mute" style="margin:8px 0 0">Fuente: ${esc(q.fuente)}</p>` : ''}</div>`;
}
function next() {
  if (Q.i + 1 < Q.list.length) {
    Q.i++;
    renderQuiz();
  } else finishQuiz();
}
function finishQuiz() {
  if (!Q) return;
  clearInterval(Q.tick);
  if (!Q.res.length) {
    Q = null;
    return route();
  }
  Q.finished = true;
  save();
  location.hash = '#banquear';
  route();
}
function renderResults() {
  const n = Q.res.length,
    ok = Q.res.filter((r) => r.ok).length,
    pct = Math.round((ok / n) * 100),
    md = pct >= 70 ? 'feliz' : pct >= 40 ? 'normal' : 'triste',
    alRepaso = Q.res.filter((r) => !r.ok && !r.q.externa).length;
  $('#view').innerHTML = `<div class="card" style="max-width:780px;margin:auto">
 <div class="row" style="gap:18px"><div style="width:140px">${mascot(stageOf(levelInfo(S.xp).l), S.equip, md, 'hop')}</div>
 <div><h1>${ok}/${n} correctas · ${pct}%</h1><p class="mute">+${S.coins - Q.coins0} monedas · +${S.xp - Q.xp0} XP${alRepaso ? ' · ' + alRepaso + ' preguntas pasan a tu repaso' : ''}</p>
 <div class="row"><button class="btn" id="again">Nuevo banqueo</button><a class="btn alt" href="#inicio" style="text-decoration:none">Ver misiones</a></div></div></div>
 <h2 class="sec">Revisión</h2><div id="revision">${Q.res
   .map(
     (
       r,
       i,
     ) => `<div class="rev-item"><details ${!r.ok && Q.mode === 'simulacro' ? 'open' : ''}><summary><b style="color:${r.ok ? 'var(--ok)' : 'var(--bad)'}">${r.ok ? '✓' : '✗'}</b> ${i + 1}. ${esc(r.q.enunciado.slice(0, 90))}${r.q.enunciado.length > 90 ? '…' : ''}</summary>
 <p class="small">Tu respuesta: <b>${r.sel}</b> · Correcta: <b>${r.q.correcta}) ${esc(r.q.opciones[r.q.correcta])}</b></p><div class="rev-fb">${fbHtml(r.q, r.ok, r.conf)}</div></details>
 <div class="cu-panel" data-i="${i}">${panelCuaderno(r)}</div></div>`,
   )
   .join('')}</div></div>`;
  $('#again').onclick = () => {
    Q = null;
    route();
  };
  $('#revision').onclick = (ev) => accionCuadernoEnResultados(ev);
}

// Estado del cuaderno bajo cada pregunta de la revisión.
function panelCuaderno(r) {
  const e = entradaDe(r.q);
  if (!e) return '<button class="btn alt mini" data-cu="agregar">¿Agregar al cuaderno de errores?</button>';
  return `<p class="small cu-ok">✓ En tu cuaderno de errores${e.nota ? ' · con tu explicación' : ''}</p>
 <button class="btn alt mini" data-cu="editar">${e.nota ? 'Editar mi explicación' : 'Añadir premisa extra'}</button>`;
}

// Botones del cuaderno en la revisión: agregar → ¿premisa extra? → editar y guardar.
function accionCuadernoEnResultados(ev) {
  const b = ev.target.closest('button[data-cu], button[data-nota]');
  if (!b) return;
  const panel = b.closest('.cu-panel'),
    r = Q.res[+panel.dataset.i];
  const repintar = () => {
    panel.innerHTML = panelCuaderno(r);
    panel.closest('.rev-item').querySelector('.rev-fb').innerHTML = fbHtml(r.q, r.ok, r.conf);
  };
  const accion = b.dataset.cu || b.dataset.nota;
  if (accion === 'agregar') {
    agregarAlCuaderno(r.q, { miRespuesta: r.sel, acerto: r.ok });
    toast('Agregada a tu cuaderno de errores');
    panel.innerHTML = `<p class="small cu-ok">✓ Agregada a tu cuaderno de errores</p>
 <p class="small" style="margin:6px 0"><b>¿Quieres añadir alguna premisa extra a la explicación?</b></p>
 <div class="row"><button class="btn mini" data-cu="editar">Sí, editarla</button><button class="btn alt mini" data-cu="listo">No, dejar la explicación de la app</button></div>`;
  } else if (accion === 'editar') {
    panel.innerHTML = htmlEditorNota(entradaDe(r.q));
    panel.querySelector('textarea').focus();
  } else if (accion === 'guardar') {
    guardarNota(entradaDe(r.q), panel.querySelector('textarea').value);
    toast('Tu explicación quedó guardada');
    repintar();
  } else {
    repintar(); // "listo" o "cancelar": queda guardada con la explicación que ya tenía
  }
}
