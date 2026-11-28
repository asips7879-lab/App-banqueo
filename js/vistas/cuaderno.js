// Vista Cuaderno de errores (#cuaderno). Se entra desde Ajustes.
// Lista lo guardado (filtrar, buscar, editar la explicación, archivar, quitar),
// permite repasarlo junto con las falladas del banco y anotar preguntas externas.

// Filtros de la vista (se conservan mientras la app está abierta).
const cuFiltro = { curso: '', texto: '', archivadas: false, incluirFalladas: true };

const sinTildes = (t) =>
  String(t || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function entradasFiltradas() {
  const buscado = sinTildes(cuFiltro.texto.trim());
  return S.cuaderno
    .filter((e) => cuFiltro.archivadas || !e.archivada)
    .filter((e) => !cuFiltro.curso || e.pregunta.curso === cuFiltro.curso)
    .filter((e) => {
      if (!buscado) return true;
      const q = preguntaDeEntrada(e);
      return sinTildes(
        [q.enunciado, q.tema, q.curso, e.nota, ...Object.values(q.opciones || {})].join(' '),
      ).includes(buscado);
    })
    .reverse(); // lo más reciente primero
}

function htmlEntrada(e) {
  const q = preguntaDeEntrada(e);
  const corto = q.enunciado.length > 140 ? q.enunciado.slice(0, 140) + '…' : q.enunciado;
  return `<details class="card entrada" data-id="${e.id}">
 <summary><span class="tag">${esc(q.curso)}</span>${q.dificultad ? `<span class="tag ${esc(q.dificultad[0])}">${esc(q.dificultad)}</span>` : ''}<span class="tag">${e.origen === 'banco' ? 'Del banco' : 'Externa'}</span>${e.archivada ? '<span class="tag">Archivada</span>' : ''}${e.nota ? '<span class="tag nota">Con tu explicación</span>' : ''}
 <div class="cu-enun">${esc(corto)}</div></summary>
 <div class="q">${esc(q.enunciado)}</div>
 <ul class="cu-ops">${LET.filter((l) => q.opciones[l])
   .map(
     (l) =>
       `<li class="${l === q.correcta ? 'ok' : l === e.miRespuesta ? 'bad' : ''}"><b>${l}</b> ${esc(q.opciones[l])}${l === q.correcta ? ' ✓' : ''}</li>`,
   )
   .join('')}</ul>
 <p class="small mute">${e.miRespuesta ? `Respondiste ${e.miRespuesta} (${e.acerto ? 'correcta' : 'incorrecta'}) · ` : ''}Guardada el ${e.fecha}${q.fuente ? ' · Fuente: ' + esc(q.fuente) : ''}</p>
 <div class="cu-expl">${htmlExplicaciones(e)}</div>
 ${q.perla ? `<div class="perla">Perla: ${esc(q.perla)}</div>` : ''}
 <div class="row cu-acciones"><button class="btn alt mini" data-accion="editar">${e.nota ? 'Editar mi explicación' : 'Añadir mi explicación'}</button><button class="btn alt mini" data-accion="archivar">${e.archivada ? 'Volver a repasar' : 'Ya lo domino'}</button><button class="btn alt mini" data-accion="quitar">Quitar</button></div>
 <div class="cu-extra"></div>
</details>`;
}

function vCuaderno() {
  const total = S.cuaderno.length,
    deBanco = S.cuaderno.filter((e) => e.origen === 'banco').length,
    archivadas = S.cuaderno.filter((e) => e.archivada).length,
    cursosCuaderno = [...new Set(S.cuaderno.map((e) => e.pregunta.curso))].filter(Boolean).sort(),
    cursosTodos = [...new Set([...allQ().map((q) => q.curso), ...cursosCuaderno])].sort();
  if (cuFiltro.curso && !cursosCuaderno.includes(cuFiltro.curso)) cuFiltro.curso = '';

  $('#view').innerHTML =
    `<p style="margin:0 0 8px"><a href="#ajustes" class="small" style="color:var(--teal);font-weight:800">← Ajustes</a></p>
 <h1>Cuaderno de errores</h1>
 <p class="mute">Preguntas que guardaste del banco o de otras fuentes, con tu propia explicación. Solo tú las ves.</p>
 <div class="card">
  <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center">
   <div><div class="stat">${total}</div><span class="small mute">guardadas</span></div>
   <div><div class="stat">${deBanco}</div><span class="small mute">del banco</span></div>
   <div><div class="stat">${total - deBanco}</div><span class="small mute">externas</span></div></div>
  <label class="chk" style="margin-top:14px"><input type="checkbox" id="cu-fall" ${cuFiltro.incluirFalladas ? 'checked' : ''}> Incluir las preguntas del banco que fallaste alguna vez (${falladasFueraDelCuaderno().length})</label>
  <button class="btn" id="cu-go" style="width:100%;margin-top:12px"></button><div id="cu-go-aviso"></div></div>
 <h2 class="sec">Mis preguntas</h2>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));margin-bottom:12px">
  <div><label for="cu-cu">Curso</label><select id="cu-cu"><option value="">Todos</option>${cursosCuaderno.map((c) => `<option ${c === cuFiltro.curso ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
  <div><label for="cu-tx">Buscar</label><input id="cu-tx" type="search" placeholder="Palabra del enunciado o de tu explicación" value="${esc(cuFiltro.texto)}"></div>
  <div style="align-self:end"><label class="chk"><input type="checkbox" id="cu-arch" ${cuFiltro.archivadas ? 'checked' : ''}> Ver archivadas (${archivadas})</label></div></div>
 <div id="cu-lista"></div>
 <details class="card" id="cu-nueva" style="margin-top:14px"><summary><b>Anotar una pregunta externa</b> <span class="small mute">(de un simulacro, otro banco o un examen pasado)</span></summary>
 <form id="cu-form" style="margin-top:12px">
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">
   <div><label for="ce-curso">Curso</label><input id="ce-curso" required list="ce-cursos"><datalist id="ce-cursos">${cursosTodos.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
   <div><label for="ce-tema">Tema</label><input id="ce-tema"></div>
   <div><label for="ce-dif">Dificultad</label><select id="ce-dif"><option>Fácil</option><option selected>Media</option><option>Difícil</option></select></div></div>
  <label for="ce-enun" style="margin-top:10px">Enunciado</label><textarea id="ce-enun" required></textarea>
  ${LET.map((l) => `<label for="ce-${l}" style="margin-top:8px">Opción ${l}${l === 'E' ? ' (opcional)' : ''}</label><input id="ce-${l}" ${l < 'E' ? 'required' : ''}>`).join('')}
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));margin-top:8px">
   <div><label for="ce-clave">Respuesta correcta</label><select id="ce-clave">${LET.map((l) => `<option>${l}</option>`).join('')}</select></div>
   <div><label for="ce-fuente">Fuente</label><input id="ce-fuente" placeholder="Ej.: Simulacro externo 2025"></div></div>
  <label for="ce-nota" style="margin-top:8px">Tu explicación (opcional)</label><textarea id="ce-nota" placeholder="¿Por qué es esa la respuesta? Escríbelo como tú lo entiendas."></textarea>
  <button class="btn" style="margin-top:12px">Guardar en mi cuaderno</button>
 </form></details>`;

  const pintarLista = () => {
    const lista = entradasFiltradas();
    $('#cu-lista').innerHTML = lista.length
      ? lista.map(htmlEntrada).join('')
      : `<p class="mute">${total ? 'Ninguna pregunta coincide con los filtros.' : 'Todavía no guardas preguntas. Al terminar un banqueo, usa “¿Agregar al cuaderno de errores?” en la revisión, o anota aquí abajo una pregunta externa.'}</p>`;
  };
  const pintarBoton = () => {
    const n = listaRepasoCuaderno({
      curso: cuFiltro.curso,
      incluirFalladas: cuFiltro.incluirFalladas,
    }).length;
    $('#cu-go').textContent = n
      ? `Repasar cuaderno (${n} pregunta${n === 1 ? '' : 's'})`
      : 'Nada que repasar todavía';
    $('#cu-go').disabled = !n;
  };
  pintarLista();
  pintarBoton();

  $('#cu-cu').onchange = () => {
    cuFiltro.curso = $('#cu-cu').value;
    pintarLista();
    pintarBoton();
  };
  $('#cu-tx').oninput = () => {
    cuFiltro.texto = $('#cu-tx').value;
    pintarLista();
  };
  $('#cu-arch').onchange = () => {
    cuFiltro.archivadas = $('#cu-arch').checked;
    pintarLista();
  };
  $('#cu-fall').onchange = () => {
    cuFiltro.incluirFalladas = $('#cu-fall').checked;
    pintarBoton();
  };
  $('#cu-go').onclick = () =>
    empezarConAviso(
      shuffle(listaRepasoCuaderno({ curso: cuFiltro.curso, incluirFalladas: cuFiltro.incluirFalladas })),
      'cuaderno',
      $('#cu-go-aviso'),
    );

  // Acciones de cada entrada: editar explicación, archivar, quitar.
  $('#cu-lista').onclick = (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const caja = b.closest('.entrada'),
      e = entradaPorId(caja.dataset.id),
      extra = caja.querySelector('.cu-extra');
    const accion = b.dataset.accion || b.dataset.nota || b.dataset.quitar;
    if (accion === 'editar') {
      extra.innerHTML = htmlEditorNota(e);
      extra.querySelector('textarea').focus();
    } else if (accion === 'guardar') {
      guardarNota(e, extra.querySelector('textarea').value);
      toast('Tu explicación quedó guardada');
      caja.querySelector('.cu-expl').innerHTML = htmlExplicaciones(e);
      caja.querySelector('[data-accion="editar"]').textContent = e.nota
        ? 'Editar mi explicación'
        : 'Añadir mi explicación';
      extra.innerHTML = '';
    } else if (accion === 'cancelar') {
      extra.innerHTML = '';
    } else if (accion === 'archivar') {
      archivarEntrada(e, !e.archivada);
      toast(
        e.archivada ? 'Archivada: ya no entra al repaso del cuaderno' : 'Vuelve a tu repaso del cuaderno',
      );
      vCuaderno();
    } else if (accion === 'quitar') {
      extra.innerHTML = `<p style="margin:8px 0">¿Quitar esta pregunta de tu cuaderno?</p><div class="row"><button class="btn red mini" data-quitar="si">Sí, quitar</button><button class="btn alt mini" data-nota="cancelar">Cancelar</button></div>`;
    } else if (accion === 'si') {
      quitarEntrada(e);
      toast('Quitada de tu cuaderno');
      vCuaderno();
    }
  };

  // Pregunta externa
  $('#cu-form').onsubmit = (ev) => {
    ev.preventDefault();
    const opciones = {};
    LET.forEach((l) => {
      const v = $('#ce-' + l).value.trim();
      if (v) opciones[l] = v;
    });
    const correcta = $('#ce-clave').value;
    if (!opciones[correcta]) {
      toast('La respuesta correcta elegida no tiene texto');
      return;
    }
    agregarExterna(
      {
        curso: $('#ce-curso').value.trim(),
        tema: $('#ce-tema').value.trim(),
        dificultad: $('#ce-dif').value,
        enunciado: $('#ce-enun').value.trim(),
        opciones,
        correcta,
        perla: '',
        fuente: $('#ce-fuente').value.trim(),
      },
      $('#ce-nota').value,
    );
    toast('Pregunta anotada en tu cuaderno');
    vCuaderno();
  };
}
