// Dibujo de la mascota (SVG). mascot(etapa, accesorios, ánimo, clase) devuelve el SVG como texto.

function mascot(stage, equip, md, cls) {
  const body = stage === 0 ? '#b57edc' : '#e11d48',
    inner = stage === 0 ? '#8f56c4' : '#f43f5e';
  const mouth =
    md === 'feliz'
      ? '<path d="M84 120 Q100 136 116 120" stroke="#3b0a14" stroke-width="5" fill="none" stroke-linecap="round"/>'
      : md === 'triste'
        ? '<path d="M86 130 Q100 118 114 130" stroke="#3b0a14" stroke-width="5" fill="none" stroke-linecap="round"/>'
        : '<path d="M88 125 H112" stroke="#3b0a14" stroke-width="5" stroke-linecap="round"/>';
  const has = (id) => equip.includes(id);
  let s = `<svg class="mascot ${cls || ''}" viewBox="0 0 200 200" role="img" aria-label="Mascota ${esc(S.name)}">
 <ellipse cx="100" cy="188" rx="58" ry="7" fill="rgba(0,0,0,.18)"/>
 <ellipse cx="74" cy="176" rx="14" ry="9" fill="${body}"/><ellipse cx="126" cy="176" rx="14" ry="9" fill="${body}"/>
 <ellipse cx="38" cy="118" rx="10" ry="16" fill="${body}" transform="rotate(25 38 118)"/><ellipse cx="162" cy="118" rx="10" ry="16" fill="${body}" transform="rotate(-25 162 118)"/>
 ${
   stage === 0
     ? `<circle cx="100" cy="108" r="60" fill="${body}"/><circle cx="100" cy="112" r="28" fill="${inner}" opacity=".55"/>`
     : `<ellipse cx="100" cy="108" rx="66" ry="60" fill="${body}"/><ellipse cx="100" cy="112" rx="36" ry="28" fill="${inner}"/>`
 }
 <ellipse cx="78" cy="78" rx="18" ry="8" fill="#fff" opacity=".25" transform="rotate(-25 78 78)"/>`;
  if (stage === 1)
    s +=
      '<circle cx="100" cy="89" r="3" fill="#9f1239"/><circle cx="92" cy="110" r="3" fill="#9f1239"/><circle cx="108" cy="111" r="3" fill="#9f1239"/>';
  if (stage >= 2)
    s += `<path d="M50 140 Q100 156 150 140 L160 186 H40 Z" fill="#fff" stroke="#c8d6d8" stroke-width="2"/><path d="M100 152 L86 186 M100 152 L114 186" stroke="#c8d6d8" stroke-width="3"/><rect x="122" y="160" width="18" height="12" rx="3" fill="#bae6fd"/>`;
  if (stage >= 3)
    s += `<path d="M70 142 Q72 176 100 176 Q128 176 130 142" stroke="#334155" stroke-width="4" fill="none"/><circle cx="100" cy="178" r="7" fill="#94a3b8" stroke="#334155" stroke-width="3"/>`;
  s += `<circle cx="80" cy="98" r="8" fill="#1f0a10"/><circle cx="120" cy="98" r="8" fill="#1f0a10"/><circle cx="83" cy="95" r="3" fill="#fff"/><circle cx="123" cy="95" r="3" fill="#fff"/>
 <ellipse cx="66" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".7"/><ellipse cx="134" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".7"/>`;
  s += has('mascarilla')
    ? '<path d="M74 110 H126 Q126 136 100 138 Q74 136 74 110Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2"/><path d="M74 114 L52 104 M126 114 L148 104" stroke="#7dd3fc" stroke-width="2"/>'
    : mouth;
  if (md === 'triste' && !has('mascarilla'))
    s += '<path d="M126 106 q4 10 0 14 q-4 -4 0 -14z" fill="#7dd3fc"/>';
  if (has('lentes'))
    s +=
      '<circle cx="80" cy="98" r="15" fill="rgba(255,255,255,.15)" stroke="#111827" stroke-width="4"/><circle cx="120" cy="98" r="15" fill="rgba(255,255,255,.15)" stroke="#111827" stroke-width="4"/><path d="M95 98 H105" stroke="#111827" stroke-width="4"/>';
  if (has('medalla'))
    s +=
      '<path d="M92 150 L100 162 L108 150" stroke="#2563eb" stroke-width="5" fill="none"/><circle cx="100" cy="168" r="9" fill="#f5c542" stroke="#a87400" stroke-width="2"/>';
  if (has('gorro'))
    s +=
      '<path d="M46 74 Q100 8 154 74 Q100 60 46 74Z" fill="#38bdf8"/><path d="M60 64 Q100 50 140 64" stroke="#0284c7" stroke-width="2" fill="none" stroke-dasharray="4 4"/>';
  else if (stage >= 4)
    s +=
      '<path d="M100 58 L82 66 V78 H118 V66Z" fill="#111827"/><path d="M58 52 L100 36 L142 52 L100 68Z" fill="#1f2937"/><path d="M142 52 L146 78" stroke="#f5c542" stroke-width="3"/><circle cx="146" cy="80" r="4" fill="#f5c542"/>';
  if (has('corona'))
    s +=
      '<path d="M72 50 L76 24 L90 40 L100 18 L110 40 L124 24 L128 50Z" fill="#f5c542" stroke="#a87400" stroke-width="2"/><circle cx="100" cy="40" r="4" fill="#e11d48"/>';
  return s + '</svg>';
}
