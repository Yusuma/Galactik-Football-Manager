/* ============================================================
   GALACTIK CARTES : le mode jeu de cartes de Galactik Manager
   - onglet « Cartes » (si le mode a été activé à la création de la carrière)
   - un booster gagné à la fin de chaque match du club (Victoire / Nul / Défaite)
   - le jeu lui-même (duels, boosters, collection, decks) s'ouvre en plein écran
     dans un cadre isolé (cartes.html), qui lit et écrit l'état S.tcg de la partie.
   ============================================================ */
const TCG_BASE = ['Snow Kids', 'Shadows', 'Team Paradisia', 'Lightnings', 'Wambas', 'Rykers', 'Xenons', 'Tigres Rouges', 'Pirates', 'Elektras', 'Cyclopes', 'Vortex', 'Technodroids', 'Comet'];
const TCG_BN = { V: 'Victoire', N: 'Match nul', D: 'Défaite' };
// Le mode est-il actif dans la partie en cours ?
function tcgOn() {
  return !!(S && S.tcg && S.tcg.on);
}
// Les 14 clubs de base de la carrière (en Galactik Cup, ils sont dans la seconde compétition).
function tcgClubs() {
  const all = [...(S.teams || []), ...((S.alt && S.alt.teams) || [])];
  return TCG_BASE.map((n) => all.find((t) => t.name == n)).filter(Boolean);
}
// Photo de liste des cartes : figée au moment de l'activation, pour que les cartes ne changent pas pendant la carrière.
// [nom, poste, club, planète d'origine, note, 'c' chromatique / 'p' prismatique, club d'origine, visage, planche]
function tcgRoster() {
  const rows = [];
  tcgClubs().forEach((t) =>
    t.sq.forEach((p) => {
      try {
        phUrl(p);
      } catch (e) {}
      rows.push([p.n, p.p, t.name, planet(p.og || t.name), p.o, p.c ? 'c' : p.pr ? 'p' : '', p.og || t.name, p.fk == null ? null : p.fk, p.fp || null]);
    }),
  );
  return rows;
}
// État du mode dans la sauvegarde (créé au besoin).
function tcgSt() {
  const t = S.tcg;
  t.stock = t.stock || { V: 0, N: 0, D: 0 };
  t.coll = t.coll || {};
  t.decks = t.decks || [];
  if (!t.roster || !t.roster.length) t.roster = tcgRoster();
  return t;
}
// Nombre de boosters à ouvrir (pastille de l'onglet).
function tcgN() {
  if (!tcgOn()) return 0;
  const s = S.tcg.stock || {};
  return (s.V || 0) + (s.N || 0) + (s.D || 0);
}
// Fin d'un match du club : un booster selon le résultat, avec notification.
function tcgAward(g, c) {
  if (!tcgOn()) return;
  const st = tcgSt(),
    ty = g > c ? 'V' : g == c ? 'N' : 'D';
  st.stock[ty] = (st.stock[ty] || 0) + 1;
  try {
    ntf({ i: 'cards', l: 'Galactik Cartes', t: 'Booster ' + TCG_BN[ty] + ' gagné', s: tcgN() + ' booster' + (tcgN() > 1 ? 's' : '') + ' à ouvrir · onglet Cartes', tp: 'u', go: 'tcg', d: 5200 });
  } catch (e) {}
}
// Cartes Légende d'événement : personnages de la série (joueurs rares du marché) débloqués par des exploits de la carrière.
// [nom, condition affichée, test (buts pour, buts contre, adversaire, club joué)]
const TCG_EV = [
  ['Aarch', 'Gagner un match avec les Snow Kids.', (g, c, o, m) => m == 'Snow Kids' && g > c],
  ['Yuki', 'Gagner un match sans encaisser de but avec les Snow Kids.', (g, c, o, m) => m == 'Snow Kids' && g > c && c == 0],
  ['Artegor Nexus', 'Gagner un match avec les Shadows.', (g, c, o, m) => m == 'Shadows' && g > c],
  ['Norata', 'Gagner un match avec les Lightnings.', (g, c, o, m) => m == 'Lightnings' && g > c],
  ['Woowamboo', 'Battre les Lightnings.', (g, c, o) => o == 'Lightnings' && g > c],
  ['Yewan', 'Marquer 5 buts ou plus dans un match.', (g) => g >= 5],
  ['Sonny Blackbones', 'Gagner un match avec les Pirates.', (g, c, o, m) => m == 'Pirates' && g > c],
  ['Zyria', 'Battre les Elektras, ou gagner un match avec eux.', (g, c, o, m) => g > c && (o == 'Elektras' || m == 'Elektras')],
  ['Nikki 4', 'Battre Team Paradisia, ou gagner un match avec eux.', (g, c, o, m) => g > c && (o == 'Team Paradisia' || m == 'Team Paradisia')],
];
// Lignes de cartes (même format que la photo de liste) pour les Légendes d'événement.
function tcgEvRows() {
  return TCG_EV.map((e) => {
    const r = (typeof RARE != 'undefined' ? RARE : []).find((x) => x[0] == e[0]);
    return r ? [r[0], r[1], r[3], planet(r[3]), r[2], 'c', r[3], null, null] : null;
  }).filter(Boolean);
}
// Fin d'un match du club : vérifie les exploits qui débloquent une Légende d'événement.
function tcgEvents(g, c, opp) {
  if (!tcgOn()) return;
  const st = tcgSt(),
    mine = me().name;
  TCG_EV.forEach(([n, d, f]) => {
    const k = 'J:' + n + '#5';
    if (st.coll[k]) return;
    let ok = false;
    try {
      ok = f(g, c, opp, mine);
    } catch (e) {}
    if (!ok) return;
    st.coll[k] = 1;
    st.evg = st.evg || {};
    st.evg[n] = YR();
    ntf({ i: 'cards', l: 'Galactik Cartes · Légende', t: 'Carte Légende débloquée : ' + n, s: d + ' · Voir la galerie', tp: 'u', go: 'gal', d: 6000 });
  });
}
// Portrait d'une carte : celui du joueur s'il est encore dans la partie, sinon reconstruit depuis la photo de liste.
function tcgPh(n) {
  try {
    const all = [...(S.teams || []), ...((S.alt && S.alt.teams) || [])];
    for (const t of all) {
      const p = t.sq.find((x) => x.n == n);
      if (p) return phUrl(p) || '';
    }
    const r = (S.tcg.roster || []).find((x) => x[0] == n);
    if (r) return phUrl({ n: r[0], og: r[6], c: r[5] == 'c', fk: r[7], fp: r[8] }) || '';
    const x = (typeof RARE != 'undefined' ? RARE : []).find((z) => z[0] == n);
    if (x) return phUrl({ n: x[0], og: x[3], c: 1, rare: 1 }) || '';
  } catch (e) {}
  return '';
}
// Pont entre la partie et le jeu de cartes (utilisé par cartes.html).
window.TCGH = {
  mode: 'hub',
  st: () => tcgSt(),
  roster: () => tcgSt().roster,
  evRows: () => tcgEvRows(),
  gal: () => {
    V.tab = 'gal';
    render();
  },
  snapped: () => {
    try {
      if (V.tab == 'gal') render();
    } catch (e) {}
  },
  ph: (n) => tcgPh(n),
  // Logo d'un club (écusson du jeu, ou écusson créé dans l'éditeur)
  logo: (tm) => {
    try {
      const t = [...(S.teams || []), ...((S.alt && S.alt.teams) || [])].find((x) => x.name == tm);
      const em = (t && t.em) || ((typeof T != 'undefined' && T.find((x) => x[0] == tm)) || [])[2] || '';
      const m = /⟦([a-z]{2})⟧/.exec(em);
      if (m) return lgU(m[1]);
      if (/⟦~/.test(em)) return crU(em.match(/⟦~[0-9a-f.]+⟧/)[0]);
    } catch (e) {}
    return '';
  },
  club: () => (S && me() ? me().name : ''),
  cash: () => (S ? S.cash : 0),
  // Revente de doublons : l'argent va dans le budget du club.
  sell: (amount, what) => {
    try {
      tx('Vente de cartes', amount);
      ntf({ i: 'coin', l: 'Galactik Cartes', t: '+' + amount + ' crédits', s: what || 'Vente de doublons', tp: 'u' });
    } catch (e) {}
    save();
  },
  save: () => {
    try {
      save();
    } catch (e) {}
  },
  close: () => tcgClose(),
  // Succès du jeu de cartes : crédits pour le club, titre (Galerie et sous le nom du club) et notification.
  reward: (name, txt, cr, tt) => {
    try {
      if (cr) tx('Succès Galactik Cartes', cr);
      ntf({ i: 'trophy', l: 'Galactik Cartes · Succès', t: name, s: txt, tp: 'u', go: 'gal', d: 5200 });
      if (tt) addTt(tt[0]);
    } catch (e) {}
    save();
  },
  // Début / fin d'un duel : la partie met à jour son bouton « Continuer »
  duel: () => {
    try {
      render();
    } catch (e) {}
  },
};
// Vrai pendant un duel de cartes : la carrière ne peut pas avancer avant la fin du duel.
function tcgBusy() {
  try {
    return !!(TCGF && TCGREF === S && TCGF.contentWindow && TCGF.contentWindow.duelOn && TCGF.contentWindow.duelOn());
  } catch (e) {
    return false;
  }
}
// Le jeu tourne dans un cadre isolé posé exactement sur la zone de l'onglet « Cartes » : le menu et le reste du jeu
// restent accessibles. Le cadre est conservé (caché) quand on change d'onglet, pour ne pas perdre un duel en cours.
let TCGF = null, TCGREF = null;
function tcgFrame() {
  if (TCGF && TCGREF === S) return TCGF;
  if (TCGF) TCGF.remove();
  TCGREF = S;
  TCGF = document.createElement('iframe');
  TCGF.id = 'tcgf';
  TCGF.className = 'tcgf';
  TCGF.title = 'Galactik Cartes';
  TCGF.style.display = 'none';
  document.body.appendChild(TCGF);
  if (window.TCG_PAGE) TCGF.srcdoc = TCG_PAGE;
  else TCGF.src = 'cartes.html';
  return TCGF;
}
// Place le cadre sur l'emplacement de l'onglet (ou le cache si l'onglet n'est pas affiché).
function tcgPos() {
  const slot = document.getElementById('tcgSlot');
  if (!TCGF) return;
  if (!slot || !S || !tcgOn() || TCGREF !== S) {
    TCGF.style.display = 'none';
    return;
  }
  // L'emplacement prend exactement la hauteur restante de l'écran : la page ne défile plus, c'est le jeu de cartes qui a sa propre barre de défilement.
  // (le bandeau défilant du bas, s'il est affiché, reste visible : la zone s'arrête au-dessus)
  let r = slot.getBoundingClientRect();
  const tk = document.querySelector('.tk'),
    tkr = tk ? tk.getBoundingClientRect() : null,
    bot = tkr && tkr.height && tkr.top > 0 && tkr.top < innerHeight ? tkr.top : innerHeight;
  // position de l'emplacement sans tenir compte du défilement (de la page ou de la zone principale qui défile)
  let off = scrollY;
  for (let e = slot.parentElement; e; e = e.parentElement) off += e.scrollTop || 0;
  const want = Math.max(300, Math.floor(bot - (r.top + off) - 10));
  if (Math.abs(r.height - want) > 1) {
    slot.style.height = want + 'px';
    r = slot.getBoundingClientRect();
  }
  // Le cadre ne passe jamais par-dessus le bandeau du haut : la partie qui le chevaucherait est masquée.
  const tb = document.querySelector('.tb'),
    cut = tb ? Math.max(0, Math.ceil(tb.getBoundingClientRect().bottom + 4 - r.top)) : 0,
    cutB = Math.max(0, Math.ceil(r.bottom - bot + 4));
  // Zone réellement visible du cadre (pour que les fenêtres du jeu de cartes restent entièrement à l'écran).
  try {
    const vt = Math.max(0, (tb ? tb.getBoundingClientRect().bottom + 4 : 0) - r.top),
      vb = Math.min(r.height, bot - r.top);
    const de = TCGF.contentWindow.document.documentElement;
    de.style.setProperty('--vt', Math.round(vt) + 'px');
    de.style.setProperty('--vh', Math.max(200, Math.round(vb - vt)) + 'px');
  } catch (e) {}
  Object.assign(TCGF.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', clipPath: cut > 0 || cutB > 0 ? 'inset(' + Math.min(cut, r.height) + 'px 0 ' + Math.min(cutB, r.height) + 'px 0 round 20px)' : '' });
}
function tcgSync() {
  try {
    if (S && tcgOn() && V.tab == 'tcg' && document.getElementById('tcgSlot')) {
      tcgSt();
      tcgFrame();
      try {
        TCGF.contentWindow.boCount && TCGF.contentWindow.boCount();
        TCGF.contentWindow.syncTheme && TCGF.contentWindow.syncTheme();
        if (TCGF.contentWindow.BS && TCGF.contentWindow.BS.view == 'hub' && !TCGF.contentWindow.$('bo').hidden) TCGF.contentWindow.hubRender();
      } catch (e) {}
    }
    tcgPos();
  } catch (e) {}
}
window.addEventListener('scroll', tcgPos, true);
window.addEventListener('resize', tcgPos);
// Filet de sécurité : recale le cadre régulièrement (zoom du navigateur, barre d'adresse mobile, menu replié…).
setInterval(() => {
  if (TCGF && TCGF.style.display != 'none') tcgPos();
}, 400);
// Chaque affichage de la partie recale le cadre du jeu de cartes.
if (typeof render == 'function') {
  const _tcgRender = render;
  render = function () {
    const r = _tcgRender.apply(this, arguments);
    tcgSync();
    return r;
  };
}
// « Plus tard » depuis le choix du deck de départ : retour à l'aperçu du club.
function tcgClose() {
  try {
    save();
  } catch (e) {}
  if (S) {
    V.tab = 'ov';
    render();
  }
}
// Contenu de l'onglet « Cartes » : tout le jeu de cartes s'affiche dans cet emplacement.
function tcgView() {
  if (!tcgOn())
    return `<div class="card"><b>Galactik Cartes</b><div class="mu" style="margin-top:6px">Le jeu de cartes n’est pas activé dans cette carrière. Il se choisit à la création d’une nouvelle carrière.</div></div>`;
  return `<div class="tcgw"><div id="tcgSlot" class="tcgslot"><div class="mu">Chargement de Galactik Cartes…</div></div></div>`;
}

// Galerie de la carrière : chiffres clés du jeu de cartes.
function tcgGalStat(nTt, tTt) {
  const sn = (S.tcg && S.tcg.snap) || { ach: [], col: [], legs: [] },
    co = (S.tcg && S.tcg.coll) || {},
    nev = TCG_EV.filter((e) => co['J:' + e[0] + '#5']).length,
    box = (h, n, t, l) => `<div ${gsGo(h)}><b>${n} / ${t}</b>${l}</div>`;
  return (
    box('Succès Galactik Cartes', sn.ach.filter((a) => a.ok).length, sn.ach.length || 22, 'succès Galactik Cartes') +
    box('Titres Galactik Cartes', nTt || 0, tTt || 7, 'titres Galactik Cartes') +
    (sn.col.length ? box('Collector', sn.col.filter((o) => o.ok).length, sn.col.length, 'Collector') : '') +
    box('Légendes d’événement', nev, TCG_EV.length, 'Légendes d’événement') +
    (sn.legs.length ? box('Légendes de la série', sn.legs.filter((l) => l.has).length, sn.legs.length, 'Légendes de la série') : '')
  );
}
// Galerie de la carrière : succès, titres, Collector et Légendes du jeu de cartes (même style de tuiles).
function tcgGalView(tile, okl, bar, sec, tck, nTc) {
  if (tcgOn() && (!TCGF || TCGREF !== S)) setTimeout(() => tcgFrame(), 0); // le jeu de cartes calcule les progressions
  const st = S.tcg || {},
    sn = st.snap || { ach: [], col: [], legs: [] },
    co = st.coll || {},
    R = RW();
  Object.values(st.ach || {}).forEach((x) => x && (x.n = 0));
  const pills = (a) => [a.cr ? `<span>+${a.cr} cr.</span>` : '', a.tt ? '<span class="t">Titre</span>' : '', a.lg ? '<span class="l">Légende</span>' : ''].join('');
  const face = (n, has) => {
    const u = has ? tcgPh(n) : '';
    return u ? `<span class="gaph" style="background-image:url('${u}')"></span>` : '⭐';
  };
  const achT = sn.ach.map((a) => tile(a.ok, '🏆', a.n, a.d, a.ok ? okl('Obtenu' + (a.got.length ? ' · Légende : ' + a.got.join(', ') : '')) : bar(a.a, a.b), pills(a))).join('');
  const ttT = tck
    .map((k) => {
      const g = R.tt.find((x) => x.k == k);
      return tile(!!g, '🎖️', TTN[k], ((x) => x[0].toUpperCase() + x.slice(1))(TTH[k].replace('Galactik Cartes : ', '')), g ? okl('Obtenu · choisissable sous le nom du club') : '');
    })
    .join('');
  const colT = sn.col.map((o) => tile(o.ok, '⭐', 'Collector · ' + o.tm, 'Réunir tous les joueurs et gardiens de l’équipe (toutes raretés).', o.ok ? okl('Complété') : bar(o.have, o.tot), o.legs.length ? `<span class="l">${o.legs.length} Légende${o.legs.length > 1 ? 's' : ''}</span>` : '<span>+800 cr.</span>')).join('');
  const legT = sn.legs
    .map((l) => tile(l.has, face(l.n, l.has), l.n, `${l.pos} · ${l.tm}`, l.has ? okl('Légende obtenue') : '<small class="ganum">Collector de l’équipe ou succès</small>', '<span class="l">+5</span>'))
    .join('');
  const evT = TCG_EV.map(([n, d]) => {
    const has = !!co['J:' + n + '#5'],
      r = (typeof RARE != 'undefined' ? RARE : []).find((x) => x[0] == n) || [];
    return tile(has, face(n, has), n, d, has ? okl('Légende obtenue' + (st.evg && st.evg[n] ? ' · ' + st.evg[n] : '')) : `<small class="ganum">${r[1] || ''} · ${r[3] || ''}</small>`, '<span class="l">Légende</span>');
  }).join('');
  const nA = sn.ach.filter((a) => a.ok).length;
  return (
    (sn.ach.length ? sec('Succès Galactik Cartes', `${nA} / ${sn.ach.length}`, achT) : '') +
    sec('Titres Galactik Cartes', `${nTc} / ${tck.length}`, ttT) +
    (sn.col.length ? sec('Collector', `${sn.col.filter((o) => o.ok).length} / ${sn.col.length}`, colT, '<div class="mu" style="margin:-2px 0 8px">Complétez une équipe pour débloquer les cartes Légende de ses personnages de la série.</div>') : '') +
    sec('Légendes d’événement', `${TCG_EV.filter((e) => co['J:' + e[0] + '#5']).length} / ${TCG_EV.length}`, evT, '<div class="mu" style="margin:-2px 0 8px">Débloquées par des exploits pendant les matchs de la carrière. Jamais dans les boosters.</div>') +
    (sn.legs.length ? sec('Légendes de la série', `${sn.legs.filter((l) => l.has).length} / ${sn.legs.length}`, legT, `<div class="mu" style="margin:-2px 0 8px">Un joueur Légende gagne +5 en attaque et en défense ; un gardien Légende active son effet avec un joueur de moins.</div>`) : '')
  );
}
