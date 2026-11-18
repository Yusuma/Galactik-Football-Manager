// ======================================================================
// CONTENU CACHÉ : duel en temps réel (ne rien décrire ici pour ne pas gâcher la surprise)
// ======================================================================
// La salle tourne dans un cadre isolé posé sur l'emplacement de l'onglet, comme Galactik Cartes :
// le menu et le reste du jeu restent accessibles. Changer d'onglet met le duel en pause.

// Pont entre la carrière et la salle (utilisé par arena.html).
window.ARH = {
  // Réglages du duel : champion choisi (couleurs du club), adversaire, tour du tournoi.
  setup: () => {
    try {
      const d = V.nd;
      if (!d) return null;
      const t = me(),
        k = kitOf(t),
        RD = ['Quart de finale', 'Demi-finale', 'Finale'];
      return {
        title: NB,
        round: RD[d.rd] || 'Duel',
        me: { n: d.p.n, club: t.name, a: k.a, b: k.b, att: NBA(d.p), def: NBD(d.p), en: d.p.e, num: pnum(t, d.p) },
        op: { n: d.op.n, lvl: d.op.o, a: d.op.a, b: d.op.b, num: d.op.num },
      };
    } catch (e) {
      return null;
    }
  },
  // Début / fin / pause : la partie met à jour son bouton « Continuer ».
  state: () => {
    try {
      render();
    } catch (e) {}
  },
  // Fin du duel : résultat, fatigue, blessure éventuelle, gains (nbFin), puis écran de résultat.
  done: (r) => {
    const d = V.nd;
    if (!d || d.done) return;
    d.sc = r.score;
    d.r = r.rounds;
    d.fl = r.downs;
    d.win = !!r.win;
    d.st = r.stats;
    d.hurt = Math.random() < 1 - Math.pow(0.94, r.downs || 0) ? 1 : 0;
    d.done = 1;
    try {
      nbFin(d);
    } catch (e) {}
    arDrop();
    render();
  },
};
let ARF = null,
  ARREF = null;
// Vrai pendant un duel : la carrière ne peut pas avancer avant la fin du duel.
function arBusy() {
  try {
    return !!(ARF && ARREF === S && ARF.contentWindow && ARF.contentWindow.duelOn && ARF.contentWindow.duelOn());
  } catch (e) {
    return false;
  }
}
function arDrop() {
  if (ARF) ARF.remove();
  ARF = null;
}
function arFrame() {
  const key = String(V.nd.key);
  if (ARF && ARREF === S && ARF.dataset.k == key) return ARF;
  arDrop();
  ARREF = S;
  ARF = document.createElement('iframe');
  ARF.className = 'tcgf';
  ARF.title = 'Duel';
  ARF.dataset.k = key;
  ARF.style.display = 'none';
  ARF.setAttribute('allow', 'gamepad *; autoplay *');
  document.body.appendChild(ARF);
  if (window.AR_PAGE) ARF.srcdoc = AR_PAGE;
  else ARF.src = 'arena.html';
  return ARF;
}
// Place le cadre sur l'emplacement de l'onglet (ou le cache, et met le duel en pause, si l'onglet n'est pas affiché).
function arPos() {
  if (!ARF) return;
  const slot = document.getElementById('arSlot');
  if (!slot || !S || ARREF !== S || !V.nd || V.nd.done) {
    if (ARF.style.display != 'none') {
      ARF.style.display = 'none';
      try {
        ARF.contentWindow.autoPause && ARF.contentWindow.autoPause();
      } catch (e) {}
    }
    return;
  }
  let r = slot.getBoundingClientRect();
  const tk = document.querySelector('.tk'),
    tkr = tk ? tk.getBoundingClientRect() : null,
    bot = tkr && tkr.height && tkr.top > 0 && tkr.top < innerHeight ? tkr.top : innerHeight;
  let off = scrollY;
  for (let e = slot.parentElement; e; e = e.parentElement) off += e.scrollTop || 0;
  const want = Math.max(320, Math.floor(bot - (r.top + off) - 10));
  if (Math.abs(r.height - want) > 1) {
    slot.style.height = want + 'px';
    r = slot.getBoundingClientRect();
  }
  // Le cadre ne passe jamais par-dessus le bandeau du haut ni le bandeau défilant du bas.
  const tb = document.querySelector('.tb'),
    cut = tb ? Math.max(0, Math.ceil(tb.getBoundingClientRect().bottom + 4 - r.top)) : 0,
    cutB = Math.max(0, Math.ceil(r.bottom - bot + 4));
  Object.assign(ARF.style, {
    display: 'block',
    left: r.left + 'px',
    top: r.top + 'px',
    width: r.width + 'px',
    height: r.height + 'px',
    clipPath: cut > 0 || cutB > 0 ? 'inset(' + Math.min(cut, r.height) + 'px 0 ' + Math.min(cutB, r.height) + 'px 0 round 20px)' : '',
  });
}
function arSync() {
  try {
    if (S && V.tab == 'nb' && V.nd && !V.nd.done && document.getElementById('arSlot')) arFrame();
    else if (ARF && (!V.nd || V.nd.done || ARREF !== S)) arDrop();
    arPos();
  } catch (e) {}
}
window.addEventListener('scroll', arPos, true);
window.addEventListener('resize', arPos);
setInterval(() => {
  if (ARF && ARF.style.display != 'none') arPos();
}, 400);
if (typeof render == 'function') {
  const _arRender = render;
  render = function () {
    const r = _arRender.apply(this, arguments);
    arSync();
    return r;
  };
}
