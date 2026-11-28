// Vista Ajustes (#ajustes): nombre de la mascota, copia de seguridad, Cuaderno de errores y reinicio.

function vAjustes() {
  $('#view').innerHTML = `<h1>Ajustes</h1><div class="grid">
 <form class="card" id="fname"><h2>Tu mascota</h2><label for="mn">Nombre</label><input id="mn" value="${esc(S.name)}" maxlength="20"><button class="btn" style="margin-top:10px">Guardar</button></form>
 <div class="card"><h2>Copia de seguridad</h2><p class="small mute">Tu progreso vive en este navegador. Copia este texto para guardarlo o pasarlo a otro dispositivo, y pégalo abajo para restaurarlo.</p>
  <textarea id="bk" readonly>${esc(JSON.stringify(S))}</textarea><button class="btn alt" id="cp" style="margin-top:8px">Copiar</button>
  <label for="imp" style="margin-top:12px">Restaurar</label><textarea id="imp" placeholder="Pega aquí tu copia"></textarea><button class="btn" id="doimp" style="margin-top:8px">Restaurar progreso</button></div></div>
 ${tarjetaCuaderno()}
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
      cargarEstado(o);
      save();
      toast('Progreso restaurado');
      route();
    } catch (e) {
      toast('Ese texto no es una copia válida');
    }
  };
  const repasoAjustes = listaRepasoCuaderno();
  $('#cu-repasar').disabled = !repasoAjustes.length;
  $('#cu-repasar').onclick = () => startQuiz(shuffle(repasoAjustes), 'cuaderno');
  $('#rst').onclick = () => {
    $('#rstc').innerHTML =
      '<p>Se perderán nivel, monedas, misiones y repaso. Tu cuaderno de errores se conserva. ¿Seguro?</p><button class="btn red" id="rsy">Sí, borrar</button>';
    $('#rsy').onclick = () => {
      const cuaderno = S.cuaderno;
      S = def();
      S.cuaderno = cuaderno;
      save();
      toast('Progreso reiniciado');
      location.hash = '#inicio';
      route();
    };
  };
}

// Tarjeta del Cuaderno de errores en Ajustes (antes "Agregar pregunta propia").
function tarjetaCuaderno() {
  const n = S.cuaderno.length,
    deBanco = S.cuaderno.filter((e) => e.origen === 'banco').length;
  return `<div class="card" id="cu-card" style="margin-top:14px"><h2>Cuaderno de errores</h2>
 <p class="small mute">Guarda preguntas del banco o de otras fuentes, con tu propia explicación, y repásalas junto con las que fallaste. Solo tú las ves.</p>
 <p><b>${n}</b> pregunta${n === 1 ? '' : 's'} guardada${n === 1 ? '' : 's'}${n ? ` (${deBanco} del banco · ${n - deBanco} externa${n - deBanco === 1 ? '' : 's'})` : ''}</p>
 <div class="row"><a class="btn" href="#cuaderno" style="text-decoration:none">Abrir mi cuaderno</a><button class="btn alt" id="cu-repasar">Repasar cuaderno</button></div></div>`;
}
