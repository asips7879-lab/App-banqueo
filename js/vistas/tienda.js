// Vista Tienda (#tienda): premios personales y accesorios de la mascota.

function vTienda() {
  const li = levelInfo(S.xp),
    st = stageOf(li.l);
  $('#view').innerHTML =
    `<h1>Tienda</h1><p class="mute">Tienes <b><i class="coin"></i> ${S.coins}</b> monedas.</p>
 <h2 class="sec">Mis premios</h2><p class="small mute">Premios reales que tú defines y te das al canjearlos.</p>
 <div class="grid">${S.premios
   .map(
     (
       p,
     ) => `<div class="card"><h3>${esc(p.nombre)}</h3><p class="row"><i class="coin"></i><b>${p.costo}</b></p>
  <div class="row"><button class="btn gold" data-buy="${p.id}" ${S.coins < p.costo ? 'disabled' : ''}>Canjear</button><button class="btn alt" data-del="${p.id}">Quitar</button></div></div>`,
   )
   .join('')}
  <form class="card" id="padd"><h3>Nuevo premio</h3><label for="pn">Nombre</label><input id="pn" required placeholder="Ej.: Salida al cine">
  <label for="pc" style="margin-top:8px">Costo en monedas</label><input id="pc" type="number" min="1" required value="200"><button class="btn" style="margin-top:10px">Agregar</button></form></div>
 ${
   S.canjes.length
     ? `<h3 class="sec">Historial de canjes</h3>${S.canjes
         .slice(-10)
         .reverse()
         .map((c) => `<div class="small">${c.fecha} · ${esc(c.nombre)} · ${c.costo}</div>`)
         .join('')}`
     : ''
 }
 <h2 class="sec">Accesorios para ${esc(S.name)}</h2>
 <div class="shop">${ACC.map((a) => {
   const own = S.owned.includes(a.id),
     on = S.equip.includes(a.id);
   return `<div class="card item">${mascot(st, [a.id], 'feliz')}<h3>${a.n}</h3>${
     own
       ? `<button class="btn ${on ? '' : 'alt'}" data-eq="${a.id}">${on ? 'Puesto' : 'Ponérselo'}</button>`
       : `<button class="btn gold" data-acc="${a.id}" ${S.coins < a.c ? 'disabled' : ''}><i class="coin"></i> ${a.c}</button>`
   }</div>`;
 }).join('')}</div>
 <div id="confirmBox"></div>`;
  document.querySelectorAll('[data-buy]').forEach(
    (b) =>
      (b.onclick = () => {
        const p = S.premios.find((x) => x.id === b.dataset.buy);
        $('#confirmBox').innerHTML =
          `<div class="card" style="position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:10;width:min(92vw,380px);box-shadow:0 20px 60px rgba(0,0,0,.35)"><h3>¿Canjear “${esc(p.nombre)}” por ${p.costo} monedas?</h3><div class="row"><button class="btn gold" id="cy">Sí, canjear</button><button class="btn alt" id="cn">Cancelar</button></div></div>`;
        $('#cn').onclick = () => ($('#confirmBox').innerHTML = '');
        $('#cy').onclick = () => {
          S.coins -= p.costo;
          S.canjes.push({ nombre: p.nombre, costo: p.costo, fecha: today() });
          save();
          toast('¡Disfruta: ' + p.nombre + '!');
          route();
        };
      }),
  );
  document.querySelectorAll('[data-del]').forEach(
    (b) =>
      (b.onclick = () => {
        S.premios = S.premios.filter((x) => x.id !== b.dataset.del);
        save();
        route();
      }),
  );
  $('#padd').onsubmit = (e) => {
    e.preventDefault();
    S.premios.push({
      id: 'p' + Date.now(),
      nombre: $('#pn').value.trim(),
      costo: Math.max(1, +$('#pc').value),
    });
    save();
    route();
  };
  document.querySelectorAll('[data-acc]').forEach(
    (b) =>
      (b.onclick = () => {
        const a = ACC.find((x) => x.id === b.dataset.acc);
        if (S.coins < a.c) return;
        S.coins -= a.c;
        S.owned.push(a.id);
        S.equip.push(a.id);
        save();
        toast(S.name + ' estrena ' + a.n.toLowerCase());
        route();
      }),
  );
  document.querySelectorAll('[data-eq]').forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.eq;
        S.equip = S.equip.includes(id) ? S.equip.filter((x) => x !== id) : [...S.equip, id];
        save();
        route();
      }),
  );
}
