// Vista Ajustes (#ajustes): nombre de la mascota, copia de seguridad, preguntas propias y reinicio.

function vAjustes() {
  $('#view').innerHTML = `<h1>Ajustes</h1><div class="grid">
 <form class="card" id="fname"><h2>Tu mascota</h2><label for="mn">Nombre</label><input id="mn" value="${esc(S.name)}" maxlength="20"><button class="btn" style="margin-top:10px">Guardar</button></form>
 <div class="card"><h2>Copia de seguridad</h2><p class="small mute">Tu progreso vive en este navegador. Copia este texto para guardarlo o pasarlo a otro dispositivo, y pégalo abajo para restaurarlo.</p>
  <textarea id="bk" readonly>${esc(JSON.stringify(S))}</textarea><button class="btn alt" id="cp" style="margin-top:8px">Copiar</button>
  <label for="imp" style="margin-top:12px">Restaurar</label><textarea id="imp" placeholder="Pega aquí tu copia"></textarea><button class="btn" id="doimp" style="margin-top:8px">Restaurar progreso</button></div></div>
 <form class="card" id="fq" style="margin-top:14px"><h2>Agregar pregunta propia</h2><p class="small mute">Se guarda en este navegador. Para que quede en el banco oficial, pásamela en el chat.</p>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">
  <div><label>Examen</label><div class="row">${['ENAM', 'RM', 'Preinternado'].map((e) => `<label style="font-weight:600;display:flex;gap:6px;align-items:center"><input type="checkbox" name="ex" value="${e}" style="width:20px;min-height:20px" checked>${e}</label>`).join('')}</div></div>
  <div><label for="qc">Curso</label><input id="qc" required list="cursos"><datalist id="cursos">${[...new Set(allQ().map((q) => q.curso))].map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
  <div><label for="qt">Tema</label><input id="qt"></div>
  <div><label for="qd">Dificultad</label><select id="qd"><option>Fácil</option><option selected>Media</option><option>Difícil</option></select></div></div>
 <label for="qe" style="margin-top:10px">Enunciado</label><textarea id="qe" required></textarea>
 ${LET.map((l) => `<label for="q${l}" style="margin-top:8px">Opción ${l}</label><input id="q${l}" ${l < 'E' ? 'required' : ''}>`).join('')}
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));margin-top:8px"><div><label for="qk">Clave correcta</label><select id="qk">${LET.map((l) => `<option>${l}</option>`).join('')}</select></div><div><label for="qf">Fuente</label><input id="qf" placeholder="Ej.: ENAM 2024"></div></div>
 <label for="qx" style="margin-top:8px">Explicación</label><textarea id="qx" required></textarea>
 <label for="qp" style="margin-top:8px">Perla (opcional)</label><input id="qp">
 <button class="btn" style="margin-top:12px">Guardar pregunta</button>
 ${S.custom.length ? `<p class="small mute" style="margin-top:12px">Tienes ${S.custom.length} pregunta(s) propias. <button type="button" class="btn alt" id="cpq" style="min-height:36px;padding:4px 10px">Copiar para enviar a Claude</button></p>` : ''}</form>
 <div class="card" style="margin-top:14px"><h2>Zona peligrosa</h2><button class="btn red" id="rst">Borrar todo mi progreso</button><div id="rstc"></div></div>`;
  $('#fname').onsubmit = (e) => {
    e.preventDefault();
    S.name = $('#mn').value.trim() || 'Hemi';
    save();
    toast('Ahora se llama ' + S.name);
  };
  const copy = (txt) => {
    try {
      navigator.clipboard.writeText(txt).then(
        () => toast('Copiado'),
        () => toast('Selecciona y copia manualmente'),
      );
    } catch (e) {
      toast('Selecciona y copia manualmente');
    }
  };
  $('#cp').onclick = () => copy($('#bk').value);
  $('#doimp').onclick = () => {
    try {
      const o = JSON.parse($('#imp').value);
      if (typeof o !== 'object' || o.xp === undefined) throw 0;
      S = Object.assign(def(), o);
      save();
      toast('Progreso restaurado');
      route();
    } catch (e) {
      toast('Ese texto no es una copia válida');
    }
  };
  $('#fq').onsubmit = (e) => {
    e.preventDefault();
    const op = {};
    LET.forEach((l) => {
      const v = $('#q' + l).value.trim();
      if (v) op[l] = v;
    });
    if (!op[$('#qk').value]) {
      toast('La clave elegida no tiene texto');
      return;
    }
    S.custom.push({
      id: 'u' + Date.now(),
      examen: [...document.querySelectorAll('input[name=ex]:checked')].map((x) => x.value),
      curso: $('#qc').value.trim(),
      tema: $('#qt').value.trim(),
      dificultad: $('#qd').value,
      enunciado: $('#qe').value.trim(),
      opciones: op,
      correcta: $('#qk').value,
      explicacion: $('#qx').value.trim(),
      perla: $('#qp').value.trim(),
      fuente: $('#qf').value.trim() || 'Propia',
    });
    save();
    toast('Pregunta guardada');
    route();
  };
  if ($('#cpq')) $('#cpq').onclick = () => copy(JSON.stringify(S.custom, null, 1));
  $('#rst').onclick = () => {
    $('#rstc').innerHTML =
      '<p>Se perderán nivel, monedas, misiones y repaso. ¿Seguro?</p><button class="btn red" id="rsy">Sí, borrar</button>';
    $('#rsy').onclick = () => {
      const keep = S.custom;
      S = def();
      S.custom = keep;
      save();
      toast('Progreso reiniciado');
      location.hash = '#inicio';
      route();
    };
  };
}
