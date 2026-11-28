// Cuaderno de errores: preguntas que cada estudiante guarda (del banco o de otras fuentes)
// con su propia explicación. Es personal: nunca cambia el banco oficial.
//
// Cada entrada de S.cuaderno:
//   id           'c…'
//   origen       'banco' (pregunta de la app) | 'externa' (anotada por el estudiante)
//   qid          id de la pregunta del banco (solo si origen es 'banco')
//   pregunta     copia de la pregunta al guardarla:
//                { curso, tema, dificultad, enunciado, opciones, correcta, explicacion, perla, fuente }
//   nota         explicación personal del estudiante ('' = se usa la explicación oficial)
//   miRespuesta  letra que había respondido al guardarla desde los resultados (opcional)
//   acerto       si esa respuesta fue correcta (opcional)
//   fecha        día en que se guardó (YYYY-MM-DD)
//   archivada    true cuando el estudiante marca "Ya lo domino" (no entra al repaso del cuaderno)

const copiaPregunta = (q) => ({
  curso: q.curso,
  tema: q.tema || '',
  dificultad: q.dificultad,
  enunciado: q.enunciado,
  opciones: { ...q.opciones },
  correcta: q.correcta,
  explicacion: q.explicacion || '',
  perla: q.perla || '',
  fuente: q.fuente || '',
});

// Entrada del cuaderno que corresponde a una pregunta (del banco o externa), si existe.
function entradaDe(q) {
  if (!q) return undefined;
  if (q.externa) return S.cuaderno.find((e) => e.id === q.id);
  return S.cuaderno.find((e) => e.origen === 'banco' && e.qid === q.id);
}

const entradaPorId = (id) => S.cuaderno.find((e) => e.id === id);

// Pregunta lista para mostrar o banquear. Las del banco usan la versión vigente (con la explicación
// oficial al día); si el moderador la borró del banco, se usa la copia guardada.
function preguntaDeEntrada(e) {
  if (e.origen === 'externa') return { ...e.pregunta, explicacion: '', id: e.id, externa: true };
  return allQ().find((q) => q.id === e.qid) || { ...e.pregunta, id: e.qid };
}

const explicacionOficial = (e) => (e.origen === 'banco' ? preguntaDeEntrada(e).explicacion || '' : '');

// Guarda una pregunta del banco en el cuaderno (si ya estaba, devuelve la entrada existente).
function agregarAlCuaderno(q, extra = {}) {
  const ya = entradaDe(q);
  if (ya) return ya;
  const e = {
    id: nuevoId('c'),
    origen: 'banco',
    qid: q.id,
    pregunta: copiaPregunta(q),
    nota: '',
    ...extra,
    fecha: today(),
    archivada: false,
  };
  S.cuaderno.push(e);
  save();
  return e;
}

// Anota una pregunta de otra fuente (simulacro externo, examen pasado…).
function agregarExterna(pregunta, nota) {
  const e = {
    id: nuevoId('c'),
    origen: 'externa',
    pregunta,
    nota: (nota || '').trim(),
    fecha: today(),
    archivada: false,
  };
  S.cuaderno.push(e);
  save();
  return e;
}

// Guarda la explicación personal. Si queda igual a la oficial (o vacía), se usa la oficial.
function guardarNota(e, texto) {
  const t = String(texto || '').trim();
  e.nota = t && t !== explicacionOficial(e).trim() ? t : '';
  save();
}

function archivarEntrada(e, archivada) {
  e.archivada = archivada;
  save();
}

function quitarEntrada(e) {
  S.cuaderno = S.cuaderno.filter((x) => x.id !== e.id);
  save();
}

// Preguntas del banco que el estudiante falló alguna vez y que no están en su cuaderno.
const falladasFueraDelCuaderno = () =>
  allQ().filter((q) => S.ans[q.id] && S.ans[q.id].ok < S.ans[q.id].n && !entradaDe(q));

// Lista para "Repasar cuaderno": lo guardado (sin archivadas) y, si se pide, las falladas del banco.
function listaRepasoCuaderno({ curso = '', incluirFalladas = true } = {}) {
  const guardadas = S.cuaderno.filter((e) => !e.archivada).map(preguntaDeEntrada);
  const lista = incluirFalladas ? [...guardadas, ...falladasFueraDelCuaderno()] : guardadas;
  return lista.filter((q) => !curso || q.curso === curso);
}

// Bloques "Tu explicación" y "Explicación de la app" de una entrada.
function htmlExplicaciones(e) {
  const mia = e.nota ? `<div class="mia"><b>Tu explicación</b><div>${esc(e.nota)}</div></div>` : '';
  if (e.origen === 'banco') {
    return (
      mia + `<div class="oficial"><b>Explicación de la app</b><div>${esc(explicacionOficial(e))}</div></div>`
    );
  }
  return mia || '<p class="small mute">Todavía no tiene explicación.</p>';
}

// Editor de la explicación personal (en resultados y en el cuaderno).
function htmlEditorNota(e) {
  return `<label for="nota-${e.id}" style="margin-top:8px">Tu explicación</label>
 <textarea id="nota-${e.id}" class="cu-nota">${esc(e.nota || explicacionOficial(e))}</textarea>
 <p class="small mute" style="margin:4px 0 8px">Agrega, quita o reescribe lo que quieras, como tú lo entiendas.${e.origen === 'banco' ? ' La explicación de la app se conserva aparte.' : ''}</p>
 <div class="row"><button class="btn mini" data-nota="guardar">Guardar en mi cuaderno</button><button class="btn alt mini" data-nota="cancelar">Cancelar</button></div>`;
}
