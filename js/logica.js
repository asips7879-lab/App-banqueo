// Lógica del progreso: día nuevo, ánimo, racha, repaso pendiente, recompensas, logros
// y record(), que registra cada respuesta.

function ensureDaily() {
  if (S.daily.date !== today())
    S.daily = { date: today(), n: 0, ok: 0, run: 0, courses: [], rev: 0, claimed: [] };
}
function mood() {
  if (!S.lastAct || S.lastAct === today()) return 'feliz';
  if (S.lastAct === addDays(today(), -1)) return 'normal';
  return 'triste';
}
function streakNow() {
  return S.lastDay === today() || S.lastDay === addDays(today(), -1) ? S.streak : 0;
}
function dueList() {
  const t = today();
  return allQ()
    .filter((q) => S.srs[q.id] && S.srs[q.id].due <= t)
    .sort((a, b) => (S.srs[b.id].danger ? 1 : 0) - (S.srs[a.id].danger ? 1 : 0));
}
function gain(c, x) {
  const before = levelInfo(S.xp).l;
  S.coins += c;
  S.xp += x;
  const after = levelInfo(S.xp).l;
  if (after > before) {
    toast('¡Subiste a nivel ' + after + '!');
    if (stageOf(after) > stageOf(before))
      toast('¡' + S.name + ' evolucionó a ' + STAGES[stageOf(after)].n + '!');
  }
}
function checkLog() {
  LOG.forEach((l) => {
    if (!S.logros.includes(l.id) && l.f()) {
      S.logros.push(l.id);
      S.coins += 50;
      toast('Logro: ' + l.n + ' (+50)');
    }
  });
}

function record(q, sel, conf, mode) {
  ensureDaily();
  const d = S.daily,
    ok = sel === q.correcta,
    t = today();
  S.total++;
  d.n++;
  const c = S.course[q.curso] || (S.course[q.curso] = { n: 0, ok: 0 });
  c.n++;
  if (!d.courses.includes(q.curso)) d.courses.push(q.curso);
  const a = S.ans[q.id] || { n: 0, ok: 0 };
  a.n++;
  a.last = ok;
  S.ans[q.id] = a;
  if (ok) {
    S.ok++;
    d.ok++;
    c.ok++;
    a.ok++;
    S.run++;
    S.bestRun = Math.max(S.bestRun, S.run);
    d.run = Math.max(d.run, S.run);
    if (q.dificultad === 'Difícil') S.hardOk++;
    let coins = REW[q.dificultad] || 5;
    if (conf === 'seguro') coins = Math.round(coins * 1.5);
    gain(coins, XPR[q.dificultad] || 12);
    if (S.run % 5 === 0) {
      S.coins += 10;
      toast(S.run + ' aciertos seguidos · +10');
    }
  } else {
    S.run = 0;
    gain(0, 3);
  }
  const s = S.srs[q.id];
  if (mode === 'repaso' && s) {
    d.rev++;
    if (ok) {
      s.box++;
      if (s.box >= 4) delete S.srs[q.id];
      else {
        s.due = addDays(t, [1, 3, 7, 15][s.box]);
        s.danger = false;
      }
    } else {
      s.box = 0;
      s.due = addDays(t, 1);
      s.danger = s.danger || conf === 'seguro';
    }
  } else if (!ok) S.srs[q.id] = { box: 0, due: t, danger: conf === 'seguro' };
  if (d.n === 10) {
    if (S.lastDay === addDays(t, -1)) S.streak++;
    else if (S.lastDay !== t) S.streak = 1;
    S.lastDay = t;
    toast('Racha: ' + S.streak + ' día' + (S.streak > 1 ? 's' : ''));
  }
  S.lastAct = t;
  checkLog();
  save();
}
