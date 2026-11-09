// ============================================================================
//  GALACTIK MANAGER — js/app.js  (le jeu : toute la logique)
// ----------------------------------------------------------------------------
//  COMMENT S'Y RETROUVER (pour quelqu'un qui code peu) :
//   • Les grands titres comme celui-ci (lignes de « = ») marquent les grandes
//     parties. Utilise la recherche de ton éditeur (Ctrl+F) pour les trouver.
//   • Avant chaque fonction, un commentaire « // … » dit à quoi elle sert.
//   • S = l'état de la partie (argent, joueurs, calendrier…).
//     V = l'état de l'écran (onglet ouvert, fenêtre ouverte…).
//     ST = les paramètres du joueur (son, musique, notifications…).
//   • render() redessine tout l'écran. Après avoir changé S ou V, on l'appelle.
//   • Les textes affichés sont en français entre guillemets ou accents graves.
//
//  AUTRES FICHIERS :
//   • index.html        : la page (squelette) qui charge tout le reste.
//   • css/style.css     : l'apparence (couleurs, tailles, animations).
//   • css/donnees.css   : grandes images intégrées au style (ne pas modifier).
//   • js/images.js      : portraits, logos et images intégrés (ne pas modifier).
//   • music/playlist.js : liste des musiques (modifiable sans toucher au code).
//   • version.json      : numéro de version (sert à prévenir d'une mise à jour).
//
//  CONSEILS : après chaque modification, recharge la page avec Ctrl+F5.
//  Si le jeu reste blanc, ouvre la console du navigateur (F12) : l'erreur
//  indique le numéro de ligne à corriger.
// ============================================================================


// ======================================================================
// DONNÉES DE BASE : ÉQUIPES, JOUEURS ET RÉGLAGES
// ======================================================================
// Liste des équipes de la ligue : [nom, niveau (1 à 20), icône]. Le niveau influence la force des
// joueurs créés pour l'équipe.
let T = [
  ['Snow Kids', 13, '⟦sk⟧'],
  ['Shadows', 15, '⟦sh⟧'],
  ['Team Paradisia', 15, '⟦pa⟧'],
  ['Lightnings', 16, '⟦lt⟧'],
  ['Wambas', 10, '⟦wa⟧'],
  ['Rykers', 12, '⟦ry⟧'],
  ['Xenons', 14, '⟦xe⟧'],
  ['Tigres Rouges', 10, '⟦ti⟧'],
  ['Pirates', 9, '⟦pi⟧'],
  ['Elektras', 11, '⟦el⟧'],
  ['Cyclopes', 10, '⟦cy⟧'],
  ['Vortex', 14, '⟦kd⟧'],
  ['Technodroids', 14, '⟦te⟧'],
  ['Comet', 11, '⟦vg⟧'],
];
// Joueurs célèbres de la série, placés dans leur équipe d'origine : [nom, poste (GK/DEF/MID/ATT),
// note générale].
const C = {
  'Snow Kids': [
    ['D’Jok', 'ATT', 84],
    ['Micro-Ice', 'ATT', 80],
    ['Sinedd', 'ATT', 82],
    ['Rocket', 'MID', 78],
    ['Tia', 'MID', 76],
    ['Mei', 'DEF', 74],
    ['Thran', 'DEF', 72],
    ['Ahito', 'GK', 76],
  ],
  Lightnings: [
    ['Warren', 'ATT', 80],
    ['Sarlight', 'DEF', 74],
    ['Nitro', 'MID', 76],
  ],
  Xenons: [['Luur', 'ATT', 85]],
  Rykers: [['Kernor', 'GK', 78]],
  Wambas: [['Lune-Zeara', 'DEF', 72]],
  Pirates: [['Stevens', 'DEF', 70]],
};
// Petites aides affichées une seule fois (astuces déjà vues) : mémorisé dans le navigateur.
let A = {};
try {
  A = JSON.parse(localStorage.getItem('gm_a') || '{}');
} catch (e) {}
// Contraste élevé : activé par défaut (tant que le joueur n'a pas fait son choix).
if (A.hc === undefined) A.hc = 1;
// Active ou désactive une astuce, puis la sauvegarde dans le navigateur.
const setA = (k) => {
  A[k] = !A[k];
  try {
    localStorage.setItem('gm_a', JSON.stringify(A));
  } catch (e) {}
  render();
};

/* ===== Paramètres ===== */

// ======================================================================
// RÉGLAGES DU JOUEUR (PARAMÈTRES)
// ======================================================================
// Valeurs PAR DÉFAUT des paramètres (son, musique, notifications, zoom…). Pour changer un réglage
// de départ, modifier la valeur ici.
const STD = {
  ntm: 1,
  ntu: 1,
  ntk: 1,
  nta: 1,
  mus: 1,
  mwh: {},
  musv: 40,
  mtn: 1,
  mshuf: 1,
  mdis: [],
  mord: [],
  zoom: 0,
  hc: 1,
  rm: 0,
  snd: 1,
  vol: 50,
  su: 1,
  sm: 1,
  sn: 1,
  kb: 1,
  hpb: 1,
  sbm: 0, // menu latéral : 0 = classique, 1 = tiroir réduit (icônes seulement)
  as: 1,
  cf: 1,
  sp: 1,
  ht: 1,
  an: 1,
  an3d: 1,
  ancut: 1,
  anfl: 1,
  anamb: 1,
  anp: 0,
  anlite: 0,
};
// Les paramètres actuels du joueur (fusion des valeurs par défaut et de ce qui est enregistré dans
// le navigateur).
let ST = { ...STD };
try {
  const o = JSON.parse(localStorage.getItem('gm_set') || 'null');
  if (o) ST = { ...STD, ...o };
  else {
    ST.zoom = A.big ? 1 : 0;
    ST.hc = A.hc ? 1 : 0;
  }
  // Une seule fois : le contraste élevé passe à « activé » pour tous (le joueur peut ensuite le couper).
  if (!A.hcm) {
    A.hcm = 1;
    A.hc = 1;
    ST.hc = 1;
    localStorage.setItem('gm_a', JSON.stringify(A));
  }
} catch (e) {}
// Enregistre les paramètres dans le navigateur.
const stSave = () => {
  try {
    localStorage.setItem('gm_set', JSON.stringify(ST));
  } catch (e) {}
};
// Change un paramètre (k = nom, v = valeur), l'enregistre et met l'interface à jour.
function setS(k, v) {
  ST[k] = v;
  if (k == 'zoom') A.big = v > 0;
  if (k == 'hc') A.hc = !!v;
  if (k == 'sp') {
    V.sp = v;
    if (V.iv) loop();
  }
  if (k == 'vol' || k == 'snd') sfxInit();
  if (k == 'mus' || k == 'musv' || k == 'mshuf') musSync(k);
  try {
    localStorage.setItem('gm_a', JSON.stringify(A));
  } catch (e) {}
  stSave();
  try {
    MAN.amb.set();
    if (k == 'an' || k == 'anlite') {
      MAN.st.bgk = '';
    }
  } catch (e) {}
  if (k == 'musv') return;
  if (k == 'vol') {
    if (AX.m) AX.m.gain.value = (ST.vol / 100) * 0.3;
    return;
  }
  render();
}
// Remet tous les paramètres à leurs valeurs par défaut.
function stReset() {
  ST = { ...STD };
  A.big = 0;
  A.hc = 1;
  V.sp = 1;
  try {
    localStorage.setItem('gm_a', JSON.stringify(A));
  } catch (e) {}
  stSave();
  render();
}
// Boîte à outils audio partagée (contexte Web Audio, volume général).
const AX = { c: null, m: null, t: 0 };
/* GFM Tracks : liste des pistes. Pour ajouter une vraie piste, ajoutez src:'adresse du fichier audio' (mp3/ogg) ;
   sans src, la piste est générée par synthèse (pistes d'exemple). */

// ======================================================================
// MUSIQUE : LECTEUR, LISTE ET ORDRE DES PISTES
// ======================================================================
// Liste des pistes. Elle se remplit depuis le fichier music/playlist.js (à modifier pour ajouter
// ou retirer une musique).
const MUS = [];
/* La liste des musiques se trouve dans le fichier music/playlist.js (à côté de la page). */
(window.GFM_PLAYLIST || []).forEach((x) => MUS.push(x));
// État du lecteur de musique (piste en cours, minuteur…).
const MU = { cur: null, tm: null, g: null, el: null, nx: 0, step: 0, bars: 0, nb: null, tt: null, kicked: 0 };
// Petites fonctions utilitaires de la musique : où jouer (menu ou match), piste visible, piste
// autorisée, ordre choisi par le joueur.
const musCtxN = () => {
    try {
      return V && V.m && !V.m.done ? 'match' : 'menu';
    } catch (e) {
      return 'menu';
    }
  },
  musWh = (x) => (ST.mwh || {})[x.id] || 'both',
  musVis = (x) => !x.lk || (typeof unl == 'function' && unl(x.lk)),
  musAllow = (x) =>
    musVis(x) && !(ST.mdis || []).includes(x.id) && (musWh(x) == 'both' || musWh(x) == musCtxN()),
  musOrd = () => {
    const o = ST.mord || [],
      ix = (x) => {
        const i = o.indexOf(x.id);
        return i < 0 ? 1e3 + MUS.indexOf(x) : i;
      };
    return MUS.slice().sort((a, b) => ix(a) - ix(b));
  },
  musEn = () => musOrd().filter(musAllow);
// Prépare le moteur audio (démarre le contexte audio du navigateur).
function musCtx() {
  if (!AX.c) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    AX.c = new C();
    AX.m = AX.c.createGain();
    AX.m.gain.value = ((ST.vol || 0) / 100) * 0.3;
    AX.m.connect(AX.c.destination);
  }
  if (AX.c.state == 'suspended') AX.c.resume();
  if (!MU.g) {
    MU.g = AX.c.createGain();
    MU.g.connect(AX.c.destination);
  }
  MU.g.gain.cancelScheduledValues(0);
  MU.g.gain.value = ((ST.musv || 0) / 100) * 0.35;
  return AX.c;
}
// Joue une note synthétique (utilisé par les pistes générées sans fichier).
function musTone(f, t, d, type, v, fc) {
  const c = AX.c,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = type;
  o.frequency.value = f;
  let n = g;
  if (fc) {
    const b = c.createBiquadFilter();
    b.type = 'lowpass';
    b.frequency.value = fc;
    o.connect(b);
    b.connect(g);
  } else o.connect(g);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  g.connect(MU.g);
  o.start(t);
  o.stop(t + d + 0.05);
}
// Génère un son de grosse caisse (pistes synthétiques).
function musKick(t) {
  const c = AX.c,
    o = c.createOscillator(),
    g = c.createGain();
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g);
  g.connect(MU.g);
  o.start(t);
  o.stop(t + 0.2);
}
// Génère un son de charleston (pistes synthétiques).
function musHat(t) {
  const c = AX.c;
  if (!MU.nb) {
    const b = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    MU.nb = b;
  }
  const s = c.createBufferSource(),
    g = c.createGain(),
    f = c.createBiquadFilter();
  s.buffer = MU.nb;
  f.type = 'highpass';
  f.frequency.value = 7000;
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(f);
  f.connect(g);
  g.connect(MU.g);
  s.start(t);
}
// Joue une mesure d'une piste synthétique.
function musStep(tr, s, t) {
  const n = tr.sc.length,
    nf = (d, o) => 110 * Math.pow(2, (tr.k + tr.sc[((d % n) + n) % n] + 12 * (Math.floor(d / n) + o)) / 12),
    r = tr.pr[MU.bars % tr.pr.length],
    bd = (60 / tr.bpm) * 4;
  if (s == 0) {
    musTone(nf(r, 0), t, bd * 0.95, 'sine', 0.55);
    [0, 2, 4].forEach((i) => musTone(nf(r + i, 1), t, bd, 'triangle', 0.12, 1400));
  }
  if (tr.dr) {
    if (s % 4 == 0) musKick(t);
    if (s % 4 == 2) musHat(t);
  }
  const pat = [0, 2, 4, 2, 5, 4, 2, 1];
  if (s % 2 == 0 || tr.w == 'sawtooth')
    musTone(nf(r + pat[(s >> 1) % 8] + (s % 2 ? 2 : 0), 2), t, (60 / tr.bpm) * 0.9, tr.w, 0.09, 2600);
}
// Planifie les prochaines notes d'une piste synthétique.
function musSched() {
  const tr = MU.cur;
  if (!tr || !AX.c) return;
  while (MU.nx < AX.c.currentTime + 1.4) {
    musStep(tr, MU.step, MU.nx);
    MU.nx += 60 / tr.bpm / 4;
    MU.step++;
    if (MU.step >= 16) {
      MU.step = 0;
      MU.bars++;
      if (MU.bars >= tr.bars) {
        clearInterval(MU.tm);
        MU.tm = null;
        MU.tt = setTimeout(() => musNext(), Math.max(500, (MU.nx - AX.c.currentTime) * 1000));
        return;
      }
    }
  }
}
// Arrête la musique en cours.
function musStop(soft) {
  clearInterval(MU.tm);
  MU.tm = null;
  clearTimeout(MU.tt);
  if (MU.el) {
    try {
      MU.el.pause();
    } catch (e) {}
    MU.el = null;
  }
  if (MU.g && AX.c) {
    try {
      MU.g.gain.setTargetAtTime(0, AX.c.currentTime, 0.04);
    } catch (e) {}
  }
  if (!soft) MU.cur = null;
}
// Affiche la notification « En lecture » (titre et artiste) quand une piste démarre.
function musToast(tr) {
  if (!ST.mtn) return;
  ntf({ i: 'music', l: 'En lecture', t: tr.t, s: tr.a, tp: 'mu', d: 5200 });
}
// Lance une piste (fichier mp3 si elle a une adresse 'src'). Gère aussi le blocage du navigateur :
// tant que le joueur n'a pas cliqué, la lecture attend.
function musPlay(tr) {
  musStop(1);
  if (!tr) return;
  MU.cur = tr;
  if (tr.src) {
    try {
      const e = new Audio(tr.src);
      e.volume = Math.min(1, (ST.musv || 0) / 100);
      e.onended = () => musNext();
      MU.el = e;
      e.play()
        .then(() => {
          if (MU.el === e) {
            musToast(tr);
            musUi();
          }
        })
        .catch(() => {
          if (MU.el === e) {
            MU.el = null;
            MU.cur = null;
            MU.kicked = 0;
            try {
              ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, musKickF, true));
            } catch (z) {}
            musUi();
          }
        });
    } catch (x) {}
  } else {
    if (!musCtx()) return;
    MU.step = 0;
    MU.bars = 0;
    MU.nx = AX.c.currentTime + 0.1;
    MU.tm = setInterval(musSched, 250);
    musSched();
  }
  if (!tr.src) musToast(tr);
  musUi();
}
// Vérifie toutes les 0,5 s que la musique joue bien et enchaîne si besoin.
function musTick() {
  if (!ST.mus || !MU.kicked) return;
  const pl = !!(MU.tm || MU.el || MU.tt);
  if (pl && MU.cur && !musAllow(MU.cur)) musNext();
  else if (!pl && musEn().length) musNext();
}
setInterval(musTick, 500);
// Passe à la piste suivante (aléatoire ou dans l'ordre de la liste, selon le réglage).
function musNext() {
  if (!ST.mus) return;
  const L = musEn();
  if (!L.length) {
    musStop();
    musUi();
    return;
  }
  let p;
  if (ST.mshuf && L.length > 1) {
    do p = L[(Math.random() * L.length) | 0];
    while (p === MU.cur);
  } else {
    const i = L.indexOf(MU.cur);
    p = L[(i + 1) % L.length];
  }
  musPlay(p);
}
// Met à jour le texte « En lecture : … » dans les paramètres.
function musUi() {
  const e = document.getElementById('mnow');
  if (e) e.textContent = MU.cur ? MU.cur.t + ' · ' + MU.cur.a : 'Aucune piste en lecture';
}
// Réagit à un changement de réglage (musique activée, volume, aléatoire).
function musSync(k) {
  if (!ST.mus) {
    musStop();
    musUi();
    return;
  }
  if (k == 'musv') {
    if (MU.g) MU.g.gain.value = ((ST.musv || 0) / 100) * 0.35;
    if (MU.el) MU.el.volume = Math.min(1, (ST.musv || 0) / 100);
    return;
  }
  if (!MU.cur || !musAllow(MU.cur) || (!MU.tm && !MU.el)) musNext();
}
// Coche ou décoche une piste dans la liste des paramètres.
function musTog(id) {
  const d = ST.mdis || [],
    i = d.indexOf(id);
  if (i < 0) d.push(id);
  else d.splice(i, 1);
  ST.mdis = d;
  stSave();
  musSync('mdis');
  render();
}
// Enregistre le nouvel ordre des pistes choisi par le joueur.
function mSet(a) {
  ST.mord = a;
  stSave();
  render();
}
// Monte (-1) ou descend (+1) une piste d'un cran (boutons ▲ ▼).
function mMv(id, d) {
  const a = musOrd().map((x) => x.id),
    i = a.indexOf(id),
    j = i + d;
  if (j < 0 || j >= a.length) return;
  a.splice(i, 1);
  a.splice(j, 0, id);
  mSet(a);
}
// Piste actuellement glissée à la souris (réorganisation par glisser-déposer).
let MDR = null;
// Début du glisser d'une piste.
function mdS(e, id) {
  MDR = id;
  try {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'mus:' + id);
  } catch (_) {}
}
// Pendant le survol : affiche le trait qui montre où la piste va tomber.
function mdO(e, el) {
  if (!MDR) return;
  e.preventDefault();
  const r = el.getBoundingClientRect(),
    dn = e.clientY > r.top + r.height / 2;
  document.querySelectorAll('.mdv,.mdv2').forEach((x) => x.classList.remove('mdv', 'mdv2'));
  el.classList.add(dn ? 'mdv2' : 'mdv');
}
// Dépôt de la piste : calcule la nouvelle position et enregistre l'ordre.
function mdD(e, id) {
  if (!MDR) return;
  e.preventDefault();
  const el = e.currentTarget,
    r = el.getBoundingClientRect(),
    dn = e.clientY > r.top + r.height / 2,
    a = musOrd()
      .map((x) => x.id)
      .filter((x) => x != MDR);
  let k = a.indexOf(id);
  if (k < 0) k = a.length;
  a.splice(dn ? k + 1 : k, 0, MDR);
  MDR = null;
  mSet(a);
}
// Fin du glisser : nettoie les traits d'aide.
function mdE() {
  MDR = null;
  document.querySelectorAll('.mdv,.mdv2').forEach((x) => x.classList.remove('mdv', 'mdv2'));
}
// Choisit où une piste est jouée : partout, menus ou matchs.
function mWh(id, v) {
  ST.mwh = ST.mwh || {};
  ST.mwh[id] = v;
  stSave();
  musTick();
  render();
}
// Bouton « Lire » : joue la piste choisie tout de suite.
function mPlay(id) {
  const tr = MUS.find((x) => x.id == id);
  if (!tr) return;
  if ((ST.mdis || []).includes(id)) {
    ST.mdis = ST.mdis.filter((x) => x != id);
    stSave();
  }
  if (!ST.mus) {
    ST.mus = 1;
    stSave();
  }
  musPlay(tr);
  render();
}
// Construit la section « Musique » des paramètres (liste des pistes, case à cocher, ordre, bouton
// Lire).
function musSec() {
  const row = (x, i, A) =>
    `<div class="mrow${MU.cur === x ? ' on' : ''}" draggable="true" data-mid="${x.id}" ondragstart="mdS(event,'${x.id}')" ondragover="mdO(event,this)" ondragleave="this.classList.remove('mdv','mdv2')" ondrop="mdD(event,'${x.id}')" ondragend="mdE()"><span class="mgrip" title="Glisser pour réorganiser">≡</span><div class="mup"><button class="mar" ${i ? '' : 'disabled'} title="Monter" onclick="mMv('${x.id}',-1)">▲</button><button class="mar" ${i < A.length - 1 ? '' : 'disabled'} title="Descendre" onclick="mMv('${x.id}',1)">▼</button></div><div class="gtkc" onclick="musTog('${x.id}')"><u class="gtkb${(ST.mdis || []).includes(x.id) ? '' : ' on'}"></u><div class="gtkt"><b>${x.t}</b><em>${x.a}</em></div></div><select class="mwh" title="Où jouer cette piste" onchange="mWh('${x.id}',this.value)">${[
      ['both', 'Partout'],
      ['menu', 'Menus'],
      ['match', 'Matchs'],
    ]
      .map(([v, n]) => `<option value="${v}" ${musWh(x) == v ? 'selected' : ''}>${n}</option>`)
      .join('')}</select><button onclick="mPlay('${x.id}')">Lire</button></div>`;
  return (
    stSw('mus', 'Musique activée', 'Lecture continue des pistes cochées ci-dessous.') +
    `<label class="stl"><span><b>Volume de la musique</b></span><input type="range" min="0" max="100" step="5" value="${ST.musv}" oninput="setS('musv',+this.value)" style="width:150px"></label>` +
    stSw(
      'mtn',
      'Notification de piste',
      'Affiche le titre et l’artiste en bas à droite à chaque changement de piste.',
    ) +
    stSw('mshuf', 'Lecture aléatoire', 'Sinon, les pistes se suivent dans l’ordre de la liste.') +
    `<div class="mu" style="margin:8px 0 4px">En lecture : <b id="mnow">${MU.cur ? MU.cur.t + ' · ' + MU.cur.a : 'Aucune piste en lecture'}</b></div><div class="mlist">${((A) => A.map((x, i) => row(x, i, A)).join(''))(musOrd().filter(musVis))}</div><div class="ctl" style="margin-top:6px"><button onclick="musNext()" ${ST.mus ? '' : 'disabled'}>Piste suivante</button></div>`
  );
}
// Relance la musique après le premier clic du joueur (les navigateurs interdisent le son
// automatique).
function musKickF() {
  if (MU.kicked) return;
  MU.kicked = 1;
  ['pointerdown', 'keydown'].forEach((e) => document.removeEventListener(e, musKickF, true));
  if (ST.mus && !MU.cur) musNext();
}
try {
  ['pointerdown', 'keydown'].forEach((e) => document.addEventListener(e, musKickF, true));
} catch (e) {}
try {
  setTimeout(() => {
    if (ST.mus && !MU.cur) musNext();
  }, 400);
} catch (e) {}
/* GFM Mises à jour : lit version.json (à côté de la page) pour prévenir le joueur. Ne recharge jamais tout seul. */

// ======================================================================
// ANNONCE DES MISES À JOUR (fichier version.json)
// ======================================================================
// État du système d'annonce de mise à jour.
const UPD = { j: null, off: 0, t: 0 };
// Transforme un numéro de version en liste de nombres pour pouvoir les comparer.
function updNum(v) {
  return String(v || '')
    .split('.')
    .map((x) => parseInt(x) || 0);
}
// Dit si la version a est plus récente que la version b.
function updNewer(a, b) {
  const x = updNum(a),
    y = updNum(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d > 0;
  }
  return false;
}
// Vrai si un match est en cours (on ne propose jamais de recharger pendant un match).
function updInMatch() {
  try {
    return !!(V && V.m && !V.m.done);
  } catch (e) {
    return false;
  }
}
// Met une date au format français (« 20 novembre à 08h00 »).
function updFmt(d) {
  try {
    return (
      d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) +
      ' à ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
    );
  } catch (e) {
    return '';
  }
}
// Sauvegarde la partie puis recharge la page (bouton « Recharger »).
function updGo() {
  try {
    if (typeof save == 'function') save();
  } catch (e) {}
  try {
    stSave();
  } catch (e) {}
  location.reload();
}
// Masque le bandeau de mise à jour (bouton « Plus tard » / « OK »).
function updHide() {
  UPD.off = 1;
  updShow();
}
// Affiche ou retire le bandeau en haut à droite selon le contenu de version.json.
function updShow() {
  let el = document.getElementById('updb');
  const j = UPD.j;
  let h = '';
  if (j && !UPD.off) {
    if (j.version && updNewer(j.version, GV)) {
      h = updInMatch()
        ? ''
        : `<b>Nouvelle version disponible</b><span>La version ${j.version} est en ligne. Recharge quand tu veux : ta partie est sauvegardée.</span><div><button class="p" onclick="updGo()">Recharger</button><button onclick="updHide()">Plus tard</button></div>`;
    } else if (j.next && j.next.date) {
      const d = new Date(j.next.date);
      if (!isNaN(d) && d > new Date()) {
        h = `<b>Mise à jour prévue</b><span>La version ${j.next.version || ''} arrive le ${updFmt(d)}.${j.next.msg ? ' ' + j.next.msg : ' Pense à terminer ton match avant.'}</span><div><button onclick="updHide()">OK</button></div>`;
      }
    }
  }
  if (!h) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('div');
    el.id = 'updb';
    document.body.appendChild(el);
  }
  if (el.dataset.h !== h) {
    el.innerHTML = h;
    el.dataset.h = h;
  }
}
// Lit version.json (à côté de la page) pour savoir si une mise à jour est annoncée ou disponible.
// Appelée toutes les 5 minutes.
async function updCheck() {
  if (!/^https?:$/.test(location.protocol)) return;
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    UPD.j = await r.json();
  } catch (e) {
    return;
  }
  updShow();
}
setTimeout(updCheck, 2500);
setInterval(updCheck, 300000);
setInterval(() => {
  if (UPD.j) updShow();
}, 3000);
/* ===== Notifications, titres, récompenses cachées, retraites (propres à chaque carrière) ===== */

// ======================================================================
// NOTIFICATIONS (TOASTS), TITRES, RÉCOMPENSES ET RETRAITES
// ======================================================================
// File d'attente des notifications à afficher (maximum 4 en attente).
const NQ = [];
let NQB = 0;
// Ajoute une notification dans la file. Format : {i: icône, l: étiquette, t: titre, s: sous-titre,
// d: durée en ms}.
function ntf(o) {
  try {
    if (!o || (o.tp == 'm' && ST.ntm === 0) || (o.tp == 'u' && ST.ntu === 0) || (o.tp == 'k' && ST.ntk === 0))
      return;
    if (V.tour != null) return; // pas de notifications pendant la visite guidée
    NQ.push(o);
    if (NQ.length > 4) NQ.splice(0, NQ.length - 4);
    if (!NQB) ntfNext();
  } catch (e) {}
}
// Affiche la notification suivante de la file, avec son animation d'entrée et de sortie.
function ntfNext() {
  const o = NQ.shift();
  if (!o) {
    NQB = 0;
    return;
  }
  NQB = 1;
  let e = document.getElementById('mtoast');
  if (!e) {
    e = document.createElement('div');
    e.id = 'mtoast';
    e.className = 'mtoast';
    document.body.appendChild(e);
  }
  e.classList.remove('on');
  e.dataset.tp = o.tp || 's'; // type de notification : sa couleur change (musique, mail, déblocage, manager, sauvegarde, système)
  e.innerHTML =
    '<span class="mto"><svg class="ic" aria-hidden="true"><use href="#i-' +
    (o.i || 'star') +
    '"/></svg></span><div><small></small><b></b><span></span></div>';
  e.querySelector('small').textContent = o.l || '';
  e.querySelector('b').textContent = o.t || '';
  e.querySelector(':scope>div>span').textContent = o.s || '';
  e.style.pointerEvents = o.go ? 'auto' : 'none';
  e.style.cursor = o.go ? 'pointer' : '';
  e.onclick = o.go
    ? () => {
        e.classList.remove('on');
        try {
          if (S) {
            V.menu = 0;
            V.stp = 0;
            V.sb = 0;
            V.tab = o.go;
            render();
          }
        } catch (x) {}
      }
    : null;
  void e.offsetWidth;
  e.classList.add('on');
  clearTimeout(e._t);
  e._t = setTimeout(() => {
    e.classList.remove('on');
    setTimeout(ntfNext, 450);
  }, o.d || 4200);
}
// Accès aux récompenses de la partie en cours (titres, décorations, ballons débloqués).
const RW = () => {
    S.rw = S.rw || { tt: [], ts: null, uk: {} };
    return S.rw;
  },
  unl = (id) => !!(S && S.rw && S.rw.uk && S.rw.uk[id]),
  YR = (s) => 2025 + (s || (S && S.season) || 1);
// Tables des titres de joueurs et d'équipe (noms, textes, conditions).
const PTN = {
    g: 'Meilleur buteur',
    a: 'Meilleur passeur',
    sv: 'Meilleur gardien',
    mm: 'Joueur de la saison',
    cs: 'Mur de la saison',
    jn: 'Meilleur jeune',
  },
  PTL = { bt: 'Buteur prolifique', pa: 'Passeur d’élite', rm: 'Rempart', fd: 'Fidèle du club' },
  CNM = { L: 'de la League', C: 'de la Cup' },
  TTN = {
    champ: 'Champions de la League',
    cup: 'Vainqueurs de la Cup',
    inv: 'Saison invaincue',
    att: 'Meilleure attaque',
    def: 'Meilleure défense',
    dyn: 'Dynastie',
    ret: 'Retour des cendres',
    cos: 'Équipe cosmopolite',
    cc: 'Carton plein',
    fan: 'Supporter n°1',
  },
  KDEC = [
    ['star', 'Étoiles', 'champ'],
    ['bolt', 'Éclair', 'att'],
    ['grad', 'Dégradé', 'cup'],
    ['check', 'Damier', 'inv'],
    ['wave', 'Vagues', 'def'],
    ['dia', 'Losanges', 'dyn'],
  ],
  RTP = { GK: 'Gardien', DEF: 'Défenseur', MID: 'Milieu', ATT: 'Attaquant' },
  ttName = (x) =>
    x.k == 'cup'
      ? x.c == 'C'
        ? 'Vainqueurs de la Galactik Cup'
        : 'Vainqueurs de la Coupe de la Ligue'
      : TTN[x.k],
  ttYr = (x) => x.k != 'cc' && x.k != 'fan',
  ttFull = (x) => ttName(x) + (ttYr(x) ? ' · ' + x.y : ''),
  ptFull = (x) =>
    PTN[x.k]
      ? PTN[x.k] +
        (x.k == 'mm' || x.k == 'cs' ? ' (' + (x.c == 'C' ? 'Cup' : 'League') + ')' : ' ' + (CNM[x.c] || '')) +
        ' · ' +
        x.y
      : PTL[x.k] || x.k;
// Débloque une récompense (titre, ballon, décoration…) et affiche une notification.
function unlock(id, label, ic) {
  const R = RW();
  if (R.uk[id]) return;
  R.uk[id] = YR();
  ntf({ i: ic || 'star', l: 'Débloqué', t: label, s: 'Voir la galerie', tp: 'u', go: 'gal', d: 5000 });
}
// Ajoute un titre d'équipe à la collection de la partie.
function addTt(k, c) {
  const R = RW(),
    y = YR(),
    x = { k, y, c: c || 'L' };
  if (R.tt.some((z) => z.k == k && z.c == x.c && (!ttYr(z) || z.y == y))) return;
  R.tt.push(x);
  ntf({ i: 'trophy', l: 'Titre débloqué', t: ttFull(x), s: 'Voir la galerie', tp: 'u', go: 'gal', d: 5000 });
  const d = KDEC.find((z) => z[2] == k);
  if (d) unlock('kd_' + d[0], 'Décoration de maillot : ' + d[1], 'star');
  const bl = BALLS.find((z) => z[0] == k && k != 'cl' && k != 'win' && k != 'adx');
  if (bl) unlock('bl_' + bl[0], 'Ballon : ' + bl[1], 'ball');
  if (k == 'champ') unlock('bl_lw', 'Ballon : Gagnant de la Ligue', 'ball');
  if (k == 'cup') unlock('bl_cw', 'Ballon : Gagnant de la Cup', 'ball');
}
// Après un match : vérifie si une récompense doit être débloquée (première victoire, carton
// plein…).
function rwMatch(g, c, o) {
  if (g > c) unlock('bl_win', 'Ballon : Première victoire', 'ball');
  if (g > c)
    [
      ['Wambas', 'wam'],
      ['Rykers', 'ryk'],
      ['Shadows', 'sh2'],
      ['Lightnings', 'x_lt'],
      ['Xenons', 'x_xe'],
      ['Elektras', 'x_el'],
      ['Cyclopes', 'x_cy'],
      ['Vortex', 'x_kd'],
      ['Technodroids', 'x_te'],
      ['Comet', 'x_vg'],
    ].forEach(([n, k]) => {
      if (o == n || me().name == n) unlock('bl_' + k, 'Ballon : ' + (BALLS.find((z) => z[0] == k) || [])[1], 'ball');
    });
  if (g - c >= 5) addTt('cc', 'L');
}
let _sc = 0,
  _st = 0;
// Gestion du clic sur le bandeau d'actualités (en bas de l'écran).
function sbeClk() {
  clearTimeout(_st);
  _sc++;
  _st = setTimeout(() => (_sc = 0), 1800);
  if (_sc >= 7) {
    _sc = 0;
    try {
      addTt('fan', 'L');
      save();
    } catch (e) {}
  }
}
// Fin de saison : attribue les titres aux joueurs (meilleur buteur, meilleur passeur…) selon leurs
// statistiques.
function rwSeason(teams, K, mine, cx, X) {
  const R = RW(),
    y = YR(),
    ps = [];
  teams.forEach((t) => (t.sq || []).filter(Boolean).forEach((p) => ps.push([p, t])));
  const give = (p, t, k, c) => {
      p.tt = p.tt || [];
      if (PTN[k] ? 0 : p.tt.some((z) => z.k == k)) return;
      p.tt.push({ k, y, c });
      if (t === mine)
        ntf({
          i: 'trophy',
          l: 'Titre pour ' + p.n,
          t: ptFull({ k, y, c }),
          s: 'Voir sa fiche',
          tp: 'u',
          d: 4800,
        });
    },
    val = (p, k) => {
      const o = p.ss || {};
      return k == 'g'
        ? p.g || 0
        : k == 'jn'
          ? (p.age || 30) <= 21
            ? (p.g || 0) + (o.a || 0)
            : 0
          : k == 'sv'
            ? p.p == 'GK'
              ? o.sv || 0
              : 0
            : k == 'cs'
              ? p.p == 'GK' || p.p == 'DEF'
                ? o.cs || 0
                : 0
              : o[k] || 0;
    },
    mn = { g: 3, a: 3, sv: 5, mm: 2, cs: 2, jn: 2 };
  Object.keys(PTN).forEach((k) => {
    let b = null,
      v = 0;
    ps.forEach(([p, t]) => {
      const x = val(p, k);
      if (x > v) {
        v = x;
        b = [p, t];
      }
    });
    if (b && v >= mn[k]) give(b[0], b[1], k, cx);
  });
  ps.forEach(([p, t]) => {
    const cr = p.cr || {},
      o = p.ss || {};
    if (t === mine) p.ys = (p.ys || 0) + 1;
    const g = (cr.g || 0) + (p.g || 0),
      a = (cr.a || 0) + (o.a || 0),
      cs = (cr.cs || 0) + (o.cs || 0);
    if (g >= 50) give(p, t, 'bt', cx);
    if (a >= 50) give(p, t, 'pa', cx);
    if (cs >= 30 && (p.p == 'GK' || p.p == 'DEF')) give(p, t, 'rm', cx);
    if (t === mine && (p.ys || 0) >= 5) give(p, t, 'fd', cx);
  });
  if (mine) {
    const T = mine,
      se = K.se[K.se.length - 1] || {},
      ix = teams.indexOf(T);
    if (cx == 'L' || cx == 'D') {
      if (se.rk == 1) {
        addTt('champ', 'L');
        tbPay('le championnat');
      }
      if ((T.l || 0) == 0 && (T.pl || 0) >= 8) addTt('inv', 'L');
      const mg = Math.max(...teams.map((t) => t.gf || 0)),
        ma = Math.min(...teams.map((t) => (t.ga == null ? 999 : t.ga)));
      if (mg > 0 && (T.gf || 0) == mg) addTt('att', 'L');
      if ((T.pl || 0) > 0 && (T.ga || 0) == ma) addTt('def', 'L');
      const L3 = K.se.slice(-3);
      if (L3.length == 3 && L3.every((z) => z.rk == 1)) addTt('dyn', 'L');
      const pv = K.se[K.se.length - 2];
      if (pv && pv.rk >= Math.ceil(teams.length * 0.6) && se.rk && se.rk <= 3) addTt('ret', 'L');
      const pl = new Set(T.sq.map((p) => planet(p.og || T.name)));
      if (pl.size >= 7) addTt('cos', 'L');
    }
    if (X && X.cup && X.cup.champ === ix && ix >= 0) {
      addTt('cup', cx == 'C' ? 'C' : 'L');
      if (cx == 'C') tbPay('la Cup');
    }
  }
}
/* --- Retraites --- */
// Prénoms utilisés pour les cérémonies de retraite.
const rtNames = [
  ['Kael', 'Nyra', 'Zane', 'Orin', 'Juno', 'Rex', 'Mira', 'Tovi'],
  ['Voss', 'Korr', 'Nyx', 'Reyes', 'Storm', 'Fenn', 'Kell', 'Doyle'],
];
// Remplace un joueur retraité par un jeune talent.
function rtYoung(t, old) {
  const U = new Set(S.teams.flatMap((x) => x.sq.map((p) => p.n))),
    r = Math.random;
  return {
    n: uname(U, rtNames[0], rtNames[1]),
    p: old.p,
    o: Math.max(45, Math.min(70, old.o - 8)),
    e: 100,
    f: (30 + r() * 50) | 0,
    g: 0,
    age: 19 + ((r() * 3) | 0),
    ct: 2 + ((r() * 3) | 0),
    mp: 0,
    pt: Math.min(88, old.o + 4),
    og: t.name,
  };
}
// Prépare la fiche de retraite d'un joueur.
function rtOne(t, p, mine) {
  const cr = p.cr || {},
    r = {
      n: p.n,
      p: p.p,
      o: p.o,
      age: p.age,
      y: YR(),
      g: cr.g || 0,
      a: cr.a || 0,
      ys: p.ys || 0,
      tt: (p.tt || []).slice(),
      num: pnum(t, p),
      st: 'pending',
    };
  rmP(t, p);
  if (mine) {
    S.ret = S.ret || [];
    S.ret.push(r);
    mail(
      'Retraite de ' + p.n,
      p.n + ' (' + p.age + ' ans) met un terme à sa carrière. Le club organise ses adieux.',
    );
    unlock('bl_adx', 'Ballon : Adieux', 'ball');
  } else {
    t.sq.push(rtYoung(t, p));
    try {
      autoLU(t);
    } catch (e) {}
    if (p.o >= 75)
      mail('Retraite : ' + p.n, p.n + ' (' + t.name + ') raccroche les crampons à ' + p.age + ' ans.');
  }
}
// Fait partir à la retraite les joueurs âgés d'une équipe en fin de saison.
function rtTeam(t, ti) {
  if (!S || t.nat || ti == null) return;
  const mine = t === me(),
    out = t.sq.filter((p) => p.lastY && !p.ln);
  out.forEach((p) => rtOne(t, p, mine));
  const nx = t.sq.filter(
    (p) =>
      !p.lastY &&
      !p.ln &&
      (p.age || 0) >= 34 &&
      (Math.random() < Math.min(0.85, ((p.age || 0) - 33) * 0.22) || (p.age || 0) >= 39),
  );
  nx.forEach((p) => {
    p.lastY = 1;
    if (mine)
      mail(
        'Dernière saison pour ' + p.n,
        p.n +
          ' annonce que la saison qui commence sera sa dernière. Préparez la relève et organisez de beaux adieux.',
      );
  });
  if (mine && out.length && sqN(t) < 10)
    mail(
      'Effectif réduit',
      'Les retraites laissent l’effectif à ' + t.sq.length + ' joueurs : pensez à recruter.',
    );
}
// Fenêtre de cérémonie d'adieu d'un joueur retraité de ton club.
function fwBox() {
  try {
    if (!S || !S.ret || V.menu || V.stp || V.mc || V.ed || (V.m && !V.m.done)) return '';
    const r = S.ret.find((x) => x.st == 'pending');
    if (!r) return '';
    const t = me(),
      k = kitOf(t),
      C = (S.coaches || []).length,
      full = C >= 3;
    return `<div class="mo"><div class="card fwc"><div class="mu" style="text-transform:uppercase;letter-spacing:.14em">Cérémonie d’adieu</div><h1 style="margin:4px 0 8px">${r.n}</h1><div>${jersey(k, r.num, r.n, 120)}</div><div class="mu" style="margin:6px 0">${RTP[r.p] || r.p} · ${r.age} ans · niveau ${r.o}${r.ys ? ' · ' + r.ys + ' saison' + (r.ys > 1 ? 's' : '') + ' au club' : ''}</div><div>${r.g} but${r.g > 1 ? 's' : ''} · ${r.a} passe${r.a > 1 ? 's' : ''} décisive${r.a > 1 ? 's' : ''}</div>${
      r.tt.length
        ? `<div style="margin:8px 0">` +
          r.tt
            .slice()
            .reverse()
            .slice(0, 5)
            .map((x) => `<div class="mu">★ ${ptFull(x)}</div>`)
            .join('') +
          `</div>`
        : ''
    }<p style="margin:10px 0">Le stade se lève pour saluer une dernière fois ${r.n}. ${full ? 'Votre staff compte déjà 3 coachs : il ne peut pas rester.' : 'Voulez-vous le garder au club comme coach ?'}</p>${
      full
        ? ''
        : `<div class="ctl" style="justify-content:center">${Object.keys(NS)
            .map((q) => `<button class="p" onclick="fwDo('${q}')">${NS[q][0]} +1</button>`)
            .join(
              '',
            )}</div><div class="mu" style="font-size:12px">Chaque coach augmente d’un niveau le domaine choisi (3 coachs maximum, 12 crédits par match chacun).</div>`
    }<div class="ctl" style="justify-content:center;margin-top:10px"><button onclick="fwDo('go')">Le laisser partir</button></div></div></div>`;
  } catch (e) {
    return '';
  }
}
// Action choisie pendant la cérémonie d'adieu (garder le joueur comme coach, etc.).
function fwDo(k) {
  const r = (S.ret || []).find((x) => x.st == 'pending');
  if (!r) return;
  if (k == 'go' || (S.coaches || []).length >= 3) {
    r.st = 'left';
    const ai = S.teams.map((t, i) => i).filter((i) => i != S.t),
      tn = S.teams[ai[(Math.random() * ai.length) | 0]].name;
    r.to = tn;
    mail('Reconversion de ' + r.n, r.n + ' devient entraîneur de ' + tn + '. Merci pour tout.');
  } else {
    S.coaches = S.coaches || [];
    S.coaches.push({ n: r.n, p: r.p, k, y: YR() });
    r.st = 'kept';
    r.k = k;
    mail(
      'Un nouveau coach',
      'Ancien ' +
        (RTP[r.p] || 'joueur').toLowerCase() +
        ' du club, ' +
        r.n +
        ' rejoint le staff : ' +
        NS[k][0] +
        ' +1 niveau.',
    );
  }
  save();
  render();
}
// Retire un coach de l'effectif.
function coachOff(i) {
  const c = (S.coaches || [])[i];
  if (!c) return;
  S.coaches.splice(i, 1);
  const r = (S.ret || []).find((x) => x.n == c.n);
  if (r) r.st = 'left';
  mail('Coach libéré', c.n + ' quitte le staff.');
  save();
  render();
}
// Bonus de niveau de staff apporté par les coachs.
const stBonus = (k) => (S && S.coaches ? S.coaches.filter((c) => c.k == k).length : 0),
  stL = (k) => (S.staff[k] || 0) + stBonus(k);
// Affiche la carte « Coachs » (anciens joueurs devenus coachs).
function coachCard() {
  const C = S.coaches || [];
  return `<h2>Coachs</h2><div class="card">${C.length ? C.map((c, i) => `<div class="row"><span class="nm">${c.n} <span class="mu">ancien ${(RTP[c.p] || 'joueur').toLowerCase()} · ${NS[c.k][0]} +1</span></span><button onclick="coachOff(${i})">Libérer</button></div>`).join('') : '<div class="mu">Aucun coach. Les joueurs qui prennent leur retraite peuvent rester au club comme coach : +1 niveau dans un domaine du staff (3 coachs maximum, 12 crédits par match chacun).</div>'}</div>`;
}
/* --- Titres d'équipe, fiche joueur, galerie --- */
// Fenêtre de choix du titre d'équipe affiché sous le nom du club.
function ttBox() {
  try {
    if (!V.ttl || !S) return '';
    const R = RW();
    return `<div class="mo" onclick="V.ttl=0;render()"><div class="card" style="max-width:420px;width:100%" onclick="event.stopPropagation()"><b style="font-size:18px">Titre du club</b><div class="mu" style="margin:2px 0 8px">Affiché sous le nom de votre club. Les titres se gagnent en jouant.</div><div class="ctl" style="flex-direction:column;align-items:stretch"><button class="${R.ts == null ? 'p' : ''}" onclick="R_ts(null)">Aucun titre</button>${R.tt.map((x, i) => `<button class="${R.ts === i ? 'p' : ''}" onclick="R_ts(${i})">${ttFull(x)}</button>`).join('')}</div><div class="ctl" style="margin-top:10px"><button onclick="V.ttl=0;render()">Fermer</button></div></div></div>`;
  } catch (e) {
    return '';
  }
}
// Choisit le titre d'équipe affiché.
function R_ts(i) {
  RW().ts = i;
  V.ttl = 0;
  save();
  render();
}
// Texte du titre d'équipe actuellement choisi.
const tsTxt = () => {
  const R = S.rw;
  if (!R || !R.tt.length) return '';
  const x = R.tt[R.ts];
  return `<small class="sbtt" role="button" tabindex="0" title="Choisir le titre affiché" onclick="V.ttl=1;render()">${x ? ttFull(x) : 'Choisir un titre'}</small>`;
};
// Section « Titres » de la fiche d'un joueur.
function ptSec(p) {
  if (!p.tt || !p.tt.length) return '';
  return (
    '<h2>Titres</h2>' +
    p.tt
      .slice()
      .reverse()
      .slice(0, 8)
      .map((x) => `<div class="mu" style="color:inherit">★ ${ptFull(x)}</div>`)
      .join('')
  );
}
// Conditions pour obtenir les titres (affichées dans les bulles au survol de la Galerie).
const TTH = {
    champ: 'Terminer la saison champion de la League.',
    cup: 'Remporter une coupe (Galactik Cup ou Coupe de la Ligue).',
    inv: 'Finir une saison de League sans aucune défaite.',
    att: 'Avoir la meilleure attaque de la League en fin de saison.',
    def: 'Avoir la meilleure défense de la League en fin de saison.',
    dyn: 'Être champion de la League trois saisons de suite.',
    ret: 'Remonter au classement après une mauvaise saison.',
    cos: 'Aligner 7 planètes différentes dans l’effectif.',
    cc: 'Gagner un match avec 5 buts d’écart ou plus.',
    fan: 'Un secret à découvrir.',
  },
  PTH = {
    g: 'Être le meilleur buteur de la saison (au moins 3 buts).',
    a: 'Être le meilleur passeur de la saison (au moins 3 passes décisives).',
    sv: 'Avoir le plus d’arrêts de la saison parmi les gardiens (au moins 5).',
    mm: 'Être le joueur le plus souvent homme du match de la saison (au moins 2 fois).',
    cs: 'Être le gardien ou défenseur avec le plus de matchs sans but encaissé (au moins 2).',
    jn: 'Être le jeune de 21 ans ou moins avec le plus de buts et de passes décisives (au moins 2).',
    bt: 'Marquer 50 buts avec le même joueur au cours de sa carrière.',
    pa: 'Faire 50 passes décisives avec le même joueur au cours de sa carrière.',
    rm: 'Gardien ou défenseur : garder sa cage inviolée pendant 30 matchs.',
    fd: 'Rester au moins 5 saisons dans votre club.',
  },
  // Entoure un élément d'une bulle explicative au survol (ou au toucher).
  gtw = (h, t) => `<span class="gtw" tabindex="0">${h}<span class="tip">${t}</span></span>`;
// Page « Galerie » : titres, décorations de maillot et ballons à collectionner (les éléments non
// débloqués restent en « ? ? ? »).
function galView() {
  const R = RW(),
    t = me(),
    kk = kitOf(t),
    chip = (x, h) => (h ? gtw(`<span class="glc">${x}</span>`, '<b>Débloqué</b> : ' + h) : `<span class="glc">${x}</span>`),
    lk = (h) => (h ? gtw('<span class="glc lk">? ? ?</span>', '<b>À débloquer</b> : ' + h) : '<span class="glc lk" title="Pas encore débloqué">? ? ?</span>'),
    card = (h, b) => `<div class="card"><b>${h}</b><div style="margin-top:6px">${b}</div></div>`;
  const kinds = Object.keys(TTN),
    own = [
      ...t.sq.map((p) => [p.n, p.tt || []]),
      ...(S.ret || []).map((r) => [r.n + ' (retraité)', r.tt || []]),
    ].filter(([n, a]) => a.length),
    got = new Set();
  own.forEach(([n, a]) => a.forEach((x) => got.add(x.k)));
  const pk = [...Object.keys(PTN), ...Object.keys(PTL)];
  const dec = KDEC.map((d) =>
      unl('kd_' + d[0])
        ? gtw(`<div class="glk" onclick="setKit('p','${d[0]}')">${jersey({ ...kk, p: d[0] }, null, '', 46)}<span>${d[1]}</span></div>`, `<b>Débloqué</b> : obtenir le titre « ${TTN[d[2]]} ». Touchez pour utiliser ce motif.`)
        : gtw(`<div class="glk lk"><div style="width:46px;height:52px;display:flex;align-items:center;justify-content:center;font-size:22px">?</div><span>? ? ?</span></div>`, `<b>À débloquer</b> : obtenir le titre « ${TTN[d[2]]} » (${TTH[d[2]]})`),
    ).join(''),
    mus = MUS.filter((x) => x.lk)
      .map((x) => (unl(x.lk) ? chip(x.t + ' · ' + x.a) : lk()))
      .join('');
  return (
    `<div class="glw"><h1>Galerie</h1><div class="mu" style="margin-bottom:8px">Vos récompenses de cette carrière. Elles repartent de zéro avec une nouvelle carrière.</div><div class="gl">` +
    card(
      'Titres du club',
      (R.tt.length
        ? `<div style="margin-bottom:6px"><button onclick="V.ttl=1;render()">Choisir le titre affiché</button></div>`
        : '') +
        R.tt.map((x) => chip(ttFull(x), TTH[x.k])).join('') +
        kinds
          .filter((k) => !R.tt.some((x) => x.k == k))
          .map((k) => lk(TTH[k]))
          .join(''),
    ) +
    card(
      'Titres des joueurs',
      (own.length
        ? own
            .map(
              ([n, a]) =>
                `<div class="row"><span class="nm">${n}</span><span>${a
                  .slice()
                  .reverse()
                  .map((x) => chip(ptFull(x), PTH[x.k]))
                  .join('')}</span></div>`,
            )
            .join('')
        : '') +
        pk
          .filter((k) => !got.has(k))
          .map((k) => lk(PTH[k]))
          .join(''),
    ) +
    card('Décorations de maillot', '<div class="gld">' + dec + '</div>') +
    (mus ? card('Musiques bonus', mus) : '') +
    ballsCard() +
    ((S.ret || []).length
      ? card(
          'Anciens joueurs',
          S.ret
            .map(
              (r) =>
                `<div class="row"><span class="nm">${r.n} <span class="mu">${RTP[r.p] || r.p} · retraite ${r.y}</span></span><span class="mu">${r.st == 'kept' ? 'Coach · ' + NS[r.k][0] : r.st == 'left' ? 'Entraîneur à ' + (r.to || 'l’extérieur') : 'Adieux en attente'}</span></div>`,
            )
            .join(''),
        )
      : '') +
    '</div></div>'
  );
}
// Le brassard est mémorisé PAR ÉQUIPE (p.cpt = {nom d'équipe: 1}) : en mode « Les deux », le même joueur est dans le
// club et dans la sélection, chacun a son propre capitaine. (p.cap = ancien format, toujours lu.)
const isCap = (p, t) => !!p && !!t && (p.cap === t.name || !!(p.cpt && p.cpt[t.name]));
const putCap = (p, t) => {
  p.cpt = p.cpt || {};
  p.cpt[t.name] = 1;
};
const clrCap = (p, t) => {
  if (p.cap === t.name) p.cap = 0;
  if (p.cpt) delete p.cpt[t.name];
};
// Score qui sert à choisir automatiquement le capitaine (âge, note, expérience, blessures).
function capSc(p) {
  return (p.age || 26) * 1.2 + p.o * 0.6 + (p.mp || 0) * 0.05 - (p.inj || p.sus ? 30 : 0);
}
// Renvoie le capitaine d'une équipe (le choix du joueur, ou un capitaine par défaut).
function capOf(t) {
  try {
    let c = t.sq.find((p) => isCap(p, t));
    if (c) return c;
    const gone = !!t.hc;
    c = t.sq.slice().sort((a, b) => capSc(b) - capSc(a))[0];
    if (!c) return null;
    t.sq.forEach((p) => clrCap(p, t));
    putCap(c, t);
    t.hc = 1;
    t.capT = gone ? t.pl || 0 : -9;
    if (gone && t == me()) {
      mail(
        'Le capitaine a quitté le club',
        'Il n’est plus dans l’effectif : ' +
          c.n +
          ' est désigné capitaine par défaut. Le vestiaire est un peu secoué (-3 de moral).',
      );
      t.sq.forEach((p) => (p.mo = Math.max(0, (p.mo ?? 60) - 3)));
    }
    return c;
  } catch (e) {
    return null;
  }
}
// Calcule le « niveau de leadership » du capitaine (il grandit avec l'ancienneté).
function capL(t, c) {
  const a = Math.min(1, 0.5 + 0.5 * (((t.pl || 0) - (t.capT ?? -9)) / 3));
  return { l: Math.max(0.6, Math.min(2, 0.8 + ((c.age || 26) - 22) * 0.05 + (c.mp || 0) / 200)), a };
}
// Renvoie le capitaine qui porte le brassard sur le terrain : le capitaine désigné s'il est apte et
// titulaire ; sinon (remplaçant, blessé, suspendu) le titulaire le plus expérimenté prend le brassard.
function capOn(t) {
  const c = capOf(t);
  if (!c) return null;
  if (!c.inj && !c.sus && t.lu.includes(t.sq.indexOf(c))) return c;
  const ex = (p) => (p.mp || 0) + (p.age || 26) * 0.5 + p.o * 0.1;
  return (
    t.lu
      .map((i) => t.sq[i])
      .filter((p) => p && !p.inj && !p.sus)
      .sort((a, b) => ex(b) - ex(a))[0] || null
  );
}
// Quand le capitaine désigné passe remplaçant (changement manuel ou composition auto), il perd le
// brassard : le titulaire le plus expérimenté devient capitaine. Le joueur peut ensuite choisir
// lui-même un autre capitaine depuis la fiche d'un joueur. Retourne le nouveau capitaine (ou null).
function capSync(t) {
  try {
    const m = capOf(t);
    if (!m || t.lu.includes(t.sq.indexOf(m))) return null;
    const n = capOn(t);
    if (!n || n === m) return null;
    clrCap(m, t);
    putCap(n, t);
    t.hc = 1;
    t.capT = t.pl || 0;
    return n;
  } catch (e) {
    return null;
  }
}
// Capitaine suppléant : le joueur qui porte le brassard à la place du capitaine désigné (sinon null).
function capAct(t) {
  const m = capOf(t),
    on = capOn(t);
  return m && on && on !== m ? on : null;
}
// Multiplicateur de force d'équipe apporté par le capitaine (petit bonus).
function capF(t, x) {
  const c = capOn(t);
  if (!c) return 0.996;
  const k = capL(t, c);
  return (1 + 0.008 * k.l * k.a) * (x == c ? 1.004 : 1);
}
// Pendant un match : le capitaine aide l'équipe quand le score est serré ou que l'équipe est
// menée.
function capTick(M, sh) {
  try {
    M.t.forEach((t, i) => {
      if (M.min < 60 || M.sc[i] > M.sc[1 - i]) return;
      const c = capOn(t);
      if (!c) return;
      const k = capL(t, c),
        f = 1 + 0.015 * k.l * k.a;
      sh[i].mid *= f;
      sh[i].a *= f;
    });
  } catch (e) {}
}
// Fin de match : met à jour l'expérience du capitaine.
function capFin(t, g, c) {
  try {
    if (g < c) return;
    const x = capOn(t);
    if (!x) return;
    const k = capL(t, x);
    if (k.l * k.a >= 1)
      t.sq.forEach((p) => {
        p.mo = Math.min(100, (p.mo ?? 60) + 1);
      });
  } catch (e) {}
}
// Nomme un joueur capitaine (depuis sa fiche).
function setCap(i) {
  const t = me(),
    p = t.sq[i],
    o = capOf(t);
  if (!p || isCap(p, t)) return;
  if (o) {
    clrCap(o, t);
    o.mo = Math.max(0, (o.mo ?? 60) - 4);
  }
  putCap(p, t);
  t.hc = 1;
  t.capT = t.pl || 0;
  p.mo = Math.min(100, (p.mo ?? 60) + 3);
  ntf({
    i: 'star',
    l: 'Capitaine',
    t: p.n + ' porte le brassard',
    s: 'Il lui faut quelques matchs pour s’imposer',
  });
  save();
  render();
}
// Petit badge « C » affiché sur les cartes du capitaine.
function capB(p) {
  try {
    if (isCap(p, me())) return '<span class="cpb" title="Capitaine">C</span>';
    return capAct(me()) === p ? '<span class="cpb" title="Capitaine suppléant : le capitaine désigné ne joue pas">C</span>' : '';
  } catch (e) {
    return '';
  }
}
// Section « Capitaine » de la fiche d'un joueur.
function capSec(p, f) {
  try {
    if (f.k != 'sq') return '';
    const t = me(),
      is = isCap(p, t),
      k = is ? capL(t, p) : null,
      st = is
        ? k.a < 1
          ? 'Il prend encore ses marques (effet réduit pendant quelques matchs).'
          : 'Il dirige le vestiaire.'
        : '';
    return (
      '<h2>Capitaine ' +
      hp('cap') +
      '</h2>' +
      (is
        ? '<div class="mu"><b>Capitaine</b> · Leadership ' +
          (k.l >= 1.5 ? '★★★' : k.l >= 1 ? '★★' : '★') +
          ' · ' +
          st +
          '</div>'
        : '<div class="ctl"><button onclick="setCap(' +
          f.i +
          ')">Nommer capitaine</button></div><div class="mu">Capitaine actuel : <b>' +
          ((capOf(t) || {}).n || '-') +
          '</b></div>')
    );
  } catch (e) {
    return '';
  }
}
/* ===== Ballons à collectionner ===== */

// ======================================================================
// BALLONS À COLLECTIONNER
// ======================================================================
// Liste des ballons : [identifiant, nom]. Chacun se débloque par une action en jeu.
const BALLS = [
    ['cl', 'Galactik Football · saison 1'],
    ['win', 'Ballon de Rocket'],
    ['cc', 'All-Stars'],
    ['champ', 'La finale'],
    ['cup', 'Galactik Football · saison 2'],
    ['inv', 'Snow Kids'],
    ['att', 'Tigres Rouges'],
    ['def', 'Pirates'],
    ['dyn', 'Shadows (noir)'],
    ['ret', 'Akillian'],
    ['cos', 'Paradisia'],
    ['fan', 'Plage'],
    ['adx', 'Entraînement'],
    ['wam', 'Wambas'],
    ['ryk', 'Rykers'],
    ['sh2', 'Shadows (vert)'],
    ['x_lt', 'Lightnings'],
    ['x_xe', 'Xenons'],
    ['x_el', 'Elektras'],
    ['x_cy', 'Cyclopes'],
    ['x_kd', 'Vortex'],
    ['x_te', 'Technodroids'],
    ['x_vg', 'Comet'],
    ['lw', 'Gagnant de la Ligue'],
    ['cw', 'Gagnant de la Cup'],
  ],
  // Ballons d'équipe générés : [nom de l'équipe, code du logo, motif]. Les couleurs viennent des maillots.
  TBL = {
    x_lt: ['Lightnings', 'lt', 'v'],
    x_xe: ['Xenons', 'xe', 'h'],
    x_el: ['Elektras', 'el', 'd'],
    x_cy: ['Cyclopes', 'cy', 'r'],
    x_kd: ['Vortex', 'kd', 'v2'],
    x_te: ['Technodroids', 'te', 'h2'],
    x_vg: ['Comet', 'vg', 'd1'],
  },
  // Origine de chaque ballon dans l'univers de la série (affichée dans la galerie).
  BORI = {
    cl: 'Le ballon blanc des matchs au stade Genesis, en saison 1.',
    win: 'Offert à Rocket pour ses 16 ans : blanc, avec deux bandes orange.',
    cc: 'Jaune et noir, utilisé une seule fois pour le grand Match des Étoiles (victoire 5-1).',
    champ: 'Doré, orné d’hexagones et d’étoiles : réservé à la grande finale de la Coupe, dessiné après un concours.',
    cup: 'Blanc et bleu clair, le ballon officiel de la saison 2 au stade Genesis.',
    inv: 'Blanc aux deux bandes bleues, avec l’écusson des Snow Kids au centre.',
    att: 'Rouge et gris, avec l’écusson des Tigres Rouges au centre.',
    def: 'Bleu marine, avec l’écusson des Pirates au centre.',
    dyn: 'Noir aux bandes vertes, avec l’écusson des Shadows au centre.',
    ret: 'Orange à bandes brunes : celui que Thran modifie pour mesurer la vitesse des tirs.',
    cos: 'Turquoise et blanc : le ballon du tournoi prévu sur Paradisia.',
    fan: 'Un ballon de plage, bleu clair et bleu : vu dans une publicité pour lunettes de soleil.',
    adx: 'Orange, bandes brunes et petit écran vert : le ballon des entraînements improvisés.',
    wam: 'Vert, jaune et orange : les couleurs de la planète Wamba, avec l’écusson des Wambas.',
    ryk: 'Jaune vif et gris : un monde pollué par la fumée des usines, avec l’écusson des Rykers.',
    x_lt: 'Aux couleurs des Lightnings, avec l’écusson du club au centre.',
    x_xe: 'Aux couleurs des Xenons, avec l’écusson du club au centre.',
    x_el: 'Aux couleurs des Elektras, avec l’écusson du club au centre.',
    x_cy: 'Aux couleurs des Cyclopes, avec l’écusson du club au centre.',
    x_kd: 'Aux couleurs du club, avec son écusson au centre.',
    x_te: 'Aux couleurs des Technodroids, avec l’écusson du club au centre.',
    x_vg: 'Aux couleurs du club, avec son écusson au centre.',
    lw: 'Le ballon des vainqueurs de la Ligue : bleu royal, couronne de lauriers dorée.',
    cw: 'Le ballon des vainqueurs de la Cup : doré, avec le trophée au centre.',
    sh2: 'La seconde version du ballon des Shadows : vert, bandes noires, écusson au centre.',
  },
  BHINT = {
    cl: 'Ballon de départ',
    win: 'Gagner un match',
    cc: 'Gagner avec 5 buts d’écart',
    champ: 'Être champion de la League',
    cup: 'Gagner une coupe',
    inv: 'Finir une saison invaincu',
    att: 'Avoir la meilleure attaque',
    def: 'Avoir la meilleure défense',
    dyn: 'Être champion 3 saisons de suite',
    ret: 'Remonter au classement après une mauvaise saison',
    cos: 'Aligner 7 planètes dans l’effectif',
    fan: 'Un secret à découvrir',
    adx: 'Organiser les adieux d’un joueur',
    wam: 'Battre les Wambas (ou gagner un match avec eux)',
    ryk: 'Battre les Rykers (ou gagner un match avec eux)',
    sh2: 'Battre les Shadows (ou gagner un match avec eux)',
    x_lt: 'Battre les Lightnings (ou gagner un match avec eux)',
    x_xe: 'Battre les Xenons (ou gagner un match avec eux)',
    x_el: 'Battre les Elektras (ou gagner un match avec eux)',
    x_cy: 'Battre les Cyclopes (ou gagner un match avec eux)',
    x_kd: 'Battre Vortex (ou gagner un match avec eux)',
    x_te: 'Battre les Technodroids (ou gagner un match avec eux)',
    x_vg: 'Battre Comet (ou gagner un match avec eux)',
    lw: 'Remporter la Ligue',
    cw: 'Remporter la Cup',

  };
// Couleurs de chaque ballon (deux teintes).
const BCOL = {
  df: ['#ffffff', '#e4e9f3'],
  cl: ['#ffffff', '#d8dfec'],
  win: ['#ffffff', '#e6e9f2'],
  cc: ['#ffe45c', '#e0a800'],
  champ: ['#ffe58a', '#c58a12'],
  cup: ['#ffffff', '#bfe3ff'],
  inv: ['#ffffff', '#dbe8ff'],
  att: ['#ff6a5a', '#a3141c'],
  def: ['#3a5cc0', '#0d1a4a'],
  dyn: ['#3a3a44', '#0b0b10'],
  ret: ['#ffa04a', '#d9651a'],
  cos: ['#32cfc8', '#0d6b72'],
  fan: ['#9fe0ff', '#2f8fe0'],
  adx: ['#ffa04a', '#d9651a'],
  wam: ['#5fd16a', '#1d7a34'],
  ryk: ['#ffe14a', '#d9a400'],
  sh2: ['#3fcf6a', '#12683a'],
  nb: ['#b4ecff', '#3fa9e6'],
  nbw: ['#ffe28a', '#2a0f4a'],
  lw: ['#7ab0ff', '#1a3a9a'],
  cw: ['#ffe58a', '#d18a10'],
};
// Mémoire des images de ballon déjà dessinées (évite de les redessiner).
const BIM = {};
// Renvoie l'image d'un ballon (utilisée dans l'animation de match).
function ballImg(id) {
  if (!BIM[id]) {
    const im = new Image();
    im.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(ballSvg(id, 64).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    BIM[id] = im;
  }
  return BIM[id];
}
// Renvoie le ballon choisi par le joueur (« cl » = classique).
// Ballons supplémentaires, visibles seulement une fois leur condition remplie.
function hidBalls() {
  const o = [];
  try {
    if (NBU()) {
      o.push(['nb', NB, 'Ballon du duel nocturne', 'Sombre, parcouru de lignes lumineuses.']);
      if (unl('bl_nbw') || (S && S.ach && S.ach.nbm)) o.push(['nbw', 'Maître du ' + NB, 'Remporter le tournoi', 'Noir et or : le ballon du maître de l’arène.']);
    }
    if (mkU()) {
      TBL.mkb = [MKD.n, 'mk', 'd', MKD.pal];
      o.push(['mkb', MKD.n, 'Ballon du club mystère', 'Aux couleurs du club, avec son écusson au centre.']);
    }
  } catch (e) {}
  o.forEach(([i, n, h, b]) => {
    BHINT[i] = h;
    BORI[i] = b;
  });
  return o;
}
// Ballon de l'équipe du joueur (parmi les ballons créés) ; '' si l'équipe n'en a pas.
const TEAMBALL = {
  'Snow Kids': 'inv',
  Shadows: 'dyn',
  'Team Paradisia': 'cos',
  Lightnings: 'x_lt',
  Wambas: 'wam',
  Rykers: 'ryk',
  Xenons: 'x_xe',
  'Tigres Rouges': 'att',
  Pirates: 'def',
  Elektras: 'x_el',
  Cyclopes: 'x_cy',
  Vortex: 'x_kd',
  Technodroids: 'x_te',
  Comet: 'x_vg',
};
function teamBall() {
  try {
    return TEAMBALL[me().name] || '';
  } catch (e) {
    return '';
  }
}
function ballSel() {
  try {
    const k = ST.bl;
    if (k == 'team') return teamBall();
    return k && (k == 'cl' || BALL_PREVIEW || hidBalls().some((z) => z[0] == k) || unl('bl_' + k)) ? k : '';
  } catch (e) {
    return '';
  }
}
// Choisit le ballon utilisé en match (depuis la Galerie).
// TEMPORAIRE : aperçu de tous les ballons de la galerie (mettre à 0 pour revenir au déblocage normal).
const BALL_PREVIEW = 0;
function selBall(id) {
  if (id && id != 'cl' && id != 'team' && !BALL_PREVIEW && !hidBalls().some((z) => z[0] == id) && !unl('bl_' + id)) return;
  ST.bl = id;
  stSave();
  render();
}
// Dessine un ballon en SVG (vectoriel) à la taille demandée.
// Couleurs (clair, foncé) d'un ballon : fixes, ou tirées des maillots pour les ballons d'équipe.
function ballCols(id) {
  const mixc = (h, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - k) + 255 * k).toString(16).padStart(2, '0')).join(''),
    TB = TBL[id],
    PC = TB && (TB[3] || PAL[TB[0]]);
  return PC ? [mixc(PC[0], 0.35), PC[0]] : BCOL[id];
}
function ballSvg(id, s) {
  const mixc = (h, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - k) + 255 * k).toString(16).padStart(2, '0')).join(''),
    TB = TBL[id],
    PC = TB && (TB[3] || PAL[TB[0]]),
    C = ballCols(id) || ['#fff', '#ccc'],
    u = 'bl' + id + s,
    pg = (cx, cy, r, rot) =>
      Array.from({ length: 5 }, (_, i) => {
        const a = rot + (i * 2 * Math.PI) / 5;
        return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
      }).join(' '),
    pents = (f) =>
      `<polygon points="${pg(50, 50, 15, -Math.PI / 2)}" fill="${f}"/>` +
      [0, 1, 2, 3, 4]
        .map((i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + Math.PI / 5;
          return `<polygon points="${pg(50 + 41 * Math.cos(a), 50 + 41 * Math.sin(a), 13, a + Math.PI)}" fill="${f}"/>`;
        })
        .join('') +
      [0, 1, 2, 3, 4]
        .map((i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          const x1 = 50 + 15 * Math.cos(a),
            y1 = 50 + 15 * Math.sin(a),
            x2 = 50 + 28 * Math.cos(a),
            y2 = 50 + 28 * Math.sin(a);
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${f}" stroke-width="2"/>`;
        })
        .join(''),
    star = (x, y, r, f) =>
      `<polygon fill="${f}" points="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map((i) => {
          const rr = i % 2 ? r * 0.45 : r,
            a = -Math.PI / 2 + (i * Math.PI) / 5;
          return (x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1);
        })
        .join(' ')}"/>`;
  // Écusson de l'équipe au centre du ballon (image intégrée, pour fonctionner aussi en animation).
  const lgo = (k) =>
    typeof LGB != 'undefined' && LGB[k]
      ? `<circle cx="50" cy="50" r="21" fill="#fff" fill-opacity=".95" stroke="#0b1020" stroke-opacity=".35" stroke-width="1.6"/><image href="data:image/png;base64,${LGB[k]}" x="32" y="32" width="36" height="36" preserveAspectRatio="xMidYMid meet"/>`
      : '';
  const tp = (m, c) =>
    ({
      v: `<rect x="24" y="0" width="12" height="100" fill="${c}"/><rect x="64" y="0" width="12" height="100" fill="${c}"/>`,
      h: `<rect x="0" y="40" width="100" height="20" fill="${c}"/>`,
      d: `<polygon points="0,30 70,0 100,0 0,60" fill="${c}"/><polygon points="100,40 100,70 30,100 0,100" fill="${c}"/>`,
      r: `<circle cx="50" cy="50" r="36" fill="none" stroke="${c}" stroke-width="9"/>`,
      v2: `<rect x="14" y="0" width="8" height="100" fill="${c}"/><rect x="30" y="0" width="8" height="100" fill="${c}"/><rect x="62" y="0" width="8" height="100" fill="${c}"/><rect x="78" y="0" width="8" height="100" fill="${c}"/>`,
      h2: `<rect x="0" y="16" width="100" height="10" fill="${c}"/><rect x="0" y="74" width="100" height="10" fill="${c}"/>`,
      d1: `<polygon points="0,64 64,0 100,0 100,14 14,100 0,100" fill="${c}" opacity=".95"/>`,
    })[m] || '';
  const D = {
    nb: `<g stroke="#b85a00" stroke-width="1.2" stroke-linejoin="round"><path d="M6 66C0 50 10 44 12 30C20 38 24 46 22 56C28 50 30 44 30 36C38 46 40 62 32 74Z" fill="#ff7a12"/><path d="M94 66C100 50 90 44 88 30C80 38 76 46 78 56C72 50 70 44 70 36C62 46 60 62 68 74Z" fill="#ff7a12"/><path d="M26 98C14 84 20 70 30 60C30 68 36 70 38 62C42 52 40 42 36 34C50 40 58 54 56 66C60 62 62 58 62 52C72 62 76 80 66 98Z" fill="#ff8a1f"/></g><path d="M36 98C32 88 40 80 44 72C46 78 50 78 52 72C58 80 62 90 58 98Z" fill="#ffc83d"/><path d="M12 62C10 54 14 50 16 46C20 52 22 56 20 62Z" fill="#ffc83d"/><path d="M88 62C90 54 86 50 84 46C80 52 78 56 80 62Z" fill="#ffc83d"/>`,    nbw: `<ellipse cx="50" cy="50" rx="44" ry="14" fill="none" stroke="#ffd23f" stroke-width="2.6"/><ellipse cx="50" cy="50" rx="14" ry="44" fill="none" stroke="#ffd23f" stroke-width="2.6"/><polygon points="30,60 34,38 42,50 50,34 58,50 66,38 70,60" fill="#ffd23f" stroke="#7a4a0a" stroke-width="2" stroke-linejoin="round"/>`,
    lw: `<path d="M30 76C16 62 14 38 26 22M70 76C84 62 86 38 74 22" fill="none" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>${[[20,60],[17,48],[19,36],[25,26],[80,60],[83,48],[81,36],[75,26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" fill="#ffd23f" transform="rotate(${x < 50 ? -40 : 40} ${x} ${y})"/>`).join('')}${star(50, 50, 15, '#ffd23f')}`,
    cw: `<path d="M34 28H66V44C66 55 59 60 50 60C41 60 34 55 34 44Z" fill="#fff6c2" stroke="#8a5a0a" stroke-width="2.4"/><path d="M34 33H26C26 44 30 48 36 49M66 33H74C74 44 70 48 64 49" fill="none" stroke="#8a5a0a" stroke-width="2.4"/><rect x="46" y="60" width="8" height="10" fill="#fff6c2" stroke="#8a5a0a" stroke-width="2"/><rect x="36" y="70" width="28" height="7" rx="2" fill="#fff6c2" stroke="#8a5a0a" stroke-width="2"/>${star(50, 42, 6, '#d18a10')}`,
    cl: `<circle cx="50" cy="50" r="30" fill="none" stroke="#aab4c8" stroke-width="3"/><polygon points="61.3,56.5 50.0,63.0 38.7,56.5 38.7,43.5 50.0,37.0 61.3,43.5" fill="#e4e9f3" stroke="#aab4c8" stroke-width="2.4"/><circle cx="88.0" cy="50.0" r="3.2" fill="#aab4c8"/><circle cx="69.0" cy="82.9" r="3.2" fill="#aab4c8"/><circle cx="31.0" cy="82.9" r="3.2" fill="#aab4c8"/><circle cx="12.0" cy="50.0" r="3.2" fill="#aab4c8"/><circle cx="31.0" cy="17.1" r="3.2" fill="#aab4c8"/><circle cx="69.0" cy="17.1" r="3.2" fill="#aab4c8"/>`,
    win: `<path d="M0 34Q50 52 100 34L100 46Q50 64 0 46Z" fill="#ff8a1f"/><path d="M0 58Q50 76 100 58L100 70Q50 88 0 70Z" fill="#ff8a1f"/>`,
    cc: `<polygon fill="#16161c" points="50.0,7.0 51.9,11.5 56.7,11.8 53.0,15.0 54.1,19.7 50.0,17.1 45.9,19.7 47.0,15.0 43.3,11.8 48.1,11.5"/><polygon fill="#16161c" points="78.1,20.6 80.0,25.0 84.8,25.4 81.1,28.5 82.3,33.2 78.1,30.7 74.0,33.2 75.2,28.5 71.5,25.4 76.3,25.0"/><polygon fill="#16161c" points="85.1,51.0 86.9,55.5 91.8,55.8 88.1,59.0 89.2,63.7 85.1,61.2 81.0,63.7 82.1,59.0 78.4,55.8 83.2,55.5"/><polygon fill="#16161c" points="65.6,75.4 67.5,79.9 72.3,80.3 68.6,83.4 69.7,88.1 65.6,85.6 61.5,88.1 62.6,83.4 59.0,80.3 63.8,79.9"/><polygon fill="#16161c" points="34.4,75.4 36.2,79.9 41.0,80.3 37.4,83.4 38.5,88.1 34.4,85.6 30.3,88.1 31.4,83.4 27.7,80.3 32.5,79.9"/><polygon fill="#16161c" points="14.9,51.0 16.8,55.5 21.6,55.8 17.9,59.0 19.0,63.7 14.9,61.2 10.8,63.7 11.9,59.0 8.2,55.8 13.1,55.5"/><polygon fill="#16161c" points="21.9,20.6 23.7,25.0 28.5,25.4 24.8,28.5 26.0,33.2 21.9,30.7 17.7,33.2 18.9,28.5 15.2,25.4 20.0,25.0"/><circle cx="50" cy="50" r="16" fill="#16161c"/><polygon fill="#ffe45c" points="50.0,40.0 52.6,46.4 59.5,46.9 54.3,51.4 55.9,58.1 50.0,54.5 44.1,58.1 45.7,51.4 40.5,46.9 47.4,46.4"/>`,
    champ: `<polygon points="64.7,58.5 50.0,67.0 35.3,58.5 35.3,41.5 50.0,33.0 64.7,41.5" fill="none" stroke="#7a4a12" stroke-width="2.4"/><polygon fill="#fff" points="50.0,41.0 52.4,46.7 58.6,47.2 53.9,51.3 55.3,57.3 50.0,54.0 44.7,57.3 46.1,51.3 41.4,47.2 47.6,46.7"/><polygon points="31.5,35.5 22.0,41.0 12.5,35.5 12.5,24.5 22.0,19.0 31.5,24.5" fill="none" stroke="#7a4a12" stroke-width="2.4"/><polygon fill="#fff" points="22.0,25.0 23.3,28.2 26.8,28.5 24.1,30.7 24.9,34.0 22.0,32.2 19.1,34.0 19.9,30.7 17.2,28.5 20.7,28.2"/><polygon points="87.5,35.5 78.0,41.0 68.5,35.5 68.5,24.5 78.0,19.0 87.5,24.5" fill="none" stroke="#7a4a12" stroke-width="2.4"/><polygon fill="#fff" points="78.0,25.0 79.3,28.2 82.8,28.5 80.1,30.7 80.9,34.0 78.0,32.2 75.1,34.0 75.9,30.7 73.2,28.5 76.7,28.2"/><polygon points="31.5,77.5 22.0,83.0 12.5,77.5 12.5,66.5 22.0,61.0 31.5,66.5" fill="none" stroke="#7a4a12" stroke-width="2.4"/><polygon fill="#fff" points="22.0,67.0 23.3,70.2 26.8,70.5 24.1,72.7 24.9,76.0 22.0,74.2 19.1,76.0 19.9,72.7 17.2,70.5 20.7,70.2"/><polygon points="87.5,77.5 78.0,83.0 68.5,77.5 68.5,66.5 78.0,61.0 87.5,66.5" fill="none" stroke="#7a4a12" stroke-width="2.4"/><polygon fill="#fff" points="78.0,67.0 79.3,70.2 82.8,70.5 80.1,72.7 80.9,76.0 78.0,74.2 75.1,76.0 75.9,72.7 73.2,70.5 76.7,70.2"/>`,
    cup: `<circle cx="50" cy="50" r="32" fill="none" stroke="#5aaef0" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="none" stroke="#9ccdf5" stroke-width="2.4"/><rect x="42" y="30" width="16" height="40" rx="4" fill="#5aaef0"/><rect x="30" y="42" width="40" height="16" rx="4" fill="#5aaef0"/>`,
    inv: `<rect x="26" y="0" width="12" height="100" fill="#2f6fe0"/><rect x="62" y="0" width="12" height="100" fill="#2f6fe0"/>${lgo('sk')}`,
    att: `<circle cx="50" cy="50" r="38" fill="none" stroke="#fff" stroke-width="3.5"/>${lgo('ti')}`,
    def: `<rect x="0" y="42" width="100" height="16" fill="#1d3a96"/>${lgo('pi')}`,
    dyn: `<rect x="22" y="0" width="12" height="100" fill="#2fb36b"/><rect x="66" y="0" width="12" height="100" fill="#2fb36b"/>${lgo('sh')}`,
    ret: `<rect x="0" y="42" width="100" height="14" fill="#6a3a14"/><rect x="42" y="0" width="14" height="100" fill="#6a3a14"/>`,
    cos: `<circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-width="3.5"/>${[[16,56],[76,56],[46,82],[30,20],[70,18]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="8" fill="#fff" transform="rotate(20 ${x + 4} ${y + 4})"/>`).join('')}${[[28,70],[66,72],[86,40],[14,38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#a8e6ff"/>`).join('')}${lgo('pa')}`,
    fan: `<path d="M0 22Q50 40 100 22L100 38Q50 56 0 38Z" fill="#e8f8ff" opacity=".9"/><path d="M0 62Q50 80 100 62L100 78Q50 96 0 78Z" fill="#1e63c0"/>`,
    wam: `<g fill="#ffb02e"><rect x="12" y="46" width="12" height="4" rx="1"/><rect x="16" y="42" width="4" height="12" rx="1"/><circle cx="82" cy="30" r="5"/><circle cx="82" cy="70" r="5"/><polygon points="14,80 24,72 24,88"/></g>${lgo('wa')}`,
    ryk: `<rect x="0" y="12" width="100" height="10" fill="#7a808c"/><rect x="0" y="78" width="100" height="10" fill="#7a808c"/>${lgo('ry')}`,
    sh2: `<rect x="0" y="22" width="100" height="12" fill="#14141a"/><rect x="0" y="66" width="100" height="12" fill="#14141a"/>${lgo('sh')}`,
    adx: `<rect x="0" y="42" width="100" height="14" fill="#6a3a14"/><rect x="42" y="0" width="14" height="100" fill="#6a3a14"/><rect x="38" y="38" width="24" height="18" rx="3" fill="#1d2a1d" stroke="#2fd16b" stroke-width="2"/><rect x="43" y="44" width="14" height="6" fill="#2fd16b"/>`,
  };
  return `<svg class="blsv" width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${u}g" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${C[0]}"/><stop offset="1" stop-color="${C[1]}"/></radialGradient><clipPath id="${u}c"><circle cx="50" cy="50" r="46"/></clipPath></defs><circle cx="50" cy="50" r="46" fill="url(#${u}g)"/><g clip-path="url(#${u}c)">${TB ? tp(TB[2], PC ? PC[1] : '#fff') + lgo(TB[1]) : D[id] || ''}<ellipse cx="36" cy="26" rx="20" ry="11" fill="#fff" opacity=".28" transform="rotate(-30 36 26)"/></g><circle cx="50" cy="50" r="46" fill="none" stroke="#0b1020" stroke-opacity=".55" stroke-width="3"/></svg>`;
}
// Carte « Ballons à collectionner » de la Galerie.
function ballsCard() {
  const cur = ST.bl || '',
    hb = hidBalls(),
    one = ([id, n]) => {
      const ok = id == 'cl' || BALL_PREVIEW || hb.some((z) => z[0] == id) || unl('bl_' + id);
      return ok
        ? gtw(`<div class="glk${cur == id ? ' bsel' : ''}" onclick="selBall('${id}')">${ballSvg(id, 52)}<span>${cur == id ? '✓ ' : ''}${n}</span></div>`, `<b>Débloqué</b> : ${BHINT[id] || ''}.<br><i>${BORI[id] || ''}</i>`)
        : gtw(`<div class="glk lk"><div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:24px">?</div><span>? ? ?</span></div>`, `<b>À débloquer</b> : ${BHINT[id] || 'un secret à découvrir'}.`);
    },
    // Ordre : ballons des autres équipes (dans l'ordre de la Ligue), puis les ballons spéciaux.
    tIds = ['inv', 'dyn', 'sh2', 'cos', 'x_lt', 'wam', 'ryk', 'x_xe', 'att', 'def', 'x_el', 'x_cy', 'x_kd', 'x_te', 'x_vg'],
    own = teamBall(),
    gT = BALLS.filter((z) => tIds.includes(z[0]) && z[0] != own).sort((x, y) => tIds.indexOf(x[0]) - tIds.indexOf(y[0])),
    gS = BALLS.filter((z) => !tIds.includes(z[0])),
    hd = (t) => `<div class="mu" style="grid-column:1/-1;flex-basis:100%;width:100%;font-weight:700;margin-top:6px">${t}</div>`,
    bs = hd('Autres équipes') + gT.map(one).join('') + hd('Ballons spéciaux') + gS.concat(hb.map((z) => [z[0], z[1]])).map(one).join(''),
    tb = teamBall(),
    eq = `<div class="glk${cur ? '' : ' bsel'}" onclick="selBall('')" title="Le ballon blanc de base. La couleur de l’équipe qui a la possession s’affiche autour.">${ballSvg('df', 52)}<span>${cur ? '' : '✓ '}Ballon par défaut</span></div><div class="glk${cur == 'team' ? ' bsel' : ''}" onclick="selBall('team')" title="Le ballon de ton équipe, avec son écusson.">${ballSvg(tb || 'df', 52)}<span>${cur == 'team' ? '✓ ' : ''}Ballon équipe</span></div>`;
  return `<div class="card" style="grid-column:1/-1"><b>Ballons à collectionner</b><div class="mu" style="margin-top:4px">Touchez un ballon débloqué pour l’utiliser en match.</div>${BORI[cur == 'team' ? tb : cur] ? `<div class="mu" style="margin-top:4px"><b>${cur == 'team' ? 'Ballon équipe' : (BALLS.find((z) => z[0] == cur) || [])[1]}</b> : ${BORI[cur == 'team' ? tb : cur]}</div>` : ''}<div style="margin-top:6px"><div class="gld bgd">${eq}${bs}</div></div></div>`;
}
// Prépare le moteur sonore (effets), si les sons sont activés.
function sfxInit() {
  try {
    if (!ST.snd) return;
    if (!AX.c) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      AX.c = new C();
      AX.m = AX.c.createGain();
      AX.m.connect(AX.c.destination);
    }
    AX.m.gain.value = (ST.vol / 100) * 0.3;
    if (AX.c.state == 'suspended') AX.c.resume();
  } catch (e) {}
}
// Joue une note courte (base de tous les effets sonores).
function tone(f, t0, d, ty, g) {
  const c = AX.c,
    o = c.createOscillator(),
    e = c.createGain();
  o.type = ty || 'sine';
  o.frequency.value = f;
  e.gain.setValueAtTime(0, c.currentTime + t0);
  e.gain.linearRampToValueAtTime(g || 0.6, c.currentTime + t0 + 0.01);
  e.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + d);
  o.connect(e);
  e.connect(AX.m);
  o.start(c.currentTime + t0);
  o.stop(c.currentTime + t0 + d + 0.02);
}
// Joue un effet nommé : 'ui' (clic), 'goal' (but), 'whistle' (sifflet)…
function sfx(k) {
  try {
    if (!ST.snd || !ST.vol) return;
    sfxInit();
    if (!AX.c) return;
    const grp = { ui: 'su', goal: 'sm', whistle: 'sm', mail: 'sn', test: 'su' }[k];
    if (grp && !ST[grp]) return;
    if (k == 'ui' || k == 'test') {
      tone(760, 0, 0.07, 'triangle', 0.5);
      if (k == 'test') {
        tone(1140, 0.09, 0.1, 'triangle', 0.5);
        tone(1520, 0.2, 0.14, 'triangle', 0.5);
      }
    } else if (k == 'goal') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'square', 0.25));
    } else if (k == 'whistle') {
      tone(2300, 0, 0.28, 'sine', 0.5);
      tone(2350, 0.32, 0.4, 'sine', 0.5);
    } else if (k == 'mail') {
      tone(880, 0, 0.12, 'sine', 0.5);
      tone(1175, 0.13, 0.2, 'sine', 0.5);
    }
  } catch (e) {}
}
// Mémorise le dernier moment où chaque son a été joué.
const stLast = {};
// Joue un son seulement si le précédent est assez ancien (évite la mitraille de sons).
function sfxD(k, ms) {
  const n = Date.now();
  if (stLast[k] && n - stLast[k] < ms) return;
  stLast[k] = n;
  sfx(k);
}
document.addEventListener(
  'click',
  (e) => {
    if (e.target.closest && e.target.closest('button,.si,.mr,.pc,.mf,.hp')) sfxD('ui', 60);
  },
  true,
);
document.addEventListener('keydown', (e) => {
  if (!ST.kb || !S || V.menu || V.ed || V.hv || V.stp || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && /INPUT|SELECT|TEXTAREA/.test(t.tagName)) return;
  const k = e.key.toLowerCase();
  if (k == 'escape') {
    if (V.pf) {
      V.pf = null;
      render();
    } else if (V.sv) {
      V.sv = 0;
      render();
    }
    return;
  }
  if (k == ' ') {
    e.preventDefault();
    if (V.m && !V.m.done && V.tab == 'match') {
      V.iv ? stop() : loop();
      render();
    } else cont2();
    return;
  }
  const tb = { m: 'mail', t: 'tac', e: 'club', c: 'cal', p: 'set', f: 'fin', g: 'gest' }[k];
  if (tb) {
    go2(tb);
  }
});
// Fabrique un interrupteur (case à bascule) pour un réglage : k = nom du réglage, l = libellé, d =
// description.
const stSw = (k, l, d) =>
  `<label class="stl"><span><b>${l}</b>${d ? `<span class="mu">${d}</span>` : ''}</span><span class="sw"><input type="checkbox" ${ST[k] ? 'checked' : ''} onchange="setS('${k}',this.checked?1:0)"><i></i></span></label>`;
// Fabrique une liste déroulante pour un réglage.
const stSel = (k, l, o, d, num) =>
  `<label class="stl"><span><b>${l}</b>${d ? `<span class="mu">${d}</span>` : ''}</span><select onchange="setS('${k}',${num === 0 ? 'this.value' : '+this.value'})">${o.map(([v, n]) => `<option value="${v}" ${String(ST[k]) == String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;

// ======================================================================
// ÉCRAN DES PARAMÈTRES
// ======================================================================
// Construit toute la page « Paramètres » (affichage, musique, notifications, sons, animation,
// difficulté…).
function setView() {
  const sec = (i, t, b) => `<div class="card stc"><h2>${i} ${t}</h2>${b}</div>`;
  return (
    `<div class="stw">${V.stp ? '<div class="ctl"><button class="p" onclick="V.stp=0;render()">← Retour</button></div>' : ''}<h1 style="margin:6px 0 10px">⚙️ Paramètres</h1><div class="mu" style="margin-bottom:8px">Les réglages sont enregistrés automatiquement sur cet appareil.</div><div class="stg">` +
    sec(
      '🖥️',
      'Affichage',
      stSel(
        'zoom',
        'Taille du texte',
        [
          [0, 'Normale'],
          [1, 'Grande (115 %)'],
          [2, 'Très grande (130 %)'],
        ],
        'Agrandit le texte et l’interface.',
      ) +
        stSw('hc', 'Contraste élevé', 'Renforce les textes secondaires et les bordures.') +
        stSw('rm', 'Réduire les animations', 'Supprime défilements et transitions.') +
        `<label class="stl"><span><b>Affichage des joueurs</b><span class="mu">Cartes ou liste.</span></span><select onchange="V.vw=this.value;try{localStorage.setItem('gmvw',V.vw)}catch(e){}render()"><option value="c" ${V.vw != 'l' ? 'selected' : ''}>Cartes</option><option value="l" ${V.vw == 'l' ? 'selected' : ''}>Liste</option></select></label><label class="stl"><span><b>Interface aux couleurs du club</b><span class="mu">Sinon, thème violet par défaut.</span></span><span class="sw"><input type="checkbox" ${V.nth ? '' : 'checked'} onchange="V.nth=!this.checked;render()"><i></i></span></label>` +
        stSw('hpb', 'Bulles d’aide « ? »', 'Affiche les petites bulles d’explication.'),
    ) +
    sec('🎵', 'Musique', musSec()) +
    sec(
      '✉',
      'Notifications',
      stSw('ntm', 'Nouveaux mails', 'Prévient quand un message arrive dans la boîte de réception.') +
        stSw('ntu', 'Déblocages', 'Titres, décorations, pistes et autres récompenses.') +
        stSw('ntk', 'Compétences de manager', 'Prévient quand un point de compétence est disponible.') +
        stSw(
          'nta',
          'Sauvegarde automatique',
          'Affiche un message à chaque sauvegarde automatique de la partie.',
        ),
    ) +
    sec(
      '🔊',
      'Audio',
      stSw('snd', 'Sons activés', 'Sons synthétisés pour l’interface et les matchs.') +
        `<label class="stl"><span><b>Volume</b></span><input type="range" min="0" max="100" step="5" value="${ST.vol}" oninput="setS('vol',+this.value)" onchange="sfx('test')" style="width:150px"></label>` +
        stSw('su', 'Sons d’interface', 'Clics sur les boutons et menus.') +
        stSw('sm', 'Sons de match', 'Buts et coups de sifflet.') +
        stSw('sn', 'Sons de notification', 'Nouveau message dans la boîte de réception.') +
        `<div class="ctl" style="margin-top:6px"><button onclick="sfx('test')">▶ Tester le son</button></div>`,
    ) +
    sec(
      '⚽',
      'Animation des matchs',
      stSw(
        'an',
        'Nouvelle animation de match',
        'Terrain 2D aux couleurs de la planète, passes et tirs fidèles au journal. Désactivée : ancien terrain simple.',
      ) +
        stSw(
          'anfl',
          'Aura de Fluide',
          'Halo aux couleurs de l’équipe autour du joueur qui tire avec un Fluide (tirs cadrés uniquement).',
        ) +
        stSw(
          'anamb',
          'Ambiance de foule',
          'Bruits de stade pendant le match (nécessite « Sons activés » et un volume non nul).',
        ) +
        stSel(
          'anp',
          'Rythme du match',
          [
            [0, 'Match complet'],
            [1, 'Temps forts seulement'],
          ],
          'Temps forts seulement : les phases sans tir passent très vite.',
        ) +
        stSw(
          'anlite',
          'Animations allégées',
          'Moins d’effets, image plus légère : pour les ordinateurs modestes. Réduit aussi les ralentis visuels.',
        ),
    ) +
    sec(
      '🎮',
      'Contrôles',
      stSw(
        'kb',
        'Raccourcis clavier',
        'Espace : continuer / pause · M : messagerie · T : tactique · E : équipe · C : calendrier · F : finances · G : gestion · P : paramètres · Échap : fermer.',
      ) +
        stSw(
          'cf',
          'Confirmer en deux touches',
          'Achats, ventes et prêts demandent une seconde touche pour confirmer.',
        ),
    ) +
    sec(
      '⚽',
      'Fonctionnement du jeu',
      stSel(
        'sp',
        'Vitesse des matchs',
        [
          [0, 'Lent'],
          [1, 'Normal'],
          [2, 'Rapide'],
        ],
        'Vitesse d’affichage du match en direct.',
      ) +
        stSw('ht', 'Pause à la mi-temps', 'Arrête le match pour modifier votre équipe.') +
        stSw(
          'as',
          'Sauvegarde automatique',
          'Après chaque match, au retour au menu, toutes les 3 minutes si la partie a changé, et quand tu quittes la page.',
        ) +
        stSelV(
          'df',
          'Difficulté (nouvelles parties)',
          [
            [0, 'Facile'],
            [1, 'Normal'],
            [2, 'Difficile'],
          ],
          'Ne change pas la partie en cours.',
          1,
        ) +
        stSwV('evt', 'Événements de scénario (nouvelles parties)', 'Police, sabotages, etc.'),
    ) +
    sec(
      '📋',
      'Informations légales',
      `<div class="mu" style="margin-bottom:6px">Projet de fans non officiel, gratuit et sans but lucratif, non affilié aux ayants droit de « Galactik Football ». Sans cookie ni compte.</div><div class="ctl">${legLinks()}</div>`,
    ) +
    sec(
      '🗂️',
      'Données',
      `<div class="ctl"><button onclick="V.sv=1;V.sn='';V.stp=0;V.menu=0;render()">📂 Sauvegardes</button><button onclick="if(confirm('Remettre tous les réglages par défaut ?'))stReset()">↺ Réinitialiser les réglages</button></div>`,
    ) +
    `</div><div class="ctl" style="margin-top:12px">${V.stp ? '<button class="p" onclick="V.stp=0;render()">← Retour</button>' : ''}</div></div>`
  );
}

// Liste déroulante pour un réglage de la partie en cours.
const stSelV = (k, l, o, d) =>
  `<label class="stl"><span><b>${l}</b><span class="mu">${d}</span></span><select onchange="V.df=+this.value">${o.map(([v, n]) => `<option value="${v}" ${(V.df ?? 1) == v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
// Interrupteur pour un réglage de la partie en cours.
const stSwV = (k, l, d) =>
  `<label class="stl"><span><b>${l}</b><span class="mu">${d}</span></span><span class="sw"><input type="checkbox" ${V.evt !== 0 ? 'checked' : ''} onchange="V.evt=this.checked?1:0"><i></i></span></label>`;
// Choisit l'équipe « recommandée » aux nouveaux joueurs (celle dont le niveau est le plus proche
// de 13).
const recoT = () => {
  let b = 0;
  T.forEach((t, i) => {
    if (Math.abs(t[1] - 13) < Math.abs(T[b][1] - 13)) b = i;
  });
  return b;
};

// ======================================================================
// ICÔNES (remplacement des emojis par les icônes du jeu)
// ======================================================================
// Bibliothèque d'icônes dessinées en SVG. Pour ajouter une icône : ajouter un <symbol> ici et son
// emoji dans la table EMJ.
const SPR =
    '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute"><defs><linearGradient id="gy" gradientUnits="userSpaceOnUse" x1="2" y1="1" x2="22" y2="23"><stop offset="0" style="stop-color:var(--ac,#7c5cff)"/><stop offset="1" style="stop-color:var(--ac2,#e4338f)"/></linearGradient></defs><symbol id="i-home" viewBox="0 0 24 24"><path d="M12 2.5 1.5 12H5v9h5.5v-6h3v6H19v-9h3.5z"/></symbol><symbol id="i-dash" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="8.5" height="10.5" rx="2"/><rect x="13" y="2.5" width="8.5" height="6" rx="2"/><rect x="13" y="10.5" width="8.5" height="11" rx="2"/><rect x="2.5" y="15" width="8.5" height="6.5" rx="2"/></symbol><symbol id="i-mail" viewBox="0 0 24 24"><rect x="1.5" y="4.5" width="21" height="15" rx="3.5"/><path d="M3 7.5l9 6.5 9-6.5" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-clip" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="18" rx="3.5"/><rect x="8" y="1.5" width="8" height="4.5" rx="2"/><path d="M8 12h8M8 16h5" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-team" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4.2"/><path d="M1 21.5c0-5 3.2-8 8-8s8 3 8 8z"/><circle cx="18" cy="9" r="3" opacity=".7"/><path d="M18.5 14c3 .3 4.8 2.600 4.800 7.500H19c0-3-.4-5.500-1.600-7.200z" opacity=".7"/></symbol><symbol id="i-cal" viewBox="0 0 24 24"><rect x="2.5" y="4.5" width="19" height="17.500" rx="3.5"/><rect x="6.500" y="1.500" width="3" height="5.500" rx="1.500"/><rect x="14.500" y="1.500" width="3" height="5.500" rx="1.500"/><path d="M2.500 10h19" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="6.500" y="13" width="3.500" height="3" rx=".8" fill="rgba(0,0,0,.42)"/><rect x="12.500" y="13" width="3.500" height="3" rx=".8" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-swap" viewBox="0 0 24 24"><path d="M2 7.500 7.500 2v3.500H21v4H7.500V13z"/><path d="M22 16.500 16.500 22v-3.500H3v-4h13.500V11z" opacity=".75"/></symbol><symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4.800"/><path d="M2.500 22c0-6 4-9.500 9.500-9.500S21.500 16 21.500 22z"/></symbol><symbol id="i-trophy" viewBox="0 0 24 24"><path d="M7 2.500h10v6.500a5 5 0 0 1-10 0z"/><path d="M2.500 4h4v2.200h-1.800c.2 1.800 1 2.800 2.300 3.300V12C4.200 11.400 2.500 8.800 2.500 4zM21.500 4h-4v2.200h1.800c-.2 1.800-1 2.800-2.300 3.300V12c2.800-.6 4.500-3.200 4.500-8z"/><rect x="10.500" y="14" width="3" height="4.500"/><rect x="6.500" y="18" width="11" height="3.500" rx="1.700"/></symbol><symbol id="i-stadium" viewBox="0 0 24 24"><path d="M1.500 10c0-3 4.500-5 10.500-5s10.500 2 10.500 5v8c0 1.500-4.500 3.500-10.500 3.500S1.500 19.500 1.500 18z"/><ellipse cx="12" cy="10.500" rx="6.500" ry="2.600" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M14.800 8.800c-.4-1.200-1.500-1.800-2.800-1.800-1.600 0-2.800.8-2.800 2.100 0 3 5.800 1.500 5.800 4.600 0 1.400-1.300 2.300-3 2.300-1.400 0-2.600-.7-3-2M12 5.500V7M12 17v1.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-ball" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500" style="fill:#f2f5fa"/><path d="M12 7.200l4 2.900-1.500 4.700h-5L8 10.100z" fill="rgba(0,0,0,.42)"/><path d="M12 7.200V2M16 10.100l5-1.600M14.500 14.800l3 4.200M9.500 14.800l-3 4.200M8 10.100 3 8.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M9 9.500a3 3 0 1 1 4.600 2.500c-1 .7-1.600 1.200-1.600 2.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="17.700" r="1.400" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-save" viewBox="0 0 24 24"><path d="M3.500 2.500h13l4 4v15h-17z"/><rect x="7" y="2.500" width="9" height="6" fill="rgba(0,0,0,.42)"/><rect x="7" y="13" width="10" height="8.500" rx="1.200" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 1.800l8.500 3.200v6.200c0 5.200-3.600 9.200-8.500 11-4.900-1.800-8.500-5.800-8.500-11V5z"/><path d="M8 11.800l2.800 2.800L16 9.200" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-bank" viewBox="0 0 24 24"><path d="M12 1.500 1.500 7.500v2.500h21V7.500z"/><rect x="3.500" y="11.500" width="3.500" height="7"/><rect x="10.250" y="11.500" width="3.500" height="7"/><rect x="17" y="11.500" width="3.500" height="7"/><rect x="1.500" y="19.800" width="21" height="3" rx="1.200"/></symbol><symbol id="i-textsz" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 21 9 3h2.200l7 18h-2.600l-1.500-4H6.100L4.600 21zM7 15h5.600L9.800 7.500z"/><path d="M19 8h3M20.500 6.500v3" stroke="rgba(0,0,0,.42)" stroke-width="0" /></symbol><symbol id="i-contrast" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M12 1.500a10.500 10.500 0 0 0 0 21z" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-search" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10 2.500a7.500 7.500 0 1 0 4.500 13.500l5.200 5.200 2-2-5.200-5.200A7.500 7.500 0 0 0 10 2.500zm0 2.600a4.900 4.900 0 1 1 0 9.800 4.900 4.900 0 0 1 0-9.800z"/></symbol><symbol id="i-import" viewBox="0 0 24 24"><path d="M9.800 2h4.400v7.200h4L12 16 5.800 9.200h4z"/><path d="M2.500 14.500h3.200v4.800h12.600v-4.800h3.200v8H2.500z"/></symbol><symbol id="i-plus" viewBox="0 0 24 24"><path d="M9.800 2.500h4.400v7.300h7.300v4.400h-7.300v7.300H9.800v-7.300H2.500V9.800h7.300z"/></symbol><symbol id="i-play" viewBox="0 0 24 24"><path d="M5.500 2.500 21 12 5.500 21.500z"/></symbol><symbol id="i-ff" viewBox="0 0 24 24"><path d="M1.500 4 11.500 12 1.500 20zM12 4 22.500 12 12 20z"/></symbol><symbol id="i-pause" viewBox="0 0 24 24"><rect x="4.500" y="3" width="5.500" height="18" rx="1.800"/><rect x="14" y="3" width="5.500" height="18" rx="1.800"/></symbol><symbol id="i-rocket" viewBox="0 0 24 24"><path d="M12 1.500c4.200 2.200 6.300 6.200 6.300 11.500l-3 3.200H8.700L5.700 13C5.700 7.700 7.800 3.700 12 1.500z"/><circle cx="12" cy="9.500" r="2.200" fill="rgba(0,0,0,.42)"/><path d="M5.700 13.500 2 18l4.500-1zM18.300 13.500 22 18l-4.500-1zM9.800 18h4.400L12 22.500z" opacity=".8"/></symbol><symbol id="i-fluid" viewBox="0 0 24 24"><path d="M12 2.500a9.500 9.500 0 1 0 9.500 9.500h-3.200A6.300 6.300 0 1 1 12 5.700z"/><path d="M12 8a4 4 0 1 0 4 4h-2.300A1.700 1.700 0 1 1 12 10.300z" opacity=".7"/></symbol><symbol id="i-star" viewBox="0 0 24 24"><path d="M12 1.800l3.100 6.600 7.200.9-5.300 4.900 1.400 7.100L12 17.800l-6.400 3.500 1.400-7.100L1.700 9.300l7.200-.9z"/></symbol><symbol id="i-band" viewBox="0 0 24 24"><g transform="rotate(-45 12 12)"><rect x="0.500" y="7.500" width="23" height="9" rx="4.500"/><rect x="8" y="7.500" width="8" height="9" fill="rgba(255,255,255,.45)"/><circle cx="11" cy="10.500" r=".9" fill="rgba(0,0,0,.42)"/><circle cx="13" cy="13.500" r=".9" fill="rgba(0,0,0,.42)"/></g></symbol><symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 1.500c1 4.200 6.500 6.300 6.500 12.300a6.500 6.500 0 0 1-13 0c0-3.200 1.800-4.500 3.300-7.300 1 1 1.400 2.200 1.200 3.600 2-1.800 2.200-5.200 2-8.600z"/></symbol><symbol id="i-footr" viewBox="0 0 24 24"><path d="M5 3h6v8c0 1 .6 1.600 1.500 2l6.500 3c1.500.7 2.500 2 2.500 3.500V21H3V5c0-1.100.8-2 2-2z"/></symbol><symbol id="i-footl" viewBox="0 0 24 24"><g transform="translate(24 0) scale(-1 1)"><path d="M5 3h6v8c0 1 .6 1.600 1.500 2l6.500 3c1.500.7 2.500 2 2.500 3.500V21H3V5c0-1.100.8-2 2-2z"/></g></symbol><symbol id="i-music" viewBox="0 0 24 24"><path d="M9 3v12.500A3.500 3.500 0 1 0 11 18.500V8l8-2v7.500A3.500 3.500 0 1 0 21 16.500V2z"/></symbol><symbol id="i-film" viewBox="0 0 24 24"><rect x="2.500" y="9" width="19" height="12.500" rx="2.500"/><path d="M2.500 4.500 19 2l1.300 4.200L3.800 8.800z"/></symbol><symbol id="i-loan" viewBox="0 0 24 24"><path d="M3.500 12A8.500 8.500 0 0 1 18 6l2.500-2.500v7.500h-7.500l2.700-2.700A5.300 5.300 0 0 0 6.700 12z"/><path d="M20.500 12A8.500 8.500 0 0 1 6 18l-2.500 2.500V13H11l-2.700 2.700A5.300 5.300 0 0 0 17.300 12z" opacity=".75"/></symbol><symbol id="i-dna" viewBox="0 0 24 24"><path d="M6 2h3c0 5 9 6 9 11.500V22h-3c0-5.500-9-6-9-11.500zM18 2h-3c0 5-9 6-9 11.500V22h3c0-5.500 9-6 9-11.500z" fill-rule="evenodd" opacity=".95"/></symbol><symbol id="i-gear" viewBox="0 0 24 24"><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(0 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(45 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(90 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(135 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(180 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(225 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(270 12 12)"/><rect x="10" y="1.5" width="4" height="5" rx="1" transform="rotate(315 12 12)"/><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.500 1.500 4 14h6.200l-1.200 8.500L20 10h-6.200z"/></symbol><symbol id="i-sparkle" viewBox="0 0 24 24"><path d="M12 1.500c.8 5.500 3.800 8.500 10.500 10.500-6.700 2-9.700 5-10.500 10.500C11.200 17 8.200 14 1.500 12 8.200 10 11.200 7 12 1.500z"/></symbol><symbol id="i-orbit" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.800"/><path class="s" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20.500 6.500C23 9 20 15.500 12 19.500 5 23 0.800 21 3.500 17.500"/><ellipse cx="12" cy="12" rx="11" ry="4.200" transform="rotate(-28 12 12)" class="s" stroke-width="1.700"/></symbol><symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M7 12.500l3.500 3.500 6.500-7" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-cross" viewBox="0 0 24 24"><path d="M4.500 2.500 12 10l7.500-7.500 2 2L14 12l7.500 7.500-2 2L12 14l-7.500 7.500-2-2L10 12 2.500 4.500z"/></symbol><symbol id="i-trash" viewBox="0 0 24 24"><path d="M9 2h6l1 2h5v2.500H3V4h5z"/><path d="M4.800 8h14.400l-1 13.500H5.800z"/><path d="M10 11.500v7M14 11.500v7" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-folder" viewBox="0 0 24 24"><path d="M2 5.500A2.500 2.500 0 0 1 4.500 3h5l2.500 3h7.500A2.500 2.500 0 0 1 22 8.500v10a2.500 2.500 0 0 1-2.500 2.500h-15A2.500 2.500 0 0 1 2 18.500z"/></symbol><symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="10.500" width="16" height="11.500" rx="3"/><path d="M7.500 10.500V7.500a4.500 4.500 0 0 1 9 0v3" class="s" stroke-width="2.600" stroke-linecap="round"/><circle cx="12" cy="16" r="1.800" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 2.200 22.800 21H1.200z" stroke-linejoin="round"/><path d="M12 9v5.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="17.600" r="1.400" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-down" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4.500"/><path d="M6 8l4.500 4.500 3-3 4.500 5.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-build" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20.500" rx="2.500"/><rect x="7.5" y="5.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/><rect x="7.5" y="10.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/><rect x="7.5" y="15.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/><rect x="13.5" y="5.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/><rect x="13.5" y="10.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/><rect x="13.5" y="15.5" width="3" height="3" rx=".7" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-mega" viewBox="0 0 24 24"><path d="M2.500 9.500v5.500h4l9 5.500V4L6.500 9.500z"/><path class="s" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" d="M18.500 8.500c2.200 2.200 2.200 5.800 0 8"/></symbol><symbol id="i-case" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14.500" rx="3"/><path d="M8.500 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" class="s" stroke-width="2"/><path d="M2 13h20" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-siren" viewBox="0 0 24 24"><path d="M5.500 18A6.500 6.500 0 0 1 18.500 18z"/><rect x="3.500" y="18" width="17" height="3.500" rx="1.400"/><path class="s" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 1.500v3M3.800 5.200l2 2M20.200 5.200l-2 2"/></symbol><symbol id="i-cross2" viewBox="0 0 24 24"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z"/></symbol><symbol id="i-news" viewBox="0 0 24 24"><rect x="2.500" y="3.500" width="19" height="17" rx="3"/><path d="M6.500 8.500h11M6.500 12.500h11M6.500 16.500h6.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-undo" viewBox="0 0 24 24"><path d="M9.500 4.500 2.500 11l7 6.500v-4c5.500 0 9 1.300 11.500 6 0-7-3.800-12.500-11.500-12.500z"/></symbol><symbol id="i-smile" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5"/><circle cx="8.3" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><circle cx="15.7" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><path d="M7.500 14.500c1 2.800 3 4 4.500 4s3.500-1.200 4.500-4" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-ok" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5"/><circle cx="8.3" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><circle cx="15.7" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><path d="M8 15.500c1.200 1.600 2.600 2.200 4 2.200s2.800-.6 4-2.200" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-meh" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5"/><circle cx="8.3" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><circle cx="15.7" cy="10" r="1.4" fill="rgba(0,0,0,.42)"/><path d="M8 16.200h8" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-angry" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M6.500 7.200l4 2M17.500 7.200l-4 2" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.600" cy="11" r="1.300" fill="rgba(0,0,0,.42)"/><circle cx="15.400" cy="11" r="1.300" fill="rgba(0,0,0,.42)"/><path d="M8 17c1-1.500 2.300-2.200 4-2.200s3 .7 4 2.200" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-sick" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><path d="M6.800 9.500l3 1.200-3 1.200M17.200 9.500l-3 1.200 3 1.200" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.500 16.200c1-1 1.800-1 2.800 0s1.800 1 2.800 0 1.800-1 2.800 0" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-snow" viewBox="0 0 24 24"><path class="s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 1.800v20.400M3.200 6.900l17.600 10.200M3.200 17.100 20.800 6.900M8.800 3.800 12 6l3.200-2.200M8.800 20.200 12 18l3.200 2.200"/></symbol><symbol id="i-moon" viewBox="0 0 24 24"><path d="M20.500 14.800A9.500 9.500 0 0 1 9.200 3.500 9.500 9.500 0 1 0 20.500 14.800z"/></symbol><symbol id="i-robot" viewBox="0 0 24 24"><rect x="3.500" y="7.500" width="17" height="13.500" rx="4.500"/><rect x="11" y="3" width="2" height="4.500"/><circle cx="12" cy="2.800" r="1.700"/><circle cx="8.500" cy="13" r="2" fill="rgba(0,0,0,.42)"/><circle cx="15.500" cy="13" r="2" fill="rgba(0,0,0,.42)"/><path d="M9 18h6" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-palm" viewBox="0 0 24 24"><path d="M11 22.500c0-6.500 1-10 2.200-13.500h1.200c-1.100 3.500-1.800 7-1.800 13.500z"/><path d="M12.800 9C8.800 4.500 4.500 5 2 8.500c3-1 6 0 10.800.5zM12.800 9c0-5.500 4-7.700 8.500-6.500-3.200 1-5.500 3.200-6.500 7zM12.800 9c4-3 8.500-1.500 10 3-3-1.500-6-1.300-9.500.2zM12.800 9c-3.500 1.500-5 5-4 8.500 1.200-3.500 2.700-5.800 5-7.300z"/></symbol><symbol id="i-rock" viewBox="0 0 24 24"><path d="M2.500 18.500 6.800 8l5.200-4.500 6.500 3 3 8.500-4.300 5.500H6.500z"/><path d="M7 9.500l5 3 6-5M12 12.500v7.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-alien" viewBox="0 0 24 24"><path d="M12 2c5.500 0 9.500 4.200 9.500 9.500 0 5.500-4.200 10.500-9.500 10.500S2.500 17 2.500 11.500C2.500 6.200 6.500 2 12 2z"/><ellipse cx="8" cy="11" rx="2.600" ry="1.500" transform="rotate(20 8 11)" fill="rgba(0,0,0,.42)"/><ellipse cx="16" cy="11" rx="2.600" ry="1.500" transform="rotate(-20 16 11)" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-tiger" viewBox="0 0 24 24"><path d="M2.500 3 8 6.200h8L21.500 3v9.500c0 5.500-4 9.500-9.500 9.500S2.500 18 2.500 12.500z"/><path d="M12 7v3M7 8.500l1.500 2M17 8.500l-1.500 2" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.300" cy="13" r="1.500" fill="rgba(0,0,0,.42)"/><circle cx="15.700" cy="13" r="1.500" fill="rgba(0,0,0,.42)"/><path d="M10 17.500c1 .8 3 .8 4 0" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-skull" viewBox="0 0 24 24"><path d="M12 1.800a9.500 9.500 0 0 0-5.500 17.200v2.700h11V19A9.500 9.500 0 0 0 12 1.800z"/><circle cx="8.500" cy="11.500" r="2.400" fill="rgba(0,0,0,.42)"/><circle cx="15.500" cy="11.500" r="2.400" fill="rgba(0,0,0,.42)"/><path d="M10 17.500v2.500M14 17.500v2.500" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-battery" viewBox="0 0 24 24"><rect x="1.500" y="6.500" width="18.500" height="11" rx="3"/><rect x="20.800" y="9.800" width="2" height="4.400" rx="1"/><path d="M12 8.200 8.300 12.500h3l-.8 3.500 3.700-4.500h-3z" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-eye" viewBox="0 0 24 24"><path d="M0.800 12C3.800 6 7.800 3.800 12 3.800s8.200 2.200 11.200 8.200c-3 6-7 8.200-11.200 8.200S3.800 18 0.800 12z"/><circle cx="12" cy="12" r="4.400" fill="rgba(0,0,0,.42)"/><circle cx="13.200" cy="10.800" r="1.400" fill="#fff"/></symbol><symbol id="i-comet" viewBox="0 0 24 24"><circle cx="16.500" cy="7.500" r="5.500"/><path d="M12.500 10.500 1.800 17.800l4-.8-.9 4.300z" opacity=".85"/><path d="M11.200 12.500 5 22l1-5z" opacity=".5"/></symbol><symbol id="i-cap" viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.900V17h2V9z"/><path d="M5.500 13v4c0 2 3 4 6.500 4s6.500-2 6.500-4v-4l-6.500 3.500z" opacity=".8"/></symbol><symbol id="i-chat" viewBox="0 0 24 24"><path d="M3 3.500h18V16H10.500L5.500 20.500V16H3z"/><circle cx="8" cy="9.800" r="1.300" fill="rgba(0,0,0,.42)"/><circle cx="12" cy="9.800" r="1.300" fill="rgba(0,0,0,.42)"/><circle cx="16" cy="9.800" r="1.300" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-medal" viewBox="0 0 24 24"><path d="M6.500 1.500h4l1.500 6-3.500 1.500zM17.500 1.500h-4L12 7.500l3.500 1.500z" opacity=".75"/><circle cx="12" cy="15" r="6.500"/><path d="m12 11.300 1.100 2.300 2.500.3-1.800 1.700.5 2.500-2.300-1.300-2.300 1.300.5-2.500-1.800-1.700 2.500-.3z" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500"/><circle cx="12" cy="12" r="7" fill="rgba(0,0,0,.42)"/><circle cx="12" cy="12" r="3.800"/><circle cx="12" cy="12" r="1.400" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-glove" viewBox="0 0 24 24"><path d="M6 22v-7.500L3.500 10a1.700 1.700 0 0 1 3-1.600L8 10.500V4.500a1.500 1.500 0 0 1 3 0V3.500a1.500 1.500 0 0 1 3 0V4.500a1.500 1.500 0 0 1 3 0V12l1.200-1.800a1.700 1.700 0 0 1 2.800 1.900L19 17.500V22z"/><path d="M6 19h13" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.600" stroke-linecap="round"/></symbol><symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 1.500 3.500 4.800v6.500c0 5.200 3.600 9.600 8.500 11.200 4.900-1.600 8.500-6 8.500-11.200V4.800z"/><path d="m8.200 12 2.800 2.800 4.800-5.300" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-chart" viewBox="0 0 24 24"><rect x="2.500" y="12" width="5" height="9.500" rx="1.200"/><rect x="9.500" y="2.500" width="5" height="19" rx="1.200"/><rect x="16.500" y="7.500" width="5" height="14" rx="1.200"/></symbol><symbol id="i-up" viewBox="0 0 24 24"><path d="M12 1.800 2.800 12H8v10h8V12h5.200z"/></symbol><symbol id="i-mic" viewBox="0 0 24 24"><rect x="8" y="1.500" width="8" height="13" rx="4"/><path d="M4.500 11a7.500 7.500 0 0 0 15 0M12 18.500v3.500M8 22h8" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-pad" viewBox="0 0 24 24"><path d="M6.500 5.500h11a5 5 0 0 1 5 4.500l.9 5.500a3.300 3.300 0 0 1-5.800 2.600L16.200 16H7.800l-1.400 2.100A3.300 3.300 0 0 1 .6 15.500L1.500 10a5 5 0 0 1 5-4.500z"/><path d="M7.500 8.800v4.400M5.300 11h4.400" fill="none" stroke="rgba(0,0,0,.42)" stroke-width="1.800" stroke-linecap="round"/><circle cx="16" cy="10" r="1.300" fill="rgba(0,0,0,.42)"/><circle cx="18.700" cy="12.300" r="1.300" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-dice" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="7.800" cy="7.800" r="1.700" fill="rgba(0,0,0,.42)"/><circle cx="16.200" cy="7.800" r="1.700" fill="rgba(0,0,0,.42)"/><circle cx="12" cy="12" r="1.700" fill="rgba(0,0,0,.42)"/><circle cx="7.800" cy="16.200" r="1.700" fill="rgba(0,0,0,.42)"/><circle cx="16.200" cy="16.200" r="1.700" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 21.800 3 12.800A5.800 5.800 0 0 1 12 5.800a5.800 5.800 0 0 1 9 7z"/></symbol><symbol id="i-speaker" viewBox="0 0 24 24"><path d="M2 8.800h4.800L13 3.500v17l-6.200-5.300H2z"/><path d="M16.500 8.300a5 5 0 0 1 0 7.400M19.800 5a9.500 9.500 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-screen" viewBox="0 0 24 24"><rect x="1.500" y="3" width="21" height="14" rx="2.800"/><path d="M8 21h8M12 17.500V21" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="i-bed" viewBox="0 0 24 24"><path d="M1.500 4h2.500v8h16.500a2.500 2.500 0 0 1 2.500 2.500V19h-2.500v-2.500H4V19H1.500z"/><rect x="5.500" y="6.500" width="5.500" height="3.800" rx="1.800" fill="rgba(0,0,0,.42)"/></symbol><symbol id="i-dl" viewBox="0 0 24 24"><path d="M12 22.200 2.800 12H8V2h8v10h5.200z"/></symbol></svg>',
  EMJ = {
    '🏆': 'trophy',
    '⚽': 'ball',
    '🩹': 'band',
    '⭐': 'star',
    '✉': 'mail',
    '📬': 'mail',
    '🤢': 'sick',
    '🌀': 'fluid',
    '🏟': 'stadium',
    '🛠': 'gear',
    '🔥': 'flame',
    '🎓': 'cap',
    '🔁': 'loan',
    '❓': 'help',
    '⚡': 'bolt',
    '✨': 'sparkle',
    '🌌': 'orbit',
    '🪐': 'orbit',
    '📥': 'import',
    '💰': 'coin',
    '💾': 'save',
    '🏠': 'home',
    '🧭': 'dash',
    '🔄': 'swap',
    '⚙': 'gear',
    '⏸': 'pause',
    '📂': 'folder',
    '⏩': 'ff',
    '🧬': 'dna',
    '😀': 'smile',
    '😠': 'angry',
    '🙂': 'ok',
    '😐': 'meh',
    '❌': 'cross',
    '🔍': 'search',
    '🗑': 'trash',
    '📅': 'cal',
    '🏛': 'bank',
    '📋': 'clip',
    '👥': 'team',
    '🧑‍💼': 'person',
    '👤': 'person',
    '🔠': 'textsz',
    '🚀': 'rocket',
    '🎬': 'film',
    '✅': 'check',
    '🔒': 'lock',
    '⚠': 'warn',
    '📉': 'down',
    '🏢': 'build',
    '📣': 'mega',
    '💼': 'case',
    '🤝': 'team',
    '🚨': 'siren',
    '🩺': 'cross2',
    '📰': 'news',
    '↩': 'undo',
    '❄': 'snow',
    '🌑': 'moon',
    '🤖': 'robot',
    '🌴': 'palm',
    '🪨': 'rock',
    '🦎': 'alien',
    '🐯': 'tiger',
    '🏴‍☠': 'skull',
    '🔋': 'battery',
    '👁': 'eye',
    '☄': 'comet',
    '🆕': 'plus',
    '🎙': 'mic',
    '🎵': 'music',
    '🎤': 'mic',
    '🎮': 'pad',
    '🎲': 'dice',
    '👋': 'smile',
    '🙏': 'heart',
    '🔊': 'speaker',
    '🖥': 'screen',
    '🗂': 'folder',
    '🛌': 'bed',
    '⚖': 'bank',
    '✔': 'check',
    '⬇': 'dl',
    '💬': 'chat',
    '🏅': 'medal',
    '🎯': 'target',
    '🧤': 'glove',
    '🛡': 'shield',
    '📊': 'chart',
    '⬆': 'up',
    '🔎': 'search',
    '◐': 'contrast',
  };
// Expression qui repère les emojis dans le texte pour les remplacer par les icônes du jeu.
const EMRE = new RegExp(
    '(' +
      Object.keys(EMJ)
        .sort((a, b) => b.length - a.length)
        .join('|') +
      ')\\uFE0F?',
    'g',
  ),
  EMT = new RegExp(EMRE.source);
// Parcourt la page et remplace chaque emoji par l'icône correspondante (appelée après chaque
// affichage).
function icoFix() {
  try {
    if (!document.getElementById('spr')) {
      const d = document.createElement('div');
      d.id = 'spr';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = SPR;
      document.body.appendChild(d);
    }
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          /^(OPTION|TEXTAREA|SCRIPT|STYLE|SELECT|TITLE)$/.test(n.parentNode.nodeName) ||
          n.parentNode.closest('#spr')
            ? 2
            : EMT.test(n.nodeValue)
              ? 1
              : 2,
      }),
      L = [];
    while (w.nextNode()) L.push(w.currentNode);
    L.forEach((n) => {
      const pr = n.nodeValue.split(EMRE),
        f = document.createDocumentFragment();
      pr.forEach((x, i) => {
        if (i % 2) {
          const nm = EMJ[x];
          if (nm) {
            const t = document.createElement('template');
            t.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + nm + '"/></svg>';
            f.appendChild(t.content.firstChild);
          } else f.appendChild(document.createTextNode(x));
        } else if (x) f.appendChild(document.createTextNode(x));
      });
      n.parentNode.replaceChild(f, n);
    });
  } catch (e) {}
}

// Logos de la League et de la Cup (images).
const LGL = IMGS.i0,
  LGC = IMGS.i1;

// ======================================================================
// COUPE (CUP), SÉLECTIONS NATIONALES ET CALENDRIER
// ======================================================================
// Les sélections de la Cup : [planète, niveau, icône, équipe d'origine].
const TN0 = [
  ['Akillian', 13, '⟦sk⟧', 'Snow Kids'],
  ['Ombra', 15, '⟦sh⟧', 'Shadows'],
  ['Paradisia', 15, '⟦pa⟧', 'Team Paradisia'],
  ['Xzion', 16, '⟦lt⟧', 'Lightnings'],
  ['Wamba Prime', 10, '⟦wa⟧', 'Wambas'],
  ['Unadar', 12, '⟦ry⟧', 'Rykers'],
  ['Archipel Xenon', 14, '⟦xe⟧', 'Xenons'],
  ['Pirates', 9, '⟦pi⟧', 'Pirates'],
  ['Hektonïa', 11, '⟦el⟧', 'Elektras'],
  ['Cyclopia', 10, '⟦cy⟧', 'Cyclopes'],
  ['Technoïd', 14, '⟦te⟧', 'Technodroids'],
  ['Vega', 11, '⟦vg⟧', 'Comet'],
  ['Kaldor', 14, '⟦kd⟧', 'Vortex'],
  ['Ysolde', 12, '🪐', null],
];
// Liste courante des sélections (version courte de TN0).
let TN = TN0.map((x) => x.slice(0, 3));
// Donne aux sélections les mêmes pouvoirs spéciaux que l'équipe de club dont elles sont issues.
function addNatFX() {
  TN0.forEach(([n, l, e, src]) => {
    if (src && FX[src]) {
      if (n != src) {
        FX[n] = { ...FX[src] };
        if (PAL[src]) PAL[n] = PAL[src];
        if (ACC[src]) ACC[n] = ACC[src];
      }
    } else {
      FX[n] = { t: 'd', k: 'block', n: 'Voile d’aurore', d: 'Dévie une attaque adverse au dernier moment.' };
      PAL[n] = ['#1fb4d9', '#f2c6e8'];
      ACC[n] = '#6fd3ee';
    }
  });
}
// Choisit la liste d'équipes à utiliser selon le mode (League ou Cup).
const useT = () => {
  T = S && S.ctx == 'C' ? TN : TL;
};
// Liste des morceaux de partie qui changent quand on passe de la League à la Cup (mode « Les deux
// »).
const CF = ['t', 'md', 'fx', 'teams', 'res', 'hist', 'cup', 'obj', 'pal', 'mkt', 'form'];
// CALENDRIER : renvoie le jour de l'année du match numéro d (League : tous les 7 jours, Cup : tous
// les 14 jours).
// Jour du match n° d : la pause de mi-saison tombe à la moitié du calendrier (13 matchs sur 26, 17 sur 34...).
const lgHalf = () => {
  const f = S && (S.ctx == 'L' ? S.fx : S.alt && S.alt.fx);
  return f && f.length ? f.length / 2 : 13;
};
const dOf = (c, d) => (c == 'C' ? 11 + 14 * d : 8 + 7 * d + (d >= lgHalf() ? 14 : 0));
// Répartit les sélections de la Cup en 4 groupes équilibrés.
function assignG(tm) {
  const o = tm.map((t, i) => i).sort((a, b) => TN[b][1] - TN[a][1]),
    g = [];
  for (let k = 0; k < o.length; k += 4) {
    const pot = o.slice(k, k + 4).sort(() => Math.random() - 0.5),
      r = (k / 4) % 2 ? pot.reverse() : pot;
    r.forEach((i, j) => (tm[i].g = j));
  }
}
// Crée le calendrier des matchs de groupes de la Cup.
function schedG(tm) {
  const R = [[], [], []];
  for (let g = 0; g < 4; g++) {
    const ix = tm.map((t, i) => i).filter((i) => tm[i].g === g),
      L = sched(ix.length),
      h = L.slice(0, L.length / 2);
    h.forEach((r, k) => r.forEach(([a, b]) => R[k].push([ix[a], ix[b]])));
  }
  return R;
}
// Renvoie le groupe d'une équipe de la Cup.
const grpOf = (t) => (S.ctx == 'C' ? S.teams.filter((x) => x.g === t.g) : S.teams);
// Classe des équipes : points, puis différence de buts, puis buts marqués.
const stdg = (a) => a.slice().sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
// Lettres des groupes de la Cup.
const GN = 'ABCD';
// Nom de la compétition (League ou Cup) pour un code donné.
const compName = (c) => (c == 'N' ? NB : c == 'C' ? 'Galactik Cup' : 'Galactik League');
// Liste des prochains événements du calendrier (matchs de League, de Cup…) avec leur jour.
function evs() {
  const o = [];
  if (S.md < S.fx.length) o.push([S.ctx, dOf(S.ctx, S.md)]);
  if (S.mode == 'D' && S.alt && S.alt.md < S.alt.fx.length) {
    const c = S.ctx == 'C' ? 'L' : 'C';
    o.push([c, dOf(c, S.alt.md)]);
  }
  if (NBU() && nbS().k < 6) o.push(['N', dN(S.nb.k)]);
  const od = { L: 0, C: 1, N: 2 };
  return o.sort((a, b) => a[1] - b[1] || od[a[0]] - od[b[0]]);
}
// Prochain événement du calendrier.
const nextEv = () => evs()[0];
// Échange les données League et Cup (mode « Les deux »).
function swapRaw() {
  const cur = {};
  CF.forEach((k) => (cur[k] = S[k]));
  CF.forEach((k) => {
    S[k] = S.alt[k];
  });
  S.alt = cur;
  S.ctx = S.ctx == 'C' ? 'L' : 'C';
  useT();
}
// Passe de la League à la Cup (ou inversement) à la demande du joueur.
function swapCtx() {
  if (S.mode != 'D' || !S.alt || V.m) return;
  swapRaw();
  natSyncAll();
  V.sel = null;
  V.mk = null;
  V.tab = 'ov';
  V.pf = null;
  save();
  render();
}
// Passe automatiquement dans la bonne compétition quand la date d'un match de l'autre mode arrive.
function ensureCtx() {
  const e = nextEv();
  if (e && e[0] != 'N' && e[0] != S.ctx && S.mode == 'D' && S.day >= e[1]) {
    swapRaw();
    natSyncAll();
    V.sel = null;
  }
}
// Équipes de la League, même quand on est dans la Cup.
const LGT = () => (S.ctx == 'C' ? (S.alt ? S.alt.teams : []) : S.teams);
// Listes de prénoms et noms utilisés pour créer des joueurs inventés.
const AN =
    'Kael Nyra Draven Vex Zane Iris Orin Juno Rex Mira Tovi Wren Sable Cobalt Nova Bolt Kaya Zulu Quill Opal Ravel Soren Talia Ulric Varek Xara Yara Aeon Brix'.split(
      ' ',
    ),
  BN =
    'Voss Ison Korr Nyx Tesh Anaya Chrome Reyes Kaidon Corrin Mbeki Renna Fessler Uhrik Ilarion Ferrat Sacha Talon Vray Aurin Delune Kell Vireth Kandor Vantor Doyle Fenn Kestrel Marlowe Storm'.split(
      ' ',
    );
// Liste des joueurs disponibles pour une sélection nationale.
function natPool(pl) {
  const o = [],
    seen = new Set();
  LGT().forEach((t) =>
    t.sq.forEach((p) => {
      if (planet(p.og || t.name) == pl && !seen.has(p.n)) {
        seen.add(p.n);
        o.push(p);
      }
    }),
  );
  ((S.free && S.free[pl]) || []).forEach((p) => {
    if (!seen.has(p.n)) {
      seen.add(p.n);
      o.push(p);
    }
  });
  return o;
}
// Complète une sélection avec des joueurs fictifs si elle n'a pas assez de monde.
function natFill(pl) {
  if (pl == MKD.nat) {
    S.free = S.free || {};
    const f = (S.free[pl] = S.free[pl] || []);
    if (!f.length && natPool(pl).length < 12) mkRos().forEach((p) => f.push(p));
  }
  const need = 12 - natPool(pl).length;
  if (need <= 0) return;
  S.free = S.free || {};
  const f = (S.free[pl] = S.free[pl] || []),
    U = new Set(
      LGT()
        .flatMap((t) => t.sq.map((p) => p.n))
        .concat(
          Object.values(S.free)
            .flat()
            .map((p) => p.n),
        ),
    ),
    lv = (TN.find((x) => x[0] == pl) || [0, 12])[1],
    ps = [0, 1, 1, 2, 2, 2, 3, 3, 1, 2, 3, 0];
  for (let i = 0; i < need; i++)
    f.push({
      n: uname(U, AN, BN),
      p: POS[ps[i % 12]],
      o: Math.round(46 + lv * 1.4 + Math.random() * 14),
      e: 100,
      f: (30 + Math.random() * 60) | 0,
      g: 0,
      og: pl,
    });
}
// Remplit toutes les sélections.
const natFillAll = () => TN.forEach((n) => natFill(n[0]));
// Reconstruit l'équipe d'une sélection à partir des meilleurs joueurs de la planète.
function natSync(t, fresh) {
  const pl = t.name;
  if (natPool(pl).length < 12) natFill(pl);
  const pool = natPool(pl),
    by = new Map(pool.map((p) => [p.n, p]));
  if (fresh) t.ros = null;
  let ros = (t.ros || []).filter((n) => by.has(n));
  if (ros.length < 12)
    pool
      .slice()
      .sort((a, b) => b.o - a.o)
      .forEach((p) => {
        if (ros.length < 14 && !ros.includes(p.n)) ros.push(p.n);
      });
  t.ros = ros;
  const cur =
    t.lun ||
    ((t.sq || []).filter(Boolean).length && (t.lu || []).map((i) => (t.sq[i] ? t.sq[i].n : null))) ||
    [];
  delete t.lun;
  t.sq = ros.map((n) => by.get(n));
  t.lu = cur.map((n) => (n ? t.sq.findIndex((p) => p.n == n) : -1));
  if (t.lu.length < 7 || t.lu.includes(-1) || new Set(t.lu).size < t.lu.length) autoLU(t);
}
// Met à jour toutes les sélections.
function natSyncAll() {
  if (!S) return;
  [S.teams, S.alt ? S.alt.teams : []].forEach((a) =>
    (a || []).forEach((t) => {
      if (t.nat) natSync(t);
    }),
  );
}
// Prépare les sélections au début d'une partie.
function natPrep() {
  S.teams.forEach((t, i) => {
    if (t.nat) natSync(t, i != S.t);
  });
}
// Crée les équipes de la Cup.
function buildNat(ni) {
  const tm = TN.map(([name, l, em], ni0) => ({
      name,
      em,
      sq: [],
      ros: null,
      nat: 1,
      form: Object.keys(FORM)[(ni0 * 3 + 1) % Object.keys(FORM).length],
      m: 1,
      lu: [],
      pts: 0,
      pl: 0,
      gf: 0,
      ga: 0,
      w: 0,
      d: 0,
      l: 0,
    })),
    rk =
      TN.map((t) => t[1])
        .sort((a, b) => b - a)
        .indexOf(TN[ni][1]) + 1;
  tm.forEach((t) => natSync(t));
  assignG(tm);
  return {
    t: ni,
    md: 0,
    fx: schedG(tm),
    teams: tm,
    res: [],
    hist: [],
    cup: null,
    obj: 2,
    pal: [],
    mkt: [],
    form: '',
  };
}

// ======================================================================
// SAUVEGARDE DE LA PARTIE : VERSION ET FORMAT
// ======================================================================
// DV = numéro du format de sauvegarde. GV = numéro de version affiché dans le jeu (À CHANGER à
// chaque mise à jour).
const DV = 1,
  GV = '1.45.0.3';
// Message à afficher lors d'une migration de vieille sauvegarde.
let MG = null;
// Transforme la partie en texte pour l'enregistrer.
const ser = () => {
  if (S) S.dv = DV;
  return JSON.stringify(S, (k, v) =>
    v && v.nat && v.sq ? { ...v, sq: undefined, lun: v.lu.map((i) => (v.sq[i] ? v.sq[i].n : null)) } : v,
  );
};
// Reconstruit la partie depuis un texte enregistré, en adaptant les anciennes sauvegardes
// (migration).
// Réparation d'un classement faussé : si un même match apparaît plusieurs fois dans une journée de l'historique,
// on garde un seul résultat par match et on recalcule le classement (points, buts, forme) à partir de l'historique.
function lgRepair(o, cx) {
  try {
    if (!o || !Array.isArray(o.teams) || !Array.isArray(o.hist)) return false;
    let dup = false;
    const H = o.hist.map((L) => {
      if (!Array.isArray(L)) return L;
      const m = new Map();
      L.forEach((z) => {
        const k = z[0] + '-' + z[1];
        if (m.has(k)) dup = true;
        m.set(k, z);
      });
      return [...m.values()];
    });
    if (!dup) return false;
    o.teams.forEach((t) => {
      t.pts = t.pl = t.gf = t.ga = t.w = t.d = t.l = 0;
      if (t.fm) t.fm = [];
    });
    H.forEach((L) =>
      (L || []).forEach(([h, a, x, y]) => {
        [[h, x, y], [a, y, x]].forEach(([i, g, c]) => {
          const t = o.teams[i];
          if (!t) return;
          t.pl++;
          t.gf += g;
          t.ga += c;
          if (g > c) (t.w++, (t.pts += 3));
          else if (g == c) (t.d++, t.pts++);
          else t.l++;
          if ((cx || o.ctx) != 'C' && (t.fm = t.fm || [])) (t.fm.push(g > c ? 'V' : g == c ? 'N' : 'D'), t.fm.length > 5 && t.fm.shift());
        });
      }),
    );
    o.hist = H;
    return true;
  } catch (e) {
    return false;
  }
}
const hyd = (s) => {
  MG = null;
  // Les interviews ne passent plus par la messagerie (fenêtre de conférence de presse) : on retire les anciens mails d'interview.
  if (s && Array.isArray(s.mail)) s.mail = s.mail.filter((m) => !/^Interview/.test(m.t || ''));
  // Planètes renommées pour coller à la série (Rykhar, Électra, Cyclos, Xéna) : remplacées partout dans la sauvegarde.
  if (s && /Rykhar|\u00c9lectra|Cyclos|X\u00e9na/.test(JSON.stringify(s))) {
    const q = JSON.parse(
      JSON.stringify(s)
        .split('Rykhar').join('Unadar')
        .split('\u00c9lectra').join('Hekton\u00efa')
        .split('Cyclos').join('Cyclopia')
        .split('X\u00e9na').join('Archipel Xenon'),
    );
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, q);
  }
  // Anciens noms d'équipes (renommées « Comet » et « Vortex ») : on les remplace partout dans la sauvegarde.
  if (s && /Comet(?:es|ès)? de Vega|Comètes|Vortex de Kaldor/.test(JSON.stringify(s))) {
    const q = JSON.parse(JSON.stringify(s).split('Comètes de Vega').join('Comet').split('Comètes').join('Comet').split('Vortex de Kaldor').join('Vortex'));
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, q);
  }
  if (s && JSON.stringify(s).includes('Volt\u00e9ris')) {
    const q = JSON.parse(JSON.stringify(s).split('Volt\u00e9ris').join('Xzion'));
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, q);
  }
  if (s) {
    // Classement faussé par des matchs simulés plusieurs fois : réparé automatiquement au chargement.
    if (lgRepair(s)) s.rpd = 1;
    if (s.alt) lgRepair(s.alt, s.ctx == 'C' ? 'L' : 'C');
    if (s.hist && s.hist[s.md] && s.hist[s.md].length && s.simd == null) s.simd = s.season + ':' + s.ctx + ':' + s.md;
    s.mode = s.mode || 'L';
    s.ctx = s.ctx || 'L';
    (s.teams || []).forEach((t) => {
      if (t.fs && !FORM[t.fs]) delete t.fs;
      if (!FORM[t.form]) {
        t.form = '2-3-1';
        try {
          autoLU(t);
        } catch (e) {}
      }
    });
    const d = s.dv || 0;
    if (d > DV) {
      MG = { n: 1 };
      const e = new Error('newer');
      e.newer = 1;
      throw e;
    }
    if (d < DV) {
      MG = { n: 0 };
      s.dv = DV;
    }
  }
  return s;
};
// Marché des transferts de la Cup (joueurs libres de la planète).
function natMkt() {
  if (!S.mkt || !S.mkt.length) S.mkt = mkt();
  const t = me(),
    pl = t.name,
    pool = natPool(pl),
    inR = new Set(t.ros);
  NAV = pool.filter((p) => !inR.has(p.n)).sort((a, b) => b.o - a.o);
  return (
    `<div class="card"><b>💰 ${S.cash} crédits</b> <span class="mu">· ${t.ros.length}/16 joueurs convoqués (11 minimum)</span> ${vwBtn()}</div><div class="card mu">Pour ${pl}, vous ne pouvez convoquer que des joueurs nés sur votre planète, quel que soit leur club. Leur fatigue et leurs blessures se répercutent sur leur club.</div><h2>Joueurs convoqués</h2><div class="card"><div class="pg">` +
    t.sq
      .map((p, i) => [p, i])
      .filter(([p, i]) => !t.lu.includes(i))
      .map(([p, i]) =>
        pc(
          p,
          V.mk == 'rl' + i ? 'sel' : '',
          `nk('rl',${i})`,
          `<div><b>${V.mk == 'rl' + i ? 'Libérer ?' : 'Rempl.'}</b></div>`,
        ),
      )
      .join('') +
    `</div><div class="mu">Touchez un remplaçant pour le libérer de la sélection (les titulaires ne peuvent pas l’être).</div></div><h2>Joueurs disponibles de ${pl}</h2><div class="card"><div class="pg">` +
    (NAV.length
      ? NAV.map((p, i) =>
          pc(
            p,
            V.mk == 'cv' + i ? 'sel' : '',
            `nk('cv',${i})`,
            `<div><b>${V.mk == 'cv' + i ? 'Convoquer ?' : 'Convoquer'}</b></div>`,
          ),
        ).join('')
      : '<span class="mu">Tous les joueurs de la planète sont déjà convoqués.</span>') +
    `</div></div><h2>Talents à recruter</h2><div class="card"><div class="pg">` +
    S.mkt
      .map((p, i) =>
        pc(
          p,
          V.mk == 'rc' + i ? 'sel' : '',
          `nk('rc',${i})`,
          `<div><b>${price(p) >> 1}</b> cr.${V.mk == 'rc' + i ? ' · confirmer ?' : ''}</div>`,
        ),
      )
      .join('') +
    `</div></div><h2>Staff</h2><div class="card">` +
    Object.keys(NS)
      .map(
        (k) =>
          `<div class="row"><span class="nm">${NS[k][0]} niv. ${S.staff[k]} <span class="mu">${NS[k][1]}</span></span><button onclick="up('${k}')" ${S.staff[k] >= 5 || S.cash < S.staff[k] * 800 ? 'disabled' : ''}>+ ${S.staff[k] * 800}</button></div>`,
      )
      .join('') +
    `</div>` +
    coachCard() +
    nnModal()
  );
}
// Mémoire de la navigation dans le marché.
let NAV = [];
// Clic sur un joueur du marché de la Cup (1er clic = confirmer, 2e = acheter).
function nk(a, i) {
  const k = a + i;
  if (V.mk != k) {
    V.mk = k;
    return render();
  }
  V.mk = null;
  if (a == 'rc' || a == 'cv') {
    // Choix du numéro de maillot avant de recruter ou de convoquer.
    const p0 = a == 'rc' ? S.mkt[i] : NAV[i];
    if (!p0) return render();
    V.nn = { a, i, n: p0.n, num: numFree(p0.nc || 0, p0.n) };
    return render();
  }
  const t = me(),
    pl = t.name;
  if (a == 'rl') {
    const p = t.sq[i];
    if (p && t.ros.length > 11 && !t.lu.includes(i)) {
      t.ros = t.ros.filter((n) => n != p.n);
      natSync(t);
    }
  } else if (a == 'cv') {
    const p = NAV[i];
    if (p && t.ros.length < 16) {
      t.ros.push(p.n);
      natSync(t);
    }
  } else if (a == 'rc') {
    const p = S.mkt[i];
    if (p && S.cash >= price(p) >> 1 && t.ros.length < 16) {
      tx('Recrutement', -(price(p) >> 1));
      S.mkt.splice(i, 1);
      S.free = S.free || {};
      (S.free[pl] = S.free[pl] || []).push(p);
      t.ros.push(p.n);
      natSync(t);
    }
  }
  save();
  render();
}
// Fenêtre de choix du numéro (marché de la Cup).
function nnSet(v) {
  if (!V.nn) return;
  V.nn.num = Math.max(1, Math.min(99, Math.round(+v) || 1));
  render();
}
function nnModal() {
  const o = V.nn;
  if (!o) return '';
  const p = o.a == 'rc' ? S.mkt.find((q) => q.n == o.n) : NAV.find((q) => q.n == o.n);
  if (!p) return '';
  const u = numUser(o.num, p.n),
    cost = o.a == 'rc' ? price(p) >> 1 : 0;
  return `<div class="mo" onclick="V.nn=null;render()"><div class="card ofm" style="max-width:420px" onclick="event.stopPropagation()"><div class="ofh"><b>${o.a == 'rc' ? 'Recruter' : 'Convoquer'} ${p.n}</b><button class="pfx" onclick="V.nn=null;render()" aria-label="Fermer">✕</button></div><div class="mu" style="margin:6px 0">${p.p} · note ${p.o}${cost ? ' · coût ' + cost + ' cr.' : ''}</div><div class="ofg"><span>Numéro de maillot (Cup)</span><div class="ofa2"><button onclick="nnSet(${o.num - 1})">−1</button><input type="number" min="1" max="99" value="${o.num}" onchange="nnSet(+this.value)"><button onclick="nnSet(${o.num + 1})">+1</button></div><em>1 à 99</em></div>${u ? `<div class="oft" style="color:#e5484d">Le n°${o.num} est déjà porté par ${u.n} : choisissez un autre numéro.</div>` : `<div class="oft" style="color:#2fb36b">Le n°${o.num} est libre.</div>`}<div class="ctl" style="justify-content:center;margin-top:8px"><button class="p" onclick="nnGo()" ${u || (cost && S.cash < cost) ? 'disabled' : ''}>Confirmer</button><button onclick="V.nn=null;render()">Annuler</button></div></div></div>`;
}
function nnGo() {
  const o = V.nn;
  if (!o) return;
  const t = me(),
    pl = t.name;
  if (o.a == 'cv') {
    const p = NAV.find((q) => q.n == o.n);
    if (p && t.ros.length < 16 && !numUser(o.num, p.n)) {
      p.nc = o.num;
      t.ros.push(p.n);
      natSync(t);
    }
  } else {
    const i = S.mkt.findIndex((q) => q.n == o.n),
      p = S.mkt[i];
    if (p && S.cash >= price(p) >> 1 && t.ros.length < 16 && !numUser(o.num, p.n)) {
      tx('Recrutement', -(price(p) >> 1));
      S.mkt.splice(i, 1);
      S.free = S.free || {};
      (S.free[pl] = S.free[pl] || []).push(p);
      p.nc = o.num;
      t.ros.push(p.n);
      natSync(t);
    }
  }
  V.nn = null;
  save();
  render();
}
// Page du marché : version League ou Cup selon le mode.
const mktView = () => (S.ctx == 'C' ? natMkt() : mktViewL());
// Mail de bienvenue d'une sélection nationale.
function welcomeN(ni) {
  S.obj = 2;
  mail(
    'Bienvenue à la tête de la sélection ' + TN[ni][0],
    'La fédération vous confie la sélection de ' +
      TN[ni][0] +
      ' pour la Galactik Cup, qui se joue comme une Coupe du monde : phase de poules (3 matchs), puis quarts, demies et finale. Objectif : terminer dans les 2 premiers de votre poule. Vous ne pouvez convoquer que des joueurs nés sur votre planète. Consultez l’onglet Convocations et le Calendrier.',
  );
}
// Passage à la saison suivante (League ou Cup, selon ce qui reste à jouer).
function newSeason() {
  if (S.mode == 'D' && S.alt && S.alt.md < S.alt.fx.length) {
    swapRaw();
    natSyncAll();
    V.tab = 'ov';
    mail(
      'Saison en cours',
      'Il reste des matchs à jouer en ' + compName(S.ctx) + ' avant de pouvoir lancer la nouvelle saison.',
    );
    save();
    return render();
  }
  load('Nouvelle saison…', newSeason0);
}
// ÉQUIPES QUI REJOIGNENT LA LIGUE À PARTIR DE LA SAISON 2 : [nom, niveau, écusson, formation, effectif
// (nom, poste, note)]. 12 joueurs chacune : 2 gardiens, 3 défenseurs, 4 milieux, 3 attaquants.
const NEWT = [
  {
    n: 'Quasars',
    l: 14,
    em: '⟦~1.1.0.0b0b1e.ffc83d.ffffff⟧',
    f: '3-1-2',
    r: [
      ['Orion Valk', 'GK', 73], ['Pax Lumen', 'GK', 60],
      ['Vesper Nox', 'DEF', 71], ['Kael Aphélie', 'DEF', 67], ['Tamsin Corona', 'DEF', 64],
      ['Solène Zénith', 'MID', 76], ['Rigel Orbis', 'MID', 70], ['Lyra Fusion', 'MID', 62], ['Eclipse Doran', 'MID', 60],
      ['Altaïr Brandt', 'ATT', 80], ['Nova Tessel', 'ATT', 74], ['Pollux Ardent', 'ATT', 58],
    ],
  },
  {
    n: 'Echoes',
    l: 14,
    em: '⟦~5.2.13.6a45c8.ff8fd0.ffffff⟧',
    f: '1-3-2',
    r: [
      ['Sélène Aurelle', 'GK', 70], ['Aldo Chorale', 'GK', 58],
      ['Ambre Tessiture', 'DEF', 68], ['Corvin Aigu', 'DEF', 66], ['Ludo Refrain', 'DEF', 58],
      ['Liora Cantabile', 'MID', 76], ['Thaddée Coda', 'MID', 73], ['Noé Sonore', 'MID', 71], ['Elsa Timbre', 'MID', 69],
      ['Mathis Vibrato', 'ATT', 72], ['Iris Fugue', 'ATT', 68], ['Basile Octave', 'ATT', 62],
    ],
  },
  {
    n: 'Titans',
    l: 14,
    em: '⟦~7.0.12.5a5f6b.c97a3a.e8e8e8⟧',
    f: '3-2-1',
    r: [
      ['Brann Ossak', 'GK', 74], ['Gus Tellur', 'GK', 58],
      ['Durgan Pilastre', 'DEF', 78], ['Hela Mont', 'DEF', 71], ['Rogh Strate', 'DEF', 69],
      ['Torvald Basalte', 'MID', 66], ['Ilka Sédim', 'MID', 64], ['Vessa Cairn', 'MID', 62], ['Pavel Moraine', 'MID', 59],
      ['Gorm Brisecœur', 'ATT', 73], ['Aldra Silex', 'ATT', 68], ['Sita Gneiss', 'ATT', 57],
    ],
  },
  {
    n: 'Mirage',
    l: 14,
    em: '⟦~4.3.7.d9a441.7a3b1d.f4d08a⟧',
    f: '2-2-2',
    r: [
      ['Idris Nafar', 'GK', 72], ['Omar Hadj', 'GK', 57],
      ['Samir Dune', 'DEF', 70], ['Tahar Oasis', 'DEF', 66], ['Rhaïs Tamarin', 'DEF', 63],
      ['Zahra Cimeterre', 'MID', 76], ['Naël Sirocco', 'MID', 68], ['Yanis Ergan', 'MID', 61], ['Amal Saline', 'MID', 59],
      ['Kenzo Mirabel', 'ATT', 79], ['Loubna Scarab', 'ATT', 73], ['Joran Sabel', 'ATT', 58],
    ],
  },
  {
    n: 'Nocturnes',
    l: 13,
    em: '⟦~2.1.6.2a1b4a.c9ccd8.ffffff⟧',
    f: '3-2-1',
    r: [
      ['Vael Sombrelune', 'GK', 72, 'Shadows'], ['Orsk Pénombre', 'GK', 58, 'Wambas'],
      ['Mirel Crépuscule', 'DEF', 70, 'Shadows'], ['Tarn Obscure', 'DEF', 66, 'Rykers'], ['Dessa Nuit-Claire', 'DEF', 62, 'Xenons'],
      ['Ilyan Veilleuse', 'MID', 73, 'Shadows'], ['Noct Aurelin', 'MID', 69, 'Shadows'], ['Sora Lueur', 'MID', 63, 'Snow Kids'], ['Brume Halden', 'MID', 59, 'Wambas'],
      ['Kyr Ténébrion', 'ATT', 77, 'Shadows'], ['Livia Étiole', 'ATT', 66, 'Xenons'], ['Zeph Mistral', 'ATT', 57, 'Comet'],
    ],
  },
  {
    n: 'Cumulus',
    l: 14,
    em: '⟦~3.0.0.5f6b82.ffd23f.ffffff⟧',
    f: '2-1-3',
    r: [
      ['Aron Nimbus', 'GK', 71, 'Rykers'], ['Pell Cirrus', 'GK', 57, 'Snow Kids'],
      ['Ezra Stratos', 'DEF', 69, 'Lightnings'], ['Maëla Grésil', 'DEF', 65, 'Wambas'], ['Bram Alto', 'DEF', 60, 'Xenons'],
      ['Ondine Voltaire', 'MID', 75, 'Lightnings'], ['Rafe Éther', 'MID', 70, 'Lightnings'], ['Jun Tonnerre', 'MID', 62, 'Shadows'],
      ['Ciel Arcane', 'ATT', 78, 'Lightnings'], ['Dario Orage', 'ATT', 72, 'Snow Kids'], ['Eliot Zénon', 'ATT', 63, 'Comet'], ['Faye Éclair', 'ATT', 58, 'Xenons'],
    ],
  },
  {
    n: 'Magmas',
    l: 12,
    em: '⟦~6.0.12.1c1612.ff7a1f.ffd08a⟧',
    f: '3-1-2',
    r: [
      ['Korg Basaltin', 'GK', 73, 'Rykers'], ['Thel Cendre', 'GK', 56, 'Shadows'],
      ['Draz Obsidien', 'DEF', 72, 'Rykers'], ['Hadra Fumerolle', 'DEF', 68, 'Rykers'], ['Varn Scorie', 'DEF', 61, 'Lightnings'],
      ['Ignis Kalder', 'MID', 70, 'Rykers'], ['Pyra Caldera', 'MID', 66, 'Rykers'], ['Orlan Tuf', 'MID', 59, 'Wambas'], ['Cinder Vorn', 'MID', 57, 'Comet'],
      ['Rhok Éruptis', 'ATT', 74, 'Rykers'], ['Sabe Lapilli', 'ATT', 65, 'Xenons'], ['Mako Pyrite', 'ATT', 58, 'Snow Kids'],
    ],
  },
];
// Cases de choix des nouvelles équipes sur l'écran de création de partie.
function newTiles() {
  return NEWT.map(
    (x, j) =>
      `<button onclick="load('Création du club…',()=>{init(${100 + j},'${V.nm || 'L'}');render()})">${x.em} ${x.n}${ft(x.n)}${bioBtn(x.n)}<br><span class="mu">Niveau ${x.l}/20 · nouvelle équipe fictive</span><br><span class="mu"><b>Prise en main équilibrée</b></span></button>`,
  ).join('');
}
// Fait entrer les trois nouvelles équipes dans la Ligue (à partir de la saison 2). Les effectifs sont créés
// une fois pour toutes ; le calendrier est ensuite refait avec toutes les équipes.
// Crée l'équipe (effectif de 12 joueurs, formation de départ) ; d = ajustement de difficulté des notes.
function mkNewTeam(x, d) {
  const sq = x.r.map(([n, p, o, g]) => ({
    n,
    p,
    o: Math.max(35, Math.min(95, o + d)),
    e: 100,
    f: 55 + ((n.length * 7) % 35),
    g: 0,
    og: g || x.n,
  }));
  const t = { name: x.n, em: x.em, sq, form: x.f, m: 1, lu: [], pts: 0, pl: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, fr: 1 };
  autoLU(t);
  return t;
}
function newTeams() {
  if (S.ctx == 'C') return false;
  const miss = NEWT.filter((x) => !S.teams.some((t) => t.name == x.n)),
    d = [-2, 0, 2][S.df ?? 1];
  if (!miss.length) return false;
  miss.forEach((x) => S.teams.push(mkNewTeam(x, d)));
  return miss.map((x) => x.n);
}
// Remet à zéro les compétitions pour une nouvelle saison.
function resetC() {
  mkJoin();
  const nw = newTeams();
  const r = rng(S.season * 31 + (S.ctx == 'C' ? 7 : 0));
  S.teams.forEach((t) => {
    t.pts = t.pl = t.gf = t.ga = t.w = t.d = t.l = 0;
    if (!t.nat) {
      t.sq.forEach((p) => {
        p.o = Math.max(40, Math.min(95, p.o));
        p.e = 100;
        p.g = 0;
      });
      // Les équipes IA changent de formation d'une saison à l'autre.
      if (t !== me() && !t.fr) {
        const ks = Object.keys(FORM);
        t.form = ks[(Math.random() * ks.length) | 0];
        delete t.fs;
      }
      autoLU(t);
    } else {
      t.sq.forEach((p) => {
        p.e = 100;
        p.g = 0;
      });
      natSync(t, t != me());
    }
  });
  S.teams.forEach((t) => delete t.fr);
  if (nw && S.ctx == 'L') {
    const NP = { Quasars: 'les Quasars (Hélion)', Titans: 'les Titans (Kéthros)', Mirage: 'le Mirage (Sahélis)', Echoes: 'les Echoes (Lyrrhia)', Nocturnes: 'les Nocturnes (Ombra)', Cumulus: 'les Cumulus (Xzion)', Magmas: 'les Magmas (Unadar)' },
      L = nw.map((n) => NP[n]);
    mail(
      nw.length > 1 ? nw.length + ' nouvelles équipes rejoignent la Ligue' : 'Une nouvelle équipe rejoint la Ligue',
      'Manager,\n\nÀ partir de cette saison, ' + (L.length > 1 ? L.slice(0, -1).join(', ') + ' et ' + L[L.length - 1] : L[0]) + ' ' + (L.length > 1 ? 'rejoignent' : 'rejoint') + ' la Ligue Galactique. La saison compte désormais ' + (S.teams.length * 2 - 2) + ' journées' + (S.teams.length % 2 ? ' (chaque club se repose une journée par tour : nombre impair d’équipes)' : '') + '.\n\nLe secrétariat',
    );
  }
  if (S.ctx != 'C') {
    contracts();
    youth();
  }
  S.hist = [];
  S.mrp = {};
  S.form = '';
  S.md = 0;
  S.res = [];
  S.cup = null;
  S.mkt = mkt();
  if (S.ctx == 'C') {
    assignG(S.teams);
    S.fx = schedG(S.teams);
  } else S.fx = sched(S.teams.length);
}
// Prépare tout ce qu'il faut pour démarrer une nouvelle saison.
function newSeason0() {
  stRoll();
  resetC();
  if (S.mode == 'D' && S.alt) {
    swapRaw();
    resetC();
    swapRaw();
    natSyncAll();
  }
  if (S.mode == 'C' && S.alt) {
    const r = rng(S.season * 17);
    S.alt.teams.forEach((t) =>
      t.sq.forEach((p) => {
        p.age = (p.age ?? 25) + 1;
        ageUp(p);
        p.e = 100;
        p.g = 0;
      }),
    );
  }
  S.day = 0;
  S.season++;
  if (S.season == 2 && S.ctx != 'C' && S.teams.some((t) => t.name == 'Tigres Rouges'))
    mail(
      'Le Souffle d’Akillian s’éveille chez les Tigres Rouges',
      'Manager,\n\nÀ partir de cette saison, les Tigres Rouges manifestent enfin le Souffle d’Akillian : leurs joueurs deviennent compatibles avec celui des Snow Kids et leurs bottes cybernétiques ne sont plus nécessaires.',
    );
  if (S.nb) {
    S.nb.k = 0;
    S.nb.nx = null;
  }
  S.fn = {};
  S.fh = [];
  tx('Dotation de saison', 500);
  V.tab = 'club';
  save();
  render();
}


// ======================================================================
// CONTENU CACHÉ (débloqué en jouant) : ne rien décrire ici pour ne pas gâcher la surprise
// ======================================================================
// Contenu caché : voir la note de la section.
const NB = String.fromCharCode(78, 101, 116, 104, 101, 114, 98, 97, 108, 108),
  LGN = IMGS.i2;
// Contenu caché.
let NBM = false;
// Contenu caché : indique s'il est débloqué.
const NBU = () => {
  try {
    return NBM || localStorage.getItem('gm_pf') == 'k4';
  } catch (e) {
    return NBM;
  }
};
// Contenu caché : déblocage.
function nbUnlock() {
  NBM = true;
  try {
    localStorage.setItem('gm_pf', 'k4');
  } catch (e) {}
}
// Contenu caché.
const dN = (k) => 20 + 30 * k,
  nbS = () => S.nb || (S.nb = { k: 0, w: 0, l: 0, t: 0, ops: [], nx: null, seen: 0 }),
  QZ = '​';
// Contenu caché.
const NBOP = [
    'Okar Dane',
    'Sylla Voss',
    'Brannok',
    'Teo Lanz',
    'Mirra Quell',
    'Hadrian Ko',
    'Zeph Arden',
    'Nolan Kreed',
    'Vesper Ink',
    'Iron Tess',
    'Cael Dray',
    'Lumi Orsk',
  ],
  NBA = (p) => p.o + ({ ATT: 4, MID: 2, DEF: -2, GK: -5 }[p.p] || 0),
  NBD = (p) => p.o + ({ GK: 6, DEF: 4, MID: 0, ATT: -4 }[p.p] || 0);
// Contenu caché.
const QS = [
  [2, 4],
  [2, 12],
  [2, 20],
  [3, 3],
  [3, 11],
  [3, 19],
];
// Contenu caché : textes.
function qText(i) {
  const q = S.q;
  return [
    [
      'Un petit service',
      'Vous ne me connaissez pas. Moi, je vous connais. Je suis les clubs de la galaxie depuis longtemps, et le vôtre me fascine : il cache bien plus que ce que dit le classement.\n\nJe vous propose un marché étrange. Perdez votre prochain match de championnat. Une seule défaite, rien de plus. En échange, je vous montrerai ce que personne ne voit dans cette galaxie : ce qui dort derrière le ballon.\n\nVous hésitez ? C’est normal. Mais ceux qui refusent ne reçoivent jamais de second message, et ils ne sauront jamais ce qu’ils ont laissé passer. Un match perdu pour une porte qui s’ouvre... À vous de voir.\n\n— M. Nether',
    ],
    [
      'Un nom',
      'Bien. Votre prochaine demande : alignez ' +
        q.x +
        ' parmi vos titulaires lors de votre prochain match. Pas d’explication, pas de remplacement.',
    ],
    [
      'Sans lumière',
      'Votre prochain match : gagnez-le sans que votre Fluide ne s’active une seule fois. La victoire sans le Fluide, voilà ce que je veux voir.',
    ],
    [
      'Le meilleur sur le banc',
      'Votre meilleur joueur, ' +
        q.x +
        ', ne doit pas être titulaire lors de vos deux prochains matchs consécutifs. Qu’il regarde.',
    ],
    ['Tout donner', 'Lors d’un même match, utilisez vos trois remplacements. Tous. Je compte.'],
    [
      'La dernière épreuve',
      'Gagnez un match en mentalité Défensive, avec ' +
        q.x +
        ' sur le banc. Si vous y parvenez, vous saurez tout.',
    ],
  ][i];
}
// Contenu caché.
function qOffer() {
  const q = S.q,
    t = me();
  if (q.n == 1) {
    const c = t.sq
      .map((p, i) => [p, i])
      .filter(([p, i]) => !p.inj && !t.lu.includes(i))
      .sort((a, b) => a[0].o - b[0].o)[0];
    q.x = c ? c[0].n : t.sq[0].n;
  }
  if (q.n == 3 || q.n == 5) {
    q.x = t.sq.slice().sort((a, b) => b.o - a.o)[0].n;
  }
  q.s = 'o';
  const [ti, b] = qText(q.n);
  mail(QZ + ti, b, [
    ['Accepter', 'qa'],
    ['Refuser', 'qr'],
  ]);
}
// Contenu caché.
function qAct(i, j) {
  const m = S.mail[i],
    a = m.a[j];
  m.a = null;
  if (a[1] == 'qa') {
    S.q.s = 'a';
    S.q.t = 0;
    S.q.c = 0;
    m.b += '\n\n→ Vous avez accepté.';
  } else {
    S.q.s = 'x';
    m.b += '\n\n→ Vous avez refusé.';
  }
  save();
  render();
}
// Contenu caché : vérification d'une condition après chaque match.
function qCheck(M) {
  if (S.ctx == 'C' || S.mode == 'C' || M.cup) return;
  if (!S.q) S.q = NBU() ? { s: 'x' } : { n: 0, s: 'w', t: 0, c: 0 };
  const q = S.q;
  if (q.s == 'x') return;
  const t = me(),
    i = M.t.indexOf(t);
  if (i < 0) return;
  const g = M.sc[i],
    c = M.sc[1 - i],
    win = g > c,
    x = q.x ? t.sq.findIndex((p) => p.n == q.x) : -1,
    inL = x >= 0 && t.lu.includes(x);
  let done = false;
  if (q.s == 'a') {
    let ok = null;
    if (q.n == 0) ok = g < c;
    else if (q.n == 1) ok = inL;
    else if (q.n == 2) ok = win && !(M.fu && M.fu[i]);
    else if (q.n == 3) {
      if (!inL) {
        q.c++;
        if (q.c >= 2) ok = true;
      } else {
        q.c = 0;
        ok = false;
      }
    } else if (q.n == 4) ok = V.sub <= 0;
    else if (q.n == 5) ok = win && t.m == 0 && !inL;
    if (ok === true) {
      q.n++;
      q.t = 0;
      q.c = 0;
      q.s = 'w';
      done = true;
      if (q.n >= 6) return qWin();
      mail(
        QZ + 'Bien',
        [
          'Parfait.',
          'Exactement ce que j’attendais.',
          'Vous apprenez vite.',
          'Je savais que vous iriez jusqu’au bout.',
          'Il n’en reste plus qu’une.',
        ][q.n - 1] + ' Je reprendrai contact.',
      );
    } else if (ok === false) {
      q.t++;
      if (q.t >= 3) {
        q.s = 'x';
        mail(QZ + 'Déception', 'Vous m’avez déçu. Cette conversation n’a jamais eu lieu.');
      } else
        mail(
          QZ + 'Pas tout à fait',
          'Ce n’est pas ce que j’avais demandé. Je vous laisse une nouvelle chance : la consigne reste la même.',
        );
    }
  }
  if (
    !done &&
    q.s == 'w' &&
    q.n < 6 &&
    (S.season > QS[q.n][0] || (S.season == QS[q.n][0] && S.md >= QS[q.n][1]))
  )
    qOffer();
}
// Contenu caché.
function qWin() {
  nbUnlock();
  S.q.s = 'x';
  nbS();
  mail(
    QZ + 'Vous avez tout accepté',
    'Peu de gens auraient obéi jusqu’au bout. Vous avez gagné le droit de connaître un secret : une arène sphérique, deux trous, une balle et un seul vainqueur. Les soirs où votre équipe ne joue pas, présentez-vous. — Un ami',
  );
  mail(
    'Nouvel accès : ' + NB,
    'Un nouvel onglet « ' +
      NB +
      ' » est apparu dans le menu Club. Les règles et le tutoriel s’y trouvent. Bonne chance, champion.',
  );
  V.nbNew = 1;
}
// Contenu caché.
function nbNext() {
  const n = nbS();
  if (!n.nx) {
    const r = n.k % 3;
    if (r == 0)
      n.ops = NBOP.slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    n.nx = {
      n: n.ops[r],
      o: Math.min(92, Math.round(54 + S.season * 2 + r * 7 + Math.random() * 8)),
      v: Math.random() < 0.5 ? 'R' : 'O',
    };
  }
  return n.nx;
}
// Contenu caché.
function nbGo() {
  V.tab = 'nb';
  nbNext();
  save();
  render();
}
// Contenu caché.
function nbPick(i) {
  const p = me().sq[i];
  if (!p || p.inj) return;
  const n = nbS(),
    x = nbNext();
  V.nd = {
    p,
    op: { n: x.n, o: x.o },
    sc: [0, 0],
    r: 0,
    v: x.v,
    att: Math.random() < 0.5 ? 0 : 1,
    lg: [],
    done: 0,
    fl: 0,
    ef: 0.7 + (0.3 * p.e) / 100,
    rd: n.k % 3,
    hurt: 0,
  };
  render();
}
// Contenu caché.
function nbAct(c) {
  const d = V.nd;
  if (!d || d.done || (d.att == 0 && c > 2)) return;
  const p = d.p,
    pa = d.att == 0,
    s = pa ? c : [0, 1, 1, 2][(Math.random() * 4) | 0],
    g = pa ? (Math.random() < 0.15 ? 3 : [0, 1, 1, 2][(Math.random() * 4) | 0]) : c,
    A = pa ? NBA(p) * d.ef : d.op.o,
    D = pa ? d.op.o * 0.97 : NBD(p) * d.ef;
  let pg = Math.max(0.08, Math.min(0.7, 0.36 + (A - D) / 150));
  pg += d.v == 'O' ? [-0.08, 0, 0.12][s] : [0.05, 0, -0.03][s];
  const SN = ['puissant', 'placé', 'courbe'],
    who = pa ? p.n : d.op.n + ' ' + FIC;
  let note = '';
  if (g == 3) {
    if (Math.random() < 0.5) {
      pg = 0;
      note = 'obstruction réussie, le tir est stoppé. ';
    } else {
      pg += 0.12;
      note = 'obstruction ratée. ';
    }
    if (!pa) d.fl++;
    else if (Math.random() < 0.06) d.hurt = 1;
  } else if (g == s) {
    pg *= 0.3;
    note = 'tir lu par le défenseur. ';
  }
  const goal = Math.random() < pg;
  if (goal) {
    d.sc[pa ? 0 : 1]++;
    sfx('goal');
  }
  d.lg.unshift(
    d.r + 1 + '. ' + who + ' tente un tir ' + SN[s] + ' — ' + note + (goal ? 'BUT !' : 'pas de but.'),
  );
  d.r++;
  d.att ^= 1;
  const [a, b] = d.sc;
  if (a >= 3 || b >= 3 || (d.r >= 12 && a != b) || d.r >= 20) {
    d.done = 1;
    d.win = a > b || (a == b && Math.random() < 0.5);
    nbFin(d);
  }
  render();
}
// Contenu caché.
function nbFin(d) {
  const n = nbS(),
    rd = d.rd;
  d.p.e = Math.max(30, d.p.e - d.r * 2 - d.fl * 3);
  if (d.hurt) d.p.inj = 2;
  if (d.win) {
    n.w++;
    tx('Gains nocturnes', 300 * (rd + 1) + (rd == 2 ? 1200 : 0));
    if (rd == 2) {
      n.t++;
      S.ach = S.ach || {};
      S.ach.nbm = 1;
      unlock('bl_nbw', 'Ballon : Maître du ' + NB, 'ball');
      mail('Maître du ' + NB, 'Vous remportez le tournoi : vous restez le maître de l’arène.');
    }
    n.k++;
  } else {
    n.l++;
    n.k = (Math.floor(n.k / 3) + 1) * 3;
  }
  n.nx = null;
  save();
}
// Contenu caché.
function nbEnd() {
  V.nd = null;
  save();
  render();
}
// Contenu caché : écran.
function nbView() {
  if (!NBU()) return '';
  const n = nbS(),
    e = nextEv(),
    due = n.k < 6 && S.day >= dN(n.k),
    RD = ['Quart de finale', 'Demi-finale', 'Finale'];
  HELP.nb =
    'Duel 1 contre 1 dans une arène sphérique. Chaque échange : l’attaquant choisit un tir, le défenseur devine ou tente une obstruction. Le premier à 3 buts l’emporte.';
  let h = `<div class="card nbh"><img class="nbl" src="${LGN}" alt="${NB}"><div><b style="font-size:18px">${NB}</b> ${hp('nb')}<div class="mu">Duel 1 contre 1 · arène sphérique · deux trous · tir uniquement</div><div class="mu">Bilan : ${n.w} victoires · ${n.l} défaites · ${n.t} tournoi${n.t > 1 ? 's' : ''} remporté${n.t > 1 ? 's' : ''}</div></div></div>`;
  const d = V.nd;
  if (d) {
    const t = me();
    h += `<div class="card"><div class="mu" style="text-align:center">${RD[d.rd]} · ${d.v == 'R' ? 'Arène classique' : 'Arène à obstacles'} · échange ${Math.min(d.r + 1, 20)}</div><div class="score">${d.sc[0]} - ${d.sc[1]}</div><div style="text-align:center"><b>${d.p.n}</b> contre <b>${d.op.n} ${FIC}</b> <span class="mu">(niveau ${d.op.o})</span></div>`;
    if (d.done)
      h += `<div style="text-align:center;margin:10px 0"><b>${d.win ? 'Victoire ! Vous restez le maître de l’arène.' : 'Défaite. Vous êtes éliminé de ce tournoi.'}</b></div><button class="p" onclick="nbEnd()">Continuer</button>`;
    else if (d.att == 0)
      h += `<div class="mu" style="margin:8px 0">À vous d’attaquer : choisissez votre tir.</div><div class="ctl"><button class="p" onclick="nbAct(0)" title="Puissant, bon en arène classique.">Tir puissant</button><button class="p" onclick="nbAct(1)" title="Précis, jamais risqué.">Tir placé</button><button class="p" onclick="nbAct(2)" title="Contourne les obstacles, plus faible en arène classique.">Tir courbe</button></div>`;
    else
      h += `<div class="mu" style="margin:8px 0">${d.op.n} attaque : devinez son tir, ou tentez l’obstruction (faute autorisée, mais risquée).</div><div class="ctl"><button class="p" onclick="nbAct(0)">Contrer le tir puissant</button><button class="p" onclick="nbAct(1)">Contrer le tir placé</button><button class="p" onclick="nbAct(2)">Contrer le tir courbe</button><button onclick="nbAct(3)">⚠ Obstruction (faute)</button></div>`;
    h += `</div><div class="card log">${
      d.lg
        .slice(0, 8)
        .map((l) => `<div>${l}</div>`)
        .join('') || '<div class="mu">Le duel commence.</div>'
    }</div>`;
  } else if (due) {
    const x = nbNext(),
      t = me();
    h +=
      `<div class="card"><b>🌑 ${RD[n.k % 3]}</b><div class="mu">Adversaire : <b>${x.n} ${FIC}</b> · niveau ${x.o} · ${x.v == 'R' ? 'arène classique' : 'arène à obstacles (le tir courbe y est favorisé)'}</div><div class="mu" style="margin-top:6px">Choisissez votre champion dans l’effectif. Sa fatigue et ses blessures comptent pour votre équipe.</div></div><div class="card"><div class="pg">` +
      t.sq
        .map((p, i) => [p, i])
        .filter(([p]) => !p.inj)
        .sort((a, b) => b[0].o - a[0].o)
        .slice(0, 10)
        .map(([p, i]) => pc(p, '', `nbPick(${i})`, `<div><b>Att ${NBA(p)} · Déf ${NBD(p)}</b></div>`))
        .join('') +
      `</div></div>`;
  } else
    h += `<div class="card">${n.k < 6 ? `Prochaine soirée : <b>${fmtDay(dN(n.k))}</b> · ${RD[n.k % 3]} du tournoi ${Math.floor(n.k / 3) + 1}.` : n.k >= 6 ? 'Plus de soirée cette saison. Rendez-vous à la prochaine.' : 'Les soirées ont lieu les jours sans match de votre équipe.'}<div class="ctl" style="margin-top:8px">${due ? '' : ''}</div></div>`;
  h += `<div class="card"><b>Règles</b><div class="mu" style="margin-top:4px;line-height:1.6">Une balle, deux trous : ce sont les buts. Pas de passes, pas de Fluide : seul le tir compte. Les fautes sont autorisées. Deux variantes d’arène : classique ou à obstacles. Le vainqueur reste « maître » et le perdant est éliminé. Chaque tournoi compte trois duels : quart, demi, finale.<br>À chaque échange, l’attaquant choisit un tir (puissant, placé ou courbe) ; le défenseur tente de le deviner ou d’obstruer. Premier à 3 buts.</div></div>`;
  n.seen = 1;
  return h;
}

// ======================================================================
// PRÉSENTATIONS DES CLUBS ET DES PLANÈTES (textes)
// ======================================================================
// Texte de présentation de chaque club. Pour modifier une présentation, éditer le texte ici.
const BIO = {
  'Snow Kids': [
    'Akillian',
    'Venus des glaces, les Snow Kids ont grandi sur une planète où chaque entraînement se fait dans le blizzard. Équipe jeune, rapide et soudée, elle rêve de prouver que le courage vaut mieux que le talent brut.',
  ],
  Shadows: [
    'Ombra',
    'Originaires d’Ombra, un monde plongé dans une nuit presque permanente, les Shadows jouent dans l’ombre et frappent sans prévenir. Leur ambition : renverser les favoris et imposer leur loi sur la ligue.',
  ],
  'Team Paradisia': [
    'Paradisia',
    'Venue d’une planète-jardin où tout n’est qu’harmonie, Team Paradisia mise sur la technique, le collectif et l’élégance. Son rêve : gagner en beauté, sans jamais renoncer à ses valeurs.',
  ],
  Lightnings: [
    'Xzion',
    'Sur Xzion, les orages font partie du quotidien. Les Lightnings ont hérité de cette énergie : jeu électrique, contre-attaques foudroyantes et une soif de victoire qui ne s’éteint jamais.',
  ],
  Wambas: [
    'Wamba Prime',
    'Les Wambas viennent d’une planète tropicale où le football est une fête. Joueurs imprévisibles et généreux, ils veulent surprendre la galaxie et prouver qu’on peut gagner en souriant.',
  ],
  Rykers: [
    'Unadar',
    'Forgés sur Unadar, un monde de roche et de volcans, les Rykers sont durs au mal et redoutables dans les duels. Leur ambition : bâtir une muraille que personne ne franchira.',
  ],
  Xenons: [
    'Archipel Xenon',
    'Les Xenons sont les enfants d’un archipel sauvage et mystérieux. Agiles et insaisissables, ils déroutent leurs adversaires et rêvent de s’imposer parmi les grandes équipes de la ligue.',
  ],
  'Tigres Rouges': [
    'Akillian',
    'Les Tigres Rouges voulaient fonder un nouveau règne du football sur Akillian, en changeant entièrement son style et ses couleurs. Artegor Nexus a accepté de les accompagner, y voyant une occasion de gagner beaucoup d’argent et de créer quelque chose de nouveau. Battus par les Snow Kids, ils n’ont plus le droit de représenter Akillian : ce n’est plus qu’une équipe privée. Privés du Souffle d’Akillian, ils compensent par des bottes cybernétiques qui boostent par moments leur vitesse, leur agilité et leurs frappes. On ignore pourquoi ils portent des casques. À partir de la saison 2, le Souffle d’Akillian s’éveille enfin chez eux.',
  ],
  Pirates: [
    'Pirates',
    'Équipe de flibustiers de l’espace sans planète fixe, les Pirates jouent sans règles apparentes. Rusés et opportunistes, ils cherchent la gloire, et le butin qui va avec.',
  ],
  Elektras: [
    'Hektonïa',
    'Sur Hektonïa, tout fonctionne à l’énergie pure, et les Elektras n’en manquent jamais. Équipe moderne et vive, elle veut s’imposer par la vitesse, la précision et un pressing incessant.',
  ],
  Cyclopes: [
    'Cyclopia',
    'Les Cyclopes viennent de Cyclopia, un monde où l’on ne quitte jamais l’objectif des yeux. Disciplinés et patients, ils attendent la faille pour frapper et rêvent d’un premier grand titre.',
  ],
  Technodroids: [
    'Technoïd',
    'Venus de Technoïd, ces joueurs-machines appliquent des schémas parfaitement huilés. Leur ambition : prouver que la rigueur et la science du jeu peuvent battre l’instinct.',
  ],
  'Vortex': [
    'Kaldor',
    'Créé pour ce jeu, le Vortex vient d’une planète traversée par des ceintures de cyclones permanents, où les Kaldoriens vivent dans des cités accrochées aux falaises. Presque humains, ils ont la peau gris-vert marquée de spirales naturelles, des yeux ambrés protégés par une seconde paupière transparente et, parfois, une crête de fines plumes à la place des cheveux. Comme les nuées d’étourneaux qui virevoltent d’un seul mouvement, ils jouent en bloc, en tourbillon : c’est la Synergie du vortex. Longtemps ignorés des grandes ligues, ils veulent s’inviter à la table des grands.',
  ],
  'Comet': [
    'Vega',
    'Créées pour ce jeu, les Comet viennent d’une planète qui tourne autour d’un couple d’étoiles sur une orbite très étirée : quelques mois de lumière aveuglante, puis une très longue nuit de poussière. Les Vegiens, grands et minces, ont la peau translucide, lilas à bleu nuit, parsemée de points lumineux dorés comme des constellations, et de fins cheveux-filaments qui brillent aux pointes, la « queue de comète ». Ils stockent la lumière le jour et la libèrent la nuit : lents à démarrer, fulgurants en fin de match (Dernier souffle). Chaque enfant porte le nom de la comète qui passait le jour de sa naissance.',
  ],
  Quasars: [
    'Hélion',
    'Créés pour ce jeu, les Quasars viennent d’Hélion, les restes tièdes d’une étoile effondrée, traversés de veines d’énergie qui brillent la nuit. Peau sombre striée de lignes lumineuses, yeux sans pupille : ils jouent sobrement, accumulent l’énergie, puis la libèrent d’un coup en fin de match.',
  ],
  Titans: [
    'Kéthros',
    'Créés pour ce jeu, les Titans viennent de Kéthros, une planète trois fois plus lourde que la normale. Trapus, denses et presque infatigables, ils verrouillent le jeu avec un bloc défensif écrasant et ralentissent tout ce qui s’approche de leur but.',
  ],
  Echoes: [
    'Lyrrhia',
    'Créés pour ce jeu, les Echoes viennent de Lyrrhia, une planète de cristaux sonores où chaque cité est un instrument géant. Grands, fins et à l’ouïe exceptionnelle, ils sentent leurs coéquipiers sans les regarder : pas de star, mais personne ne joue aussi bien ensemble.',
  ],
  Mirage: [
    'Sahélis',
    'Créés pour ce jeu, les Mirage viennent de Sahélis, un monde désertique où l’air brûlant déforme tout. Longs, secs et agiles, ils gagnent en trompant l’adversaire : leurs feintes et leurs doubles illusoires affolent les défenses.',
  ],
  Nocturnes: [
    'Ombra',
    'Créés pour ce jeu, les Nocturnes viennent d’Ombra, comme les Shadows, mais des cités souterraines qu’ils n’ont jamais quittées. Peau pâle, grands yeux faits pour la pénombre, ils partagent le Smog des Ombres de leurs voisins et reprochent aux Shadows d’avoir vendu leur monde à la lumière des stades.',
  ],
  Cumulus: [
    'Xzion',
    'Créés pour ce jeu, les Cumulus viennent des plateaux nuageux de Xzion, là où naissent les orages. Grands, aux yeux gris-bleu qui crépitent d’étincelles, ils partagent la Foudre des Lightnings mais jouent l’orage patient : ils accumulent, puis éclatent.',
  ],
  Magmas: [
    'Unadar',
    'Créés pour ce jeu, les Magmas viennent des volcans actifs de Unadar, sous la muraille des Rykers dont ils partagent le Mur de roche. Trapus, la peau striée de veines orangées, ils jouent à l’usure, et une vieille querelle de familles les oppose aux Rykers pour l’héritage du grand cratère.',
  ],
};
// Ouvre la fenêtre de présentation d'un club.
function bioShow(n) {
  const b = BIO[n];
  if (!b) return;
  let o = document.getElementById('biom');
  if (!o) {
    o = document.createElement('div');
    o.id = 'biom';
    o.onclick = (e) => {
      if (e.target === o) o.remove();
    };
    document.body.appendChild(o);
  }
  const i = T.findIndex((x) => x[0] == n),
    t = T[i] || (NEWT.find((x) => x.n == n) ? [n, NEWT.find((x) => x.n == n).l, NEWT.find((x) => x.n == n).em] : null);
  o.innerHTML = lgR(
    `<div class="bioc"><button class="x" onclick="document.getElementById('biom').remove()">✕</button><h3>${t ? t[2] + ' ' : ''}${n}</h3><div class="mu">Planète : <b>${b[0]}</b>${t ? ' · Niveau ' + t[1] + '/20 · ' + (FICT.includes(n) ? 'équipe fictive' : 'équipe de la série') : ''}</div><p>${b[1]}</p><div class="ctl"><button class="p" onclick="document.getElementById('biom').remove();load('Création du club…',()=>{init(${i},'${V.nm || 'L'}');render()})">Choisir ce club</button></div></div>`,
  );
  icoFix();
}
// Petit bouton « i » de présentation d'un club.
function bioBtn(n) {
  return BIO[n]
    ? `<span class="bio" role="button" tabindex="0" title="Présentation du club" onclick="event.stopPropagation();bioShow('${n}')">Bio</span>`
    : '';
}
// Texte de présentation de chaque planète.
const PBIO = {
  Akillian:
    'Planète de neige et de glace, Akillian aligne une sélection jeune et volontaire. Habituée aux conditions extrêmes, elle compte sur son cœur et sa solidarité pour défier les grandes nations de la Cup.',
  Ombra:
    'Monde plongé dans la pénombre, Ombra envoie en Cup une sélection sombre et redoutable. Discrète en poule, elle se révèle dans les moments décisifs et vise une première couronne galactique.',
  Paradisia:
    'Planète d’harmonie et de technologie douce, Paradisia présente une sélection au jeu léger et collectif. Sa fierté : séduire le public tout en allant le plus loin possible dans le tournoi.',
  Xzion:
    'Terre d’orages et d’énergie, Xzion compte parmi les grandes nations de la Cup. Sa sélection, électrique et offensive, joue chaque édition pour le titre et ne se contente jamais d’une place d’honneur.',
  'Wamba Prime':
    'Planète tropicale où le football est une fête, Wamba Prime envoie une sélection joyeuse et imprévisible. Outsider assumé, elle rêve de créer la surprise et de faire danser tout le tournoi.',
  Unadar:
    'Monde de roche et de volcans, Unadar bâtit une sélection robuste, taillée pour les duels. Peu spectaculaire mais difficile à battre, elle veut s’imposer par la rigueur et l’endurance.',
  'Archipel Xenon': 'Archipel sauvage et mystérieux, l’Archipel Xenon aligne des joueurs agiles et insaisissables. Sa sélection aime surprendre en contre et ambitionne de s’installer durablement parmi les nations qui comptent.',
  Pirates:
    'Sans véritable terre d’attache, la sélection des Pirates réunit des aventuriers de tous horizons. Imprévisible et opportuniste, elle joue la Cup comme une expédition : chercher la gloire et ne rien laisser derrière.',
  Hektonïa:
    'Planète d’énergie pure, Hektonïa présente une sélection rapide et intense. Son pressing incessant fatigue les adversaires, et elle espère transformer cette vitesse en première grande performance.',
  Cyclopia:
    'Monde où l’on garde toujours l’objectif en ligne de mire, Cyclopia aligne une sélection patiente et disciplinée. Elle attend la faille pour frapper et rêve d’un premier grand résultat en Cup.',
  Technoïd:
    'Planète de science et de mécanique, Technoïd envoie une sélection réglée comme une horloge. Son ambition : démontrer que la préparation et la rigueur peuvent faire plier les plus grandes nations.',
  Vega: 'Planète fictive en orbite étirée autour de deux étoiles, Vega alterne mois de lumière aveuglante et longue nuit de poussière. Son peuple, translucide et parsemé de points lumineux, stocke la lumière le jour et la dépense la nuit : sa sélection est fulgurante en fin de match mais irrégulière. Nation montante, elle veut laisser une traînée brillante dans la Cup.',
  Kaldor:
    'Planète fictive traversée par des cyclones permanents, Kaldor est peuplée de cités accrochées aux falaises. Ses habitants, presque humains, ont la peau marquée de spirales et des yeux protégés du vent ; habitués à bouger en nuée, ils jouent en tourbillon. En pleine ascension, la sélection vient défier l’ordre établi et s’inviter à la table des grands.',
  Ysolde:
    'Planète fictive, discrète et lointaine, Ysolde fait ses premiers pas au grand jour avec une sélection sans complexe. Sans pression ni étiquette, elle vient écrire sa propre légende.',
};
// Ouvre la fenêtre de présentation d'une planète.
function bioShowP(p) {
  const t = PBIO[p];
  if (!t) return;
  const i = TN.findIndex((x) => x[0] == p),
    n = TN[i];
  let o = document.getElementById('biom');
  if (!o) {
    o = document.createElement('div');
    o.id = 'biom';
    o.onclick = (e) => {
      if (e.target === o) o.remove();
    };
    document.body.appendChild(o);
  }
  o.innerHTML = lgR(
    `<div class="bioc"><button class="x" onclick="document.getElementById('biom').remove()">✕</button><h3>${n[2]} ${p}</h3><div class="mu">Sélection nationale · Niveau ${n[1]}/20 · ${['Ysolde', 'Vega', 'Kaldor'].includes(p) ? 'planète fictive' : 'planète de la série'}</div><p>${t}</p><div class="ctl"><button class="p" onclick="document.getElementById('biom').remove();load('Création de la sélection…',()=>{init(${Math.max(
      0,
      T.findIndex((x) => planet(x[0]) == p),
    )},'C',${i});V.mkp=0;render()})">Choisir cette sélection</button></div></div>`,
  );
  icoFix();
}
// Petit bouton « i » de présentation d'une planète.
function bioBtnP(p) {
  return PBIO[p]
    ? `<span class="bio" role="button" tabindex="0" title="Présentation de la sélection" onclick="event.stopPropagation();bioShowP('${p}')">Bio</span>`
    : '';
}
// Équipes de la série (noms officiels).
const CANON = [
    'Snow Kids',
    'Shadows',
    'Team Paradisia',
    'Lightnings',
    'Wambas',
    'Rykers',
    'Xenons',
    'Tigres Rouges',
    'Pirates',
    'Elektras',
    'Cyclopes',
    'Technodroids',
    'Akillian',
    'Ombra',
    'Paradisia',
    'Xzion',
    'Wamba Prime',
    'Unadar',
    'Archipel Xenon',
    'Hektonïa',
    'Cyclopia',
    'Technoïd',
  ],
  FICT = { includes: (n) => !CANON.includes(n) },
  FIC = '<i class="fic" title="Contenu fictif, inventé pour ce jeu (absent de la série)">✦</i>',
  fp = (p) => (p.c ? '' : ' ' + FIC),
  ft = (n) => (FICT.includes(n) ? ' ' + FIC : '');
// Postes (gardien, défenseur, milieu, attaquant), formations possibles (FORM) et mentalités
// (MENT). Pour ajouter une formation : l'ajouter dans FORM.
const POS = ['GK', 'DEF', 'MID', 'ATT'],
  // Toutes les répartitions possibles des 6 joueurs de champ (défense-milieu-attaque) devant le gardien.
  FORM = (() => {
    // Au moins 1 joueur et au plus 3 par poste (défense, milieu, attaque) : 7 formations possibles.
    const F = { '2-3-1': [1, 2, 3, 1], '2-2-2': [1, 2, 2, 2], '3-2-1': [1, 3, 2, 1] };
    for (let d = 3; d >= 1; d--) for (let m = 3; m >= 1; m--) { const a = 6 - d - m; if (a >= 1 && a <= 3) F[d + '-' + m + '-' + a] ||= [1, d, m, a]; }
    return F;
  })(),
  MENT = ['Défensive', 'Équilibrée', 'Offensive'];
// Table de correspondance entre noms d'équipes.
const NM = { 'Pirates (équipe)': 'Pirates', 'Technoid / Technodroids': 'Technodroids' };
// POUVOIRS SPÉCIAUX DE CHAQUE ÉQUIPE (Fluide) : nom, description et effet. Modifier ici pour
// changer un pouvoir.
// Part des actions où le fluide contourne la construction du jeu (téléportation, paralysie, bulles...) et mène droit à la frappe.
// Couleur de l'aura de chaque fluide (traînées bleues du Souffle, boue du Smog, éclairs blancs, bulles bleues...).
const FXV = { breath: '#4fb8ff', multi: '#b78bff', smog: '#16101e', ionic: '#ffffff', metalcry: '#ffe14d', furnace: '#3cff6a', agile: '#ff9a2e', bubble: '#59c8ff', confuse: '#4dff9a' };
const FXB = { chance: 1, mirage: 0.85, smog: 0.5, ionic: 0.7, metalcry: 0.6, furnace: 0.35, agile: 0.45, confuse: 0.45, bubble: 0.5, breath: 0.2, multi: 0.3 };
let FX = {
  'Snow Kids': { t: 'a', k: 'breath', n: 'Souffle d’Akillian', d: 'Fluide de première catégorie : frappes bien plus puissantes et énergie démesurée, la fatigue de l’équipe se dissipe.' },
  Shadows: { t: 'a', k: 'smog', n: 'Smog', d: 'Fluide de troisième catégorie : force accrue et téléportation qui contourne la défense.' },
  'Team Paradisia': {
    t: 'a',
    k: 'multi',
    n: 'Multifluide',
    d: 'Fluide de synthèse réservé aux cyborgs : il possède les pouvoirs du Souffle (frappes bien plus puissantes, énergie qui se régénère), avec en plus des actions menées plus souvent droit au tir.',
  },
  Lightnings: { t: 'a', k: 'ionic', n: 'Vague Ionique', d: 'Fluide de troisième catégorie : téléportation dans des éclairs blancs, la défense est déjouée.' },
  Wambas: { t: 'a', k: 'agile', n: 'Esprit d’Ibo', d: 'Fluide de première catégorie : agilité hors du commun, dribbles et frappes qui surprennent.' },
  Rykers: { t: 'a', k: 'metalcry', n: 'Cri de Métal', d: 'Fluide de seconde catégorie : des ondes électriques paralysent l’adversaire, défense et gardien figés.' },
  Xenons: { t: 'a', k: 'furnace', n: 'La Fournaise', d: 'Fluide de troisième catégorie : vitesse inouïe, force physique et substance visqueuse qui bloque les défenseurs.' },
  'Tigres Rouges': {
    t: 'a',
    k: 'boots',
    n: 'Bottes cybernétiques',
    d: 'Pas de Fluide : de temps à autre, vitesse et agilité accrues, avec des frappes plus précises et plus puissantes. À partir de la saison 2, ils maîtrisent le Souffle d’Akillian.',
  },
  Pirates: { t: 'd', k: 'steal', n: 'Vol de flux', d: 'En défense, vole le ballon et contre-attaque.' },
  Elektras: { t: 'a', k: 'bubble', n: 'Vague d’Hektonïa', d: 'Fluide de seconde catégorie : bulles qui permettent de glisser, de sauter très haut et d’enfermer le ballon.' },
  Cyclopes: { t: 'a', k: 'confuse', n: 'Onde cérébrale', d: 'Fluide de seconde catégorie : des cercles verts sèment la confusion chez la personne visée.' },
  Nocturnes: { t: 'a', k: 'smog', n: 'Smog', d: 'Fluide de troisième catégorie : force accrue et téléportation qui contourne la défense.' },
  Cumulus: { t: 'a', k: 'ionic', n: 'Vague Ionique', d: 'Fluide de troisième catégorie : téléportation dans des éclairs blancs, la défense est déjouée.' },
  Magmas: { t: 'a', k: 'metalcry', n: 'Cri de Métal', d: 'Fluide de seconde catégorie : des ondes électriques paralysent l’adversaire, défense et gardien figés.' },
  Quasars: { t: 'a', k: 'surge', n: 'Éruption stellaire', d: 'Plus le match avance, plus la frappe est dévastatrice : l’énergie accumulée se libère surtout en fin de partie.' },
  Titans: { t: 'd', k: 'weight', n: 'Poids du monde', d: 'En défense, alourdit l’action adverse : l’attaque s’enlise et ne peut pas aboutir.' },
  Echoes: { t: 's', k: 'harmony', n: 'Harmonie', d: 'Après un but, tout le chœur monte d’un ton : toute l’équipe joue mieux pendant plusieurs minutes.' },
  Mirage: { t: 'a', k: 'mirage', n: 'Mirage', d: 'Un double illusoire trompe la défense : l’occasion est créée presque à coup sûr.' },
  'Vortex': {
    t: 'a',
    k: 'sync',
    n: 'Synergie du vortex',
    d: 'Bonus proportionnel à la supériorité au milieu de terrain.',
  },
  Technodroids: {
    t: 'a',
    k: 'calc',
    n: 'Calcul parfait',
    d: 'Tir à 45 % de réussite garantis, sans variance.',
  },
  'Comet': {
    t: 'a',
    k: 'late',
    n: 'Dernier souffle',
    d: 'Redoutables en fin de match (après la 70e minute).',
  },
};
// Liste d'équipes de la League.
let TL = T;
// Copies de sauvegarde des données d'origine (avant les mods de l'éditeur).
const T0 = JSON.parse(JSON.stringify(T)),
  FX0 = JSON.parse(JSON.stringify(FX)),
  BR = {};
Object.values(FX).forEach((f) => (BR[f.k] = f));
BR.aura = {
  t: 'a',
  k: 'aura',
  n: 'Mukīru no ōra',
  d: 'Aura : pendant quelques minutes, la réussite des passes entre les joueurs de l’équipe monte à au moins 90 %, ce qui multiplie les offensives.',
};
// Modifications venant de l'éditeur de mods.
let X = {},
  MOD = { teams: [] };
// Applique les équipes créées dans l'éditeur de mods aux données du jeu.
function applyMod() {
  Object.keys(PAL).forEach((k) => {
    if (PAL0[k]) PAL[k] = PAL0[k].slice();
    else delete PAL[k];
  });
  T = TL = JSON.parse(JSON.stringify(T0));
  FX = JSON.parse(JSON.stringify(FX0));
  X = {};
  MOD.teams.forEach((m) => {
    const i = T.findIndex((t) => t[0] == m.name),
      r = [m.name, m.l, m.em || '🏟️'];
    if (i >= 0) T[i] = r;
    else T.push(r);
    const b = BR[m.k] || BR.chance;
    FX[m.name] = { t: b.t, k: b.k, n: m.fn || b.n, d: m.fd || b.d };
    if (m.c1 && m.c2) PAL[m.name] = [m.c1, m.c2];
    if (m.pl && m.pl.length)
      X[m.name] = m.pl.map((p) => ({ n: p.n, p: p.p, o: p.o, f: p.f || 50, g: 0, c: 0, og: p.og || m.name }));
  });
  addNatFX();
  useT();
}
// Renvoie la liste des postes d'une formation (ex. 2-3-1 → DEF, DEF, MID, MID, MID, ATT).
const slots = (f) => FORM[f].flatMap((n, i) => Array(n).fill(POS[i]));
// S = LA PARTIE EN COURS (équipes, argent, calendrier…). V = L'ÉTAT DE L'ÉCRAN (onglet affiché,
// fenêtres ouvertes…). Ce sont les deux variables les plus importantes du jeu.
let S,
  V = { menu: 1, tab: 'ov', sel: null, m: null, sub: 3, sp: ST.sp, iv: null };
// Raccourci : renvoie l'élément de la page qui a cet identifiant.
const $ = (id) => document.getElementById(id);
// Générateur de hasard reproductible (même graine = mêmes résultats). Sert aux calendriers et aux
// effectifs de départ.
function rng(s) {
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
// Crée un calendrier de championnat (chaque équipe rencontre toutes les autres).
function sched(n) {
  const a = [...Array(n).keys()];
  if (n % 2) a.push(-1);
  const R = [];
  for (let r = 0; r < a.length - 1; r++) {
    const m = [];
    for (let i = 0; i < a.length / 2; i++) {
      const h = a[i],
        b = a[a.length - 1 - i];
      if (h >= 0 && b >= 0) m.push(r % 2 ? [b, h] : [h, b]);
    }
    R.push(m);
    a.splice(1, 0, a.pop());
  }
  return R.concat(R.map((m) => m.map(([h, b]) => [b, h])));
}
// CRÉE UNE NOUVELLE PARTIE : équipes, joueurs, calendrier, argent de départ, mails de bienvenue.
function init(ti, mode, ni) {
  // Les nouvelles équipes jouables sont choisies avec un numéro à partir de 100 : elles rejoignent alors la Ligue dès la saison 1.
  const NJ = ti >= 100 ? ti - 100 : -1;
  if (NJ >= 0) ti = T.length;
  const r = rng(7),
    used = new Set([
      ...Object.values(C)
        .flat()
        .map((x) => x[0]),
      ...Object.values(X)
        .flat()
        .map((p) => p.n),
    ]);
  const A =
      'Kael Nyra Draven Vex Zane Iris Orin Juno Rex Mira Tovi Wren Sable Cobalt Nova Bolt Kaya Zulu Quill Opal Ravel Soren Talia Ulric Varek Xara Yara Aeon Brix'.split(
        ' ',
      ),
    B =
      'Voss Ison Korr Nyx Tesh Anaya Chrome Reyes Kaidon Corrin Mbeki Renna Fessler Uhrik Ilarion Ferrat Sacha Talon Vray Aurin Delune Kell Vireth Kandor Vantor Doyle Fenn Kestrel Marlowe Storm'.split(
        ' ',
      );
  const nm = () => {
    let n;
    do n = A[(r() * A.length) | 0] + ' ' + B[(r() * B.length) | 0];
    while (used.has(n));
    used.add(n);
    return n;
  };
  S = {
    t: ti,
    md: 0,
    day: 0,
    df: V.df ?? 1,
    season: 1,
    res: [],
    evt: V.evt !== 0,
    cash: 5000,
    staff: { c: 1, k: 1, a: 1, y: 1 },
    cup: null,
    mail: [],
    conf: 50,
    sp: 0,
    st: 1,
    tk: 10,
    mer: { ma: 0, ec: 0, mu: 0, po: 0 },
    sps: [],
    fn: {},
    tx: [],
    fh: [],
    hist: [],
    form: '',
    fx: sched(T.length),
    teams: T.map(([name, l, em]) => {
      let base = 48 + l * 1.4,
        sq = [],
        c = (C[name] || []).slice();
      [
        ['GK', 2],
        ['DEF', 3],
        ['MID', 4],
        ['ATT', 3],
      ].forEach(([p, k]) => {
        for (let j = 0; j < k; j++) {
          const ci = c.findIndex((x) => x[1] == p);
          if (ci >= 0) {
            const x = c.splice(ci, 1)[0];
            sq.push({
              n: x[0],
              p,
              o: Math.round(base + (x[2] - 72) * 0.9),
              e: 100,
              f: (70 + r() * 30) | 0,
              g: 0,
              c: 1,
            });
          } else
            sq.push({
              n: nm(),
              p,
              o: Math.round(base - 6 + r() * 14 - (j > 1 ? 4 : 0)),
              e: 100,
              f: (30 + r() * 60) | 0,
              g: 0,
            });
        }
      });
      if (X[name] && X[name].length >= 11) sq = X[name].map((p) => ({ ...p, e: 100 }));
      const t = { name, em, sq, form: '2-3-1', m: 1, lu: [], pts: 0, pl: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 };
      autoLU(t);
      return t;
    }),
  };
  // Chaque équipe démarre avec sa propre formation (mélange fixe, réparties sur les 7 formations).
  {
    const ks = Object.keys(FORM),
      rr = rng(31),
      o = ks.slice().sort(() => rr() - 0.5);
    S.teams.forEach((t, i) => {
      t.form = o[i % o.length];
      autoLU(t);
    });
  }
  if (NJ >= 0) {
    const t = mkNewTeam(NEWT[NJ], 0);
    t.fr = 0;
    S.teams.push(t);
    S.fx = sched(S.teams.length);
  }
  S.teams.forEach((t) =>
    t.sq.forEach((p) => {
      if (!p.og) {
        p.og = !p.c && Math.random() < 0.2 ? T[(Math.random() * T.length) | 0][0] : t.name;
        if (p.og != t.name) {
          p.cp = p.cp || {};
          p.cp[t.name] = 100;
        }
      }
    }),
  );
  S.df = V.df ?? 1;
  S.teams.forEach((t, i) => {
    if (i != ti)
      t.sq.forEach((p) => {
        p.o = Math.max(35, Math.min(95, p.o + [-2, 0, 2][S.df]));
      });
  });
  S.mkt = mkt();
  S.free = {};
  welcome(ti);
  S.mode = mode || 'L';
  S.ctx = 'L';
  S.alt = null;
  if (S.mode != 'L') {
    natFillAll();
    const n2 =
        ni != null
          ? ni
          : Math.max(
              0,
              TN.findIndex((x) => x[0] == planet((T[ti] || [S.teams[ti].name])[0])),
            ),
      NC = buildNat(n2);
    if (S.mode == 'D') {
      S.alt = NC;
      mail(
        'Sélection nationale : ' + TN[n2][0],
        'En plus de votre club, la fédération de ' +
          TN[n2][0] +
          ' vous confie sa sélection pour la Galactik Cup (poules, puis phase finale ; objectif : top 2 de votre poule). Basculez entre vos deux équipes avec le bouton « Aller à la Cup » du menu.',
      );
    } else {
      S.alt = {};
      CF.forEach((k) => (S.alt[k] = S[k]));
      CF.forEach((k) => (S[k] = NC[k]));
      S.ctx = 'C';
      useT();
      natSyncAll();
      S.mkt = mkt();
      S.mail = [];
      welcomeN(n2);
    }
  }
  V.tab = 'ov';
  try {
    if (!localStorage.getItem('gmtour')) {
      V.tour = 0;
      NQ.length = 0; // pas de notification par-dessus la visite guidée
      document.querySelectorAll('.mtoast').forEach((e) => e.classList.remove('on'));
    }
  } catch (e) {}
  V.mc = mcNew();
  V.mc.n = 1;
  save();
}
// Compose automatiquement la meilleure équipe de départ d'une équipe gérée par l'ordinateur.
function autoLU(t) {
  if (S && S.teams && t === S.teams[S.t]) V.sel = null;
  while (sqN(t) < 8)
    t.sq.push({
      n: 'Recrue ' + ((Math.random() * 1e4) | 0),
      p: POS[t.sq.length % 4],
      o: 50,
      e: 100,
      f: 40,
      g: 0,
    });
  const u = new Set(),
    sc = (x) => x.o * (0.7 + (0.3 * x.e) / 100) * (x.inj || x.sus ? 0.05 : 1);
  t.lu = slots(t.form).map((p) => {
    let b = -1,
      bs = -1;
    t.sq.forEach((x, i) => {
      if (!u.has(i) && !x.rv && x.p == p && sc(x) > bs) {
        bs = sc(x);
        b = i;
      }
    });
    if (b < 0)
      t.sq.forEach((x, i) => {
        if (b < 0 && !u.has(i) && !x.rv) b = i;
      });
    if (b < 0)
      t.sq.forEach((x, i) => {
        if (b < 0 && !u.has(i)) b = i;
      });
    u.add(b);
    return b;
  });
}
// Pied fort des joueurs, zones de jeu (carte de chaleur) et leur effet sur la note.
const foot = (p) => {
    if (!p.ft) {
      let h = 0;
      for (const c of p.n) h = (h * 29 + c.charCodeAt(0)) % 9967;
      const r = h % 100;
      p.ft = r < 10 ? 'B' : r < 34 ? 'L' : 'R';
    }
    return p.ft;
  },
  FTN = { L: 'Pied gauche', R: 'Pied droit', B: 'Ambidextre' },
  footIc = (p) => {
    const f = foot(p);
    return f == 'B'
      ? '<svg class="ic" aria-hidden="true"><use href="#i-footl"/></svg><svg class="ic" aria-hidden="true" style="margin-left:-.5em"><use href="#i-footr"/></svg>'
      : '<svg class="ic" aria-hidden="true"><use href="#i-foot' + f.toLowerCase() + '"/></svg>';
  },
  footF = (x, pos, t, k) => {
    if (k == null || pos == 'GK') return 1;
    const f = foot(x);
    if (f == 'B') return 1;
    const y = pos_(t, k)[1],
      sd = y < 0.38 ? 'L' : y > 0.62 ? 'R' : '';
    if (!sd) return 1;
    return f == sd ? 1.01 : 0.96;
  },
  pos_ = (t, k) => {
    try {
      return pos(t, k, 0);
    } catch (e) {
      return [0.5, 0.5];
    }
  },
  HMC = 8,
  HMR = 5,
  hmCalc = (p, x0, y0) => {
    const sp = { GK: [0.07, 0.14], DEF: [0.12, 0.17], MID: [0.16, 0.2], ATT: [0.13, 0.17] }[p.p] || [
        0.15, 0.2,
      ],
      f = foot(p),
      y1 = y0 + (f == 'L' ? -0.04 : f == 'R' ? 0.04 : 0),
      x1 = x0 + (p.p == 'ATT' ? 0.07 : 0),
      g = [];
    for (let r = 0; r < HMR; r++)
      for (let c = 0; c < HMC; c++) {
        const cx = (c + 0.5) / HMC,
          cy = (r + 0.5) / HMR;
        g.push(Math.exp(-(Math.pow((cx - x1) / sp[0], 2) + Math.pow((cy - y1) / sp[1], 2)) / 2));
      }
    return g;
  },
  hmAdd = (p, t, k) => {
    if (!p) return;
    const q = pos_(t, k),
      g = hmCalc(p, q[0], q[1]);
    p.hm = p.hm || Array(HMC * HMR).fill(0);
    g.forEach((v, i) => (p.hm[i] += Math.round(v * 100)));
    p.hmn = (p.hmn || 0) + 1;
    if (p.hmn > 60) {
      p.hm = p.hm.map((v) => Math.round(v / 2));
      p.hmn = 30;
    }
  },
  hmSvg = (p) => {
    const real = p.hm && (p.hmn || 0) > 0,
      x0 = [0.05, 0.24, 0.46, 0.68][Math.max(0, POS.indexOf(p.p))],
      g = real ? p.hm : hmCalc(p, x0, 0.5),
      mx = Math.max(1, ...g),
      col = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' }[p.p] || '#888';
    let c = '';
    g.forEach((v, i) => {
      const r = Math.floor(i / HMC),
        cc = i % HMC;
      c += `<rect x="${cc * 20}" y="${r * 20}" width="20" height="20" fill="${col}" opacity="${(0.06 + 0.9 * Math.pow(v / mx, 1.2)).toFixed(2)}"/>`;
    });
    return `<svg viewBox="0 0 160 100" class="hmv" role="img" aria-label="Zones de jeu"><rect width="160" height="100" fill="#14301f"/>${c}<g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"><rect x=".5" y=".5" width="159" height="99"/><path d="M80 0v100"/><circle cx="80" cy="50" r="12"/><rect x=".5" y="27" width="22" height="46"/><rect x="137.500" y="27" width="22" height="46"/></g></svg><div class="mu" style="font-size:11px;display:flex;justify-content:space-between"><span>Défense</span><span>${real ? 'Sur ' + p.hmn + ' match' + (p.hmn > 1 ? 's' : '') : 'Projection (poste)'}</span><span>Attaque ›</span></div>`;
  };
// NOTE EFFICACE d'un joueur à un poste : note × (bonus de poste, pied fort, fatigue, moral…).
// C'est le cœur du calcul de la force d'équipe.
const eff = (t, i, pos, k) => {
  const x = t.sq[i];
  return (
    x.o *
    (x.p == pos ? (x.rc ? 0.95 : 1) : x.rc && x.rc.to == pos ? 0.75 + 0.25 * (1 - Math.max(0, x.rc.left) / x.rc.tot) : 0.75) *
    footF(x, pos, t, k) *
    (0.7 + (0.3 * x.e) / 100) *
    (x.inj || x.sus ? 0.3 : 1) *
    (x.or == 1 ? 0.95 : 1) *
    (fluK(x) == 'none' ? 1.03 : 1) * // compensation : les Pirates, sans Fluide, jouent avec plus de rage

    (x.or == 2 && pos != 'ATT' ? 1.05 : 1) *
    (0.92 + 0.16 * ((x.mo ?? 60) / 100)) *
    (x.nz ? 1 - x.nz.s * 0.25 * (x.nz.l / x.nz.t) : 1) *
    capF(t, x)
  );
};
// Force d'une équipe par ligne (gardien, défense, milieu, attaque) à partir de ses titulaires.
function str(t) {
  const r = str0(t),
    m = tacMods(t);
  const x = atFx(t);
  r.d += m.d + x.d;
  r.mid += m.m + x.m;
  r.a += m.a + x.a;
  r.c = m.c + x.c;
  r.det = x.det;
  r.g = m.g;
  r.wt = m.wt;
  return r;
}
// Force de base d'une équipe (sans les bonus tactiques, ajoutés par str ci-dessus).
function str0(t) {
  const s = slots(t.form),
    L = { GK: [], DEF: [], MID: [], ATT: [] };
  t.lu.forEach((i, k) => L[s[k]].push(eff(t, i, s[k], k)));
  const av = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 15), // ligne vide : très faible, jamais nulle
   
    m = t.m - 1;
  return {
    gk: av(L.GK) + (t == me() ? skL('t3') : 0),
    d:
      av(L.DEF) * 0.7 +
      av(L.GK) * 0.3 -
      m * 3 +
      (t == me() ? stL('a') + skL('t1') + mgb('an') : 0) -
      ((t.ln?.d ?? 1) - 1) * 2,
    mid:
      av(L.MID) +
      (t == me() ? skL('t2') : 0) +
      ((t.pr ?? 1) - 1) * 2.5 +
      ((t.ln?.d ?? 1) - 1) * 1.5 +
      [2, 0, -1.5][t.ln?.m ?? 1],
    a:
      av(L.ATT) * 0.6 +
      av(L.MID) * 0.4 +
      m * 3 +
      (t == me() ? stL('a') + skL('t1') + mgb('an') : 0) +
      [-1, 0, 2][t.ln?.m ?? 1],
    f: av(t.lu.map((i) => (fluK(t.sq[i]) == 'none' ? 0 : t.sq[i].f) * (t.sq[i].nz ? 1 - t.sq[i].nz.s * 0.5 : 1))),
  };
}
// Crée l'objet « match » : les deux équipes, score 0-0, minute 0, journal, état des cartons…
const mk = (h, a) => ({
  t: [S.teams[h], S.teams[a]],
  h,
  a,
  sc: [0, 0],
  min: 0,
  lg: [],
  dby: rivK(S.teams[h].name, S.teams[a].name),
  st: { poss: [0, 0], pas: [0, 0], tir: [0, 0], cad: [0, 0], fau: [0, 0] },
});
// MOTEUR DE MATCH : simule une tranche de 3 minutes (occasions, tirs, buts, cartons, blessures,
// pouvoirs spéciaux).
// État des effets de fluide en cours dans le match (paralysie, glu, agilité, bulle, bouclier, confusion).
const fzS = (M) => (M.fz2 = M.fz2 || { frz: [-1, -1], stk: [-1, -1], agl: [-1, -1], bub: [-1, -1], shd: [0, 0], cf: null });
// Effets durables des fluides, appliqués à la force des équipes à chaque tour.
function fxTick(M, sh) {
  const z = fzS(M),
    m = M.min;
  [0, 1].forEach((i) => {
    if (z.frz[i] >= m) {
      sh[i].d *= 0.55;
      sh[i].mid *= 0.75;
    }
    if (z.stk[i] >= m) {
      sh[i].mid *= 0.8;
      sh[i].a *= 0.75;
    }
  });
  if (z.cf && z.cf.until >= m && !z.cf.gk) sh[z.cf.t].d *= 0.88;
}
// Déclenchement d'un fluide d'attaque : effet propre à chaque fluide.
function fxOn(M, at, fx) {
  const z = fzS(M),
    D = 1 - at,
    m = M.min,
    T = M.t[at],
    O = M.t[D];
  if (fx.k == 'metalcry') {
    z.frz[D] = m + 6;
    M.lg.push(`${m}’ ⚡ Cri de Métal : la défense de ${O.name} est paralysée`);
  } else if (fx.k == 'furnace') {
    z.stk[D] = m + 6;
    M.lg.push(`${m}’ 🔥 Une substance visqueuse colle les joueurs de ${O.name}`);
  } else if (fx.k == 'agile') {
    z.agl[at] = m + 6;
    M.lg.push(`${m}’ 🦁 L’Esprit d’Ibo rend ${T.name} insaisissable`);
  } else if (fx.k == 'bubble') {
    z.bub[at] = m + 6;
    M.lg.push(`${m}’ 🫧 Le ballon est enfermé dans une bulle : ${T.name} le garde`);
  } else if (fx.k == 'confuse') {
    const sl = slots(O.form),
      c = O.lu.map((li, k) => [k, O.sq[li]]).filter(([k]) => (sl[k] == 'DEF' || sl[k] == 'GK') && !(M.rd && M.rd[D + '_' + k] > M.min));
    if (c.length) {
      c.sort((x, y) => y[1].o - x[1].o);
      const [k, p] = c[0];
      z.cf = { t: D, until: m + 9, gk: sl[k] == 'GK', nm: p.n };
      M.lg.push(`${m}’ 😵 L’onde cérébrale sème la confusion chez ${p.n} (${O.name})`);
    }
  } else if (fx.k == 'smog') {
    let n = 0;
    T.lu.forEach((li) => {
      const p = T.sq[li];
      if (planet(p.og || '') != 'Ombra') {
        p.e = Math.max(30, p.e - 4);
        n++;
      }
    });
    if (n) M.lg.push(`${m}’ ☠️ Le Smog éprouve les joueurs qui ne sont pas des Shadows`);
  } else if (fx.k == 'multi' && Math.random() < 0.06) {
    const q = T.lu.filter((li) => T.sq[li].p != 'GK').sort(() => Math.random() - 0.5).slice(0, 2);
    q.forEach((li) => (T.sq[li].e = Math.max(30, T.sq[li].e - 15)));
    M.lg.push(`${m}’ ⚠️ Résonance dangereuse du Multifluide : ${q.map((li) => T.sq[li].n).join(' et ')} sont épuisés`);
  }
}
function tick(M) {
  M.sx = null;
  const sh = M.t.map(str);
  capTick(M, sh);
  (M.hm || []).forEach((u, i) => {
    if (u && M.min <= u) {
      sh[i].mid *= 1.06;
      sh[i].a *= 1.06;
      sh[i].d *= 1.06;
    }
  });
  shoutFx(M, sh);
  advTick(M);
  fxTick(M, sh);
  [0, 1].forEach((i) => {
    const n = Object.keys(M.rd || {}).filter((kk) => kk[0] == i && M.rd[kk] > M.min).length;
    Object.keys(M.rd || {}).forEach((kk) => {
      if (kk[0] == i && M.rd[kk] <= M.min && !(M.rb = M.rb || {})[kk]) {
        M.rb[kk] = 1;
        M.lg.push(`${M.min}’ ↩ ${M.t[i].sq[M.t[i].lu[+kk.slice(2)]].n} revient sur le terrain (${M.t[i].name})`);
      }
    });
    if (n) {
      const f = 1 - 0.12 * n;
      sh[i].mid *= f;
      sh[i].a *= f;
      sh[i].d *= f;
    }
  });
  if (M.min > 60)
    sh.forEach((q, i) => {
      const df = M.sc[i] - M.sc[1 - i];
      if (df < 0) q.a += 0.8 * atCl(q.det || 0, 3);
      else if (df > 0) q.d += 0.8 * atCl(q.det || 0, 3);
    });
  const ph = (sh[0].mid * 1.08) / (sh[0].mid * 1.08 + sh[1].mid);
  let at = Math.random() < ph ? 0 : 1;
  [0, 1].forEach((i) => {
    if (fzS(M).bub[i] >= M.min) at = i;
  });
  const dx = fxOf(M.t[1 - at].name);
  if ((dx.t == 'd' || dx.k == 'furnace') && fz(M, 1 - at, sh[1 - at].f)) {
    M.lg.push(`${M.min}’ 🌀 ${dx.n} (${M.t[1 - at].name})`);
    if (dx.k == 'furnace') {
      M.lg.push(`${M.min}’ 🔥 La substance visqueuse de ${M.t[1 - at].name} stoppe l’attaque`);
      M.sx = { k: 'build', at, bn: 'FOURNAISE', sub: M.t[1 - at].name, bc: FXV.furnace };
      return;
    }
    if (dx.k == 'weight') {
      M.sx = { k: 'build', at };
      return;
    }
    if (dx.k == 'block') {
      M.sx = { k: 'block', at, fn: dx.n };
      return;
    }
    at = 1 - at;
  }
  const a = sh[at],
    d = sh[1 - at],
    t = M.t[at],
    fx = fxOf(t.name),
    fl = fx.t == 'a' && fz(M, at, a.f),
    pb = Math.max(0.45, Math.min(0.85, 0.62 + (a.mid - d.mid) / 200)),
    au = (M.au = M.au || [-1, -1]);
  if (fl) fxOn(M, at, fx);
  if (fl && fx.k == 'aura') {
    au[at] = M.min + 8;
    M.lg.push(`${M.min}’ 🌀 ${fx.n} (${t.name}) : les passes deviennent presque parfaites`);
  }
  const pc = M.min <= au[at] ? Math.max(pb, 0.9) : pb,
    pa = (M.st.pa = M.st.pa || [
      [0, 0],
      [0, 0],
    ]);
  pa[at][0] += pc;
  pa[at][1]++;
  M.bx = at ? 0.5 - 0.2 * Math.random() : 0.5 + 0.2 * Math.random();
  M.by = 0.25 + Math.random() * 0.5;
  anaTick(M, at, false);
  M.st.poss[at]++;
  M.st.pas[at] += 3 + Math.round(a.mid / 12 + Math.random() * 3);
  if (Math.random() < (M.dby == 'C' ? 0.4 : M.dby ? 0.35 : 0.2)) {
    M.st.fau[1 - at]++;
    if (foulEv(M, at)) return;
  }
  if (
    !(fl && Math.random() < (FXB[fx.k] || 0)) &&
    Math.random() >
      Math.min(0.58, 0.27 * Math.pow(a.a / d.d, 1.5)) *
        (pc / pb) *
        (1 + (a.c || 0)) *
        (M.ev && M.ev.k == 'met' ? 0.5 : 1) *
        [1.2, 1, 0.85][t.ln?.a ?? 1] *
        (M.dby == 'C' ? 1.2 : M.dby ? 1.15 : 1) *
        (fl && fx.k == 'boots' ? 1.2 : 1) *
        (fzS(M).agl[at] >= M.min ? 1.3 : 1)
  ) {
    M.sx = { k: 'build', at };
    return;
  }
  const s = slots(t.form),
    w = t.lu.map(
      (li, k) =>
        (s[k] == 'ATT' ? 3 : s[k] == 'MID' ? 1 : s[k] == 'DEF' ? 0.15 : 0) * [1, 2, 0.3][t.sq[li].or ?? 0] * (a.wt ? a.wt[k] : 1),
    );
  let r = Math.random() * w.reduce((x, y) => x + y),
    k = 0;
  while ((r -= w[k]) > 0) k++;
  const pl = t.sq[t.lu[k]],
    u = Math.random(),
    m = M.min,
    kk = fl ? fx.k : '';
  let gk = d.gk,
    b = 0;
  const gp = M.t[1 - at].sq[M.t[1 - at].lu[0]],
    dp = atDev(pl);
  if (gp) gk *= 1 + 0.012 * atCl(atDev(gp)[1], 4);
  // FLUIDE DU GARDIEN : un gardien doté de Fluide peut l'utiliser pour stopper une frappe (+25 % à son niveau).
  // La fréquence dépend de l'usage du Fluide de son équipe, de son taux de Fluide et du score en fin de match.
  let gfl = false;
  if (gp && fluK(gp) != 'none' && (gp.f || 0) > 0 && !((M.rd || {})[1 - at + '_0'] > M.min)) {
    const tg = M.t[1 - at],
      pgf = Math.max(
        0.1,
        Math.min(0.55, [0.16, 0.28, 0.4][tg.fo ?? 1] + ((gp.f || 0) - 60) / 600 + (M.sc[1 - at] < M.sc[at] && M.min >= 60 ? 0.08 : 0)),
      );
    if (Math.random() < pgf) {
      gfl = true;
      gk *= 1.25;
      (M.fu = M.fu || [0, 0])[1 - at]++;
      gp.e = Math.max(40, gp.e - [0.15, 0.3, 0.6][tg.fo ?? 1]);
    }
  }
  if (kk == 'smog') b = 0.12;
  if (kk == 'ionic') b = 0.08;
  if (kk == 'metalcry') {
    gk *= 0.8;
    b = 0.08;
  }
  if (kk == 'confuse') b = 0.06;
  if (fzS(M).cf && fzS(M).cf.gk && fzS(M).cf.t == 1 - at && fzS(M).cf.until >= m) gk *= 0.85;
  if (kk == 'agile') b = 0.06;
  if (kk == 'bubble') b = 0.05;
  if (kk == 'breath' || kk == 'multi') {
    b = 0.22;
    t.lu.forEach((j) => (t.sq[j].e = Math.min(100, t.sq[j].e + 2)));
  }
  if (kk == 'stun') {
    gk *= 0.7;
    b = 0.1;
  }
  if (kk == 'comeback') b = M.sc[at] < M.sc[1 - at] ? 0.4 : 0.15;
  if (kk == 'chance') b = 0.1;
  if (kk == 'surge') b = 0.05 + 0.4 * Math.min(1, m / 90);
  if (kk == 'mirage') b = 0.06;
  if (kk == 'furnace') b = 0.12 + (m > 60 ? 0.1 : 0);
  if (kk == 'boots') b = 0.14;
  if (kk == 'wild') b = Math.random() < 0.5 ? 0.45 : -0.1;
  if (kk == 'eye') b = 0.1 + (pl.o - 60) / 120;
  if (kk == 'sync') b = Math.max(0, Math.min(0.35, (a.mid - d.mid) / 60 + 0.1));
  if (kk == 'late') b = m > 70 ? 0.5 : 0.05;
  M.bx = at ? 0.1 : 0.9;
  M.st.tir[at]++;
  if (M.mm && M.mm.length) M.mm[M.mm.length - 1][1] = 1.5;
  let pg = Math.min(0.75, Math.max(0.06, 0.32 * Math.pow(pl.o / gk, 1.4))) + b;
  pg *= [0.85, 1, 1.2][t.ln?.a ?? 1] * 0.88; // plus de tirs, mais un peu moins de réussite : le nombre de buts reste raisonnable
  pg += (a.g || 0) + (a.pgb || 0) + 0.007 * atCl(dp[1], 4) + (m > 70 ? 0.004 * atCl(dp[7], 4) : 0);
  if (kk == 'double') pg = 1 - (1 - pg) * (1 - pg);
  if (kk == 'calc') pg = 0.45;
  if (fl) M.lg.push(`${m}’ ✨ ${fx.n} !`);
  let goal = u < pg;
  const Dd = 1 - at,
    dfx = fxOf(M.t[Dd].name),
    zs = fzS(M);
  // Bouclier du Souffle : une fois par match, repousse un but encaissé.
  if (goal && (dfx.k == 'breath' || dfx.k == 'multi') && !zs.shd[Dd] && Math.random() < 0.6) {
    zs.shd[Dd] = 1;
    goal = false;
    (M.fu = M.fu || [0, 0])[Dd]++;
    M.lg.push(`${m}’ 🛡️ Bouclier du Souffle (${M.t[Dd].name}) : le but est repoussé`);
  }
  M.sx = {
    k: 'shot',
    at,
    pl: k,
    fl: !!fl,
    fn: fl ? fx.n : '',
    fk: fl ? fx.k : '',
    gf: gfl ? 1 : 0,
    gn: gfl ? gp.n : '',
    o: goal ? 'goal' : u < pg + 0.3 || u < pg ? 'save' : 'miss',
  };
  if (u < pg + 0.3) M.st.cad[at]++;
  if (goal) {
    M.bx = at ? 0.01 : 0.99;
    M.sc[at]++;
    if (!M.cup && !M.ab) pl.g++;
    M.lg.push(`${m}’ ⚽ <b>BUT ! ${pl.n}</b> (${t.name}) ${M.sc[0]}-${M.sc[1]}`);
    if (fx.k == 'harmony') {
      (M.hm = M.hm || [0, 0])[at] = m + 12;
      M.lg.push(`${m}’ 🎶 ${fx.n} (${t.name}) : tout le chœur monte d’un ton`);
    }
  } else if (gfl && u < pg + 0.3) M.lg.push(`${m}’ 🧤✨ ${gp.n} utilise le Fluide : arrêt devant ${pl.n} !`);
  else M.lg.push(u < pg + 0.3 ? `${m}’ 🧤 Arrêt du gardien devant ${pl.n}` : `${m}’ ${pl.n} tire à côté`);
  if (gfl && goal) M.lg.push(`${m}’ 🧤 ${gp.n} a utilisé le Fluide, mais ne peut rien faire`);
}
// Gère une faute : exclusion de 5 minutes, coup franc, penalty (pas de cartons dans Galactik Football).
function foulEv(M, at) {
  const D = 1 - at,
    T = M.t[D],
    A = M.t[at],
    sl = slots(T.form),
    out = (M.rd = M.rd || {}),
    m = M.min,
    isOut = (d, k) => (M.rd[d + '_' + k] || 0) > m,
    nOut = T.lu.filter((x, k) => isOut(D, k)).length;
  let w = T.lu.map((li, k) => (k == 0 || isOut(D, k) ? 0 : sl[k] == 'ATT' ? 1 : 2)),
    r = Math.random() * w.reduce((x, y) => x + y, 0),
    k = 0;
  while (k < w.length - 1 && (r -= w[k]) > 0) k++;
  const p = T.sq[T.lu[k]];
  if (!p) return false;
  const key = D + '_' + k,
    u = Math.random(),
    pm = (M.dby == 'C' ? 1.4 : M.dby ? 1.3 : 1) * (1 + (T.pr ?? 1) * 0.12) * foulMul(M, D, T);
  let card = null;
  if (u < 0.14 * pm && nOut < 2) card = 'x';
  M.lg.push(`${m}’ Faute de ${p.n} (${T.name})`);
  if (card) {
    // Exclusion : le joueur quitte le terrain 5 minutes puis revient.
    out[key] = m + 5;
    stP(p).ex = (stP(p).ex || 0) + 1;
    M.lg.push(
      `${m}’ <b style="color:#ff8a3b">Exclusion de 5 minutes</b> pour ${p.n} : ${T.name} joue à ${6 - nOut}, retour à la ${m + 5}e minute`,
    );
  }
  if (Math.random() < 0.045) {
    const sa = slots(A.form),
      wa = A.lu.map((li, j) =>
        (M.rd && M.rd[at + '_' + j] > M.min) ? 0 : (sa[j] == 'ATT' ? 3 : sa[j] == 'MID' ? 1.5 : 0.2) * A.sq[li].o,
      );
    let r2 = Math.random() * wa.reduce((x, y) => x + y, 0),
      j = 0;
    while (j < wa.length - 1 && (r2 -= wa[j]) > 0) j++;
    const pl = A.sq[A.lu[j]],
      gk = str(T).gk,
      pg = Math.min(0.88, Math.max(0.5, 0.74 * Math.pow(pl.o / gk, 0.35))),
      u2 = Math.random();
    M.lg.push(`${m}’ Penalty pour ${A.name} !`);
    M.st.tir[at]++;
    let o = 'miss';
    if (u2 < pg) {
      o = 'goal';
      M.sc[at]++;
      if (!M.cup && !M.ab) pl.g++;
      M.st.cad[at]++;
      M.lg.push(`${m}’ ⚽ <b>BUT sur penalty ! ${pl.n}</b> (${A.name}) ${M.sc[0]}-${M.sc[1]}`);
    } else if (u2 < pg + (1 - pg) * 0.6) {
      o = 'save';
      M.st.cad[at]++;
      M.lg.push(`${m}’ 🧤 Penalty arrêté par le gardien devant ${pl.n}`);
    } else M.lg.push(`${m}’ ${pl.n} rate son penalty`);
    M.sx = { k: 'shot', at, pl: j, fl: false, fn: '', o, pen: 1 };
    return true;
  }
  if (Math.random() < 0.22) {
    const sa = slots(A.form),
      wa = A.lu.map((li, j) =>
        (M.rd && M.rd[at + '_' + j] > M.min) ? 0 : (sa[j] == 'ATT' ? 2 : sa[j] == 'MID' ? 2 : 0.2) * A.sq[li].o,
      );
    let r2 = Math.random() * wa.reduce((x, y) => x + y, 0),
      j = 0;
    while (j < wa.length - 1 && (r2 -= wa[j]) > 0) j++;
    const pl = A.sq[A.lu[j]],
      gk = str(T).gk,
      pg = Math.min(0.2, Math.max(0.04, 0.09 * Math.pow(pl.o / gk, 1.5))),
      u2 = Math.random();
    M.lg.push(`${m}’ Coup franc dangereux pour ${A.name}, tiré par ${pl.n}`);
    M.st.tir[at]++;
    let o = 'miss';
    if (u2 < pg) {
      o = 'goal';
      M.sc[at]++;
      if (!M.cup && !M.ab) pl.g++;
      M.st.cad[at]++;
      M.lg.push(`${m}’ ⚽ <b>BUT sur coup franc ! ${pl.n}</b> (${A.name}) ${M.sc[0]}-${M.sc[1]}`);
    } else if (u2 < pg + 0.45) {
      o = 'save';
      M.st.cad[at]++;
      M.lg.push(`${m}’ 🧤 Le gardien repousse le coup franc de ${pl.n}`);
    } else M.lg.push(`${m}’ Le coup franc de ${pl.n} passe à côté`);
    M.sx = { k: 'shot', at, pl: j, fl: false, fn: '', o, fk: 1 };
    return true;
  }
  if (card) {
    M.sx = {
      k: 'foul',
      at,
      bn: 'EXCLUSION 5 MIN',
      sub: p.n + ' (' + T.name + ')',
      bc: '#ff8a3b',
      card,
      tm: D,
      kk: k,
    };
    return true;
  }
  return false;
}
// FIN DE MATCH : points, buts, argent gagné (billetterie, primes…), fatigue, blessures et
// statistiques.
function fin(M) {
  if (M.ab) M.sc = [0, 0];
  const [x, y] = M.sc;
  [
    [0, 1],
    [1, 0],
  ].forEach(([i, j]) => {
    const t = M.t[i],
      g = M.sc[i],
      c = M.sc[j];
    t.pl++;
    capFin(t, g, c);
    try {
      t.lu.forEach((li, k) => hmAdd(t.sq[li], t, k));
    } catch (e) {}
    t.sq.forEach((p) => {
      if (p.sus > 0) p.sus--;
      if (p.ns) {
        p.sus = p.ns;
        if (t == me())
          mail(
            'Suspension : ' + p.n,
            p.n +
              ' est suspendu pour ' +
              p.ns +
              ' match' +
              (p.ns > 1 ? 's' : '') +
              ' à la suite de ses cartons.',
          );
        p.ns = 0;
      }
    });
    if (t == me()) {
      try {
        rwMatch(g, c, M.t[j].name);
        if (S.coaches && S.coaches.length) tx('Salaires des coachs', -12 * S.coaches.length);
      } catch (e) {}
      tx('Droits TV', 80);
      tx('Billetterie', i == 0 ? Math.round(gate() * (M.dby == 'C' ? 1.4 : M.dby ? 1.2 : 1)) : 0);
      tx('Primes de victoire', g > c ? 150 : 0);
      tx('Sponsors', spons());
      tx('Boutique', shop());
      tx('Salaires', t.nat ? 0 : -t.sq.reduce((s, p) => s + sal(p), 0));
    }
    t.gf += g;
    t.ga += c;
    if (g > c) {
      t.w++;
      t.pts += 3;
    } else if (g == c) {
      t.d++;
      t.pts++;
    } else t.l++;
    // Forme récente (5 derniers matchs) pour la page Championnat : V = victoire, N = nul, D = défaite.
    if (S.ctx != 'C') (t.fm = t.fm || []).push(g > c ? 'V' : g == c ? 'N' : 'D'), t.fm.length > 5 && t.fm.shift();
    // Risque de blessure par titulaire et par match (réglage : plus la valeur est basse, moins il y a de blessés).
    t.lu.forEach((k) => {
      const p = t.sq[k];
      if (!p.inj && Math.random() < (t == me() ? Math.max(0.003, 0.016 - 0.002 * stL('k')) : 0.011) * (1 - 0.05 * atCl(atDev(p)[6], 4)) * (p.nz ? 2.2 : 1)) {
        p.inj = 2 + ((Math.random() * 4) | 0);
        if (t == me())
          mail(
            'Blessure : ' + p.n,
            p.n + ' est blessé pour ' + p.inj + ' journées. Un meilleur kiné réduit les risques.',
          );
      }
    });
    t.sq.forEach((p, k) => {
      if (p.nz) {
        p.nz.l -= t.lu.includes(k) ? 1.6 : 0.5; // jouer avec la nausée accélère l’adaptation (mais double presque le risque de blessure)
        if (p.nz.l <= 0) {
          p.cp = p.cp || {};
          p.cp[t.name] = 95;
          p.nz = null;
          if (t == me())
            mail('Fluide maîtrisé : ' + p.n, p.n + ' s’est approprié le Fluide de ' + t.name + '.');
        }
      }
      if (t.lu.includes(k)) p.mp = (p.mp || 0) + 1;
      p.e = t.lu.includes(k)
        ? Math.max(45, p.e - (19.2 - attrs(p)[8] * 0.4) - ((t.pr ?? 1) == 2 ? 4 : 0) - tacMods(t).f * 1.5)
        : Math.min(100, p.e + 18 + (t == me() ? stL('k') * 3 : 0));
    });
  });
  S.res.push([M.h, M.a, x, y]);
  (S.hist[S.md] = S.hist[S.md] || []).push([M.h, M.a, x, y]);
  stPost(M);
}
// Renvoie l'équipe du joueur.
const me = () => S.teams[S.t];
// Lance la journée de match avec un écran de chargement.
function startMD() {
  ensureCtx();
  load('Préparation du match…', startMD0);
}
// Lance la journée : simule d'abord tous les AUTRES matchs de la journée (et enregistre leurs
// résultats dans S.lr), puis prépare le match du joueur.
function startMD0() {
  if (S.md >= S.fx.length) return;
  // Les autres matchs de la journée ne sont simulés qu'une seule fois, même si on relance la journée (match interrompu, rechargement…).
  const sk = S.season + ':' + S.ctx + ':' + S.md,
    again = S.simd == sk;
  if (!again) {
  S.res = [];
  S.teams.concat(S.ctx == 'C' && S.mode == 'C' && S.alt ? S.alt.teams : []).forEach((t) =>
    t.sq.forEach((p) => {
      if (p.inj && (S.ctx != 'C' || S.mode == 'C')) {
        p.inj--;
        if (p.inj > 1 && mgb('med') && me().sq.includes(p) && Math.random() < 0.35) p.inj--;
      }
    }),
  );
  if (S.ctx != 'C') loans();
  if (S.ctx == 'C') natPrep();
  fixLU(me());
  if (S.ctx != 'C') aiMarket();
  if (S.md % 6 == 5) {
    S.mkt = mkt();
    mail(
      'Marché des transferts',
      S.mkt.some((p) => p.pr)
        ? 'Une carte prismatique est exceptionnellement disponible sur le marché : une occasion unique !'
        : S.mkt.some((p) => p.rare)
          ? 'Un personnage de la série est disponible sur le marché : ne le laissez pas filer !'
          : 'De nouveaux joueurs sont disponibles dans l’onglet Marché.',
    );
  }
  if (S.md == 3 || S.md == Math.ceil(lgHalf()) + 1) sponsor();
  }
  S.teams.forEach((t, i) => {
    if (i != S.t) autoLU(t);
  });
  let um = null;
  S.fx[S.md].forEach(([h, a]) => {
    if (h == S.t || a == S.t) um = [h, a];
    else if (!again) {
      const M = mk(h, a);
      evRoll(M);
      for (let i = 1; i <= 30 && !M.ab; i++) {
        M.min = i * 3;
        tick(M);
        if (M.pol && M.min >= M.pol) M.ab = 1;
      }
      fin(M);
      if (!S.lr || S.lr.md != S.md || S.lr.sn != S.season) S.lr = { md: S.md, sn: S.season, r: [] };
      S.lr.r.push([
        M.t[0].em,
        M.t[0].name,
        M.sc[0],
        M.sc[1],
        M.t[1].name,
        M.t[1].em,
        M.t[0].pts + M.t[1].pts + 2 * (M.sc[0] + M.sc[1]) + (Math.abs(M.sc[0] - M.sc[1]) >= 3 ? 4 : 0),
      ]);
    }
  });
  S.simd = sk;
  if (um) {
    V.m = mk(...um);
    V.lnx = 0;
    V.mxp = null;
    V.mxd = 0;
    evRoll(V.m);
    V.sub = 3;
    V.tab = 'match';
  } else {
    S.md++;
    mail(
      'Événement : journée de repos',
      'Votre équipe est exemptée de match cette journée (nombre impair d’équipes). Profitez-en pour récupérer.',
    );
    if (S.md >= S.fx.length) seasonEnd();
  }
  save();
  render();
}
// Fait avancer le match automatiquement selon la vitesse choisie.
function loop() {
  stop();
  MAN.unfin();
  if (MAN.on())
    V.iv = setInterval(() => {
      if (MAN.idle()) step();
    }, 120);
  else V.iv = setInterval(step, [6000, 4500, 2000][V.sp]);
}
// Met le match en pause.
function stop() {
  clearInterval(V.iv);
  V.iv = null;
}
// Photographie des réglages tactiques au coup d'envoi, pour les remettre tels quels à la fin du match.
function tacSnap(M) {
  const t = me();
  if (M.snap || !M.t.includes(t)) return;
  M.snap = {
    m: t.m,
    pr: t.pr,
    sty: t.sty,
    fo: t.fo,
    fs: t.fs,
    form: t.form,
    lu: t.lu.slice(),
    ti: t.ti ? { ...t.ti } : t.ti,
    ln: t.ln ? { ...t.ln } : t.ln,
    rl: t.sq.map((p) => [p.re, p.or, p.dp]),
  };
}
// Fin de match : les réglages tactiques reviennent à leur valeur d'avant le coup d'envoi.
function tacRestore(M) {
  const t = me(),
    z = M.snap;
  if (!z || !M.t.includes(t)) return;
  ['m', 'pr', 'sty', 'fo', 'fs', 'form', 'ti', 'ln'].forEach((k) => {
    if (z[k] === undefined) delete t[k];
    else t[k] = z[k];
  });
  t.sq.forEach((p, i) => {
    const r = z.rl[i] || [];
    ['re', 'or', 'dp'].forEach((k, j) => {
      if (r[j] === undefined) delete p[k];
      else p[k] = r[j];
    });
  });
  t.lu = z.lu.slice();
  // Si un titulaire d'avant-match est blessé ou suspendu, la composition est refaite.
  if (t.lu.some((i) => !t.sq[i] || t.sq[i].inj || t.sq[i].ns || t.sq[i].sus)) autoLU(t);
  M.snap = null;
  delete V.swp;
  delete V.sug;
}
// Fait avancer le match d'un pas (3 minutes) ; gère mi-temps, fin de match et interruptions.
function step() {
  const M = V.m,
    AO = MAN.on();
  const g0 = M.sc[0] + M.sc[1],
    sc0 = M.sc.slice();
  if (M.min == 0) {
    sfx('whistle');
    tacSnap(M);
  }
  // Photo de l'affichage AVANT la tranche : tant que l'animation n'a pas joué la scène, le journal,
  // le score, la minute et les statistiques montrés au joueur restent ceux d'avant.
  const pre = { n: M.lg.length, st: JSON.parse(JSON.stringify(M.st)), min: M.min };
  M.min += 3;
  tick(M);
  if (AO) MAN.push(M, M.sx, M.lg.length, sc0, pre);
  else if (M.sc[0] + M.sc[1] > g0) sfx('goal');
  if (M.min >= 90 && !AO) sfx('whistle');
  if (M.pol && M.min >= M.pol && M.min < 90) {
    stop();
    M.ab = 1;
    M.lg.push('🚨 La police fait irruption sur le terrain : match arrêté !');
    fin(M);
    S.md++;
    report(M);
    M.done = 1;
    tacRestore(M);
    mailFlush();
    save();
    if (AO) MAN.fin();
    render();
    return;
  }
  if (M.min == 45 && ST.ht) {
    stop();
    if (!AO) sfx('whistle');
    M.lg.push('⏸ Mi-temps : ajustez votre équipe');
  }
  if (M.min >= 90) {
    stop();
    if (M.cup) S.cup.next.push(cupWin(M));
    else {
      fin(M);
      S.md++;
      report(M);
    }
    M.done = 1;
    tacRestore(M);
    mailFlush();
    save();
  }
  if (AO && !V.iv) MAN.fin();
  render();
}
/* ===== Remplacements : glisser-déposer, annuler, note d'équipe, moral ===== */

// ======================================================================
// REMPLACEMENTS PAR GLISSER-DÉPOSER, ANNULER, NOTE D'ÉQUIPE ET MORAL
// ======================================================================
// Indique si un glisser-déposer est en cours (pour ne pas redessiner l'écran pendant le geste).
const DND = { on: 0, sk: 0, t: 0 };
// Formate un nombre avec une décimale et une virgule (ex. 72,5).
const nf1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
// Note générale de l'équipe = moyenne des notes des titulaires.
function teamNote(t, lu) {
  lu = lu || t.lu;
  return lu.reduce((a, i) => a + (t.sq[i] ? t.sq[i].o : 0), 0) / Math.max(1, lu.length);
}
// Vrai si un match est en cours (minute > 0).
function liveNow() {
  return !!(V.m && !V.m.done && V.m.min > 0);
}
// Historique des échanges de joueurs (pour annuler / rétablir).
function swH() {
  const k = S.ctx + ':' + S.t + ':' + S.md + ':' + S.day + ':' + (V.m ? 1 : 0);
  if (V.hk != k) {
    V.hk = k;
    V.h = { u: [], r: [] };
  }
  return V.h;
}
// Affiche le petit message après un échange (« X remplace Y »).
function swMsg(m) {
  V.swm = m;
  clearTimeout(V.swt);
  V.swt = setTimeout(() => {
    V.swm = '';
    const e = document.getElementById('swm');
    if (e) e.remove();
  }, 3800);
}
// ÉCHANGE deux joueurs (titulaire/titulaire ou remplaçant/titulaire) et enregistre l'action pour
// l'annuler.
function doSwap(a, b) {
  const t = me();
  if (!t || a == b || !t.sq[a] || !t.sq[b] || t.sq[a].rv || t.sq[b].rv) return render();
  const ka = t.lu.indexOf(a),
    kb = t.lu.indexOf(b);
  if (ka < 0 && kb < 0) return render();
  const live = liveNow(),
    cons = (ka < 0 || kb < 0) && live;
  if (cons && V.sub <= 0) {
    swMsg('Plus de remplacement disponible dans ce match.');
    V.sel = null;
    return render();
  }
  // Un joueur remplacé pendant le match ne peut plus y revenir.
  if (cons && V.m && !V.m.done) {
    const back = t.sq[ka < 0 ? a : b];
    if (back && (V.m.xo || []).includes(back.n)) {
      swMsg(back.n + ' a déjà été remplacé : il ne peut pas revenir dans ce match.');
      V.sel = null;
      return render();
    }
  }
  const n0 = teamNote(t),
    h = swH();
  // Remplacement en plein match : on garde la composition de départ et le joueur sorti (pour les notes de fin de match).
  if (cons && V.m && !V.m.done) {
    V.m.l0 = V.m.l0 || t.lu.map((i) => t.sq[i].n);
    (V.m.xo = V.m.xo || []).push(t.sq[ka < 0 ? b : a].n);
  }
  h.u.push({ lu: t.lu.slice(), sub: V.sub, cons, live });
  if (h.u.length > 40) h.u.shift();
  h.r.length = 0;
  if (cons) V.sub--;
  if (ka >= 0 && kb >= 0) [t.lu[ka], t.lu[kb]] = [b, a];
  else if (ka >= 0) t.lu[ka] = b;
  else t.lu[kb] = a;
  const inn = ka < 0 ? a : b,
    out = ka < 0 ? b : a;
  V.dn = { d: teamNote(t) - n0, k: V.m ? V.m.min : -1 };
  V.swp = [a, b];
  setTimeout(() => {
    V.swp = null;
  }, 1000);
  swMsg(
    ka >= 0 && kb >= 0
      ? t.sq[a].n + ' et ' + t.sq[b].n + ' échangent leurs postes.'
      : t.sq[inn].n + ' remplace ' + t.sq[out].n + '.',
  );
  try {
    const nc = capSync(t);
    if (nc) V.swm += ' ' + nc.n + ' devient capitaine.';
  } catch (e) {}
  V.sel = null;
  V.sug = null;
  save();
  render();
}
// Double-clic sur un joueur : le place automatiquement au meilleur poste.
function dblPlace(i) {
  const t = me();
  if (!t.sq[i]) return render();
  const k = t.lu.indexOf(i);
  if (k < 0) doSwap(i, t.lu[bestSlot(t, i)]);
  else {
    const b = bestIn(t, k);
    if (b != null) doSwap(i, b);
    else render();
  }
}
// Clic sur une carte joueur : sélection, échange ou double-clic.
// Touche Échap : désélectionne le joueur choisi.
document.addEventListener('keydown', (e) => {
  if (e.key == 'Escape' && typeof V != 'undefined' && V && V.sel != null && V.tab == 'tac') {
    V.sel = null;
    V.lc = null;
    render();
  }
});
function pick(i) {
  const t = me(),
    now = Date.now();
  if (i != null && V.lc && V.lc[0] == i && now - V.lc[1] < 450) {
    V.lc = null;
    V.sel = null;
    return dblPlace(i);
  }
  V.lc = [i, now];
  if (V.sel != null && !t.sq[V.sel]) V.sel = null;
  if (i == null || !t.sq[i]) return render();
  if (V.rsel != null) {
    if (!t.sq[V.rsel] || !t.sq[V.rsel].rv) V.rsel = null;
    else if (!t.sq[i].rv) return rvSwap(V.rsel, i);
  }
  if (V.sel == null) {
    V.sel = i;
    return render();
  }
  const a = V.sel,
    b = i;
  V.sel = null;
  if (a == b) return render();
  doSwap(a, b);
}
// Vrai si on peut annuler le dernier échange.
function canUndo() {
  const h = swH(),
    u = h.u[h.u.length - 1];
  return !!u && !u.cons && u.live == liveNow();
}
// Vrai si on peut rétablir un échange annulé.
function canRedo() {
  const h = swH(),
    r = h.r[h.r.length - 1];
  return !!r && r.live == liveNow();
}
// Annule le dernier échange de joueurs.
function undoSw() {
  if (!canUndo()) return render();
  const t = me(),
    h = swH(),
    u = h.u.pop();
  if (!u.lu.every((i) => t.sq[i])) {
    h.u.length = 0;
    return render();
  }
  h.r.push({ lu: t.lu.slice(), live: u.live });
  t.lu.splice(0, t.lu.length, ...u.lu);
  V.dn = null;
  V.sel = null;
  swMsg('Changement annulé.');
  save();
  render();
}
// Rétablit un échange annulé.
function redoSw() {
  if (!canRedo()) return render();
  const t = me(),
    h = swH(),
    r = h.r.pop();
  h.u.push({ lu: t.lu.slice(), sub: V.sub, cons: false, live: r.live });
  t.lu.splice(0, t.lu.length, ...r.lu);
  V.dn = null;
  V.sel = null;
  swMsg('Changement rétabli.');
  save();
  render();
}
// Liste des remplaçants.
function benchOf(t) {
  return t.sq.map((_, i) => i).filter((i) => !t.lu.includes(i) && !t.sq[i].rv);
}
// RÉSERVE : jusqu'à 15 joueurs de plus, ni titulaires ni remplaçants (p.rv = 1). Indisponibles en match,
// ils restent payés et peuvent être rappelés, échangés avec un joueur de l'effectif ou prêtés.
const RVMAX = 15,
  sqN = (t) => t.sq.filter((p) => !p.rv).length,
  rvN = (t) => t.sq.filter((p) => p.rv).length;
// Meilleur remplaçant pour un poste donné.
function bestIn(t, k) {
  const s = slots(t.form);
  let b = null,
    v = -1;
  benchOf(t).forEach((i) => {
    const e = eff(t, i, s[k], k);
    if (e > v) {
      v = e;
      b = i;
    }
  });
  return b;
}
// Meilleur poste libre pour un joueur donné.
function bestSlot(t, i) {
  const s = slots(t.form);
  let b = 0,
    v = -1e9;
  t.lu.forEach((o, k) => {
    const g = eff(t, i, s[k], k) - eff(t, o, s[k], k);
    if (g > v) {
      v = g;
      b = k;
    }
  });
  return b;
}
// Suggestion d'échange (bouton « Suggérer »).
function sugSw() {
  const t = me(),
    s = slots(t.form);
  let w = 0,
    v = 1e9;
  t.lu.forEach((i, k) => {
    const e = eff(t, i, s[k], k);
    if (e < v) {
      v = e;
      w = k;
    }
  });
  const c = bestIn(t, w);
  if (c == null) {
    swMsg('Aucun remplaçant disponible.');
    return render();
  }
  const g = eff(t, c, s[w], w) - v;
  if (g <= 0) {
    V.sug = null;
    swMsg('Aucun remplaçant ne ferait mieux pour le moment.');
    return render();
  }
  V.sug = [t.lu[w], c];
  swMsg(
    'Suggestion : ' +
      t.sq[c].n +
      ' pour remplacer ' +
      t.sq[t.lu[w]].n +
      ' (+' +
      Math.round(g) +
      ' d’efficacité).',
  );
  render();
}
// Ferme l'astuce du glisser-déposer pour de bon.
function dndOk() {
  try {
    localStorage.setItem('gm_dndh', '1');
  } catch (e) {}
  V.dh = 1;
  render();
}
// Petits badges ajoutés aux cartes : poste inadapté, moral (flèches vertes/orange/rouges).
function pcx(p, k, st, M) {
  const t = me(),
    s = slots(t.form);
  let b = '';
  if (st) {
    if (p.p != s[k])
      b += '<span class="opb" title="Hors poste : ce joueur est moins efficace (−25 %)">HP</span>';
    if (p.inj) b += '<span class="opb bl" title="Blessé">BLES</span>';
    else if ((p.e ?? 100) < 40)
      b += '<span class="opb fat" title="Fatigué : il perd en efficacité">FAT</span>';
  }
  let m = '';
  if (M) {
    const v = p.mo ?? 60;
    m = `<span class="mrl ${v > 60 ? 'up' : v < 50 ? 'dn' : 'eq'}" title="Moral ${Math.round(v)} %"></span>`;
  }
  return (b ? `<span class="bdg">${b}</span>` : '') + m;
}
// Classes CSS d'une carte (sélectionnée, en échange, suggérée).
function clsOf(i) {
  const sw = V.swp || [],
    sg = V.sug || [];
  return (V.sel === i ? 'sel ' : '') + (sw.includes(i) ? 'swp ' : '') + (sg.includes(i) ? 'sug ' : '');
}
// Dessine le terrain de l'onglet Tactique, avec des cartes joueurs.
function tacPitch(t, s) {
  const L =
    '<i style="left:1%;top:1.5%;right:1%;bottom:1.5%"></i><i style="left:50%;top:1.5%;bottom:1.5%;border-width:0 0 0 2px"></i><i style="left:50%;top:50%;width:17%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%)"></i><i style="left:1%;top:26%;width:15%;height:48%"></i><i style="right:1%;top:26%;width:15%;height:48%"></i>';
  const cs = t.lu
    .map((li, k) => {
      const p = t.sq[li],
        q = pos(t, k, 0),
        X = (0.09 + (q[0] - 0.05) * 1.1) * 100,
        Y = q[1] * 100,
        col = p.p == 'GK' ? '#e0a526' : p.p == 'DEF' ? '#3b8fe8' : p.p == 'MID' ? '#2fb36b' : '#e5484d';
      return `<div class="tpc ${clsOf(li)}${p.p != s[k] ? 'bad' : ''}" data-i="${li}" draggable="true" onclick="pick(${li})" style="left:${X.toFixed(1)}%;top:${Y.toFixed(1)}%;border-top:3px solid ${col}${phBg(p)}">${capB(p)}<b class="o">${p.o}</b><span class="ps" style="color:${col}">${p.p}</span><span class="pn">${p.n
        .split(' ')
        .map((w, i, a) => (i < a.length - 1 ? w[0] + '.' : w))
        .join(' ')}</span>${pcx(p, k, 1, false)}<span class="pci" role="button" aria-label="Voir le profil" title="Voir la fiche du joueur" onclick="event.stopPropagation();prof('sq',${li})" ondragstart="event.preventDefault()">i</span></div>`;
    })
    .join('');
  return `<div class="tpt" data-z="st">${L}${cs}</div>`;
}
// Rend une carte déplaçable (attribut draggable).
function dgi(h, i) {
  return h.replace(/^<div /, `<div data-i="${i}" draggable="true" `);
}
// Affiche l'effectif : terrain, titulaires et remplaçants sous forme de cartes.
function squadCards() {
  const t = me(),
    s = slots(t.form),
    bn = benchOf(t),
    M = V.tab == 'match' && !!V.m && !V.m.done,
    sw = V.swp || [],
    sg = V.sug || [],
    cl = (i) => (V.sel === i ? 'sel ' : '') + (sw.includes(i) ? 'swp ' : '') + (sg.includes(i) ? 'sug ' : '');
  let hint = '';
  try {
    if (!V.dh && localStorage.getItem('gm_dndh') != '1')
      hint = `<div class="swm" id="dndh"><span>Astuce :</span> glissez un joueur sur un autre pour les échanger (ou touchez les deux). <button onclick="dndOk()" style="padding:1px 8px">OK</button></div>`;
  } catch (e) {}
  const dn =
    V.dn && V.dn.k === (V.m ? V.m.min : -1) && Math.abs(V.dn.d) >= 0.05
      ? ` <span class="tdn ${V.dn.d > 0 ? 'up' : 'dn'}">${V.dn.d > 0 ? '+' : '−'}${nf1(Math.abs(V.dn.d))}</span>`
      : '';
  const cu = canUndo(),
    cr = canRedo(),
    h = swH(),
    lu = h.u[h.u.length - 1],
    ut =
      lu && lu.cons
        ? 'Un remplacement déjà effectué en match ne peut pas être annulé'
        : 'Annuler le dernier changement';
  return `<div class="card${M ? ' sqm' : ''}" id="sqbox"><div class="ctl" style="justify-content:space-between"><span><span class="mu">Titulaires</span> <span class="mu" style="margin-left:8px">Note équipe</span> <b>${nf1(teamNote(t))}</b>${dn}</span><span class="ctl"><button onclick="undoSw()" ${cu ? '' : 'disabled'} title="${ut}" style="padding:2px 8px">Annuler</button><button onclick="redoSw()" ${cr ? '' : 'disabled'} title="Rétablir le changement annulé" style="padding:2px 8px">Rétablir</button>${M ? '<button onclick="sugSw()" style="padding:2px 8px" title="Propose le meilleur remplaçant">Suggérer</button>' : ''}${vwBtn()}</span></div>${V.swm ? `<div class="swm" id="swm">${V.swm}</div>` : ''}${hint}<div class="pg${V.vw == 'l' ? ' l' : ''}" id="zst" data-z="st">${t.lu.map((i, k) => dgi(pc(t.sq[i], cl(i) + (t.sq[i].p != s[k] ? 'bad' : ''), `pick(${i})`, pcx(t.sq[i], k, 1, M)), i)).join('')}</div><div class="mu" style="margin-top:8px">Remplaçants</div>${fbar()}<div class="pg${V.vw == 'l' ? ' l' : ''}" id="zbn" data-z="bn" style="min-height:44px">${fl(
    bn.map((i) => [t.sq[i], i]),
  )
    .map(([p, i]) => dgi(pc(p, cl(i), `pick(${i})`, pcx(p, -1, 0, M)), i))
    .join(
      '',
    )}</div><div class="mu" style="margin-top:6px">Glissez un joueur sur un autre pour échanger (titulaire ↔ remplaçant), ou touchez-en deux. Double-clic : place le joueur au meilleur endroit. ★ = personnage de la série · <i class="fic" title="Contenu fictif, inventé pour ce jeu (absent de la série)">✦</i> = contenu fictif.</div></div>`;
}
(function () {
  let src = null,
    tip = null;
  const T = () => me(),
    card = (e) => (e.target && e.target.closest ? e.target.closest('[data-i]') : null),
    zone = (e) => (e.target && e.target.closest ? e.target.closest('[data-z]') : null);
  function ok(a, b) {
    const t = T(),
      s = slots(t.form),
      ka = t.lu.indexOf(a),
      kb = t.lu.indexOf(b);
    if (a == b || (ka < 0 && kb < 0)) return null;
    if (ka < 0) return t.sq[a].p == s[kb];
    if (kb < 0) return t.sq[b].p == s[ka];
    return t.sq[a].p == s[kb] && t.sq[b].p == s[ka];
  }
  function clr() {
    document
      .querySelectorAll('.dz-ok,.dz-w,.dgs,.dz-on,.dz-hv')
      .forEach((e) => e.classList.remove('dz-ok', 'dz-w', 'dgs', 'dz-on', 'dz-hv'));
    if (tip) {
      tip.remove();
      tip = null;
    }
  }
  function mark() {
    if (src == null) return;
    const t = T();
    document.querySelectorAll('[data-i]').forEach((c) => {
      const j = +c.dataset.i;
      if (j == src) {
        c.classList.add('dgs');
        return;
      }
      const r = ok(src, j);
      if (r === null) return;
      c.classList.add(r ? 'dz-ok' : 'dz-w');
    });
    document
      .querySelectorAll('[data-z="' + (t.lu.includes(src) ? 'bn' : 'st') + '"]')
      .forEach((z) => z.classList.add('dz-on'));
  }
  function resolve(e) {
    const t = T();
    if (src == null) return null;
    const c = card(e);
    if (c) {
      const j = +c.dataset.i;
      return ok(src, j) === null ? null : j;
    }
    const z = zone(e);
    if (!z) return null;
    if (z.dataset.z == 'st' && !t.lu.includes(src)) return t.lu[bestSlot(t, src)];
    if (z.dataset.z == 'bn' && t.lu.includes(src)) {
      const k = t.lu.indexOf(src);
      return bestIn(t, k);
    }
    return null;
  }
  function prev(a, b) {
    const t = T(),
      s = slots(t.form),
      ka = t.lu.indexOf(a),
      kb = t.lu.indexOf(b);
    if (a == b || (ka < 0 && kb < 0)) return '';
    const lu = t.lu.slice();
    if (ka >= 0 && kb >= 0) {
      lu[ka] = b;
      lu[kb] = a;
    } else if (ka >= 0) lu[ka] = b;
    else lu[kb] = a;
    const n0 = teamNote(t),
      n1 = teamNote(t, lu),
      d = n1 - n0,
      w = [];
    lu.forEach((i, k) => {
      if (t.sq[i].p != s[k] && (i == a || i == b)) w.push(t.sq[i].n.split(' ').pop() + ' hors poste (−25 %)');
    });
    const cons = (ka < 0 || kb < 0) && liveNow();
    return (
      `<b>${t.sq[a].n}</b> ↔ <b>${t.sq[b].n}</b><br>Note équipe ${nf1(n0)} → <b>${nf1(n1)}</b> (${d >= 0 ? '+' : '−'}${nf1(Math.abs(d))})` +
      (w.length ? '<br>Attention : ' + w.join('<br>Attention : ') : '') +
      (cons ? `<br>Remplacements restants : ${V.sub} → ${Math.max(0, V.sub - 1)}` : '')
    );
  }
  document.addEventListener('pointerdown', () => {
    DND.on = 0;
  });
  document.addEventListener('dragstart', (e) => {
    const c = card(e);
    if (!c) {
      return;
    }
    src = +c.dataset.i;
    DND.on = 1;
    DND.t = Date.now();
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(src));
    } catch (_) {}
    mark();
  });
  document.addEventListener('dragover', (e) => {
    if (src == null) return;
    if (!document.querySelector('.dz-ok,.dz-w')) mark();
    const j = resolve(e);
    document.querySelectorAll('.dz-hv').forEach((x) => x.classList.remove('dz-hv'));
    if (j == null) return;
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = 'move';
    } catch (_) {}
    const c = document.querySelector('[data-i="' + j + '"]');
    if (c) c.classList.add('dz-hv');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'dgtip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = prev(src, j);
    tip.style.left = Math.min(innerWidth - 270, e.clientX + 16) + 'px';
    tip.style.top = Math.min(innerHeight - 120, e.clientY + 16) + 'px';
  });
  document.addEventListener('drop', (e) => {
    if (src == null) return;
    const j = resolve(e);
    const a = src;
    src = null;
    DND.on = 0;
    clr();
    if (j == null) return;
    e.preventDefault();
    doSwap(a, j);
  });
  document.addEventListener('dragend', () => {
    src = null;
    DND.on = 0;
    clr();
    if (DND.sk) {
      DND.sk = 0;
      render();
    }
  });
})();
// Page d'équipe (appelle squadCards).
function squad() {
  return squadCards() + (V.tab == 'match' ? '' : rvCard());
}
// ----- Réserve : actions (hors match uniquement) -----
const rvLive = () => V.tab == 'match' && !!V.m && !V.m.done;
// Envoie un joueur de l'effectif (ni titulaire ni prêté) en réserve.
function toRv(i) {
  const t = me(),
    p = t.sq[i];
  let e = '';
  if (!p) return;
  if (rvLive()) e = 'Impossible pendant un match.';
  else if (p.ln) e = 'Un joueur prêté ne peut pas aller en réserve.';
  else if (t.lu.includes(i)) e = 'Un titulaire ne peut pas aller en réserve : remplacez-le d’abord.';
  else if (p.rv) e = 'Ce joueur est déjà en réserve.';
  else if (rvN(t) >= RVMAX) e = 'Réserve complète (' + RVMAX + ' joueurs).';
  else if (sqN(t) <= 8) e = 'Effectif trop réduit : gardez au moins 8 joueurs hors réserve.';
  if (e) {
    V.pn = e;
    return render();
  }
  p.rv = 1;
  V.pn = p.n + ' rejoint la réserve.';
  V.sel = null;
  save();
  render();
}
// Rappelle un joueur de la réserve : il devient remplaçant.
function fromRv(i) {
  const t = me(),
    p = t.sq[i];
  if (!p || !p.rv) return;
  let e = '';
  if (rvLive()) e = 'Impossible pendant un match.';
  else if (sqN(t) >= 15) e = 'Effectif complet (15 joueurs) : échangez-le avec un joueur de l’effectif.';
  if (e) {
    V.pn = e;
    return render();
  }
  delete p.rv;
  V.rsel = null;
  V.pn = p.n + ' est rappelé : il est remplaçant.';
  save();
  render();
}
// Touche un joueur de la réserve : il est sélectionné pour être échangé.
function rvPick(i) {
  V.sel = null;
  V.rsel = V.rsel === i ? null : i;
  render();
}
// Échange un joueur de la réserve (a) avec un joueur de l'effectif (b) : titulaire ou remplaçant.
function rvSwap(a, b) {
  const t = me(),
    pa = t.sq[a],
    pb = t.sq[b];
  V.rsel = null;
  if (!pa || !pb || !pa.rv || pb.rv) return render();
  if (rvLive() || pb.ln) {
    V.pn = rvLive() ? 'Impossible pendant un match.' : 'Un joueur prêté ne peut pas aller en réserve.';
    return render();
  }
  t.sq[a] = pb;
  t.sq[b] = pa;
  delete pa.rv;
  pb.rv = 1;
  V.sel = null;
  V.pn = pa.n + ' prend la place de ' + pb.n + ' (envoyé en réserve).';
  save();
  render();
}
// Encadré « Réserve » de l'équipe.
function rvCard() {
  if (!S || !me() || !me().sq) return '';
  const t = me(),
    L = t.sq.map((p, i) => [p, i]).filter(([p]) => p.rv),
    sel = V.rsel != null && t.sq[V.rsel] && t.sq[V.rsel].rv ? V.rsel : null;
  return `<div class="card rvc"><div class="ctl" style="justify-content:space-between"><span><b>Réserve</b>${hp('rsv')} <span class="mu" style="margin-left:8px">${L.length}/${RVMAX}</span></span></div><div class="mu" style="margin:4px 0 8px">Ni titulaires ni remplaçants : indisponibles en match. ${sel != null ? '<b>Touchez un joueur de l’effectif pour l’échanger avec ' + t.sq[sel].n + '.</b>' : 'Touchez un joueur de la réserve pour l’échanger avec un joueur de l’effectif. Pour y envoyer un remplaçant, ouvrez sa fiche (ⓘ).'}</div>${L.length ? `<div class="pg">${L.map(([p, i]) => `<div class="rvw">${pc(p, sel === i ? 'sel ' : '', `rvPick(${i})`)}<div class="ctl" style="justify-content:center;margin-top:4px"><button onclick="fromRv(${i})">Rappeler</button></div></div>`).join('')}</div>` : '<div class="mu">Aucun joueur en réserve.</div>'}</div>`;
}
// Section « Réserve » de la fiche d'un joueur de l'équipe.
function rvSec(p, i) {
  if (!S || !me().sq[i]) return '';
  const t = me();
  if (p.rv)
    return `<h2>Réserve</h2><div class="mu">Ce joueur est en réserve : indisponible en match.</div><button style="margin-top:6px" onclick="fromRv(${i})">Rappeler dans l’effectif (remplaçant)</button>`;
  if (p.ln || t.lu.includes(i)) return '';
  return `<h2>Réserve</h2><button onclick="toRv(${i})">Envoyer en réserve (${rvN(t)}/${RVMAX})</button>`;
}
// Tableau du classement de la League.
function table() {
  if (S.ctx == 'C') return tableG();
  return champView();
}
// ===== Page Championnat (Ligue) : classement + panneau latéral =====
// Pastilles de forme (5 derniers matchs).
const chForm = (t) =>
  `<span class="chf">${(t.fm || [])
    .map((r) => `<i class="${r}" title="${r == 'V' ? 'Victoire' : r == 'N' ? 'Nul' : 'Défaite'}"></i>`)
    .join('')}</span>`;
// Les 3 meilleurs d'une statistique dans un groupe de joueurs [joueur, club].
function chTop(pool, k, n = 3) {
  const v = (p) => (k == 'rt' ? (p.rp && p.rp.length ? p.rp.reduce((a, b) => a + b, 0) / p.rp.length : 0) : rkV(p, k));
  return pool
    .map(([p, t]) => [p, t, v(p)])
    .filter((x) => x[2] > 0)
    .sort((a, b) => b[2] - a[2] || b[0].o - a[0].o)
    .slice(0, n);
}
// Bloc « Leaders » : titre + 3 premiers.
function chLd(ti, ic, pool, k, withClub) {
  const L = chTop(pool, k);
  return `<div class="chl"><div class="chlt"><svg class="ic" width="16" height="16" aria-hidden="true"><use href="#${ic}"/></svg>${ti}</div>${
    L.map(
      ([p, t, v], i) =>
        `<div class="chlr"><span class="chnu">${i + 1}</span><span class="chpl">${withClub ? t.em + ' ' : ''}${p.n}</span><b>${k == 'rt' ? v.toFixed(1) : v}</b></div>`,
    ).join('') || '<div class="chlr mu">–</div>'
  }</div>`;
}
// Page complète du championnat.
function champView() {
  const o = S.teams
      .map((t, i) => [t, i])
      .sort((a, b) => b[0].pts - a[0].pts || b[0].gf - b[0].ga - (a[0].gf - a[0].ga) || b[0].gf - a[0].gf),
    my = me(),
    pos = o.findIndex(([t]) => t == my) + 1,
    obj = S.obj || 0,
    all = [],
    mine = [];
  S.teams.forEach((t) =>
    (t.sq || []).filter(Boolean).forEach((p) => {
      all.push([p, t]);
      if (t == my) mine.push([p, t]);
    }),
  );
  let nx = null;
  try {
    nx = calList().find((e) => !e.played && e.c == S.ctx);
  } catch (e) {}
  const rows = o
      .map(([t, i], k) => {
        const z = k == 0 ? 'ch1' : obj && k + 1 <= obj ? 'cho' : '';
        return `<tr class="${i == S.t ? 'me' : ''}"><td><span class="chk ${z}" title="${k == 0 ? 'Leader' : z ? 'Dans l’objectif du conseil' : ''}">${k + 1}</span></td><td class="chc"${i == S.t ? '' : ` data-n="${mkEsc(t.name)}" onclick="opOpen(this.dataset.n)" style="cursor:pointer" title="Voir la fiche du club"`}>${t.em} <b>${t.name}</b>${ft(t.name)}</td><td>${t.pl}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf}</td><td>${t.ga}</td><td>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td><td class="chpt">${t.pts}</td><td class="chfc">${chForm(t)}</td></tr>`;
      })
      .join(''),
    cards = (k) => mine.reduce((a, [p]) => a + rkV(p, k), 0),
    left = `<div class="card chm"><div class="chmh"><img class="tl" src="${LGL}" alt="Galactik League"><b>Classement</b>${hp('chm')}<span class="chlg"><i class="ch1"></i>Leader<i class="cho"></i>Objectif du conseil (top ${obj})</span></div><div class="chtw"><table class="cht"><tr><th>#</th><th>Club</th><th>J</th><th>V</th><th>N</th><th>D</th><th>Bp</th><th>Bc</th><th>DB</th><th>Pts</th><th>Forme</th></tr>${rows}</table></div></div>`,
    ap = `<div class="card chs"><b>Aperçu du championnat</b><div class="chap"><div><span>Position</span><b>${pos}${pos == 1 ? 'er' : 'e'}</b></div><div><span>Pts</span><b>${my.pts}</b></div><div><span>DB</span><b>${my.gf - my.ga > 0 ? '+' : ''}${my.gf - my.ga}</b></div><div class="chap2"><span>Perfs récentes</span>${chForm(my)}</div></div>${
      nx
        ? `<div class="chnx"><span>Prochain match</span><b>${nx.opp.em} ${nx.opp.name}</b><span class="mu">${fmtDay(nx.day)} · ${nx.h ? 'Domicile' : 'Extérieur'}</span></div>`
        : ''
    }</div>`,
    cl = `<div class="card chs"><b>Leaders de ${my.name}</b>${hp('chm2')}<div class="chlg2">${chLd('Buts', 'i-ball', mine, 'g')}${chLd('Passes décisives', 'i-footr', mine, 'a')}${chLd('Note moyenne', 'i-star', mine, 'rt')}${chLd('Hommes du match', 'i-medal', mine, 'mm')}</div><div class="chcd"><span><i class="cy" style="background:#ff8a3b"></i>Exclusions <b>${cards('ex') + cards('yc') + cards('rc')}</b></span></div></div>`,
    ll = `<div class="card chs"><b>Leaders de la ligue</b><div class="chlg2">${chLd('Buts', 'i-ball', all, 'g', 1)}${chLd('Passes décisives', 'i-footr', all, 'a', 1)}${chLd('Hommes du match', 'i-medal', all, 'mm', 1)}${chLd('Arrêts', 'i-glove', all.filter(([p]) => p.p == 'GK'), 'sv', 1)}</div></div>`,
    op = (() => {
      try {
        const L = calList()
          .filter((e) => !e.played && e.c == S.ctx)
          .slice(0, 3);
        if (!L.length) return '';
        return `<div class="card chs"><b>Suivi des adversaires</b>${L.map((e) => {
          const t = e.opp,
            r = o.findIndex(([x]) => x == t) + 1;
          return `<div class="chop"><span>${t.em} <b>${t.name}</b></span><span class="mu">${r}e · ${t.pts} pts</span>${chForm(t)}</div>`;
        }).join('')}</div>`;
      } catch (e) {
        return '';
      }
    })();
  return `<div class="fvw"><div class="chg">${left}<div class="chrt">${ap}${cl}${ll}${op}</div></div></div>`;
}
// Tableau des groupes de la Cup.
function tableG() {
  return (
    `<div class="card tcard" style="align-items:center"><img class="tl" src="${LGC}" alt="Galactik Cup" style="height:90px"><div><b>Galactik Cup · Phase de poules</b><div class="mu">Les 2 premiers de chaque poule se qualifient pour les quarts de finale.</div></div></div>` +
    [0, 1, 2, 3]
      .map((g) => {
        const o = stdg(
          S.teams
            .map((t, i) => [t, i])
            .filter(([t]) => t.g === g)
            .map((x) => x[0]),
        );
        return (
          `<div class="card"><b>Poule ${GN[g]}</b> <span class="mu">· les 2 premiers se qualifient</span><table><tr><th>#</th><th>Équipe</th><th>J</th><th>V</th><th>N</th><th>D</th><th>Diff</th><th>Pts</th></tr>` +
          o
            .map(
              (t, k) =>
                `<tr class="${t == me() ? 'me' : ''}" style="${k < 2 ? '' : 'opacity:.7'}"><td>${k + 1}</td><td>${t.em} ${t.name}${ft(t.name)}</td><td>${t.pl}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf - t.ga}</td><td>${t.pts}</td></tr>`,
            )
            .join('') +
          '</table></div>'
        );
      })
      .join('')
  );
}

// ======================================================================
// INSTALLATION SUR PC (PWA) ET FICHIER ZIP
// ======================================================================
// Interrupteur : mettre 1 pour réactiver le bouton « Télécharger / installer sur PC » du menu
// (désactivé pour l'instant).
const PCON = 0; /* passer à 1 pour réactiver le bouton Télécharger / installer sur PC */
// Mémorise l'invitation d'installation proposée par le navigateur.
let PWA = null;
// Vrai si le jeu est déjà lancé comme une application installée.
const PWAS = () => {
  try {
    return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  } catch (e) {
    return false;
  }
};
try {
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    PWA = e;
  });
  addEventListener('appinstalled', () => {
    PWA = null;
    V.ins = 0;
    try {
      render();
    } catch (e) {}
  });
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol))
    navigator.serviceWorker.register('sw.js').catch(() => {});
} catch (e) {}

// Table de calcul d'une somme de contrôle (CRC32), nécessaire pour fabriquer un fichier .zip.
const CRCT = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
// Calcule la somme de contrôle d'un fichier pour le zip.
const crc32 = (u) => {
  let c = -1;
  for (let i = 0; i < u.length; i++) c = CRCT[(c ^ u[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
// Fabrique un fichier .zip (sans bibliothèque externe) à partir d'une liste de fichiers.
function zipMake(fs) {
  const E = new TextEncoder(),
    ch = [],
    cd = [];
  let off = 0;
  const w = (n, v) => {
      const a = new Uint8Array(n);
      for (let i = 0; i < n; i++) a[i] = (v >>> (8 * i)) & 255;
      return a;
    },
    cat = (a) => {
      const o = new Uint8Array(a.reduce((x, y) => x + y.length, 0));
      let p = 0;
      a.forEach((y) => {
        o.set(y, p);
        p += y.length;
      });
      return o;
    };
  fs.forEach(([n, d]) => {
    const nb = E.encode(n),
      c = crc32(d),
      h = cat([
        w(4, 0x04034b50),
        w(2, 20),
        w(2, 0x0800),
        w(2, 0),
        w(2, 0),
        w(2, 0x21),
        w(4, c),
        w(4, d.length),
        w(4, d.length),
        w(2, nb.length),
        w(2, 0),
        nb,
      ]);
    ch.push(h, d);
    cd.push(
      cat([
        w(4, 0x02014b50),
        w(2, 20),
        w(2, 20),
        w(2, 0x0800),
        w(2, 0),
        w(2, 0),
        w(2, 0x21),
        w(4, c),
        w(4, d.length),
        w(4, d.length),
        w(2, nb.length),
        w(2, 0),
        w(2, 0),
        w(2, 0),
        w(2, 0),
        w(4, 0),
        w(4, off),
        nb,
      ]),
    );
    off += h.length + d.length;
  });
  const cdb = cat(cd);
  return cat([
    ...ch,
    cdb,
    w(4, 0x06054b50),
    w(2, 0),
    w(2, 0),
    w(2, fs.length),
    w(2, fs.length),
    w(4, cdb.length),
    w(4, off),
    w(2, 0),
  ]);
}
// Récupère le code de la page pour le mettre dans le zip « version PC » (assemble index.html, css
// et js en un seul fichier).
async function pcSrc() {
  // Le jeu est réparti en plusieurs fichiers : on les relit puis on les fusionne en UNE seule page,
  // pour que la version PC fonctionne sans dossier css/ ni js/.
  try {
    const get = async (u) => (await fetch(u)).text();
    let h = await get(location.href.split('#')[0].split('?')[0]);
    const links = [...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)];
    for (const m of links) { const css = await get(m[1]); h = h.replace(m[0], () => '<style>' + css + '</style>'); }
    const scr = [...h.matchAll(/<script src="((?:js)\/[^"]+)"><\/script>/g)];
    for (const m of scr) { const code = await get(m[1]); h = h.replace(m[0], () => '<script>' + code + '</scr' + 'ipt>'); }
    if (h.length > 200000 && h.includes('function render(')) return h;
  } catch (e) {}
  return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
}
// Prépare et télécharge le zip « version PC » (jeu + lanceur Windows).
async function pcDl() {
  V.pcm = 'Préparation du fichier…';
  render();
  try {
    const E = new TextEncoder(),
      h = await pcSrc(),
      bat =
        '@echo off\r\nset "F=%~dp0GalactikManager.html"\r\nfor %%B in ("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe") do if exist %%B (start "" %%B --app="file:///%F:\\=/%" & exit /b)\r\nstart "" "%F%"\r\n',
      rd =
        'Galactik Manager (version PC)\r\n\r\n1. Extrayez tout le contenu de ce dossier compressé (clic droit > Extraire tout).\r\n2. Double-cliquez sur Lancer-GFM.bat : le jeu s’ouvre dans sa propre fenêtre (Edge ou Chrome), sans dépendre de votre navigateur par défaut.\r\n   Sans lanceur, ouvrez simplement GalactikManager.html.\r\n\r\nVos parties sont enregistrées dans cette fenêtre. Pensez à les exporter (Sauvegardes > Exporter) pour les conserver ou les changer d’appareil.\r\n\r\nJeu de fan gratuit, inspiré de Galactik Football.\r\n',
      z = zipMake([
        ['GalactikManager.html', E.encode(h)],
        ['Lancer-GFM.bat', E.encode(bat)],
        ['LISEZ-MOI.txt', E.encode(rd)],
      ]),
      b = new Blob([z], { type: 'application/zip' });
    const d = window.claude && window.claude.use ? window.claude.use('downloads') : null;
    let ok = 0;
    try {
      const x = await d;
      if (x) {
        await x.save({ filename: 'GalactikManager-PC.zip', data: b });
        ok = 1;
      }
    } catch (e) {
      if (e && e.code == 'declined') {
        V.pcm = 'Téléchargement annulé.';
        render();
        return;
      }
    }
    if (!ok) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'GalactikManager-PC.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    V.pcm = 'Fichier prêt : extrayez le dossier compressé puis lancez Lancer-GFM.bat.';
  } catch (e) {
    V.pcm = 'Le téléchargement a échoué. Réessayez ou ouvrez le jeu dans Chrome ou Edge.';
  }
  render();
}
// Bouton « Installer » : déclenche l'installation de l'application par le navigateur.
function pwaI() {
  if (PWA) {
    const p = PWA;
    PWA = null;
    try {
      p.prompt();
    } catch (e) {
      V.ins = 1;
    }
  } else V.ins = 1;
}

// ======================================================================
// FEUILLE DE ROUTE AFFICHÉE DANS LE JEU
// ======================================================================
// CONTENU DE LA ROADMAP du menu d'accueil : [titre, description, statut]. Statuts : « Disponible
// (bêta) » ou « À venir ». Modifier ici pour mettre la feuille de route à jour.
const RMP = [
  ['Attributs qui influencent le match', 'Finition, Réflexes, Passe, Vision, Tacle, Physique, Vitesse, Dribble et Détermination ont un effet réel ; l’entraînement par axe les fait progresser.', 'Disponible (bêta)'],
  ['Jauge d’expérience et potentiel', 'Barre de progression des joueurs et marge de progression pour presque tous les joueurs.', 'Disponible (bêta)'],
  ['Transferts par offres et contre-propositions', 'Offres au club vendeur, conditions du joueur (prime, salaire, prime de titre, durée) et contre-propositions.', 'Disponible (bêta)'],
  ['Notes des joueurs après chaque match', 'Une note par joueur, remplaçants compris, et un récapitulatif du match.', 'Disponible (bêta)'],
  ['Éditeur d’écusson', 'Créer l’écusson de son club dans l’éditeur de mods.', 'Disponible (bêta)'],
  ['Placement individuel des joueurs', 'Hauteur (cinq niveaux) et décalage latéral (trois niveaux) réglables joueur par joueur, avec un vrai effet sur le match.', 'Disponible (bêta)'],
  ['Fluides propres à chaque origine', 'Multifluide pour Paradisia (compatible avec tout), aucun Fluide pour les Pirates (compensés par leurs attributs).', 'Disponible (bêta)'],
  ['Notifications en couleurs', 'Une couleur par type de notification : mails, musique, déblocages, manager, sauvegarde, système.', 'Disponible (bêta)'],
  ['Formations libres', '7 formations possibles (de 1 à 3 joueurs par poste) pour laisser chacun explorer son style de jeu.', 'Disponible (bêta)'],
  ['Écran de match plein écran', 'Vue 3D en plein écran avec tableau des scores, panneaux Stats, Journal, Compo et Consignes et fenêtre de compositions avant le match.', 'Disponible (bêta)'],
  ['Conférences de presse', 'Questions variées de Callie Mystic avant et après chaque match, dont des interviews sur les buteurs, dans une fenêtre dédiée.', 'Disponible (bêta)'],
  ['Réponses aux mails obligatoires', 'Une réponse attendue bloque la suite de la partie : le bouton « Continuer » mène au mail concerné.', 'Disponible (bêta)'],
  ['Scouting des adversaires', 'Onglet Adversaires : recherche de clubs et de joueurs, tactiques, composition et cartes de tous les clubs, à tout moment.', 'Disponible (bêta)'],
  ['Nouveau menu principal et visite avec Clamp', 'Menu en tuiles illustrées et visite guidée racontée par Clamp.', 'Disponible (bêta)'],
  ['Gestion du club façon site web', 'Stade, billet, sponsors et boutique présentés comme une page web aux couleurs du club, avec illustrations.', 'Disponible (bêta)'],
  ['Boutique et sponsors illustrés', 'Produits dérivés aux couleurs et au logo du club, et un logo pour chacun des 8 sponsors.', 'Disponible (bêta)'],
  ['Staff en encadrés', 'Entraîneur, kiné, analyste et centre de formation séparés, avec pictogrammes et jauges de niveau.', 'Disponible (bêta)'],
  ['Marché façon Football Manager', 'Tableau triable, prix calculé, numéros de maillot et séparation Ligue/Coupe.', 'Disponible (bêta)'],
  ['Tactique en match', 'Terrain, instructions et rôles modifiables pendant la pause d’un match.', 'Disponible (bêta)'],
  ['Réserve et base de joueurs', 'Jusqu’à 15 joueurs de réserve utilisables hors match, et un moteur de recherche pour consulter tous les joueurs du jeu.', 'Disponible (bêta)'],
  ['Succès expliqués', 'Pop-ups au survol des balles, titres et décorations pour savoir comment les débloquer.', 'Disponible (bêta)'],
  [
    'Mode multijoueur 1 contre 1',
    'Affronter un autre joueur en match 1 contre 1 : votre équipe de sauvegarde contre l’équipe de la sauvegarde d’un autre joueur.',
    'À venir',
  ],
  ['Onglet Entraînement', 'Un onglet dédié pour organiser l’entraînement de l’équipe et de chaque joueur.', 'À venir'],
  ['Création du manager améliorée', 'Plus d’options pour créer et personnaliser son manager.', 'À venir'],
  ['Intégration Twitch', 'Lier le jeu à Twitch (détails à venir).', 'À venir'],
];

/* ===== Console de debug (admin) ===== */
// Historique de la console de débogage.
let DBGH = [],
  DBGI = 0;
// Écrit une ligne dans la console de débogage.
const dbgOut = (t, c) => {
  const o = document.getElementById('dbgo');
  if (!o) return;
  const d = document.createElement('div');
  d.textContent = t;
  if (c) d.style.color = c;
  o.appendChild(d);
  o.scrollTop = o.scrollHeight;
};
// Applique les « triches » de test actives (argent infini, joueurs toujours en forme).
function dbgTick() {
  if (!S) return;
  if (S.dbgInf && S.cash < 9e8) S.cash = 999999999;
  if (S.dbgGod) {
    try {
      me().sq.forEach((p) => {
        p.inj = 0;
        p.e = 100;
        p.mo = 100;
      });
    } catch (e) {}
  }
}
// Joue plusieurs journées automatiquement (pour tester).
function dbgSim(n) {
  let k = 0;
  while (k < n && S.md < S.fx.length) {
    ensureCtx();
    if (V.m && !V.m.done) return k;
    if (V.m && V.m.done) cont();
    startMD0();
    let g = 0;
    while (V.m && !V.m.done && g++ < 400) step();
    if (V.m && V.m.done) cont();
    k++;
  }
  return k;
}
// Liste de toutes les commandes de la console de débogage (help, money, sim…).
const DBGC = {
  help: {
    d: 'Liste des commandes',
    f: () =>
      Object.keys(DBGC)
        .filter((k) => !DBGC[k].h)
        .map((k) => k + ' — ' + DBGC[k].d)
        .join('\n'),
  },
  info: {
    d: 'État de la partie',
    f: () =>
      S
        ? `${me().name} · saison ${S.season} · journée ${S.md}/${S.fx.length} · ${S.cash} crédits · confiance ${S.conf}% · effectif ${me().sq.length} · version ${GV}${S.dbgInf ? ' · argent infini' : ''}`
        : 'Aucune partie en cours.',
  },
  money: {
    d: 'money <n> | inf | off : fixe l’argent, argent infini',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      if (a[0] == 'inf') {
        S.dbgInf = 1;
        S.cash = 999999999;
        return 'Argent infini activé.';
      }
      if (a[0] == 'off') {
        S.dbgInf = 0;
        return 'Argent infini désactivé.';
      }
      const n = +a[0];
      if (isNaN(n)) return 'Usage : money <nombre> | inf | off';
      S.dbgInf = 0;
      S.cash = Math.round(n);
      return 'Argent : ' + S.cash;
    },
  },
  add: {
    d: 'add <n> : ajoute (ou retire) de l’argent',
    f: (a) => {
      const n = +a[0];
      if (!S || isNaN(n)) return 'Usage : add <nombre>';
      S.cash += Math.round(n);
      return 'Argent : ' + S.cash;
    },
  },
  heal: {
    d: 'Soigne, repose et remotive tout l’effectif',
    f: () => {
      if (!S) return 'Aucune partie.';
      me().sq.forEach((p) => {
        p.inj = 0;
        p.e = 100;
        p.mo = 100;
      });
      return 'Effectif soigné.';
    },
  },
  boost: {
    d: 'boost <n> : +n de niveau à tout l’effectif',
    f: (a) => {
      const n = +a[0];
      if (!S || isNaN(n)) return 'Usage : boost <n>';
      me().sq.forEach((p) => (p.o = Math.max(30, Math.min(99, p.o + n))));
      return 'Niveau modifié de ' + n + ' pour tous.';
    },
  },
  ovr: {
    d: 'ovr <nom> <niveau> : fixe le niveau d’un joueur',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      const n = +a[a.length - 1],
        q = a.slice(0, -1).join(' ').toLowerCase(),
        p = me().sq.find((x) => x.n.toLowerCase() == q) || me().sq.find((x) => x.n.toLowerCase().includes(q));
      if (!q || isNaN(n) || !p) return 'Joueur introuvable ou usage : ovr <nom> <niveau>';
      p.o = Math.max(30, Math.min(99, n));
      return p.n + ' : niveau ' + p.o;
    },
  },
  age: {
    d: 'age <n> : vieillit tous les joueurs de n ans',
    f: (a) => {
      const n = +a[0];
      if (!S || isNaN(n)) return 'Usage : age <n>';
      me().sq.forEach((p) => {
        ensure(p);
        p.age += n;
      });
      return 'Effectif vieilli de ' + n + ' an(s).';
    },
  },
  conf: {
    d: 'conf <0-100> : confiance du conseil',
    f: (a) => {
      const n = +a[0];
      if (!S || isNaN(n)) return 'Usage : conf <0-100>';
      S.conf = Math.max(0, Math.min(100, n));
      return 'Confiance : ' + S.conf;
    },
  },
  xp: {
    d: 'xp <n> : expérience du manager',
    f: (a) => {
      const n = +a[0];
      if (!S || isNaN(n)) return 'Usage : xp <n>';
      skXp(n);
      return 'Niveau de manager : ' + skLv();
    },
  },
  day: {
    d: 'day <n> : avance de n jours (max 60)',
    f: (a) => {
      const n = Math.min(60, +a[0] || 0);
      if (!S || n < 1) return 'Usage : day <n>';
      for (let i = 0; i < n; i++) dayTick();
      return n + ' jour(s) écoulé(s).';
    },
  },
  sim: {
    d: 'sim <n> : simule n journées automatiquement',
    f: (a) => {
      const n = Math.max(1, Math.min(60, +a[0] || 1));
      if (!S) return 'Aucune partie.';
      const k = dbgSim(n);
      return (
        k +
        ' journée(s) jouée(s).' +
        (V.m && !V.m.done ? ' Un match est en cours : terminez-le d’abord.' : '')
      );
    },
  },
  season: {
    d: 'Simule la fin de la saison puis passe à la suivante',
    f: () => {
      if (!S) return 'Aucune partie.';
      if (V.m && !V.m.done) return 'Un match est en cours : terminez-le d’abord.';
      dbgSim(99);
      if (S.md >= S.fx.length) {
        newSeason0();
        return 'Nouvelle saison : ' + S.season;
      }
      return 'La saison n’est pas terminée (cup en cours ?).';
    },
  },
  mkt: {
    d: 'Rafraîchit le marché des transferts',
    f: () => {
      if (!S) return 'Aucune partie.';
      S.mkt = mkt();
      return 'Marché rafraîchi (' + S.mkt.length + ' joueurs).';
    },
  },
  youth: {
    d: 'Ajoute des jeunes au centre de formation',
    f: () => {
      if (!S) return 'Aucune partie.';
      const n = acIntake(2, 1).length;
      return n + ' jeune(s) ajouté(s) à l’académie.';
    },
  },
  mail: {
    d: 'mail <texte> : envoie un mail de test',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      mail('Test', a.join(' ') || 'Message de test.');
      return 'Mail envoyé.';
    },
  },
  save: {
    d: 'Sauvegarde la partie',
    f: () => {
      if (!S) return 'Aucune partie.';
      save();
      return 'Partie sauvegardée.';
    },
  },
  reset: {
    d: 'reset confirm : abandonne la partie en cours | reset all : efface aussi toutes les sauvegardes',
    f: (a) => {
      if (a[0] == 'confirm') {
        S = null;
        V.m = null;
        V.menu = 1;
        save();
        render();
        return 'Partie réinitialisée.';
      }
      if (a[0] == 'all' && a[1] == 'confirm') {
        try {
          Object.keys(localStorage)
            .filter((k) => /^gm/.test(k))
            .forEach((k) => localStorage.removeItem(k));
        } catch (e) {}
        S = null;
        V.m = null;
        V.menu = 1;
        render();
        return 'Toutes les données du jeu ont été effacées.';
      }
      return 'Confirmez avec : reset confirm   ou   reset all confirm';
    },
  },
  god: {
    d: 'god | god off : joueurs infatigables, jamais blessés, moral au max',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      S.dbgGod = a[0] == 'off' ? 0 : 1;
      return S.dbgGod ? 'Mode dieu activé.' : 'Mode dieu désactivé.';
    },
  },
  setseason: {
    d: 'setseason <n> : fixe le numéro de saison',
    f: (a) => {
      const n = Math.round(+a[0]);
      if (!S || !(n >= 1)) return 'Usage : setseason <n>';
      S.season = n;
      return 'Saison : ' + n;
    },
  },
  setday: {
    d: 'setday <n> : fixe le jour du calendrier',
    f: (a) => {
      const n = Math.round(+a[0]);
      if (!S || !(n >= 0)) return 'Usage : setday <n>';
      S.day = n;
      return 'Jour : ' + n;
    },
  },
  offer: {
    d: 'Force une offre de transfert pour un de vos joueurs',
    f: () => {
      if (!S) return 'Aucune partie.';
      const n = S.mail.length;
      for (let i = 0; i < 4000 && S.mail.length == n; i++) {
        const m = Math.random;
        Math.random = () => m() * 0.01;
        try {
          genOffer();
        } finally {
          Math.random = m;
        }
      }
      return S.mail.length > n
        ? 'Offre générée (voir la boîte mail).'
        : 'Aucune offre possible (effectif trop réduit ?).';
    },
  },
  export: {
    d: 'Copie la sauvegarde (texte) dans le presse-papiers',
    f: () => {
      if (!S) return 'Aucune partie.';
      const t = ser();
      try {
        navigator.clipboard.writeText(t).catch(() => {});
      } catch (e) {}
      window.dbgLast = t;
      return 'Sauvegarde exportée (' + t.length + ' caractères). Collez-la ailleurs pour la conserver.';
    },
  },
  import: {
    d: 'import <texte> : charge une sauvegarde exportée',
    f: (a) => {
      const t = a.join(' ');
      if (!t) return 'Usage : import <texte exporté>';
      try {
        S = hyd(JSON.parse(t));
        mkSync();
        useT();
        natSyncAll();
        V.m = null;
        V.menu = 0;
        save();
        return 'Sauvegarde importée.';
      } catch (e) {
        return 'Texte invalide : ' + e.message;
      }
    },
  },
  unlock: {
    h: 1,
    d: '',
    f: () => {
      try {
        localStorage.setItem('gm_mk', '1');
      } catch (e) {}
      try {
        mkSync();
      } catch (e) {}
      return 'Drapeau secret activé.';
    },
  },
  lock: {
    h: 1,
    d: '',
    f: () => {
      try {
        localStorage.removeItem('gm_mk');
      } catch (e) {}
      return 'Drapeau secret désactivé (relancez une partie pour le voir pris en compte).';
    },
  },
  give: {
    d: 'give <nom> : ajoute un joueur existant à votre effectif (sans nom : liste les correspondances)',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      const q = slug(a.join(' '));
      if (!q) return 'Usage : give <nom du joueur>';
      const t = me(),
        pool = [];
      const add = (p, src, sq) => {
        if (p && p.n) pool.push({ p, src, sq });
      };
      S.teams.forEach((x) => x.sq.forEach((p) => add(p, x.name, x.sq)));
      if (S.alt && S.alt.teams) S.alt.teams.forEach((x) => x.sq.forEach((p) => add(p, x.name, x.sq)));
      (S.mkt || []).forEach((p) => add(p, 'Marché', S.mkt));
      RARE.forEach((r) =>
        add({ n: r[0], p: r[1], o: r[2], e: 100, f: 75, g: 0, c: 1, rare: 1, og: r[3] }, 'Légende', null),
      );
      PRISM.forEach((r) => {
        const o = { n: r[0], p: r[1], o: r[2], e: 100, f: r[4] || 75, g: 0, c: 0, rare: 1, pr: 1, og: r[3] };
        if (r[5]) {
          o.age = r[5].a;
          o.pt = r[5].pt;
          o.ct = 3;
          o.mp = 0;
        }
        add(o, 'Légende', null);
      });
      let m = pool.filter((x) => slug(x.p.n) == q);
      if (!m.length) m = pool.filter((x) => slug(x.p.n).includes(q));
      const seen = new Set();
      m = m.filter((x) => (seen.has(x.p.n) ? 0 : seen.add(x.p.n)));
      if (!m.length) return 'Aucun joueur nommé « ' + a.join(' ') + ' ».';
      if (m.length > 1)
        return (
          m.length +
          ' correspondances, précisez le nom :\n' +
          m
            .slice(0, 15)
            .map((x) => x.p.n + ' (' + x.p.p + ' ' + x.p.o + ' · ' + x.src + ')')
            .join('\n')
        );
      const x = m[0],
        mine = t.sq.some((y) => y.n == x.p.n);
      if (mine) return x.p.n + ' est déjà dans votre effectif.';
      if (sqN(t) >= 15) return 'Effectif complet (15 joueurs) : libérez une place d’abord.';
      const np = JSON.parse(JSON.stringify(x.p));
      if (x.sq && x.sq !== t.sq && x.sq.length > 9) {
        const i = x.sq.indexOf(x.p);
        if (i >= 0) {
          x.sq.splice(i, 1);
          if (x.sq === S.mkt) {
          } else {
            const tm = S.teams.concat(S.alt && S.alt.teams ? S.alt.teams : []).find((z) => z.sq === x.sq);
            if (tm) autoLU(tm);
          }
        }
      }
      np.inj = 0;
      np.sus = 0;
      np.e = 100;
      np.mo = np.mo || 100;
      t.sq.push(np);
      ensure(np);
      join(np, t);
      autoLU(t);
      save();
      return np.n + ' (' + np.p + ' · niveau ' + np.o + ') rejoint ' + t.name + '.';
    },
  },
  retire: {
    d: 'retire <nom> : fait prendre sa retraite à un joueur de votre effectif (cérémonie d’adieu)',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      const q = a.join(' ').toLowerCase(),
        t = me(),
        p = t.sq.find((x) => x.n.toLowerCase() == q) || t.sq.find((x) => x.n.toLowerCase().includes(q));
      if (!q || !p) return 'Joueur introuvable : retire <nom>';
      if (sqN(t) <= 8) return 'Effectif trop réduit.';
      rtOne(t, p, 1);
      return p.n + ' prend sa retraite.';
    },
  },
  title: {
    d: 'title <clé> : donne un titre d’équipe (champ, cup, inv, att, def, dyn, ret, cos, cc, fan)',
    f: (a) => {
      if (!S) return 'Aucune partie.';
      if (!TTN[a[0]]) return 'Clés : ' + Object.keys(TTN).join(', ');
      addTt(a[0], 'L');
      return 'Titre ajouté.';
    },
  },
  clear: {
    d: 'Vide la console',
    f: () => {
      const o = document.getElementById('dbgo');
      if (o) o.innerHTML = '';
      return '';
    },
  },
  close: {
    d: 'Ferme la console',
    f: () => {
      dbgToggle(0);
      return '';
    },
  },
};
// Exécute une commande tapée dans la console.
function dbgRun(line) {
  const t = line.trim().split(/\s+/),
    c = (t.shift() || '').toLowerCase();
  if (!c) return;
  dbgOut('> ' + line, '#9ad');
  const k = DBGC[c];
  if (!k) {
    dbgOut('Commande inconnue. Tapez help.', '#f88');
    return;
  }
  try {
    const r = k.f(t);
    if (r) dbgOut(r);
    if (c != 'clear' && c != 'close' && c != 'help' && c != 'info') {
      dbgTick();
      try {
        render();
      } catch (e) {}
    }
  } catch (e) {
    dbgOut('Erreur : ' + e.message, '#f88');
  }
}
// Ouvre ou ferme la console.
function dbgToggle(on) {
  let d = document.getElementById('dbg');
  if (!d) {
    d = document.createElement('div');
    d.id = 'dbg';
    d.innerHTML =
      '<div id="dbgo"></div><input id="dbgi" autocomplete="off" spellcheck="false" placeholder="Commande… (help)">';
    document.body.appendChild(d);
    const i = d.querySelector('input');
    i.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key == 'Enter') {
        const v = i.value;
        if (v.trim()) {
          DBGH.push(v);
          DBGI = DBGH.length;
        }
        i.value = '';
        dbgRun(v);
      } else if (e.key == 'ArrowUp') {
        if (DBGI > 0) DBGI--;
        i.value = DBGH[DBGI] || '';
        e.preventDefault();
      } else if (e.key == 'ArrowDown') {
        if (DBGI < DBGH.length) DBGI++;
        i.value = DBGH[DBGI] || '';
        e.preventDefault();
      } else if (e.key == 'Escape' || e.key == '²' || e.key == '`') {
        e.preventDefault();
        dbgToggle(0);
      }
    });
    dbgOut('Console de debug — tapez help pour la liste des commandes.', '#7f7');
  }
  if (on === undefined) {
    d.style.display = d.style.display == 'flex' ? 'none' : 'flex';
  } else d.style.display = on ? 'flex' : 'none';
  if (d.style.display == 'flex') setTimeout(() => d.querySelector('input').focus(), 30);
}
addEventListener(
  'keydown',
  (e) => {
    if (
      (e.key == '²' || e.key == '`' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == 'd')) &&
      !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')
    ) {
      e.preventDefault();
      dbgToggle();
    }
  },
  true,
);

/* ===== Retours (bugs / idées) & infos sauvegardes ===== */

// ======================================================================
// SIGNALER UN BUG OU UNE IDÉE
// ======================================================================
// Adresse du dépôt GitHub pour les retours (laisser vide : détectée automatiquement sur GitHub
// Pages).
const FBX = '';
// Garde les dernières erreurs de la page, jointes aux rapports de bug.
const JERR = [];
addEventListener('error', (e) => {
  JERR.push(String(e.message || '').slice(0, 120));
  if (JERR.length > 3) JERR.shift();
});
// Trouve le dépôt GitHub où envoyer les retours.
function fbRepo() {
  if (FBX) return FBX;
  const m = location.hostname.match(/^([^.]+)\.github\.io$/),
    p = location.pathname.split('/')[1];
  return m && p ? m[1] + '/' + p : '';
}
// Prépare le titre et le texte du rapport (avec version, écran, dernières erreurs).
function fbText() {
  const t = V.fbt || 'Bug',
    inf = V.fbi !== 0,
    L = [(V.fbm || '').trim() || '(décrivez ici le problème ou l’idée)'];
  if (inf) {
    let g = 'aucune partie en cours';
    try {
      if (S)
        g =
          me().name +
          ' · saison ' +
          S.season +
          ' · journée ' +
          (S.md + 1) +
          '/' +
          S.fx.length +
          ' · mode ' +
          (S.mode || 'L');
    } catch (e) {}
    L.push(
      '',
      '---',
      'Version du jeu : ' + GV + ' (sauvegarde v' + DV + ')',
      'Partie : ' + g,
      'Écran : ' + innerWidth + '×' + innerHeight,
      'Navigateur : ' + navigator.userAgent.slice(0, 140),
    );
    if (JERR.length) L.push('Erreurs récentes : ' + JERR.join(' | '));
  }
  return { title: '[' + t + '] ', body: L.join('\n') };
}
// Ouvre la page GitHub « Nouvelle issue » préremplie.
function fbGo() {
  const r = fbRepo(),
    x = fbText();
  if (!r) return;
  window.open(
    'https://github.com/' +
      r +
      '/issues/new?title=' +
      encodeURIComponent(x.title + (V.fbm || '').trim().slice(0, 60)) +
      '&body=' +
      encodeURIComponent(x.body),
    '_blank',
    'noopener',
  );
}
// Copie le rapport dans le presse-papiers.
function fbCopy() {
  const x = fbText(),
    t = x.title + '\n\n' + x.body,
    e = document.getElementById('fbs');
  const ok = () => {
      if (e) e.textContent = 'Rapport copié.';
    },
    ko = () => {
      if (e) e.textContent = 'Copie impossible : sélectionnez le texte manuellement.';
    };
  try {
    navigator.clipboard.writeText(t).then(ok, () => {
      const a = document.createElement('textarea');
      a.value = t;
      document.body.appendChild(a);
      a.select();
      try {
        document.execCommand('copy') ? ok() : ko();
      } catch (z) {
        ko();
      }
      a.remove();
    });
  } catch (z) {
    ko();
  }
}
// Fenêtre « Signaler un bug / une idée ».
function fbBox() {
  if (!V.fb) return '';
  const r = fbRepo();
  return `<div style="position:fixed;inset:0;background:#0008;z-index:75;display:flex;align-items:center;justify-content:center;padding:12px" onclick="V.fb=0;render()"><div class="card" style="max-width:460px;width:100%;max-height:90vh;overflow:auto" onclick="event.stopPropagation()"><b style="font-size:17px">💬 Signaler un bug / une idée</b>${hp('m_fb')}<div class="mu" style="margin:4px 0 8px">Merci de participer à la bêta ! Décrivez ce que vous avez vu ou ce que vous aimeriez.</div><div class="ctl"><label>Type <select onchange="V.fbt=this.value"><option ${V.fbt == 'Bug' || !V.fbt ? 'selected' : ''}>Bug</option><option ${V.fbt == 'Idée' ? 'selected' : ''}>Idée</option><option ${V.fbt == 'Autre' ? 'selected' : ''}>Autre</option></select></label></div><textarea rows="6" style="width:100%;box-sizing:border-box;margin:8px 0;padding:8px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx);font:inherit" placeholder="Que s’est-il passé ? Que faisiez-vous juste avant ?" oninput="V.fbm=this.value">${(V.fbm || '').replace(/</g, '&lt;')}</textarea><label class="mu" style="display:block;margin-bottom:8px"><input type="checkbox" ${V.fbi !== 0 ? 'checked' : ''} onchange="V.fbi=this.checked?1:0"> Joindre les infos techniques (version du jeu, navigateur, club et journée en cours)</label><div class="ctl">${r ? '<button class="p" onclick="fbGo()">Envoyer sur GitHub</button>' : ''}<button ${r ? '' : 'class="p"'} onclick="fbCopy()">Copier le rapport</button><button onclick="V.fb=0;render()">Fermer</button></div><div class="mu" id="fbs" style="margin-top:6px">${r ? 'GitHub ouvre un ticket prérempli (compte GitHub requis). Sinon, copiez le rapport et envoyez-le à l’organisateur.' : 'Copiez le rapport puis envoyez-le à l’organisateur de la bêta.'}</div></div></div>`;
}
// Résumé des sauvegardes (nombre d'emplacements, versions anciennes ou trop récentes).
function svInfo() {
  let n = 0,
    o = 0,
    w = 0;
  try {
    SL.forEach((k) => {
      const m = slotMeta(k);
      if (m) {
        n++;
        if ((m.dv || 0) > DV) w++;
        else if ((m.dv || 0) < DV) o++;
      }
    });
  } catch (e) {}
  return `<div class="card" style="border-color:var(--ac)"><b>💾 Avant de commencer : vos sauvegardes</b>${hp('sv_info')}<ul style="margin:6px 0 8px 18px;padding:0;line-height:1.55"><li>Votre partie est <b>sauvegardée automatiquement dans ce navigateur</b>, sur cet appareil. Rien n’est envoyé en ligne.</li><li>Changer de navigateur ou d’appareil, ou vider les données du site, <b>efface les parties</b> : pensez à <b>Exporter</b> un fichier de sauvegarde.</li><li>Version du jeu : <b>${GV}</b>. Les anciennes sauvegardes sont adaptées automatiquement ; une sauvegarde créée par une <b>version plus récente</b> ne peut pas être chargée. Le jeu est en bêta : exportez avant chaque mise à jour.</li></ul><div class="ctl"><span class="mu">${n ? n + ' sauvegarde' + (n > 1 ? 's' : '') + ' existante' + (n > 1 ? 's' : '') + (o ? ' · ' + o + ' à adapter' : '') + (w ? ' · <b style="color:#e0457b">' + w + ' trop récente' + (w > 1 ? 's' : '') + '</b>' : '') : 'Aucune sauvegarde pour l’instant.'}</span><button onclick="V.sv=1;render()">Gérer mes sauvegardes</button></div></div>`;
}

/* ===== Statistiques, classements & académie ===== */

// ======================================================================
// STATISTIQUES, CLASSEMENTS ET ACADÉMIE
// ======================================================================
// Accès aux statistiques enregistrées (par compétition : journal des matchs, saisons passées).
const stK = (c) => {
  c = c || S.ctx;
  S.stt = S.stt || {};
  return (S.stt[c] = S.stt[c] || { log: [], se: [], hs: [] });
};
// Accès aux statistiques d'un joueur (buts, passes, arrêts…).
const stP = (p) => (p.ss = p.ss || { a: 0, sv: 0, sh: 0, ot: 0, ga: 0, cs: 0, mm: 0 });
// Après un match : enregistre toutes les statistiques (buts, passes, tirs, possession, fautes).
function stPost(M) {
  try {
    if (M.ab || M.cup || !M.t || !M.lg) return;
    const T2 = M.t,
      pts = new Map(),
      pt = (p, k) => {
        const o = pts.get(p) || { g: 0, a: 0, sv: 0, cs: 0 };
        o[k]++;
        pts.set(p, o);
      },
      gkOf = (t) => {
        const i = t.lu.find((k) => t.sq[k] && t.sq[k].p == 'GK');
        return i != null ? t.sq[i] : null;
      },
      find = (n, s) => {
        for (const k of [s, 1 - s]) {
          const q = T2[k].sq.find((p) => p && p.n == n);
          if (q) return [k, q];
        }
        return [-1, null];
      };
    M.lg.forEach((l) => {
      let m;
      if ((m = l.match(/BUT (?:sur penalty |sur coup franc )?! (.+?)<\/b> \((.+?)\)/))) {
        const op = /BUT !/.test(l);
        const s = T2.findIndex((t) => t.name == m[2]);
        if (s < 0) return;
        const p = T2[s].sq.find((q) => q && q.n == m[1]);
        if (!p) return;
        const o = stP(p);
        o.sh++;
        o.ot++;
        pt(p, 'g');
        if (op && Math.random() < 0.78) {
          const t = T2[s],
            sl = slots(t.form),
            w = t.lu.map((li, k) =>
              t.sq[li] === p ? 0 : sl[k] == 'MID' ? 3 : sl[k] == 'ATT' ? 2.2 : sl[k] == 'DEF' ? 0.7 : 0,
            ),
            tot = w.reduce((x, y) => x + y, 0);
          if (tot > 0) {
            let r = Math.random() * tot,
              k = 0;
            while ((r -= w[k]) > 0 && k < w.length - 1) k++;
            const ap = t.sq[t.lu[k]];
            if (ap) {
              stP(ap).a++;
              pt(ap, 'a');
            }
          }
        }
      } else if ((m = l.match(/Arrêt du gardien devant (.+)$/))) {
        const [s, p] = find(m[1], 0);
        if (!p) return;
        const o = stP(p);
        o.sh++;
        o.ot++;
        const g = gkOf(T2[1 - s]);
        if (g) {
          stP(g).sv++;
          pt(g, 'sv');
        }
      } else if ((m = l.match(/’ (.+) tire à côté$/))) {
        const [s, p] = find(m[1], 0);
        if (p) stP(p).sh++;
      }
    });
    [0, 1].forEach((s) => {
      const g = gkOf(T2[s]);
      if (g) {
        const o = stP(g);
        o.ga += M.sc[1 - s];
        if (M.sc[1 - s] == 0) {
          o.cs++;
          pt(g, 'cs');
        }
      }
    });
    let best = null,
      bs = -1;
    pts.forEach((o, p) => {
      const si = T2.findIndex((t) => t.sq.includes(p)),
        w = si >= 0 && M.sc[si] > M.sc[1 - si] ? 1.5 : si >= 0 && M.sc[si] == M.sc[1 - si] ? 0.5 : 0,
        v = o.g * 3 + o.a * 2 + o.sv * 0.5 + o.cs * 1.5 + w + Math.random() * 0.3;
      if (v > bs) {
        bs = v;
        best = p;
      }
    });
    if (best) stP(best).mm++;
    // Note de match de chaque titulaire (pour « Perfs récentes » de la fiche joueur).
    const RT = [[], []];
    T2.forEach((t, s) => {
      const w = M.sc[s] > M.sc[1 - s] ? 0.5 : M.sc[s] < M.sc[1 - s] ? -0.5 : 0;
      const xo = t == me() ? M.xo || [] : [],
        l0 = t == me() ? M.l0 : null,
        who = t.lu
          .map((li) => t.sq[li])
          .concat(xo.map((n) => t.sq.find((q) => q && q.n == n)))
          .filter((q, k, a) => q && a.indexOf(q) == k);
      who.forEach((p) => {
        const fl = xo.includes(p.n) && !t.lu.some((li) => t.sq[li] === p) ? 2 : l0 && !l0.includes(p.n) ? 1 : 0,
          o = pts.get(p) || { g: 0, a: 0, sv: 0, cs: 0 },
          v0 =
            6 + w + o.g + o.a * 0.6 + o.sv * 0.25 + (o.cs ? 0.6 : 0) + (p === best ? 0.7 : 0) + (Math.random() - 0.5) * 0.8 -
            (p.p == 'GK' || p.p == 'DEF' ? Math.max(0, M.sc[1 - s] - 1) * 0.2 : 0),
          v = fl ? 6 + (v0 - 6) * 0.8 : v0;
        (p.rp = p.rp || []).push(Math.round(Math.max(3, Math.min(10, v)) * 10) / 10);
        RT[s].push([p.n, p.p, p.rp[p.rp.length - 1], o.g, o.a, fl]);
        if (p.rp.length > 5) p.rp.shift();
      });
    });
    M.rt = RT;
    M.mmn = best ? best.n : null;
    [0, 1].forEach((s) => {
      const t = T2[s],
        ts = (t.ts = t.ts || { n: 0, sh: 0, ot: 0, ps: 0, po: 0, fa: 0 }),
        st = M.st,
        tp = st.poss[0] + st.poss[1] || 1;
      ts.n++;
      ts.sh += st.tir[s];
      ts.ot += st.cad[s];
      ts.ps += st.pas[s];
      ts.po += (100 * st.poss[s]) / tp;
      ts.fa += st.fau[s];
    });
    const i = T2.indexOf(me());
    if (i >= 0) {
      const K = stK(),
        st = M.st,
        tp = st.poss[0] + st.poss[1] || 1;
      K.log.push({
        s: S.season,
        d: S.md + 1,
        o: T2[1 - i].name,
        h: i == 0 ? 1 : 0,
        g: M.sc[i],
        c: M.sc[1 - i],
        cash: S.cash,
        rk: stdg(grpOf(me())).indexOf(me()) + 1,
        sh: st.tir[i],
        ot: st.cad[i],
        po: Math.round((100 * st.poss[i]) / tp),
        pa: st.pas[i],
      });
      if (K.log.length > 600) K.log.shift();
      // RAPPORT DE MATCH : détail conservé pour le calendrier (saison en cours).
      const ev = [];
      M.lg.forEach((l) => {
        const m = /^(\d+)’ (.*)$/.exec(String(l));
        if (!m) return;
        const x = m[2].replace(/<[^>]+>/g, '').replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '').trim();
        const t = /BUT/.test(x) ? 'g' : /Exclusion de 5/.test(x) ? 'r' : /^Penalty pour|Penalty arrêté|rate son penalty/.test(x) ? 'p' : /[✨🌀]/u.test(m[2]) ? 'f' : 0;
        if (t) ev.push([+m[1], t, x]);
      });
      S.mrp = S.mrp || {};
      S.mrp[S.md] = {
        n: [T2[0].name, T2[1].name],
        em: [T2[0].em, T2[1].em],
        sc: M.sc.slice(),
        me: i,
        day: S.day,
        st: { tir: st.tir.slice(), cad: st.cad.slice(), po: [Math.round((100 * st.poss[0]) / tp), 100 - Math.round((100 * st.poss[0]) / tp)], pas: st.pas.slice(), fau: st.fau.slice() },
        ev,
        rt: RT,
        mm: best ? best.n : '',
      };
    }
  } catch (e) {}
}
// Fin de saison : archive les statistiques de la saison dans l'historique.
function stRoll() {
  try {
    const roll = (teams, K, mine, cx, X) => {
      const ps = [];
      teams.forEach((t) => (t.sq || []).filter(Boolean).forEach((p) => ps.push([p, t])));
      const top = (f) => {
        let b = null,
          v = 0;
        ps.forEach(([p, t]) => {
          const x = f(p);
          if (x > v) {
            v = x;
            b = [p.n, t.name, x];
          }
        });
        return b;
      };
      K.hs.push({
        s: S.season,
        g: top((p) => p.g || 0),
        a: top((p) => (p.ss || {}).a || 0),
        sv: top((p) => (p.p == 'GK' ? (p.ss || {}).sv || 0 : 0)),
      });
      if (K.hs.length > 40) K.hs.shift();
      if (mine) {
        const t = mine;
        K.se.push({
          s: S.season,
          rk:
            stdg(
              t.g != null && S.ctx == 'C' && teams === S.teams ? teams.filter((x) => x.g === t.g) : teams,
            ).indexOf(t) + 1,
          pts: t.pts,
          w: t.w,
          d: t.d,
          l: t.l,
          gf: t.gf,
          ga: t.ga,
          cash: S.cash,
        });
      }
      try {
        rwSeason(teams, K, mine, cx, X);
      } catch (e) {}
      ps.forEach(([p]) => {
        if (p.ss || p.g) {
          const c = (p.cr = p.cr || { g: 0, a: 0, sv: 0, sh: 0, ot: 0, ga: 0, cs: 0, mm: 0 }),
            o = p.ss || {};
          c.g += p.g || 0;
          ['a', 'sv', 'sh', 'ot', 'ga', 'cs', 'mm'].forEach((k) => (c[k] += o[k] || 0));
          p.ss = null;
        }
      });
      teams.forEach((t) => {
        t.ts = null;
      });
    };
    roll(S.teams, stK(), me(), S.ctx, S);
    if (S.alt && S.alt.teams && S.mode == 'D')
      roll(S.alt.teams, stK(S.ctx == 'C' ? 'L' : 'C'), S.alt.teams[S.alt.t], S.ctx == 'C' ? 'L' : 'C', S.alt);
  } catch (e) {}
}
// Catégories des classements (buteurs, passeurs, buts + passes, arrêts, clean sheets).
const RKC = [
  ['g', '⚽ Buteurs'],
  ['a', '🎯 Passeurs'],
  ['ga', '🔥 Buts + passes'],
  ['sv', '🧤 Arrêts'],
  ['cs', '🛡 Clean sheets'],
  ['mm', '⭐ Hommes du match'],
  ['tm', '📊 Équipes'],
];
// Valeur d'un joueur pour une catégorie de classement.
const rkV = (p, k) => {
  const o = p.ss || {};
  return k == 'g' ? p.g || 0 : k == 'ga' ? (p.g || 0) + (o.a || 0) : k == 'ex' ? (o.ex || 0) + (o.yc || 0) + (o.rc || 0) : o[k] || 0;
};
// ===== ÉQUIPE : sous-onglets (effectif, rapports, stats, composition) =====
const EQT = [
  ['liste', 'Équipe'],
  ['rap', 'Rapports'],
  ['stt', 'Stats'],
  ['plan', 'Planificateur'],
  ['perso', 'Personnalisation'],
];
const EQPC = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' },
  EQPO = { GK: 0, DEF: 1, MID: 2, ATT: 3 };
// Barre des sous-onglets.
const eqSub = () =>
  `<div class="eqnav" role="tablist">${EQT.map(([k, l]) => `<button role="tab" class="${(V.eq || 'liste') == k ? 'on' : ''}" onclick="V.eq='${k}';render()">${l}</button>`).join('')}</div>`;
// Pastille de note (couleur selon le niveau).
const nbg = (v) => `<span class="nbg ${v >= 75 ? 'g1' : v >= 62 ? 'g2' : v >= 50 ? 'g3' : 'g4'}">${v}</span>`;
const eqPos = (p) => `<b class="eqp" style="color:${EQPC[p.p] || '#888'}">${p.p}</b>`;
const eqAvg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0);
const eqMo = (p) => p.mo ?? 60;
// Infos d'un joueur : blessure, suspension, prêt…
function eqInf(p) {
  const t = [];
  if (p.inj) t.push(`<span class="eqtg bad">Blessé ${p.inj}</span>`);
  if (p.sus) t.push(`<span class="eqtg bad">Susp. ${p.sus}</span>`);
  if (p.ln) t.push(`<span class="eqtg">Prêt ${p.ln.left}</span>`);
  if (p.nz) t.push(`<span class="eqtg warn">Nausées</span>`);
  if (p.rc) t.push(`<span class="eqtg" title="Reconversion en cours">→ ${p.rc.to}</span>`);
  return t.join('') || '<span class="mu">—</span>';
}
// Colonnes des trois vues du tableau.
function eqCols(v, t) {
  const st = (p) => p.ss || {},
    bar = (x) => gg(x, { size: 42, fs: 34, c: '#2fd0c5', tt: 'Condition : ' + x + ' %' }),
    mo = (p) => {
      const m = eqMo(p);
      return gg(m, { size: 42, fs: 34, tt: 'Moral à ' + m + ' %' });
    };
  if (v == 'att')
    return [
      ['p', 'Pos', (p) => EQPO[p.p], (p) => eqPos(p)],
      ['n', 'Joueur', (p) => p.n, (p) => `<span class="eqn">${p.n}</span>`],
      ['o', 'Note', (p) => p.o, (p) => nbg(p.o)],
      ...AT.map((a, k) => [
        'a' + k,
        a.slice(0, 4) + '.',
        (p) => attrs(p)[k],
        (p) => `<span class="eqa a${Math.min(4, Math.floor(attrs(p)[k] / 5))}">${attrs(p)[k]}</span>`,
        (p) => (p.p == 'GK' && k == 1 ? 'Réflexes' : a),
      ]),
    ];
  if (v == 'sai')
    return [
      ['p', 'Pos', (p) => EQPO[p.p], (p) => eqPos(p)],
      ['n', 'Joueur', (p) => p.n, (p) => `<span class="eqn">${p.n}</span>`],
      ['o', 'Note', (p) => p.o, (p) => nbg(p.o)],
      ['mp', 'Matchs', (p) => p.mp || 0, (p) => p.mp || 0],
      ['g', 'Buts', (p) => p.g || 0, (p) => p.g || 0],
      ['a', 'Passes déc.', (p) => st(p).a || 0, (p) => st(p).a || 0],
      ['sv', 'Arrêts', (p) => st(p).sv || 0, (p) => (p.p == 'GK' ? st(p).sv || 0 : '—')],
      ['mm', 'Homme du match', (p) => st(p).mm || 0, (p) => st(p).mm || 0],
      ['ex', 'Exclusions', (p) => (st(p).ex || 0) + (st(p).yc || 0) + (st(p).rc || 0), (p) => (st(p).ex || 0) + (st(p).yc || 0) + (st(p).rc || 0)],
    ];
  return [
    ['p', 'Pos', (p) => EQPO[p.p], (p) => eqPos(p)],
    ['num', 'N°', (p) => pnum(t, p), (p) => pnum(t, p)],
    ['n', 'Joueur', (p) => p.n, (p) => `<span class="eqn">${p.c ? '★ ' : ''}${p.n}</span>`],
    ['o', 'Note', (p) => p.o, (p) => nbg(p.o)],
    ['pt', 'Potentiel', (p) => (p.pt && p.age <= PTA ? p.pt : 0), (p) => (p.pt && p.age <= PTA ? nbg(p.pt) : '<span class="mu">—</span>')],
    ['inf', 'Infos', (p) => (p.inj || 0) + (p.sus || 0), (p) => eqInf(p)],
    ['age', 'Âge', (p) => p.age, (p) => p.age],
    ['val', 'Valeur', (p) => price(p), (p) => price(p) + ' cr.'],
    ['e', 'Condition', (p) => p.e ?? 100, (p) => bar(p.e ?? 100)],
    ['xp', 'Exp.', (p) => (p.o >= ptCap(p) ? 100 : p.xp || 0), (p) => xpB(p) || '<span class="mu">—</span>'],
    ['mo', 'Moral', (p) => eqMo(p), (p) => mo(p)],
    ['f', 'Fluide', (p) => p.f || 0, (p) => (fluK(p) == 'none' ? '<span class="mu" title="Aucun Fluide">—</span>' : `<span class="eqfg">${gg(p.f || 0, { size: 42, fs: 34, c: p.nz ? '#ff8a2b' : '#b78bff', tt: p.nz ? 'Nausées du Fluide : ' + (p.f || 0) + ' %' : 'Fluide : ' + (p.f || 0) + ' %' })}${p.nz ? '<i title="Nausées">🤢</i>' : ''}</span>`)],
  ];
}
// Sous-onglet « Équipe » : tableau de l'effectif + panneau d'informations.
function eqList(t) {
  t.sq.forEach(ensure);
  const v = V.eqv || 'gen',
    f = V.eqf || 'all',
    lu = new Set(t.lu),
    cols = eqCols(v, t),
    s = V.eqs && cols.some((c) => c[0] == V.eqs.k) ? V.eqs : { k: 'o', d: -1 },
    col = cols.find((c) => c[0] == s.k) || cols[0];
  let L = t.sq.map((p, i) => [p, i]);
  if (f == 'st') L = L.filter(([, i]) => lu.has(i));
  if (f == 'bn') L = L.filter(([p, i]) => !lu.has(i) && !p.rv);
  if (f == 'rv') L = L.filter(([p]) => p.rv);
  const LT = new Map();
  if (f == 'ln') {
    // Joueurs empruntés (dans notre effectif) + joueurs que nous avons prêtés (ils sont dans l'effectif d'un autre club).
    L = L.filter(([p]) => p.ln);
    S.teams.forEach((x, ti) => {
      if (x === t) return;
      x.sq.forEach((p) => {
        if (p.ln && p.ln.own == S.t) {
          ensure(p);
          LT.set(p, x.name);
          L.push([p, 'T' + ti + '|' + p.n]);
        }
      });
    });
  }
  L.sort((a, b) => {
    const x = col[2](a[0]),
      y = col[2](b[0]);
    return (typeof x == 'string' ? x.localeCompare(y) : x - y) * s.d || b[0].o - a[0].o;
  });
  const th = cols
      .map(
        (c) =>
          `<th class="${s.k == c[0] ? 'on' : ''}" ${c[4] ? `title="${c[4](t.sq[0])}"` : ''} onclick="V.eqs={k:'${c[0]}',d:${s.k == c[0] ? -s.d : c[0] == 'n' || c[0] == 'p' ? 1 : -1}};render()">${c[1]}${s.k == c[0] ? (s.d > 0 ? ' ▴' : ' ▾') : ''}</th>`,
      )
      .join(''),
    rows = L.map(
      ([p, i]) =>
        `<tr class="${lu.has(i) ? 'st' : p.rv ? 'rvr' : ''}" ${typeof i == 'string' ? `data-k="${i.replace(/"/g, '&quot;')}" onclick="prof('lt',this.dataset.k)"` : `onclick="prof('sq',${i})"`} title="Ouvrir le profil">${cols.map((c) => `<td class="c-${c[0]}">${c[3](p)}${c[0] == 'n' && LT.has(p) ? ` <span class="mu">(prêté à ${LT.get(p)} · reste ${p.ln.left})</span>` : ''}</td>`).join('')}</tr>`,
    ).join(''),
    tabs = [
      ['all', 'Effectif'],
      ['st', 'Titulaires'],
      ['bn', 'Remplaçants'],
      ['rv', 'Réserve'],
      ['ln', 'Prêtés'],
    ]
      .map(([k, l]) => `<button class="${f == k ? 'on' : ''}" onclick="V.eqf='${k}';render()">${l}</button>`)
      .join(''),
    vues = [
      ['gen', 'Général'],
      ['att', 'Attributs'],
      ['sai', 'Saison'],
    ]
      .map(([k, l]) => `<option value="${k}" ${v == k ? 'selected' : ''}>${l}</option>`)
      .join('');
  return `<div class="eqw"><div class="card eqc"><div class="eqtop"><div class="eqseg">${tabs}</div><b>${L.length} joueur${L.length > 1 ? 's' : ''}</b>${hp('eqt')}<label class="eqvw">Vue <select onchange="V.eqv=this.value;V.eqs=null;render()">${vues}</select></label></div><div class="eqsc"><table class="eqt"><thead><tr>${th}</tr></thead><tbody>${rows || `<tr><td colspan="${cols.length}" class="mu" style="text-align:center;padding:18px">Aucun joueur dans cette liste.</td></tr>`}</tbody></table></div></div>${eqSide(t)}</div>`;
}
// Panneau « Informations sur l'équipe ».
function eqSide(t) {
  const S0 = t.sq,
    top = (f) => {
      let b = null,
        v = 0;
      S0.forEach((p) => {
        const x = f(p);
        if (x > v) {
          v = x;
          b = p;
        }
      });
      return b ? `<span class="eqn">${b.n}</span><b>${v}</b>` : `<span class="mu">—</span><b>0</b>`;
    },
    sm = (f) => S0.reduce((s, p) => s + f(p), 0),
    cell = (l, v) => `<div class="eqk"><span>${l}</span><b>${v}</b></div>`,
    cnt = (p) => S0.filter((x) => x.p == p).length,
    ss = (p) => p.ss || {};
  return `<div class="card eqs"><b>Informations sur l’équipe</b>${hp('eqi')}
<div class="eqsec"><h4>Aperçu</h4><div class="eqk4">${cell('Note moyenne', nbg(eqAvg(S0.map((p) => p.o))))}${cell('Composition de départ', nbg(eqAvg(t.lu.map((i) => (S0[i] || {}).o || 0))))}${cell('Âge moyen', eqAvg(S0.map((p) => p.age || 0)))}${cell('Valeur', sm(price) + ' cr.')}</div></div>
<div class="eqsec"><h4>Statut de l’équipe</h4><div class="eqk4">${cell('Blessés', S0.filter((p) => p.inj).length)}${cell('Suspendus', S0.filter((p) => p.sus).length)}${cell('Faible condition', S0.filter((p) => (p.e ?? 100) < 40).length)}${cell('Moral bas', S0.filter((p) => eqMo(p) < 40).length)}</div></div>
<div class="eqsec"><h4>Profondeur de position</h4><div class="eqk4">${['GK', 'DEF', 'MID', 'ATT'].map((p) => `<div class="eqk"><span style="color:${EQPC[p]}">${p}</span><b>${cnt(p)}</b></div>`).join('')}</div></div>
<div class="eqsec"><h4>Stats</h4><div class="eqst"><div><span>Buts</span>${top((p) => p.g || 0)}</div><div><span>Passes décisives</span>${top((p) => ss(p).a || 0)}</div><div><span>Homme du match</span>${top((p) => ss(p).mm || 0)}</div><div><span>Exclusions</span><span class="mu"></span><b>${sm((p) => (ss(p).ex || 0) + (ss(p).yc || 0) + (ss(p).rc || 0))}</b></div></div></div></div>`;
}
// ===== PRÉRÉGLAGES : jusqu'à 5 compositions enregistrées (formation, titulaires, consignes) =====
const PRK = ['form', 'lu', 'm', 'pr', 'sty', 'ti', 'fo'],
  PRN = 5;
// Enregistre la composition actuelle dans l'emplacement i.
function preSave(i) {
  const t = me(),
    o = {};
  t.pre = t.pre || [];
  PRK.forEach((k) => {
    if (t[k] !== undefined) o[k] = JSON.parse(JSON.stringify(t[k]));
  });
  // On retient aussi les NOMS des titulaires : les numéros changent dès que l'effectif bouge (transfert, prêt, réserve).
  o.ln = (t.lu || []).map((ix) => (t.sq[ix] ? t.sq[ix].n : null));
  t.pre[i] = { n: (t.pre[i] && t.pre[i].n) || 'Préréglage ' + (i + 1), s: o };
  save();
  render();
}
// Charge le préréglage i (impossible une fois le match commencé).
function preLoad(i) {
  const t = me(),
    r = t.pre && t.pre[i];
  if (!r || (V.m && V.m.min > 0 && !V.m.done)) return;
  PRK.forEach((k) => {
    if (r.s[k] !== undefined) t[k] = JSON.parse(JSON.stringify(r.s[k]));
    else if (k == 'ti' || k == 'fo') delete t[k];
  });
  if (!FORM[t.form]) t.form = '2-3-1';
  if (t.fs && !FORM[t.fs]) delete t.fs;
  const n = slots(t.form).length;
  // Retrouve les titulaires par leur nom (et non par leur ancien numéro, qui a pu changer).
  let miss = false;
  if (Array.isArray(r.s.ln) && r.s.ln.length == n) {
    const ix = r.s.ln.map((nm) => t.sq.findIndex((p) => p.n === nm && !p.rv));
    if (ix.some((x) => x < 0)) miss = true;
    else t.lu = ix;
  } else if (t.lu && t.lu.length == n) {
    // Ancien préréglage sans noms : s'il ne place pas un gardien au but, ses numéros ne sont plus fiables.
    const g = t.sq[t.lu[0]];
    if (!g || g.p != 'GK') miss = true;
  }
  if (miss || !t.lu || t.lu.length != n || new Set(t.lu).size != n || t.lu.some((ix) => !t.sq[ix] || t.sq[ix].rv || t.sq[ix].inj || t.sq[ix].sus)) {
    autoLU(t);
    swMsg('Des joueurs du préréglage sont indisponibles : composition complétée automatiquement.');
  }
  const h = swH();
  h.u.length = 0;
  h.r.length = 0;
  V.sel = null;
  save();
  render();
}
// Efface le préréglage i.
function preDel(i) {
  const t = me();
  if (t.pre) t.pre[i] = null;
  save();
  render();
}
// Renomme le préréglage i.
function preName(i, v) {
  const t = me();
  if (t.pre && t.pre[i]) {
    t.pre[i].n = String(v).trim().slice(0, 24) || 'Préréglage ' + (i + 1);
    save();
  }
}
// Vrai si la composition actuelle correspond au préréglage r.
const preOn = (t, r) => !!r && r.s.form == t.form && JSON.stringify(r.s.lu) == JSON.stringify(t.lu);
// Encadré « Préréglages » du Planificateur.
function prePanel(t) {
  const L = t.pre || [],
    rows = Array.from({ length: PRN }, (_, i) => {
      const r = L[i];
      return `<div class="prr ${preOn(t, r) ? 'on' : ''}"><span class="prn">${i + 1}</span>${r ? `<input value="${r.n.replace(/"/g, '&quot;')}" maxlength="24" onchange="preName(${i},this.value)" aria-label="Nom du préréglage"><span class="mu">${r.s.form}</span><button onclick="preLoad(${i})">Charger</button><button onclick="preSave(${i})" title="Remplacer par la composition actuelle">Mettre à jour</button><button onclick="preDel(${i})" aria-label="Supprimer">✕</button>` : `<span class="mu" style="flex:1">Emplacement libre</span><button class="p" onclick="preSave(${i})">Enregistrer la composition actuelle</button>`}</div>`;
    }).join('');
  return `<div class="card plc"><b>Préréglages</b>${hp('pre')}<div class="mu" style="margin:4px 0 8px">Enregistrez jusqu’à ${PRN} compositions (formation, titulaires, mentalité et consignes), puis choisissez-en une avant le coup d’envoi.</div>${rows}</div>`;
}
// Sélecteur de préréglage affiché avant le coup d'envoi.
function preBar(t) {
  const L = (t.pre || []).map((r, i) => [r, i]).filter(([r]) => r);
  return `<div class="card prb"><b>Préréglage de composition</b>${hp('pre')}<div class="ctl" style="margin-top:6px">${L.length ? L.map(([r, i]) => `<button class="${preOn(t, r) ? 'p' : ''}" onclick="preLoad(${i})">${r.n} <span class="mu">${r.s.form}</span></button>`).join('') : '<span class="mu">Aucun préréglage enregistré : créez-en dans Équipe › Planificateur.</span>'}</div></div>`;
}
// Grande carte rectangulaire d'un joueur (portrait à gauche, infos à droite).
function eqWide(p, i, t) {
  const u = phUrl(p),
    col = EQPC[p.p] || '#888';
  return `<div class="pc pcw ${p.pr ? 'prs' : p.c ? 'chr' : ''}" style="border-top:4px solid ${col}" onclick="prof('sq',${i})"><span class="pci" role="button" aria-label="Voir le profil" title="Voir le profil du joueur" onclick="event.stopPropagation();prof('sq',${i})">i</span><div class="pcwp" style="${u ? `background-position:center 20%;background-image:linear-gradient(90deg,transparent 60%,var(--card)),url('${u}')` : ''}">${u ? '' : '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12" fill="currentColor"/><path d="M8 62c2-18 12-26 24-26s22 8 24 26z" fill="currentColor"/></svg>'}</div><div class="pcwi"><b class="pcwn">${p.n}</b><span class="mu">${t.name}</span><div class="pcwk"><div><span>Âge</span><b>${p.age}</b></div><div><span>Note</span>${nbg(p.o)}</div><div><span>Pos</span>${eqPos(p)}</div></div></div></div>`;
}
// Mini schéma d'une formation (points).
function eqMini(f) {
  let d = '';
  FORM[f].forEach((n, r) => {
    for (let j = 0; j < n; j++) d += `<circle cx="${(((j + 1) * 60) / (n + 1)).toFixed(1)}" cy="${50 - r * 13}" r="3.4"/>`;
  });
  return `<svg viewBox="0 0 60 56" aria-hidden="true">${d}</svg>`;
}
// Sous-onglet « Planificateur » : terrain, formations, profondeur par poste.
function eqPlan(t) {
  t.sq.forEach(ensure);
  const s = slots(t.form),
    g = V.plg || 'GK',
    lu = new Set(t.lu),
    GR = [
      ['GK', 'Gardiens'],
      ['DEF', 'Défenseurs'],
      ['MID', 'Milieux'],
      ['ATT', 'Attaquants'],
    ],
    L = t.sq
      .map((p, i) => [p, i])
      .filter(([p]) => p.p == g)
      .sort((a, b) => lu.has(b[1]) - lu.has(a[1]) || b[0].o - a[0].o),
    cu = canUndo(),
    cr = canRedo(),
    tabs = GR.map(
      ([k, l]) =>
        `<button class="${g == k ? 'on' : ''}" style="--gc:${EQPC[k]}" onclick="V.plg='${k}';render()">${l} <b>${t.sq.filter((p) => p.p == k).length}</b></button>`,
    ).join(''),
    rows = L.map(([p, i]) =>
      p.rv ? pc(p, 'rvx ' + (V.rsel === i ? 'sel ' : ''), `rvPick(${i})`) : dgi(pc(p, clsOf(i), `pick(${i})`, pcx(p, -1, 0, false)), i),
    ).join(''),
    forms = Object.keys(FORM)
      .map(
        (f) =>
          `<button class="plf ${t.form == f ? 'on' : ''}" onclick="me().form='${f}';autoLU(me());capSync(me());save();render()">${eqMini(f)}<span>${f}</span></button>`,
      )
      .join('');
  return `<div class="plw"><div class="card plc"><div class="eqtop"><b>Terrain</b>${hp('plt')}<span class="mu">Note équipe</span> <b>${nf1(teamNote(t))}</b><span class="eqvw"><label>Mentalité <select onchange="me().m=+this.value;save();render()">${MENT.map((m, i) => `<option value="${i}" ${i == t.m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></span></div>${tacPitch(t, s)}<div class="eqtop" style="margin-top:10px"><button onclick="autoLU(me());capSync(me());render()">Composition auto</button><button ${cu ? '' : 'disabled'} onclick="undoSw()">Annuler</button><button ${cr ? '' : 'disabled'} onclick="redoSw()">Rétablir</button></div><div class="plfs">${forms}</div></div>
<div class="plm"><div class="card plc"><div class="eqseg plg">${tabs}</div><div class="plh"><span>${L.length} joueur${L.length > 1 ? 's' : ''}</span>${vwBtn()}<span>Note ${nbg(eqAvg(L.map(([p]) => p.o)))}</span><span>Âge ${eqAvg(L.map(([p]) => p.age))}</span></div><div class="pg${V.vw == 'l' ? ' l' : ''} plpg">${rows || '<div class="mu" style="padding:18px;text-align:center">Aucun joueur à ce poste.</div>'}</div><div class="plf0"><span class="mu">Touchez un joueur puis un joueur du terrain pour les échanger, ou glissez-déposez. Un fond rouge sur le terrain signale un joueur hors de son poste.</span></div></div>${prePanel(t)}</div>${eqSide(t)}</div>`;
}
// Sous-onglet « Personnalisation » : maillots du club.
function eqPerso(t) {
  const k = kitOf(t);
  return `<div class="persw">${kitCard()}<div class="card"><b>Tous les maillots</b>${hp('kit')}<div class="kitp" style="flex-wrap:wrap;gap:12px;margin-top:10px">${t.sq.map((p) => `<div class="kitj" title="${p.n}">${jersey(k, pnum(t, p), p.n, 84)}</div>`).join('')}</div></div></div>`;
}
// Sous-onglet « Rapports ».
function eqRap(t) {
  const S0 = t.sq;
  S0.forEach(ensure);
  const idx = (p) => S0.indexOf(p),
    rw = (p, r) => `<div class="eqr" onclick="prof('sq',${idx(p)})">${eqPos(p)}<span class="eqn">${p.n}</span>${r}</div>`,
    best = [...S0].sort((a, b) => b.o - a.o).slice(0, 3),
    avgA = eqAvg(S0.map((p) => p.age)),
    tr = tRate(t),
    others = S.teams.map(tRate).filter((x) => x != null),
    rk = others.filter((x) => x > tr).length + 1,
    fo = [],
    fa = [],
    cnt = (p) => S0.filter((x) => x.p == p).length,
    mx = (p) => Math.max(0, ...S0.filter((x) => x.p == p).map((x) => x.o));
  if (rk <= 3) fo.push('L’équipe figure parmi les meilleures de la ligue.');
  if (rk >= others.length - 2) fa.push('L’équipe fait partie des plus faibles de la ligue.');
  if (avgA <= 24) fo.push('L’équipe allie jeunesse et potentiel.');
  if (avgA >= 29) fa.push('L’effectif est vieillissant.');
  [
    ['GK', 'Gardien', 2, 'gardien'],
    ['DEF', 'Défense', 4, 'défense'],
    ['MID', 'Milieu', 4, 'milieu'],
    ['ATT', 'Attaque', 2, 'attaque'],
  ].forEach(([p, , n, l]) => {
    if (cnt(p) < n) fa.push(`Manque de profondeur en ${l}.`);
    else if (cnt(p) >= n + 2) fo.push(`Beaucoup d’options en ${l}.`);
    if (mx(p) >= 78) fo.push(`Un joueur d’élite en ${l}.`);
    if (cnt(p) && mx(p) < 55) fa.push(`Le niveau en ${l} est faible.`);
  });
  if (S0.filter((p) => p.inj).length >= 3) fa.push('Plusieurs joueurs sont blessés.');
  if (S0.filter((p) => eqMo(p) < 40).length >= 3) fa.push('Le moral de plusieurs joueurs est bas.');
  const li = (a, c) => a.map((x) => `<div class="eqf ${c}"><i></i>${x}</div>`).join('') || '<div class="mu">Rien à signaler.</div>';
  const inj = S0.filter((p) => p.inj),
    sus = S0.filter((p) => p.sus),
    mor = S0.filter((p) => eqMo(p) < 45),
    ctr = [...S0].sort((a, b) => a.ct - b.ct).slice(0, 8),
    dev = S0.filter((p) => p.pt && p.age <= PTA)
      .sort((a, b) => b.pt - b.o - (a.pt - a.o))
      .slice(0, 8),
    yg = S0.filter((p) => p.age <= 21)
      .sort((a, b) => (b.pt || b.o) - (a.pt || a.o))
      .slice(0, 8),
    empty = '<div class="mu" style="padding:14px 0;text-align:center">Aucune donnée</div>';
  return `<div class="eqw1"><div class="card eqh">${[
    ['Note moyenne', nbg(eqAvg(S0.map((p) => p.o)))],
    ['Taille de l’équipe', S0.length],
    ['Âge moyen', avgA],
    ['Valeur moyenne', eqAvg(S0.map(price)) + ' cr.'],
    ['Valeur totale', S0.reduce((s, p) => s + price(p), 0) + ' cr.'],
  ]
    .map(([l, v]) => `<div class="eqk"><span>${l}</span><b>${v}</b></div>`)
    .join('')}</div>
<div class="eq3">${best.map((p) => eqWide(p, idx(p), t)).join('')}</div>
<div class="eqg">
<div class="card"><b>Analyse de l’équipe</b>${hp('eqr')}<h4 class="eqok">Points forts</h4>${li(fo, 'ok')}<h4 class="eqko">Faiblesses</h4>${li(fa, 'ko')}</div>
<div class="card"><b>Blessures</b>${inj.map((p) => rw(p, `<span class="eqtg bad">${p.inj} match${p.inj > 1 ? 's' : ''}</span>`)).join('') || empty}</div>
<div class="card"><b>Suspensions</b>${sus.map((p) => rw(p, `<span class="eqtg bad">${p.sus} match${p.sus > 1 ? 's' : ''}</span>`)).join('') || empty}</div>
<div class="card"><b>Problèmes de moral</b>${mor.map((p) => rw(p, `<span class="eqm lo">${eqMo(p)}</span>`)).join('') || empty}</div>
<div class="card"><b>Contrats</b>${ctr.map((p) => rw(p, `<span class="eqtg ${p.ct <= 1 ? 'warn' : ''}">${p.ct} an${p.ct > 1 ? 's' : ''}</span>`)).join('')}</div>
<div class="card"><b>Développement</b>${dev.map((p) => rw(p, `${nbg(p.o)}${gg(Math.round((p.o / Math.max(p.pt, 1)) * 100), { size: 44, fs: 34, c: '#b78bff', tt: 'Part du potentiel atteinte' })}${nbg(p.pt)}`)).join('') || empty}</div>
<div class="card"><b>Jeunes talents</b>${yg.map((p) => rw(p, `<span class="mu">${p.age} ans</span>${nbg(p.o)}${p.pt ? nbg(p.pt) : ''}`)).join('') || empty}</div>
</div></div>`;
}
// Sous-onglet « Stats ».
const EQS = [
  ['g', 'Buts'],
  ['a', 'Passes décisives'],
  ['ga', 'Buts + passes'],
  ['sv', 'Arrêts'],
  ['cs', 'Clean sheets'],
  ['mm', 'Hommes du match'],
  ['ex', 'Exclusions'],
  ['mp', 'Matchs joués'],
];
function eqStt(t) {
  const k = V.eqk || 'g',
    val = (p) => (k == 'mp' ? p.mp || 0 : rkV(p, k)),
    L = t.sq
      .map((p, i) => [p, i])
      .filter(([p]) => (k == 'sv' || k == 'cs' ? p.p == 'GK' || val(p) : true))
      .sort((a, b) => val(b[0]) - val(a[0]) || b[0].o - a[0].o),
    o = EQS.map(([c, l]) => `<option value="${c}" ${k == c ? 'selected' : ''}>${l}</option>`).join('');
  return `<div class="eqw"><div class="card eqc"><div class="eqtop"><b>Statistiques de la saison</b>${hp('eqs')}<label class="eqvw">Statistique <select onchange="V.eqk=this.value;render()">${o}</select></label></div><div class="eqsc"><table class="eqt"><thead><tr><th>#</th><th>Nom du joueur</th><th>Pos</th><th>Matchs</th><th>Total</th></tr></thead><tbody>${L.map(([p, i], r) => `<tr onclick="prof('sq',${i})"><td>${r + 1}</td><td><span class="eqn">${p.n}</span></td><td>${eqPos(p)}</td><td>${p.mp || 0}</td><td><b>${val(p)}</b></td></tr>`).join('')}</tbody></table></div></div>${eqSide(t)}</div>`;
}
// Affiche les classements de l'onglet Championnat.
function rankView() {
  const k = V.rk || 'g',
    tabs = `<div class="ctl wide" style="margin:12px 0 6px;flex-wrap:wrap"><b>Classements</b>${hp('rk')}${RKC.map(([c, l]) => `<button class="${k == c ? 'p' : ''}" onclick="V.rk='${c}';render()">${l}</button>`).join('')}</div>`;
  if (k == 'tm') {
    const o = S.teams
        .map((t) => [t, t.ts || { n: 0, sh: 0, ot: 0, ps: 0, po: 0, fa: 0 }])
        .sort((a, b) => b[0].gf - a[0].gf || a[0].ga - b[0].ga),
      n = (x) => x.n || 1;
    return (
      tabs +
      `<div class="card wide" style="overflow:auto"><table class="rkt"><tr><th>#</th><th style="text-align:left">Équipe</th><th>BP</th><th>BC</th><th>Tirs/m</th><th>Préc.</th><th>Poss.</th></tr>` +
      o
        .map(
          ([t, x], i) =>
            `<tr class="${t == me() ? 'me' : ''}"><td>${i + 1}</td><td style="text-align:left">${t.em} ${t.name}</td><td>${t.gf}</td><td>${t.ga}</td><td>${x.n ? (x.sh / n(x)).toFixed(1) : '–'}</td><td>${x.sh ? Math.round((100 * x.ot) / x.sh) + '%' : '–'}</td><td>${x.n ? Math.round(x.po / n(x)) + '%' : '–'}</td></tr>`,
        )
        .join('') +
      `</table></div>`
    );
  }
  const pool = [];
  S.teams.forEach((t) =>
    (t.sq || []).filter(Boolean).forEach((p) => {
      if ((k == 'sv' || k == 'cs') && p.p != 'GK') return;
      const v = rkV(p, k);
      if (v > 0) pool.push([p, t, v]);
    }),
  );
  pool.sort((a, b) => b[2] - a[2] || a[0].n.localeCompare(b[0].n));
  const md = ['#f2c230', '#c3c9d6', '#d08a4e'].map(
    (c, i) =>
      `<span style="display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:${c};color:#14182b;font-weight:800;font-size:12px">${i + 1}</span>`,
  );
  return (
    tabs +
    `<div class="card wide" style="overflow:auto">` +
    (pool.length
      ? `<table class="rkt">` +
        pool
          .slice(0, 10)
          .map(
            ([p, t, v], i) =>
              `<tr class="${t == me() ? 'me' : ''}"><td>${md[i] || i + 1}</td><td style="text-align:left"><b>${p.n}</b> <span class="mu">${p.p}</span></td><td style="text-align:left">${t.em} ${t.name}</td><td><b>${v}</b></td></tr>`,
          )
          .join('') +
        `</table>`
      : '<div class="mu">Aucune donnée pour l’instant : jouez quelques matchs.</div>') +
    `</div>`
  );
}
// Dessine une petite courbe (graphique) à partir d'une liste de valeurs.
const stSp = (v, o = {}) => {
  const w = 300,
    h = o.h || 64;
  if (v.length < 2) return '<div class="mu">Pas encore assez de données.</div>';
  let mn = o.min != null ? o.min : Math.min(...v),
    mx = o.max != null ? o.max : Math.max(...v);
  if (mx == mn) {
    mx += 1;
    mn -= 1;
  }
  const pts = v
    .map(
      (y, i) =>
        `${((i * w) / (v.length - 1)).toFixed(1)},${(o.inv ? 5 + ((y - mn) / (mx - mn)) * (h - 10) : h - 5 - ((y - mn) / (mx - mn)) * (h - 10)).toFixed(1)}`,
    )
    .join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%"><polyline fill="none" stroke="${o.c || 'var(--ac)'}" stroke-width="2" points="${pts}"/></svg><div class="mu" style="display:flex;justify-content:space-between"><span>${o.l0 || ''}</span><span>${o.l1 || ''}</span></div>`;
};
// Petite carte de statistique (titre, valeur, sous-titre).
const stT = (l, v, s) =>
  `<div class="card"><div class="mu">${l}</div><b style="font-size:19px">${v}</b>${s ? `<div class="mu">${s}</div>` : ''}</div>`;
// Calcule la plus longue série (victoires consécutives, etc.).
function stStreak(L, f) {
  let b = 0,
    c = 0;
  L.forEach((x) => {
    if (f(x)) {
      c++;
      b = Math.max(b, c);
    } else c = 0;
  });
  return b;
}
// Page « Statistiques » : Club, Joueurs, Finances, Records, avec graphiques.
function statView() {
  const K = stK(),
    t = me(),
    sub = V.sts || 'cl',
    L = K.log.filter((x) => x.s == S.season),
    tabs = [
      ['cl', '🏟 Club'],
      ['jo', '👤 Joueurs'],
      ['fi', '💰 Finances'],
      ['re', '🏅 Records'],
    ];
  let h = `<div class="ctl wide" style="margin-bottom:8px;flex-wrap:wrap">${tabs.map(([k, l]) => `<button class="${sub == k ? 'p' : ''}" onclick="V.sts='${k}';render()">${l}</button>`).join('')}${hp('stat')}</div>`;
  if (sub == 'cl') {
    const rk = stdg(grpOf(t)).indexOf(t) + 1,
      ts = t.ts || { n: 0, sh: 0, ot: 0, ps: 0, po: 0, fa: 0 },
      n = ts.n || 1,
      cum = L.reduce((a, x) => {
        a.push((a.length ? a[a.length - 1] : 0) + (x.g > x.c ? 3 : x.g == x.c ? 1 : 0));
        return a;
      }, []),
      dg = L.reduce((a, x) => {
        a.push((a.length ? a[a.length - 1] : 0) + x.g - x.c);
        return a;
      }, []),
      hm = L.filter((x) => x.h),
      aw = L.filter((x) => !x.h),
      rec = (a) => {
        const w = a.filter((x) => x.g > x.c).length,
          d = a.filter((x) => x.g == x.c).length;
        return w + 'V ' + d + 'N ' + (a.length - w - d) + 'D';
      };
    h += `<h2>Saison ${S.season}</h2><div class="stg2 wide">${stT('Classement', rk + 'e', 'sur ' + grpOf(t).length)}${stT('Points', t.pts, t.pl + ' matchs')}${stT('Bilan', t.w + 'V ' + t.d + 'N ' + t.l + 'D')}${stT('Buts', t.gf + ' – ' + t.ga, 'diff. ' + (t.gf - t.ga > 0 ? '+' : '') + (t.gf - t.ga))}${stT('Possession', ts.n ? Math.round(ts.po / n) + ' %' : '–')}${stT('Tirs / match', ts.n ? (ts.sh / n).toFixed(1) : '–', ts.sh ? 'dont ' + Math.round((100 * ts.ot) / ts.sh) + ' % cadrés' : '')}${stT('Passes / match', ts.n ? Math.round(ts.ps / n) : '–')}${stT('Fautes / match', ts.n ? (ts.fa / n).toFixed(1) : '–')}</div>`;
    h += `<div class="card"><b>Classement match après match</b>${stSp(
      L.map((x) => x.rk),
      { inv: 1, min: 1, max: grpOf(t).length, l0: 'J1', l1: 'J' + L.length },
    )}</div><div class="card"><b>Points cumulés</b>${stSp(cum, { min: 0, l0: 'J1', l1: 'J' + L.length })}</div><div class="card"><b>Différence de buts cumulée</b>${stSp(dg, { l0: 'J1', l1: 'J' + L.length, c: '#2fb36b' })}</div>`;
    h += `<div class="card"><b>Domicile / extérieur</b><div class="mu">Domicile : ${rec(hm)} · Extérieur : ${rec(aw)}</div><div class="mu">Forme récente : ${
      (S.form || '')
        .slice(-6)
        .split('')
        .map(
          (c) =>
            `<i style="display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:3px;vertical-align:-1px;background:${c == 'V' ? '#2fb36b' : c == 'D' ? '#e5484d' : '#8d99ae'}"></i>`,
        )
        .join('') || '–'
    }</div></div>`;
    h +=
      `<h2>Saisons précédentes</h2><div class="card wide" style="overflow:auto">` +
      (K.se.length
        ? `<table class="rkt"><tr><th>Saison</th><th>Rang</th><th>Pts</th><th>V-N-D</th><th>Buts</th></tr>` +
          K.se
            .slice()
            .reverse()
            .map(
              (x) =>
                `<tr><td>${x.s}</td><td>${x.rk}e</td><td>${x.pts}</td><td>${x.w}-${x.d}-${x.l}</td><td>${x.gf}-${x.ga}</td></tr>`,
            )
            .join('') +
          `</table>`
        : '<div class="mu">Aucune saison terminée. Les statistiques sont enregistrées depuis la mise à jour 1.27.</div>') +
      `</div>`;
    if (K.hs.length)
      h +=
        `<h2>Meilleurs de chaque saison</h2><div class="card wide" style="overflow:auto"><table class="rkt"><tr><th>Saison</th><th style="text-align:left">Buteur</th><th style="text-align:left">Passeur</th><th style="text-align:left">Gardien</th></tr>` +
        K.hs
          .slice()
          .reverse()
          .map(
            (x) =>
              `<tr><td>${x.s}</td>${[x.g, x.a, x.sv].map((v) => `<td style="text-align:left">${v ? v[0] + ' <span class="mu">(' + v[2] + ')</span>' : '–'}</td>`).join('')}</tr>`,
          )
          .join('') +
        `</table></div>`;
  } else if (sub == 'jo') {
    const car = V.stc == 'c',
      rows = t.sq
        .map((p) => {
          const o = p.ss || {},
            c = p.cr || {},
            g = (car ? c.g || 0 : 0) + (p.g || 0),
            f = (k) => (car ? c[k] || 0 : 0) + (o[k] || 0);
          return { p, g, a: f('a'), sh: f('sh'), ot: f('ot'), sv: f('sv'), cs: f('cs'), mm: f('mm') };
        })
        .sort((a, b) => b.g + b.a - (a.g + a.a) || b.sv - a.sv);
    h +=
      `<div class="ctl wide" style="margin-bottom:8px"><button class="${car ? '' : 'p'}" onclick="V.stc='s';render()">Saison</button><button class="${car ? 'p' : ''}" onclick="V.stc='c';render()">Carrière au club</button></div><div class="card wide" style="overflow:auto"><table class="rkt"><tr><th></th><th style="text-align:left">Joueur</th><th>⚽</th><th>🎯</th><th>Tirs</th><th>Préc.</th><th>🧤</th><th>CS</th><th>⭐</th></tr>` +
      rows
        .map(
          (r, i) =>
            `<tr><td class="mu">${r.p.p}</td><td style="text-align:left"><b>${r.p.n}</b></td><td>${r.g}</td><td>${r.a}</td><td>${r.sh}</td><td>${r.sh ? Math.round((100 * r.ot) / r.sh) + '%' : '–'}</td><td>${r.p.p == 'GK' ? r.sv : '–'}</td><td>${r.p.p == 'GK' ? r.cs : '–'}</td><td>${r.mm}</td></tr>`,
        )
        .join('') +
      `</table></div><div class="mu">⚽ buts · 🎯 passes décisives · Préc. = tirs cadrés · 🧤 arrêts · CS = matchs sans encaisser · ⭐ hommes du match. Les passes décisives sont attribuées après chaque match.</div>`;
  } else if (sub == 'fi') {
    const all = K.log.map((x) => x.cash),
      cs = L.map((x) => x.cash),
      e = Object.entries(S.fn),
      R = e.filter(([, a]) => a > 0).reduce((a, x) => a + x[1], 0),
      D = -e.filter(([, a]) => a < 0).reduce((a, x) => a + x[1], 0),
      sl = t.sq.reduce((a, p) => a + sal(p), 0);
    h +=
      `<div class="stg2 wide">${stT('Trésorerie', S.cash + ' cr.')}${stT('Revenus (saison)', '+' + R)}${stT('Dépenses (saison)', '−' + D)}${stT('Résultat', (R - D >= 0 ? '+' : '') + (R - D))}${stT('Masse salariale', sl + '/match')}${stT('Sponsors', spons() + '/match')}${stT('Billetterie', gate(), 'par match à domicile')}${stT('Record de caisse', all.length ? Math.max(...all) : S.cash)}</div><div class="card"><b>Trésorerie cette saison</b>${stSp(cs, { l0: 'J1', l1: 'J' + cs.length })}</div><div class="card"><b>Trésorerie depuis le début</b>${stSp(all, { l0: '1er match', l1: 'dernier match', c: '#d6891a' })}</div><div class="card"><b>Principaux postes</b><table class="rkt">` +
      e
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 8)
        .map(
          ([c, a]) =>
            `<tr><td style="width:auto;text-align:left">${c}</td><td style="color:${a > 0 ? 'var(--ok)' : '#d33'}"><b>${a > 0 ? '+' : ''}${a}</b></td></tr>`,
        )
        .join('') +
      `</table></div>`;
  } else {
    const A = K.log,
      best = (f) => A.reduce((b, x) => (!b || f(x) > f(b) ? x : b), null),
      bw = best((x) => x.g - x.c),
      bl = best((x) => x.c - x.g),
      bg = best((x) => x.g),
      W = A.filter((x) => x.g > x.c).length,
      N = A.filter((x) => x.g == x.c).length,
      fm = (x) => (x ? `${x.g}-${x.c} vs ${x.o} <span class="mu">(S${x.s} · J${x.d})</span>` : '–'),
      bs = K.se.length ? K.se.reduce((b, x) => (x.rk < b.rk ? x : b)) : null,
      top = t.sq.map((p) => [p, (p.cr ? p.cr.g : 0) + (p.g || 0)]).sort((a, b) => b[1] - a[1])[0];
    if (!A.length)
      h += `<div class="card mu">Aucun match enregistré pour l’instant : jouez une journée pour commencer vos records.</div>`;
    else
      h += `<div class="stg2 wide">${stT('Matchs joués', A.length)}${stT('Victoires', W, Math.round((100 * W) / A.length) + ' %')}${stT('Nuls / défaites', N + ' / ' + (A.length - W - N))}${stT(
        'Buts marqués',
        A.reduce((a, x) => a + x.g, 0),
      )}${stT(
        'Buts encaissés',
        A.reduce((a, x) => a + x.c, 0),
      )}${stT('Titres de ligue', S.titles || 0)}</div><div class="card"><table class="rkt"><tr><td style="width:auto;text-align:left">Plus large victoire</td><td>${bw && bw.g > bw.c ? fm(bw) : '–'}</td></tr><tr><td style="width:auto;text-align:left">Plus lourde défaite</td><td>${bl && bl.c > bl.g ? fm(bl) : '–'}</td></tr><tr><td style="width:auto;text-align:left">Match le plus prolifique</td><td>${fm(bg)}</td></tr><tr><td style="width:auto;text-align:left">Plus longue série de victoires</td><td>${stStreak(A, (x) => x.g > x.c)}</td></tr><tr><td style="width:auto;text-align:left">Plus longue série d’invincibilité</td><td>${stStreak(A, (x) => x.g >= x.c)}</td></tr><tr><td style="width:auto;text-align:left">Série sans encaisser</td><td>${stStreak(A, (x) => x.c == 0)}</td></tr><tr><td style="width:auto;text-align:left">Meilleur classement final</td><td>${bs ? bs.rk + 'e (saison ' + bs.s + ')' : '–'}</td></tr><tr><td style="width:auto;text-align:left">Meilleur buteur (effectif actuel)</td><td>${top && top[1] ? top[0].n + ' (' + top[1] + ')' : '–'}</td></tr></table></div>`;
  }
  return h;
}
/* Académie */
// Axes de formation de l'académie et leur effet.
const ACX = ['Polyvalent', 'Niveau', 'Fluide'],
  ACXD = ['Progression équilibrée', 'Niveau +40 %, Fluide plus lent', 'Fluide ×2, niveau plus lent'];
// Équipe de League du joueur (même quand il est en Cup).
const lgT = () => (S.ctx == 'C' ? (S.alt && S.alt.teams && S.alt.teams[S.alt.t]) || me() : me());
// Nombre maximum de jeunes dans le centre de formation (augmente avec le niveau du staff).
const acCap = () => 4 + (stL('y') || 0) + (skV('f4') ? 2 : 0);
// Accès aux données de l'académie de la partie.
function acG() {
  if (!S.ac) {
    S.ac = { y: [], sc: 0 };
    acIntake(2, 1);
  }
  return S.ac;
}
// Arrivée de nouveaux jeunes talents dans l'académie.
function acIntake(n, sil) {
  if (!S.ac) S.ac = { y: [], sc: 0 };
  const A = S.ac,
    U = new Set(
      S.teams
        .concat(S.alt && S.alt.teams ? S.alt.teams : [])
        .flatMap((x) => (x.sq || []).filter(Boolean).map((p) => p.n))
        .concat(A.y.map((y) => y.n)),
    ),
    y0 = stL('y') || 0,
    add = [];
  for (let k = 0; k < n && A.y.length < acCap(); k++) {
    const age = 15 + ((Math.random() * 3) | 0),
      pos = Math.random() < 0.12 ? 0 : 1 + ((Math.random() * 3) | 0),
      pt = Math.min(
        96,
        Math.round(
          58 +
            y0 * 3.2 +
            skV('f3') +
            skV('f4') * 2 +
            mgb('ed') +
            Math.random() * 22 +
            (Math.random() < 0.06 ? 10 : 0),
        ),
      ),
      o = Math.round(33 + (pt - 58) * 0.15 + Math.random() * 6 + (age - 15) * 2.5 + y0),
      y = {
        n: uname(U, AN, BN),
        p: POS[pos],
        o,
        pt,
        age,
        f: Math.round(35 + Math.random() * 45 + y0 * 2),
        ax: 0,
        mt: null,
        xp: 0,
      };
    A.y.push(y);
    add.push(y);
  }
  if (!sil && add.length)
    mail('Centre de formation', 'Nouveaux jeunes talents : ' + add.map((y) => y.n).join(', ') + '.');
  return add;
}
// Étoiles de potentiel d'un jeune (1 à 5).
const acStar = (pt) =>
  '★'.repeat(pt >= 90 ? 5 : pt >= 82 ? 4 : pt >= 74 ? 3 : pt >= 66 ? 2 : 1) +
  '☆'.repeat(5 - (pt >= 90 ? 5 : pt >= 82 ? 4 : pt >= 74 ? 3 : pt >= 66 ? 2 : 1));
// Multiplicateur de progression apporté par le mentor.
function acMul(y) {
  const m = y.mt && lgT().sq.find((p) => p.n == y.mt);
  return m
    ? 1 +
        Math.min(0.35, Math.max(0, m.o - 60) / 100) +
        (m.p == y.p ? 0.15 : 0) +
        ((m.age || 25) >= 27 ? 0.1 : 0)
    : 1;
}
// Ajoute un jeune promu à l'effectif principal.
function acPush(y, t) {
  t.sq.push({
    n: y.n,
    p: y.p,
    o: y.o,
    e: 100,
    f: Math.round(y.f),
    g: 0,
    og: t.name,
    age: y.age,
    ct: 3,
    mp: 0,
    pt: y.pt,
    mo: 70,
    yg: 1,
  });
}
// Chaque jour : les jeunes progressent.
function acTick() {
  if (S.mode == 'C' || !S.staff) return;
  const A = acG();
  A.y.forEach((y) => {
    const gap = Math.max(0.2, Math.min(1.4, (y.pt - y.o) / 15)),
      m = acMul(y),
      ax = [
        [1, 1],
        [1.4, 0.3],
        [0.7, 2],
      ][y.ax || 0];
    if (y.o < y.pt) {
      y.xp += ((14 + 3 * (stL('y') || 0)) * gap * m * ax[0]) / 7;
      if (y.xp >= 100) {
        y.xp -= 100;
        y.o = Math.min(y.pt, y.o + 1);
      }
    }
    y.f = fluK(y) == 'none' ? 0 : Math.min(99, y.f + 0.035 * ax[1] * m);
  });
}
// Fin de saison : les jeunes vieillissent ; ceux de 20 ans rejoignent l'équipe première.
function acYear() {
  const A = acG(),
    t = lgT(),
    pr = [],
    rl = [];
  A.sc = 0;
  A.y.slice().forEach((y) => {
    y.age++;
    y.xp = 0;
    if (y.age >= 20) {
      A.y.splice(A.y.indexOf(y), 1);
      if (sqN(t) < 15) {
        acPush(y, t);
        pr.push(y.n + ' (niveau ' + y.o + ')');
      } else rl.push(y.n);
    }
  });
  const ad = acIntake(2 + skV('f4'), 1);
  mail(
    'Centre de formation : bilan de fin de saison',
    (pr.length ? 'Promus en équipe première à 20 ans : ' + pr.join(', ') + '.\n' : '') +
      (rl.length ? 'Libérés faute de place dans l’effectif : ' + rl.join(', ') + '.\n' : '') +
      (ad.length
        ? 'Nouvelle fournée : ' + ad.map((y) => y.n + ' (' + y.p + ', ' + y.age + ' ans)').join(', ') + '.'
        : 'L’académie est complète : aucune nouvelle recrue.') +
      '\n\nOuvrez l’onglet Formation pour choisir leur axe et leur mentor.',
  );
}
// Bouton « Promouvoir » : intègre un jeune à l'équipe première.
function acPromo(i) {
  const A = acG(),
    y = A.y[i],
    t = lgT();
  if (!y) return;
  if (sqN(t) >= 15) {
    A.note = 'Effectif complet (15 joueurs max) : vendez ou libérez un joueur avant de promouvoir.';
    return render();
  }
  A.y.splice(i, 1);
  acPush(y, t);
  A.note = y.n + ' rejoint l’équipe première.';
  mail('Promotion : ' + y.n, y.n + ' (niveau ' + y.o + ') intègre l’effectif professionnel.');
  save();
  render();
}
// Bouton « Libérer » : renvoie un jeune (avec confirmation).
function acRel(i) {
  const A = acG(),
    y = A.y[i];
  if (!y) return;
  if (V.acr != i) {
    V.acr = i;
    return render();
  }
  V.acr = null;
  A.y.splice(i, 1);
  A.note = y.n + ' a quitté l’académie.';
  save();
  render();
}
// Choisit l'axe de formation d'un jeune.
function acAx(i, v) {
  const y = acG().y[i];
  if (y) {
    y.ax = v;
    save();
    render();
  }
}
// Choisit le mentor d'un jeune.
function acMt(i, k) {
  const A = acG(),
    y = A.y[i];
  if (!y) return;
  const n = k === '' ? null : lgT().sq[+k].n;
  if (n)
    A.y.forEach((z) => {
      if (z.mt == n) z.mt = null;
    });
  y.mt = n;
  save();
  render();
}
// Bouton « Chercher un talent » (coûte des crédits).
function acScout() {
  const A = acG();
  if ((A.sc || 0) >= 2 || S.cash < 250 || A.y.length >= acCap()) return;
  tx('Recrutement', -250);
  A.sc = (A.sc || 0) + 1;
  const y = acIntake(1, 1)[0];
  if (y) {
    y.pt = Math.min(97, y.pt + 4);
    y.o += 2;
    A.note = 'Un recruteur a repéré ' + y.n + ' (' + y.p + ', ' + y.age + ' ans).';
  }
  save();
  render();
}
// Page « Formation » (centre de formation interactif).
function acView() {
  if (S.mode == 'C') return '';
  const A = acG(),
    t = lgT(),
    cap = acCap(),
    cn = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' },
    px = { GK: 30, DEF: 95, MID: 165, ATT: 240 },
    cnt = {};
  const field = `<svg viewBox="0 0 300 92" style="width:100%;max-width:420px;display:block;border-radius:10px"><rect width="300" height="92" fill="#2e8b57"/><rect x="4" y="4" width="292" height="84" fill="none" stroke="#fff9" stroke-width="1.5"/><line x1="150" y1="4" x2="150" y2="88" stroke="#fff9"/><circle cx="150" cy="46" r="14" fill="none" stroke="#fff9"/><rect x="4" y="26" width="26" height="40" fill="none" stroke="#fff9"/><rect x="270" y="26" width="26" height="40" fill="none" stroke="#fff9"/>${A.y
    .map((y) => {
      const k = (cnt[y.p] = (cnt[y.p] || 0) + 1);
      return `<circle cx="${px[y.p] + (k % 2 ? 0 : 16)}" cy="${12 + ((k * 19) % 72)}" r="6.5" fill="${cn[y.p]}" stroke="#fff" stroke-width="1.5"/>`;
    })
    .join('')}</svg>`;
  const mts = t.sq.map((p, i) => [p, i]).sort((a, b) => b[0].o - a[0].o);
  return (
    `<div class="card wide"><div class="ctl" style="justify-content:space-between"><b>🎓 Académie</b>${hp('ac')}<span class="mu">Niveau du centre ${stL('y') || 0} · places ${A.y.length}/${cap}</span>${vwBtn()}</div>${field}<div class="mu" style="margin-top:6px">Les jeunes progressent chaque jour. À 20 ans, ils rejoignent automatiquement l’équipe première (si l’effectif n’est pas complet). Chaque fin de saison, de nouveaux talents arrivent.</div><div class="ctl" style="margin-top:6px"><button onclick="acScout()" ${(A.sc || 0) >= 2 || S.cash < 250 || A.y.length >= cap ? 'disabled' : ''}>🔎 Chercher un talent (250 cr.) ${A.sc || 0}/2</button><button onclick="V.tab='mkt';V.mt='st';render()">⬆ Améliorer le centre</button></div>${A.note ? `<div style="margin-top:6px"><b>${A.note}</b></div>` : ''}</div>` +
    (A.y.length
      ? `<div class="${V.vw == 'l' ? '' : 'acg '}wide">` +
        A.y
          .map(
            (y, i) =>
              V.vw == 'l'
                ? `<div class="row" style="flex-wrap:wrap;gap:8px;border-left:4px solid ${cn[y.p]}"><span class="pos">${y.p}</span><span class="nm"><b>${y.n}</b> <span class="mu">${y.age} ans · niv. ${y.o} · Fl ${Math.round(y.f)} · ${Math.round(y.xp)} % vers le niveau suivant</span> <span style="color:#d6891a;letter-spacing:1px" title="Potentiel estimé">${acStar(y.pt)}</span></span><select onchange="acAx(${i},+this.value)" title="Axe de formation">${ACX.map((n, j) => `<option value="${j}" ${(y.ax || 0) == j ? 'selected' : ''}>${n}</option>`).join('')}</select><select onchange="acMt(${i},this.value)" title="Mentor"><option value="">Mentor : aucun</option>${mts.map(([p, k]) => `<option value="${k}" ${y.mt == p.n ? 'selected' : ''}>${p.n} (${p.p} ${p.o})</option>`).join('')}</select><button class="p" onclick="acPromo(${i})">⬆ Promouvoir</button><button onclick="acRel(${i})">${V.acr == i ? 'Confirmer ?' : 'Libérer'}</button></div>`
                : `<div class="card acc" style="border-top:4px solid ${cn[y.p]}"><div class="ctl" style="flex-wrap:nowrap;gap:10px">${gg(0, { f: y.xp / 100, t: y.o, l: 'Niveau', size: 84, c: 'var(--ac)' })}<div style="flex:1;min-width:0"><b>${y.n}</b><div class="mu">${y.p} · ${y.age} ans · Fl ${Math.round(y.f)}</div><div style="color:#d6891a;letter-spacing:1px" title="Potentiel estimé">${acStar(y.pt)}</div></div></div><div class="mu" style="margin-top:6px">Axe de formation</div><select onchange="acAx(${i},+this.value)">${ACX.map((n, j) => `<option value="${j}" ${(y.ax || 0) == j ? 'selected' : ''}>${n}</option>`).join('')}</select><div class="mu">${ACXD[y.ax || 0]}</div><div class="mu" style="margin-top:6px">Mentor${y.mt ? ' (bonus ×' + acMul(y).toFixed(2) + ')' : ''}</div><select onchange="acMt(${i},this.value)"><option value="">— Aucun —</option>${mts.map(([p, k]) => `<option value="${k}" ${y.mt == p.n ? 'selected' : ''}>${p.n} (${p.p} ${p.o})</option>`).join('')}</select><div class="ctl" style="margin-top:8px"><button class="p" onclick="acPromo(${i})">⬆ Promouvoir</button><button onclick="acRel(${i})">${V.acr == i ? 'Confirmer ?' : 'Libérer'}</button></div></div>`,
          )
          .join('') +
        `</div>`
      : `<div class="card mu">Aucun jeune pour l’instant. Les nouveaux talents arrivent en fin de saison, ou cherchez-en un maintenant.</div>`) +
    `<div class="mu" style="margin:8px 0">Le cercle montre la progression vers le prochain niveau. Un mentor expérimenté (niveau élevé, même poste, 27 ans et plus) accélère la formation.</div>`
  );
}

// Ferme l'écran d'introduction pour de bon (mémorisé dans le navigateur).
function introOk() {
  try {
    localStorage.setItem('gm_intro2', '1');
  } catch (e) {}
  V.intro = 0;
  render();
}
// Écran d'introduction : explique que le jeu est un projet de fan.
function introView() {
  return `<div class="intro"><div class="intr"><p>Ce jeu a été créé en s’inspirant très fortement de l’œuvre originale <b>Galactik Football</b>, mais prend cependant énormément de libertés sur plusieurs points.</p><p>Il a été « vibe codé » avec Claude et utilise une licence qui ne lui appartient pas. Il est <b>gratuit</b> et le restera : il ne s’agit que de la vision d’un fan.</p><p class="intw"><b>Avertissement</b> : Galactik Manager est un <b>projet de fans non officiel</b>, entièrement <b>gratuit et sans aucun but lucratif</b> (ni publicité, ni achat, ni don). Il n’est <b>ni affilié, ni approuvé, ni sponsorisé</b> par les ayants droit de « Galactik Football », dont les noms, personnages et univers restent la propriété de leurs titulaires.</p><button class="p" id="introb" onclick="introOk()">Continuer</button></div><div class="intb"><div class="intg"></div><b>Galactik Manager</b></div></div>`;
}
// Mémoire de vérification (évite de refaire un travail déjà fait).
let PDK = '';
// Prénoms féminins utilisés pour renommer certains joueurs.
const PDF_N = [
  'Lyra',
  'Vela',
  'Seren',
  'Ione',
  'Zara',
  'Elin',
  'Kira',
  'Sela',
  'Mara',
  'Tessa',
  'Livia',
  'Neva',
  'Aria',
  'Elara',
  'Syla',
  'Orla',
];
// Remplace les prénoms masculins par des prénoms féminins pour les équipes où les joueurs sont
// féminins.
function pdFix() {
  try {
    if (!S) return;
    const k = S.season + ':' + S.day + ':' + S.ctx + ':' + (S.teams || []).length;
    if (PDK == k) return;
    PDK = k;
    S.pdm = S.pdm || {};
    const fem = new Set(
        'Nyra Iris Juno Mira Wren Sable Nova Kaya Opal Talia Xara Yara'.split(' ').concat(PDF_N),
      ),
      L = [];
    [S.teams, S.alt && S.alt.teams].forEach((a) =>
      (a || []).forEach((t) => t.sq.forEach((p) => L.push([p, t.name]))),
    );
    Object.values(S.free || {}).forEach((a) => (a || []).forEach((p) => L.push([p, p.og || ''])));
    const U = new Set(L.map((x) => x[0].n));
    L.forEach(([p, tn]) => {
      if (planet(p.og || tn) != 'Paradisia' || p.n.indexOf(' ') < 0) return;
      if (S.pdm[p.n]) {
        p.n = S.pdm[p.n];
        return;
      }
      const [f, ...r] = p.n.split(' ');
      if (fem.has(f) || !AN.includes(f)) return;
      const o = p.n;
      let nn,
        q = 0;
      do {
        nn = PDF_N[(q + o.length * 3 + f.charCodeAt(0)) % PDF_N.length] + ' ' + r.join(' ');
        q++;
      } while (U.has(nn) && q < 40);
      if (U.has(nn)) return;
      U.add(nn);
      S.pdm[o] = nn;
      p.n = nn;
    });
  } catch (e) {}
}
// Mémoire de vérification pour les genres.
let GFK = '';
// Applique les genres par planète (Cyclops masculins, Rykers et Hektonïa féminines, Technoids sans
// genre).
function gFix() {
  try {
    if (!S) return;
    const k = S.season + ':' + S.day + ':' + S.ctx + ':' + (S.teams || []).length;
    if (GFK == k) return;
    GFK = k;
    S.gdm = S.gdm || {};
    const fem = new Set([...GFW].concat(PDF_N)),
      male = AN.filter((f) => !fem.has(f)),
      L = [];
    [S.teams, S.alt && S.alt.teams].forEach((a) =>
      (a || []).forEach((t) => t.sq.forEach((p) => L.push([p, t.name]))),
    );
    Object.values(S.free || {}).forEach((a) => (a || []).forEach((p) => L.push([p, p.og || ''])));
    const U = new Set(L.map((x) => x[0].n));
    L.forEach(([p, tn]) => {
      const pl = planet(p.og || tn),
        w = pl == 'Cyclopia' ? 'M' : pl == 'Hektonïa' || pl == 'Unadar' ? 'F' : '';
      if (!w || p.n.indexOf(' ') < 0) return;
      if (S.gdm[p.n]) {
        p.n = S.gdm[p.n];
        return;
      }
      const [f, ...r] = p.n.split(' ');
      if (!AN.includes(f) || (w == 'F') == fem.has(f)) return;
      const o = p.n,
        pool = w == 'F' ? PDF_N : male;
      let nn,
        q = 0;
      do {
        nn = pool[(q + o.length * 3 + f.charCodeAt(0)) % pool.length] + ' ' + r.join(' ');
        q++;
      } while (U.has(nn) && q < 60);
      if (U.has(nn)) return;
      U.add(nn);
      S.gdm[o] = nn;
      p.n = nn;
    });
  } catch (e) {}
}
// AFFICHAGE PRINCIPAL : reconstruit tout l'écran à partir de l'état de la partie (S) et de l'état
// de l'écran (V). Appelée après presque chaque action. Si on change un écran, c'est ici qu'il est
// choisi.
function render() {
  // Onglet Tactique : on y arrive toujours sur la vue « Équipe ».
  if (typeof V !== 'undefined' && V) {
    if (V.tab === 'tac' && V.tlast !== 'tac') V.tt = 'eq';
    V.tlast = V.tab;
  }
  if (DND.on && Date.now() - DND.t < 20000) {
    DND.sk = 1;
    return;
  }
  pdFix();
  gFix();
  dbgTick();
  if (V.intro) {
    $('app').innerHTML = introView();
    setTimeout(() => {
      const b = $('introb');
      if (b) b.focus();
    }, 50);
    return;
  }
  mkSync();
  lgSync();
  mailFlush();
  const a = {
    set innerHTML(v) {
      // Garde la position de défilement quand on reste sur la même page (sélection d'un joueur, menu déroulant…),
      // pour que l'écran ne « saute » pas à chaque clic.
      const mn0 = document.querySelector('#app .mn'),
        sy = mn0 ? mn0.scrollTop : 0,
        wy = window.scrollY,
        LS = '.mkl, .mlist, .hscr, .fvtb, .rpev, .tvbd, .pfsc',
        ls = [...document.querySelectorAll('#app ' + LS.split(', ').join(', #app '))].map((e) => e.scrollTop),
        sk = V.tab + '|' + (V.mo ?? '') + '|' + (V.menu ? 'M' : '');
      $('app').innerHTML = lgR(
        addHelp(v) + svBox() + fwBox() + ttBox() + ldBox() + pcBox() + opBox() + frBox() + mgBox() + fbBox() + legBox(),
      );
      if (V._sk === sk) {
        const mn1 = document.querySelector('#app .mn');
        if (mn1 && sy) mn1.scrollTop = sy;
        if (wy) window.scrollTo(0, wy);
        // Listes défilantes internes (recherche de joueurs, historique…) : on reste à la même position.
        document.querySelectorAll('#app ' + LS.split(', ').join(', #app ')).forEach((e, i) => {
          if (ls[i]) e.scrollTop = ls[i];
        });
      }
      V._sk = sk;
      theme();
      fold();
      barFix();
      icoFix();
    },
  };
  if (S && S.day == null) S.day = S.md > 0 ? dateOf(S.md - 1) : 0;
  if (S && S.teams && !S._og) {
    S.teams.forEach((t) =>
      t.sq.forEach((p) => {
        if (!p.og) p.og = p.ln ? S.teams[p.ln.own].name : t.name;
      }),
    );
    S._og = 1;
  }
  if (V.stp) {
    a.innerHTML = setView();
    return;
  }
  if (V.menu) {
    a.innerHTML = menuView();
    return;
  }
  if (V.hv) {
    a.innerHTML = '<button onclick="V.hv=0;render()">← Menu</button>' + tutoView();
    return;
  }
  if (V.ed) {
    a.innerHTML = '<div class="edm"></div>' + edView() + profBox();
    return;
  }
  if (S && V.mc) {
    a.innerHTML = mcView();
    return;
  }
  if (!S) {
    a.innerHTML =
      `<div class="scr"></div><div class="ctl"><button onclick="V.menu=1;render()">← Menu</button></div><h1>🌌 Galactik Manager</h1>${svInfo()}<div class="card">Choisissez votre club pour la saison 1 de la Ligue Galactique.<br><span class="mu">Les équipes marquées d’un <i class="fic" title="Contenu fictif, inventé pour ce jeu (absent de la série)" style="opacity:1">✦</i> sont fictives, inventées pour le jeu ; les autres viennent de la série Galactik Football.</span></div>${A.gd ? '' : `<div class="card" style="border-color:var(--ac)"><b>🚀 Première partie ? En 3 étapes</b><ol style="margin:6px 0 8px 18px;padding:0;line-height:1.6"><li><b>Choisissez la compétition</b> (Ligue, Cup ou les deux), puis un club ou une planète en bas de page. Plus son niveau est élevé, plus il est fort mais plus l’objectif du conseil sera exigeant. Le club ⭐ est conseillé pour débuter.</li><li><b>Réglez la difficulté</b> et les événements de scénario juste en dessous (vous pourrez les laisser par défaut).</li><li><b>Lancez la partie</b> : une visite guidée vous présente le jeu en 11 étapes, et chaque « ? » explique l’élément à côté de lui.</li></ol><button onclick="setA('gd')">J’ai compris, masquer ce guide</button></div>`}<div class="card"><label><input type="checkbox" ${V.evt !== 0 ? 'checked' : ''} onchange="V.evt=this.checked?1:0"> 🎬 Événements de scénario (police, sabotages…)</label>${hp('evt')}<div class="ctl" style="margin-top:6px"><label>Difficulté <select onchange="V.df=+this.value">${['Facile', 'Normal', 'Difficile'].map((n, i) => `<option value="${i}" ${(V.df ?? 1) == i ? 'selected' : ''}>${n}</option>`).join('')}</select></label>${hp('df')}</div></div><div class="card"><button onclick="V.ed=1;V.et=null;render()">🛠️ Éditeur de mods (équipes, joueurs, Fluides)</button> <button onclick="V.sv=1;V.sn='';render()">📂 Charger une partie</button> <button onclick="this.nextElementSibling.click()">📥 Importer mon tableur (.xlsx)</button><input type="file" accept=".xlsx" hidden onchange="imp(this.files[0])"> <span class="mu">${V.note || ''}</span></div><div class="card mdc"><b>Compétition</b> ${hp('modes')}<div class="mds">${[
        ['L', 'Galactik League', LGL, 'Gérez un club dans la grande ligue interplanétaire.'],
        [
          'C',
          'Galactik Cup',
          LGC,
          'Sélection de votre planète, format Coupe du monde (poules + phase finale).',
        ],
        ['D', 'Les deux', null, 'Un club et la sélection de sa planète, comme dans FM.'],
      ]
        .map(
          ([k, n, lg, d]) =>
            `<button class="${(V.nm || 'L') == k ? 'on' : ''}" onclick="V.nm='${k}';render()">${lg ? `<img src="${lg}" alt="">` : `<span class="two"><img src="${LGL}" alt=""><img src="${LGC}" alt=""></span>`}<b>${n}</b><span class="mu">${d}</span></button>`,
        )
        .join('')}</div></div><div class="grid">` +
      ((V.nm || 'L') == 'C'
        ? TN.map(
            (n, i) =>
              `<button onclick="load('Création de la sélection…',()=>{${n[0] == MKD.nat ? 'V.mkp=1;mkSync();' : ''}init(${
                n[0] == MKD.nat
                  ? 'TL.length-1'
                  : Math.max(
                      0,
                      T.findIndex((x) => planet(x[0]) == n[0]),
                    )
              },'C',${i});V.mkp=0;render()})">${n[2]} ${n[0]}${ft(n[0])}${bioBtnP(n[0])}<br><span class="mu">Niveau ${n[1]}/20 · ${n[0] == 'Ysolde' || n[0] == MKD.nat || n[0] == 'Vega' || n[0] == 'Kaldor' ? 'planète fictive' : 'planète de la série'}</span><br><span class="mu"><b>${n[1] >= 15 ? 'Prise en main facile' : n[1] >= 12 ? 'Prise en main équilibrée' : 'Prise en main exigeante'}</b></span></button>`,
          ).join('')
        : T.map(
            (t, i) =>
              `<button onclick="load('Création du club…',()=>{init(${i},'${V.nm || 'L'}');render()})">${t[2]} ${t[0]}${ft(t[0])}${bioBtn(t[0])}<br><span class="mu">Niveau ${t[1]}/20 · ${FICT.includes(t[0]) ? 'équipe fictive' : 'équipe de la série'}</span><br><span class="mu"><b>${t[1] >= 15 ? 'Prise en main facile' : t[1] >= 12 ? 'Prise en main équilibrée' : 'Prise en main exigeante'}</b>${i == recoT() ? ' · ⭐ Conseillé pour débuter' : ''}</span></button>`,
          ).join('') + newTiles() + mkTile()) +
      `</div>`;
    return;
  }
  const t = me(),
    end = S.md >= S.fx.length;
  let h = `<h1>${t.em} ${t.name}${ft(t.name)} <span class="mu">· Saison ${S.season} · Journée ${Math.min(S.md + 1, S.fx.length)}/${S.fx.length} · ${fmtDay(S.day)}</span></h1><nav>${[['club', 'Club'], ['tac', 'Tactique'], ['match', 'Match'], ['cal', 'Cal.'], ['mail', '✉️' + (S.mail.filter((m) => m.u).length || '')], ['mkt', 'Marché'], ['gest', 'Gestion'], ...(S.mode == 'C' ? [] : [['form', 'Formation']]), ['fin', 'Finances'], ['car', 'Carrière'], ['table', 'Class.'], ['stat', 'Stats'], ['tuto', 'Aide ?']].map(([k, l]) => `<button class="${V.tab == k ? 'on' : ''}" onclick="V.tab='${k}';render()">${l}</button>`).join('')}</nav>`;
  if (V.tab == 'club') {
    h += eqSub();
    const sb = V.eq || 'liste';
    if (sb == 'liste') h += eqList(t);
    else if (sb == 'rap') h += eqRap(t);
    else if (sb == 'stt') h += eqStt(t);
    else if (sb == 'plan') h += eqPlan(t);
    else h += eqPerso(t);
  } else if (V.tab == 'set') {
    h += setView();
  } else if (V.tab == 'nb' && NBU()) {
    h += nbView();
  } else if (V.tab == 'ov') {
    h += ovView();
  } else if (V.tab == 'mkt') {
    h += mktView();
  } else if (V.tab == 'mail') {
    h += mailView();
  } else if (V.tab == 'cal') {
    h += calView();
  } else if (V.tab == 'tac') {
    h += tacView();
  } else if (V.tab == 'tuto') {
    h += tutoView();
  } else if (V.tab == 'gest') {
    h += gestView();
  } else if (V.tab == 'fin') {
    h += finView();
  } else if (V.tab == 'gal') {
    h += galView();
  } else if (V.tab == 'car') {
    h += careerView();
  } else if (V.tab == 'form') {
    h += acView();
  } else if (V.tab == 'adv') {
    h += advView();
  } else if (V.tab == 'stat') {
    h += statView();
  } else if (V.tab == 'table') {
    h +=
      (end
        ? S.ctx == 'C'
          ? `<div class="card"><b>🏆 ${S.cup ? (S.cup.champ != null ? 'Champion : ' + S.teams[S.cup.champ].name : 'Phase finale en cours') : 'Phase de poules terminée'}</b><br>${S.cup ? '' : '<button class="p" style="margin-top:8px" onclick="cupStart()">🏆 Lancer la phase finale</button>'}${S.cup && S.cup.champ != null ? '<button class="p" style="margin-top:8px" onclick="newSeason()">Nouvelle saison</button>' : ''}</div>`
          : `<div class="card"><b>🏆 Champion : ${S.teams.slice().sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga))[0].name}</b><br><button class="p" style="margin-top:8px" onclick="newSeason()">Nouvelle saison</button></div>`
        : '') +
      cupView() +
      table() +
      rankView();
  } else {
    const M = V.m;
    if (!M)
      h += `<div class="card"><b>Aucun match en cours</b><div class="mu" style="margin:4px 0 8px">Le match se lance à la date prévue. Avancez dans le calendrier pour y arriver.</div><button class="p" onclick="cont2()">${S.md >= S.fx.length ? (S.ctx == 'C' && !S.cup ? '🏆 Lancer la phase finale' : '🏆 Voir le classement') : S.day >= dateOf(S.md) ? '⚽ Jouer le match' : '▶ Continuer jusqu’au match'}</button></div>`;
    else {
      if (MAN.on()) {
        h += mxView(M, t);
      } else {
        h += `<div class="card">${M.dby ? `<div class="mu" style="text-align:center">${M.dby == 'C' ? '⚡ CLASSICO' : '🔥 DERBY'}</div>` : ''}<div class="scb"><span class="scn l">${M.t[0].name}</span><span class="score">${M.sc[0]} - ${M.sc[1]}</span><span class="scn r">${M.t[1].name}</span><span class="sct">${M.done ? 'Terminé' : M.min + '’'}</span></div>${pitch(M)}<div class="mu">Violet = votre équipe, orange = adversaire. Le ballon prend la couleur de l’équipe qui a la possession ${hp('pitch')}</div>${statsBox(M)}`;
        if (!M.done)
          h += `<div class="ctl" style="justify-content:center">${V.iv ? `<button onclick="stop();render()">⏸ Pause</button>` : `<button class="p" onclick="loop();render()">▶ ${M.min ? 'Reprendre' : 'Coup d’envoi'}</button>`}<select onchange="V.sp=+this.value;if(V.iv)loop()"><option value="0" ${V.sp == 0 ? 'selected' : ''}>Lent</option><option value="1" ${V.sp == 1 ? 'selected' : ''}>Normal</option><option value="2" ${V.sp == 2 ? 'selected' : ''}>Rapide</option></select><label>Mentalité <select onchange="me().m=+this.value">${MENT.map((m, i) => `<option value="${i}" ${i == t.m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></div><div class="mu" style="text-align:center;margin-top:6px">Remplacements restants : ${V.sub}</div><div class="ctl" style="justify-content:center;margin-top:6px">${foSel()}</div>`;
        else h += `<button class="p" onclick="cont()">Continuer</button>`;
        h += `</div><div class="card log${M.done ? '' : ' cap'}">${
          M.lg
            .slice()
            .reverse()
            .slice(0, M.done ? undefined : LOGN)
            .map((l) => `<div>${l}</div>`)
            .join('') || "<div class='mu'>Le match n’a pas commencé.</div>"
        }</div>`;
        if (!M.done) h += squad();
      }
    }
  }
  a.innerHTML = shell(h) + tourBox() + profBox() + (V.tab == 'match' && V.mtc && V.m && !V.m.done && MAN.on() ? mtacBox(V.m) : '');
  if (V.tab == 'match' && V.m) {
    anim();
    MAN.attach();
  }
}
// PRIX D'UN JOUEUR sur le marché (selon sa note et son potentiel). Modifier cette formule change
// toute l'économie des transferts.
const priceBase = (p) => {
    const pt = potOf(p);
    return (p.o * p.o) / 8 + (pt > p.o ? Math.pow(pt - p.o, 2) * (p.pt != null && !p.pd ? 3 : 1) : 0);
  },
  // Prix d'un joueur = valeur selon sa note et son potentiel, ajustée par ses performances de la saison
  // (notes de match, buts, passes, homme du match, arrêts) et par ses statistiques (attributs au-dessus ou en dessous de ce que sa note laisse attendre).
  priceInfo = (p) => {
    const b = priceBase(p);
    let fp = 0,
      fs = 0;
    try {
      const ss = p.ss || {},
        mp = Math.max(0, p.mp || 0),
        rp = p.rp || [];
      if (rp.length >= 3) fp += Math.max(-0.2, Math.min(0.2, (rp.reduce((a, c) => a + c, 0) / rp.length - 6.5) * 0.08));
      if (mp >= 3) {
        const act = p.p == 'GK' ? ((ss.sv || 0) * 0.15 + (ss.cs || 0) * 1 + (ss.mm || 0) * 0.8) / mp : ((p.g || 0) * (p.p == 'ATT' ? 1 : 1.3) + (ss.a || 0) * 0.7 + (ss.mm || 0) * 0.8) / mp;
        fp += Math.max(0, Math.min(0.2, act * 0.25));
      }
      const dv = atDev(p);
      fs = Math.max(-0.12, Math.min(0.12, (dv.reduce((a, c) => a + c, 0) / dv.length) * 0.04));
    } catch (e) {}
    const f = Math.max(0.75, Math.min(1.5, 1 + fp + fs));
    return { b: Math.round(b), fp, fs, v: Math.max(1, Math.round(b * f)) };
  },
  price = (p) => priceInfo(p).v,
  NS = {
    c: ['Entraîneur', 'progression en fin de saison'],
    k: ['Kiné', 'récupération'],
    a: ['Analyste', 'force d’équipe'],
    y: ['Centre de formation', 'jeunes talents en fin de saison'],
  };
// Pictogrammes du staff (entraîneur : sifflet ; kiné : croix médicale ; analyste : graphique ; centre de formation : toque).
const STI = {
  c: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="5"/><path d="M12.5 12.5L21 9v4l-6 .5M5 4l2.5 3M11 3l-1 3.5"/></svg>',
  k: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 7.5v9M7.5 12h9"/></svg>',
  a: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 17v-5M11 17V7M16 17v-8M21 17v-11"/><path d="M4 8l5-4 4 3 7-5"/></svg>',
  y: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4L2 9l10 5 10-5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/></svg>',
};
// Joueurs rares de la série, proposés occasionnellement sur le marché.
const RARE = [
  ['Yuki', 'GK', 74, 'Snow Kids'],
  ['Aarch', 'ATT', 86, 'Snow Kids'],
  ['Artegor Nexus', 'MID', 84, 'Shadows'],
  ['Norata', 'ATT', 88, 'Lightnings'],
  ['Sonny Blackbones', 'MID', 82, 'Pirates'],
  ['Woowamboo', 'MID', 78, 'Lightnings'],
  ['Yewan', 'MID', 75, 'Lightnings'],
  ['Zyria', 'ATT', 80, 'Elektras'],
  ['Nikki 4', 'MID', 79, 'Team Paradisia'],
];
// Joueurs « prismatiques » (cartes spéciales) : [nom, poste, note, équipe, potentiel…].
const PRISM = [
  ['Zéphyra Kaï', 'ATT', 86, 'Lightnings', 96, { a: 19, pt: 97, fic: 1 }],
  ['Oréon Vastar', 'GK', 91, 'Rykers', 92, { a: 27, pt: 93, fic: 1 }],
  ['Nyx-Ilya', 'MID', 77, 'Shadows', 98, { a: 17, pt: 96, fic: 1 }],
  ['Solan Aurek', 'DEF', 89, 'Comet', 93, { a: 24, pt: 94, fic: 1 }],
];
// Logos des équipes (codés en texte) : celui de l'équipe cachée est ici, les autres sont dans js/images.js (LGX).
const LGB = {
    mk: 'iVBORw0KGgoAAAANSUhEUgAAAKYAAADACAMAAAC5++gCAAAAYFBMVEUtJRDgrxugfhtgThr/0RtVAAAZGRoAAADsuBv6whsKDRquiRuXeBorJhrWpxtsWBpVRhpFOho7MxrFmxuGaxq7kxt7YxogHhobGhodHRgcHBocHBkcGxobGxocHBojIxOPugaTAAAAIHRSTlMP/////wP+AP/////////////////////PL09vj7ARE9PSRIQAAA7XSURBVHja7V0Le6O4DiXtLBe/n5DpdLf9///yyrIxhpCWZ9q9t/6mnTQJ4cSSdWRJiOo/R4+X379fDv/Q6ujP+7uG8ffb94b5Wqfx+o1h/vld5/H7zzeF+fIP4tPOGXzwz8s3hPmOSkkFa2AwQVFF378bTJQ3rX1DAkzS+GMlXx0pbyUBJLlcwm+pjpR8dZgRoqYlUeBR8KQ1UfLVt4D59hqVkgd5E6fjMgqPGx5V9LX6epjJCHVNIeks/6Y7SEWrg4xQOXu3s7tbRasDjJBlQSkJs7QuxuTpfcap2suMk2kbjYmKfgnMpJTJCKl6dqjSOO1Q0a0wq3tKOR5TFa0eCnPEjISZOyCjOWVkP39W25nx6qMR0vUn4zkaJ1/TzZKvdjJjsoyfDN/s5M9qo7wTMz4JugQmFU8j/nw/GeaYGVtTLx74vQbj9HYmzDvMuGzs4c9qAzOmFbFM3qXkR2tulYpWxzDjQqCb+XMpzOpTZlw2Jvz517EwR8y4VinnVHQlf1a73LUtY5OLtwDm23JmXAh0wp9vR8B8XceMC1U0WYsr8ufrbpgvv1cz47Ixsr2fBsc+hvkyYsadSnmroiV/vmyGOWXGA0Gu5c/qJGY8mD+rhcx4pWfAXMyf1YdGyI4sxylAbbJz9kPjVJ3JjJv4s1oKcwcz0jBO4M9qJTMKY6ej0DTdcc69suN3GzE9vnxmEX9W95SymXfXorKOhs3nkg3B0bTxfFTFd7vp8YTTWRevuaei1Wwg4z4z3ofZNcNLhDBRwCRdQpWf4PQuf86GSKq7SjnPjHdhTl4g0tbXHlXTJCEL2dyF+SF/VjdKOeaGpTBvnwecdQ+TsDiZnHwEc8J3pYpWt8zYfMSMCQ4pBsChvj8/qmYceoDZENQfk+ea0zsu3sh7GIxTtZIZI0zJiyGK87edUnH1SVMKvZFXOLgln8C8y5/VSmaMMFtajELkzxB/odS6yRJCYMXcfgRz4tkmyVeDETJLmDG+x9XXPMLK6MXcH9n60cKOKiyKBcY/Co6N9wlonKqVzHgzmwMawqbnLmES9kSWwZzjz2olMybdVMPIC5jcfMPRbI7MFafr+LNauWe8WenNNT8p7sCUg7UizC2DOZFugLkmkHFjH2WGKe/C7K16fvg5zCJEIiJM+rRiz/gBzMtdmIOZV/VimNnyhPeG2QyqtXTPOAszkYu5O5u9x8Hq6xqYwY6PYDK6DqbsR+OuNe3m3Z4CpuipfSVMysYw61UwnRhGQYLgbcQP93wCEx8RBSdcB7PeB3PyrOsXCI1ZdULa8HCACRYfrG1461fCzPbRG2FVtG5qDNMmV+orYWangqSf8J/v4SNM6j39cpji0tz3N0cG9UthwiqaeO/N4Mh9BczoVt6+IFyJkzhbj3Xz0bMZhrzjLaDnHl6PbAEGFWm/hHnBp86GqdErmiVWWmvOnHOM696Fsb0TVXwZHKY+F2YIbHzwWvE7R0Fu37MiLrIZ5mPHVqFrAT+QfNa1ANFpBXwNf4IQRdyvG3gm/AV/iihbE/4GPcGnhAlvDIedCtMrOLsCqoETdfDPa2rCbgyAKZSlskLAX9qo2nBcSVzx2jwrfMoyeL+mHdfnwuz0ADP883hO2sEkdThDyogrPDKwcIxHmB2gxT/DD4cfTZW358K0KPj4Y69wSlFbkGIQtdZxcV/xEQhcPJt4iA2zG58KQhco/58l9APzB+YPzP8/mFTrOd8jBOlu/RO9LeW5G2YInnSTbIz2rHWwey+dubqPZ29KIG+HaUUOLOsyfKoYJFwc75TWGh5LpguPDRx53GzW2Uc5G6ZUOUBcnLCTQ9hdBs/CcFnGIXUKGcMW0z0CpibhNBhTleOgFMzkM8zkc8fgLyddmNwcQMZQHOKUxDwAJgvBa01GGy8E3WXvndZG9hs4Pt6TGqr69MupMAXCi+e0/USRMvAeA/l5j9mKQeoh8A2HSnE2TNzTuiTBCMwiykkMl+YII+lB4TN4KNGnwwyxTGllzpylBN+NVTRFXrDAKU2ZwzwXZmPh3KzDcDNKnCh6J/AQ5Y6TzsLSijD92TAxMnwRmrcSV3zdtmAnm5nztkNaMKoHYGy9tTib5wpdCMxOQjA9Sv1KOxkSa0zOoAxpwQiUX54pRjgbiPBjCJ4KcR5MqlgwRcRjbCgsBAFEBByubkyhI2HlCx/K8xvx3NQp9E1U0FBLnabnzSaHeXDk0kWuCes5Bu3FROrXiDJllNuaOng9xd99sEr+lz8RJgSvhZWqjfMSQsD9Ih5JHZZVniywYIBIwxtjNpswJYWZDeodBVPExKTtly/lKQNCR1IHE1XYJ9qGr+CCDYrUJFBNF5r4LTBtojvM0sFprjnnhVJPYa2AcmRBw7wrmU0sUG1zOkwQYSD0NjocxccxFnw4SBHIZuKpORcQGozVwgcYGo3auTA51BJxNNBZ5jFH0BdQSHvDr/BM2+ERxJtER+JM3WzIE0gw0Z3L5KOLXLmn1+lhHawf/Eocc6MtKZ3AU1Y6HAUrFtkxCnKaypxx01ybFCQdGqaenQXToIUmKswc+jg2bzLsKNNy6wc0wY8SycQT0Bn4ACrMGTApczbMg5Z9ttf0DlmuL2pm0//gCUMQDlVWx1Q+lKxQI5fkCdbD5GHPBRU8pDcnuneMhrT+fDGFBqualnrMqnMW9FudAjPolafo70aXR/eO8bik49abHGD2R4fvfBJMtOodRaZUUYJslAC+u4YGmFbFnQZqiT5nCUXFY2E6mjBjJmSmaX1Vk2ylu4mOgOEUuIS4hN0d4ZbMlrAcAhMLC4hnv2Tn8FgBk2u4a26qeMRNas7DihH4qO2aXx4nsz3HIKGkSGtVPiD4xk3rDZ8AVeMEFQv2JxJrC99TKOuaZplqbjHvIkoUPeM2nV/j5tyP0qqwUYJMBR2ZfseeaNJiQ9EyLGPLDTDRs3GRv9uYOU3ypSVOZjV8uFNiXGD13NMYiwZs2eVbq2F2rdeQ5G2pzavZZBuZimdyGZYIlRQY62KjglgXH8F2T8GuT50AU4cENOMW/bhkMdtJ1fBQZAfOswcvmLNRPWwMMhhIzLEQGTMnwIwEclGpVidsDeEhKxhxcg0MbC1YMyqHFaKLMGO59BLt3ESWqGMavcXIfRdZOhg3oY9BZ110o9FHsam86hQWSvUPUBQZ5ob/Qje3KwSnbuzltc41zxpB/8Ktsy5iISfAtMntdejMxUPk4MDrGV1LMJNuwE7NdIRxUkaWjjdIVsZKRYgG9G6lGTY+ZibQ1q8gkRwpMBRGuFi/do5BAiOjVXTfcbHDniusIp+1084oG8Pq1QZ9/bgIQX9DlKbVy1L/G2CCgZGN9L0shYg07YYtzw1MtJ7o/8KbRar1uvJLEwLeJ3F6kiDv91z+F06fS2vh2txcEAIbSbDlLC4fJVKdNO+3dmcuoXCci/W3qR6pTZWGsJzGe0oOkSIbPxveHAPFrP+2J3J6WrehQp7w4IHERQPKJwwwqRt5RlcGs90lTQiGKB82Xzt7YOCQ5BJ2YsM+gVMdGQhrIRsJVR50SARp4STGD3WYQtKFLxbpkzT6zGgx5n8aBykzj7vtlkbNi+Xf4fRM4aVVmoF3wVK6pW0pukZQbE1wY0qcOTeoLTychl9D6Y5DDpSYkgKbyvtrXBpIWYJLL9ue4sFlr1NOwfsrC5N+PTn2ziNjMhN9x3D+5CUVKRZScnbgddnD1DFxILuzq7r6qwh8CrHInMbKKRbOyg0mRglTWIeTfhGencnIDuRziNR0dZEh6guhk0XQQz2vxH25zlX6/PycZd6faXQfZKbs/kKRdNGAK4KNweWPKaG+6vj8RHUqJ5Ww7FMQME2caAqYPcGjrx+CjdJcUw2qfkxhpFCslQ3rfNg/ejKWb55NMdSaB8jGe+8a2TL1sCIKap5kXNBMiIFR0r5N1l0Rv0Rfv4ZYSRQBX1nysavWwxfp3TBdoiR9WWOwdQjpEC1yep2oB5akFKdlwJTZM5IRJidFgIZB6mK4JLCtH1k5M5CjFvrJm3JXhzAzHMOhiEYlgy+7Bxf4wHXCYCYvzIc9LlR26CHQGWD2ziRcfRZefuLgsV9atb7EZ38dEmy7+0ntN2AiCp2RbKL6l324ZId+TfGZdWQSenUJZu/zDm9oRf1VNXIiX82SYMUSC3SJkmbKyTu+pJQP7ScA86IsWMGwa15r+A7Hbf2FFYegoMYUsUyDZN4WO3YqrDGb1PLEwsiwK3Ogobb+3vWbLXr0sj4J5kH9RcIaApjtUSgnFzAe1UIorKG2vnB6WDuiDDNmvg7qhWICbTcdPbB/yhNdf6nyAqeE1Y0+phtNglVHmEc1C0u8A9s4e0hXp/LC7763w+WgrkcM4p9O1Md0Srrky+gPbtcDmw4m2sOb+pQtHtojmh9BWliwnfIed5F+mzbMyG1H9yx1gLnnA2jfU/R52jCjaD/idzfmEiAOtb99l59rPxIaQr7OTPiWIZnQ2/v1jRTv9f1+a5y9xskxYfYZofa2+/7aRkMLWJhd7RGN+v4sbdu0yThBRVot9rQ9/Lxt07Qz2xb+DBWz1919Tt92thRbMCvr3aP1LcX2ty41/CEN2grjtIk/RbePGd/XNw80G5oHrjPuc82PHtKK8bpi8udbST2msaV4ZGPLoiPj017+rBe1OXvb3nR1SWu5vcxIF/QFrtb0VT6vhe2f/Q2BP2t7eDgz7mqvfNz+87P2kP/Tzar/Na2/l7WLpXd+r24Eu6st/Wf8KbjH3x3+Vvn3+ra6xzb5n/CnVoCKehUurFUaiiJDQw/z8Cb/n/MnCylM6PiBlwgDZXLh9RfcMuHjNtsUOpGIHiakJq8jmPSRN6D4qGm5lqEYHi4QCI1GZKgs6zgTW9qRH3RzlHn+FKFrTmyHkh/bTc3dj7rVzJ2G+nTeRK1ulX/YjXvett+45+2ht0F62XYbpJevvanUPf7cxIzH3qKrWnuLrurnhmcbb5Kzhxn/b2/GN8+fO5nxpBtFTm+HNQnxv3+f226OjJP8nrfdnN6qrWDGPz+3hN17G8G9Nwj8uV1xHH/9K27+nFX0OKU8CeZJNyb/L+z3uTDEVBmJAAAAAElFTkSuQmCC',
  },
  LGK = {
    'Snow Kids': '⟦sk⟧', Shadows: '⟦sh⟧', 'Team Paradisia': '⟦pa⟧', Lightnings: '⟦lt⟧', Wambas: '⟦wa⟧', Rykers: '⟦ry⟧',
    Xenons: '⟦xe⟧', 'Tigres Rouges': '⟦ti⟧', Pirates: '⟦pi⟧', Elektras: '⟦el⟧', Cyclopes: '⟦cy⟧',
    'Vortex': '⟦kd⟧', Technodroids: '⟦te⟧', 'Comet': '⟦vg⟧',
  },
  LGU = {};
if (typeof LGX !== 'undefined') Object.assign(LGB, LGX);
// Transforme un logo codé en adresse d'image utilisable.
const lgU = (k) => {
  if (LGU[k]) return LGU[k];
  let u = 'data:image/png;base64,' + LGB[k];
  try {
    const b = atob(LGB[k]),
      a = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    u = URL.createObjectURL(new Blob([a], { type: 'image/png' }));
  } catch (e) {}
  return (LGU[k] = u);
};
// ===== Écusson d'équipe créé dans l'éditeur =====
// Un écusson est un code texte ⟦~forme.motif.symbole.fond.motif.symbole⟧ (couleurs en hexadécimal sans « # »).
// Il est dessiné en image vectorielle puis affiché comme les logos des équipes.
const CR_SH = [
    ['Classique', 'M10 8H90V60Q90 100 50 114Q10 100 10 60Z'],
    ['Rond', 'M4 60a46 46 0 1 0 92 0a46 46 0 1 0 -92 0Z'],
    ['Pointe', 'M10 10L50 2L90 10V65L50 114L10 65Z'],
    ['Hexagone', 'M50 4L92 28V82L50 116L8 82V28Z'],
    ['Losange', 'M50 2L96 60L50 118L4 60Z'],
    ['Arrondi', 'M18 8H82Q94 8 94 20V84Q94 112 50 114Q6 112 6 84V20Q6 8 18 8Z'],
    ['Arche', 'M8 116V45Q8 4 50 4Q92 4 92 45V116Z'],
    ['Pentagone', 'M50 4L94 36L78 112H22L6 36Z'],
  ],
  CR_PT = [
    ['Uni', ''],
    ['Bande', '<rect x="38" y="0" width="24" height="120" fill="B"/>'],
    ['Moitié', '<rect x="50" y="0" width="60" height="120" fill="B"/>'],
    ['Diagonale', '<path d="M0 30L100 100V120H0Z" fill="B"/>'],
    ['Rayures', '<rect x="22" y="0" width="14" height="120" fill="B"/><rect x="64" y="0" width="14" height="120" fill="B"/>'],
    ['Chevron', '<path d="M0 40L50 76L100 40V64L50 100L0 64Z" fill="B"/>'],
    ['Ceinture', '<rect x="0" y="46" width="100" height="26" fill="B"/>'],
    ['Haut', '<rect x="0" y="0" width="100" height="52" fill="B"/>'],
    ['Croix', '<rect x="40" y="0" width="20" height="120" fill="B"/><rect x="0" y="44" width="100" height="20" fill="B"/>'],
    ['Quartiers', '<rect x="50" y="0" width="50" height="58" fill="B"/><rect x="0" y="58" width="50" height="62" fill="B"/>'],
  ],
  CR_SY = [
    ['Étoile', '<path d="M50 26L58 47L80 48L63 62L69 84L50 72L31 84L37 62L20 48L42 47Z"/>'],
    ['Éclair', '<path d="M56 24L34 64H49L43 96L68 54H53Z"/>'],
    ['Ballon', '<circle cx="50" cy="60" r="28" fill="none" stroke-width="6"/><path d="M50 46L62 55L57 69H43L38 55Z"/>'],
    ['Flamme', '<path d="M50 22C56 40 74 48 70 70C68 90 32 90 30 68C30 56 40 52 40 40C46 46 48 40 50 22Z"/>'],
    ['Couronne', '<path d="M27 82L23 44L40 60L50 34L60 60L77 44L73 82Z"/>'],
    ['Flocon', '<path d="M50 26V94M21 43L79 77M21 77L79 43" fill="none" stroke-width="7" stroke-linecap="round"/>'],
    ['Lune', '<path d="M60 28A28 28 0 1 0 60 92A22 22 0 1 1 60 28Z"/>'],
    ['Soleil', '<circle cx="50" cy="60" r="15"/><path d="M50 24V34M50 86V96M14 60H24M76 60H86M25 35L32 42M68 78L75 85M75 35L68 42M32 78L25 85" fill="none" stroke-width="6" stroke-linecap="round"/>'],
    ['Diamant', '<path d="M50 28L74 52L50 92L26 52Z"/>'],
    ['Cœur', '<path d="M50 88C18 64 22 34 40 34C46 34 50 40 50 45C50 40 54 34 60 34C78 34 82 64 50 88Z"/>'],
    ['Cible', '<circle cx="50" cy="60" r="28" fill="none" stroke-width="7"/><circle cx="50" cy="60" r="10"/>'],
    ['Croix', '<path d="M42 28H58V50H80V68H58V92H42V68H20V50H42Z"/>'],
    ['Triangle', '<path d="M50 28L78 84H22Z"/>'],
    ['Vagues', '<path d="M22 50Q36 38 50 50T78 50M22 66Q36 54 50 66T78 66M22 82Q36 70 50 82T78 82" fill="none" stroke-width="6" stroke-linecap="round"/>'],
    ['Planète', '<circle cx="50" cy="60" r="17"/><ellipse cx="50" cy="60" rx="32" ry="9" fill="none" stroke-width="5" transform="rotate(-22 50 60)"/>'],
    ['Griffes', '<path d="M30 30L42 30L52 92L40 92ZM46 30L58 30L68 92L56 92ZM62 30L74 30L84 92L72 92Z"/>'],
    ['Œil', '<path d="M18 60Q50 28 82 60Q50 92 18 60Z"/><circle cx="50" cy="60" r="9" fill="B"/>'],
    ['Flèche', '<path d="M50 26L76 56H60V92H40V56H24Z"/>'],
    ['Comète', '<circle cx="64" cy="48" r="14"/><path d="M54 56L22 92L66 62Z M50 44L16 70L56 52Z"/>'],
    ['Aucun', ''],
  ],
  CR_DEF = { s: 0, p: 1, y: 0, a: 'e5484d', b: 'ffd24a', c: 'ffffff' },
  crHex = (v, d) => (/^[0-9a-f]{6}$/i.test(String(v || '').replace('#', '')) ? String(v).replace('#', '').toLowerCase() : d);
// Lit un code d'écusson (retourne null si ce n'est pas un écusson).
function crParse(e) {
  const m = /^⟦~([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9a-f]{6})\.([0-9a-f]{6})\.([0-9a-f]{6})⟧$/.exec(e || '');
  return m ? { s: +m[1], p: +m[2], y: +m[3], a: m[4], b: m[5], c: m[6] } : null;
}
// Fabrique le code texte d'un écusson.
const crCode = (c) => `⟦~${c.s}.${c.p}.${c.y}.${crHex(c.a, 'e5484d')}.${crHex(c.b, 'ffd24a')}.${crHex(c.c, 'ffffff')}⟧`;
// Dessine un écusson en image vectorielle.
function crSvg(c) {
  const sh = CR_SH[c.s % CR_SH.length][1],
    pt = CR_PT[c.p % CR_PT.length][1].split('B').join('#' + c.b),
    sy = CR_SY[c.y % CR_SY.length][1]
      .split('fill="B"')
      .join('fill="#' + c.a + '"')
      .split('fill="none" stroke-width=')
      .join('fill="none" stroke="#' + c.c + '" stroke-width='),
    id = 'k' + c.s + c.p;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><defs><clipPath id="${id}"><path d="${sh}"/></clipPath></defs><path d="${sh}" fill="#${c.a}"/><g clip-path="url(#${id})">${pt}</g><path d="${sh}" fill="none" stroke="#0b0b1a" stroke-width="6" stroke-linejoin="round"/><path d="${sh}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" transform="translate(50 60) scale(.93) translate(-50 -60)"/><g fill="#${c.c}" stroke="#0b0b1a" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke" transform="translate(50 60) scale(1.05) translate(-50 -60)">${sy}</g></svg>`;
}
// Image (data:) d'un écusson, gardée en mémoire.
const CRU = {};
const crU = (code) => {
  const c = crParse(code);
  if (!c) return '';
  return CRU[code] || (CRU[code] = 'data:image/svg+xml;utf8,' + encodeURIComponent(crSvg(c)));
};
// État de l'écusson dans l'éditeur d'équipe.
const crCur = (q) => crParse(q.e) || q.cr || (q.cr = Object.assign({}, CR_DEF, { a: crHex(q.c1, CR_DEF.a), b: crHex(q.c2, CR_DEF.b) }));
// Recopie l'écusson dans le champ caché pour que l'éditeur le garde au prochain affichage.
function crSync(q) {
  const h = document.getElementById('ee');
  if (h) h.value = q.e;
}
// Change un réglage de l'écusson (forme, motif, symbole ou couleur).
function crSet(k, v) {
  snap();
  const q = V.fv,
    c = Object.assign({}, crCur(q));
  c[k] = k == 'a' || k == 'b' || k == 'c' ? crHex(v, c[k]) : +v;
  q.cr = c;
  q.e = crCode(c);
  crSync(q);
  render();
}
// Tire un écusson au hasard (avec les couleurs de l'équipe).
function crRnd() {
  snap();
  const q = V.fv,
    c = Object.assign({}, crCur(q)),
    r = (n) => (Math.random() * n) | 0;
  c.s = r(CR_SH.length);
  c.p = r(CR_PT.length);
  c.y = r(CR_SY.length - 1);
  q.cr = c;
  q.e = crCode(c);
  crSync(q);
  render();
}
// Reprend les couleurs principale et secondaire de l'équipe pour l'écusson.
function crTeam() {
  snap();
  const q = V.fv,
    c = Object.assign({}, crCur(q), { a: crHex(q.c1, 'e5484d'), b: crHex(q.c2, 'ffd24a') });
  q.cr = c;
  q.e = crCode(c);
  crSync(q);
  render();
}
// Applique un modèle (forme, motif, symbole) en gardant les couleurs.
function crMod(s, p, y) {
  snap();
  const q = V.fv,
    c = Object.assign({}, crCur(q), { s, p, y });
  q.cr = c;
  q.e = crCode(c);
  crSync(q);
  render();
}
// Modèles prêts à l'emploi (forme, motif, symbole).
const CR_MOD = [[0,1,0],[1,0,2],[2,3,1],[3,6,3],[4,0,8],[5,4,4],[6,2,6],[7,5,0],[0,8,11],[1,9,14],[2,7,12],[3,0,15]];
// Panneau de l'éditeur d'écusson.
function crEd(q) {
  const c = crCur(q),
    im = (x, n) => `<img class="crim" alt="${n || ''}" src="${crU(crCode(x))}">`,
    sw = (k, l) => `<label>${l} <input type="color" value="#${c[k]}" onchange="crSet('${k}',this.value)" style="width:46px;height:34px;padding:2px"></label>`,
    legacy = q.e && !crParse(q.e) ? `<div class="mu" style="margin-top:6px">Emblème actuel : ${q.e}. Choisissez un modèle pour le remplacer par un écusson.</div>` : '';
  return `<div class="crw"><div class="crv"><div class="crbig">${crParse(q.e) ? im(c) : `<span class="crem">${q.e || '🏟️'}</span>`}</div><button type="button" onclick="crRnd()">Au hasard</button><button type="button" onclick="crTeam()" title="Reprendre les couleurs de l’équipe">Couleurs de l’équipe</button></div><div class="crc"><div class="mu">Modèles</div><div class="crg">${CR_MOD.map(([s, p, y]) => `<button type="button" class="crb${c.s == s && c.p == p && c.y == y && crParse(q.e) ? ' on' : ''}" onclick="crMod(${s},${p},${y})">${im(Object.assign({}, c, { s, p, y }))}</button>`).join('')}</div><div class="mu">Forme</div><div class="crg">${CR_SH.map((x, i) => `<button type="button" class="crb${c.s == i ? ' on' : ''}" title="${x[0]}" onclick="crSet('s',${i})">${im(Object.assign({}, c, { s: i }), x[0])}</button>`).join('')}</div><div class="mu">Motif</div><div class="crg">${CR_PT.map((x, i) => `<button type="button" class="crb${c.p == i ? ' on' : ''}" title="${x[0]}" onclick="crSet('p',${i})">${im(Object.assign({}, c, { p: i }), x[0])}</button>`).join('')}</div><div class="mu">Symbole</div><div class="crg">${CR_SY.map((x, i) => `<button type="button" class="crb${c.y == i ? ' on' : ''}" title="${x[0]}" onclick="crSet('y',${i})">${im(Object.assign({}, c, { y: i }), x[0])}</button>`).join('')}</div><div class="ctl" style="margin-top:8px">${sw('a', 'Fond')}${sw('b', 'Motif')}${sw('c', 'Symbole')}</div>${legacy}</div></div>`;
}
// Remplace les codes ⟦xx⟧ du texte par le logo correspondant (et les codes ⟦~…⟧ par l'écusson créé).
const lgR = (v) =>
  v
    .replace(/⟦~[0-9a-f.]+⟧/g, (m) => `<img class="tlg" alt="" src="${crU(m)}">`)
    .replace(/⟦([a-z]{2})⟧/g, (m, k) => `<img class="tlg" alt="" src="${lgU(k)}">`);
// Applique les logos aux équipes concernées.
function lgSync() {
  if (!S) return;
  [S.teams, S.alt && S.alt.teams].forEach((a) =>
    (a || []).forEach((t) => {
      if (LGK[t.name] && t.em != LGK[t.name]) t.em = LGK[t.name];
    }),
  );
}

// Contenu caché : données.
const MKD = JSON.parse(
  decodeURIComponent(
    escape(
      atob(
        'eyJuIjogIkZDIE1vdWtpciIsICJlbSI6ICLwn4y/IiwgIm5lIjogIvCfjI0iLCAibCI6IDE0LCAicGFsIjogWyIjMTQxNDFhIiwgIiNkMWFhMWEiXSwgImFjIjogIiNlMmJiMjAiLCAibmF0IjogIlRlcnJlIiwgImIiOiAiS3Jvc2UiLCAicm8iOiBbWyJTdXVuYSIsICJNSUQiLCA4NSwgNzUsIDMyXSwgWyJEamlicmlsIiwgIkFUVCIsIDY5LCA2NSwgMjJdLCBbIkNvbW9yaWVuIiwgIk1JRCIsIDcyLCA2NSwgMjddLCBbIkRpcmRpciIsICJBVFQiLCA5MCwgNzUsIDMzXSwgWyJUaWxlIiwgIkRFRiIsIDcwLCA2OSwgMjVdLCBbIk9zbW9vbmQiLCAiREVGIiwgNzUsIDcwLCAyOV0sIFsiWGVuYXZhcml1cyIsICJERUYiLCA2OCwgNzIsIDI0XSwgWyJKb2hhbmltYXRldXIiLCAiR0siLCA3NiwgNjUsIDI2XSwgWyJTdGlsbGZsb28iLCAiTUlEIiwgNjUsIDYwLCAyMV0sIFsiQXJzaGFybyIsICJBVFQiLCA3NiwgNzAsIDIyXSwgWyJUY2hhdMOpbWFuw6kiLCAiR0siLCA4MCwgNzAsIDI2XSwgWyJBYWxlZXNzIiwgIkFUVCIsIDc4LCA3MCwgMjZdLCBbIkdhcnJ5QXVMYWl0IiwgIk1JRCIsIDgxLCA2OSwgMjldLCBbIkRhbXNpdG8iLCAiREVGIiwgNzgsIDY1LCAyOF0sIFsiQXRow6luYSIsICJBVFQiLCA3NSwgNjAsIDI0XSwgWyJBbGxlcmxhIiwgIkRFRiIsIDcyLCA3MCwgMjVdLCBbIk5vclZpY2siLCAiTUlEIiwgNzcsIDY4LCAyNl0sIFsiSmVlaXdhYSIsICJNSUQiLCA3MywgNjcsIDIzXSwgWyJCYXJkamkiLCAiTUlEIiwgNzYsIDc1LCAzMV0sIFsiQ2xhcmVuY2UiLCAiR0siLCA4MCwgNzksIDI3XSwgWyJUaGlieiIsICJERUYiLCA3NSwgNjUsIDIzXSwgWyJZdXN1IiwgIk1JRCIsIDg4LCA3MiwgMzBdLCBbIktyb3NlIiwgIkRFRiIsIDgwLCA3MCwgMjZdXX0=',
      ),
    ),
  ),
);
LGK[MKD.n] = '⟦mk⟧';
MKD.em = '⟦mk⟧';
// Contenu caché : indique si c'est débloqué.
const mkU = () => {
  try {
    return localStorage.getItem('gm_mk') == '1';
  } catch (e) {
    return false;
  }
};
// Contenu caché.
const mkRos = () =>
  MKD.ro.map(([n, p, o, f, age]) => ({ n, p, o, e: 100, f, g: 0, og: MKD.nat, age, pr: 1 }));
// Contenu caché.
function mkReg() {
  FX[MKD.n] = BR.aura;
  FX[MKD.nat] = BR.aura;
  PAL[MKD.n] = PAL[MKD.nat] = MKD.pal;
  ACC[MKD.n] = ACC[MKD.nat] = MKD.ac;
  PL[MKD.n] = MKD.nat;
  if (!X[MKD.n]) X[MKD.n] = mkRos();
}
// Contenu caché.
function mkHas(n) {
  return !!S && [S.teams, S.alt && S.alt.teams].some((a) => a && a.some((t) => t.name == n));
}
// Contenu caché.
function mkSync() {
  mkReg();
  const wl = !!V.mkp || mkHas(MKD.n),
    wt = !!V.mkp || mkHas(MKD.nat) || (!S && mkU()),
    il = TL.findIndex((x) => x[0] == MKD.n),
    it = TN.findIndex((x) => x[0] == MKD.nat);
  if (wl && il < 0) TL.push([MKD.n, MKD.l, MKD.em]);
  else if (!wl && il >= 0) TL.splice(il, 1);
  if (wt && it < 0) TN.push([MKD.nat, MKD.l, MKD.ne]);
  else if (!wt && it >= 0) TN.splice(it, 1);
  useT();
}
// Contenu caché.
const mkTile = () =>
  mkU()
    ? `<button onclick="load('Création du club…',()=>{V.mkp=1;mkSync();init(TL.length-1,'${V.nm || 'L'}');V.mkp=0;render()})">${MKD.em} ${MKD.n}<br><span class="mu">Niveau ${MKD.l}/20 · équipe cachée</span><br><span class="mu"><b>Prise en main équilibrée</b></span></button>`
    : '';
// Contenu caché.
function mkJoin() {
  const k = S.mk;
  if (!k || k.in || S.ctx == 'C' || S.teams.some((t) => t.name == MKD.n)) return;
  const t = {
      name: MKD.n,
      em: MKD.em,
      sq: mkRos().filter((p) => p.n != MKD.b),
      form: '2-3-1',
      m: 1,
      lu: [],
      pts: 0,
      pl: 0,
      gf: 0,
      ga: 0,
      w: 0,
      d: 0,
      l: 0,
    },
    u = me(),
    kp = u.sq.find((p) => p.n == MKD.b);
  let g = 0;
  if (kp) {
    g = Math.round(k.pp * 2.5);
    rmP(u, kp);
    delete kp.nz;
    kp.e = 100;
    kp.og = MKD.nat;
    t.sq.push(kp);
  } else t.sq.push(mkRos().find((p) => p.n == MKD.b));
  autoLU(t);
  S.teams.push(t);
  k.in = S.season + 1;
  try {
    localStorage.setItem('gm_mk', '1');
  } catch (e) {}
  mkSync();
  if (g) {
    S.cash += g;
    S.fn['Transferts'] = (S.fn['Transferts'] || 0) + g;
    S.tx.unshift([S.md + 1, 'Transferts', g]);
  }
  mail(
    kp ? 'Offre de rachat : ' + MKD.b : 'Message de ' + MKD.n,
    kp
      ? 'Manager,\n\n' +
          MKD.n +
          ' fait son entrée dans la Galactik League cette saison. Nous avons appris que vous aviez recruté ' +
          MKD.b +
          ' : il nous appartient, et nous le reprenons.\n\nNotre offre n’est pas négociable : ' +
          g.toLocaleString('fr-FR') +
          ' crédits, soit 2,5 fois les ' +
          k.pp.toLocaleString('fr-FR') +
          ' crédits que vous avez payés. La somme est déjà sur le compte du club et ' +
          MKD.b +
          ' a rejoint notre effectif.\n\nNous nous retrouverons sur le terrain.'
      : 'Manager,\n\n' +
          MKD.n +
          ' fait son entrée dans la Galactik League cette saison. Nous cherchions ' +
          MKD.b +
          ', mais il a déjà quitté votre club : nous nous sommes arrangés ailleurs.\n\nNous nous retrouverons sur le terrain.',
  );
  S.mail[0].f = {
    n: 'Direction de ' + MKD.n,
    e: 'direction@' + slug(MKD.n) + '.gal',
    i: MKD.em,
    k: MKD.pal[1],
  };
}


// ======================================================================
// MARCHÉ DES TRANSFERTS, STAFF ET PRÊTS
// ======================================================================
// Génère une nouvelle liste de joueurs disponibles sur le marché (noms inventés, notes, prix).
function mkt() {
  const U = new Set((S ? S.teams : []).flatMap((t) => t.sq.map((p) => p.n))),
    r = Math.random,
    A = ['Kael', 'Nyra', 'Zane', 'Orin', 'Juno', 'Rex', 'Mira', 'Tovi'],
    B = ['Voss', 'Korr', 'Nyx', 'Reyes', 'Storm', 'Fenn', 'Kell', 'Doyle'];
  const L = Array.from({ length: 8 }, () => ({
      n: uname(U, A, B),
      p: POS[(r() * 4) | 0],
      o: (55 + r() * 25 + skV('f2') + mgb('mk')) | 0,
      e: 100,
      f: (30 + r() * 60) | 0,
      g: 0,
      og: S && S.ctx == 'C' && S.teams[S.t] ? S.teams[S.t].name : S && S.ctx != 'C' && S.teams && S.teams[S.t] && r() < 0.2 ? S.teams[S.t].name : T[(r() * T.length) | 0][0],
    })),
    used = new Set(),
    put = (pool, pr) => {
      const fr = pool.filter((x) => !U.has(x[0]));
      if (!fr.length) return;
      const x = fr[(r() * fr.length) | 0];
      let i;
      do i = (r() * L.length) | 0;
      while (used.has(i));
      used.add(i);
      U.add(x[0]);
      const q = {
        n: x[0],
        p: x[1],
        o: x[2] + skV('f2'),
        e: 100,
        f: x[4] || (75 + r() * 20) | 0,
        g: 0,
        c: 1,
        rare: 1,
        og: x[3],
      };
      if (x[5]) {
        q.age = x[5].a;
        q.pt = x[5].pt;
        q.ct = 3;
        q.mp = 0;
        if (x[5].fic) q.c = 0;
      }
      if (pr) q.pr = 1;
      L[i] = q;
    };
  if (r() < 0.3) put(RARE, 0);
  if (r() < 0.1) put(PRISM, 1);
  if (S && S.ctx != 'C' && !S.mk && !mkU() && !U.has(MKD.b) && r() < 0.025) {
    const b = MKD.ro.find((x) => x[0] == MKD.b);
    if (b) {
      put([[b[0], b[1], b[2], MKD.nat, b[3]]], 1);
      const q = L.find((x) => x.n == b[0]);
      if (q) {
        q.mkb = 1;
        q.age = b[4];
      }
    }
  }
  return L;
}
// Page « Transferts » de la League : marché, staff, coachs, prêts.
// Sous-onglet de la page Transferts.
// Depuis l'aperçu : ouvre l'onglet Recherche déjà filtré sur ce joueur.
function mkRcFresh() {
  V.mkf = MKF0();
  mtTab('rc');
}
function mtGoP(n) {
  V.mkf = MKF0();
  V.mkf.q = n;
  mtTab('rc');
}
function mtTab(k) {
  V.mt = k;
  render();
}
// Ajoute / retire un joueur de la liste des convoités (par nom).
function wlN(n) {
  S.wl = S.wl || [];
  const k = S.wl.indexOf(n);
  if (k >= 0) S.wl.splice(k, 1);
  else S.wl.push(n);
  save();
  if (V.mt == 'rc') mkRef(true);
  else render();
}
// Retire un joueur de la liste des convoités (par position dans la liste).
function wlD(j) {
  (S.wl = S.wl || []).splice(j, 1);
  save();
  render();
}
// ===== MARCHÉ façon FOOTBALL MANAGER : tous les joueurs disponibles à cette saison =====
// Équipe (hors la vôtre) qui possède ce joueur, ou null (agent libre / introuvable).
function plOwner(n) {
  return S.teams.find((t) => t !== me() && (t.sq || []).some((p) => p.n == n)) || null;
}
// Joueur offert à l'achat (club adverse ou agent libre), ou undefined.
function plFindS(n) {
  const t = plOwner(n);
  return (t && t.sq.find((p) => p.n == n)) || (S.mkt || []).find((p) => p.n == n);
}
// Idem, avec repli sur le joueur d'une négociation (offres déjà déposées).
const plFind = (n) => plFindS(n) || ((S.no || []).find((q) => q.n == n) || {}).p;
const mkEsc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Liste de tous les joueurs achetables : clubs de la Ligue (les équipes arrivées plus tard n'y sont qu'à partir de leur saison) et agents libres.
function mkPool() {
  const out = [],
    seen = new Set(),
    mk = mkU(),
    hid = new Set(MKD.ro.map((x) => x[0]));
  try {
    S.teams.forEach((t) => {
      if (t === me() || (!mk && t.name == MKD.n)) return;
      (t.sq || []).forEach((p) => {
        if (!p || !p.n || seen.has(p.n) || (!mk && hid.has(p.n))) return;
        seen.add(p.n);
        try {
          ensure(p);
        } catch (e) {}
        out.push([p, t.name]);
      });
    });
    (S.mkt || []).forEach((p) => {
      if (p && p.n && !seen.has(p.n)) {
        seen.add(p.n);
        try {
          ensure(p);
        } catch (e) {}
        out.push([p, 'Agent libre']);
      }
    });
  } catch (e) {}
  return out;
}
// Nom du Fluide d'un joueur.
function plFlu(p) {
  const k = fluK(p);
  if (k == 'multi') return 'Multifluide';
  if (k == 'none') return 'Aucun';
  const f = typeof fxOf == 'function' ? fxOf(p.og || '') : null;
  return (f && f.n) || 'Aucun';
}
const MKF0 = () => ({ q: '', c: '', fl: '', pl: '', p: '', mn: 0, mx: 100, s: 'o', d: 1 });
// Joueurs filtrés et triés.
function mkRes() {
  const f = V.mkf || (V.mkf = MKF0()),
    q = f.q.trim().toLowerCase(),
    me0 = me().name;
  const A = mkPool().filter(
    ([p, c]) =>
      (!q || p.n.toLowerCase().includes(q)) &&
      (!f.p || p.p == f.p) &&
      (!f.c || c == f.c) &&
      (!f.pl || planet(p.og || c) == f.pl) &&
      (!f.fl || plFlu(p) == f.fl) &&
      p.o >= (f.mn || 0) &&
      p.o <= (f.mx || 100),
  );
  const PO = { GK: 0, DEF: 1, MID: 2, ATT: 3 },
    key = {
      po: ([p]) => PO[p.p],
      n: ([p]) => p.n,
      cl: ([, c]) => c,
      pf: ([p, c]) => planet(p.og || c) + ' ' + plFlu(p),
      cp: ([p]) => compat(p, me0),
      o: ([p]) => p.o,
      v: ([p]) => price(p),
      a: ([p]) => p.age || 99,
      p: ([p]) => potOf(p),
    }[f.s] || (([p]) => p.o),
    dir = f.d == -1 ? -1 : 1;
  A.sort((a, b) => {
    const x = key(a),
      y = key(b),
      r = typeof x == 'string' ? x.localeCompare(y) : x - y;
    return (r || b[0].o - a[0].o || a[0].n.localeCompare(b[0].n)) * (r ? dir : 1);
  });
  return A;
}
// Lignes de la liste (par paquets de 60 au fil du défilement).
function mkRows(A) {
  const wl = S.wl || [],
    lim = V.mlim || 60,
    act = new Set((S.no || []).filter(NEGACT).map((x) => x.n)),
    col = (x) => ({ GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' })[x] || '#888';
  return (
    A.slice(0, lim)
      .map(([p, c]) => {
        const cp = compat(p, me().name),
          n = mkEsc(p.n).replace(/'/g, '&#39;');
        return `<div class="mkr" data-n="${mkEsc(p.n)}" onclick="prof('nm',this.dataset.n)"><b class="mkp" style="color:${col(p.p)}">${p.p}</b><span class="mkn"><b>${p.c ? '★ ' : ''}${p.n}</b><small>${p.age || '—'} ans</small></span><span class="mkc">${c}</span><span class="mkl2">${planet(p.og || c)}<small>${plFlu(p)}</small></span><span class="mkx ${cp >= 70 ? 'g' : cp >= 40 ? 'o' : 'r'}">${cp} %</span><span class="fvr ${p.o >= 70 ? 'g' : p.o >= 50 ? 'o' : 'r'}">${p.o}</span><b class="mkv" title="${mkEsc(prTip(p))}">${price(p)}</b><span class="mka"><button class="mtw ${wl.includes(p.n) ? 'on' : ''}" title="Suivre" onclick="event.stopPropagation();wlN(this.closest('.mkr').dataset.n)"><svg class="ic" aria-hidden="true"><use href="#i-star"/></svg></button><button class="p" onclick="event.stopPropagation();ofOpenN(this.closest('.mkr').dataset.n)">${act.has(p.n) ? 'Offre en cours' : 'Offre'}</button></span></div>`;
      })
      .join('') || '<div class="mu" style="padding:10px">Aucun joueur ne correspond à cette recherche.</div>'
  );
}
// Détail du prix (infobulle) : valeur de base, performances et statistiques.
function prTip(p) {
  const i = priceInfo(p),
    pc = (x) => (x >= 0 ? '+' : '') + Math.round(x * 100) + ' %';
  return `Valeur de base ${i.b} · performances ${pc(i.fp)} · statistiques ${pc(i.fs)}`;
}
// Texte du compteur de résultats.
const mkCnt = (A) => `${A.length} joueur${A.length > 1 ? 's' : ''} · ${Math.min(A.length, V.mlim || 60)} affiché${Math.min(A.length, V.mlim || 60) > 1 ? 's' : ''}`;
// Actualise la liste sans toucher aux filtres (le champ de recherche garde le focus).
function mkRef(keepScroll) {
  const e = document.getElementById('mkl'),
    c = document.getElementById('mkc');
  if (!e) return;
  const A = mkRes(),
    y = e.scrollTop;
  e.innerHTML = mkRows(A);
  if (c) c.textContent = mkCnt(A);
  e.scrollTop = keepScroll ? y : 0;
}
// Modifie un filtre.
function mkF(k, v) {
  const f = V.mkf || (V.mkf = MKF0());
  f[k] = typeof f[k] == 'number' ? +v : v;
  if (k == 's') {
    f.d = ['po', 'n', 'cl', 'pf', 'a'].includes(v) ? 1 : -1;
    const e = document.getElementById('mkhd');
    if (e) e.innerHTML = mkHd();
  }
  V.mlim = 60;
  mkRef();
}
// Remet tous les filtres à zéro.
function mkReset() {
  V.mkf = MKF0();
  V.mlim = 60;
  render();
}
// Charge la suite de la liste quand on arrive en bas.
function mkScroll(e) {
  if (e.scrollTop + e.clientHeight >= e.scrollHeight - 80 && (V.mlim || 60) < mkRes().length) {
    V.mlim = (V.mlim || 60) + 60;
    mkRef(true);
  }
}
// En-têtes cliquables : un clic trie, un second clic inverse l'ordre.
function mkHd() {
  const f = V.mkf || MKF0(),
    h = (k, l, c) => `<span class="mks${f.s == k ? ' on' : ''}${c ? ' ' + c : ''}" role="button" tabindex="0" title="Trier par ${l.toLowerCase()}" onclick="mkSort('${k}')">${l}${f.s == k ? (f.d == -1 ? ' ▼' : ' ▲') : ''}</span>`;
  return h('po', 'Poste') + h('n', 'Joueur') + h('cl', 'Équipe', 'mkc') + h('pf', 'Planète · Fluide', 'mkl2') + h('cp', 'Compat.') + h('o', 'Niv.') + h('v', 'Prix') + '<span></span>';
}
// Trie par une colonne : texte croissant (A→Z) d'abord, nombres décroissants (les plus forts d'abord) ; second clic = ordre inverse.
function mkSort(k) {
  const f = V.mkf || (V.mkf = MKF0());
  if (f.s == k) f.d = f.d == -1 ? 1 : -1;
  else {
    f.s = k;
    f.d = ['po', 'n', 'cl', 'pf'].includes(k) ? 1 : -1;
  }
  V.mlim = 60;
  const e = document.getElementById('mkhd');
  if (e) e.innerHTML = mkHd();
  mkRef();
}
// Onglet « Recherche » : tous les joueurs disponibles, avec recherche et filtres.
function mkSearch() {
  const f = V.mkf || (V.mkf = MKF0()),
    P = mkPool(),
    A = mkRes(),
    uniq = (fn) => [...new Set(P.map(fn))].sort((a, b) => a.localeCompare(b)),
    sel = (k, L, v) => `<select onchange="mkF('${k}',this.value)">${L.map(([x, l]) => `<option value="${mkEsc(x)}" ${v == x ? 'selected' : ''}>${l}</option>`).join('')}</select>`,
    lv = [0, 40, 50, 60, 70, 80, 90];
  return `<div class="card"><b>Marché des transferts</b>${hp('mks')}<div class="mu" style="margin:4px 0 8px">Tous les joueurs disponibles à cette saison. Touchez un joueur pour voir sa fiche, ou « Offre » pour négocier avec son club.</div><div class="ctl mkfl"><input placeholder="🔍 Nom du joueur" value="${mkEsc(f.q)}" oninput="mkF('q',this.value)" style="width:150px">${sel('c', [['', 'Toutes les équipes'], ...uniq(([, c]) => c).map((x) => [x, x])], f.c)}${sel('fl', [['', 'Tous les Fluides'], ...uniq(([p]) => plFlu(p)).map((x) => [x, x])], f.fl)}${sel('pl', [['', 'Toutes les planètes'], ...uniq(([p, c]) => planet(p.og || c)).map((x) => [x, x])], f.pl)}${sel('p', [['', 'Tous postes'], ['GK', 'Gardiens'], ['DEF', 'Défenseurs'], ['MID', 'Milieux'], ['ATT', 'Attaquants']], f.p)}${sel('mn', lv.map((x) => [x, x ? 'Niveau min. ' + x : 'Niveau min.']), f.mn)}${sel('mx', lv.slice(1).concat([100]).map((x) => [x, x == 100 ? 'Niveau max.' : 'Niveau max. ' + x]), f.mx)}${sel('s', [['o', 'Tri : Niveau'], ['p', 'Tri : Potentiel'], ['v', 'Tri : Prix'], ['a', 'Tri : Âge'], ['cp', 'Tri : Compatibilité'], ['n', 'Tri : Nom'], ['po', 'Tri : Poste'], ['cl', 'Tri : Équipe'], ['pf', 'Tri : Planète']], f.s)}<button onclick="mkReset()">Réinitialiser</button></div><div class="mu" id="mkc" style="margin:6px 0">${mkCnt(A)}</div><div class="mkh" id="mkhd">${mkHd()}</div><div id="mkl" class="mkl" onscroll="mkScroll(this)">${mkRows(A)}</div></div>`;
}
// Page Transferts : aperçu, recherche, prêts, convoités, staff.
function mktViewL() {
  const t = me(),
    k = V.mt || 'ap',
    wl = S.wl || [],
    col = (q) => ({ GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' })[q] || '#888',
    chip = (r) => `<span class="fvr ${r >= 70 ? 'g' : r >= 50 ? 'o' : 'r'}">${r}</span>`,
    orig = (p) => (typeof planet == 'function' && planet(p.og)) || p.og || '—',
    L = (S.tl || []).filter((x) => x.s == S.season),
    kk = (q) => L.filter((x) => x.k == q),
    sm = (A) => A.reduce((a, x) => a + x.a, 0),
    lns = L.filter((x) => x.k == 'lin' || x.k == 'lout'),
    LT = (S.lt || []).filter((x) => x.s == S.season),
    spent = sm(kk('in')) + sm(kk('lin')),
    gain = sm(kk('out')) + sm(kk('lout')),
    top = L.slice().sort((a, b) => b.a - a.a)[0],
    star = (n) => {
      const on = wl.includes(n);
      return `<button class="mtw ${on ? 'on' : ''}" data-n="${mkEsc(n)}" title="${on ? 'Retirer des convoités' : 'Ajouter aux convoités'}" onclick="event.stopPropagation();wlN(this.dataset.n)"><svg class="ic" aria-hidden="true"><use href="#i-star"/></svg></button>`;
    },
    PO = mkPool(),
    log = (A, ti, tag, hk) =>
      `<div class="card fvc"><div class="fvh"><b>${ti}</b>${hk ? hp(hk) : ''}<span class="mu">${A.length}</span></div><div class="fvth"><span>Joueur</span><span>Note</span><span>Club</span><span>Montant</span><span>Date</span></div><div class="fvtb">${
        A.map(
          (x) =>
            `<div class="fvtr"><span class="fvj">${tag ? `<em class="fvg2 ${x.k == 'lin' ? 'i' : 'o'}">${x.k == 'lin' ? 'In' : 'Out'}</em>` : ''}${x.n}</span>${chip(x.r)}<span class="fvcl">${x.c}</span><b style="color:${x.k == 'in' || x.k == 'lin' ? '#d33' : 'var(--ok)'}">${x.k == 'in' || x.k == 'lin' ? '−' : '+'}${x.a}</b><span class="mu">${fmtDay(x.d)}</span></div>`,
        ).join('') || '<div class="mu" style="padding:8px 2px">Aucun mouvement cette saison.</div>'
      }</div><div class="fvft"><span>Total</span><b>${sm(A)}</b></div></div>`,
    kpi = (l, v) => `<div class="fvk"><small>${l}</small><b>${v}</b></div>`,
    tb = [['ap', 'Aperçu'], ['rc', 'Recherche'], ['of', 'Offres (' + (S.no || []).filter(NEGACT).length + ')'], ['pr', 'Prêts'], ['cv', 'Convoités (' + wl.length + ')'], ['st', 'Staff']],
    head = `<div class="fvw"><div class="fvk6 mtk">${kpi('Crédits', S.cash)}${kpi('Effectif', sqN(t) + '/15' + (rvN(t) ? ' +' + rvN(t) + ' rés.' : ''))}${kpi('Joueurs disponibles', PO.length)}${kpi('Offres en cours', (S.no || []).filter(NEGACT).length)}</div><div class="tvt mtt">${tb.map(([q, l]) => `<button class="${k == q ? 'on' : ''}" onclick="mtTab('${q}')">${l}</button>`).join('')}</div>`;
  let body = '';
  if (k == 'ap') {
    const best = PO.slice()
        .sort((a, b) => b[0].o - a[0].o)
        .slice(0, 8),
      wr = wl
        .map((n, j) => {
          const p = plFindS(n);
          return `<div class="mtr mtb" onclick="mtTab('cv')"><b class="mtp" style="color:${p ? col(p.p) : '#888'}">${p ? p.p : '—'}</b><span class="fvj">${n}</span>${p ? chip(p.o) : '<span class="mu">—</span>'}<span class="mu">${p ? price(p) : 'Indisponible'}</span></div>`;
        })
        .join('');
    body = `<div class="fvg2c"><div class="card fvc fvgo" onclick="if(!event.target.closest('.hp'))mkRcFresh()"><div class="fvh"><b>Meilleurs joueurs disponibles</b>${hp('mt1')}<span class="mu">${PO.length} joueurs</span></div><div class="mth"><span>Poste</span><span>Joueur</span><span>Note</span><span>Origine</span><span>Prix</span><span></span></div><div class="fvtb" style="max-height:340px">${best
      .map(
        ([p, c]) =>
          `<div class="mtr mtb" data-n="${mkEsc(p.n)}" onclick="mtGoP(this.dataset.n)"><b class="mtp" style="color:${col(p.p)}">${p.p}</b><span class="fvj">${p.n}</span>${chip(p.o)}<span class="fvcl">${c}</span><b>${price(p)}</b>${star(p.n)}</div>`,
      )
      .join('')}</div><div class="ctl" style="margin-top:8px"><button class="p" onclick="mtTab('rc')">Ouvrir la recherche</button></div></div>
    <div class="card fvc fvgo" onclick="if(!event.target.closest('.hp'))mtTab('cv')"><div class="fvh"><b>Joueurs convoités</b><span class="mu">${wl.length}</span></div><div class="fvtb" style="max-height:300px">${wr || '<div class="mu" style="padding:8px 2px">Touchez l’étoile d’un joueur pour le suivre ici.</div>'}</div><div class="ctl" style="margin-top:8px"><button class="p" onclick="mtTab('cv')">Liste des joueurs convoités</button></div></div></div>
    <div class="card fvc" style="margin-top:10px"><div class="fvh"><b>Transferts de la Ligue</b>${hp('mt2')}<span class="mu">${LT.length}</span></div><div class="mth mtl"><span>Poste</span><span>Joueur</span><span>Note</span><span>Départ</span><span>Arrivée</span><span>Montant</span><span>Date</span></div><div class="fvtb" style="max-height:260px">${
      LT.slice(0, 12)
        .map(
          (x) =>
            `<div class="mtr mtl"><b class="mtp" style="color:${col(x.p)}">${x.p}</b><span class="fvj">${x.n}</span>${chip(x.r)}<span class="fvcl">${x.f}</span><span class="fvcl"><b>${x.t}</b></span><b>${x.a}</b><span class="mu">${fmtDay(x.d)}</span></div>`,
        )
        .join('') || '<div class="mu" style="padding:8px 2px">Aucun transfert pour l’instant : les clubs de la Ligue s’échangent des joueurs au fil de la saison.</div>'
    }</div></div>
    <div class="fv3" style="margin-top:10px">${log(kk('in'), 'Arrivées', 0, 'fin2')}${log(kk('out'), 'Départs', 0)}${log(lns, 'Prêts', 1)}</div>
    <div class="card fvsum" style="margin-top:10px">${[['Mouvements', L.length], ['Total dépensé', spent], ['Total encaissé', gain], ['Solde', (gain - spent > 0 ? '+' : '') + (gain - spent)], ['Le plus cher', top ? top.n + ' (' + top.a + ')' : '—'], ['Prochaine actualisation', MKRC[mkRN()] != null ? MKRC[mkRN()] + ' cr.' : 'Aucune']].map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>`;
  } else if (k == 'rc') {
    body = mkSearch();
  } else if (k == 'of') {
    body = ofView();
  } else if (k == 'pr') {
    body = loanView();
  } else if (k == 'cv') {
    const av = wl.map((n, j) => [plFindS(n), j, n]),
      on = av.filter(([p]) => p),
      off = av.filter(([p]) => !p);
    body = `<h2>Liste des joueurs convoités</h2><div class="card">${
      on.length
        ? '<div class="mkh"><span>Poste</span><span>Joueur</span><span class="mkc">Équipe</span><span class="mkl2">Planète · Fluide</span><span>Compat.</span><span>Niv.</span><span>Prix</span><span></span></div>' +
          on
            .map(([p]) => {
              const c = plOwner(p.n) ? plOwner(p.n).name : 'Agent libre',
                cp = compat(p, me().name);
              return `<div class="mkr" data-n="${mkEsc(p.n)}" onclick="prof('nm',this.dataset.n)"><b class="mkp" style="color:${col(p.p)}">${p.p}</b><span class="mkn"><b>${p.n}</b><small>${p.age || '—'} ans</small></span><span class="mkc">${c}</span><span class="mkl2">${planet(p.og || c)}<small>${plFlu(p)}</small></span><span class="mkx ${cp >= 70 ? 'g' : cp >= 40 ? 'o' : 'r'}">${cp} %</span>${chip(p.o)}<b class="mkv">${price(p)}</b><span class="mka">${star(p.n)}<button class="p" onclick="event.stopPropagation();ofOpenN(this.closest('.mkr').dataset.n)">Offre</button></span></div>`;
            })
            .join('')
        : '<div class="mu">Aucun joueur suivi. Dans Recherche, touchez l’étoile d’un joueur pour l’ajouter ici.</div>'
    }${off
      .map(([p, j, n]) => `<div class="row"><span class="nm">${n} <span class="mu">n’est plus disponible</span></span><button onclick="wlD(${j})">Retirer</button></div>`)
      .join('')}</div>`;
  } else {
    body =
`<div class="card"><b>💰 ${S.cash} crédits</b> <span class="mu">(+80 par match, +150 par victoire)</span></div><h2>Stade</h2><div class="card"><div class="row"><span class="nm">Stade niv. ${S.st} · ${2000 * S.st} places <span class="mu">recette estimée à domicile : ${gate()}</span></span><button onclick="upS()" ${S.st >= 5 || S.cash < S.st * 1000 + 500 ? 'disabled' : ''}>+ ${S.st * 1000 + 500}</button></div><div class="row"><span class="nm">Prix du billet : ${S.tk} <span class="mu">(plus cher = moins de monde)</span></span><button onclick="S.tk=Math.max(5,S.tk-1);save();render()">−</button><button onclick="S.tk=Math.min(25,S.tk+1);save();render()">+</button></div></div><h2>Staff</h2><div class="stfg">` +
    Object.keys(NS)
      .map(
        (k) =>
          `<div class="card stfc"><span class="stfi">${STI[k]}</span><div class="stft"><b>${NS[k][0]}</b><span class="mu">${NS[k][1]}</span><span class="stfl" title="Niveau ${S.staff[k]} sur 5">${[1, 2, 3, 4, 5].map((n) => `<i${n <= S.staff[k] ? ' class="on"' : ''}></i>`).join('')}<em>niv. ${S.staff[k]}/5</em></span></div><button onclick="up('${k}')" ${S.staff[k] >= 5 || S.cash < S.staff[k] * 800 ? 'disabled' : ''}>${S.staff[k] >= 5 ? 'Max' : '+ ' + S.staff[k] * 800}</button></div>`,
      )
      .join('') +
    `</div>` +
    coachCard();
  }
  return head + body + '</div>' + ofModal();
}
// Coût des actualisations du marché entre deux matchs : 50 crédits puis 100 (maximum 2).
const MKRC = [50, 100];
// Nombre d'actualisations déjà faites avant ce match.
function mkRN() {
  return S.mkr && S.mkr.md == S.md ? S.mkr.n : 0;
}


// Améliore un poste du staff (entraîneur, kiné, analyste…) : coûte 800 crédits × niveau.
function up(k) {
  const c = S.staff[k] * 800;
  if (S.cash >= c && S.staff[k] < 5) {
    tx('Staff', -c);
    S.staff[k]++;
    save();
    render();
  }
}
// ===== NÉGOCIATION DES TRANSFERTS =====
// Acheter un joueur = déposer une offre. Le club répond au bout de 2 à 4 jours : acceptée, refusée, ou
// contre-offre (que l'on accepte ou refuse). Chaque négociation est enregistrée dans S.no :
// { n: nom, p: joueur, fee: offre, st: 'pend' | 'ctr' | 'acc' | 'rej' | 'exp', d0: jour de l'offre,
//   dr: jour de la réponse, cf: contre-offre, ex: dernier jour pour répondre, note: explication }.
const NEGACT = (x) => x.st == 'pend' || x.st == 'pl' || x.st == 'ctr' || x.st == 'pctr';
// Achat concret d'un joueur à un montant donné (vérifie l'argent et la place dans l'effectif).
function buyAt(np, fee) {
  const t = me();
  if (S.cash < fee || sqN(t) >= 15) return false;
  tx('Transferts', -fee);
  const ow = plOwner(np.n),
    i = S.mkt.findIndex((q) => q.n == np.n);
  tlog('in', np, ow ? ow.name : 'Marché', fee);
  if (i >= 0) S.mkt.splice(i, 1);
  else if (ow) {
    const j = ow.sq.findIndex((q) => q.n == np.n);
    if (j >= 0) ow.sq.splice(j, 1);
    autoLU(ow);
  }
  if (np.mkb) {
    S.mk = { b: S.season, pp: price(np) };
    delete np.mkb;
  }
  t.sq.push(np);
  join(np, t);
  return true;
}
// Ouvre la fenêtre d'offre pour un joueur (par nom).
function ofOpenN(n) {
  const p = plFindS(n);
  if (!p) return;
  V.mt = 'rc';
  ofFrom(p, (S.no || []).find((q) => q.n == p.n && NEGACT(q)));
}
// Numéros de maillot : choisis par le manager à l'achat (de 1 à 99, un seul joueur par numéro).
const numUser = (n, except) => me().sq.find((x) => x.n != except && pnum(me(), x) == n);
function numFree(pref, except) {
  let n = pref >= 1 && pref <= 99 ? pref : 2;
  for (let i = 0; i < 99 && numUser(n, except); i++) n = (n % 99) + 1;
  return n;
}
// Valeurs de départ d'une offre : transfert, prime de signature, salaire, prime de titre, durée.
function ofDef(p) {
  const d = { fee: price(p), sb: Math.max(1, Math.round(price(p) / 25)), sw: sal(p), tb: 0, ct: p.age >= 31 ? 2 : 3, num: numFree(p[numKey()] || 0, p.n) };
  for (let i = 0; i < 200 && plRatio(p, d) < 1.03; i++) d.sw++;
  return d;
}
function ofFrom(p, x, over) {
  const d = ofDef(p);
  V.of = Object.assign({ n: p.n }, d, x ? { fee: x.fee, sb: x.sb, sw: x.sw, tb: x.tb || 0, ct: x.ct, num: x.num || d.num } : {}, over || {});
  render();
}
// Règle une condition de l'offre (par pas, par pourcentage de la valeur ou valeur saisie).
function ofSet(v, rel, k) {
  if (!V.of) return;
  k = k || 'fee';
  const p = plFind(V.of.n) || ((S.no || []).find((q) => q.n == V.of.n) || {}).p,
    pr = p ? price(p) : 100,
    mn = k == 'sb' || k == 'tb' ? 0 : 1;
  if (k == 'num') v = Math.round(v);
  let n = rel == 'pct' ? (pr * v) / 100 : rel == 'add' ? V.of[k] + v : v;
  if (!(n >= mn)) n = mn;
  V.of[k] = Math.round(k == 'ct' ? Math.min(4, n) : k == 'num' ? Math.min(99, n) : n);
  render();
}
// Rang de force de votre équipe (0 = la plus forte) et chance estimée de gagner le titre.
function teamRk() {
  try {
    const f = (t) => t.sq.reduce((a, p) => a + p.o, 0) / Math.max(1, t.sq.length),
      k = S.teams.slice().sort((a, b) => f(b) - f(a)).indexOf(me());
    return k < 0 ? 3 : k;
  } catch (e) {
    return 3;
  }
}
const titleP = () => [0.45, 0.25, 0.14, 0.08, 0.05, 0.03][Math.min(5, teamRk())];
// Ce que le joueur attend (par match) et la valeur de votre proposition pour lui.
function plWant(p, o) {
  let cp = 100;
  try {
    cp = compat(p, me().name);
  } catch (e) {}
  let w = (sal(p) + price(p) / 900) * (1 + 0.02 * Math.min(teamRk(), 6));
  if (cp < 50) w *= 1.15;
  if (p.age <= 23 && o.ct == 1) w *= 1.1;
  if (p.age >= 31 && o.ct >= 3) w *= 1.1;
  return w;
}
const plVal = (o) => o.sw + o.sb / (12 * o.ct) + (o.tb * titleP()) / 12;
const plRatio = (p, o) => plVal(o) / plWant(p, o);
// Décision du club vendeur sur le montant du transfert.
function clubDecide(x) {
  const p = x.p,
    pr = price(p),
    r = x.fee / pr,
    ow = plOwner(x.n);
  if (ow && ow.sq.length <= 10) return ['rej', 'Le club ne peut pas se séparer d’un joueur de plus : son effectif est trop juste.'];
  if (r >= 1.1) return Math.random() < 0.95 ? ['acc'] : ['rej', 'Le club vendeur a finalement changé d’avis.'];
  if (r >= 1) return Math.random() < 0.8 ? ['acc'] : ['ctr', Math.round(pr * (1.05 + Math.random() * 0.1))];
  if (r >= 0.85) return ['ctr', Math.round(pr * (1 + Math.random() * 0.08))];
  if (r >= 0.7) return Math.random() < 0.35 ? ['ctr', Math.round(pr * 1.05)] : ['rej', 'Offre jugée insuffisante par le club vendeur.'];
  return ['rej', 'Offre jugée insultante : le club a refusé de discuter.'];
}
// Décision du joueur sur ses conditions personnelles.
function plDecide(x) {
  const p = x.p;
  let cp = 100;
  try {
    cp = compat(p, me().name);
  } catch (e) {}
  if (cp < 30 && Math.random() < 0.4) return ['rej', 'Le joueur refuse de rejoindre un club dont le Fluide ne lui convient pas.'];
  const rp = plRatio(p, x),
    need = () => Math.max(x.sw + 1, Math.ceil(x.sw + (plWant(p, x) - plVal(x)) * 1.03));
  if (rp >= 1) return ['acc'];
  if (rp >= 0.85) return ['ctr', need()];
  if (rp >= 0.65) return Math.random() < 0.3 ? ['ctr', need()] : ['rej', 'Le joueur juge vos conditions insuffisantes.'];
  return ['rej', 'Le joueur refuse : vos conditions sont très en dessous de ses attentes.'];
}
// Dépose l'offre : le club répond dans quelques jours, puis le joueur.
function ofSend() {
  const o = V.of;
  if (!o) return;
  const p = plFind(o.n);
  if (!p) return;
  S.no = S.no || [];
  S.no.forEach((q) => {
    if (q.n == p.n && NEGACT(q)) {
      q.st = 'rej';
      q.note = 'Remplacée par une nouvelle offre.';
    }
  });
  const fee = Math.max(1, Math.round(+o.fee || 0)),
    sb = Math.max(0, Math.round(+o.sb || 0));
  if (fee + sb > S.cash || sqN(me()) >= 15 || numUser(Math.round(+o.num || 0), p.n)) return;
  const ow = plOwner(p.n);
  const x = {
    id: Date.now() + Math.random(),
    n: p.n,
    p: JSON.parse(JSON.stringify(p)),
    fee,
    sb,
    sw: Math.max(1, Math.round(+o.sw || 1)),
    tb: Math.max(0, Math.round(+o.tb || 0)),
    ct: Math.min(4, Math.max(1, +o.ct || 3)),
    num: Math.min(99, Math.max(1, Math.round(+o.num || 2))),
    cl: ow ? ow.name : 'L’agent du joueur',
    st: 'pend',
    d0: S.day,
    dr: S.day + 2 + ((Math.random() * 3) | 0),
  };
  S.no.unshift(x);
  if (S.no.length > 30) S.no.length = 30;
  V.of = null;
  V.mt = 'of';
  if (p.mkb) negTick();
  save();
  render();
}
// Récapitulatif des conditions d'une offre.
const ofTerms = (x, sw) =>
  `Transfert <b>${x.fee}</b> cr. · prime de signature ${x.sb} cr. · salaire <b>${sw || x.sw}</b> / match · prime de titre ${x.tb || 0} cr. · ${x.ct} an${x.ct > 1 ? 's' : ''}`;
// Conclut le transfert : paie le montant et la prime, applique salaire, prime de titre et durée.
function ofSign(x, auto) {
  if (S.cash < x.fee + x.sb || sqN(me()) >= 15) {
    if (auto) {
      x.st = 'exp';
      x.note = 'Fonds insuffisants ou effectif complet au moment de la signature.';
      mail('Transfert annulé : ' + x.n, 'Tout était réglé pour ' + x.n + ', mais la signature n’a pas pu se faire (fonds insuffisants ou effectif complet).');
    }
    return false;
  }
  if (!plFindS(x.n)) {
    x.st = 'exp';
    x.note = 'Le joueur n’est plus disponible.';
    mail('Transfert annulé : ' + x.n, x.n + ' n’est plus disponible (transféré ailleurs).');
    return false;
  }
  const np = x.p;
  delete np.num;
  if (!buyAt(np, x.fee)) return false;
  np.num = numFree(x.num || 2, np.n);
  if (x.sb > 0) tx('Primes', -x.sb);
  np.sw = x.sw;
  np.tb = x.tb || 0;
  np.ct = x.ct;
  x.st = 'acc';
  x.note = 'Transfert conclu.';
  mail('Transfert conclu : ' + x.n, x.cl + ' confirme le départ de ' + x.n + ' vers votre club (' + x.fee + ' crédits). ' + x.n + ' signe pour ' + x.ct + ' an' + (x.ct > 1 ? 's' : '') + ', avec un salaire de ' + x.sw + ' par match' + (x.sb ? ' et une prime de signature de ' + x.sb + ' crédits' : '') + (x.tb ? ' ; prime de titre : ' + x.tb + ' crédits' : '') + '. Il portera le n°' + np.num + (np.num != x.num ? ' (le n°' + x.num + ' avait été attribué entre-temps)' : '') + '. Bienvenue !');
  return true;
}
// Chaque jour : le club puis le joueur répondent aux offres arrivées à échéance ; les contre-offres expirent.
function negTick() {
  try {
    (S.no || []).forEach((x) => {
      const h = !!x.p.mkb;
      if (x.st == 'pend' && (h || S.day >= x.dr)) {
        const d = h ? ['acc'] : clubDecide(x);
        if (d[0] == 'acc') {
          x.st = 'pl';
          x.dr = h ? S.day : S.day + 1 + ((Math.random() * 2) | 0);
          mail('Accord de ' + x.cl + ' pour ' + x.n, x.cl + ' accepte votre offre de ' + x.fee + ' crédits pour ' + x.n + '. Le joueur doit maintenant examiner vos conditions personnelles : prime de signature, salaire et prime de titre.');
        } else if (d[0] == 'ctr') {
          x.st = 'ctr';
          x.cf = Math.max(d[1], x.fee + 10);
          x.ex = S.day + 3;
          mail('Contre-offre de ' + x.cl + ' pour ' + x.n, x.cl + ' répond à votre offre de ' + x.fee + ' crédits pour ' + x.n + ' : le club demande ' + x.cf + ' crédits. Vous avez 3 jours pour accepter ou refuser (Transferts > Offres).');
        } else {
          x.st = 'rej';
          x.note = d[1];
          mail('Offre refusée par ' + x.cl + ' : ' + x.n, x.cl + ' refuse votre offre de ' + x.fee + ' crédits pour ' + x.n + '. ' + d[1]);
        }
      }
      if (x.st == 'pl' && (h || S.day >= x.dr)) {
        const d = h ? ['acc'] : plDecide(x);
        if (d[0] == 'acc') ofSign(x, true);
        else if (d[0] == 'ctr') {
          x.st = 'pctr';
          x.pc = { sw: d[1] };
          x.ex = S.day + 3;
          mail('Contre-proposition de ' + x.n, x.n + ' est tenté par votre projet, mais demande un salaire de ' + d[1] + ' par match (au lieu de ' + x.sw + '). Vous avez 3 jours pour accepter ou refuser (Transferts > Offres).');
        } else {
          x.st = 'rej';
          x.note = d[1];
          mail('Le joueur refuse : ' + x.n, x.n + ' ne signera pas. ' + d[1]);
        }
      } else if ((x.st == 'ctr' || x.st == 'pctr') && S.day > x.ex) {
        x.st = 'exp';
        x.note = 'La contre-proposition a expiré.';
      }
    });
  } catch (e) {}
}
// Accepte la contre-offre du club (montant) ou la contre-proposition du joueur (salaire).
function negAccept(j) {
  const x = (S.no || [])[j];
  if (!x) return;
  if (x.st == 'ctr') {
    if (S.cash < x.cf + x.sb || sqN(me()) >= 15) return;
    x.fee = x.cf;
    x.st = 'pl';
    x.dr = S.day + 1;
  } else if (x.st == 'pctr') {
    x.sw = x.pc.sw;
    if (!ofSign(x)) return;
  } else return;
  save();
  render();
}
// Refuse une contre-offre ou retire une offre en attente.
function negNo(j) {
  const x = (S.no || [])[j];
  if (!x || !NEGACT(x)) return;
  x.note = x.st == 'ctr' || x.st == 'pctr' ? 'Vous avez refusé la contre-proposition.' : 'Vous avez retiré votre offre.';
  x.st = 'rej';
  save();
  render();
}
// Une ligne de réglage de la fenêtre d'offre.
const ofRow = (l, k, st, mn, sfx) =>
  `<div class="ofg"><span>${l}</span><div class="ofa2"><button onclick="ofSet(${-st},'add','${k}')">−${st}</button><input type="number" min="${mn}" value="${V.of[k]}" onchange="ofSet(+this.value,'abs','${k}')"><button onclick="ofSet(${st},'add','${k}')">+${st}</button></div><em>${sfx}</em></div>`;
// Fenêtre « Faire une offre ».
function ofModal() {
  const o = V.of;
  if (!o) return '';
  const p = plFind(o.n) || ((S.no || []).find((q) => q.n == o.n) || {}).p;
  if (!p) return '';
  ensure(p);
  const pr = price(p),
    fee = Math.max(1, Math.round(+o.fee || 0)),
    r = fee / pr,
    full = sqN(me()) >= 15,
    broke = fee + o.sb > S.cash,
    tone = r >= 1.1 ? ['Très généreuse : acceptation quasi certaine', '#2fb36b'] : r >= 1 ? ['Correcte : bonnes chances', '#62c14a'] : r >= 0.85 ? ['Un peu basse : le club risque de contre-proposer', '#e0a526'] : r >= 0.7 ? ['Basse : refus probable', '#e8743b'] : ['Insultante : refus presque sûr', '#e5484d'],
    rp = plRatio(p, o),
    tp = rp >= 1 ? ['Le joueur sera séduit', '#2fb36b'] : rp >= 0.85 ? ['Il risque de demander un meilleur salaire', '#e0a526'] : rp >= 0.65 ? ['Insuffisantes : refus probable', '#e8743b'] : ['Très insuffisantes : refus presque sûr', '#e5484d'],
    ex = (S.no || []).find((q) => q.n == p.n && NEGACT(q)),
    nuX = numUser(Math.round(+o.num || 0), p.n);
  return `<div class="mo" onclick="V.of=null;render()"><div class="card ofm" onclick="event.stopPropagation()"><div class="ofh"><b>Faire une offre</b><button class="pfx" onclick="V.of=null;render()" aria-label="Fermer">✕</button></div><div class="ofp"><div class="pg">${pc(p, '', 'void 0', '')}</div><div class="ofi"><b>${p.n}</b><div class="mu">${p.p} · ${p.age || '—'} ans · note ${p.o}</div><div class="ofk"><span>Valeur estimée</span><b>${pr}</b></div><div class="ofk"><span>Salaire actuel</span><b>${sal(p)} / match</b></div><div class="ofk"><span>Vos crédits</span><b>${S.cash}</b></div></div></div>${ex ? `<div class="mu" style="margin:6px 0">Une négociation est déjà en cours pour ce joueur : une nouvelle offre la remplacera.</div>` : ''}<h3 class="ofh3">Le club vendeur</h3>${ofRow('Montant du transfert', 'fee', 10, 1, 'crédits')}<div class="ctl" style="justify-content:center;margin:4px 0">${[[80, '80 %'], [100, 'Valeur'], [110, '110 %'], [125, '125 %']].map(([v, l]) => `<button onclick="ofSet(${v},'pct')">${l}</button>`).join('')}</div><div class="oft" style="color:${tone[1]}">${tone[0]}</div><h3 class="ofh3">Le joueur</h3>${ofRow('Prime de signature', 'sb', 5, 0, 'payée à la signature')}${ofRow('Salaire', 'sw', 1, 1, 'par match')}${ofRow('Prime de titre', 'tb', 10, 0, 'si vous gagnez le championnat (≈ ' + Math.round(titleP() * 100) + ' % de chances)')}<div class="ofg"><span>Durée du contrat</span><div class="ofa2">${[1, 2, 3, 4].map((n) => `<button class="${o.ct == n ? 'p' : ''}" onclick="ofSet(${n},'abs','ct')">${n} an${n > 1 ? 's' : ''}</button>`).join('')}</div></div><div class="oft" style="color:${tp[1]}">${tp[0]}</div>${ofRow('Numéro de maillot', 'num', 1, 1, '1 à 99')}${nuX ? `<div class="oft" style="color:#e5484d">Le n°${o.num} est déjà porté par ${nuX.n} : choisissez un autre numéro.</div>` : `<div class="oft" style="color:#2fb36b">Le n°${o.num} est libre.</div>`}<div class="mu" style="text-align:center">Le club répond sous 2 à 4 jours, puis le joueur étudie vos conditions. Rien n’est payé avant l’accord : coût à la signature <b>${fee + o.sb}</b> cr.</div>${full ? '<div class="oft" style="color:#e5484d">Effectif complet (15 joueurs) : vendez un joueur d’abord.</div>' : ''}${broke ? '<div class="oft" style="color:#e5484d">Vous n’avez pas assez de crédits (transfert + prime).</div>' : ''}<div class="ctl" style="justify-content:center;margin-top:8px"><button class="p" onclick="ofSend()" ${full || broke || nuX ? 'disabled' : ''}>Déposer l’offre</button><button onclick="V.of=null;render()">Annuler</button></div></div></div>`;
}
// Onglet « Offres » : offres en attente, contre-propositions à traiter et historique.
function ofView() {
  const L = S.no || [],
    A = L.map((x, j) => [x, j]).filter(([x]) => NEGACT(x)),
    H = L.map((x, j) => [x, j]).filter(([x]) => !NEGACT(x)).slice(0, 12),
    sT = { acc: 'Acceptée', rej: 'Refusée', exp: 'Annulée' },
    row = ([x, j]) => {
      const cant = S.cash < x.fee + x.sb || sqN(me()) >= 15;
      let b;
      if (x.st == 'pend') b = `<span class="mu">${x.cl} répondra dans ${Math.max(0, x.dr - S.day)} jour${x.dr - S.day > 1 ? 's' : ''}</span><button onclick="negNo(${j})">Retirer l’offre</button>`;
      else if (x.st == 'pl') b = `<span class="mu">${x.cl} est d’accord ; ${x.n} étudie vos conditions (réponse dans ${Math.max(0, x.dr - S.day)} jour${x.dr - S.day > 1 ? 's' : ''})</span><button onclick="negNo(${j})">Retirer l’offre</button>`;
      else if (x.st == 'ctr') b = `<span class="oft2">${x.cl} demande <b>${x.cf}</b> cr. (au lieu de ${x.fee})</span><span class="mu">À traiter avant ${fmtDay(x.ex)}</span><button class="p" onclick="negAccept(${j})" ${S.cash < x.cf + x.sb || me().sq.length >= 15 ? 'disabled' : ''}>Accepter (${x.cf} cr.)</button><button onclick="negNo(${j})">Refuser</button><button onclick="ofRe(${j})">Négocier</button>`;
      else b = `<span class="oft2">${x.n} demande un salaire de <b>${x.pc.sw}</b> / match (au lieu de ${x.sw})</span><span class="mu">À traiter avant ${fmtDay(x.ex)}</span><button class="p" onclick="negAccept(${j})" ${cant ? 'disabled' : ''}>Accepter</button><button onclick="negNo(${j})">Refuser</button><button onclick="ofRe(${j})">Négocier</button>`;
      return `<div class="ofr"><div class="ofc"><b>${x.n}</b><span class="mu">${x.p.p} · note ${x.p.o} · valeur ${price(x.p)} · ${x.cl}</span><span class="mu ofct">${ofTerms(x)}</span></div><div class="ofs">${b}</div></div>`;
    };
  return `<h2>Offres de transfert ${hp('mt3')}</h2><div class="card">${A.map(row).join('') || '<div class="mu">Aucune négociation en cours. Dans Recherche, touchez un joueur pour déposer une offre.</div>'}</div><h2>Historique</h2><div class="card hscr">${H.map(([x]) => `<div class="ofr"><div class="ofc"><b>${x.n}</b><span class="mu">${x.cl || ''} · ${ofTerms(x)}</span>${x.note ? `<span class="mu">${x.note}</span>` : ''}</div><div class="ofs"><span class="ofb ${x.st}">${sT[x.st] || ''}</span></div></div>`).join('') || '<div class="mu">Aucun historique.</div>'}</div>`;
}
// Aperçu : liste des joueurs dont l'offre est en attente (cliquable, ouvre l'onglet Offres).
function ovNeg() {
  const A = (S.no || []).filter(NEGACT),
    d = (x) => Math.max(0, x.dr - S.day),
    tx2 = (x) => (x.st == 'pend' ? x.cl + ' répond dans ' + d(x) + ' j' : x.st == 'pl' ? 'Le joueur répond dans ' + d(x) + ' j' : x.st == 'ctr' ? 'Contre-offre du club : ' + x.cf + ' cr.' : 'Le joueur demande ' + x.pc.sw + ' / match');
  if (!A.length) return '';
  return (
    A.slice(0, 5)
      .map((x) => `<div class="row ovn${x.st == 'ctr' || x.st == 'pctr' ? ' act' : ''}" onclick="V.mt='of';go2('mkt')"><span class="nm">${x.n}</span><span class="mu">${tx2(x)}</span></div>`)
      .join('') + (A.length > 5 ? `<div class="mu">+ ${A.length - 5} autre${A.length > 6 ? 's' : ''} offre${A.length > 6 ? 's' : ''}</div>` : '')
  );
}
// Rouvre la fenêtre d'offre à partir d'une négociation (montant ou salaire demandé repris).
function ofRe(j) {
  const x = (S.no || [])[j];
  if (!x) return;
  const p = plFind(x.n) || x.p;
  ofFrom(p, x, x.st == 'ctr' ? { fee: x.cf } : x.pc ? { sw: x.pc.sw } : {});
}
// Verse les primes de titre promises aux joueurs de l'équipe.
function tbPay(w) {
  try {
    const n = me().sq.reduce((a, p) => a + (p.tb || 0), 0);
    if (n > 0) {
      tx('Primes', -n);
      mail('Primes de titre versées', 'Vous avez remporté ' + w + ' : ' + n + ' crédits de primes sont versés aux joueurs concernés.');
    }
  } catch (e) {}
}

// Vend un joueur de l'équipe (moitié du prix).
function sell(i) {
  const t = me();
  if (sqN(t) <= 11) return;
  tx('Transferts', price(t.sq[i]) >> 1);
  tlog('out', t.sq[i], 'Marché', price(t.sq[i]) >> 1);
  rmP(t, t.sq[i]);
  save();
  render();
}
// Démarre la phase finale de la Cup.
function cupStart() {
  if (S.ctx == 'C') {
    const G = [0, 1, 2, 3].map((g) => stdg(S.teams.filter((t) => t.g === g)).map((t) => S.teams.indexOf(t)));
    S.cup = {
      q: [0, 1, 2, 3].map((g) => G[g][0]).concat([0, 1, 2, 3].map((g) => G[g][1])),
      res: [],
      champ: null,
      next: [],
    };
    cupRound();
    save();
    return render();
  }
  const o = S.teams
    .map((_, i) => i)
    .sort((a, b) => {
      const x = S.teams[a],
        y = S.teams[b];
      return y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga);
    });
  S.cup = { q: o.slice(0, S.teams.length >= 8 ? 8 : 4), res: [], champ: null, next: [] };
  cupRound();
  save();
  render();
}
// Joue un tour de la phase finale de la Cup (quarts, demies, finale).
function cupRound() {
  const q = S.cup.q;
  S.cup.next = [];
  let um = null;
  for (let i = 0; i < q.length / 2; i++) {
    const h = q[i],
      a = q[q.length - 1 - i];
    if (h == S.t || a == S.t) um = [h, a];
    else {
      const M = mk(h, a);
      for (let j = 1; j <= 30; j++) {
        M.min = j * 3;
        tick(M);
      }
      S.cup.next.push(cupWin(M));
    }
  }
  if (um) {
    V.m = mk(...um);
    V.lnx = 0;
    V.mxp = null;
    V.mxd = 0;
    V.m.cup = 1;
    V.sub = 3;
    V.tab = 'match';
  } else cupAdvance();
}
// Désigne le vainqueur d'un match de Cup (tirs au but si égalité).
function cupWin(M) {
  const tie = M.sc[0] == M.sc[1],
    w = tie ? (Math.random() < 0.5 ? M.h : M.a) : M.sc[0] > M.sc[1] ? M.h : M.a;
  S.cup.res.push(`${M.t[0].name} ${M.sc[0]}-${M.sc[1]} ${M.t[1].name}${tie ? ' (t.a.b.)' : ''}`);
  return w;
}
// Fait avancer le tableau de la Cup d'un tour.
function cupAdvance() {
  const n = S.cup.next;
  S.cup.q = n;
  if (n.length == 1) {
    S.cup.champ = n[0];
    const e = (S.pal || []).find((x) => x.s == S.season);
    if (e) e.cup = S.teams[n[0]].name;
    if (n[0] == S.t) {
      tx('Primes', S.ctx == 'C' ? 3000 : 2000);
      S.ach = S.ach || {};
      if (S.ctx == 'C') {
        S.titles = (S.titles || 0) + 1;
        if (!S.ach.cupC) {
          S.ach.cupC = 1;
          mail('🏆 Succès : Champions de la Galactik Cup', 'Votre sélection remporte la Galactik Cup.');
        }
      } else if (!S.ach.cup) {
        S.ach.cup = 1;
        mail('🏆 Succès : Coupe en poche', 'Vous remportez la Coupe de la Ligue.');
      }
    }
  } else cupRound();
}
// Bouton « Continuer » après un match : enregistre, passe au tour suivant, sauvegarde
// automatiquement.
function cont() {
  const c = V.m.cup;
  V.m = null;
  V.tab = 'mail'; // pour le moment, « Continuer » ramène à la messagerie
  if (S.pcw) {
    const w = S.pcw;
    S.pcw = null;
    pcOpen('post', w.o, w.k, w.sc, w.f);
  }
  if (c) {
    cupAdvance();
    if (!V.m) V.tab = 'table';
  }
  // Dernier match de la saison : on va directement sur la page Championnat.
  if (!V.m && S.md >= S.fx.length && !nextEv()) V.tab = 'table';
  save();
  autosave();
  render();
}
// Affiche le tableau de la phase finale de la Cup.
function cupView() {
  const c = S.cup;
  return c
    ? `<div class="card"><b>🏆 ${S.ctx == 'C' ? 'Phase finale de la Cup (quarts, demies, finale)' : 'Coupe de la Ligue'}</b>${c.champ != null ? `<br>Vainqueur : <b>${S.teams[c.champ].name}</b>` : ''}${c.res.map((r) => `<div class="mu">${r}</div>`).join('')}</div>`
    : '';
}

// ======================================================================
// ÉDITEUR DE MODS (équipes, joueurs, couleurs)
// ======================================================================
// Importe un fichier Excel d'équipes et de joueurs.
function imp(f) {
  if (!f) return;
  const rd = new FileReader();
  rd.onload = (e) => {
    try {
      const ws = XLSX.read(e.target.result, { type: 'array' }),
        sh = ws.Sheets['Joueurs'] || ws.Sheets[ws.SheetNames[1]],
        rows = XLSX.utils.sheet_to_json(sh, { header: 1, range: 3 }),
        hd = rows[0],
        ix = (n) => hd.indexOf(n),
        ct = {},
        K = {
          GK: ['Réflexes (GK)', 'Physique', 'Détermination'],
          DEF: ['Tacle', 'Physique', 'Vitesse', 'Détermination'],
          MID: ['Passe', 'Vision', 'Dribble', 'Détermination'],
          ATT: ['Finition', 'Vitesse', 'Dribble', 'Détermination'],
        };
      rows.slice(1).forEach((r) => {
        const ti = T.findIndex((x) => x[0] == (NM[r[0]] || r[0]));
        if (ti < 0 || !r[1] || !r[4]) return;
        const g = (n) => +r[ix(n)] || 10,
          ps = String(r[4]),
          p = ps.includes('GK') ? 'GK' : /DC|DL/.test(ps) ? 'DEF' : /ST|\(W\)/.test(ps) ? 'ATT' : 'MID',
          av = K[p].reduce((s, n) => s + g(n), 0) / K[p].length;
        (ct[ti] = ct[ti] || []).push({
          n: r[1],
          p,
          o: Math.round(28 + av * 3.3),
          e: 100,
          f: Math.round(g('Potentiel (1-20)') * 4.5),
          g: 0,
          c: r[2] == 'Canon' ? 1 : 0,
        });
      });
      let n = 0;
      Object.keys(ct).forEach((i) => {
        const t = S.teams[i];
        if (ct[i].length >= 11) {
          t.sq = ct[i];
          autoLU(t);
          n += ct[i].length;
        }
      });
      V.note = n + ' joueurs importés';
      save();
    } catch (x) {
      V.note = 'Import impossible : ' + x.message;
    }
    render();
  };
  rd.readAsArrayBuffer(f);
}
// Raccourci : lit la valeur d'un champ de formulaire.
const gv = (id) => document.getElementById(id).value,
  sv = () => {
    try {
      localStorage.setItem('gmmod', JSON.stringify(MOD));
    } catch (e) {}
  };
// Mémorise les champs du formulaire de l'éditeur avant de redessiner.
function snap() {
  V.fv = {
    n: gv('en'),
    e: gv('ee'),
    l: +gv('el') || 10,
    k: gv('ek'),
    fn: gv('efn'),
    fd: gv('efd'),
    c1: gv('ec1') || (V.fv && V.fv.c1),
    c2: gv('ec2') || (V.fv && V.fv.c2),
  };
}
// Couleurs prédéfinies proposées dans l'éditeur.
const PRE = [
  ['#d71921', '#ffffff', 'Rouge'],
  ['#1d506e', '#c9f7f6', 'Océan'],
  ['#0fa882', '#e4338f', 'Jade'],
  ['#5b2fc9', '#ffb703', 'Violet'],
  ['#f5f75b', '#8c2e22', 'Soleil'],
  ['#110cd9', '#f68c03', 'Électrique'],
  ['#566a44', '#6942ac', 'Mousse'],
  ['#07242e', '#ceb524', 'Or noir'],
  ['#e0457b', '#2b2d42', 'Rose'],
  ['#ff6b35', '#1a1a2e', 'Orange'],
  ['#2ec4b6', '#ff9f1c', 'Lagon'],
  ['#8d99ae', '#ef233c', 'Acier'],
];
// Applique une paire de couleurs prédéfinie.
function setC(a, b) {
  snap();
  V.fv.c1 = a;
  V.fv.c2 = b;
  render();
}
// Met à jour l'aperçu des couleurs.
function pvUp() {
  const a = gv('ec1'),
    b = gv('ec2'),
    e = document.getElementById('pv');
  if (!e) return;
  const t = palette([a, b]);
  for (const k in t) e.style.setProperty(k, t[k]);
  const w = document.getElementById('pw');
  if (w) w.innerHTML = colWarn(a, document.getElementById('en') ? gv('en') : '');
}
// Avertit si les couleurs choisies ressemblent trop à celles d'une autre équipe.
function colWarn(c, nm) {
  const A = hx(c);
  let best = null;
  Object.entries(PAL).forEach(([k, v]) => {
    if (k == nm) return;
    const B = hx(v[0]),
      d = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
    if (!best || d < best[0]) best = [d, k];
  });
  return best && best[0] < 60
    ? `⚠ Cette couleur ressemble à celle de ${best[1]} : choisissez-en une plus distincte pour les reconnaître facilement.`
    : '✓ Couleur bien distincte des autres équipes.';
}
// Ouvre une équipe dans l'éditeur.
function edT(i) {
  V.et = i;
  V.fv = null;
  const t = T[i],
    m = t && MOD.teams.find((x) => x.name == t[0]);
  V.ep = t && X[t[0]] ? X[t[0]].map((p) => ({ ...p })) : [];
  V.ek = t ? FX[t[0]].k : 'chance';
  render();
}
// Page « Éditeur de mods ».
function edView() {
  const i = V.et,
    t = i >= 0 ? T[i] : null;
  let h =
    '<h1>🛠️ Éditeur de mods</h1><div class="ctl"><button class="p" onclick="V.ed=0;S=null;save();render()">▶ Jouer avec ce mod</button></div><p class="mu">Les modifications s’appliquent à une nouvelle partie. Une équipe avec moins de 11 joueurs reçoit un effectif généré.</p>';
  if (i == null || i == undefined)
    return (
      h +
      '<h2>Équipes</h2><div class="card">' +
      T.map(
        (t, j) =>
          `<div class="row"><span class="nm">${t[2]} ${t[0]}${ft(t[0])} <span class="mu">niv. ${t[1]}${X[t[0]] ? ' · ' + X[t[0]].length + ' joueurs' : ''}</span></span><button onclick="edT(${j})">Éditer</button></div>`,
      ).join('') +
      '<button style="margin-top:8px" onclick="edT(-1)">+ Nouvelle équipe</button></div><h2>Mod (JSON à copier/coller pour partager)</h2><div class="card"><textarea id="ej" rows="5" style="width:100%">' +
      JSON.stringify(MOD).replace(/⟦/g, '&#10214;') +
      '</textarea><div class="ctl"><button onclick="impJ()">Charger ce JSON</button><button onclick="MOD={teams:[]};sv();applyMod();render()">Réinitialiser</button></div></div><button onclick="V.ed=0;render()">Retour</button>'
    );
  const f = t ? FX[t[0]] : BR.chance,
    q = V.fv || {
      n: t ? t[0] : '',
      e: t ? t[2] : '🏟️',
      l: t ? t[1] : 10,
      k: V.ek,
      fn: f.n,
      fd: f.d,
      c1: (PAL[t ? t[0] : ''] || [])[0] || '#4b3fd9',
      c2: (PAL[t ? t[0] : ''] || [])[1] || '#ffb703',
    };
  return (
    h +
    `<div class="card"><div class="ctl"><input id="en" placeholder="Nom de l’équipe" value="${q.n}" ${t ? 'readonly' : ''}><input id="ee" type="hidden" value="${String(q.e).replace(/⟦/g, '&#10214;')}"><label>Niveau <input id="el" type="number" min="1" max="20" value="${q.l}" style="width:60px"></label></div><div class="ctl" style="margin-top:8px"><label>Fluide <select id="ek" onchange="snap();V.fv.fn=BR[V.fv.k].n;V.fv.fd=BR[V.fv.k].d;render()">${Object.keys(
      BR,
    )
      .map((k) => `<option value="${k}" ${k == q.k ? 'selected' : ''}>${BR[k].n}</option>`)
      .join(
        '',
      )}</select></label></div><div class="ctl" style="margin-top:8px"><input id="efn" placeholder="Nom du Fluide" value="${q.fn}"><input id="efd" placeholder="Description" style="flex:1" value="${q.fd}"></div></div><h2>Écusson ${hp('ed_em')}</h2><div class="card">${crEd(q)}</div><h2>Couleurs de l’équipe</h2><div class="card"><div class="ctl"><label>Principale <input id="ec1" type="color" value="${q.c1}" oninput="pvUp()" onchange="snap();render()" style="width:54px;height:38px;padding:2px"></label><label>Secondaire <input id="ec2" type="color" value="${q.c2}" oninput="pvUp()" onchange="snap();render()" style="width:54px;height:38px;padding:2px"></label>${hp('col')}</div><div class="ctl" style="margin-top:8px">${PRE.map(([a, b, n]) => `<button title="${n}" onclick="setC('${a}','${b}')" style="padding:4px 8px;display:flex;align-items:center;gap:4px"><i style="width:16px;height:16px;border-radius:50%;background:${a};border:2px solid #fff;display:inline-block"></i><i style="width:16px;height:16px;border-radius:50%;background:${b};border:2px solid #fff;display:inline-block;margin-left:-8px"></i><span style="font-size:12px">${n}</span></button>`).join('')}</div><div id="pv" style="${Object.entries(
      palette([q.c1, q.c2]),
    )
      .map(([k, v]) => k + ':' + v)
      .join(
        ';',
      )};margin-top:10px;background:var(--bg);border:3px solid var(--ac);border-radius:16px;padding:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:var(--tx)"><span style="background:var(--sb);padding:6px 12px;border-radius:10px;border:2px solid var(--bd)">${q.e} ${q.n || 'Votre équipe'}</span><span style="background:var(--card);padding:6px 12px;border-radius:10px;border:2px solid var(--bd)">Carte</span><span style="background:var(--ac);color:var(--onac);padding:6px 14px;border-radius:99px;font-weight:700">Bouton</span><span style="background:var(--ac2);color:var(--onac2);padding:6px 14px;border-radius:99px;font-weight:700">Accent 2</span><span style="color:var(--mu)">Texte secondaire</span></div><div id="pw" class="mu" style="margin-top:6px">${colWarn(q.c1, q.n)}</div></div><h2>Joueurs (${V.ep.length})</h2><div class="card">` +
    vwBtn() +
    '<div class="pg">' +
    fl(V.ep.map((p, j) => [p, j]))
      .map(([p, j]) =>
        pc(
          p,
          '',
          `prof('ed',${j})`,
          `<div><button style="padding:0 6px" onclick="event.stopPropagation();snap();V.ep.splice(${j},1);render()">✕</button></div>`,
        ),
      )
      .join('') +
    '</div>' +
    `<div class="ctl" style="margin-top:8px"><input id="pn" placeholder="Nom"><select id="pp">${POS.map((p) => `<option>${p}</option>`).join('')}</select><input id="po" type="number" value="65" style="width:64px"><button onclick="addP()">+ Ajouter</button><button onclick="genP()">Générer 12</button></div></div><div class="ctl"><button class="p" onclick="saveT()">Enregistrer</button><button onclick="V.et=null;render()">Retour</button>${t ? '<button onclick="delT()">Supprimer / réinitialiser</button>' : ''}</div>`
  );
}
// Ajoute un joueur à l'équipe en cours d'édition.
function addP() {
  snap();
  const n = gv('pn').trim();
  if (n) V.ep.push({ n, p: gv('pp'), o: Math.max(30, Math.min(95, +gv('po') || 60)), f: 50 });
  render();
}
// Génère des joueurs automatiquement.
function genP() {
  snap();
  const l = V.fv.l,
    r = Math.random,
    A = ['Kael', 'Nyra', 'Zane', 'Orin', 'Juno', 'Rex', 'Mira', 'Tovi', 'Wren', 'Nova'],
    B = ['Voss', 'Korr', 'Nyx', 'Reyes', 'Storm', 'Fenn', 'Kell', 'Doyle', 'Vireth', 'Kandor'];
  V.ep = [];
  [
    ['GK', 2],
    ['DEF', 3],
    ['MID', 4],
    ['ATT', 3],
  ].forEach(([p, k]) => {
    for (let j = 0; j < k; j++)
      V.ep.push({
        n: uname(
          new Set(
            V.ep
              .map((x) => x.n)
              .concat(
                Object.values(X)
                  .flat()
                  .map((x) => x.n),
              ),
          ),
          A,
          B,
        ),
        p,
        o: Math.round(44 + l * 1.4 + r() * 10),
        f: (30 + r() * 60) | 0,
      });
  });
  render();
}
// Enregistre l'équipe éditée.
function saveT() {
  snap();
  const q = V.fv;
  if (!q.n.trim()) return;
  const m = {
    name: q.n.trim(),
    em: q.e,
    l: Math.max(1, Math.min(20, q.l)),
    k: q.k,
    fn: q.fn,
    fd: q.fd,
    c1: q.c1,
    c2: q.c2,
    pl: V.ep,
  };
  MOD.teams = MOD.teams.filter((x) => x.name != m.name).concat([m]);
  sv();
  applyMod();
  V.et = null;
  render();
}
// Supprime l'équipe éditée.
function delT() {
  const n = T[V.et][0];
  MOD.teams = MOD.teams.filter((x) => x.name != n);
  sv();
  applyMod();
  V.et = null;
  render();
}
// Importe un mod au format JSON.
function impJ() {
  try {
    const m = JSON.parse(gv('ej'));
    if (!Array.isArray(m.teams)) throw 1;
    MOD = m;
    sv();
    applyMod();
  } catch (e) {}
  render();
}
// Invente un nom de joueur qui n'existe pas encore.
function uname(U, A, B) {
  let n,
    k = 0;
  do n = A[(Math.random() * A.length) | 0] + ' ' + B[(Math.random() * B.length) | 0];
  while (U.has(n) && k++ < 60);
  U.add(n);
  return n;
}

// ======================================================================
// COURRIER, OBJECTIFS ET FIN DE SAISON
// ======================================================================
// AJOUTE UN COURRIER dans la boîte de réception : mail(titre, texte, actions). Affiche aussi une
// notification.
function mail(t, b, a) {
  // Pendant un match en direct (avant le coup de sifflet final), les mails sont mis en attente (S.mq) et livrés juste après.
// Les mails créés par la fin de match elle-même (interviews, presse…) partent tout de suite.
  if (S && V.m && !V.m.done && V.m.min < 90 && !V.m.ab) {
    (S.mq = S.mq || []).push({ t, b, a: a || null, d: S.md + 1, dt: S.day || 0 });
    return;
  }
  mailNow(t, b, a);
}
// Dépose réellement le courrier dans la boîte de réception (avec notification et son).
function mailNow(t, b, a, d, dt) {
  try {
    ntf(
      /^Niveau \d+ de manager/.test(t)
        ? { i: 'star', l: 'Manager', t: t, s: 'Un point de compétence est disponible', tp: 'k', go: 'car' }
        : { i: 'mail', l: 'Nouveau mail', t: t, s: 'Boîte de réception', tp: 'm', go: 'mail' },
    );
  } catch (e) {}
  sfxD('mail', 500);
  S.mail.unshift({ d: d || S.md + 1, t, b, a: a || null, u: 1, dt: dt != null ? dt : S.day || 0, f: snd(t, b) });
  if (S.mail.length > 80) S.mail.length = 80;
}
// Livre les mails mis en attente pendant le match (à appeler quand le match est terminé).
function mailFlush() {
  if (!S || !S.mq || !S.mq.length || (V.m && !V.m.done)) return;
  const q = S.mq;
  S.mq = [];
  q.forEach((m) => mailNow(m.t, m.b, m.a, m.d, m.dt));
}
// Retire un joueur de l'équipe (en gardant la composition cohérente).
function rmP(t, p) {
  V.sel = null;
  const nm = t.lu.map((x) => t.sq[x].n);
  t.sq.splice(t.sq.indexOf(p), 1);
  t.lu = nm.map((n) => t.sq.findIndex((q) => q.n == n));
  if (t.lu.includes(-1)) autoLU(t);
}
// Mail de bienvenue du début de partie.
function welcome(ti) {
  const rk =
    T.map((t) => t[1])
      .sort((a, b) => b - a)
      .indexOf((T[ti] || [0, (NEWT.find((x) => x.n == S.teams[ti].name) || { l: 14 }).l])[1]) + 1;
  S.obj = Math.max(1, rk - 2);
  mail(
    'Bienvenue à la tête de ' + S.teams[ti].name,
    'Odile Marchand, présidente du conseil, vous accueille.\n\nObjectifs du conseil pour cette saison :\n• Classement : ' +
      obRk() +
      ' (prime de 1500 crédits).' +
      obTxt() +
      '\n\nBudget de départ : 5000 crédits. Consultez la Tactique, le Marché et le Calendrier.',
  );
}
// Mail qui annonce de nouvelles offres de sponsors.
function sponsor() {
  mail(
    'Nouvelles offres de sponsors',
    'Des sponsors vous attendent : consultez l’onglet Gestion pour signer jusqu’à 3 contrats.',
  );
}
// Réponse du joueur à un mail avec choix.
function act(i, j) {
  const m = S.mail[i],
    a = m.a[j];
  if (a[1] == 'qa' || a[1] == 'qr') return qAct(i, j);
  if (a[1] == 'br' || a[1] == 'nb') return actEv(i, j);
  if (String(a[1]).startsWith('of')) return actOf(i, j);
  if (a[1] == 'mo' || a[1] == 'no2') return actMo(i, j);
  if (a[1] == 'md') return actMd(i, j);
  if (a[1] == 'pz') return actPz(i, j);
  m.b += a[1] == 'sp' ? '\n\n→ Offre acceptée (+' + a[2] + '/match).' : '\n\n→ Offre refusée.';
  if (a[1] == 'sp') S.sp = a[2];
  m.a = null;
  save();
  render();
}
// APRÈS CHAQUE MATCH DU JOUEUR : moral, carrière, expérience de manager, historique de trésorerie.
function report(M) {
  moral(M);
  career(M);
  qCheck(M);
  skTick(M);
  S.fh.push(S.cash);
  if (S.cash < 0) S.conf = Math.max(0, S.conf - 2);
  // Contrats : durée plafonnée à celle du contrat signé (10 matchs, 1 ou 2 saisons), jamais de remontée.
  S.sps.forEach((s) => {
    const m = +s.m > 0 ? +s.m : seasonM();
    s.m = m;
    s.left = Math.min(m, Math.floor(+s.left || 0)) - 1;
  });
  S.sps
    .filter((s) => s.left <= 0)
    .forEach((s) => mail('Contrat de sponsoring terminé', s.n + ' ne renouvelle pas son contrat.'));
  S.sps = S.sps.filter((s) => s.left > 0);
  const i = M.t.indexOf(me()),
    g = M.sc[i],
    c = M.sc[1 - i],
    o = M.t[1 - i].name,
    k = g > c ? 'V' : g < c ? 'D' : 'N';
  S.conf = Math.max(
    skV('r4') ? 10 : 0,
    Math.min(100, S.conf + (k == 'V' ? 3 + skV('r3') + mgb('cw') : k == 'D' ? -3 + skV('r1') : 0)),
  );
  S.form += k;
  const f = S.form.slice(-3);
  if (f == 'DDD') mail('Le conseil s’inquiète', 'Trois défaites de suite. Une réaction est attendue.');
  if (f == 'VVV') mail('Félicitations du conseil', 'Trois victoires d’affilée : la confiance monte.');
  if (g - c >= 3)
    mail('Presse : démonstration face à ' + o, 'Victoire ' + g + '-' + c + '. Les supporters sont ravis.');
  if (c - g >= 3) mail('Presse : déroute face à ' + o, 'Défaite ' + g + '-' + c + '. La presse est sévère.');
  {
    const fs = S.cash < 0 ? 2 : S.cash < 300 ? 1 : 0;
    if (fs > (S.fa || 0))
      mail(
        fs == 2 ? 'Alerte financière : trésorerie négative' : 'Alerte financière',
        fs == 2
          ? 'Manager,\n\nLes comptes du club sont dans le rouge (' +
              S.cash.toLocaleString('fr-FR') +
              ' crédits). Les salaires dépassent les revenus : vendez des joueurs, renégociez vos sponsors ou réduisez vos dépenses avant que le conseil ne s’inquiète.'
          : 'La trésorerie est basse (' + S.cash + ' crédits).',
      );
    S.fa = fs;
  }
  mdPost(k, g, c, o, pcFacts(M));
  if (S.md >= S.fx.length) seasonEnd();
}
// FIN DE SAISON : vieillissement, contrats, titres, objectifs, nouvelle saison.
function seasonEnd() {
  skXp(40);
  [S.teams, S.alt && S.alt.teams].forEach((a) =>
    (a || []).forEach((t) =>
      t.sq.forEach((p) => {
        p.yt = 0;
      }),
    ),
  );
  obEval();
  if (skV('c4')) tx('Primes', 1000);
  const rk = stdg(grpOf(me())).indexOf(me()) + 1,
    ok = rk <= S.obj;
  mail(
    S.ctx == 'C' ? 'Bilan de la phase de poules' : 'Bilan de saison',
    (S.ctx == 'C' ? 'Classement dans votre poule : ' : 'Classement final : ') +
      rk +
      'e (objectif : top ' +
      S.obj +
      '). ' +
      (ok ? 'Objectif atteint, prime de 1500 crédits.' : 'Objectif manqué : le conseil est déçu.'),
  );
  if (ok) {
    tx('Primes', Math.round(1500 * (skV('r4') ? 1.25 : 1)));
    S.conf = Math.min(100, S.conf + 10);
    skXp(60);
  } else S.conf = Math.max(0, S.conf - 10);
}
// Fin de saison : passage de l'académie à l'équipe première.
function youth() {
  acYear();
}
// Page « Calendrier » : tous les matchs de la saison.
// ======================================================================
// CALENDRIER : vue mensuelle (bandeau des prochains matchs, grille Lundi–Dimanche, liste du mois).
// Les matchs viennent de S.fx (et S.alt.fx en mode « Les deux ») ; les dates de dOf().
// ======================================================================
const CALM = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const CALD = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
// Jour du jeu (0 = 1er août de la saison) → date réelle.
const calDate = (n) => new Date(Date.UTC(2026 + (S.season || 1) - 1, 7, 1 + n));
const calDay = (y, m, d) => Math.round((Date.UTC(y, m, d) - Date.UTC(2026 + (S.season || 1) - 1, 7, 1)) / 864e5);
// Trois lettres pour désigner un club (ex. « Comet » → VEG).
const calAb = (n) => {
  const w = String(n)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || '';
  return w.slice(0, 3).toUpperCase();
};
// Tous les matchs de votre équipe pour la saison : { c, k, day, h, opp, played, my, op }.
function calList() {
  const o = [],
    srcs = [[S.ctx, S]];
  if (S.mode == 'D' && S.alt) srcs.push([S.ctx == 'C' ? 'L' : 'C', S.alt]);
  for (const [c, D] of srcs)
    (D.fx || []).forEach((r, k) => {
      const m = r.find(([a, b]) => a == D.t || b == D.t);
      if (!m) return;
      const h = m[0] == D.t,
        played = k < D.md,
        z = played ? (D.hist[k] || []).find((q) => q[0] == m[0] && q[1] == m[1]) : null;
      o.push({ rp: (D.mrp || {})[k], c, k, day: dOf(c, k), h, opp: D.teams[h ? m[1] : m[0]], played, my: z ? (h ? z[2] : z[3]) : null, op: z ? (h ? z[3] : z[2]) : null });
    });
  // Soirées du mode annexe (une fois débloqué) : un duel par tour, 3 tours par tournoi.
  if (NBU()) {
    const n = nbS(),
      RN = ['Quart de finale', 'Demi-finale', 'Finale'];
    for (let k = 0; k < 6; k++) o.push({ c: 'N', k, day: dN(k), h: null, opp: { em: '🌑', name: RN[k % 3] }, played: k < n.k, my: null, op: null });
  }
  return o.sort((a, b) => a.day - b.day);
}
const calCmp = (c) => (c == 'N' ? NB : c == 'C' ? 'Galactik Cup' : 'Galactik League');
const calRes = (e) => {
  if (e.my == null) return '';
  const k = e.my > e.op ? 'w' : e.my < e.op ? 'l' : 'd';
  return `<span class="cr ${k}">${e.my}-${e.op}</span>`;
};
function calGo(d) {
  V.cm = (V.cm ?? calMonth0()) + d;
  render();
}
function calToday() {
  V.cm = calMonth0();
  render();
}
function calMonth0() {
  const d = calDate(S.day || 0);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}
function calView() {
  const L = calList(),
    cm = V.cm ?? calMonth0(),
    y = Math.floor(cm / 12),
    mo = cm % 12,
    by = {};
  L.forEach((e) => (by[e.day] = by[e.day] || []).push(e));
  const today = S.day || 0,
    nx = L.filter((e) => !e.played).slice(0, 3),
    first = (new Date(Date.UTC(y, mo, 1)).getUTCDay() + 6) % 7,
    nd = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(),
    weeks = Math.ceil((first + nd) / 7),
    lg = (c) => `<img class="cl" src="${c == 'N' ? LGN : c == 'C' ? LGC : LGL}" alt="${calCmp(c)}" title="${calCmp(c)}">`;
  // Trêve : jours sans match entre deux journées de League espacées de plus de 7 jours.
  const tr = new Set();
  L.filter((e) => e.c == 'L').forEach((e, i, a) => {
    const n = a[i + 1];
    if (n && n.day - e.day > 8) for (let d = e.day + 1; d < n.day; d++) tr.add(d);
  });
  const strip = nx.length
    ? nx
        .map(
          (e) =>
            `<div class="cns"><span class="cnl">${e.opp.em}</span><div><b>${(e.c == 'N' ? ['1/4', '1/2', 'FIN'][e.k % 3] : calAb(e.opp.name))}</b><span class="mu">${fmtDay(e.day)}</span></div>${e.c == 'N' ? '' : `<i class="${e.h ? 'dm' : 'ex'}">${e.h ? 'Dom.' : 'Ext.'}</i>`}${lg(e.c)}</div>`,
        )
        .join('')
    : '<div class="mu">Aucun match à venir pour le moment.</div>';
  let g = CALD.map((d) => `<div class="chd">${d}</div>`).join('');
  for (let i = 0; i < weeks * 7; i++) {
    const dn = i - first + 1,
      dt = new Date(Date.UTC(y, mo, dn)),
      n = calDay(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()),
      out = dn < 1 || dn > nd,
      es = by[n] || [];
    g += `<div class="cdc${out ? ' out' : ''}${n == today ? ' now' : ''}${es.length ? ' mt' : ''}${tr.has(n) && !es.length ? ' tr' : ''}"><span class="cdn">${dt.getUTCDate()}</span>${es
      .map((e) => `<div class="cev" title="${calCmp(e.c)} · ${e.opp.name}${e.c == 'N' ? '' : e.h ? ' · à domicile' : ' · à l’extérieur'}"><span class="cnl">${e.opp.em}</span><span class="cab">${(e.c == 'N' ? ['1/4', '1/2', 'FIN'][e.k % 3] : calAb(e.opp.name))}</span>${e.c == 'N' ? '' : `<i class="${e.h ? 'dm' : 'ex'}">${e.h ? 'D' : 'E'}</i>`}${calRes(e)}${lg(e.c)}</div>`)
      .join('')}${tr.has(n) && !es.length && dn >= 1 && dn <= nd && n - 1 >= 0 && !tr.has(n - 1) ? '<span class="ctr">Trêve</span>' : ''}</div>`;
  }
  const ml = L.filter((e) => {
    const d = calDate(e.day);
    return d.getUTCFullYear() == y && d.getUTCMonth() == mo;
  });
  const list = ml.length
    ? ml
        .map(
          (e) =>
            `<div class="clr${e.day == nx[0]?.day && !e.played ? ' nxt' : ''}"><span class="cnl">${e.opp.em}</span><b>${e.opp.name}</b>${e.c == 'N' ? '' : `<i class="${e.h ? 'dm' : 'ex'}">${e.h ? 'Domicile' : 'Extérieur'}</i>`}<span class="cpl">${lg(e.c)} ${calCmp(e.c)}</span><span class="mu">${fmtDay(e.day)}</span>${e.played ? calRes(e) : '<span class="mu">À venir</span>'}${e.rp ? `<button class="rpb" onclick="V.rp='${e.c}:${e.k}';render()">Rapport</button>` : ''}</div>`,
        )
        .join('')
    : '<div class="mu" style="padding:10px">Aucun match ce mois-ci.</div>';
  return (
    `<div class="cal"><div class="card"><div class="tvh"><b>Prochains matchs</b>${hp('cal')}</div><div class="cnx">${strip}</div></div>` +
    `<div class="card"><div class="cmn"><button onclick="calGo(-1)" aria-label="Mois précédent">‹</button><b>${CALM[mo]} ${y}</b><button onclick="calGo(1)" aria-label="Mois suivant">›</button><button onclick="calToday()" class="cto">Aujourd’hui</button></div><div class="cgr">${g}</div></div>` +
    `<div class="card"><div class="tvh"><b>Matchs de ${CALM[mo]}</b></div>${list}</div>` +
    `<details class="dd card"><summary><b>Toutes les rencontres de la saison</b></summary>${calAll()}</details>${rpView(L)}</div>`
  );
}
// RAPPORT DE MATCH : fenêtre avec score, statistiques, événements et notes.
function rpView(L) {
  if (!V.rp) return '';
  const [c, k] = V.rp.split(':'),
    e = L.find((x) => x.c == c && x.k == +k),
    r = e && e.rp;
  if (!r) return '';
  const bar = (l, a, b, pc) => {
      const t = a + b || 1;
      return `<div class="rpbr"><b>${a}${pc ? ' %' : ''}</b><div class="rpbt"><i style="width:${Math.round((100 * a) / t)}%"></i></div><span>${l}</span><div class="rpbt r"><i style="width:${Math.round((100 * b) / t)}%"></i></div><b>${b}${pc ? ' %' : ''}</b></div>`;
    },
    ic = (t) =>
      t == 'g' ? '<svg class="ic" aria-hidden="true"><use href="#i-ball"/></svg>' : t == 'r' ? '<i class="rpc r"></i>' : t == 'p' ? '<svg class="ic" aria-hidden="true"><use href="#i-target"/></svg>' : '<svg class="ic" aria-hidden="true"><use href="#i-fluid"/></svg>',
    ens = r.ev.map(([m, t, x]) => `<div class="rpe ${t}"><span class="mu">${m}’</span>${ic(t)}<span>${x}</span></div>`).join('') || '<div class="mu">Aucun événement marquant.</div>',
    col = (s) =>
      `<div class="rpp"><b>${r.n[s]}</b>${(r.rt[s] || [])
        .map(([n, po, v, g, a]) => `<div class="rpr"><span class="mu">${po}</span><span class="rpn${n == r.mm ? ' mvp' : ''}">${n}${g ? ' · ' + g + ' but' + (g > 1 ? 's' : '') : ''}${a ? ' · ' + a + ' passe' + (a > 1 ? 's' : '') : ''}</span><b class="${v >= 7 ? 'g' : v < 5.5 ? 'b' : ''}">${v.toFixed(1)}</b></div>`)
        .join('')}</div>`;
  return `<div class="mo" onclick="V.rp=null;render()"><div class="card rpm" onclick="event.stopPropagation()"><div class="rph"><span class="cnl">${r.em[0]}</span><b>${r.n[0]}</b><b class="rps">${r.sc[0]} - ${r.sc[1]}</b><b>${r.n[1]}</b><span class="cnl">${r.em[1]}</span></div><div class="mu" style="text-align:center">${calCmp(e.c)} · journée ${e.k + 1} · ${fmtDay(r.day)}${r.mm ? ' · Homme du match : <b>' + r.mm + '</b>' : ''}</div><h2>Statistiques</h2>${bar('Possession', r.st.po[0], r.st.po[1], 1)}${bar('Tirs', r.st.tir[0], r.st.tir[1])}${bar('Tirs cadrés', r.st.cad[0], r.st.cad[1])}${bar('Passes', r.st.pas[0], r.st.pas[1])}${bar('Fautes', r.st.fau[0], r.st.fau[1])}<h2>Événements</h2><div class="rpev">${ens}</div><h2>Notes des joueurs</h2><div class="rpg">${col(0)}${col(1)}</div><div class="ctl" style="margin-top:10px"><button class="p" onclick="V.rp=null;render()">Fermer</button></div></div></div>`;
}
// Ancien affichage : toutes les rencontres de chaque journée.
function calAll() {
  let h = '<div class="ctl"><button onclick="V.all=!V.all;render()">' + (V.all ? 'Moins' : 'Toute la saison') + '</button></div>';
  for (
    let d = V.all ? 0 : Math.max(0, S.md - 1);
    d < (V.all ? S.fx.length : Math.min(S.fx.length, S.md + 4));
    d++
  )
    h +=
      `<div class="card"><b class="mu">Journée ${d + 1} · ${fmtDay(dateOf(d))}${d == S.md ? ' · prochaine' : ''}</b>` +
      S.fx[d]
        .map(([a, b]) => {
          const r = (S.hist[d] || []).find((z) => z[0] == a && z[1] == b),
            m = a == S.t || b == S.t;
          return `<div style="padding:2px 0;${m ? 'font-weight:700;color:var(--ac)' : ''}">${S.teams[a].name} <b>${r ? r[2] + '-' + r[3] : 'vs'}</b> ${S.teams[b].name}</div>`;
        })
        .join('') +
      '</div>';
  return h;
}
// Position d'un joueur sur le terrain (x, y entre 0 et 1) selon la formation et son rôle.
function pos(t, k, sd) {
  const s = slots(t.form),
    ty = POS.indexOf(s[k]),
    n = FORM[t.form][ty],
    j = s.slice(0, k).filter((z) => z == s[k]).length,
    x = [0.05, 0.24, 0.46, 0.68][ty],
    y = n == 1 ? 0.5 : 0.15 + (0.7 * j) / (n - 1),
    q = t.sq && t.lu ? t.sq[t.lu[k]] : null,
    dx = q && q.dp && ty > 0 ? Math.max(-2, Math.min(2, +q.dp || 0)) * 0.045 : 0;
  // Hauteur individuelle (p.dp, de −2 à +2) : décale le joueur vers son but ou vers le but adverse.
  const xx = Math.max(0.1, Math.min(0.74, x + dx)),
    // Décalage latéral individuel (p.dl : −1 gauche, +1 droite), très léger.
    yy = q && q.dl && ty > 0 ? Math.max(0.04, Math.min(0.96, y + Math.sign(q.dl) * 0.07)) : y;
  return sd ? [1 - xx, yy] : [xx, yy];
}
// Dessine un terrain simple en SVG.
function field(inner) {
  return `<svg viewBox="0 0 105 68" style="width:100%;background:#2e7d32;border-radius:8px"><g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".4"><rect x="1" y="1" width="103" height="66"/><line x1="52.5" y1="1" x2="52.5" y2="67"/><circle cx="52.5" cy="34" r="8"/><rect x="1" y="18" width="16" height="32"/><rect x="88" y="18" width="16" height="32"/></g>${inner}</svg>`;
}
// Motifs de maillot disponibles (bandes, moitiés, chevron…).
const JP = [
  ['v', 'Bandes verticales'],
  ['u', 'Uni'],
  ['h', 'Bandes horizontales'],
  ['m', 'Deux moitiés'],
  ['c', 'Chevron'],
  ['d', 'Bande diagonale'],
];
// Photos de joueurs ajoutées à la main : 'Nom du joueur': adresse de l'image.
const PHOTOS = {}; /* Photos de visage : ajouter ici 'Nom du joueur':'adresse-ou-data-url' (voir README). */
// Vrai si un motif de maillot est débloqué.
function kOk(p) {
  return !KDEC.some((d) => d[0] == p) || unl('kd_' + p);
}
// Liste des motifs disponibles (de base + débloqués).
function jpList() {
  return JP.concat(KDEC.filter((d) => unl('kd_' + d[0])).map((d) => [d[0], d[1]]));
}
// Renvoie le maillot d'une équipe (motif, couleur principale a, couleur secondaire b).
function kitOf(t) {
  const pl = PAL[t.name] || ['#4b3fd9', '#ffb703'],
    k = t.kit || {};
  return { p: k.p && kOk(k.p) ? k.p : 'v', a: k.a || pl[0], b: k.b || pl[1], c: k.c || pl[1] };
}
// Numéro de maillot d'un joueur (unique dans l'équipe). Les numéros de la Ligue (num) et ceux de la Cup (nc) sont indépendants.
const numKey = () => (S && S.ctx == 'C' ? 'nc' : 'num');
function pnum(t, p) {
  const K = numKey();
  if (!p[K]) {
    const used = new Set(t.sq.map((x) => x[K]).filter(Boolean));
    let h = 7;
    for (const c of p.n) h = (h * 31 + c.charCodeAt(0)) % 100003;
    let n = p.p == 'GK' && !used.has(1) ? 1 : 2 + (h % 98);
    while (used.has(n)) n = (n % 99) + 1;
    p[K] = n;
  }
  return p[K];
}
let JID = 0;
// Dessine un maillot en SVG avec motif, couleurs, numéro et nom.
function jersey(k, num, name, sz = 96) {
  const id = 'jk' + ++JID,
    L = (c) => {
      const q = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      return 0.299 * q[0] + 0.587 * q[1] + 0.114 * q[2];
    },
    body = 'M32 8L8 26 0 58l22 8 6-12v66h64V54l6 12 22-8-8-32L88 8Q60 26 32 8Z',
    pat =
      {
        u: '',
        v: [0, 1, 2, 3, 4, 5]
          .map((i) => (i % 2 ? `<rect x="${i * 20}" y="0" width="20" height="130" fill="${k.b}"/>` : ''))
          .join(''),
        h: [0, 1, 2, 3, 4, 5, 6]
          .map((i) => (i % 2 ? `<rect x="0" y="${i * 19}" width="120" height="19" fill="${k.b}"/>` : ''))
          .join(''),
        m: `<rect x="60" y="0" width="60" height="130" fill="${k.b}"/>`,
        c: `<path d="M0 60L60 100 120 60V84L60 124 0 84Z" fill="${k.b}"/>`,
        star: [
          [22, 26],
          [98, 26],
          [60, 58],
          [22, 92],
          [98, 92],
          [60, 120],
        ]
          .map(
            ([x, y]) =>
              `<polygon fill="${k.b}" points="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                .map((i) => {
                  const r = i % 2 ? 4.4 : 10,
                    a = -Math.PI / 2 + (i * Math.PI) / 5;
                  return (x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1);
                })
                .join(' ')}"/>`,
          )
          .join(''),
        bolt: `<polygon fill="${k.b}" points="72,0 36,74 58,74 46,134 90,52 66,52 84,0"/>`,
        grad: `<linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset=".15" stop-color="${k.a}"/><stop offset="1" stop-color="${k.b}"/></linearGradient><rect width="120" height="134" fill="url(#g${id})"/>`,
        check: [0, 1, 2, 3, 4, 5, 6, 7, 8]
          .map((r) =>
            [0, 1, 2, 3, 4, 5, 6, 7]
              .map((c) =>
                (r + c) % 2 ? `<rect x="${c * 15}" y="${r * 15}" width="15" height="15" fill="${k.b}"/>` : '',
              )
              .join(''),
          )
          .join(''),
        wave: [34, 64, 94, 124]
          .map(
            (y) =>
              `<path d="M0 ${y}Q15 ${y - 10} 30 ${y}T60 ${y}T90 ${y}T120 ${y}" fill="none" stroke="${k.b}" stroke-width="11"/>`,
          )
          .join(''),
        dia: [0, 1, 2, 3]
          .map((r) =>
            [0, 1, 2, 3, 4]
              .map(
                (c) =>
                  `<polygon fill="${(r + c) % 2 ? k.b : 'none'}" points="${c * 30 - (r % 2 ? 15 : 0) + 15},${r * 34} ${c * 30 - (r % 2 ? 15 : 0) + 30},${r * 34 + 17} ${c * 30 - (r % 2 ? 15 : 0) + 15},${r * 34 + 34} ${c * 30 - (r % 2 ? 15 : 0)},${r * 34 + 17}"/>`,
              )
              .join(''),
          )
          .join(''),
        d: `<path d="M0 100L90 0H120V30L30 130H0Z" fill="${k.b}" transform="translate(0,0)"/>`,
      }[k.p] || '',
    tc = L(k.p == 'm' || k.p == 'h' || k.p == 'v' ? k.a : k.a) > 150 ? '#0a0c22' : '#ffffff',
    oc = tc == '#ffffff' ? '#0a0c22' : '#ffffff',
    nm = name ? String(name).split(' ').slice(-1)[0].toUpperCase() : '';
  return `<svg class="jsy" viewBox="0 0 120 134" width="${sz}" height="${Math.round((sz * 134) / 120)}" role="img" aria-label="Maillot${nm ? ' ' + nm : ''} ${num || ''}"><defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="120" height="134" fill="${k.a}"/>${pat}<path d="M0 54L22 66 28 54V130H0Z" fill="${k.c}" opacity=".0"/></g><path d="${body}" fill="none" stroke="#0a0c22" stroke-width="3" stroke-linejoin="round"/><path d="M44 8Q60 30 76 8" fill="${k.c}" stroke="#0a0c22" stroke-width="3"/><path d="M0 58l22 8M120 58l-22 8" stroke="${k.c}" stroke-width="9"/>${nm ? `<text x="60" y="48" text-anchor="middle" font-size="${nm.length > 9 ? 9 : 12}" font-family="Bagel Fat One,Exo 2,sans-serif" fill="${tc}" stroke="${oc}" stroke-width=".8" paint-order="stroke">${nm}</text>` : ''}${num != null && num !== '' ? `<text x="60" y="94" text-anchor="middle" font-size="44" font-family="Bagel Fat One,Exo 2,sans-serif" fill="${tc}" stroke="${oc}" stroke-width="2.4" paint-order="stroke">${num}</text>` : ''}</svg>`;
}
// Portraits des joueurs (images). Les images sont dans js/images.js (IMGS).
const LNF = [
    IMGS.i3,
    IMGS.i4,
    IMGS.i5,
    IMGS.i6,
    IMGS.i7,
    IMGS.i8,
    IMGS.i9,
    IMGS.i10,
    IMGS.i11,
    IMGS.i12,
    IMGS.i13,
    IMGS.i14,
    IMGS.i15,
    IMGS.i16,
    IMGS.i17,
    IMGS.i18,
    IMGS.i19,
    IMGS.i20,
    IMGS.i21,
    IMGS.i22,
  ],
  PDF = [
    IMGS.i23,
    IMGS.i24,
    IMGS.i25,
    IMGS.i26,
    IMGS.i27,
    IMGS.i28,
    IMGS.i29,
    IMGS.i30,
    IMGS.i31,
    IMGS.i32,
    IMGS.i33,
    IMGS.i34,
    IMGS.i35,
    IMGS.i36,
    IMGS.i37,
    IMGS.i38,
    IMGS.i39,
    IMGS.i40,
    IMGS.i41,
    IMGS.i42,
    IMGS.i43,
    IMGS.i44,
    IMGS.i45,
    IMGS.i46,
    IMGS.i47,
  ],
  SDF = [
    IMGS.i48,
    IMGS.i49,
    IMGS.i50,
    IMGS.i51,
    IMGS.i52,
    IMGS.i53,
    IMGS.i54,
    IMGS.i55,
    IMGS.i56,
    IMGS.i57,
    IMGS.i58,
    IMGS.i59,
    IMGS.i60,
    IMGS.i61,
    IMGS.i62,
    IMGS.i63,
    IMGS.i64,
    IMGS.i65,
    IMGS.i66,
    IMGS.i67,
    IMGS.i68,
    IMGS.i69,
    IMGS.i70,
    IMGS.i71,
    IMGS.i72,
    IMGS.i73,
    IMGS.i74,
    IMGS.i75,
    IMGS.i76,
    IMGS.i77,
  ],
  EDF = [
    IMGS.i78,
    IMGS.i79,
    IMGS.i80,
    IMGS.i81,
    IMGS.i82,
    IMGS.i83,
    IMGS.i84,
    IMGS.i85,
    IMGS.i86,
    IMGS.i87,
    IMGS.i88,
    IMGS.i89,
    IMGS.i90,
    IMGS.i91,
    IMGS.i92,
    IMGS.i93,
    IMGS.i94,
    IMGS.i95,
    IMGS.i96,
    IMGS.i97,
    IMGS.i98,
    IMGS.i99,
    IMGS.i100,
    IMGS.i101,
    IMGS.i102,
    IMGS.i103,
    IMGS.i104,
    IMGS.i105,
    IMGS.i106,
    IMGS.i107,
  ],
SKF = [
    IMGS.i144,
    IMGS.i145,
    IMGS.i146,
    IMGS.i147,
    IMGS.i148,
    IMGS.i149,
    IMGS.i150,
    IMGS.i151,
    IMGS.i152,
    IMGS.i153,
    IMGS.i154,
    IMGS.i155,
    IMGS.i156,
    IMGS.i157,
    IMGS.i158,
    IMGS.i159,
    IMGS.i160,
    IMGS.i161,
    IMGS.i162,
    IMGS.i163,
    IMGS.i164,
    IMGS.i165,
    IMGS.i166,
    IMGS.i167,
    IMGS.i168,
    IMGS.i169,
    IMGS.i170,
    IMGS.i171,
    IMGS.i172,
    IMGS.i173,
  ],
  WBF = [
    IMGS.i174,
    IMGS.i175,
    IMGS.i176,
    IMGS.i177,
    IMGS.i178,
    IMGS.i179,
    IMGS.i180,
    IMGS.i181,
    IMGS.i182,
    IMGS.i183,
    IMGS.i184,
    IMGS.i185,
    IMGS.i186,
    IMGS.i187,
    IMGS.i188,
    IMGS.i189,
    IMGS.i190,
    IMGS.i191,
    IMGS.i192,
    IMGS.i193,
    IMGS.i194,
    IMGS.i195,
    IMGS.i196,
    IMGS.i197,
    IMGS.i198,
    IMGS.i199,
    IMGS.i200,
    IMGS.i201,
    IMGS.i202,
    IMGS.i203,
  ],
  XNF = [
    IMGS.i234,
    IMGS.i235,
    IMGS.i236,
    IMGS.i237,
    IMGS.i238,
    IMGS.i239,
    IMGS.i240,
    IMGS.i241,
    IMGS.i242,
    IMGS.i243,
    IMGS.i244,
    IMGS.i245,
    IMGS.i246,
    IMGS.i247,
    IMGS.i248,
    IMGS.i249,
    IMGS.i250,
    IMGS.i251,
    IMGS.i252,
    IMGS.i253,
    IMGS.i254,
    IMGS.i255,
    IMGS.i256,
    IMGS.i257,
    IMGS.i258,
    IMGS.i259,
    IMGS.i260,
    IMGS.i261,
    IMGS.i262,
    IMGS.i263,
  ],
  TGF = [
    IMGS.i264,
    IMGS.i265,
    IMGS.i266,
    IMGS.i267,
    IMGS.i268,
    IMGS.i269,
    IMGS.i270,
    IMGS.i271,
    IMGS.i272,
    IMGS.i273,
    IMGS.i274,
    IMGS.i275,
    IMGS.i276,
    IMGS.i277,
    IMGS.i278,
    IMGS.i279,
    IMGS.i280,
    IMGS.i281,
    IMGS.i282,
    IMGS.i283,
    IMGS.i284,
    IMGS.i285,
    IMGS.i286,
    IMGS.i287,
    IMGS.i288,
    IMGS.i289,
    IMGS.i290,
    IMGS.i291,
    IMGS.i292,
    IMGS.i293,
  ],
  PRF = [
    IMGS.i294,
    IMGS.i295,
    IMGS.i296,
    IMGS.i297,
    IMGS.i298,
    IMGS.i299,
    IMGS.i300,
    IMGS.i301,
    IMGS.i302,
    IMGS.i303,
    IMGS.i304,
    IMGS.i305,
    IMGS.i306,
    IMGS.i307,
    IMGS.i308,
    IMGS.i309,
    IMGS.i310,
    IMGS.i311,
    IMGS.i312,
    IMGS.i313,
    IMGS.i314,
    IMGS.i315,
    IMGS.i316,
    IMGS.i317,
  ],
  TCF = [
    IMGS.i318,
    IMGS.i319,
    IMGS.i320,
    IMGS.i321,
    IMGS.i322,
    IMGS.i323,
    IMGS.i324,
    IMGS.i325,
    IMGS.i326,
    IMGS.i327,
    IMGS.i328,
    IMGS.i329,
    IMGS.i330,
    IMGS.i331,
    IMGS.i332,
    IMGS.i333,
    IMGS.i334,
    IMGS.i335,
    IMGS.i336,
    IMGS.i337,
    IMGS.i338,
    IMGS.i339,
    IMGS.i340,
    IMGS.i341,
    IMGS.i342,
    IMGS.i343,
    IMGS.i344,
    IMGS.i345,
    IMGS.i346,
    IMGS.i347,
  ],
  VGF = [
    IMGS.i348,
    IMGS.i349,
    IMGS.i350,
    IMGS.i351,
    IMGS.i352,
    IMGS.i353,
    IMGS.i354,
    IMGS.i355,
    IMGS.i356,
    IMGS.i357,
    IMGS.i358,
    IMGS.i359,
    IMGS.i360,
    IMGS.i361,
    IMGS.i362,
    IMGS.i363,
    IMGS.i364,
    IMGS.i365,
    IMGS.i366,
    IMGS.i367,
    IMGS.i368,
    IMGS.i369,
    IMGS.i370,
    IMGS.i371,
    IMGS.i372,
    IMGS.i373,
    IMGS.i374,
    IMGS.i375,
    IMGS.i376,
    IMGS.i377,
  ],
  KDF = [
    IMGS.i378,
    IMGS.i379,
    IMGS.i380,
    IMGS.i381,
    IMGS.i382,
    IMGS.i383,
    IMGS.i384,
    IMGS.i385,
    IMGS.i386,
    IMGS.i387,
    IMGS.i388,
    IMGS.i389,
    IMGS.i390,
    IMGS.i391,
    IMGS.i392,
    IMGS.i393,
    IMGS.i394,
    IMGS.i395,
    IMGS.i396,
    IMGS.i397,
    IMGS.i398,
    IMGS.i399,
    IMGS.i400,
    IMGS.i401,
    IMGS.i402,
    IMGS.i403,
    IMGS.i404,
    IMGS.i405,
    IMGS.i406,
    IMGS.i407,
  ],
  RYF = [
    IMGS.i204,
    IMGS.i205,
    IMGS.i206,
    IMGS.i207,
    IMGS.i208,
    IMGS.i209,
    IMGS.i210,
    IMGS.i211,
    IMGS.i212,
    IMGS.i213,
    IMGS.i214,
    IMGS.i215,
    IMGS.i216,
    IMGS.i217,
    IMGS.i218,
    IMGS.i219,
    IMGS.i220,
    IMGS.i221,
    IMGS.i222,
    IMGS.i223,
    IMGS.i224,
    IMGS.i225,
    IMGS.i226,
    IMGS.i227,
    IMGS.i228,
    IMGS.i229,
    IMGS.i230,
    IMGS.i231,
    IMGS.i232,
    IMGS.i233,
  ],
  CYF = [
    IMGS.i108,
    IMGS.i109,
    IMGS.i110,
    IMGS.i111,
    IMGS.i112,
    IMGS.i113,
    IMGS.i114,
    IMGS.i115,
    IMGS.i116,
    IMGS.i117,
    IMGS.i118,
    IMGS.i119,
    IMGS.i120,
    IMGS.i121,
    IMGS.i122,
    IMGS.i123,
    IMGS.i124,
    IMGS.i125,
    IMGS.i126,
    IMGS.i127,
    IMGS.i128,
    IMGS.i129,
    IMGS.i130,
    IMGS.i131,
    IMGS.i132,
    IMGS.i133,
    IMGS.i134,
    IMGS.i135,
    IMGS.i136,
    IMGS.i137,
    IMGS.i138,
    IMGS.i139,
    IMGS.i140,
    IMGS.i141,
    IMGS.i142,
    IMGS.i143,
  ];
// Table des portraits par planète : liste d'images, indices des visages masculins (m) et féminins
// (w).
const FACES = {
    Xzion: { i: LNF, m: [0, 1, 2, 4, 6, 8, 10, 12, 13, 15, 16, 18], w: [3, 5, 7, 9, 11, 14, 17, 19] },
    Cyclopia: { i: CYF, u: 1, m: [], w: [] },
    Hektonïa: {
      i: EDF,
      m: [0, 2, 3, 7, 9, 10, 11, 17, 18, 19, 22, 24, 28],
      w: [1, 4, 5, 6, 8, 12, 13, 14, 15, 16, 20, 21, 23, 25, 26, 27, 29],
    },
    Ombra: {
      i: SDF,
      m: [0, 2, 3, 4, 6, 11, 12, 13, 14, 15, 16, 20, 21, 22, 24, 25, 26, 27],
      w: [1, 5, 7, 8, 9, 10, 17, 18, 19, 23, 28, 29],
    },
    Paradisia: { i: PDF, u: 1, m: [], w: [] },
    // c = portraits des personnages de la série (nom du joueur → numéro du portrait, à partir de 0).
    // Ces portraits ne sont jamais donnés à un joueur inventé.
    Akillian: { c: { 'D’Jok': 3, 'Micro-Ice': 6, Sinedd: 27, Rocket: 2, Tia: 5, Mei: 4, Thran: 0, Ahito: 1 }, i: SKF, m: [0, 1, 2, 3, 6, 8, 10, 11, 12, 14, 15, 16, 17, 19, 20, 22, 24, 26, 27, 28, 29], w: [4, 5, 7, 9, 13, 18, 21, 23, 25] },
    'Wamba Prime': { i: WBF, m: [0, 1, 2, 3, 6, 7, 8, 12, 14, 16, 18, 19, 20, 23, 26, 28, 29], w: [4, 5, 9, 10, 11, 13, 15, 17, 21, 22, 24, 25, 27] },
    'Archipel Xenon': { i: XNF, u: 1, m: [], w: [] },
    Tigre: { i: TGF, u: 1, m: [], w: [] },
    Pirates: { i: PRF, u: 1, m: [], w: [] },
    Technoïd: { i: TCF, u: 1, m: [], w: [] },
    Vega: { i: VGF, u: 1, m: [], w: [] },
    Kaldor: { i: KDF, u: 1, m: [], w: [] },
    Unadar: { i: RYF, m: [], w: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
  },
  GOV = { Warren: 'M', Nitro: 'M', Sarlight: 'F' },
  GFW = new Set(
    'Nyra Iris Juno Mira Wren Sable Nova Kaya Opal Talia Xara Yara Lyra Vela Seren Ione Zara Elin Kira Sela Mara Tessa Livia Neva Aria Elara Syla Orla'.split(
      ' ',
    ),
  );
// Genre d'un joueur (M ou F) selon sa planète et son prénom.
function gOf(p) {
  const f = p.n.split(' ')[0],
    pl = planet(p.og || '');
  if (pl == 'Cyclopia') return 'M';
  if (pl == 'Hektonïa' || pl == 'Unadar') return 'F';
  if (pl == 'Technoïd') return 'N';
  if (GOV[f]) return GOV[f];
  if (p.g_) return p.g_;
  return GFW.has(f) ? 'F' : 'M';
}
// Planètes dont les portraits sont ACTIFS. Pour activer d'autres équipes : ajouter leur nom ici
// (ex. ['Xzion','Cyclopia']).
// PROTOTYPES : planètes dont les portraits sont encore des essais (visibles seulement pour le
// créateur). Liste vidée au patch 1.36 : portraits provisoires masqués.
const FACE_PROTO = Object.keys(FACES).filter((k) => k != 'Xzion'), // portraits de toutes les planètes réactivés (1.39.0.3)
  FACE_ON = ['Xzion', ...FACE_PROTO];
// Choisit le portrait d'un joueur (sans doublon dans l'univers, selon son genre).
function lnFace(p) {
  try {
    // Les Tigres Rouges partagent la planète des Snow Kids mais ont leur propre planche de portraits.
    const pl = p.og == 'Tigres Rouges' ? 'Tigre' : planet(p.og || ''),
      F = FACE_ON.includes(pl) ? FACES[pl] : null;
    if (!F) return '';
    // Personnages canon : toujours leur propre portrait ; les autres joueurs n'en reçoivent jamais un réservé.
    const rs = F.c ? Object.values(F.c) : [];
    if (F.c && p.c && F.c[p.n] != null) {
      p.fk = F.c[p.n];
      p.fp = pl;
    } else if (rs.length && !p.c && p.fp == pl && rs.includes(p.fk)) p.fk = null;
    if (p.fk == null || p.fp != pl) {
      const u = new Set();
      [S.teams, S.alt && S.alt.teams].forEach((a) =>
        (a || []).forEach((t) =>
          t.sq.forEach((x) => {
            if (x.fk != null && x.fp == pl) u.add(x.fk);
          }),
        ),
      );
      const L = F.u ? F.i.map((_, k) => k) : gOf(p) == 'F' ? F.w : F.m;
      let i = L.find((k) => !u.has(k) && !rs.includes(k));
      if (i == null) {
        let h = 0;
        for (const c of p.n) h = (h * 31 + c.charCodeAt(0)) % L.length;
        const L2 = L.filter((k) => !rs.includes(k));
        i = (L2.length ? L2 : L)[h % (L2.length || L.length)];
      }
      p.fk = i;
      p.fp = pl;
    }
    return F.i[p.fk] || '';
  } catch (e) {
    return '';
  }
}
// Adresse de l'image à utiliser pour un joueur.
function phUrl(p) {
  try {
    return PHOTOS[p.n] || p.ph || lnFace(p);
  } catch (e) {
    return '';
  }
}
// Style CSS qui met le portrait en fond d'une carte.
function phBg(p) {
  const u = phUrl(p);
  return u
    ? `;--pa:linear-gradient(180deg,rgba(8,12,24,.25),rgba(8,12,24,.78));--pb:url('${u}') center top/cover no-repeat;background:var(--pa),var(--pb)`
    : '';
}
// Balise image du portrait d'un joueur (ou cadre vide).
function photo(p) {
  const u = phUrl(p);
  return u
    ? `<img class="pfph" src="${u}" alt="${p.n}">`
    : `<div class="pfph" title="Photo à venir"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="12" fill="currentColor"/><path d="M8 62c2-18 12-26 24-26s22 8 24 26z" fill="currentColor"/></svg></div>`;
}
// Change une couleur ou un motif du maillot du club.
function setKit(k, v) {
  const t = me();
  t.kit = { ...kitOf(t), [k]: v };
  save();
  render();
}
// Remet le maillot aux couleurs d'origine.
function resetKit() {
  delete me().kit;
  save();
  render();
}
// Carte « Maillot » avec aperçu et réglages.
function kitCard() {
  const t = me(),
    k = kitOf(t),
    st = t.lu
      .slice(0, 4)
      .map((i) => t.sq[i])
      .filter(Boolean);
  return `<div class="card"><b>Maillot de ${t.name}</b> ${hp('kit')}<div class="kitr"><div class="kitp">${st.map((p) => `<div class="kitj">${jersey(k, pnum(t, p), p.n, 92)}</div>`).join('')}</div><div class="kitc"><label>Motif <select onchange="setKit('p',this.value)">${jpList()
    .map(([v, n]) => `<option value="${v}" ${k.p == v ? 'selected' : ''}>${n}</option>`)
    .join(
      '',
    )}</select></label><label>Couleur principale <input type="color" value="${k.a}" onchange="setKit('a',this.value)"></label><label>Couleur secondaire <input type="color" value="${k.b}" onchange="setKit('b',this.value)"></label><label>Col et poignets <input type="color" value="${k.c}" onchange="setKit('c',this.value)"></label><button onclick="resetKit()">Couleurs du club</button></div></div><div class="mu">Aperçu sur vos titulaires. Les maillots apparaissent dans les fiches joueurs ; sur le terrain, les joueurs prennent vos couleurs.</div></div>`;
}
/*MAN-START*/
// MOTEUR D'ANIMATION DES MATCHS (terrain 2D et 3D, passes, tirs, foule, rejeu). Tout est enfermé
// dans cette grande fonction : on n'y touche que pour changer l'apparence du match.
const MAN = (() => {
  // Outils mathématiques : clamp (limiter une valeur entre deux bornes), lerp (mélange entre deux
  // valeurs), eio (accélération/décélération douce).
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp = (a, b, t) => a + (b - a) * t,
    eio = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  // FNT = police du jeu ; W et H = taille du terrain en pixels (1000 × 600) dont tout le dessin
  // dépend.
  const FNT = '"Bagel Fat One","Exo 2",sans-serif',
    W = 1000,
    H = 600;
  // Transforme un texte en nombre stable (sert à choisir toujours les mêmes détails pour un même
  // joueur).
  const hash = (s) => {
    let h = 7;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 100003;
    return h;
  };
  // Générateur de hasard reproductible (même graine = même résultat).
  const mul = (a) => () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Convertit une couleur '#rrggbb' en trois nombres (rouge, vert, bleu).
  const rgb = (c) => {
    c = String(c || '#888888');
    if (c[0] != '#' || c.length < 7) return [136, 136, 136];
    const n = parseInt(c.slice(1, 7), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  // Distance entre deux couleurs : plus elle est petite, plus les couleurs se ressemblent.
  const dist = (a, b) => {
    const p = rgb(a),
      q = rgb(b);
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  };
  // Luminosité d'une couleur (0 = noir, 255 = blanc).
  const lum = (c) => {
    const p = rgb(c);
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
  };
  // Éclaircit (k > 1) ou assombrit (k < 1) une couleur.
  const shade = (c, k) =>
    '#' +
    rgb(c)
      .map((v) =>
        clamp((v * k) | 0, 0, 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  // Couleur avec transparence, au format CSS.
  const rgba = (c, a) => {
    const p = rgb(c);
    return `rgba(${p[0]},${p[1]},${p[2]},${a})`;
  };
  /* Thèmes de terrain par planète */
  // Thème de terrain par défaut : couleurs du ciel, de l'herbe, des lignes et effets d'ambiance.
  const TD = {
    sky: '#0d2b14',
    g: ['#2e8a3a', '#277d33'],
    l: '#ffffff',
    fx: '',
    af: 520,
    n: 'Terrain standard',
  };
  // THÈMES DE TERRAIN PAR PLANÈTE (couleurs, effets comme la neige ou la pluie). Modifier ici pour
  // changer le décor d'une planète.
  const TH = {
    Akillian: { sky: '#9cc4e4', g: ['#d4e6f6', '#c2daef'], l: '#4f7fb5', fx: 'snow', af: 700, dk: 0 },
    Ombra: { sky: '#0f0820', g: ['#2b2050', '#241a44'], l: '#a58cff', fx: 'star', af: 380 },
    Paradisia: { sky: '#aeeeff', g: ['#45dcc0', '#38c9ae'], l: '#ffffff', fx: 'spore', af: 620, dk: 0 },
    Xzion: { sky: '#14140a', g: ['#3c4118', '#343815'], l: '#ffe14a', fx: 'bolt', af: 560 },
    'Wamba Prime': { sky: '#0b3318', g: ['#2f9a40', '#278a36'], l: '#ffffff', fx: 'leaf', af: 480 },
    Unadar: { sky: '#321a0e', g: ['#8c5b34', '#7d4f2b'], l: '#f5dcb4', fx: 'ash', af: 420 },
    'Archipel Xenon': { sky: '#06282a', g: ['#1f8f72', '#1a7f64'], l: '#c8fff2', fx: 'spore', af: 500 },
    Pirates: { sky: '#08162d', g: ['#3f6e90', '#356380'], l: '#ffffff', fx: 'wave', af: 450 },
    Hektonïa: { sky: '#2a1304', g: ['#d98a1c', '#c97d14'], l: '#fff6c4', fx: 'bolt', af: 600 },
    Cyclopia: { sky: '#1a0a2c', g: ['#7b3ba9', '#6d3299'], l: '#f3dcff', fx: 'star', af: 430 },
    Technoïd: { sky: '#0e131a', g: ['#5e6b77', '#535f6b'], l: '#d2e8ff', fx: 'grid', af: 520 },
    Vega: { sky: '#040920', g: ['#2559ba', '#1f4fa9'], l: '#d9e7ff', fx: 'star', af: 540 },
    Kaldor: { sky: '#150a2e', g: ['#5b38c2', '#4f2fb1'], l: '#eee2ff', fx: 'swirl', af: 400 },
    Ysolde: { sky: '#2a0a22', g: ['#c3498f', '#b24180'], l: '#ffe2f5', fx: 'star', af: 560 },
  };
  TH['Akillian'].n = 'Plaine glacée d’Akillian';
  TH['Ombra'].n = 'Arène d’Ombra';
  TH['Paradisia'].n = 'Parc de Paradisia';
  TH['Xzion'].n = 'Stade orageux de Xzion';
  TH['Wamba Prime'].n = 'Jungle de Wamba Prime';
  TH['Unadar'].n = 'Carrière d’Unadar';
  TH['Archipel Xenon'].n = 'Marais de l’Archipel Xenon';
  TH['Pirates'].n = 'Pont des Pirates';
  TH['Hektonïa'].n = 'Centrale d’Hektonïa';
  TH['Cyclopia'].n = 'Cirque de Cyclopia';
  TH['Technoïd'].n = 'Complexe de Technoïd';
  TH['Vega'].n = 'Observatoire de Vega';
  TH['Kaldor'].n = 'Spirale de Kaldor';
  TH['Ysolde'].n = 'Jardin d’Ysolde';
  const FULL = true;
  // GEO = marges du terrain ; st = L'ÉTAT COMPLET de l'animation (positions des joueurs, ballon,
  // scène en cours, caméra…).
  const GEO = { mx: W * 0.045, my: H * 0.115 },
    st = {
      M: null,
      Q: [],
      cur: null,
      si: 0,
      t: 0,
      pos: [[], []],
      ang: [[], []],
      ball: { x: 0.5, y: 0.5, z: 0 },
      own: 0,
      hold: null,
      half: 0,
      ko: 1,
      v3: 0,
      vk: 0,
      cam: null,
      look: null,
      fx: [],
      cheer: 0,
      flash: 0,
      last: null,
      rpq: 0,
      rpl: 0,
      live: null,
      cutEnd: null,
      hold2: 0,
      fin: 0,
      raf: 0,
      pts: [],
      tm: 0,
      trail: [],
      ban: null,
      nums: null,
      th: TD,
      kit: null,
      w: null,
      cv: null,
      c: null,
      bg: null,
      bgk: '',
      aura: null,
      dive: 0,
      lastT: 0,
      acc: 0,
      id: 0,
      wasConn: false,
      sd: 0,
    };
  // Raccourci : trouve un élément de la page par son identifiant.
  const el = (id) => document.getElementById(id);
  // Vrai si l'animation de match est activée dans les paramètres.
  const on = () => !!(typeof ST !== 'undefined' && ST.an !== 0 && V.m);
  // Vrai en mode « léger » (moins d'effets) pour les petits ordinateurs.
  const lite = () => !!(ST.anlite || ST.rm);
  // Facteur de vitesse de l'animation selon le rythme choisi.
  const pf = () => [1.35, 1, 0.55][V.sp ?? 1];
  // Sens d'attaque d'une équipe (change à la mi-temps).
  const dirOf = (t) => ((t == 0) == (st.half == 0) ? 1 : -1);
  // Côté du but défendu par une équipe.
  const goalOf = (t) => (dirOf(t) > 0 ? 1 : 0);
  // Renvoie l'équipe t (0 ou 1) du match en cours.
  const tm = (t) => st.M.t[t];
  const slotsOf = (t) => slots(tm(t).form);
  // Nom du joueur k de l'équipe t.
  const pname = (t, k) => {
    const T = tm(t),
      p = T.sq[T.lu[k]];
    return p ? p.n : 'Joueur';
  };
  const planetOf = (M) => planet(M.t[0].name);
  /* ---------- initialisation d’un match ---------- */
  // CHOIX DES COULEURS EN MATCH : chaque équipe garde la couleur principale de son maillot. Si les
  // deux sont trop proches, la seconde est éclaircie ou assombrie. Le gardien reçoit une couleur
  // différente.
  function kits(M) {
    const q0 = kitOf(M.t[0]),
      q1 = kitOf(M.t[1]),
      a = [q0.a, q0.b],
      b = [q1.a, q1.b];
    let ka = a[0],
      kb = b[0];
    if (dist(ka, kb) < 110)
      kb =
        lum(kb) < 85 && lum(ka) < 85 ? shade(kb, 4.2) : lum(kb) >= lum(ka) ? shade(kb, 0.58) : shade(kb, 1.7);
    if (dist(ka, kb) < 60) kb = lum(ka) > 140 ? '#222a44' : '#f4f6ff';
    // Gardiens : maillot de leur équipe avec les couleurs inversées (secondaire en principale, principale en secondaire).
    const kc = [ka, kb],
      g1 = [a[1], b[1]].map((x, t) => (dist(x, kc[t]) < 70 ? (lum(kc[t]) > 140 ? shade(kc[t], 0.5) : shade(kc[t], 1.9)) : x)),
      gk = g1,
      gk2 = kc;
    return { c: [ka, kb], c2: [a[1], b[1]], gk, gk2 };
  }
  // Numéros de maillot des joueurs en match.
  function nums(M) {
    return M.t.map((T) => {
      const used = new Set([1]),
        o = {};
      T.lu.forEach((li, k) => {
        const p = T.sq[li];
        if (!p) return;
        if (p.p == 'GK' && !Object.values(o).includes(1)) {
          o[li] = 1;
          return;
        }
        o[li] = pnum(T, p);
      });
      return o;
    });
  }
  // Numéro d'un joueur.
  const numOf = (t, k) => {
    const T = tm(t);
    // Numéro réel du joueur actuellement sur le terrain (suit les remplacements et le choix du manager).
    const p = T.sq[T.lu[k]];
    return p ? pnum(T, p) : k + 1;
  };
  // Positions de départ au coup d'envoi.
  function koPos(t, k) {
    const T = tm(t),
      q = pos(T, k, 0),
      u = k ? q[0] * 0.78 : 0.04,
      d = dirOf(t);
    return [d > 0 ? u : 1 - u, 0.5 + (q[1] - 0.5) * 0.9];
  }
  // Prépare l'animation pour un nouveau match (équipes, couleurs, positions).
  function init(M) {
    st.M = M;
    st.Q = [];
    st.cur = null;
    st.si = 0;
    st.half = 0;
    st.ko = 1;
    st.own = 0;
    st.hold = null;
    st.v3 = 0;
    st.vk = 0;
    st.stall = 0;
    st.cam = null;
    st.look = null;
    st.camv = null;
    st.fx = [];
    st.cheer = 0;
    st.flash = 0;
    st.last = null;
    st.rpq = 0;
    st.rpl = 0;
    st.live = null;
    st.aura = null;
    st.dive = 0;
    st.ban = null;
    st.trail = [];
    st.gone = new Set();
    st.fin = 0;
    st.hold = null;
    st.sawSc = 0;
    st.id = 0;
    st.hold2 = 0;
    st.th = TH[planetOf(M)] || TD;
    st.kit = kits(M);
    st.nums = nums(M);
    st.bgk = '';
    for (let t = 0; t < 2; t++)
      for (let k = 0; k < 7; k++) {
        const q = koPos(t, k);
        st.pos[t][k] = q.slice();
        st.ang[t][k] = dirOf(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    st.ball = { x: 0.5, y: 0.5, z: 0 };
    st.pts = [];
    M.vsc = null;
    M.vn = null;
    M.vmin = null;
    M.vst = null;
    if (!st.w) build();
    hud();
  }
  // Crée l'élément de page qui contient le canevas de l'animation.
  function build() {
    const w = document.createElement('div');
    w.className = 'anw';
    w.innerHTML =
      '<div class="anc"><canvas id="ancv"></canvas><div class="anpl" id="anpl"></div></div><div class="anb" id="anb"></div>';
    st.w = w;
    st.cv = w.querySelector('canvas');
    st.pl = w.querySelector('#anpl');
  }
  // Ajuste la taille du canevas à l'écran.
  function size() {
    const q = lite() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const cv = st.cv;
    if (!cv) return;
    const w = Math.round(W * q),
      h = Math.round(H * q);
    if (cv.width != w || cv.height != h) {
      cv.width = w;
      cv.height = h;
      st.bgk = '';
    }
    st.c = cv.getContext('2d');
    st.c.setTransform(q, 0, 0, q, 0, 0);
  }
  /* ---------- interface autour du canvas ---------- */
  // Dessine les boutons sous le terrain (rejouer, vue 3D, foule, rythme).
  function hud() {
    const b = st.w && st.w.querySelector('#anb');
    if (!b) return;
    const tg = (k, l) =>
      `<button class="ant ${ST[k] ? 'on' : ''}" onclick="MAN.tog('${k}')" title="${l}">${l} ${ST[k] ? '✓' : '✕'}</button>`;
    b.innerHTML = `<button class="ant" onclick="MAN.replay()" ${st.last ? '' : 'disabled'} title="Revoir la dernière action marquante au ralenti">Rejouer l’action</button>${FULL ? tg('an3d', 'Vue 3D') : ''}${tg('anamb', 'Foule')}<label class="ant">Rythme <select onchange="MAN.pace(this.value)"><option value="0" ${ST.anp ? '' : 'selected'}>Match complet</option><option value="1" ${ST.anp == 1 ? 'selected' : ''}>Temps forts</option></select></label><span class="anth">${st.th.n || ''}</span>`;
  }
  // Active ou désactive une option d'animation (vue 3D, foule…).
  function tog(k) {
    ST[k] = ST[k] ? 0 : 1;
    stSave();
    if (k == 'anamb') amb.set();
    hud();
  }
  // Change le rythme du match (« Match complet », « Temps forts »…).
  function pace(v) {
    ST.anp = +v;
    stSave();
    hud();
  }
  // Place l'animation dans la page Match.
  function attach() {
    const h = el('anh');
    if (!h || !on()) return;
    if (!st.w) build();
    if (st.M !== V.m) init(V.m);
    if (st.w.parentNode !== h) h.appendChild(st.w);
    size();
    hud();
    amb.set();
    ui();
    if (!st.raf) {
      st.lastT = performance.now();
      st.raf = requestAnimationFrame(frame);
    }
  }
  // Vrai si le canevas de l'animation est bien affiché dans la page.
  const conn = () => !!(st.w && st.w.isConnected);
  // Vrai si une animation est en cours (scène, célébration ou rejeu).
  const busy = () => on() && st.M === V.m && !!(st.cur || st.Q.length || st.cutEnd || st.rpl || st.hold > 0);
  // Fait avancer le match plus vite quand aucune animation n'est en cours.
  const idle = () => {
    if (!on()) return true;
    if (st.M !== V.m) {
      if (V.m) init(V.m);
      return true;
    }
    if (!conn()) {
      flush();
      return true;
    }
    return !(st.cur || st.Q.length || st.cutEnd || st.rpl || st.rpq || st.hold > 0);
  };
  /* ---------- affichage différé (score, chrono, journal, stats) ---------- */
  // Texte de la minute affichée (ou « Terminé »).
  const clk = (M) => (M.done && !busy() ? 'Terminé' : (M.vmin ?? M.min) + '’');
  // Score affiché pour un match.
  const sc = (M) => M.vsc || M.sc;
  // Journal du match affiché (du plus récent au plus ancien).
  // Pendant le match, le journal garde au plus LOGN lignes (les plus anciennes disparaissent une à une) pour ne
  // pas s'agrandir ; une fois le match terminé, il montre tout.
  const lg = (M) => {
    const a = (M.vn == null ? M.lg : M.lg.slice(0, M.vn)).slice().reverse();
    return M.done && !busy() ? a : a.slice(0, LOGN);
  };
  // Statistiques affichées pour un match.
  const sts = (M) => M.vst || M.st;
  // Met à jour le score, la minute et le journal affichés.
  function ui() {
    const M = st.M;
    if (!M) return;
    const a = el('ansc'),
      c = el('anclk'),
      l = el('anlg'),
      s = el('anst');
    if (a) a.textContent = sc(M).join(' - ');
    if (c) c.textContent = clk(M);
    const cm = el('ancm');
    if (cm) cm.innerHTML = lgR(lg(M)[0] || '');
    if (l) {
      l.classList.toggle('cap', !(M.done && !busy()));
      l.innerHTML = lgR(
        lg(M)
          .map((x) => `<div>${x}</div>`)
          .join('') || "<div class='mu'>Le match n’a pas commencé.</div>",
      );
    }
    if (s) s.innerHTML = lgR(statsBox(M));
  }
  // Termine proprement les scènes en attente.
  function drain() {
    const M = st.M;
    if (!M) return;
    M.vsc = null;
    M.vn = null;
    M.vmin = null;
    M.vst = null;
    ui();
    if (M.done) render();
  }
  /* ---------- file de scènes ---------- */
  // Ajoute une scène (but, tir, faute…) venant du moteur de match dans la file d'animation.
  function push(M, sx, n1, sc0, pre) {
    if (st.M !== M) init(M);
    // Si rien n'est « figé » à l'affichage (début de match, après un saut d'animation…), on fige l'état
    // d'avant la tranche pour que le journal ne devance pas l'animation.
    if (pre) {
      if (M.vn == null) M.vn = pre.n;
      if (M.vsc == null) M.vsc = sc0.slice();
      if (M.vst == null) M.vst = pre.st;
      if (M.vmin == null) M.vmin = pre.min;
    }
    const s = sx || { k: 'build', at: 0 };
    st.Q.push({
      ...s,
      id: ++st.id,
      min: M.min,
      sc: M.sc.slice(),
      sc0: sc0.slice(),
      n1,
      st: JSON.parse(JSON.stringify(M.st)),
      last: M.min >= 90 ? 2 : M.min == 45 && ST.ht ? 1 : 0,
      h2: M.min > 45,
    });
    if (!conn() || !on()) flush();
  }
  // Joue instantanément toutes les scènes restantes.
  function flush() {
    const M = st.M;
    endCut(true);
    if (M && st.Q.length) {
      const s = st.Q[st.Q.length - 1];
      M.vsc = s.sc;
      M.vn = s.n1;
      M.vmin = s.min;
      M.vst = s.st;
      st.Q = [];
      st.cur = null;
      st.rpl = 0;
      st.rpq = 0;
      if (s.last == 1 || (s.min == 45 && M.min > 45)) st.half = 1;
      if (M.min > 45) st.half = 1;
      if (M) ui();
    }
    st.cur = null;
    st.Q = [];
    st.rpl = 0;
    st.rpq = 0;
    if (M && M.vsc === undefined) {
    }
    if (M) {
      M.vsc = null;
      M.vn = null;
      M.vmin = null;
      M.vst = null;
    }
    amb.level(0.02);
  }
  /* ---------- génération du plan d’animation d’une scène ---------- */
  // CHORÉGRAPHIE D'UNE SCÈNE : décide qui passe à qui, d'où part le tir, comment se déplace le
  // ballon.
  function planOf(sc) {
    const rnd = mul(sc.id * 7919 + hash(sc.min + '' + sc.sc.join())),
      A = sc.at,
      D = 1 - A,
      sl = slots(tm(A).form),
      f = pf();
    const tier = (k) => ({ GK: 0, DEF: 1, MID: 2, ATT: 3 })[sl[k]] ?? 1,
      fast = ST.anp == 1 && sc.k != 'shot';
    const segs = [],
      shot = sc.k == 'shot',
      onT = shot && sc.o != 'miss';
    const pickW = (ex, w, tt = A) => {
      const c = [];
      for (let k = 0; k < 7; k++)
        if (!ex.includes(k) && !st.gone.has(tt + '_' + k)) {
          const x = w(k);
          if (x > 0) c.push([k, x]);
        }
      if (!c.length) return (ex[0] + 1) % 7;
      let r = rnd() * c.reduce((a, b) => a + b[1], 0);
      for (const [k, x] of c) {
        r -= x;
        if (r <= 0) return k;
      }
      return c[0][0];
    };
    const sp0 = !!(sc.pen || sc.fk),
      n = sp0 ? 0 : fast ? 1 : shot ? (ST.anp == 1 ? 2 : 3 + ((rnd() * 2) | 0)) : 2 + ((rnd() * 3) | 0);
    let cur = sp0 ? sc.pl : pickW([sc.pl ?? -1], (k) => [1, 3, 3, 0][tier(k)]);
    if (shot && !sp0 && cur == sc.pl) cur = pickW([sc.pl], (k) => 1);
    const chain = [cur];
    for (let j = 0; j < n; j++) {
      let nx;
      if (shot && j == n - 1) nx = sc.pl;
      else {
        // Les passes vont surtout vers l'avant : un joueur plus reculé que le porteur est beaucoup moins choisi.
        const from = chain[chain.length - 1],
          tA = tm(A),
          fx0 = pos(tA, from, 0)[0];
        nx = pickW([from, ...(shot ? [sc.pl] : [])], (k) => (1 + tier(k) * 1.2) * (pos(tA, k, 0)[0] >= fx0 - 0.03 ? 1.6 : 0.2));
      }
      chain.push(nx);
    }
    if (sc.k == 'block' || (!shot && chain.length < 3 && !fast))
      chain.push(pickW([chain[chain.length - 1]], (k) => tier(k) + 1));
    segs.push({ k: 'rec', a: chain[0], d: 0.35 * f });
    for (let j = 0; j < chain.length - 1; j++)
      segs.push({ k: 'pass', a: chain[j], b: chain[j + 1], d: (fast ? 0.38 : 0.52) * f, h: 1 + rnd() * 2 });
    const gx = goalOf(A),
      dd = dirOf(A);
    if (shot) {
      const spot = sc.pen
        ? [gx - dd * 0.105, 0.5]
        : sc.fk
          ? [gx - dd * (0.2 + 0.04 * rnd()), 0.5 + (rnd() < 0.5 ? -1 : 1) * (0.04 + 0.1 * rnd())]
          : [gx - dd * (0.13 + 0.05 * rnd()), 0.5 + (rnd() < 0.5 ? -1 : 1) * (0.07 + 0.12 * rnd())];
      let ty, tz;
      if (sc.o == 'goal') {
        ty = 0.5 + (rnd() < 0.5 ? -1 : 1) * (0.022 + 0.026 * rnd());
        tz = 0.4 + 1.7 * rnd();
      } else if (sc.o == 'save') {
        ty = 0.5 + (rnd() < 0.5 ? -1 : 1) * 0.03 * rnd();
        tz = 0.6 + 1 * rnd();
      } else {
        if (rnd() < 0.5) {
          ty = 0.5 + (rnd() < 0.5 ? -1 : 1) * (0.075 + 0.06 * rnd());
          tz = 0.5 + 1.6 * rnd();
        } else {
          ty = 0.5 + (rnd() - 0.5) * 0.08;
          tz = 3 + 1.2 * rnd();
        }
      }
      const fl = !!sc.fl && onT && ST.anfl !== 0;
      segs.push({ k: 'wind', a: sc.pl, d: (fl ? 1.25 : 0.6) * f, spot, fl, fk: sc.fk });
      segs.push({ k: 'shot', a: sc.pl, d: 0.72 * f, t: [gx, ty, tz], o: sc.o, spot, fl });
      segs.push({
        k: 'res',
        a: sc.pl,
        d: (sc.o == 'goal' ? 2.1 : sc.o == 'save' ? 1.3 : 1.0) * f,
        t: [gx, ty, tz],
        o: sc.o,
        spot,
        gf: sc.gf,
        gn: sc.gn,
      });
    } else {
      const by = pickW([0], (k) => 1 + { GK: 0, DEF: 1, MID: 2, ATT: 3 }[slots(tm(D).form)[k]], D);
      segs.push({
        k: 'steal',
        a: chain[chain.length - 1],
        by,
        d: 0.4 * f,
        fn: sc.k == 'block' ? sc.fn : null,
      });
      segs.push({ k: 'hold', d: (fast ? 0.12 : 0.3) * f });
    }
    return { segs, chain, A, D, shot, onT };
  }
  /* ---------- cycle d’une scène ---------- */
  // Photographie les positions (pour le rejeu).
  function snap() {
    return {
      pos: st.pos.map((a) => a.map((q) => q.slice())),
      ang: st.ang.map((a) => a.slice()),
      ball: { ...st.ball },
      own: st.own,
      hold: st.hold && { ...st.hold },
      half: st.half,
    };
  }
  // Restaure une photographie de positions.
  function restore(s) {
    st.pos = s.pos.map((a) => a.map((q) => q.slice()));
    st.ang = s.ang.map((a) => a.slice());
    st.ball = { ...s.ball };
    st.own = s.own;
    st.hold = s.hold && { ...s.hold };
    st.half = s.half;
  }
  // Démarre une scène animée.
  function startScene(sc, replay) {
    st.sawSc = 1;
    st.cur = sc;
    st.plan = planOf(sc);
    st.si = -1;
    st.t = 0;
    st.rp = !!replay;
    st.aura = null;
    st.dive = 0;
    st.ban = null;
    st.ko = 0;
    if (!replay) {
      const h = sc.h2 ? 1 : 0;
      if (h != st.half) st.half = h;
      st.p0 = snap();
      const M = st.M;
      M.vmin = sc.min;
      st.stall = sc.k == 'build' && !sc.bn ? (st.stall || 0) + 1 : 0;
      ui();
    }
    nextSeg();
  }
  // Passe au segment suivant d'une scène (passe, course, tir…).
  function nextSeg() {
    const p = st.plan;
    st.si++;
    st.t = 0;
    if (st.si >= p.segs.length) return endScene();
    const g = p.segs[st.si];
    st.seg = g;
    g.b0 = { ...st.ball };
    g.ready = 0;
    enterSeg(g);
  }
  // Vue 3D par défaut ; la vue 2D n'apparaît que quand le match s'enlise (3 phases de construction de suite sans occasion).
  const view3d = () => FULL && ST.an3d !== 0 && (st.rp || (st.stall || 0) < 3);
  // Début d'un segment : initialise le mouvement.
  function enterSeg(g) {
    const sc = st.cur,
      A = st.plan.A;
    if (g.k == 'rec') {
      st.own = A;
      st.hold = null;
    }
    if (g.k == 'wind') {
      if ((sc.pen || sc.fk) && !st.rp)
        st.ban = { txt: sc.pen ? 'PENALTY' : 'COUP FRANC', sub: pname(A, g.a), t: 1.4, c: '#ffd23f' };
      if (FULL && (sc.o != 'miss' || sc.fl) && ST.an3d !== 0) {
        st.v3 = 1;
        if (st.vk < 0.5) st.flash = 0.35;
      }
      if (g.fl) {
        st.aura = { t: A, k: g.a, s: 0, fk: g.fk };
        if ((g.fk == 'smog' || g.fk == 'ionic') && g.spot) {
          // Téléportation : le tireur quitte sa place et réapparaît à son point de tir.
          const q0 = st.pos[A][g.a],
            bk = clamp(g.spot[0] - dirOf(A) * 0.3, 0.06, 0.94),
            by = clamp(g.spot[1] + (g.spot[1] < 0.5 ? 0.22 : -0.22), 0.1, 0.9);
          // Le tireur part d'un point éloigné (en arrière et sur le côté) puis réapparaît d'un coup à son point de tir.
          q0[0] = bk;
          q0[1] = by;
          st.aura.from = [bk, by];
          st.aura.to = g.spot;
        }
        if (!st.rp && ST.ancut >= 1) {
          showCut('fluid', sc);
        }
      }
      amb.event('shot');
    }
    if (g.k == 'shot') {
      amb.event('shot2');
      if (!st.rp) tone2(260, 0.12);
    }
    if (g.k == 'res') {
      const o = g.o;
      st.aura = null;
      if (g.gf && !st.rp) st.ban = { txt: 'FLUIDE !', sub: g.gn + ' (' + tm(st.plan.D).name + ')', t: 1.8, c: st.kit.gk[st.plan.D] };
      if (!st.rp) reveal(sc, true);
      if (o == 'goal') {
        st.cheer = 3;
        amb.event('goal');
        if (!st.rp) {
          sfx('goal');
          setTimeout(() => {
            if (st.cur === sc && !st.rp && ST.ancut >= 1) showCut('goal', sc);
          }, 650);
        }
      } else if (o == 'save') {
        amb.event('save');
        st.cheer = 0.8;
        if (!st.rp && ST.ancut >= 2)
          setTimeout(() => {
            if (st.cur === sc) showCut('save', sc);
          }, 500);
      } else amb.event('miss');
    }
    if (g.k == 'steal') {
      if (sc.bn && !st.rp) st.ban = { txt: sc.bn, sub: sc.sub, t: 1.8, c: sc.bc };
      if (sc.card == 'x' && !st.rp) st.gone.add(sc.tm + '_' + sc.kk);
      if (g.fn && !st.rp)
        st.ban = {
          txt: 'FLUIDE !',
          sub: g.fn + ' (' + tm(st.plan.D).name + ')',
          t: 1.6,
          c: st.kit.c[st.plan.D],
        };
    }
  }
  // Petit son pendant une scène.
  function tone2(f, d) {
    try {
      if (ST.snd && ST.sm && AX.c) tone(f, 0, d, 'triangle', 0.3);
    } catch (e) {}
  }
  // Affiche le score et le journal au bon moment de la scène.
  function reveal(sc, full) {
    const M = st.M;
    M.vsc = sc.sc;
    M.vn = sc.n1;
    M.vst = sc.st;
    M.vmin = sc.min;
    ui();
  }
  // Fin d'une scène : mise à jour du score, célébration éventuelle.
  function endScene() {
    const sc = st.cur,
      M = st.M;
    if (st.rp) {
      st.rpl = 0;
      st.rp = false;
      if (st.live) restore(st.live);
      st.live = null;
      st.cur = null;
      st.v3 = 0;
      st.aura = null;
      hud();
      return;
    }
    if (!sc.shot && sc.k != 'shot') reveal(sc);
    if (sc.k == 'shot') st.last = { sc, plan: st.plan, p0: st.p0 };
    if (sc.k == 'shot') hud();
    st.cur = null;
    st.v3 = 0;
    st.aura = null;
    st.dive = 0;
    if ((sc.last == 1 && !M.done) || (sc.last == 1 && M.min == 45)) {
      st.half = 1;
      st.ko = 1;
      st.hold = null;
      st.own = 1;
      st.ban = { txt: 'MI-TEMPS', sub: 'Les équipes changent de côté', t: 99, c: '#ffd23f' };
      sfx('whistle');
    }
    if (sc.last == 2) {
      st.ban = { txt: 'FIN DU MATCH', sub: sc.sc.join(' - '), t: 99, c: '#ffd23f' };
      sfx('whistle');
    }
    if (!st.Q.length && !st.rpq) drain();
  }
  /* ---------- boucle ---------- */
  function running() {
    return st.M && (V.iv || st.fin || st.rpl) && !st.cutEnd;
  }
  // Boucle d'affichage : appelée environ 60 fois par seconde pour dessiner le match.
  function frame(now) {
    st.raf = 0;
    if (!conn() || !on()) {
      return;
    }
    const dt0 = Math.min(0.1, (now - st.lastT) / 1000);
    if (lite() && dt0 < 1 / 30 - 0.002) {
      st.raf = requestAnimationFrame(frame);
      return;
    }
    st.lastT = now;
    const dt = dt0;
    st.tm += dt;
    try {
      update(dt);
      draw();
    } catch (e) {
      console.error('MAN', e);
    }
    st.raf = requestAnimationFrame(frame);
  }
  // Fait avancer la simulation d'un petit pas de temps.
  function update(dt) {
    const M = st.M;
    // Fin de match : on laisse « FIN DU MATCH » à l'écran quelques secondes avant le résultat.
    if (M && M.done && st.sawSc && !st.cur && !st.Q.length && !st.cutEnd && !st.rpl) {
      if (st.hold == null) st.hold = 3.5;
      else if (st.hold > 0) {
        st.hold -= dt;
        if (st.hold <= 0) {
          st.hold = 0;
          render();
        }
      }
    }
    if (V.iv) st.fin = 0;
    if (!st.cur && st.rpq && !st.Q.length && st.last && !st.cutEnd) {
      st.rpq = 0;
      st.live = snap();
      restore(st.last.p0);
      st.rpl = 1;
      startScene(st.last.sc, true);
    }
    const run = running();
    if (run) {
      if (!st.cur && st.Q.length) startScene(st.Q.shift());
      if (st.cur) {
        st.t += dt * (st.rp ? 0.7 : 1);
        const g = st.seg;
        if (g) {
          seg(g, Math.min(1, st.t / g.d), dt);
          if (st.t >= g.d) nextSeg();
        }
      }
    }
    if (st.cheer > 0) st.cheer -= dt;
    if (st.flash > 0) st.flash -= dt;
    if (st.ban && st.ban.t < 90) st.ban.t -= dt;
    if (st.ban && st.ban.t <= 0) st.ban = null;
    if (st.ban && st.ban.t > 90 && st.cur) st.ban = null;
    if (st.M && st.M.rd) st.gone.forEach((kk) => { if ((st.M.rd[kk] || 0) <= st.M.min) st.gone.delete(kk); });
    moveAll(dt, run);
    if (st.aura) {
      // L'animation du Fluide attend la fin de l'écran de présentation du joueur.
      if (!st.cutEnd) st.aura.s += dt;
      const a = st.aura;
      if (a.from && !a.done && a.fk == 'ionic') {
        // Vague Ionique : le tireur file à une vitesse phénoménale et laisse une traînée d'éclairs.
        if (a.s >= 0.25) {
          const u = Math.min(1, (a.s - 0.25) / 0.3),
            e = u * u * (3 - 2 * u),
            q = st.pos[a.t][a.k];
          q[0] = a.from[0] + (a.to[0] - a.from[0]) * e;
          q[1] = a.from[1] + (a.to[1] - a.from[1]) * e;
          (a.tr = a.tr || []).push([q[0], q[1], a.s]);
          if (u >= 1) a.done = 1;
        }
      } else if (a.from && !a.done && a.s >= 0.3) {
        a.done = 1;
        const q = st.pos[a.t][a.k];
        q[0] = a.to[0];
        q[1] = a.to[1];
      }
    }
    st.fx = st.fx.filter((f) => (f.t -= dt) > 0);
    const sh = st.v3 || view3d() ? 1 : 0;
    st.vk += (sh - st.vk) * (1 - Math.exp(-dt * 5));
  }
  /* ---------- ballon selon le segment ---------- */
  // Convertit une position du terrain en mètres pour la vue 3D (105 × 68).
  const P3 = (x, y) => [(x - 0.5) * 105, (y - 0.5) * 68];
  function holderPos(h) {
    return h ? st.pos[h.t][h.k] : [0.5, 0.5];
  }
  // Mouvement du ballon pendant un segment de scène.
  function seg(g, u, dt) {
    const A = st.plan.A,
      D = st.plan.D,
      b = st.ball;
    if (g.k == 'rec') {
      const to = st.pos[A][g.a],
        e = eio(u);
      b.x = lerp(g.b0.x, to[0], e);
      b.y = lerp(g.b0.y, to[1], e);
      b.z = Math.sin(Math.PI * u) * 0.5;
      st.own = A;
      if (u >= 1) st.hold = { t: A, k: g.a };
    } else if (g.k == 'pass') {
      const to = st.pos[A][g.b],
        from = st.pos[A][g.a],
        e = eio(u),
        sx = g.b0.x,
        sy = g.b0.y;
      b.x = lerp(sx, to[0] + dirOf(A) * 0.01, e);
      b.y = lerp(sy, to[1], e);
      b.z = Math.sin(Math.PI * u) * g.h;
      st.own = A;
      st.hold = u < 0.15 ? { t: A, k: g.a } : u > 0.9 ? { t: A, k: g.b } : null;
      if (u >= 1) {
        st.hold = { t: A, k: g.b };
        b.z = 0;
      }
    } else if (g.k == 'wind') {
      const q = st.pos[A][g.a];
      b.x = q[0] + dirOf(A) * 0.012;
      b.y = q[1];
      b.z = 0;
      st.own = A;
      st.hold = { t: A, k: g.a };
    } else if (g.k == 'shot') {
      const q = g.spot,
        e = u,
        tx = g.t[0],
        ty = g.t[1],
        tz = g.t[2],
        ox = g.o == 'goal' ? dirOf(A) * 0.012 : 0;
      const sx = g.b0.x,
        sy = g.b0.y;
      b.x = lerp(sx, tx + ox, e);
      b.y = lerp(sy, ty, e);
      b.z = lerp(0.3, tz, e) + Math.sin(Math.PI * e) * (g.o == 'miss' && g.t[2] > 2.8 ? 2.5 : 0.7);
      st.hold = null;
      st.own = A;
      st.dive = g.o == 'miss' ? 0.3 : 1;
    } else if (g.k == 'res') {
      const tx = g.t[0],
        ty = g.t[1];
      if (g.o == 'goal') {
        const e = 1 - Math.pow(1 - u, 2);
        b.x = tx + dirOf(A) * (0.012 + 0.01 * e);
        b.y = ty;
        b.z = Math.max(0, lerp(g.t[2], 0, Math.min(1, u * 2)));
      } else if (g.o == 'save') {
        const q = st.pos[D][0];
        b.x = q[0];
        b.y = q[1];
        b.z = 0.9;
        st.hold = { t: D, k: 0 };
        st.own = D;
      } else {
        b.x = tx + dirOf(A) * 0.05 * u;
        b.y = ty + (ty - 0.5) * u * 0.9;
        b.z = Math.max(0, g.t[2] * (1 - u));
      }
      if (g.o == 'goal' && u > 0.3) st.dive = 1;
    } else if (g.k == 'steal') {
      const to = st.pos[D][g.by],
        e = eio(u);
      b.x = lerp(g.b0.x, to[0], e);
      b.y = lerp(g.b0.y, to[1], e);
      b.z = Math.sin(Math.PI * u) * 0.6;
      if (u >= 1) {
        st.own = D;
        st.hold = { t: D, k: g.by };
      }
    } else if (g.k == 'hold') {
      const h = st.hold;
      if (h) {
        const q = st.pos[h.t][h.k];
        b.x = q[0];
        b.y = q[1];
        b.z = 0;
      }
    }
    if ((!lite() && !st.rp) || !lite()) {
      st.trail.push([b.x, b.y, st.own]);
      if (st.trail.length > 16) st.trail.shift();
    }
  }
  /* ---------- déplacement des joueurs ---------- */
  // Position cible d'un joueur selon la situation (attaque, défense).
  function target(t, k) {
    const M = st.M,
      T = tm(t),
      q = pos(T, k, 0),
      d = dirOf(t),
      atk = st.own == t,
      b = st.ball,
      cur = st.cur,
      g = cur && st.seg,
      A = cur ? st.plan.A : -1;
    if (st.ko || (!cur && !st.hold && !st.Q.length)) return koPos(t, k);
    const ballU = d > 0 ? b.x : 1 - b.x;
    let u,
      y = q[1];
    if (k == 0) {
      u = 0.035 + (ballU > 0.75 ? 0.05 : 0);
      y = 0.5 + (b.y - 0.5) * 0.16;
    } else {
      // Défenseurs : ligne plus basse (ils montent peu), réglable avec la consigne « Ligne défensive ».
      const isD = slots(T.form)[k] == 'DEF';
      u = q[0] * (atk ? (isD ? 1.02 : 1.18) : 0.88) + (atk ? (isD ? 0.01 : 0.06) : -0.02) + (ballU - 0.5) * (isD ? 0.15 : 0.26);
      if (isD) u = Math.min(u + ((typeof tiV == 'function' ? tiV(T, 'dl') : 1) - 1) * 0.035, atk ? 0.4 : 0.34);
      y = 0.5 + (q[1] - 0.5) * (atk ? 1.05 : 0.92) + (b.y - 0.5) * 0.2;
    }
    u = clamp(u, 0.03, 0.95);
    let x = d > 0 ? u : 1 - u;
    if (cur && g) {
      const sl = slots(T.form);
      if (t == A && g.k == 'pass' && k == g.b) {
        x += d * 0.05;
      }
      if (t == A && (g.k == 'wind' || g.k == 'shot' || g.k == 'res') && k == g.a) {
        return g.spot;
      }
      if (t == A && g.k == 'rec' && k == g.a) {
        return [b.x, b.y];
      }
      if (t == A && g.k == 'pass' && k == g.a) {
        return [x + d * 0.025, y];
      }
      if (t != A && (g.k == 'shot' || g.k == 'res' || g.k == 'wind') && k == 0) {
        const gx = goalOf(A);
        const yy = g.t ? clamp(g.t[1], 0.42, 0.58) : 0.5;
        return [gx == 1 ? 0.985 : 0.015, g.k == 'wind' ? 0.5 : yy];
      }
      if (g.k == 'steal' && t != A && k == g.by) {
        return [b.x, b.y];
      }
    }
    return [x, y];
  }
  // Déplace tous les joueurs vers leur position cible.
  function moveAll(dt, run) {
    const M = st.M,
      b = st.ball;
    if (!M) return;
    const press = [null, null];
    for (let t = 0; t < 2; t++) {
      if (st.own == t || st.ko) continue;
      let best = [],
        lst = [];
      for (let k = 1; k < 7; k++) {
        const p = st.pos[t][k];
        lst.push([k, (p[0] - b.x) ** 2 + (p[1] - b.y) ** 2]);
      }
      lst.sort((a, c) => a[1] - c[1]);
      press[t] = lst.slice(0, 2).map((z) => z[0]);
    }
    for (let t = 0; t < 2; t++)
      for (let k = 0; k < 7; k++) {
        if (st.aura && st.aura.from && !st.aura.done && st.aura.t == t && st.aura.k == k) continue;
        let tg = target(t, k);
        if (
          press[t] &&
          press[t].includes(k) &&
          st.cur &&
          !(st.seg && (st.seg.k == 'shot' || st.seg.k == 'res' || st.seg.k == 'wind'))
        ) {
          tg = [lerp(tg[0], b.x, 0.7), lerp(tg[1], b.y, 0.7)];
        }
        const p = st.pos[t][k];
        let dx = tg[0] - p[0],
          dy = tg[1] - p[1];
        const gk = k == 0,
          div = st.dive && gk && st.cur && t == st.plan.D,
          gl = st.aura && st.aura.fk == 'bubble' && st.aura.t == t && st.aura.k == k,
          rate = div || gl ? 9 : st.cur ? 3.4 : 2.6,
          mx = (div ? 0.55 : gl ? 0.45 : 0.16) * dt,
          ds = Math.hypot(dx, dy * 0.65),
          mv = Math.min(1, ds ? mx / ds : 0) * 1;
        const f = Math.min(1 - Math.exp(-dt * rate), Math.min(1, ds ? (mx * (div ? 1 : 1.2)) / ds : 1));
        p[0] += dx * f;
        p[1] += dy * f;
        const sp = (Math.hypot(dx, dy) * f) / (dt || 1);
        let want = sp > 0.02 ? Math.atan2(dx, dy * 0.65) : null;
        if (
          want == null ||
          (st.cur && st.seg && (st.seg.k == 'wind' || st.seg.k == 'shot') && t == st.plan.A && k == st.seg.a)
        )
          want = null;
        const pl = P3(p[0], p[1]);
        if (want == null) {
          const bb = P3(b.x, b.y);
          let dd = dirOf(t);
          if (
            st.cur &&
            st.seg &&
            (st.seg.k == 'wind' || st.seg.k == 'shot') &&
            t == st.plan.A &&
            k == st.seg.a
          ) {
            const gxw = goalOf(t) ? 52.5 : -52.5;
            want = Math.atan2(gxw - pl[0], 0 - pl[1]);
          } else want = Math.atan2(bb[0] - pl[0], bb[1] - pl[1]);
        }
        want = Math.atan2(Math.sin(want), Math.cos(want));
        const a0 = st.ang[t][k] || 0;
        let da = Math.atan2(Math.sin(want - a0), Math.cos(want - a0));
        st.ang[t][k] = a0 + da * Math.min(1, dt * 7);
      }
  }
  /* ---------- rendu 2D ---------- */
  // Convertit une position du terrain (0 à 1) en pixels.
  const PX = (x, y) => [GEO.mx + x * (W - 2 * GEO.mx), GEO.my + y * (H - 2 * GEO.my)];
  // Dessine le décor fixe (terrain, tribunes, supporters) une seule fois, puis le garde en mémoire.
  function bgLayer() {
    const key = planetOf(st.M) + '|' + st.kit.c.join() + '|' + lite() + '|' + st.half;
    if (st.bg && st.bgk == key) return st.bg;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const c = cv.getContext('2d'),
      th = st.th,
      r = mul(hash(planetOf(st.M)));
    const { mx, my } = GEO,
      pw = W - 2 * mx,
      ph = H - 2 * my;
    c.fillStyle = th.sky;
    c.fillRect(0, 0, W, H);
    const cr = [st.kit.c[0], st.kit.c[1], '#ffffff', st.kit.c2[0], shade(th.sky, 2.4)];
    const stand = (y0, h, flip) => {
      const g = c.createLinearGradient(0, y0, 0, y0 + h);
      g.addColorStop(0, shade(th.sky, flip ? 1.5 : 0.8));
      g.addColorStop(1, shade(th.sky, flip ? 0.8 : 1.5));
      c.fillStyle = g;
      c.fillRect(0, y0, W, h);
      const step = lite() ? 11 : 8;
      for (let j = 0; j * step < h - 4; j++)
        for (let i = 0; i * step < W - 8; i++) {
          c.fillStyle = cr[(r() * cr.length) | 0];
          c.globalAlpha = 0.3 + 0.5 * r();
          c.beginPath();
          c.arc(6 + i * step, y0 + 5 + j * step, 2.4, 0, 7);
          c.fill();
        }
      c.globalAlpha = 1;
    };
    stand(0, my - 6, 0);
    stand(H - my + 6, my - 6, 1);
    /* panneaux publicitaires */
    c.fillStyle = '#0a0c22';
    c.fillRect(mx, my - 8, pw, 7);
    c.fillRect(mx, H - my + 1, pw, 7);
    c.font = `700 7px ${FNT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let i = 0; i < 10; i++) {
      c.fillStyle = i % 2 ? st.kit.c[0] : st.kit.c[1];
      c.fillRect(mx + (i * pw) / 10 + 2, my - 7, pw / 10 - 4, 5);
      c.fillRect(mx + (i * pw) / 10 + 2, H - my + 2, pw / 10 - 4, 5);
    }
    const ns = 14;
    for (let i = 0; i < ns; i++) {
      c.fillStyle = th.g[i % 2];
      c.fillRect(mx + (i * pw) / ns, my, pw / ns + 1, ph);
    }
    c.strokeStyle = th.l;
    c.lineWidth = 3;
    c.globalAlpha = 0.85;
    const rr = (x0, y0, x1, y1) => {
      const a = PX(x0, y0),
        b = PX(x1, y1);
      c.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    };
    rr(0, 0, 1, 1);
    const t1 = PX(0.5, 0),
      t2 = PX(0.5, 1);
    c.beginPath();
    c.moveTo(t1[0], t1[1]);
    c.lineTo(t2[0], t2[1]);
    c.stroke();
    const cc = PX(0.5, 0.5);
    c.beginPath();
    c.ellipse(cc[0], cc[1], ph * 0.15 * (pw / ph > 1 ? 1 : 1), ph * 0.16, 0, 0, 7);
    c.stroke();
    for (const sd of [0, 1]) {
      const x0 = sd,
        sg = sd ? -1 : 1;
      rr(x0, 0.5 - 0.2965, x0 + sg * 0.157, 0.5 + 0.2965);
      rr(x0, 0.5 - 0.1345, x0 + sg * 0.052, 0.5 + 0.1345);
      const pn = PX(x0 + sg * 0.105, 0.5);
      c.beginPath();
      c.arc(pn[0], pn[1], 3, 0, 7);
      c.fillStyle = th.l;
      c.fill();
    }
    c.globalAlpha = 1;
    for (const sd of [0, 1]) {
      const a = PX(sd ? 1 : 0, 0.5 - 0.054),
        b = PX(sd ? 1 : 0, 0.5 + 0.054),
        dx = sd ? 18 : -18;
      c.fillStyle = '#ffffff40';
      c.fillRect(Math.min(a[0], a[0] + dx), a[1], 18, b[1] - a[1]);
      c.strokeStyle = '#fff';
      c.lineWidth = 3;
      c.strokeRect(Math.min(a[0], a[0] + dx), a[1], 18, b[1] - a[1]);
    }
    st.bg = cv;
    st.bgk = key;
    return cv;
  }
  // Effets d'ambiance du terrain 2D (neige, pluie, éclairs…).
  function drawFx2D(c) {
    const th = st.th,
      f = th.fx;
    if (!f || lite()) return;
    if (!st.pts.length) {
      const r = Math.random;
      for (let i = 0; i < 36; i++)
        st.pts.push({ x: r() * W, y: r() * H, v: 0.3 + r(), s: 1 + r() * 2.5, p: r() * 6 });
    }
    c.save();
    for (const p of st.pts) {
      if (f == 'snow') {
        p.y += p.v * 0.8;
        p.x += Math.sin(st.tm + p.p) * 0.4;
        c.fillStyle = '#ffffffcc';
        c.beginPath();
        c.arc(p.x, p.y, p.s, 0, 7);
        c.fill();
      } else if (f == 'star') {
        c.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * Math.abs(Math.sin(st.tm * 1.4 + p.p))})`;
        c.fillRect(p.x, (p.y % (GEO.my - 10)) + 2, p.s, p.s);
      } else if (f == 'leaf') {
        p.y += p.v * 0.6;
        p.x += Math.sin(st.tm * 1.3 + p.p) * 0.9;
        c.fillStyle = '#8fe27a';
        c.save();
        c.translate(p.x, p.y);
        c.rotate(st.tm + p.p);
        c.fillRect(-3, -1.5, 6, 3);
        c.restore();
      } else if (f == 'ash') {
        p.y -= p.v * 0.5;
        p.x += Math.sin(st.tm + p.p) * 0.3;
        c.fillStyle = '#e6c9a0aa';
        c.fillRect(p.x, p.y, p.s, p.s);
      } else if (f == 'spore' || f == 'swirl') {
        p.y -= p.v * 0.35;
        p.x += Math.cos(st.tm * 0.8 + p.p) * 0.5;
        c.fillStyle = f == 'spore' ? '#c8fff2aa' : '#d7b8ffaa';
        c.beginPath();
        c.arc(p.x, p.y, p.s * 0.8, 0, 7);
        c.fill();
      } else if (f == 'wave') {
        c.strokeStyle = '#ffffff55';
        c.beginPath();
        c.arc(p.x, H - 6, 6 + ((st.tm * 14 + p.p * 9) % 24), Math.PI, 0);
        c.stroke();
      }
      if (p.y > H + 4) p.y = -4;
      if (p.y < -6) p.y = H;
      if (p.x > W + 4) p.x = -4;
      if (p.x < -4) p.x = W + 4;
    }
    if (f == 'bolt') {
      const ph = (st.tm * 0.5) % 3;
      if (ph < 0.14) {
        c.strokeStyle = '#fff6a8';
        c.lineWidth = 3;
        c.beginPath();
        let x = W * (0.15 + 0.7 * (((Math.floor(st.tm / 3) * 37) % 10) / 10)),
          y = 0;
        c.moveTo(x, y);
        while (y < GEO.my - 10) {
          x += (Math.random() - 0.5) * 30;
          y += 14;
          c.lineTo(x, y);
        }
        c.stroke();
        c.fillStyle = '#ffe14a18';
        c.fillRect(0, 0, W, H);
      }
    }
    if (f == 'grid') {
      c.strokeStyle = '#cfe7ff14';
      for (let y = 0; y < H; y += 24) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(W, y);
        c.stroke();
      }
    }
    c.restore();
  }
  // Les supporters s'agitent après un but.
  function crowdCheer(c) {
    if (st.cheer <= 0 || lite()) return;
    const r = mul(5),
      a = Math.min(1, st.cheer);
    for (let i = 0; i < 70; i++) {
      const x = GEO.mx + r() * (W - 2 * GEO.mx),
        top = r() < 0.5,
        y0 = top ? GEO.my - 26 : H - GEO.my + 14,
        j = Math.abs(Math.sin(st.tm * (5 + r() * 5) + i)) * 10;
      c.fillStyle = r() < 0.5 ? st.kit.c[(st.plan && st.plan.A) || 0] : '#fff';
      c.globalAlpha = 0.8 * a;
      c.beginPath();
      c.arc(x, y0 - j * (top ? 1 : -1) * 0.8 + (top ? 0 : 0), 3, 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  // Couleur du ballon : celle de l'équipe qui a la possession.
  function ballCol() {
    return st.kit.c[st.own] || '#fff';
  }
  // Téléportation : le tireur est invisible pendant le début de l'effet.
  const tpHidden = (t, k) => !!(st.aura && st.aura.from && st.aura.fk != 'ionic' && st.aura.s >= 0.22 && st.aura.s < 0.38 && st.aura.t == t && st.aura.k == k);
  // Saut du tireur (Vague d'Hektonïa), en hauteur : 0 au sol, environ 1,4 au sommet.
  const jumpY = (t, k) =>
    st.aura && st.aura.fk == 'bubble' && st.aura.t == t && st.aura.k == k ? 1.4 * Math.sin(Math.PI * Math.min(1, st.aura.s / 1.1)) : 0;
  // Dessine l'aura de Fluide autour d'un joueur.
  function drawAura2D(c, p, col, r) {
    const a = st.aura;
    if (!a) return;
    col = FXV[a.fk] || col;
    const s = a.s,
      pulse = 1 + 0.15 * Math.sin(s * 9);
    c.save();
    c.globalCompositeOperation = a.fk == 'smog' ? 'source-over' : 'lighter';
    if (a.fk == 'ionic' && a.from && !a.done && a.s >= 0.25) (a.sp = a.sp || []).push([p[0], p[1], a.s]);
    if (a.fk == 'ionic' && a.sp && a.sp.length > 1)
      [r * 0.9, r * 0.3, -r * 0.4].forEach((oy, hi) => {
        for (let w = 0; w < 2; w++) {
          c.strokeStyle = w ? '#ffffff' : '#dfe9ff';
          c.lineWidth = w ? 2 : 5;
          c.globalAlpha = w ? 0.95 : 0.5;
          c.beginPath();
          a.sp.forEach((q, i) => {
            if (s - q[2] > 0.6) return;
            const x = q[0] + (Math.random() - 0.5) * r * 0.3,
              y = q[1] + oy + (Math.random() - 0.5) * r * 0.4;
            if (i) c.lineTo(x, y);
            else c.moveTo(x, y);
          });
          c.stroke();
        }
        c.globalAlpha = 1;
      });
    // Éclat de téléportation : à l'endroit quitté, puis à l'arrivée.
    if (a.from)
      [
        [PX(a.from[0], a.from[1]), s / 0.6],
        [p, (s - 0.3) / 0.6],
      ].forEach(([pp, u]) => {
        if (u < 0 || u > 1) return;
        const al = 1 - u,
          rd = r * (1.5 + 3.5 * u);
        const g0 = c.createRadialGradient(pp[0], pp[1], rd * 0.1, pp[0], pp[1], rd);
        g0.addColorStop(0, rgba(col, 0.9 * al));
        g0.addColorStop(1, rgba(col, 0));
        c.fillStyle = g0;
        c.beginPath();
        c.arc(pp[0], pp[1], rd, 0, 7);
        c.fill();
      });
    // Bulles qui montent autour du tireur (Vague d'Hektonïa).
    if (a.fk == 'bubble') {
      c.strokeStyle = rgba(col, 0.9);
      c.lineWidth = 2;
      for (let n = 0; n < 9; n++) {
        const u = (s * 0.8 + n / 9) % 1,
          an = n * 2.4 + s,
          rr = r * (0.8 + 0.9 * ((n * 7) % 5) / 5);
        c.globalAlpha = 1 - u;
        c.beginPath();
        c.arc(p[0] + Math.cos(an) * rr, p[1] + r * 0.6 - u * r * 3.4, r * (0.18 + 0.12 * (n % 3)), 0, 7);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    const g = c.createRadialGradient(p[0], p[1], r * 0.4, p[0], p[1], r * 4.2 * pulse);
    g.addColorStop(0, rgba(col, a.fk == 'ionic' ? 0.3 : 0.55));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.beginPath();
    c.arc(p[0], p[1], r * 4.2 * pulse, 0, 7);
    c.fill();
    c.strokeStyle = rgba(col, 0.9);
    c.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      c.beginPath();
      c.arc(p[0], p[1], r * (1.9 + i * 0.8) * pulse, s * 3 + i * 2, s * 3 + i * 2 + Math.PI * 1.2);
      c.stroke();
    }
    for (let n = 0; n < 3; n++) {
      const u = (s * 1.3 + n / 3) % 1;
      c.globalAlpha = 1 - u;
      c.beginPath();
      c.arc(p[0], p[1], r * (1.2 + u * 4), 0, 7);
      c.stroke();
    }
    if (!lite())
      for (let i = 0; i < 8; i++) {
        const an = s * 4 + i * 0.8,
          rr = r * (2 + ((s * 2 + i * 0.37) % 1) * 2);
        c.globalAlpha = 0.9;
        c.fillStyle = '#fff';
        c.fillRect(p[0] + Math.cos(an) * rr, p[1] + Math.sin(an) * rr * 0.8, 2.5, 2.5);
      }
    c.restore();
  }
  // DESSINE LES JOUEURS en 2D : rond de la couleur de l'équipe, contour, numéro, nom du porteur.
  function drawPlayers2D(c) {
    const r = Math.max(9, (H - 2 * GEO.my) * 0.036);
    const list = [];
    for (let t = 0; t < 2; t++) for (let k = 0; k < 7; k++) list.push([t, k, st.pos[t][k]]);
    list.sort((a, b) => a[2][1] - b[2][1]);
    for (const [t, k, q] of list) {
      if (st.gone.has(t + '_' + k) || tpHidden(t, k)) continue;
      const p = PX(q[0], q[1]),
        col = k == 0 ? st.kit.gk[t] : st.kit.c[t],
        hold = st.hold && st.hold.t == t && st.hold.k == k;
      c.fillStyle = '#00000040';
      c.beginPath();
      c.ellipse(p[0], p[1] + r * 0.75, r * 0.95, r * 0.4, 0, 0, 7);
      c.fill();
      p[1] -= jumpY(t, k) * r;
      if (hold) {
        c.fillStyle = rgba(col, 0.35);
        c.beginPath();
        c.arc(p[0], p[1], r * 1.85, 0, 7);
        c.fill();
      }
      c.fillStyle = col;
      c.beginPath();
      c.arc(p[0], p[1], r, 0, 7);
      c.fill();
      c.lineWidth = 5.5;
      c.strokeStyle = '#0a0c2270';
      c.stroke();
      c.lineWidth = 3;
      c.strokeStyle = lum(col) < 110 ? '#ffffff' : '#0a0c22';
      c.stroke();
      const rc = k == 0 ? st.kit.gk2[t] : st.kit.c2[t];
      if (dist(rc, col) > 80) {
        c.strokeStyle = rc;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(p[0], p[1], r * 0.62, 0.3, Math.PI - 0.3);
        c.stroke();
      }
      c.fillStyle = lum(col) > 150 ? '#0a0c22' : '#fff';
      const nn = String(numOf(t, k));
      c.font = `700 ${r * (nn.length > 1 ? 0.78 : 0.95)}px ${FNT}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(nn, p[0], p[1] + 1);
      if (st.aura && st.aura.t == t && st.aura.k == k) drawAura2D(c, p, st.kit.c[t], r);
    }
    /* nom du porteur / tireur */
    const sh =
      st.cur && st.seg && ['wind', 'shot'].includes(st.seg.k) ? { t: st.plan.A, k: st.seg.a } : st.hold;
    if (sh && st.cur) {
      const q = st.pos[sh.t][sh.k],
        p = PX(q[0], q[1]);
      c.font = `700 13px ${FNT}`;
      c.textAlign = 'center';
      const nm = pname(sh.t, sh.k).toUpperCase(),
        w = c.measureText(nm).width + 14;
      c.fillStyle = '#0a0c22cc';
      c.fillRect(p[0] - w / 2, p[1] - r - 26, w, 19);
      c.fillStyle = '#fff';
      c.fillText(nm, p[0], p[1] - r - 16);
    }
    return r;
  }
  // Dessine le ballon et sa traînée.
  function drawBall2D(c, r) {
    const b = st.ball,
      p = PX(b.x, b.y),
      z = b.z * 7,
      col = ballCol();
    if (!lite() && st.trail.length > 1) {
      c.lineCap = 'round';
      for (let i = 1; i < st.trail.length; i++) {
        const a = PX(st.trail[i - 1][0], st.trail[i - 1][1]),
          d = PX(st.trail[i][0], st.trail[i][1]);
        c.strokeStyle = st.kit.c[st.trail[i][2]] || '#fff';
        c.globalAlpha = (i / st.trail.length) * 0.45;
        c.lineWidth = r * 0.45;
        c.beginPath();
        c.moveTo(a[0], a[1]);
        c.lineTo(d[0], d[1]);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    c.fillStyle = '#00000066';
    c.beginPath();
    c.ellipse(p[0], p[1] + r * 0.35, r * 0.5, r * 0.25, 0, 0, 7);
    c.fill();
    c.fillStyle = rgba(col, 0.4);
    c.beginPath();
    c.arc(p[0], p[1] - z, r * 1.1, 0, 7);
    c.fill();
    const bs = ballSel();
    if (bs) {
      const im = ballImg(bs);
      if (im.complete && im.naturalWidth) {
        c.drawImage(im, p[0] - r * 0.62, p[1] - z - r * 0.62, r * 1.24, r * 1.24);
        return;
      }
    }
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#0b1020';
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(p[0], p[1] - z, r * 0.55, 0, 7);
    c.fill();
    c.stroke();
  }
  // Bandeau d'annonce (BUT !, COUP D'ENVOI…).
  function banner(c) {
    const b = st.ban;
    if (!b) return;
    const a = b.t > 90 ? 1 : Math.min(1, b.t * 3);
    c.save();
    c.globalAlpha = a;
    c.fillStyle = '#0a0c22d9';
    c.fillRect(0, H * 0.38, W, H * 0.24);
    c.fillStyle = b.c || '#ffd23f';
    c.fillRect(0, H * 0.38, W, 6);
    c.fillRect(0, H * 0.62 - 6, W, 6);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `${H * 0.1}px ${FNT}`;
    c.fillStyle = b.c || '#ffd23f';
    c.fillText(b.txt, W / 2, H * 0.47);
    c.font = `700 ${H * 0.04}px ${FNT}`;
    c.fillStyle = '#fff';
    c.fillText(b.sub || '', W / 2, H * 0.55);
    c.restore();
  }
  // Bandeaux « ÉQUIPE défend » sous le terrain, sur fond sombre pour rester lisibles.
  function sideLabels(c) {
    c.font = `800 15px ${FNT}`;
    c.textBaseline = 'middle';
    for (const side of [0, 1]) {
      const t = dirOf(0) > 0 ? (side == 0 ? 0 : 1) : side == 0 ? 1 : 0;
      const x = side ? W - GEO.mx : GEO.mx,
        tx = tm(t).name.toUpperCase() + ' défend',
        w = c.measureText(tx).width + 44,
        y = H - GEO.my + 6,
        h = 26,
        x0 = side ? x - w : x;
      c.globalAlpha = 1;
      c.fillStyle = '#070a1ce8';
      c.beginPath();
      if (c.roundRect) c.roundRect(x0, y, w, h, 8);
      else c.rect(x0, y, w, h);
      c.fill();
      c.strokeStyle = st.kit.c[t];
      c.lineWidth = 2;
      c.stroke();
      const sx = side ? x - w + 9 : x + 9;
      c.fillStyle = st.kit.c[t];
      c.fillRect(sx, y + h / 2 - 7, 14, 14);
      c.strokeStyle = '#fff';
      c.lineWidth = 1.5;
      c.strokeRect(sx, y + h / 2 - 7, 14, 14);
      c.fillStyle = '#fff';
      c.textAlign = 'left';
      c.fillText(tx, sx + 22, y + h / 2 + 1);
    }
    c.globalAlpha = 1;
  }
  // DESSINE UNE IMAGE du match (2D ou 3D selon l'option).
  function draw() {
    const c = st.c;
    if (!c || !st.M) return;
    size();
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    const vk = st.vk;
    if (vk > 0.02) {
      draw3D(c);
    } else {
      c.drawImage(bgLayer(), 0, 0);
      drawFx2D(c);
      crowdCheer(c);
      sideLabels(c);
      const r = drawPlayers2D(c);
      drawBall2D(c, r);
    }
    if (st.flash > 0) {
      c.fillStyle = '#fff';
      c.globalAlpha = clamp(st.flash * 2.5, 0, 0.8);
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
    if (st.rp) {
      c.fillStyle = '#ff3b4e';
      c.fillRect(18, 16, 138, 30);
      c.fillStyle = '#fff';
      c.font = `16px ${FNT}`;
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText('● RALENTI', 30, 31);
    }
    banner(c);
    if (!V.iv && !st.fin && st.M && !st.M.done && !st.rp) {
      c.fillStyle = '#0a0c2280';
      c.fillRect(0, 0, W, H);
      c.fillStyle = '#fff';
      c.font = `${H * 0.09}px ${FNT}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(st.M.min ? 'PAUSE' : 'COUP D’ENVOI', W / 2, H / 2);
    }
  }
  /* ---------- rendu 3D maison (aplats facettés) ---------- */
  // Petites fonctions de calcul 3D (soustraction, produit scalaire, normalisation).
  const V3 = {
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: (a) => {
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      return [a[0] / l, a[1] / l, a[2] / l];
    },
  };
  // Caméra 3D : position, visée et projection des points.
  const R3 = {
    cam: [0, 30, 55],
    look: [0, 0, 0],
    setup() {
      const f = V3.norm(V3.sub(this.look, this.cam)),
        r = V3.norm(V3.cross(f, [0, 1, 0])),
        u = V3.cross(r, f);
      this.f = f;
      this.r = r;
      this.u = u;
      this.fl = W * 0.66;
    },
    P(p) {
      const d = V3.sub(p, this.cam),
        z = V3.dot(d, this.f);
      if (z < 0.4) return null;
      const s = this.fl / z;
      return [W / 2 + V3.dot(d, this.r) * s, H / 2 - V3.dot(d, this.u) * s, z];
    },
    box(list, cx, cy, cz, sx, sy, sz, col, ang = 0) {
      const hx = sx / 2,
        hy = sy / 2,
        hz = sz / 2,
        ca = Math.cos(ang),
        sa = Math.sin(ang);
      const v = [
        [-hx, -hy, -hz],
        [hx, -hy, -hz],
        [hx, hy, -hz],
        [-hx, hy, -hz],
        [-hx, -hy, hz],
        [hx, -hy, hz],
        [hx, hy, hz],
        [-hx, hy, hz],
      ].map(([x, y, z]) => [cx + x * ca + z * sa, cy + y, cz - x * sa + z * ca]);
      const mid = [cx, cy, cz];
      [
        [0, 1, 2, 3],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [1, 5, 6, 2],
        [3, 2, 6, 7],
        [4, 5, 1, 0],
      ].forEach((q) => {
        let f = q.map((i) => v[i]);
        const n = V3.cross(V3.sub(f[1], f[0]), V3.sub(f[2], f[0])),
          c = [(f[0][0] + f[2][0]) / 2, (f[0][1] + f[2][1]) / 2, (f[0][2] + f[2][2]) / 2];
        if (V3.dot(n, V3.sub(c, mid)) < 0) f = f.reverse();
        list.push({ v: f, c: col });
      });
    },
    flush(ctx, list, lbl, light = [-0.35, 0.9, 0.4]) {
      const out = [];
      for (const f of list) {
        const a = f.v[0],
          b = f.v[1],
          c = f.v[2];
        let n = V3.norm(V3.cross(V3.sub(b, a), V3.sub(c, a)));
        const ctr = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
        if (V3.dot(n, V3.sub(this.cam, ctr)) <= 0) {
          if (!f.two) continue;
          n = n.map((x) => -x);
        }
        const pts = [];
        let ok = true,
          zs = 0;
        for (const p of f.v) {
          const q = this.P(p);
          if (!q) {
            ok = false;
            break;
          }
          pts.push(q);
          zs += q[2];
        }
        if (!ok) continue;
        out.push({
          pts,
          z: zs / pts.length,
          l: 0.52 + 0.48 * Math.max(0, V3.dot(n, V3.norm(light))),
          c: f.c,
        });
      }
      if (lbl)
        for (const l of lbl) {
          const q = this.P(l.p);
          if (q)
            out.push({
              lb: 1,
              z: q[2] - 0.2,
              q,
              txt: l.txt,
              sz: (l.sz * this.fl) / q[2],
              col: l.col,
              st: l.st,
            });
        }
      out.sort((p, q) => q.z - p.z);
      for (const o of out) {
        if (o.lb) {
          if (o.sz < 5) continue;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `${o.sz}px ${FNT}`;
          if (o.st) {
            ctx.lineWidth = o.sz * 0.16;
            ctx.strokeStyle = o.st;
            ctx.strokeText(o.txt, o.q[0], o.q[1]);
          }
          ctx.fillStyle = o.col;
          ctx.fillText(o.txt, o.q[0], o.q[1]);
          continue;
        }
        const c = rgb(o.c);
        ctx.fillStyle = `rgb(${(c[0] * o.l) | 0},${(c[1] * o.l) | 0},${(c[2] * o.l) | 0})`;
        ctx.beginPath();
        o.pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0a0c2233';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    },
  };
  // DESSINE LA VUE 3D du match (terrain, joueurs en volume, ballon).
  function draw3D(ctx) {
    const th = st.th,
      M = st.M,
      A = st.cur ? st.plan.A : st.own,
      b = st.ball,
      g = st.cur && st.seg,
      X = (x) => (x - 0.5) * 105,
      Z = (y) => (y - 0.5) * 68;
    const bx = X(b.x),
      bz = Z(b.y);
    let tc,
      tl,
      cine = false;
    if (st.cur && g && ['wind', 'shot', 'res'].includes(g.k) && st.plan.shot) {
      cine = true;
      const s = st.pos[A][g.a],
        sx = X(s[0]),
        sz = Z(s[1]),
        gx = goalOf(A) ? 52.5 : -52.5,
        dx = gx - sx,
        dz = 0 - sz,
        l = Math.hypot(dx, dz) || 1;
      tc = [sx - (dx / l) * 9 - (dz / l) * 3, 3.4, sz - (dz / l) * 9 + (dx / l) * 3];
      tl = [
        gx - (dx / l) * 3,
        1.4 + (g.k == 'shot' || g.k == 'res' ? b.z * 0.25 : 0),
        g.k == 'res' || g.k == 'shot' ? Z(b.y) * 0.6 : 0,
      ];
    } else {
      tc = [bx * 0.4, 38, 76];
      tl = [bx * 0.6, 0, -3];
    }
    if (!st.cam) {
      st.cam = [bx * 0.5, 38, 76];
      st.look = [bx * 0.75, 0, -3];
    }
    // CAMÉRA DOUCE (anti-nausée) : ressort amorti. Départ et arrêt progressifs, pas de mouvement sec,
    // et déplacements plus lents qu'avant (plan large 1,3 ; gros plan de tir 2,1).
    if (!st.camv) st.camv = [[0, 0, 0], [0, 0, 0]];
    const w = cine ? 2.1 : 1.3,
      dt = 1 / 60;
    for (let i = 0; i < 3; i++) {
      st.camv[0][i] += (w * w * (tc[i] - st.cam[i]) - 2 * w * st.camv[0][i]) * dt;
      st.camv[1][i] += (w * w * (tl[i] - st.look[i]) - 2 * w * st.camv[1][i]) * dt;
      st.cam[i] += st.camv[0][i] * dt;
      st.look[i] += st.camv[1][i] * dt;
    }
    R3.cam = st.cam;
    R3.look = st.look;
    R3.setup();
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, th.sky);
    gr.addColorStop(1, shade(th.sky, 1.9));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
    const ground = [],
      stripes = 14,
      L = 70,
      Wd = 44;
    ground.push({
      v: [
        [-L - 40, -0.05, -Wd - 60],
        [L + 40, -0.05, -Wd - 60],
        [L + 40, -0.05, Wd + 60],
        [-L - 40, -0.05, Wd + 60],
      ].reverse(),
      c: shade(th.g[1], 0.5),
      two: 1,
    });
    for (let i = 0; i < stripes; i++) {
      const x0 = -52.5 + (i * 105) / stripes,
        x1 = x0 + 105 / stripes;
      ground.push({
        v: [
          [x0, 0, -34],
          [x1, 0, -34],
          [x1, 0, 34],
          [x0, 0, 34],
        ],
        c: th.g[i % 2],
        two: 1,
      });
    }
    const line = (pts, w = 0.25) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i],
          c = pts[i + 1],
          dx = c[0] - a[0],
          dz = c[1] - a[1],
          l = Math.hypot(dx, dz) || 1,
          nx = ((-dz / l) * w) / 2,
          nz = ((dx / l) * w) / 2;
        ground.push({
          v: [
            [a[0] + nx, 0.02, a[1] + nz],
            [c[0] + nx, 0.02, c[1] + nz],
            [c[0] - nx, 0.02, c[1] - nz],
            [a[0] - nx, 0.02, a[1] - nz],
          ],
          c: th.l,
          two: 1,
        });
      }
    };
    line([
      [-52.5, -34],
      [52.5, -34],
      [52.5, 34],
      [-52.5, 34],
      [-52.5, -34],
    ]);
    line([
      [0, -34],
      [0, 34],
    ]);
    const cc = [];
    for (let i = 0; i <= 20; i++)
      cc.push([Math.cos((i / 20) * 6.2832) * 9.15, Math.sin((i / 20) * 6.2832) * 9.15]);
    line(cc);
    for (const s of [-1, 1]) {
      line([
        [s * 52.5, -20.2],
        [s * 36, -20.2],
        [s * 36, 20.2],
        [s * 52.5, 20.2],
      ]);
      line([
        [s * 52.5, -9.2],
        [s * 47, -9.2],
        [s * 47, 9.2],
        [s * 52.5, 9.2],
      ]);
    }
    const objs = [],
      lbl = [],
      r = mul(11),
      crc = [st.kit.c[0], st.kit.c[1], '#ffffff', st.kit.c2[0]];
    const nr = lite() ? 2 : 4,
      ni = lite() ? 16 : 28;
    for (let row = 0; row < nr; row++)
      for (let i = 0; i < ni; i++) {
        const x = -70 + i * (140 / ni),
          c = crc[(r() * crc.length) | 0];
        R3.box(
          objs,
          x,
          1.2 + row * 1.6,
          -46 - row * 2.6,
          (4.4 * 28) / ni,
          1.1 + row * 1.6,
          2.4,
          shade(c, 0.7),
        );
      }
    R3.box(objs, 0, 0.6, -38.5, 112, 1.2, 0.6, shade(th.sky, 1.4));
    for (const s of [-1, 1]) {
      const gx = s * 52.5;
      R3.box(objs, gx, 1.2, -3.66, 0.3, 2.4, 0.3, '#fff');
      R3.box(objs, gx, 1.2, 3.66, 0.3, 2.4, 0.3, '#fff');
      R3.box(objs, gx, 2.4, 0, 0.3, 0.3, 7.6, '#fff');
      R3.box(objs, gx + s * 1.3, 1.2, 0, 0.12, 2.4, 7.3, '#cfd6ff');
      R3.box(objs, gx + s * 0.65, 2.4, 0, 1.4, 0.1, 7.3, '#cfd6ff');
    }
    const camP = st.cam;
    for (let t = 0; t < 2; t++)
      for (let k = 0; k < 7; k++) {
        if (tpHidden(t, k)) continue;
        const q = st.pos[t][k],
          x = X(q[0]),
          z = Z(q[1]),
          ang = st.ang[t][k] || 0,
          fx = Math.sin(ang),
          fz = Math.cos(ang),
          col = k == 0 ? st.kit.gk[t] : st.kit.c[t],
          col2 = k == 0 ? st.kit.gk2[t] : st.kit.c2[t];
        const sw = Math.sin(st.tm * 10 + k + t) * 0.3,
          K = 1.4,
          dv = k == 0 && st.dive && st.cur && t == st.plan.D;
        const dy = (dv ? -0.35 : 0) + jumpY(t, k);
        ground.push({
          v: [
            [x - 0.6, 0.03, z - 0.6],
            [x + 0.6, 0.03, z - 0.6],
            [x + 0.6, 0.03, z + 0.6],
            [x - 0.6, 0.03, z + 0.6],
          ],
          c: shade(th.g[0], 0.55),
          two: 1,
        });
        R3.box(
          objs,
          x - fz * 0.3 + fx * sw,
          0.45 * K + dy,
          z + fx * 0.3 + fz * sw,
          0.36,
          0.9 * K,
          0.36,
          '#16183c',
          ang,
        );
        R3.box(
          objs,
          x + fz * 0.3 - fx * sw,
          0.45 * K + dy,
          z - fx * 0.3 - fz * sw,
          0.36,
          0.9 * K,
          0.36,
          '#16183c',
          ang,
        );
        R3.box(objs, x, 1.35 * K + dy, z, 0.95, 0.9 * K, 0.55, col, ang);
        R3.box(objs, x, 1.98 * K + dy, z, 0.52, 0.5, 0.52, '#f2c9a0', ang);
        if (k != 0) R3.box(objs, x, 1.95 * K + dy + 0.2, z, 0.56, 0.14, 0.56, col2, ang);
        const hold = st.hold && st.hold.t == t && st.hold.k == k;
        if (hold)
          ground.push({
            v: [
              [x - 1.3, 0.04, z - 1.3],
              [x + 1.3, 0.04, z - 1.3],
              [x + 1.3, 0.04, z + 1.3],
              [x - 1.3, 0.04, z + 1.3],
            ],
            c: col,
            two: 1,
          });
        /* numéro dans le dos */
        const dxc = x - camP[0],
          dzc = z - camP[2];
        if (dxc * fx + dzc * fz > 0) {
          const bk = 0.3,
            hi = 1.4 * K + dy + 0.02,
            lc = lum(col) > 150 ? '#0a0c22' : '#ffffff',
            main = cine && st.seg && t == st.plan.A && k == st.seg.a;
          lbl.push({
            p: [x - fx * bk, hi, z - fz * bk],
            txt: String(numOf(t, k)),
            sz: main ? 0.95 : 0.7,
            col: lc,
          });
          if (main || (hold && cine === false && false))
            lbl.push({
              p: [x - fx * bk, hi + 0.78, z - fz * bk],
              txt: pname(t, k).split(' ').slice(-1)[0].toUpperCase(),
              sz: 0.3,
              col: '#fff',
              st: '#0a0c22',
            });
        }
      }
    const bsl = ballSel(),
      bcl = bsl && ballCols(bsl),
      oc = bcl ? bcl[1] : ballCol(),
      by = 0.4 + Math.max(0, b.z);
    R3.box(objs, bx, by, bz, 0.62, 0.62, 0.62, bcl ? oc : '#dfe5f2', st.tm * 3);
    R3.box(objs, bx, by, bz, 0.5, 0.5, 0.5, bcl ? bcl[0] : '#ffffff', st.tm * 3 + 0.8);
    ground.push({
      v: [
        [bx - 0.5, 0.05, bz - 0.5],
        [bx + 0.5, 0.05, bz - 0.5],
        [bx + 0.5, 0.05, bz + 0.5],
        [bx - 0.5, 0.05, bz + 0.5],
      ],
      c: ballCol(),
      two: 1,
    });
    R3.flush(ctx, ground.slice(0, 1 + stripes));
    R3.flush(ctx, ground.slice(1 + stripes));
    R3.flush(ctx, objs, lbl);
    /* encadré transparent avec le nom du porteur du ballon (comme sur Football Manager) */
    try {
      let hk = st.hold ? [st.hold.t, st.hold.k] : null;
      if (!hk && !st.cur) {
        let bd = 1e9;
        for (let k = 0; k < 7; k++) {
          const q = st.pos[A][k];
          if (!q || st.gone.has(A + '_' + k) || tpHidden(A, k)) continue;
          const d = (X(q[0]) - bx) ** 2 + (Z(q[1]) - bz) ** 2;
          if (d < bd) {
            bd = d;
            hk = [A, k];
          }
        }
        if (bd > 60) hk = null;
      }
      if (hk && !(cine && st.seg && st.seg.k == 'wind')) {
        const q = st.pos[hk[0]][hk[1]],
          pp = R3.P([X(q[0]), 3.1 + jumpY(hk[0], hk[1]), Z(q[1])]);
        if (pp) {
          const parts = String(pname(hk[0], hk[1])).split(' '),
            nm = parts.length > 1 ? parts[0][0] + '. ' + parts.slice(1).join(' ') : parts[0];
          ctx.save();
          ctx.font = `600 17px ${FNT}`;
          const tw = ctx.measureText(nm).width + 18,
            bxl = Math.max(4, Math.min(W - tw - 4, pp[0] - tw / 2)),
            byl = Math.max(4, pp[1] - 24);
          ctx.fillStyle = 'rgba(10,12,34,0.5)';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bxl, byl, tw, 26, 6) : ctx.rect(bxl, byl, tw, 26);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nm, bxl + tw / 2, byl + 14);
          ctx.restore();
        }
      }
    } catch (e) {}
    /* aura de Fluide autour du tireur (tirs cadrés uniquement) */
    if (st.aura) {
      const a = st.aura,
        q = st.pos[a.t][a.k],
        x = X(q[0]),
        z = Z(q[1]),
        col = FXV[a.fk] || st.kit.c[a.t],
        s = a.s;
      ctx.save();
      ctx.globalCompositeOperation = a.fk == 'smog' ? 'source-over' : 'lighter';
      // Éclats de téléportation (départ puis arrivée) et bulles de la Vague d'Hektonïa.
      if (a.from)
        [
          [X(a.from[0]), Z(a.from[1]), s / 0.6],
          [x, z, (s - 0.3) / 0.6],
        ].forEach(([bx, bz, u]) => {
          if (u < 0 || u > 1) return;
          const al = 1 - u,
            cb = R3.P([bx, 1.2, bz]);
          if (!cb) return;
          const rd = ((2.2 + 3 * u) * R3.fl) / cb[2],
            gb = ctx.createRadialGradient(cb[0], cb[1], rd * 0.1, cb[0], cb[1], rd);
          gb.addColorStop(0, rgba(col, 0.9 * al));
          gb.addColorStop(1, rgba(col, 0));
          ctx.fillStyle = gb;
          ctx.beginPath();
          ctx.arc(cb[0], cb[1], rd, 0, 7);
          ctx.fill();
          if (a.fk != 'ionic')
            for (let n = 0; n < 7; n++) {
              const pb = R3.P([bx + Math.cos(n * 1.3) * u * 2.2, 0.4 + u * 2.6 + n * 0.15, bz + Math.sin(n * 1.3) * u * 2.2]);
              if (!pb) continue;
              ctx.fillStyle = rgba(col, 0.7 * al);
              ctx.beginPath();
              ctx.arc(pb[0], pb[1], Math.max(2, (0.7 * R3.fl) / pb[2]), 0, 7);
              ctx.fill();
            }
        });
      if (a.fk == 'ionic' && a.tr && a.tr.length > 1) {
        // Traînée d'éclairs derrière le tireur lancé à pleine vitesse.
        [0.3, 0.8, 1.3, 1.8].forEach((h, hi) => {
          for (let w = 0; w < 2; w++) {
            ctx.strokeStyle = w ? '#ffffff' : '#dfe9ff';
            ctx.lineWidth = w ? 2 : 6;
            ctx.beginPath();
            let on = false;
            a.tr.forEach((q, i) => {
              const age = s - q[2];
              if (age > 0.6) return;
              const j = (Math.random() - 0.5) * 0.7 * (1 - age),
                pb = R3.P([X(q[0]) + j, h + (Math.random() - 0.5) * 0.4, Z(q[1]) + j]);
              if (!pb) return;
              if (on) ctx.lineTo(pb[0], pb[1]);
              else ctx.moveTo(pb[0], pb[1]);
              on = true;
            });
            ctx.globalAlpha = w ? 0.95 : 0.5;
            ctx.stroke();
          }
        });
        ctx.globalAlpha = 1;
      }
      if (a.fk == 'bubble') {
        ctx.strokeStyle = rgba(col, 0.9);
        ctx.lineWidth = 2;
        for (let n = 0; n < 9; n++) {
          const u = (s * 0.8 + n / 9) % 1,
            an = n * 2.4 + s,
            pb = R3.P([x + Math.cos(an) * (0.8 + ((n * 7) % 5) * 0.12), 0.3 + u * 3.2, z + Math.sin(an) * (0.8 + ((n * 7) % 5) * 0.12)]);
          if (!pb) continue;
          ctx.globalAlpha = 1 - u;
          ctx.beginPath();
          ctx.arc(pb[0], pb[1], Math.max(2, ((0.18 + 0.12 * (n % 3)) * R3.fl) / pb[2]), 0, 7);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      const c0 = R3.P([x, 1.8, z]);
      if (c0) {
        const rad = ((3.4 * R3.fl) / c0[2]) * (1 + 0.1 * Math.sin(s * 9));
        const g2 = ctx.createRadialGradient(c0[0], c0[1], rad * 0.15, c0[0], c0[1], rad);
        g2.addColorStop(0, rgba(col, a.fk == 'ionic' ? 0.28 : 0.5));
        g2.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(c0[0], c0[1], rad, 0, 7);
        ctx.fill();
      }
      for (let n = 0; n < 3; n++) {
        const u = (s * 1.2 + n / 3) % 1,
          rr = 0.8 + u * 3.2,
          pts = [];
        for (let i = 0; i <= 24; i++) {
          const p = R3.P([
            x + Math.cos((i / 24) * 6.2832) * rr,
            0.05 + u * 0.4,
            z + Math.sin((i / 24) * 6.2832) * rr,
          ]);
          if (p) pts.push(p);
        }
        if (pts.length > 3) {
          ctx.strokeStyle = rgba(col, 1 - u);
          ctx.lineWidth = Math.max(1.5, ((5 * R3.fl) / pts[0][2]) * 0.12);
          ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.stroke();
        }
      }
      if (!lite())
        for (let i = 0; i < 14; i++) {
          const an = s * 3 + i * 0.9,
            h = ((s * 0.9 + i * 0.173) % 1) * 3.4,
            p = R3.P([x + Math.cos(an) * 1.1, h, z + Math.sin(an) * 1.1]);
          if (p) {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 1 - h / 3.4;
            const sz = Math.max(1.5, (0.09 * R3.fl) / p[2]);
            ctx.fillRect(p[0], p[1], sz, sz);
          }
        }
      ctx.restore();
    }
    if (cine) {
      ctx.fillStyle = '#000b';
      ctx.fillRect(0, 0, W, H * 0.085);
      ctx.fillRect(0, H * 0.915, W, H * 0.085);
      if (g) {
        const sc = st.cur;
        ctx.fillStyle = '#fff';
        ctx.font = `${H * 0.034}px ${FNT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText((numOf(A, g.a) + ' · ' + pname(A, g.a)).toUpperCase(), W * 0.03, H * 0.045);
        ctx.textAlign = 'right';
        ctx.fillStyle = st.kit.c[A];
        ctx.fillText(tm(A).name.toUpperCase(), W * 0.97, H * 0.045);
      }
    }
  }
  /* ---------- splash art plein écran ---------- */
  // Couleurs de peau et de cheveux des petits personnages.
  const SKIN = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#f7d7c4'],
    HAIR = ['#1b1b2b', '#5a3b22', '#e8c25a', '#c9462e', '#3d7ff0', '#a050e0'];
  // Dessine le petit personnage d'un joueur (pour les écrans de célébration).
  function avatar(t, k, col, col2, num, gk) {
    const nm = pname(t, k),
      h = hash(nm),
      sk = SKIN[h % 5],
      hr = HAIR[(h >> 3) % 6],
      style = (h >> 5) % 4;
    const hair =
      style == 0
        ? `<path d="M64 52c4-22 24-30 40-22 14-6 30 6 30 28-12-14-34-18-70-6z" fill="${hr}"/>`
        : style == 1
          ? `<path d="M62 62c-6-30 20-44 46-36 20 4 28 22 22 36-8-14-24-22-68 0z" fill="${hr}"/><circle cx="100" cy="28" r="9" fill="${hr}"/>`
          : style == 2
            ? `<path d="M60 70c-8-44 24-52 44-46 22-4 44 6 38 46-10-22-30-28-82 0z" fill="${hr}"/>`
            : `<path d="M62 60c2-28 30-38 52-28 12 6 16 18 14 28-14-12-38-16-66 0z" fill="${hr}"/><rect x="58" y="56" width="10" height="26" rx="4" fill="${hr}"/>`;
    return `<svg viewBox="0 0 200 240" aria-hidden="true"><path d="M10 240c2-52 36-84 90-84s88 32 90 84z" fill="${col}" stroke="#0a0c22" stroke-width="5"/><path d="M70 160l30 26 30-26" fill="${col2}" stroke="#0a0c22" stroke-width="4"/><rect x="86" y="130" width="28" height="30" rx="8" fill="${sk}" stroke="#0a0c22" stroke-width="4"/><ellipse cx="100" cy="92" rx="38" ry="44" fill="${sk}" stroke="#0a0c22" stroke-width="5"/>${hair}<ellipse cx="86" cy="94" rx="4.5" ry="6" fill="#0a0c22"/><ellipse cx="114" cy="94" rx="4.5" ry="6" fill="#0a0c22"/><path d="M84 84l10 3M116 84l-10 3" stroke="#0a0c22" stroke-width="4" stroke-linecap="round"/><path d="M88 114c8 8 16 8 24 0" fill="none" stroke="#0a0c22" stroke-width="4" stroke-linecap="round"/><text x="100" y="226" text-anchor="middle" font-size="42" fill="${lum(col) > 150 ? '#0a0c22' : '#fff'}" font-family='Bagel Fat One,sans-serif' stroke="#0a0c22" stroke-width="1">${num}</text>${gk ? '<path d="M36 200h128" stroke="#fff" stroke-width="3" opacity=".5"/>' : ''}</svg>`;
  }
  // Ajuste la taille du portrait de l'écran de but : il garde sa grande taille d'origine quelle que soit
// la résolution de la photo (on respecte seulement ses proportions et la largeur de l'écran).
window.phFit = function (im) {
  try {
    const a = im.parentElement,
      w = im.naturalWidth,
      h = im.naturalHeight;
    if (!a || !w || !h) return;
    a.style.aspectRatio = w + '/' + h;
    a.style.height = innerHeight * 0.78 + 'px';
    if (a.getBoundingClientRect().width > innerWidth * 0.5) a.style.height = (innerWidth * 0.5 * h) / w + 'px';
  } catch (e) {}
};
// Portrait du joueur à afficher sur l'écran de but.
  function cutPh(t, k) {
    try {
      const T = tm(t),
        p = T.sq[T.lu[k]];
      return p ? phUrl(p) : '';
    } catch (e) {
      return '';
    }
  }
  // Affiche l'écran de but, d'arrêt ou de Fluide avec le portrait du joueur.
  function showCut(type, sc) {
    if (!FULL) return;
    endCut(true);
    const A = st.plan ? st.plan.A : sc.at,
      D = 1 - A;
    let t = A,
      k = sc.pl,
      big,
      sub,
      cls = '';
    if (type == 'goal') {
      big = 'BUT !';
      sub =
        `${tm(0).name} ${sc.sc[0]} - ${sc.sc[1]} ${tm(1).name}` + (sc.fl ? ' · ' + (sc.fn || 'Fluide') : '');
    } else if (type == 'save') {
      t = D;
      k = 0;
      big = 'ARRÊT !';
      sub = 'devant ' + pname(A, sc.pl);
    } else {
      big = 'FLUIDE !';
      sub = sc.fn || 'Fluide déchaîné';
    }
    const col = st.kit.c[t],
      col2 = st.kit.c2[t] === col ? '#ffffff' : st.kit.c2[t],
      e = document.createElement('div');
    e.className = 'ancut ' + (type == 'fluid' ? 'fluid' : '') + (lite() ? ' lite' : '');
    const tcol = type == 'fluid' ? FXV[sc.fk] || '#7a2cff' : col;
    e.style.setProperty('--tc', tcol);
    e.style.setProperty('--tt', lum(tcol) > 170 ? '#0a0c22' : '#fff');
    let extra = '';
    if (type == 'fluid' || sc.fl) {
      extra = '<div class="ring"></div><div class="ring"></div><div class="ring"></div>';
      if (!lite())
        for (let i = 0; i < 22; i++) {
          const a = Math.random() * 6.28,
            d = 22 + Math.random() * 30;
          extra += `<i class="sp" style="--dx:${Math.cos(a) * d}vmin;--dy:${Math.sin(a) * d}vmin;animation-delay:${Math.random() * 1.2}s"></i>`;
        }
    }
    e.innerHTML = `<div class="rays"></div><div class="dots"></div>${extra}<div class="bA"></div><div class="bB"></div><div class="art${cutPh(t, k) ? ' ph' : ''}">${cutPh(t, k) ? `<img src="${cutPh(t, k)}" alt="" onload="phFit(this)"><b style="background:${col};color:${lum(col) > 150 ? '#0a0c22' : '#fff'}">${numOf(t, k)}</b>` : avatar(t, k, col, col2, numOf(t, k), k == 0)}</div><div class="txt"><span class="big">${big}</span><span class="sub">${sub}</span></div><div class="anpl2"><b>${pname(t, k)}</b><small>${tm(t).name.toUpperCase()} · N° ${numOf(t, k)}</small></div><div class="hint">Cliquer pour continuer</div>`;
    const end = () => endCut();
    e.addEventListener('click', end);
    document.body.appendChild(e);
    st.cutEl = e;
    st.cutEnd = end;
    st.cutTm = setTimeout(end, type == 'goal' ? 2800 : 2100);
  }
  // Ferme l'écran de célébration.
  function endCut(silent) {
    const e = st.cutEl;
    clearTimeout(st.cutTm);
    st.cutEl = null;
    st.cutEnd = null;
    if (e) e.remove();
  }
  /* ---------- ambiance sonore (foule synthétisée) ---------- */
  // Ambiance sonore du stade (foule synthétisée).
  const amb = {
    g: null,
    f: null,
    s: null,
    on: false,
    can() {
      return ST.snd && ST.anamb !== 0 && ST.vol > 0 && on() && conn();
    },
    start() {
      if (this.g) return true;
      sfxInit();
      if (!AX.c) return false;
      try {
        const c = AX.c,
          n = c.createBuffer(1, c.sampleRate * 2, c.sampleRate),
          d = n.getChannelData(0);
        let b = 0;
        for (let i = 0; i < d.length; i++) {
          const w = Math.random() * 2 - 1;
          b = (b + 0.02 * w) / 1.02;
          d[i] = b * 3.5;
        }
        const s = c.createBufferSource();
        s.buffer = n;
        s.loop = true;
        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = st.th.af || 520;
        f.Q.value = 0.6;
        const g = c.createGain();
        g.gain.value = 0;
        s.connect(f);
        f.connect(g);
        g.connect(AX.m);
        s.start();
        this.g = g;
        this.f = f;
        this.s = s;
        return true;
      } catch (e) {
        return false;
      }
    },
    set() {
      if (this.can()) {
        if (this.start()) {
          this.f.frequency.value = st.th.af || 520;
          this.level(0.05);
        }
      } else this.level(0);
    },
    level(x, dur = 0.3) {
      if (!this.g || !AX.c) return;
      const v = this.can() ? x * 1.6 : 0,
        t = AX.c.currentTime;
      this.g.gain.cancelScheduledValues(t);
      this.g.gain.setTargetAtTime(v, t, dur);
    },
    event(k) {
      if (!this.can() || !this.g) return;
      const f0 = st.th.af || 520;
      if (k == 'shot') {
        this.level(0.12, 0.15);
        setTimeout(() => this.level(0.05, 0.5), 1100);
      }
      if (k == 'shot2') {
        this.level(0.16, 0.1);
      }
      if (k == 'goal') {
        this.f.frequency.value = f0 + 200;
        this.level(0.34, 0.1);
        setTimeout(() => {
          this.level(0.05, 1.2);
          this.f.frequency.value = f0;
        }, 2800);
      }
      if (k == 'save') {
        this.level(0.18, 0.1);
        setTimeout(() => this.level(0.05, 0.5), 900);
      }
      if (k == 'miss') {
        this.f.frequency.value = f0 - 160;
        this.level(0.1, 0.1);
        setTimeout(() => {
          this.level(0.05, 0.6);
          this.f.frequency.value = f0;
        }, 700);
      }
    },
  };
  /* ---------- rejeu ---------- */
  // Bouton « Rejouer l'action ».
  function replay() {
    if (!st.last) return;
    if (st.cur || st.Q.length) {
      st.rpq = 1;
      return;
    }
    st.rpq = 1;
  }
  return {
    on,
    lite,
    attach,
    idle,
    busy,
    push,
    flush,
    clk,
    sc,
    lg,
    kit: (M) => (st.M === M && st.kit) || null,
    sts,
    tog,
    pace,
    replay,
    hud,
    ui,
    st,
    init,
    amb,
    thName: () => st.th.n,
    fin: () => {
      st.fin = 1;
    },
    unfin: () => {
      st.fin = 0;
    },
  };
})();
/*MAN-END*/

// Panneau « Tactique » du match : terrain, remplaçants, instructions et rôles (modifiable pendant la pause).
function mtacBox(M) {
  if (M.done) return '';
  return `<div class="mtm" onclick="V.mtc=0;render()"><div class="card mtac" id="mtac" onclick="event.stopPropagation()"><div class="tvh"><b>${!M.min ? 'Tactique avant le match' : 'Tactique du match'}</b><span class="mu">${!M.min ? 'Réglez l’équipe, la stratégie et les rôles, puis lancez le match.' : V.iv ? 'Mettez le match en pause pour modifier.' : 'Match en pause : réglez puis reprenez.'}</span><button class="p" onclick="V.mtc=0;render()" style="margin-left:auto">${!M.min ? 'Valider · Aller au coup d’envoi' : 'Fermer ✕ · Retour au match'}</button></div>${tacView()}</div></div>`;
}
// Ouvre ou ferme le panneau tactique (met le match en pause à l’ouverture).
function mtacTog() {
  V.mtc = V.mtc ? 0 : 1;
  if (V.mtc && V.iv) stop();
  V.sel = null;
  render();
}
// COMPOSITIONS avant le coup d'envoi : fenêtre sur l'écran d'animation avec les deux équipes (titulaires placés
// selon leur formation, numéros, remplaçants).
// Vrai si la couleur (#rrggbb) est claire : le texte dessus doit être foncé.
const lnDark = (c) => {
  const h = String(c).replace('#', '');
  return 0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16) > 150;
};
// Fond de la fiche de composition : la moitié de terrain de l'équipe (but à gauche, ligne médiane à droite).
function lnPitch() {
  const X = (x) => (4 + (x / 0.78) * 92).toFixed(2),
    Y = (y) => (8 + y * 84).toFixed(2);
  let st = '';
  for (let i = 0; i < 8; i++) st += `<rect x="${(4 + i * 11.5).toFixed(1)}" y="5" width="11.5" height="90" fill="${i % 2 ? '#1d5a33' : '#216638'}"/>`;
  const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  return `<svg class="lnsv" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="#174a2b"/>${st}<g fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="0.7" vector-effect="non-scaling-stroke"><rect x="4" y="5" width="92" height="90"/>${L(X(0.5), 5, X(0.5), 95)}<rect x="4" y="${Y(0.24)}" width="${(X(0.16) - 4).toFixed(2)}" height="${(Y(0.76) - Y(0.24)).toFixed(2)}"/><rect x="4" y="${Y(0.38)}" width="${(X(0.06) - 4).toFixed(2)}" height="${(Y(0.62) - Y(0.38)).toFixed(2)}"/><ellipse cx="${X(0.5)}" cy="50" rx="${((0.1 / 0.78) * 92).toFixed(2)}" ry="13"/><path d="M${X(0.16)} ${Y(0.4)} A7 9 0 0 1 ${X(0.16)} ${Y(0.6)}"/></g><circle cx="${X(0.5)}" cy="50" r="0.9" fill="#fff" fill-opacity=".8"/></svg>`;
}
function lnTeam(t, r) {
  const sq = t.sq || [],
    lu = t.lu || [],
    kt = kitOf(t),
    sn = (n) => {
      const w = String(n).split(' ');
      return w.length > 1 ? w.slice(1).join(' ') : n;
    },
    cs = lu
      .map((li, k) => {
        const p = sq[li];
        if (!p) return '';
        const q = pos(t, k, 0),
          X = 4 + Math.min(1, q[0] / 0.78) * 92,
          Y = 8 + q[1] * 84,
          u = phUrl(p);
        return `<div class="lnp" style="left:${X.toFixed(1)}%;top:${Y.toFixed(1)}%">${u ? `<i style="background-image:url('${u}')"></i>` : '<i></i>'}<span><b style="background:${kt.a};color:${lnDark(kt.a) ? '#0a0c22' : '#fff'}">${pnum(t, p)}</b><em>${sn(p.n)}</em></span></div>`;
      })
      .join(''),
    sb = sq
      .map((p, i) => [p, i])
      .filter(([p, i]) => p && !lu.includes(i) && !p.inj)
      .sort((x, y) => (y[0].o || 0) - (x[0].o || 0))
      .slice(0, 8)
      .map(([p]) => `<div><b>${pnum(t, p)}</b><span>${p.n}</span></div>`)
      .join('');
  return `<div class="lnt"><div class="lnh" style="border-left:6px solid ${kt.a}"><b>${t.name}</b><small>${t.form}</small><span class="lnst" title="Stratégie : ${(TSTY[t.sty || 0] || TSTY[0]).n}">${stIc(t.sty || 0, 18)}<em>${(TSTY[t.sty || 0] || TSTY[0]).n}</em></span></div><div class="lnb"><div class="lnf">${lnPitch()}${cs}</div><div class="lns"><h5>Remplaçants</h5>${sb || '<span class="mu">—</span>'}</div></div></div>`;
}
function lnUp(M) {
  try {
    return `<div class="lno"><div class="lni">${lnTeam(M.t[0])}${lnTeam(M.t[1])}</div><button class="p" onclick="lnClose()">Continuer vers la tactique</button></div>`;
  } catch (e) {
    return '';
  }
}
// Ferme la fenêtre de compositions ; avant le coup d'envoi, l'écran de tactique complet s'ouvre automatiquement (une fois par match).
function lnClose() {
  V.lnx = 1;
  const M = V.m;
  if (M && !M.min && !M.done && !M.tpre && !V.iv) {
    M.tpre = 1;
    V.mtc = 1;
    V.sel = null;
  }
  render();
}
// Nombre maximal de lignes du journal pendant un match.
const LOGN = 7;
// Bascule l'un des panneaux superposés de l'écran de match (stats, journal, consignes, compo).
function mxp(k) {
  V.mxp = V.mxp == k ? null : k;
  render();
}
// Page « Match » façon Football Manager : la 3D en plein écran, avec par-dessus un bandeau score/chrono,
// des boutons (Tactiques, Consignes, Stats, Journal, Compo, Menu), un commentaire et les commandes.
function mxView(M, t) {
  const done = M.done && !MAN.busy(),
    kk = MAN.kit(M),
    cc = (i) => {
      const q = kitOf(M.t[i]);
      return kk ? [kk.c[i], kk.c2[i]] : [q.a, q.b];
    },
    chip = (i) => `<i class="mxk" style="background:linear-gradient(90deg,${cc(i)[0]} 55%,${cc(i)[1]} 55%)"></i>`;
  if (done && !V.mxd) {
    V.mxd = 1;
    V.mxp = 'st';
  }
  const bt = (k, ic, l) => `<button class="mxb${V.mxp == k ? ' on' : ''}" onclick="mxp('${k}')" title="${l}"><span>${ic}</span><em>${l}</em></button>`,
    pre = !M.min && !V.iv && !M.done,
    sel = (lab, on, opts, cur) => `<label>${lab} <select onchange="${on}">${opts.map((m, i) => `<option value="${i}" ${i == cur ? 'selected' : ''}>${m}</option>`).join('')}</select></label>`,
    pan = {
      st: ['Statistiques', `<div id="anst">${statsBox(M)}</div>`],
      lg: ['Journal du match', `<div class="log" id="anlg">${MAN.lg(M).map((l) => `<div>${l}</div>`).join('') || "<div class='mu'>Le match n’a pas commencé.</div>"}</div>`],
      rg: [
        'Consignes',
        M.done
          ? '<span class="mu">Le match est terminé.</span>'
          : `<div class="ctl">${sel('Mentalité', 'me().m=+this.value;me().sty=0;save()', MENT, t.m)}${sel('Pressing', 'me().pr=+this.value;me().sty=0;save()', ['Bas', 'Moyen', 'Haut'], t.pr ?? 1)}${foSel()}<span class="mu">Remplacements : ${V.sub}</span></div>${shoutBox(M)}`,
      ],
      cp: ['Compositions', `${pre ? preBar(t) : ''}<div class="lni">${lnTeam(M.t[0])}${lnTeam(M.t[1])}</div>`],
    }[V.mxp],
    bar = !M.done
      ? `${V.iv ? `<button class="mxg1" onclick="stop();render()">⏸ Pause</button>` : `<button class="mxg1 p" onclick="loop();render()">▶ ${M.min ? 'Reprendre' : 'Coup d’envoi'}</button>`}<select onchange="V.sp=+this.value;if(V.iv)loop()"><option value="0" ${V.sp == 0 ? 'selected' : ''}>Lent</option><option value="1" ${V.sp == 1 ? 'selected' : ''}>Normal</option><option value="2" ${V.sp == 2 ? 'selected' : ''}>Rapide</option></select>`
      : MAN.busy()
        ? `<button class="mxg1 p" onclick="MAN.flush();render()">Passer l’animation</button>`
        : `<button class="mxg1 p" onclick="cont()">Continuer</button>`;
  return `<div class="mxf"><div id="anh"></div>
<div class="mxt"><div class="mxtl">${M.done ? '' : `<button class="mxb${V.mtc ? ' on' : ''}" onclick="mtacTog()" title="Tactique et équipe"><span>⚙</span><em>Tactiques</em></button>${bt('rg', '🎚', 'Consignes')}`}</div>
<div class="mxm"><div class="mxcp" title="${S.ctx == 'C' ? 'Galactik Cup' : 'Galactik League'}"><img src="${S.ctx == 'C' ? LGC : LGL}" alt=""></div><div class="mxs">${M.dby ? `<small>${M.dby == 'C' ? '⚡ CLASSICO' : '🔥 DERBY'}</small>` : ''}<span class="mxn l">${M.t[0].name}${chip(0)}</span><span class="mxsc" id="ansc">${MAN.sc(M)[0]} - ${MAN.sc(M)[1]}</span><span class="mxn r">${chip(1)}${M.t[1].name}</span><span class="mxc" id="anclk">${MAN.clk(M)}</span></div></div>
<div class="mxtr">${bt('st', '📊', 'Stats')}${bt('lg', '📝', 'Journal')}${bt('cp', '📋', 'Compo')}${M.done ? '' : `<button class="mxb" onclick="stop();V.menu=1;render()" title="Met le match en pause et ouvre le menu principal."><span>🏠</span><em>Menu</em></button>`}</div></div>
${pan ? `<div class="mxp mxp-${V.mxp}"><div class="mxph"><b>${pan[0]}</b><button onclick="mxp('${V.mxp}')" aria-label="Fermer">✕</button></div><div class="mxpb">${pan[1]}</div></div>` : ''}
${pre && !V.lnx && !V.mxp ? lnUp(M) : ''}
<div class="mxcm" id="ancm">${lgR(MAN.lg(M)[0] || '')}</div>
<div class="mxbar">${bar}</div></div>`;
}
// Ancienne vue du terrain (simple) du match.
function pitch(M) {
  const P = [];
  M.t.forEach((t, sd) => {
    const bx = M.bx ?? 0.5,
      by = M.by ?? 0.5,
      ps = t.lu.map((_, k) => pos(t, k, sd)),
      nr = ps
        .map((q, k) => [k, (q[0] - bx) ** 2 + (q[1] - by) ** 2])
        .filter((z) => z[0])
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .map((z) => z[0]);
    ps.forEach((q, k) => {
      let [x, y] = q;
      if (nr.includes(k)) {
        x += (bx - x) * 0.5;
        y += (by - y) * 0.5;
      } else if (k) y += (by - y) * 0.12;
      P.push([x * 105, y * 68]);
    });
  });
  P.push([(M.bx ?? 0.5) * 105, (M.by ?? 0.5) * 68]);
  const pp = V.pp && V.pp.length == P.length ? V.pp : P,
    n = M.t[0].lu.length;
  V.nx = P;
  V.pp = P;
  return field(
    P.map((q, i) => {
      const o = pp[i],
        b = i == P.length - 1;
      return `<g class="d" id="d${i}" style="transform:translate(${o[0]}px,${o[1]}px)"><circle r="${b ? 2 : 3}" fill="${b ? (M.at == 1 ? '#e8743b' : 'var(--ac)') : i < n ? 'var(--ac)' : '#e8743b'}" stroke="${b ? '#fff' : '#000'}" stroke-opacity="${b ? 1 : 0.4}" stroke-width="${b ? 0.8 : 0.3}"/></g>`;
    }).join(''),
  );
}
// Anime les points de la vue simple.
function anim() {
  setTimeout(
    () =>
      (V.nx || []).forEach((q, i) => {
        const e = $('d' + i);
        if (e) e.style.transform = `translate(${q[0]}px,${q[1]}px)`;
      }),
    40,
  );
}
// ======================================================================
// TACTIQUE AVANCÉE (inspirée de Football Manager 26)
// ----------------------------------------------------------------------
// Ce bloc contient : les STYLES de jeu, les CONSIGNES d'équipe, les RÔLES des joueurs (avec et
// sans ballon), le schéma SANS ballon, les CRIS de touche, les conseils de l'ADJOINT et
// l'ANALYSE du match. Tout est modifiable ici : les tableaux INS, TSTY, ROLES et SHOUTS sont
// des listes de données faciles à ajuster (les effets sont de petits nombres : + = mieux).
// ======================================================================

// CONSIGNES D'ÉQUIPE. Chaque ligne : k = identifiant (enregistré dans t.ti), g = groupe
// (ep = avec ballon, tr = transitions, sp = sans ballon), l = libellé, o = options affichées,
// df = option choisie par défaut (0 = première), h = aide, e = effets selon l'option choisie.
// Effets : m = milieu, d = défense, a = attaque, c = occasions créées (en %), g = réussite des
// tirs (en points), f = fatigue, x = fautes.
const INS = [
  { k: 'dir', g: 'ep', l: 'Directivité des passes', o: ['Beaucoup plus courtes', 'Plus courtes', 'Équilibrée', 'Plus directes', 'Beaucoup plus directes'], df: 2, h: 'Passes courtes : plus de contrôle au milieu. Passes directes : plus vite devant, moins de ballon.', e: { m: [1.2, 0.6, 0, -0.5, -1], c: [-0.03, -0.015, 0, 0.015, 0.03], a: [0, 0, 0, 0.2, 0.4] } },
  { k: 'tmp', g: 'ep', l: 'Tempo', o: ['Plus lent', 'Standard', 'Plus rapide'], df: 1, h: 'Un tempo rapide crée plus d’occasions mais fatigue plus et tire moins juste.', e: { c: [-0.03, 0, 0.04], f: [-0.3, 0, 0.7], g: [0.02, 0, -0.02] } },
  { k: 'wst', g: 'ep', l: 'Perte de temps', o: ['Moins souvent', 'Standard', 'Plus souvent'], df: 1, h: 'À utiliser quand on mène : moins d’occasions, mais moins de fatigue.', e: { c: [0, 0, -0.05], f: [0.2, 0, -0.3] } },
  { k: 'wid', g: 'ep', l: 'Largeur en attaque', o: ['Beaucoup plus étroite', 'Plus étroite', 'Standard', 'Plus large', 'Beaucoup plus large'], df: 2, h: 'Large : plus d’espace en attaque mais défense plus étirée. Étroit : équipe compacte.', e: { m: [0.6, 0.3, 0, -0.2, -0.5], a: [-0.4, -0.2, 0, 0.3, 0.6], d: [0.3, 0.1, 0, -0.1, -0.3] } },
  { k: 'cre', g: 'ep', l: 'Liberté créative', o: ['Plus disciplinée', 'Équilibrée', 'Plus expressive'], df: 1, h: 'Expressive : plus d’occasions, plus de risques de perdre le ballon.', e: { c: [-0.03, 0, 0.04], g: [0.02, 0, -0.03], m: [0.3, 0, -0.3] } },
  { k: 'bu', g: 'ep', l: 'Relance', o: ['À travers le pressing', 'Mixte', 'Direct'], df: 1, h: 'Construire court depuis l’arrière aide le milieu mais expose la défense. Direct : on évite le risque.', e: { m: [0.7, 0, -0.5], d: [-0.3, 0, 0.3], a: [0, 0, 0.2] } },
  { k: 'gk', g: 'ep', l: 'Dégagements du gardien', o: ['Courts', 'Mixtes', 'Longs'], df: 1, h: 'Courts : relance propre. Longs : on gagne du terrain mais on perd souvent le ballon.', e: { m: [0.4, 0, -0.3], d: [-0.2, 0, 0.2] } },
  { k: 'pf', g: 'ep', l: 'Passes dans les pieds', o: ['Standard', 'Dans les pieds'], df: 0, h: 'Les passes vont au pied du partenaire : meilleure conservation, attaques plus lentes.', e: { m: [0, 0.3], c: [0, -0.01] } },
  { k: 'pat', g: 'ep', l: 'Patience dans le dernier tiers', o: ['Travailler le ballon', 'Équilibrée', 'Moins patient'], df: 1, h: 'Patient : meilleures occasions mais moins nombreuses. Impatient : on tire plus tôt.', e: { c: [-0.02, 0, 0.03], g: [0.04, 0, -0.03] } },
  { k: 'shd', g: 'ep', l: 'Tirs de loin', o: ['Réduits', 'Équilibrés', 'Encouragés'], df: 1, h: 'Encourager les tirs de loin donne plus de tirs mais moins précis.', e: { c: [-0.02, 0, 0.03], g: [0.02, 0, -0.03] } },
  { k: 'cro', g: 'ep', l: 'Style de centres', o: ['Centres bas', 'Équilibrés', 'Centres hauts'], df: 1, h: 'Les centres bas sont plus précis ; les hauts créent plus de chaos.', e: { g: [0.015, 0, -0.01], c: [0, 0, 0.01] } },
  { k: 'drb', g: 'ep', l: 'Dribbles', o: ['Réduits', 'Équilibrés', 'Encouragés'], df: 1, h: 'Encouragés : plus de percées en attaque, un peu plus de fatigue.', e: { a: [-0.3, 0, 0.4], c: [-0.01, 0, 0.02], f: [0, 0, 0.2] } },
  { k: 'atr', g: 'tr', l: 'Transition offensive (après récupération)', o: ['Contre-attaque', 'Standard', 'Construction patiente'], df: 1, h: 'Contre-attaque : on repart tout de suite vers l’avant. Patiente : on garde le ballon.', e: { c: [0.03, 0, -0.01], m: [-0.4, 0, 0.3], d: [-0.2, 0, 0.1] } },
  { k: 'dtr', g: 'tr', l: 'Transition défensive (après perte)', o: ['Contre-pressing', 'Standard', 'Repli'], df: 1, h: 'Contre-pressing : on presse tout de suite pour reprendre le ballon (fatigant). Repli : on se replace.', e: { m: [0.7, 0, -0.3], d: [-0.2, 0, 0.4], f: [0.5, 0, -0.2], x: [0.1, 0, 0] } },
  { k: 'eng', g: 'sp', l: 'Ligne d’engagement du pressing', o: ['Pressing haut', 'Bloc médian', 'Bloc bas'], df: 1, h: 'Où l’équipe commence à défendre : haut = plus de ballons récupérés mais plus de fatigue ; bas = solide, peu de ballons récupérés.', e: { m: [0.8, 0, -0.6], d: [-0.4, 0, 0.8], f: [0.6, 0, -0.3] } },
  { k: 'dl', g: 'sp', l: 'Ligne défensive', o: ['Plus basse', 'Standard', 'Plus haute', 'Beaucoup plus haute'], df: 1, h: 'Plus haute = équipe compacte et milieu fort, mais défense exposée aux ballons en profondeur.', e: { d: [0.5, 0, -0.4, -0.8], m: [-0.3, 0, 0.3, 0.6] } },
  { k: 'dlb', g: 'sp', l: 'Comportement de la ligne', o: ['Équilibré', 'Bloc compact', 'Montée'], df: 0, h: 'Bloc compact : la ligne se resserre devant le but et gêne les attaques, au prix de moins de soutien au milieu.', e: { d: [0, 0.4, 0.2], m: [0, 0, 0.2] } },
  { k: 'tp', g: 'sp', l: 'Déclenchement du pressing', o: ['Moins souvent', 'Équilibré', 'Plus souvent'], df: 1, h: 'Plus on presse souvent, plus on récupère le ballon mais plus on se fatigue et on commet de fautes.', e: { m: [-0.3, 0, 0.4], f: [-0.3, 0, 0.5], x: [-0.05, 0, 0.08] } },
  { k: 'tk', g: 'sp', l: 'Tacles', o: ['Modérés', 'Standard', 'Agressifs'], df: 1, h: 'Agressifs : défense plus solide mais plus de fautes et d’exclusions.', e: { d: [-0.2, 0, 0.4], x: [-0.1, 0, 0.12] } },
  { k: 'trap', g: 'sp', l: 'Piège de pressing', o: ['Équilibré', 'Actif'], df: 0, h: 'L’équipe coordonne son pressing pour piéger le porteur du ballon.', e: { m: [0, 0.3], f: [0, 0.2] } },
  { k: 'cx', g: 'sp', l: 'Engagement sur les centres', o: ['Tenir sa position', 'Équilibré', 'Contester'], df: 1, h: 'Contester : on va chercher les centres, au risque de laisser des espaces et de commettre des fautes.', e: { d: [0.1, 0, 0.1], x: [-0.03, 0, 0.05] } },
];
// Consignes les plus importantes, affichées directement dans l'onglet Tactique (les autres sont
// dans « Toutes les consignes »).
const INS_MAIN = ['dir', 'tmp', 'wid', 'atr', 'dtr', 'eng', 'dl', 'tk'];

// Valeur d'une consigne pour une équipe (sa valeur par défaut si elle n'a rien choisi).
const tiV = (t, k) => (t.ti && t.ti[k] != null ? t.ti[k] : INS.find((i) => i.k == k).df);
// Additionne les effets de toutes les consignes d'une équipe.
function tiMods(t) {
  const o = { d: 0, m: 0, a: 0, c: 0, g: 0, f: 0, x: 0 };
  for (const i of INS) {
    const v = tiV(t, i.k);
    for (const q in i.e) o[q] += i.e[q][v] || 0;
  }
  return o;
}

// STYLES DE JEU : choisir un style règle d'un coup mentalité, pressing et consignes. m = mentalité
// (0 défensive, 1 équilibrée, 2 offensive), pr = pressing (0 bas, 1 moyen, 2 haut), le reste =
// consignes à modifier (valeur = numéro de l'option).
const TSTY = [
  { n: 'Personnalisé', d: 'Vos propres réglages.', m: 1, pr: 1, s: {} },
  { n: 'Contrôle du ballon', d: 'Garder le ballon et dominer le jeu.', m: 1, pr: 1, s: { dir: 1, pat: 0, bu: 0 }, fx: { m: 1, c: 0.01 } },
  { n: 'Gegenpressing', d: 'Pressing très haut pour récupérer vite le ballon.', m: 2, pr: 2, s: { tmp: 2, eng: 0, dtr: 0, tp: 2, dl: 2 }, fx: { m: 1.5, a: 1, f: 0.6 } },
  { n: 'Tiki-taka', d: 'Jeu court, patient, très technique.', m: 1, pr: 1, s: { dir: 0, wid: 1, pat: 0, bu: 0, pf: 1 }, fx: { m: 1.5, c: 0.015 } },
  { n: 'Tiki-taka vertical', d: 'Possession mais passes plus tranchantes vers l’avant.', m: 1, pr: 1, s: { dir: 1, tmp: 2, bu: 0, pf: 1 }, fx: { m: 1, a: 1, c: 0.02 } },
  { n: 'Jeu sur les ailes', d: 'Attaquer par les côtés avec des centres.', m: 1, pr: 1, s: { wid: 4, cro: 2, drb: 2, dir: 3 }, fx: { a: 1, c: 0.02 } },
  { n: 'Jeu long', d: 'Balles longues vers l’avant.', m: 1, pr: 1, s: { dir: 4, bu: 2, gk: 2, tmp: 2, cro: 2, pat: 2 }, fx: { m: 2.5, a: 1.5, c: 0.03, g: 0.01 } },
  { n: 'Contre-attaque fluide', d: 'Défendre ensemble puis partir vite.', m: 1, pr: 0, s: { atr: 0, dir: 3, tmp: 2, dl: 0 }, fx: { d: 1, a: 1.5, c: 0.03 } },
  { n: 'Contre-attaque directe', d: 'Défense solide et grands ballons vers l’avant.', m: 0, pr: 0, s: { atr: 0, dir: 4, eng: 2, dl: 0 }, fx: { d: 0.5, a: 1, c: 0.02 } },
  { n: 'Catenaccio', d: 'Très défensif, solide derrière.', m: 0, pr: 0, s: { eng: 2, dl: 0, tk: 2, wst: 2 }, fx: { d: 2.5, c: 0.01 } },
  { n: 'Park the bus', d: 'Tout le monde derrière : à réserver aux cas extrêmes.', m: 0, pr: 0, s: { eng: 2, dl: 0, wid: 0, wst: 2, tmp: 0, dtr: 2 }, fx: { d: 3.5, c: 0.01 } },
];
// Applique un style : remplace mentalité, pressing et consignes d'un coup.
function setSty(i) {
  const t = me(),
    st = TSTY[i];
  t.sty = i;
  if (i) {
    t.ti = {};
    Object.assign(t.ti, st.s);
    t.m = st.m;
    t.pr = st.pr;
  }
  save();
  render();
}
// Change une consigne d'équipe (le style devient « Personnalisé »).
function setIns(k, v) {
  const t = me();
  t.ti = t.ti || {};
  t.ti[k] = +v;
  t.sty = 0;
  save();
  render();
}
// Schéma sans ballon d'une équipe (son schéma avec ballon par défaut). Il est enregistré dans t.fs ;
// t.fo sert à l'usage du Fluide (nombre) : d'anciennes sauvegardes y avaient mis le schéma, on les répare.
function fsOf(t) {
  if (typeof t.fo == 'string') {
    if (FORM[t.fo]) t.fs = t.fo;
    t.fo = 1;
  }
  return t.fs && FORM[t.fs] ? t.fs : t.form;
}
// Schéma SANS ballon : l'écart avec le schéma avec ballon change la force de chaque ligne.
// Ex. 2-2-2 avec le ballon et 3-2-1 sans : plus solide derrière, moins dangereux en contre.
function spShape(t) {
  const a = FORM[t.form],
    b = FORM[fsOf(t)],
    dd = b[1] - a[1],
    mm = b[2] - a[2],
    aa = b[3] - a[3];
  return { d: dd * 1.6, m: mm * 1, a: aa * 0.6, f: (Math.abs(dd) + Math.abs(mm) + Math.abs(aa)) * 0.15 };
}
// Choisit le schéma sans ballon.
function setFo(v) {
  me().fs = v;
  save();
  render();
}

// RÔLES DES JOUEURS. Pour chaque poste (GK, DEF, MID, ATT) : ep = rôles avec le ballon, sp = rôles
// sans le ballon. Un rôle = [nom, description, effets, attributs clés]. Effets : d/m/a = points de
// défense/milieu/attaque, wt = tendance à tirer, g = réussite des tirs, f = fatigue, x = fautes.
// Attributs clés : numéros dans la liste AT (0 Vitesse, 1 Finition, 2 Dribble, 3 Passe, 4 Vision,
// 5 Tacle, 6 Physique, 7 Détermination, 8 Endurance). Ils servent à noter l'adéquation (★).
const ROLES = {
  GK: {
    ep: [
      ['Gardien', 'Rôle standard.', {}, [4]],
      ['Gardien relanceur', 'Relance au pied vers les milieux.', { m: 0.6, d: -0.3 }, [3, 4]],
      ['Gardien sans fioritures', 'Dégage loin, sans prendre de risque.', { m: -0.4, a: 0.2, d: 0.3 }, [6, 7]],
    ],
    sp: [
      ['Gardien', 'Rôle standard.', {}, [4]],
      ['Gardien-libéro', 'Sort loin de sa ligne pour couvrir la défense.', { d: 0.5, m: 0.2 }, [0, 4]],
      ['Gardien sur sa ligne', 'Reste près de son but.', { d: 0.2, m: -0.2 }, [7]],
    ],
  },
  DEF: {
    ep: [
      ['Défenseur central', 'Rôle standard.', {}, [5]],
      ['Défenseur relanceur', 'Construit depuis l’arrière.', { m: 0.7, d: -0.2 }, [3, 4]],
      ['Défenseur sans fioritures', 'Dégage sans risque.', { d: 0.5, m: -0.4 }, [5, 6]],
      ['Défenseur avancé', 'Monte dans le milieu avec le ballon.', { m: 0.6, a: 0.3, d: -0.6 }, [3, 0]],
      ['Piston', 'Monte sur toute la longueur du côté.', { a: 0.6, m: 0.2, d: -0.6 }, [0, 8]],
      ['Latéral intérieur', 'Rentre dans l’axe pour aider le milieu.', { m: 0.7, d: -0.3 }, [3, 4]],
      ['Piston organisateur', 'Crée le jeu depuis la bande.', { a: 0.5, m: 0.5, d: -0.7 }, [3, 4, 2]],
    ],
    sp: [
      ['Défenseur central', 'Rôle standard.', {}, [5]],
      ['Défenseur stoppeur', 'Sort au contact de l’attaquant.', { d: 0.6, m: 0.3, x: 0.15 }, [5, 7]],
      ['Défenseur de couverture', 'Reste derrière pour couvrir.', { d: 0.7, m: -0.2 }, [4, 0]],
      ['Latéral pressant', 'Presse haut sur son côté.', { m: 0.5, d: -0.3, x: 0.1, f: 0.3 }, [8, 5]],
      ['Latéral de maintien', 'Garde sa position.', { d: 0.5, m: -0.1 }, [5]],
    ],
  },
  MID: {
    ep: [
      ['Milieu central', 'Rôle standard.', {}, [3]],
      ['Milieu défensif', 'Protège la défense.', { d: 0.5, m: 0.1, a: -0.3 }, [5, 7]],
      ['Meneur reculé', 'Organise le jeu depuis l’arrière.', { m: 0.8, a: 0.2, d: -0.2 }, [3, 4]],
      ['Demi-arrière', 'Descend entre les défenseurs pour relancer.', { m: 0.5, d: 0.3, a: -0.2 }, [3, 5]],
      ['Meneur de jeu avancé', 'Crée les occasions entre les lignes.', { a: 0.8, m: 0.3, d: -0.4 }, [4, 3]],
      ['Milieu de couloir', 'Court dans les intervalles.', { a: 0.5, m: 0.2 }, [0, 8]],
      ['Milieu excentré', 'Ouvre le jeu sur le côté.', { a: 0.4, m: 0.3, d: -0.2 }, [2, 3]],
      ['Milieu offensif', 'Se projette vers le but adverse.', { a: 0.7, d: -0.5, wt: 1.4 }, [1, 4]],
      ['Ailier', 'Déborde et centre.', { a: 0.6, m: 0.1, d: -0.4, wt: 1.2 }, [0, 2]],
      ['Ailier intérieur', 'Rentre dans l’axe pour frapper.', { a: 0.6, d: -0.4, wt: 1.6 }, [1, 2]],
      ['Ailier organisateur', 'Crée depuis la bande.', { a: 0.4, m: 0.5 }, [3, 4]],
    ],
    sp: [
      ['Milieu central', 'Rôle standard.', {}, [3]],
      ['Milieu défensif décroché', 'Descend entre les défenseurs.', { d: 0.6, m: -0.1 }, [5, 4]],
      ['Milieu défensif écran', 'Ferme l’axe devant la défense.', { d: 0.7, m: 0.1 }, [5, 7]],
      ['Milieu pressant', 'Presse le porteur du ballon.', { m: 0.7, d: -0.3, f: 0.3 }, [8, 7]],
      ['Milieu écran', 'Protège l’entrée de la surface.', { d: 0.5, m: 0.2 }, [4, 5]],
      ['Ailier de repli', 'Redescend défendre sur son côté.', { d: 0.4, m: 0.2, a: -0.2 }, [8, 0]],
    ],
  },
  ATT: {
    ep: [
      ['Avant-centre', 'Rôle standard.', {}, [1]],
      ['Pivot', 'Fixe la défense et remet de la tête ou du pied.', { m: 0.4, a: 0.2, wt: 0.7 }, [6, 3]],
      ['Renard des surfaces', 'Vit dans la surface, attend le ballon.', { a: 0.3, m: -0.4, wt: 1.5, g: 0.04 }, [1, 0]],
      ['Attaquant de couloir', 'Attaque les espaces derrière la défense.', { a: 0.5, wt: 1.2 }, [0, 1]],
      ['Faux neuf', 'Décroche dans le milieu pour créer du jeu.', { m: 0.9, a: 0.3, wt: 0.8 }, [4, 3, 2]],
      ['Attaquant intérieur', 'Part de l’aile et rentre vers le but.', { a: 0.5, m: 0.1, wt: 1.4 }, [1, 2]],
      ['Attaquant excentré', 'Reste large pour étirer la défense.', { a: 0.4, m: 0.2 }, [0, 2]],
      ['Second attaquant', 'Évolue derrière la pointe.', { a: 0.6, m: 0.3, wt: 1.1 }, [4, 1]],
      ['Rôle libre', 'Se déplace où il veut.', { a: 0.5, m: 0.4, d: -0.5, wt: 1.2 }, [4, 2]],
    ],
    sp: [
      ['Avant-centre', 'Rôle standard.', {}, [1]],
      ['Avant de repli', 'Redescend aider le milieu.', { m: 0.5, d: 0.3, a: -0.3, f: 0.2 }, [8, 7]],
      ['Avant de sortie', 'Reste haut pour lancer le contre.', { a: 0.6, m: -0.4, d: -0.2 }, [0, 1]],
    ],
  },
};
// Lit le rôle choisi pour un joueur : p.re = rôle avec ballon, p.rs = rôle sans ballon, stockés
// sous la forme 'POSTE:numéro' (ex. 'ATT:4' = Faux neuf).
function rolePick(p, ph) {
  const v = p[ph];
  if (!v || typeof v != 'string') return null;
  const [g, i] = v.split(':');
  return ROLES[g] ? { g, i: +i } : null;
}
// Note d'adéquation d'un joueur à un rôle : 1 à 5 étoiles selon ses attributs clés.
function roleStars(p, R) {
  const k = R[3];
  if (!k || !k.length) return 3;
  const at = attrs(p),
    v = k.reduce((s, i) => s + at[i], 0) / k.length;
  return Math.max(1, Math.min(5, Math.round(v / 4)));
}
// Paliers de maîtrise d'un rôle (1 à 5) et jauge de Fluide qui remplace les étoiles.
const RTIER = ['Débutant', 'Apprenti', 'Confirmé', 'Expert', 'Maître'];
const RTCL = ['#7c86b8', '#4aa3ff', '#35d6a0', '#ffb703', '#ff5ab4'];
const roleGauge = (n) =>
  `<span class="rgj" style="--rc:${RTCL[n - 1]}" title="${RTIER[n - 1]} (${n}/5)">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}<em>${RTIER[n - 1]}</em></span>`;
// Sélecteur de rôle : la liste déroulante classique, précédée de la jauge de maîtrise du rôle choisi
// (elle se met à jour toute seule quand on change de rôle). li = indice du joueur, ph = 're' ou 'rs'.
function rolePk(li, ph, groups, compact) {
  const p = me().sq[li],
    cur = p[ph] || '',
    GN = { GK: 'Gardien', DEF: 'Défenseur', MID: 'Milieu', ATT: 'Attaquant' },
    L = (g) => ROLES[g][ph == 're' ? 'ep' : 'sp'],
    pk = rolePick(p, ph),
    cr = pk ? L(pk.g)[pk.i] : null,
    gj = cr
      ? roleGauge(roleStars(p, cr))
      : `<span class="rgj" style="--rc:#7c86b8" title="Aucun rôle choisi">${'<i></i>'.repeat(5)}<em>—</em></span>`,
    opts = groups
      .map((g) => {
        const o = L(g)
          .map((R, j) => (j ? `<option value="${g}:${j}" ${cur == g + ':' + j ? 'selected' : ''}>${R[0]}</option>` : ''))
          .join('');
        return groups.length > 1 ? `<optgroup label="${GN[g]}">${o}</optgroup>` : o;
      })
      .join('');
  return `<span class="rpk${compact ? ' cp' : ''}">${gj}<select title="${ph == 're' ? 'Rôle avec le ballon' : 'Rôle sans le ballon'}" onchange="setRole(${li},'${ph}',this.value)"><option value="">— Rôle standard —</option>${opts}</select></span>`;
}
// Effets de tous les rôles et consignes individuelles des 7 titulaires d'une équipe.
function roleFx(t) {
  const o = { d: 0, m: 0, a: 0, g: 0, f: 0, x: 0, wt: t.lu.map(() => 1) },
    s = slots(t.form);
  t.lu.forEach((li, k) => {
    const p = t.sq[li];
    if (!p) return;
    for (const ph of ['re', 'rs']) {
      const r = rolePick(p, ph);
      if (!r || r.g != s[k]) continue;
      const R = ROLES[r.g][ph == 're' ? 'ep' : 'sp'][r.i];
      if (!R) continue;
      const su = 0.6 + 0.1 * roleStars(p, R);
      for (const q in R[2]) {
        if (q == 'wt') o.wt[k] *= 1 + (R[2].wt - 1) * su;
        else o[q] += R[2][q] * su;
      }
    }
    const dp = Math.max(-2, Math.min(2, +p.dp || 0)),
      DPX = { DEF: { d: -0.25, m: 0.2, a: 0.1 }, MID: { d: -0.2, m: 0.05, a: 0.25 }, ATT: { d: -0.1, m: -0.25, a: 0.25 } }[s[k]];
    if (dp && DPX) {
      for (const q in DPX) o[q] += DPX[q] * dp;
      if (dp > 0) o.f += 0.04 * dp;
      if (s[k] == 'ATT') o.wt[k] *= 1 + 0.08 * dp;
    }
    // Décalage latéral : plus large (+1) = plus de largeur en attaque ; plus axial (−1) = plus de poids dans l'axe.
    if (p.dl && s[k] != 'GK') {
      const y1 = pos(t, k, 0)[1],
        y0 = y1 - Math.sign(p.dl) * 0.07,
        w = Math.sign(Math.abs(y1 - 0.5) - Math.abs(y0 - 0.5));
      if (w > 0) {
        o.a += s[k] == 'DEF' ? 0.05 : 0.12;
        o.m -= s[k] == 'MID' ? 0.05 : 0;
        o.d -= s[k] == 'DEF' ? 0.05 : 0;
      } else if (w < 0) {
        if (s[k] == 'ATT') {
          o.a += 0.05;
          o.wt[k] *= 1.04;
        } else if (s[k] == 'MID') o.m += 0.1;
        else o.d += 0.1;
      }
    }
    const ii = p.ii;
    if (ii) {
      if (ii.ro) {
        o.m += 0.2;
        o.a += 0.2;
        o.d -= 0.3;
      }
      if (ii.tk == 1) {
        o.d += 0.2;
        o.x += 0.06;
      }
      if (ii.tk == 2) {
        o.x -= 0.05;
        o.d -= 0.1;
      }
      if (ii.dr == 1) {
        o.a += 0.2;
        o.wt[k] *= 1.15;
      }
      if (ii.dr == 2) {
        o.a -= 0.1;
        o.wt[k] *= 0.9;
      }
    }
  });
  return o;
}
// Bonus tactiques d'une équipe (consignes + rôles + schéma sans ballon), limités à ±4 points.
// Intensité globale des effets tactiques (occasions créées).
const TAC_K = 1.5;
function tacMods(t) {
  if (!t.ti && fsOf(t) == t.form && !t.lu.some((i) => t.sq[i] && (t.sq[i].re || t.sq[i].rs || t.sq[i].ii || t.sq[i].dp || t.sq[i].dl)))
    return { d: 0, m: 0, a: 0, c: 0, g: 0, f: 0, x: 0, wt: t.lu.map(() => 1) };
  const A = tiMods(t),
    B = roleFx(t),
    C = spShape(t),
    cl = (v) => Math.max(-5, Math.min(5, v));
  const X = (t.sty && TSTY[t.sty] && TSTY[t.sty].fx) || {};
  return {
    d: cl(A.d + B.d + C.d + (X.d || 0)),
    m: cl(A.m + B.m + C.m + (X.m || 0)),
    a: cl(A.a + B.a + C.a + (X.a || 0)),
    c: (A.c + (X.c || 0)) * TAC_K,
    g: A.g + B.g + (X.g || 0),
    f: A.f + B.f + C.f + (X.f || 0),
    x: A.x + B.x,
    wt: B.wt,
  };
}
// Choisit le rôle (avec ou sans ballon) d'un joueur depuis sa fiche.
function setRole(i, ph, v) {
  const p = me().sq[i];
  if (!p) return;
  if (v) p[ph] = v;
  else delete p[ph];
  save();
  render();
}
// Hauteur individuelle d'un joueur sur le terrain : −2 (très bas) à +2 (très haut). Sans effet pour le gardien.
function setDp(i, v) {
  const p = me().sq[i];
  if (!p || p.p == 'GK') return;
  v = Math.max(-2, Math.min(2, +v || 0));
  if (v) p.dp = v;
  else delete p.dp;
  save();
  render();
}
// Décalage latéral individuel : −1 (légèrement à gauche), 0, +1 (légèrement à droite).
function setDl(i, v) {
  const p = me().sq[i];
  if (!p || p.p == 'GK') return;
  v = Math.max(-1, Math.min(1, +v || 0));
  if (v) p.dl = v;
  else delete p.dl;
  save();
  render();
}
function stepDl(i, d) {
  const p = me().sq[i];
  if (p) setDl(i, (p.dl || 0) + d);
}
function stepDp(i, d) {
  const p = me().sq[i];
  if (p) setDp(i, (p.dp || 0) + d);
}
// Change une consigne individuelle d'un joueur (tacles, dribbles, liberté de mouvement).
function setPI(i, k, v) {
  const p = me().sq[i];
  if (!p) return;
  p.ii = p.ii || {};
  p.ii[k] = +v;
  save();
  render();
}
// Section « Rôle tactique » de la fiche d'un joueur (i = place dans l'effectif).
function roleSec(p, i) {
  ensure(p);
  const t = me(),
    li = t.lu.indexOf(i),
    sl = li >= 0 ? slots(t.form)[li] : null,
    cur = (ph) => p[ph] || '',
    opt = (ph) =>
      '<option value="">— Rôle standard —</option>' +
      [p.p, ...POS.filter((g) => g != p.p)]
        .map((g) => {
          const L = ROLES[g][ph == 're' ? 'ep' : 'sp'];
          return `<optgroup label="${{ GK: 'Gardien', DEF: 'Défenseur', MID: 'Milieu', ATT: 'Attaquant' }[g]}">${L.map((R, j) => (j ? `<option value="${g}:${j}" ${cur(ph) == g + ':' + j ? 'selected' : ''}>${R[0]} ${'★'.repeat(roleStars(p, R))}${'☆'.repeat(5 - roleStars(p, R))}</option>` : '')).join('')}</optgroup>`;
        })
        .join(''),
    desc = (ph) => {
      const r = rolePick(p, ph);
      if (!r) return '';
      const R = ROLES[r.g][ph == 're' ? 'ep' : 'sp'][r.i];
      return `<div class="mu" style="font-size:12px">${R[1]}${sl && sl != r.g ? ' <b>(inactif : ce rôle est celui d’un autre poste que sa place actuelle)</b>' : ''}</div>`;
    },
    ii = p.ii || {},
    sel = (k, arr) =>
      `<select onchange="setPI(${i},'${k}',this.value)">${arr.map((n, j) => `<option value="${j}" ${(ii[k] || 0) == j ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  return `<h2>Rôle tactique${hp('role')}</h2><div class="ctl"><label>Avec le ballon ${rolePk(i, 're', [p.p, ...POS.filter((g) => g != p.p)])}</label></div>${desc('re')}<div class="ctl"><label>Sans le ballon ${rolePk(i, 'rs', [p.p, ...POS.filter((g) => g != p.p)])}</label></div>${desc('rs')}<div class="ctl"><label>Tacles ${sel('tk', ['Normaux', 'Agressifs', 'Prudents'])}</label><label>Dribbles ${sel('dr', ['Normaux', 'Plus', 'Moins'])}</label><label>Mouvement ${sel('ro', ['Garde sa position', 'Libre de se déplacer'])}</label>${!sl || sl == 'GK' ? '' : `<label>Hauteur <select onchange="setDp(${i},this.value)">${['Très bas', 'Plus bas', 'Position de base', 'Plus haut', 'Très haut'].map((n, j) => `<option value="${j - 2}" ${(p.dp || 0) == j - 2 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Côté <select onchange="setDl(${i},this.value)">${['Légèrement à gauche', 'Position de base', 'Légèrement à droite'].map((n, j) => `<option value="${j - 1}" ${(p.dl || 0) == j - 1 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`}</div><div class="mu" style="font-size:12px">Les rôles agissent quand le joueur est titulaire à un poste du même type (ex. « Faux neuf » pour un attaquant). La jauge devant la liste indique l’adéquation avec ses attributs.</div>`;
}

// CRIS DE TOUCHE : un cri toutes les 10 minutes pendant un match. [nom, explication].
const SHOUTS = [
  ['Encourager', 'Équipe en difficulté : redonne du cœur (surtout si on est menés).'],
  ['Calmer', 'Réduit les fautes et les exclusions, mais baisse un peu l’attaque.'],
  ['Concentrer', 'Pour garder l’avantage : défense plus solide quand on mène.'],
  ['Électriser', 'Plus d’intensité en attaque, mais plus de fautes.'],
  ['Pas de pression', 'Détend l’équipe : tirs plus précis.'],
  ['En exiger plus', 'Équipe qui perd sans réagir : forte poussée offensive.'],
  ['Féliciter', 'Bonne dynamique : renforce le milieu quand on mène (mauvais effet si on perd).'],
  ['Réprimander', 'Risqué : réveille l’équipe si on est menés, mais peut la braquer.'],
];
// INTERRUPTEUR : false = les ajouts tactiques EN MATCH (cris de touche, conseils de l'adjoint, analyse) sont
// désactivés. Mettre false pour les couper.
const TAC_LIVE = true;
// Le joueur crie une consigne : effet pendant 10 minutes, puis 10 minutes d'attente.
function shoutDo(i) {
  const M = V.m;
  if (!TAC_LIVE || !M || M.done) return;
  const side = M.t.indexOf(me());
  if (side < 0) return;
  if (M.shl != null && M.min - M.shl < 10) return;
  M.shl = M.min;
  M.shm = { k: i, side, until: M.min + 10, r: Math.random() };
  M.lg.push(`${M.min}’ 📣 Cri de touche : ${SHOUTS[i][0]}`);
  render();
}
// Applique l'effet d'un cri aux forces d'équipe du moment (sh = forces des deux équipes).
function shoutFx(M, sh) {
  const w = M.shm;
  if (!w || M.min > w.until) return;
  const s = sh[w.side],
    lead = M.sc[w.side] - M.sc[1 - w.side];
  switch (w.k) {
    case 0:
      s.mid += lead < 0 ? 1.5 : 0.5;
      s.a += lead < 0 ? 1 : 0.3;
      break;
    case 1:
      s.a -= 0.5;
      break;
    case 2:
      s.d += lead > 0 ? 2 : 0.8;
      break;
    case 3:
      s.a += 1.5;
      s.mid += 0.8;
      break;
    case 4:
      s.mid += 0.5;
      s.pgb = (s.pgb || 0) + 0.03;
      break;
    case 5:
      s.a += lead <= 0 ? 2.2 : 0.4;
      s.mid += lead <= 0 ? 1.2 : 0.2;
      break;
    case 6:
      if (lead > 0) {
        s.mid += 1.2;
        s.d += 0.6;
      } else s.mid -= 1;
      break;
    case 7:
      if (lead < 0) s.a += w.r < 0.7 ? 3 : -2;
      else s.mid -= 1;
      break;
  }
}
// Multiplicateur de fautes appliqué à l'équipe D (consignes, rôles, cris).
function foulMul(M, D, T) {
  const m = tacMods(T);
  let v = 1 + m.x;
  const w = M.shm;
  if (w && w.side == D && M.min <= w.until) {
    if (w.k == 1) v *= 0.6;
    if (w.k == 3) v *= 1.2;
  }
  return Math.max(0.5, v);
}
// Encadré des cris de touche (affiché pendant le match).
function shoutBox(M) {
  if (!TAC_LIVE || M.done) return '';
  const side = M.t.indexOf(me());
  if (side < 0) return '';
  const wait = M.shl != null ? Math.max(0, 10 - (M.min - M.shl)) : 0;
  return `<div class="card"><b>Cris de touche</b>${hp('cris')}<div class="mu" style="font-size:12px">${!M.min ? 'Disponible après le coup d’envoi.' : wait ? 'Prochain cri possible dans ' + wait + ' min.' : 'Un cri toutes les 10 minutes.'}${M.shm && M.min <= M.shm.until ? ' En cours : <b>' + SHOUTS[M.shm.k][0] + '</b>.' : ''}</div><div class="ctl" style="flex-wrap:wrap">${SHOUTS.map((s, i) => `<button class="${M.shm && M.min <= M.shm.until && M.shm.k == i ? 'p' : ''}" ${wait || !M.min ? 'disabled style="opacity:.35;filter:grayscale(1);cursor:not-allowed"' : ''} title="${s[1]}" onclick="shoutDo(${i})">${M.shm && M.min <= M.shm.until && M.shm.k == i ? '✓ ' : ''}${s[0]}</button>`).join('')}</div></div>`;
}

// CONSEILS DE L'ADJOINT : toutes les 15 minutes, un conseil selon les statistiques du match.
function advTick(M) {
  if (!TAC_LIVE) return;
  const side = M.t.indexOf(me());
  if (side < 0 || M.min < (M.advN ?? 15)) return;
  M.advN = M.min + 15;
  const t = M.t[side],
    o = 1 - side,
    st = M.st,
    P = st.poss[0] + st.poss[1] || 1,
    pp = (st.poss[side] / P) * 100,
    lead = M.sc[side] - M.sc[o],
    tired = t.lu.map((li) => t.sq[li]).filter((p) => p && p.e < 50);
  let msg = 'Rien de particulier à signaler : continuez ainsi.';
  if (lead < 0 && M.min > 55) msg = 'On est menés : passez en mentalité offensive ou lancez un cri « En exiger plus ».';
  else if (lead > 0 && M.min > 60) msg = 'On mène : baissez le tempo, activez la perte de temps ou lancez un cri « Concentrer ».';
  else if (st.tir[o] >= st.tir[side] + 4) msg = 'L’adversaire se crée beaucoup d’occasions : abaissez la ligne défensive ou passez en bloc médian.';
  else if (pp < 42) msg = 'On subit au milieu : essayez des passes plus courtes ou une largeur plus étroite.';
  else if (st.tir[side] <= 1 && M.min > 30) msg = 'Peu d’occasions : élargissez le jeu ou encouragez les tirs de loin.';
  else if (st.fau[side] >= 6) msg = 'Trop de fautes : tacles modérés ou cri « Calmer ».';
  else if (tired.length) msg = tired[0].n + ' est fatigué : pensez à le remplacer.';
  M.lg.push(`${M.min}’ 💬 Adjoint : ${msg}`);
}

// ANALYSE DU MATCH : zones d'action (où se joue le ballon) et élan (qui domine, minute par minute).
function anaTick(M, at, shot) {
  if (!TAC_LIVE) return;
  const za = (M.za = M.za || [[0, 0, 0], [0, 0, 0]]),
    x = M.bx ?? 0.5,
    z = at == 0 ? (x > 0.66 ? 2 : x > 0.34 ? 1 : 0) : x < 0.34 ? 2 : x < 0.66 ? 1 : 0;
  za[at][z]++;
  (M.mm = M.mm || []).push([at, shot ? 1.5 : 0.3]);
}
// Encadré « Analyse » : zones d'action et courbe d'élan.
function anaBox(M) {
  const za = M.za;
  if (!TAC_LIVE || !za) return '';
  const s = (i) => za[i][0] + za[i][1] + za[i][2] || 1,
    z = (i, k) => Math.round((za[i][k] / s(i)) * 100),
    row = (l, k) =>
      `<div style="display:flex;align-items:center;gap:6px;font-size:12px"><b style="width:32px;text-align:right">${z(0, k)}%</b><span class="mu" style="flex:1;text-align:center">${l}</span><b style="width:32px">${z(1, k)}%</b></div>`,
    mm = M.mm || [],
    n = Math.ceil(mm.length / 5) || 1;
  let b = [];
  for (let i = 0; i < n; i++) b.push(mm.slice(i * 5, i * 5 + 5).reduce((a, [at, v]) => a + (at == 0 ? v : -v), 0));
  const mx = Math.max(1, ...b.map(Math.abs)),
    w = Math.min(14, 300 / Math.max(n, 18)),
    bars = b.map((v, i) => `<rect x="${i * w}" y="${v > 0 ? 30 - (v / mx) * 28 : 30}" width="${w - 1}" height="${(Math.abs(v) / mx) * 28}" fill="${v > 0 ? 'var(--ac)' : '#e8743b'}"/>`).join('');
  return `<div class="card anab" style="margin-top:8px"><b>Analyse</b>${hp('ana')}<div class="mu" style="font-size:12px;margin-top:4px">Zones d’action (où se joue le ballon)</div>${row('Zone défensive', 0)}${row('Milieu', 1)}${row('Zone offensive', 2)}<div class="mu" style="font-size:12px;margin-top:6px">Élan : ${M.t[0].name} (haut) / ${M.t[1].name} (bas)</div><svg viewBox="0 0 300 60" preserveAspectRatio="none" style="display:block;width:100%;height:60px"><line x1="0" x2="${n * w}" y1="30" y2="30" stroke="#8886"/>${bars}</svg></div>`;
}




// ======================================================================
// ONGLET TACTIQUE (présentation « terrain en perspective + panneau d'instructions »)
// À gauche : terrain en perspective où les réglages se voient (flèches, teintes, lignes), puis
// la grille des formations. À droite : onglets Équipe / Instructions / Rôles.
// Les réglages eux-mêmes sont ceux de INS, TSTY et ROLES ci-dessus (rien n'est changé au jeu).
// ======================================================================
const TVW = (r) => 0.66 + 0.34 * r;
const TVP = (u, r) => [50 + (u - 0.5) * 96 * TVW(r), 6 + r * 106];
const tvPt = (u, r) => TVP(u, r).map((n) => n.toFixed(1)).join(',');
const tvPoly = (a, at) => `<polygon points="${a.map(([u, r]) => tvPt(u, r)).join(' ')}" ${at}/>`;
const tvLn = (a, at) => `<polyline points="${a.map(([u, r]) => tvPt(u, r)).join(' ')}" fill="none" ${at}/>`;
// Flèche pleine (coordonnées de l'écran) : de (x1,y1) vers (x2,y2), épaisseur w.
function tvArr(x1, y1, x2, y2, w, c, o) {
  const dx = x2 - x1,
    dy = y2 - y1,
    L = Math.hypot(dx, dy) || 1,
    ux = dx / L,
    uy = dy / L,
    nx = -uy,
    ny = ux,
    hl = Math.min(L * 0.5, w * 2.2),
    hw = w * 2,
    bx = x2 - ux * hl,
    by = y2 - uy * hl,
    p = [
      [x1 + (nx * w) / 2, y1 + (ny * w) / 2],
      [bx + (nx * w) / 2, by + (ny * w) / 2],
      [bx + (nx * hw) / 2, by + (ny * hw) / 2],
      [x2, y2],
      [bx - (nx * hw) / 2, by - (ny * hw) / 2],
      [bx - (nx * w) / 2, by - (ny * w) / 2],
      [x1 - (nx * w) / 2, y1 - (ny * w) / 2],
    ];
  return `<polygon points="${p.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" fill="${c}" opacity="${o || 0.85}"/>`;
}
// Terrain en perspective (SVG) + calques qui illustrent l'onglet d'instructions ouvert.
function tvSvg(t, mode) {
  let s = '';
  for (let i = 0; i < 10; i++)
    s += tvPoly(
      [[0, i / 10], [1, i / 10], [1, (i + 1) / 10], [0, (i + 1) / 10]],
      `fill="${i % 2 ? '#3a9b44' : '#2f8a3a'}"`,
    );
  const ln = 'stroke="rgba(255,255,255,.75)" stroke-width=".55" stroke-linejoin="round"';
  s += tvLn([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], ln);
  s += tvLn([[0, 0.5], [1, 0.5]], ln);
  const circ = [];
  for (let a = 0; a <= 36; a++) circ.push([0.5 + 0.13 * Math.cos((a / 36) * 6.2832), 0.5 + 0.085 * Math.sin((a / 36) * 6.2832)]);
  s += tvLn(circ, ln);
  s += tvLn([[0.22, 0], [0.22, 0.16], [0.78, 0.16], [0.78, 0]], ln);
  s += tvLn([[0.22, 1], [0.22, 0.84], [0.78, 0.84], [0.78, 1]], ln);
  s += tvLn([[0.38, 0], [0.38, 0.06], [0.62, 0.06], [0.62, 0]], ln);
  s += tvLn([[0.38, 1], [0.38, 0.94], [0.62, 0.94], [0.62, 1]], ln);
  let o = '';
  const txt = (x, y, v) =>
    `<text x="${x}" y="${y}" font-size="3" font-weight="700" fill="#fff" stroke="rgba(0,0,0,.65)" stroke-width=".7" paint-order="stroke">${v}</text>`;
  if (mode == 'gen') {
    const m = t.m ?? 1,
      r0 = [0.34, 0.18, 0.02][m] ?? 0.18;
    o += tvPoly([[0, r0], [1, r0], [1, 1], [0, 1]], `fill="${['rgba(255,80,110,.32)', 'rgba(255,255,255,.10)', 'rgba(110,255,150,.24)'][m] || 'rgba(255,255,255,.1)'}"`);
    o += tvPoly([[0.5, 0.97], [0.06, r0 + 0.02], [0.94, r0 + 0.02]], 'fill="rgba(255,255,255,.14)"');
    const tp = tiV(t, 'tmp') - 1;
    if (tp) {
      // Tempo : flèche centrale plus longue et plus épaisse quand le jeu est rapide, plus courte et fine quand il est lent.
      const c = TVP(0.5, 0.8),
        e = TVP(0.5, tp > 0 ? 0.3 : 0.62);
      o += tvArr(c[0], c[1], e[0], e[1], tp > 0 ? 5 : 2.4, '#ffffff', 0.55);
    }
    const d = tiV(t, 'wid') - 2;
    if (d) {
      const Lg = 5 + Math.abs(d) * 5;
      for (const r of [0.14, 0.62]) {
        const y = TVP(0, r)[1],
          xl = TVP(0.01, r)[0],
          xr = TVP(0.99, r)[0];
        if (d > 0) {
          o += tvArr(xl + Lg, y, xl - 1, y, 3.4, '#2f6bff', 0.9) + tvArr(xr - Lg, y, xr + 1, y, 3.4, '#2f6bff', 0.9);
        } else {
          o += tvArr(xl - 1, y, xl + Lg, y, 3.4, '#2f6bff', 0.9) + tvArr(xr + 1, y, xr - Lg, y, 3.4, '#2f6bff', 0.9);
        }
      }
    }
  } else if (mode == 'att') {
    const dr = tiV(t, 'dir'),
      top = [0.62, 0.5, 0.38, 0.24, 0.07][dr];
    const a = TVP(0.5, 0.84),
      b = TVP(0.5, top);
    o += tvArr(a[0], a[1], b[0], b[1], 5.5, '#e6f21a', 0.8);
    if (tiV(t, 'wid') >= 3 || tiV(t, 'cro') == 2)
      for (const u of [0.1, 0.9]) {
        const c = TVP(u, 0.6),
          e = TVP(u, 0.1);
        o += tvArr(c[0], c[1], e[0], e[1], 3.6, '#ff8a2b', 0.85);
      }
    if (tiV(t, 'drb') == 2)
      for (const u of [0.3, 0.7]) {
        const c = TVP(u, 0.5),
          e = TVP(u + (u < 0.5 ? 0.06 : -0.06), 0.2);
        o += tvArr(c[0], c[1], e[0], e[1], 2.4, '#ff4b3a', 0.85);
      }
    if (tiV(t, 'atr') == 0) {
      const c = TVP(0.5, 0.72),
        e = TVP(0.5, 0.52);
      o += tvArr(c[0], c[1], e[0], e[1], 3, '#ffffff', 0.6);
    }
  } else if (mode == 'def') {
    o += tvPoly([[0, 0], [1, 0], [1, 1], [0, 1]], 'fill="rgba(255,140,30,.5)"');
    const dl = [0.8, 0.64, 0.48, 0.34][tiV(t, 'dl')] ?? 0.64,
      // Le pressing (Bas/Moyen/Haut) déplace aussi la ligne d'engagement ; elle reste toujours devant la ligne défensive.
      en = Math.max(0.08, Math.min(dl - 0.1, ([0.3, 0.52, 0.74][tiV(t, 'eng')] ?? 0.52) - ((t.pr ?? 1) - 1) * 0.1));
    o += tvLn([[0, en], [1, en]], 'stroke="#fff" stroke-width=".7" stroke-dasharray="2 1.4"');
    o += tvLn([[0, dl], [1, dl]], 'stroke="#ff3b2a" stroke-width="1"');
    const pa = TVP(0.03, en),
      pb = TVP(0.03, dl);
    o += txt(pa[0], pa[1] - 1.2, 'Début du pressing') + txt(pb[0], pb[1] - 1.2, 'Ligne défensive');
  }
  return `<svg class="tvs" viewBox="0 0 100 118" preserveAspectRatio="none">${s}<g class="tvo">${o}</g></svg>`;
}
// Petite icône de formation (points).
function tvDots(f) {
  const F = FORM[f];
  let d = '';
  for (let ty = 0; ty < 4; ty++) {
    const n = F[ty];
    for (let i = 0; i < n; i++) d += `<circle cx="${(((i + 1) / (n + 1)) * 40).toFixed(1)}" cy="${(27 - ty * 7.5).toFixed(1)}" r="1.9"/>`;
  }
  return `<svg viewBox="0 0 40 30" width="38" height="28" fill="currentColor">${d}</svg>`;
}
// Change de formation en plein match : les 7 joueurs sur le terrain restent les mêmes (aucun remplacement gratuit),
// ils sont simplement replacés au mieux selon leur poste dans la nouvelle formation.
function tvFormLive(f) {
  const t = me();
  if (!FORM[f] || f == t.form || !V.m || V.m.done) return;
  const cur = t.lu.slice(),
    sl = slots(f),
    left = cur.slice(1),
    out = [cur[0]];
  for (let k = 1; k < sl.length; k++) {
    let j = left.findIndex((i) => t.sq[i].p == sl[k]);
    if (j < 0) j = 0;
    out.push(left.splice(j, 1)[0]);
  }
  t.form = f;
  t.lu = out;
  try {
    capSync(t);
  } catch (e) {}
  const h = swH();
  h.u.length = 0;
  h.r.length = 0;
  V.sel = null;
  save();
  render();
}
function tvForm(f) {
  const t = me();
  t.form = f;
  autoLU(t);
  save();
  render();
}
const tvRow = (l, tip, ctl) => `<div class="tvrow" title="${tip || ''}"><span>${l}</span>${ctl}</div>`;
const tvSel = (arr, v, fn) => `<select onchange="${fn}">${arr.map((n, j) => `<option value="${j}" ${v == j ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
// ICÔNES DES STRATÉGIES ET DES CONSIGNES (pictogrammes dessinés pour le jeu, aux couleurs des Fluides).
const SVG0 = (b, c, sz) => `<svg class="stic" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
const STIC = [
  '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  '<circle cx="12" cy="12" r="3.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-28 12 12)"/>',
  '<path d="M12 12a1.6 1.6 0 0 1 3.2 0 4 4 0 0 1-8 0 6.6 6.6 0 0 1 13.2 0 9.2 9.2 0 0 1-3.2 7"/>',
  '<path d="M12 5l7 13H5z"/><circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="19" cy="18" r="1.8" fill="currentColor"/><circle cx="5" cy="18" r="1.8" fill="currentColor"/>',
  '<circle cx="6.5" cy="19" r="1.8"/><circle cx="13" cy="12.5" r="1.8"/><path d="M8 17.5l3.5-3.5M14.5 11L19 5.5m0 0h-4.5m4.5 0V10"/>',
  '<path d="M3 15c4-1 6-5 8-11 1 4 3 7 10 9-5 0-7 2-9 7-1-3-4-5-9-5z"/>',
  '<path d="M4 20L19 5m0 0h-7m7 0v7"/><path d="M4 13l7 7" opacity=".45"/>',
  '<path d="M2 16c3-6 5 6 8 0s5 6 8 0"/><path d="M16 6h5v5"/>',
  '<path d="M13 2L5 14h6l-1 8 9-13h-6z"/>',
  '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
  '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M3 12.5h18M8 7v11M16 7v11"/>',
];
// Couleur de chaque stratégie (même ordre que TSTY).
const STCL = ['#9aa3c7', '#4aa3ff', '#ff5a5f', '#35d6a0', '#2fd0c5', '#ffb703', '#ff8a2b', '#b78bff', '#e6f21a', '#5b8cff', '#8b93b8'];
const stIc = (i, sz = 30, c) => SVG0(STIC[i] || STIC[0], c || STCL[i] || '#9aa3c7', sz);
// Icônes des consignes (clé → tracé).
const INSIC = {
  dir: '<path d="M12 20V5m0 0l-5 5m5-5l5 5"/>', tmp: '<circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2M9 2h6"/>', wst: '<path d="M6 3h12M6 21h12M7 3c0 6 5 6 5 9s-5 3-5 9M17 3c0 6-5 6-5 9s5 3 5 9"/>',
  wid: '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>', cre: '<path d="M12 3l2.4 6.2L21 10l-5 4.3L17.5 21 12 17.6 6.5 21 8 14.3 3 10l6.6-.8z"/>', bu: '<path d="M5 20c0-8 4-8 7-12m0 0l-4 0m4 0l0 4M19 20c0-6-3-8-7-12"/>',
  gk: '<path d="M7 21v-8a2 2 0 0 1 4 0v-3a2 2 0 0 1 4 0v3a2 2 0 0 1 4 0v5a5 5 0 0 1-5 5H9a2 2 0 0 1-2-2z"/>', pf: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>', pat: '<path d="M4 12c0-5 8-5 8 0s8 5 8 0"/>',
  shd: '<circle cx="5" cy="19" r="2"/><path d="M7 17L20 4m0 0h-5m5 0v5"/>', cro: '<path d="M4 20c0-9 6-14 16-14m0 0l-4-3m4 3l-3 4"/>', drb: '<path d="M4 18c5 0 3-12 8-12s3 12 8 12"/>',
  atr: '<path d="M3 17l7-7 4 4 7-8m0 0h-5m5 0v5"/>', dtr: '<path d="M21 7l-7 7-4-4-7 8m0 0h5m-5 0v-5"/>', eng: '<path d="M3 8h18"/><path d="M3 15h18" stroke-dasharray="3 3"/><path d="M12 11v2"/>',
  dl: '<path d="M3 17h18"/><path d="M8 17l4-9 4 9"/>', dlb: '<path d="M4 8h16M4 16h16M9 11l3 -2 3 2"/>', tp: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>', tk: '<path d="M5 19l14-14M5 5l5 5M14 14l5 5"/>',
  trap: '<path d="M4 20L12 4l8 16zM9 15h6"/>', cx: '<path d="M12 21V8m0 0l-4 4m4-4l4 4M5 5h14"/>',
};
const insIc = (k) => SVG0(INSIC[k] || '<circle cx="12" cy="12" r="4"/>', 'currentColor', 20);
const tvIns = (t, k) => {
  const i = INS.find((x) => x.k == k);
  const v = tiV(t, k),
    n = i.o.length;
  // Curseur visuel : une pastille par option, la valeur choisie est éclairée ; le texte dessous donne son nom.
  const pips = `<div class="tvpips" role="radiogroup" aria-label="${i.l}">${i.o.map((o, j) => `<button type="button" role="radio" aria-checked="${v == j}" class="${v == j ? 'on' : ''}${j < v ? ' pre' : ''}" title="${o}" style="height:${10 + (n > 1 ? (j * 10) / (n - 1) : 0)}px" onclick="setIns('${k}',${j})"></button>`).join('')}</div>`;
  return `<div class="tvrow tvins" title="${i.h || ''}"><span class="tvil">${insIc(k)}<span><b>${i.l}</b><small>${i.o[v]}</small></span></span>${pips}</div>`;
};
function tvSub(k) {
  V.ts = k;
  render();
}
function tvTab(k) {
  V.tt = k;
  render();
}
// Onglet « Adversaire » de la tactique de match : formation de l'équipe adverse et fiche de chacun de ses joueurs.
function opView(M) {
  const o = M.t[0] === me() ? M.t[1] : M.t[0],
    oi = S.teams.indexOf(o),
    sl = slots(o.form),
    col = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' },
    row = (g) =>
      o.lu
        .map((li, k) => [li, k])
        .filter(([, k]) => sl[k] == g)
        .map(([li]) => {
          const p = o.sq[li],
            out = M.rd && M.rd[(M.t.indexOf(o) + '_' + o.lu.indexOf(li))] > M.min;
          return `<button class="opc${out ? ' out' : ''}" style="border-top:3px solid ${col[g]}" ${oi >= 0 ? `onclick="prof('lt','L${oi}|${p.n.replace(/'/g, "\\'")}')"` : ''} title="Voir la fiche de ${p.n}"><b>${p.o}</b><span>${p.n.split(' ').map((x, i, a) => (i < a.length - 1 ? x[0] + '.' : x)).join(' ')}</span></button>`;
        })
        .join('');
  return `<div class="tvh"><b>${o.em || ''} ${o.name}</b><span class="mu">Formation <b>${o.form}</b> · Note équipe <b>${nf1(teamNote(o))}</b></span></div><div class="opf">${['ATT', 'MID', 'DEF', 'GK'].map((g) => `<div class="opr">${row(g)}</div>`).join('')}</div><div class="mu" style="font-size:12px;margin-top:6px">Touchez un joueur pour ouvrir sa fiche.</div>`;
}
function tacView() {
  const t = me(),
    s = slots(t.form);
  V.tt = V.tt || 'eq';
  V.ts = V.ts || 'str';
  t.ln = t.ln || { d: 1, m: 1, a: 1 };
  const M = false,
    lv = V.tab == 'match' && !!V.m && !V.m.done,
    mode = V.tt == 'in' ? V.ts : '',
    sel = V.sel,
    cl = (i) => (sel === i ? 'sel ' : '');
  // ----- Terrain -----
  const bad = t.lu
    .map((li, k) => {
      const p = t.sq[li],
        q = pos(t, k, 0),
        d = ((q[0] - 0.05) / 0.63) * 0.8 + 0.1,
        r = 1 - d,
        [x, y] = TVP(q[1], r),
        mxl = Math.max(...FORM[t.form]),
        w = mxl >= 5 ? Math.min(12.5 + 3 * r, (88 / mxl) * TVW(r)) : 12.5 + 3 * r,
        col = p.p == 'GK' ? '#e0a526' : p.p == 'DEF' ? '#3b8fe8' : p.p == 'MID' ? '#2fb36b' : '#e5484d';
      return `<div class="tpc ${clsOf(li)}${p.p != s[k] ? 'bad' : ''}" data-i="${li}" draggable="true" onclick="pick(${li})" style="left:${x.toFixed(1)}%;top:${((y / 118) * 100).toFixed(1)}%;width:${w.toFixed(1)}%;border-top:3px solid ${col}${phBg(p)}">${capB(p)}<b class="o">${p.o}</b><span class="ps" style="color:${col}">${p.p}</span><span class="pn">${p.n
        .split(' ')
        .map((x, i, a) => (i < a.length - 1 ? x[0] + '.' : x))
        .join(' ')}</span>${pcx(p, k, 1, false)}<span class="pci" role="button" aria-label="Voir le profil" title="Voir la fiche du joueur" onclick="event.stopPropagation();prof('sq',${li})" ondragstart="event.preventDefault()">i</span>${sel === li && p.p != 'GK' ? `<span class="tdp u${(p.dp || 0) >= 2 ? ' off' : ''}" role="button" aria-label="Placer plus haut" title="Placer plus haut" onclick="event.stopPropagation();stepDp(${li},1)" ondragstart="event.preventDefault()"></span><span class="tdp d${(p.dp || 0) <= -2 ? ' off' : ''}" role="button" aria-label="Placer plus bas" title="Placer plus bas" onclick="event.stopPropagation();stepDp(${li},-1)" ondragstart="event.preventDefault()"></span><span class="tdp l${(p.dl || 0) <= -1 ? ' off' : ''}" role="button" aria-label="Décaler légèrement à gauche" title="Décaler légèrement à gauche" onclick="event.stopPropagation();stepDl(${li},-1)" ondragstart="event.preventDefault()"></span><span class="tdp r${(p.dl || 0) >= 1 ? ' off' : ''}" role="button" aria-label="Décaler légèrement à droite" title="Décaler légèrement à droite" onclick="event.stopPropagation();stepDl(${li},1)" ondragstart="event.preventDefault()"></span>` : ''}${p.dp ? `<span class="tdq ${p.dp > 0 ? 'u' : 'd'}"></span>` : ''}${p.dl ? `<span class="tdq ${p.dl > 0 ? 'r' : 'l'}"></span>` : ''}</div>`;
    })
    .join('');
  const cu = canUndo(),
    cr = canRedo();
  const left = `<div class="card tvc"><div class="tvh"><b>Terrain</b>${hp('tvf')}<span class="mu">Note équipe</span> <b>${nf1(teamNote(t))}</b></div><div class="tvp" data-z="st" onclick="if(!event.target.closest('.tpc')&&V.sel!=null){V.sel=null;V.lc=null;render()}">${tvSvg(t, mode)}${bad}<div class="tvi"><span>Formation</span><b>${t.form}</b></div></div>${lv ? '' : `<div class="tvg">${Object.keys(FORM).map((f) => `<button class="tvf${f == t.form ? ' on' : ''}" onclick="tvForm('${f}')" title="Formation ${f}">${tvDots(f)}<span>${f}</span></button>`).join('')}</div>`}<div class="ctl tvb">${lv ? '' : `<button onclick="autoLU(me());capSync(me());save();render()">Composition auto</button>`}<button onclick="undoSw()" ${cu ? '' : 'disabled'}>Annuler</button><button onclick="redoSw()" ${cr ? '' : 'disabled'}>Rétablir</button>${lv ? '' : `<button onclick="V.tab='club';V.eq='plan';render()" title="Enregistrer ou charger des compositions complètes">Préréglages</button>`}</div><div class="mu" style="font-size:12px;margin-top:6px">Touchez ou glissez deux joueurs pour les échanger. Fond rouge = hors de son poste. Le terrain illustre l’onglet d’instructions ouvert.</div></div>`;
  // ----- Panneau de droite -----
  const tabs = (a, cur, fn, cls) => `<div class="${cls}">${a.map(([k, l]) => `<button class="${cur == k ? 'on' : ''}" onclick="${fn}('${k}')">${l}</button>`).join('')}</div>`;
  let body = '';
  if (V.tt == 'eq') {
    const bn = benchOf(t),
      sw = V.swp || [],
      sg = V.sug || [],
      c2 = (i) => (V.sel === i ? 'sel ' : '') + (sw.includes(i) ? 'swp ' : '') + (sg.includes(i) ? 'sug ' : '');
    body = `<div class="tvh"><b>Remplaçants</b>${hp('tve')}${vwBtn()}</div>${V.swm ? `<div class="swm" id="swm">${V.swm}</div>` : ''}${fbar()}<div class="pg${V.vw == 'l' ? ' l' : ''}" id="zbn" data-z="bn" style="min-height:60px">${fl(bn.map((i) => [t.sq[i], i]))
      .map(([p, i]) => dgi(pc(p, c2(i), `pick(${i})`, pcx(p, -1, 0, false)), i))
      .join('')}</div><div class="mu" style="font-size:12px">Glissez un remplaçant sur un joueur du terrain (ou touchez les deux) pour les échanger.</div>${rvCard()}`;
  } else if (V.tt == 'fm' && lv) {
    body = `<div class="tvh"><b>Formation</b></div><div class="tvg">${Object.keys(FORM).map((f) => `<button class="tvf${f == t.form ? ' on' : ''}" onclick="tvFormLive('${f}')" title="Formation ${f}">${tvDots(f)}<span>${f}</span></button>`).join('')}</div><div class="mu" style="font-size:12px;margin-top:8px">Les 7 joueurs sur le terrain ne changent pas : ils sont replacés selon leur poste, sans consommer de remplacement.</div>`;
  } else if (V.tt == 'op' && lv) {
    body = opView(V.m);
  } else if (V.tt == 'ro') {
    body = `<div class="tvh"><b>Rôles des joueurs</b>${hp('tvr')}</div><div class="mu" style="font-size:12px;margin-bottom:6px">Colonne de gauche : rôle avec le ballon. Colonne de droite : rôle sans le ballon.</div>${t.lu
      .map((li, k) => {
        const p = t.sq[li],
          g = s[k],
          col = g == 'GK' ? '#e0a526' : g == 'DEF' ? '#3b8fe8' : g == 'MID' ? '#2fb36b' : '#e5484d',
          j = p.re ? +String(p.re).split(':')[1] || 0 : 0,
          R = ROLES[g].ep[j] || ROLES[g].ep[0];
        return `<div class="tvro" style="border-left:4px solid ${col}"><div><b style="color:${col}">${g}</b> <b>${p.n}</b><div class="mu" style="font-size:12px">${R[1]}</div></div><div class="tvrs">${roleRow(li, g)}</div></div>`;
      })
      .join('')}`;
  } else {
    const st = V.ts,
      L = t.ln,
      ln = (k, l, o) => tvRow(l, '', tvSel(o, L[k], `me().ln.${k}=+this.value;save();render()`));
    let r = '';
    if (st == 'str')
      r = `<div class="tvh"><b>Stratégie</b>${hp('sty')}</div><div class="tvsg">${TSTY.map(
        (x, i) =>
          `<button class="tvsc${(t.sty || 0) == i ? ' on' : ''}" onclick="setSty(${i})" style="--sc:${STCL[i]}"><span class="tvsi">${stIc(i, 34)}</span><b>${x.n}</b><span>${x.d}</span><i><u style="width:${[22, 55, 88][x.m]}%"></u></i><em><span>Défense</span><span>Attaque</span></em></button>`,
      ).join('')}</div>`;
    else if (st == 'sch') {
      const fo = fsOf(t),
        sp = spShape(t),
        cp = t.sq.findIndex((p) => isCap(p, t));
      r = `<div class="tvh"><b>Schémas et capitaine</b>${hp('tvq')}</div>${tvRow('Schéma avec le ballon', '', `<b>${t.form}</b>`)}${tvRow('Schéma sans ballon', 'La forme que prend l’équipe quand elle défend.', `<select onchange="setFo(this.value)">${Object.keys(FORM).map((f) => `<option ${f == fo ? 'selected' : ''}>${f}</option>`).join('')}</select>`)}<div class="mu" style="font-size:12px;padding:4px 12px">${fo != t.form ? (sp.d > 0 ? 'Défense renforcée' : sp.d < 0 ? 'Défense allégée' : 'Défense inchangée') + (sp.f ? ', repli fatigant.' : '.') : 'Même schéma avec et sans ballon.'}</div>${tvRow('Capitaine', 'Il porte le brassard et apporte un petit bonus à l’équipe.', `<select onchange="setCap(+this.value)">${t.sq.map((p, i) => `<option value="${i}" ${i == cp ? 'selected' : ''}>${p.n}</option>`).join('')}</select>`)}`;
    } else if (st == 'gen')
      r = `<div class="tvh"><b>Général</b>${hp('tvg')}</div>${tvIns(t, 'wid')}${tvRow('Mentalité', 'Défensive, équilibrée ou offensive.', tvSel(MENT, t.m ?? 1, 'me().m=+this.value;me().sty=0;save();render()'))}${tvIns(t, 'tmp')}${tvIns(t, 'cre')}${tvIns(t, 'wst')}`;
    else if (st == 'att')
      r = `<div class="tvh"><b>Attaque</b>${hp('tva')}</div>${['dir', 'bu', 'gk', 'pf', 'pat', 'shd', 'cro', 'drb', 'atr'].map((k) => tvIns(t, k)).join('')}${ln('m', 'Consigne du milieu', ['Passes courtes', 'Mixte', 'Jeu direct'])}${ln('a', 'Consigne de l’attaque', ['Tirs lointains', 'Équilibrée', 'En profondeur'])}`;
    else
      r = `<div class="tvh"><b>Défense</b>${hp('tvd')}</div>${tvRow('Pressing', 'Intensité du pressing : plus haut = plus de milieu mais plus de fatigue.', tvSel(['Bas', 'Moyen', 'Haut'], t.pr ?? 1, 'me().pr=+this.value;me().sty=0;save();render()'))}${['eng', 'dl', 'dlb', 'tp', 'tk', 'trap', 'cx', 'dtr'].map((k) => tvIns(t, k)).join('')}${ln('d', 'Consigne de la défense', ['Ligne basse', 'Équilibrée', 'Ligne haute'])}`;
    body = tabs([['str', 'Stratégie'], ['sch', 'Schémas'], ['gen', 'Général'], ['att', 'Attaque'], ['def', 'Défense']], st, 'tvSub', 'tvt2') + r;
  }
  const right = `<div class="card tvr">${tabs(lv ? [['fm', 'Formation'], ['eq', 'Équipe'], ['in', 'Instructions'], ['ro', 'Rôles'], ['op', 'Adversaire']] : [['eq', 'Équipe'], ['in', 'Instructions'], ['ro', 'Rôles']], V.tt, 'tvTab', lv ? 'tvt tv5' : 'tvt')}<div class="tvbd">${body}</div></div>`;
  return `<div class="tcv">${left}${right}</div>`;
}


// Polices de caractères par équipe (nom d'équipe stylisé).
const TFN = {
    'Snow Kids': ['Fredoka', 1],
    Akillian: ['Fredoka', 1],
    Shadows: ['Creepster', 1.1],
    Ombra: ['Creepster', 1.1],
    'Team Paradisia': ['Orbitron', 0.85],
    Paradisia: ['Orbitron', 0.85],
    Lightnings: ['Russo One', 1],
    Xzion: ['Russo One', 1],
    Wambas: ['Luckiest Guy', 0.95],
    'Wamba Prime': ['Luckiest Guy', 0.95],
    Rykers: ['Staatliches', 1.15],
    Unadar: ['Staatliches', 1.15],
    Xenons: ['Audiowide', 0.85],
    'Archipel Xenon': ['Audiowide', 0.85],
    'Tigres Rouges': ['Permanent Marker', 1],
    Pirates: ['Pirata One', 1.2],
    Elektras: ['Share Tech Mono', 0.95],
    Hektonïa: ['Share Tech Mono', 0.95],
    Cyclopes: ['Bangers', 1.1],
    Cyclopia: ['Bangers', 1.1],
    Technodroids: ['Michroma', 0.72],
    Technoïd: ['Michroma', 0.72],
    'Comet': ['Righteous', 1],
    Vega: ['Righteous', 1],
    Echoes: ['Righteous', 1],
    Nocturnes: ['Creepster', 1.1],
    Cumulus: ['Audiowide', 0.85],
    Magmas: ['Staatliches', 1.15],
    Lyrrhia: ['Righteous', 1],
    Quasars: ['Audiowide', 0.85],
    Hélion: ['Audiowide', 0.85],
    Titans: ['Staatliches', 1.15],
    Kéthros: ['Staatliches', 1.15],
    Mirage: ['Permanent Marker', 1],
    Sahélis: ['Permanent Marker', 1],
    'Vortex': ['Fascinate', 0.85],
    Kaldor: ['Fascinate', 0.85],
    Ysolde: ['Pacifico', 0.9],
  },
  TFL = ['Fredoka', 'Righteous', 'Bangers', 'Staatliches', 'Russo One', 'Audiowide'];
// Renvoie la police d'une équipe.
function tfont(n) {
  const f = TFN[n] || [TFL[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % TFL.length], 1];
  return `font-family:'${f[0]}','Bagel Fat One',sans-serif;font-size:${Math.round(19 * f[1])}px;font-weight:400`;
}
// RECETTE DE BILLETTERIE d'un match (selon confiance, prix du billet, stade).
const gate = () => {
  const f = Math.max(0.02, Math.min(1, 0.35 + S.conf / 150 - (S.tk - 10) * 0.035 - (S.st - 1) * 0.04));
  return Math.round((2000 * S.st * f * S.tk) / 100);
};
// Agrandit le stade (1 000 × niveau + 500 crédits).
function upS() {
  const c = S.st * 1000 + 500;
  if (S.st < 5 && S.cash >= c) {
    tx('Stade', -c);
    S.st++;
    mail('Stade agrandi', 'Votre stade passe au niveau ' + S.st + ' : ' + 2000 * S.st + ' places.');
    save();
    render();
  }
}
// Remplace automatiquement un titulaire blessé ou suspendu.
function fixLU(t) {
  const s = slots(t.form);
  let n = 0;
  t.lu.forEach((li, k) => {
    if (!t.sq[li].inj && !t.sq[li].sus) return;
    let b = -1,
      bs = -1;
    t.sq.forEach((x, i) => {
      if (!t.lu.includes(i) && !x.inj && !x.sus) {
        const v = x.o * (x.p == s[k] ? 1 : 0.75);
        if (v > bs) {
          bs = v;
          b = i;
        }
      }
    });
    if (b >= 0) {
      t.lu[k] = b;
      n++;
    }
  });
  if (n)
    mail(
      'Remplacements automatiques',
      n + ' joueur(s) blessé(s) ou suspendu(s) ont été remplacés dans votre composition.',
    );
}
// TEXTES DES BULLES D'AIDE « ? » : clé → texte. Pour modifier une aide, changer le texte ici. Les
// clés sont reliées aux écrans par le tableau HP ci-dessous.
const HELP = {
  mkr: 'Tire une nouvelle liste de joueurs disponibles. Maximum 2 actualisations entre deux matchs : la première coûte 50 crédits, la seconde 100.',
  cap: 'Le capitaine porte le brassard. Il apporte un petit bonus à toute l’équipe (plus il est expérimenté, plus il pèse) et aide dans les matchs serrés en fin de rencontre. S’il est blessé, suspendu ou sur le banc, l’équipe perd un peu de cohésion. Un nouveau capitaine met quelques matchs à s’imposer et l’ancien le vit mal. Par défaut, c’est le joueur le plus expérimenté et le mieux noté.',
  kit: 'Choisissez le motif et les couleurs du maillot de votre club. Il s’affiche sur les fiches de vos joueurs avec leur numéro et leur nom, et vos couleurs sont reprises sur le terrain.',
  m_new: 'Lance une nouvelle partie : choix du club, de la difficulté et des événements.',
  m_cont: 'Reprend votre carrière en cours là où vous l’avez laissée. La carte affiche votre club, la journée et les mails à traiter.',
  m_load: 'Charge l’une de vos 5 sauvegardes ou la sauvegarde automatique.',
  m_ed: 'Créez vos propres équipes, joueurs et Fluides (mods).',
  m_tuto: 'Le tutoriel complet du jeu, section par section, avec l’aide sur les mails et les adversaires.',
  m_vid:
    'Ouvre sur YouTube une vidéo d’environ 14 minutes, réalisée par @andsboy (tous droits réservés à son auteur), qui présente l’histoire et l’univers de Galactik Football, pour ceux qui découvrent la série. Lien externe, sans rapport avec le jeu.',
  heat: 'Carte de chaleur : les zones du terrain où le joueur évolue le plus (plus la couleur est vive, plus il y passe de temps). Elle se construit match après match selon son poste, sa position dans votre composition et son pied fort. Sans historique, c’est une projection d’après son poste.',
  foot: 'Le pied fort (gauche, droit ou ambidextre) influence légèrement le rendement : un joueur placé du côté de son pied fort gagne un peu, un joueur placé du côté opposé perd un peu. Les ambidextres n’ont aucun malus.',
  m_tour: 'Une visite guidée de l’interface, racontée par Clamp, étape par étape.',
  m_pref: 'Affichage des joueurs, événements et difficulté par défaut des nouvelles parties.',
  m_more: 'Autres accès : tutoriel, visite guidée, éditeur de mods, sauvegardes.',
  m_news: 'Les dernières nouveautés du jeu.',
  m_road: 'Les mises à jour prévues, présentées sous forme de chronologie.',
  ed_em:
    'Le symbole qui représente le club à côté de son nom (classement, calendrier, messages). Choisissez un modèle, puis changez la forme, le motif, le symbole et les couleurs.',
  m_fb: 'Signalez un bug ou proposez une idée. Le rapport inclut automatiquement la version du jeu.',
  sv_info: 'Où sont enregistrées vos parties et comment elles évoluent avec les mises à jour du jeu.',
  t_form: 'Vos jeunes talents : axe de formation, mentor et promotion.',
  t_stat: 'Bilan du club, joueurs, finances et records.',
  stat: 'Toutes les statistiques de votre partie : bilan du club, joueurs, finances et records. Elles sont enregistrées à chaque match.',
  eqt: 'Votre effectif. Cliquez sur un en-tête de colonne pour trier, sur un joueur pour ouvrir son profil. Les titulaires sont surlignés. Changez de vue (Général, Attributs, Saison) avec le menu.',
  eqi: 'Résumé de votre équipe : notes, âge, valeur, état de santé et de forme, nombre de joueurs par poste et meilleurs de la saison.',
  eqr: 'Analyse automatique de votre équipe : ce qui fonctionne et ce qui manque (profondeur par poste, âge, niveau, santé, moral).',
  plt: 'Composez votre équipe : touchez ou glissez un joueur pour l’échanger, choisissez une formation en bas, et consultez la profondeur de chaque poste à droite.',
  pfa: 'Les 9 attributs du joueur, notés sur 20 : vert = très bon, rouge = faible. Pour un gardien, « Finition » devient « Réflexes ». Ils influencent le jeu : Finition et Réflexes (tirs, arrêts), Passe et Vision (milieu, occasions), Tacle et Physique (défense, blessures), Vitesse et Dribble (attaque), Détermination (fin de match), Endurance (fatigue). Seul compte ce qui dépasse ou manque par rapport à la note générale : l’entraînement sur un axe le fait progresser.',
  pfmo: 'Le moral influence légèrement le rendement. Il monte avec les victoires et le temps de jeu, et baisse avec les défaites ou un rôle de remplaçant.',
  pfco: 'L’énergie du joueur : plus elle est basse, plus il rend moins bien et risque la blessure. Elle se récupère entre les matchs.',
  pffl: 'Le Fluide est la puissance du pouvoir du joueur. La compatibilité indique à quel point il s’accorde au Fluide de son équipe. Paradisia : multifluide, compatible avec tout. Pirates : aucun Fluide.',
  pfsu: 'Blessure en cours et nombre d’exclusions (5 minutes hors du terrain) cette saison.',
  pfi: 'Résumé de la situation du joueur : origine, Fluide, contrat, potentiel.',
  pfd: 'Évolution attendue de la note : le trait plein monte vers le potentiel jusqu’à environ 27 ans, le trait pointillé indique un joueur arrivé à maturité.',
  pfp: 'Les notes de ses 5 derniers matchs de championnat en tant que titulaire (sur 10).',
  pfs: 'Statistiques de la saison en cours.',
  tvf: 'Votre équipe sur le terrain. Touchez ou glissez deux joueurs pour les échanger. Sélectionnez un joueur pour le placer plus haut ou plus bas (flèches du haut et du bas) ou légèrement à gauche ou à droite (flèches des côtés) ; un clic dans le vide ou Échap désélectionne. Les flèches et les couleurs changent selon l’onglet d’instructions ouvert à droite.',
  tvs: 'Choisissez un style de jeu : il règle d’un coup la mentalité, le pressing et les consignes.',
  tvq: 'Le schéma sans ballon est la forme de l’équipe quand elle défend. Le capitaine porte le brassard.',
  tvg: 'Réglages généraux : largeur du jeu (flèches bleues), mentalité (teinte du terrain), tempo, créativité et perte de temps.',
  tva: 'Réglages d’attaque : la flèche jaune montre la directivité des passes, les flèches orange le jeu sur les ailes.',
  tvd: 'Réglages de défense : la ligne rouge montre la hauteur de la défense, la ligne pointillée le début du pressing.',
  tvr: 'Chaque titulaire a un rôle avec le ballon et un rôle sans le ballon. Les étoiles indiquent son adéquation.',
  tve: 'Les joueurs sur le banc. Glissez-en un sur un titulaire pour les échanger.',
  rc: 'Un joueur de champ peut apprendre un autre poste (défenseur, milieu ou attaquant). La durée dépend de l’âge ; « Repos » met la reconversion en pause et « Intensif » l’accélère. Pendant ce temps son malus au nouveau poste diminue chaque jour, et il est un peu moins efficace à son poste actuel. Les gardiens ne peuvent pas se reconvertir.',
  xp: 'La petite jauge sous la carte montre l’expérience du joueur : à 100 %, il gagne un niveau. L’entraînement la fait monter chaque jour (plus vite pour les jeunes et avec l’intensité Intensif).',
  pre: 'Un préréglage mémorise la formation, les titulaires, la mentalité, le pressing et les consignes. Vous pouvez le charger depuis le Planificateur ou juste avant le coup d’envoi d’un match.',
  eqs: 'Classement de vos joueurs sur la saison en cours pour la statistique choisie.',
  rk: 'Classements de la saison en cours, calculés après chaque match : buteurs, passeurs, arrêts, équipes…',
  ac: 'Vos jeunes talents progressent chaque jour. Choisissez leur axe de formation, confiez-les à un mentor puis promouvez-les dans l’équipe première.',
  m_inst:
    'Installe le jeu sur votre PC comme une application, avec sa propre fenêtre et son icône (Chrome ou Edge).',
  m_quit:
    'Sauvegarde automatiquement la partie en cours puis affiche un message d’au revoir (vous pouvez ensuite fermer l’onglet).',
  mbox: 'Messagerie du club. Chaque message vient d’une entité avec son adresse (conseil, service médical, presse, clubs, sponsors…). Dossiers : tous, non lus, suivis (⭐) et « à traiter » (messages qui attendent une réponse). Utilisez la recherche et les flèches pour parcourir.',
  orig: 'Fluide (Fl) = puissance du pouvoir spécial du joueur, liée à sa planète d’origine. Endurance = capacité physique à encaisser les matchs (attribut). Énergie = fraîcheur du moment (barre). Compatibilité = à quel point un joueur s’accorde à un Fluide : 100 % pour celui de son origine (et pour tous les Fluides si le joueur vient de Paradisia, qui a le multifluide ; les Pirates n’ont aucun Fluide), moins pour les autres, et d’autant plus difficile que l’équipe est forte. En changeant d’équipe, il peut rejeter le nouveau Fluide : léger malaise (🤢) quelques matchs si la compatibilité est d’au moins 30 %. En dessous de 30 %, le rejet devient sévère et progressif : le joueur peut être incapable de jouer plusieurs matchs, jusqu’à une saison entière vers 5 %.',
  chc: 'Vos crédits : l’argent du club. Gagnés à chaque match (droits TV, billetterie, primes, sponsors, boutique), dépensés en salaires, transferts, staff et travaux. Détail dans Finances.',
  chf: 'Confiance du conseil d’administration (0 à 100 %). Elle monte avec les victoires et les objectifs réussis, baisse avec les défaites et les objectifs manqués. Très basse, elle mène au licenciement. Détail dans Manager.',
  chd: 'Date du jeu. Les matchs ont lieu environ une fois par semaine : entre deux, avancez jour par jour.',
  go: 'Fait avancer le jeu jusqu’au prochain événement : le jour du match il devient « Jouer le match », sinon il avance les jours et s’arrête si une offre arrive.',
  w_mail: 'Vos 6 derniers messages. Touchez-en un pour le lire dans la boîte de réception.',
  w_club: 'Le prochain match du championnat avec sa date, ou votre joueur le plus fort.',
  w_table: 'Extrait du classement autour de votre club. Le bouton › ouvre le classement complet et la Coupe.',
  w_mkt:
    'Offres de clubs en attente de votre réponse et état de vos crédits. Le bouton › ouvre le marché des transferts et des prêts.',
  w_car:
    'Confiance du conseil, objectif de la saison, titres et difficulté. Le bouton › ouvre le palmarès et les succès.',
  w_gest:
    'Niveau de vos installations : stade, boutique, sponsors et staff. Le bouton › permet de les améliorer.',
  titu: 'Les 7 joueurs sur le terrain, dans l’ordre de la formation : gardien, défenseurs, milieux, attaquants.',
  remp: 'Les joueurs sur le banc. Glissez un remplaçant sur un titulaire (ou touchez les deux) pour les échanger. Double-clic : le joueur se place au meilleur endroit.',
  tnote:
    'Moyenne des notes générales des 7 titulaires. Elle se met à jour en direct à chaque changement, même pendant un match : vert si elle monte, rouge si elle baisse.',
  dnd: 'Glissez la carte d’un joueur sur un autre pour les échanger. Vert : poste adapté. Orange pointillé : hors de son poste, le joueur sera moins efficace (−25 %) mais vous restez libre de le faire. Pendant un match, les remplacements sont limités à 3.',
  sty: 'Choisir un style règle d’un coup la mentalité, le pressing et les consignes. Vous pouvez ensuite tout modifier à la main (le style devient « Personnalisé »). Le schéma sans ballon est la forme que prend l’équipe quand elle défend : s’il est très différent du schéma avec ballon, la défense est renforcée mais le repli fatigue.',
  cons: 'Les consignes d’équipe se règlent par phase : avec le ballon, transitions (juste après un gain ou une perte de balle) et sans le ballon. Chaque réglage a des avantages et des inconvénients. Passez la souris sur un réglage pour lire son effet.',
  role: 'Le rôle d’un joueur change sa façon de jouer, avec et sans le ballon (ex. Faux neuf, Piston, Gardien-libéro). Les étoiles indiquent son adéquation selon ses attributs. Les consignes individuelles ajoutent un peu de nuance. Le menu « Hauteur » (cinq niveaux) et le menu « Côté » (trois niveaux) décalent le joueur sur le terrain avec un léger effet sur le match : plus haut = plus d’attaque, moins de défense, plus de fatigue. Le numéro de maillot se choisit ici (1 à 99) ; si un coéquipier l’a déjà, vous échangez vos numéros.',
  cris: 'Un cri de touche toutes les 10 minutes, pour toute l’équipe. Son effet dure 10 minutes. À utiliser selon le score et l’état de l’équipe.',
  ana: 'Zones d’action : où se joue le ballon pour chaque équipe. Élan : qui domine, par tranches de 5 minutes (barres vers le haut pour l’équipe à domicile).',
  mstat: 'Statistiques en direct du match : possession, passes, tirs, tirs cadrés et fautes.',
  train:
    'L’intensité d’entraînement fait progresser la jauge vers +1 niveau. Intensif = plus vite mais plus de fatigue ; les jeunes progressent plus vite.',
  moral:
    'Humeur du joueur. Elle monte avec les victoires et le temps de jeu, baisse avec les défaites et le banc, et influence légèrement ses performances.',
  contrat:
    'Durée restante, salaire payé à chaque match et valeur marchande. Un contrat qui se termine fait partir le joueur.',
  prets:
    'Empruntez un joueur d’un autre club pour une durée limitée (frais payés d’avance) ou prêtez un remplaçant pour toucher des frais.',
  palm: 'Historique de vos saisons : classement final, points et vainqueur de la Coupe.',
  succ: 'Objectifs spéciaux à débloquer au fil des saisons.',
  ops: 'Vos 12 dernières opérations financières, avec la journée et le montant.',
  t_ov: 'Résumé de votre club en un coup d’œil.',
  t_mail: 'Messages du club, offres et événements.',
  t_tac: 'Formation, consignes par ligne, consignes individuelles et usage du Fluide.',
  t_club: 'Votre effectif, le prochain match et les réglages rapides.',
  t_cal: 'Toutes les journées de la saison avec les scores.',
  t_mkt: 'Recrutement, prêts, vente de joueurs et staff.',
  t_car: 'Confiance du conseil, palmarès et succès.',
  scout: 'Tactiques observées du club : formation avec et sans ballon, mentalité, pressing, style et principales consignes. Les clubs gérés par l’ordinateur gardent des consignes standard ; seule leur formation change. Aucun effet sur le match : c’est de l’information pour préparer votre composition.',
  adv: 'Cherchez un club ou un joueur et consultez la fiche complète de n’importe quel adversaire à tout moment : classement, forme, tactique, joueurs à surveiller et cartes des joueurs. Vous pouvez aussi cliquer sur un club dans le classement du Championnat.',
  t_table: 'Classement du championnat et Coupe de la Ligue.',
  t_gest: 'Stade, sponsors et boutique de produits dérivés.',
  t_fin: 'Revenus, dépenses et courbe de trésorerie.',
  t_match: 'Le match en direct avec terrain, commentaires et statistiques.',
  t_tuto: 'Tutoriel complet du jeu.',
  modes:
    'Galactik League : vous dirigez un club. Galactik Cup : vous dirigez la sélection d’une planète, dans un format Coupe du monde (4 poules, puis quarts, demies et finale), composée uniquement de joueurs nés sur cette planète (quel que soit leur club). Les deux : vous gérez un club et la sélection de sa planète, et basculez de l’un à l’autre ; la fatigue et les blessures sont partagées.',
  col: 'Couleur principale = fond et accent de l’interface quand vous dirigez cette équipe ; couleur secondaire = accents et boutons secondaires. Le contraste du texte est ajusté automatiquement. Évitez une couleur trop proche d’une autre équipe pour la reconnaître facilement.',
  df: 'Facile : adversaires −2 de niveau, revenus +20 %, salaires −15 %. Difficile : adversaires +2, revenus −15 %, salaires +15 %. Fixé à la création de la partie.',
  car1: 'Si la confiance du conseil tombe trop bas après un objectif manqué, vous êtes licencié. Une seule « dernière chance » est accordée par partie.',
  ord: 'Consignes par ligne : Ligne haute = plus de pression au milieu mais défense plus exposée ; Passes courtes = plus de possession, Jeu direct = plus d’attaque mais moins de ballon ; Tirs lointains = plus de tirs mais moins précis, En profondeur = moins de tirs mais plus dangereux.',
  ind: 'Consigne individuelle : Offensif = tire plus souvent mais couvre moins ; Défensif = tire peu et renforce la défense. Normal = comportement habituel.',
  fo: 'Consigne d’usage du Fluide : Économisé = environ 4 actions sur 10, plus fréquent en fin de match, peu de fatigue ; Modéré = environ 55 % des actions ; Abondance = environ 3 actions sur 4 mais vos joueurs se fatiguent plus vite. Le taux monte avec la mentalité offensive, le pressing haut et quand vous êtes menés, et baisse quand vous menez.',
  evt: 'Active ou désactive les événements rares inspirés de la série (descente de police, sabotages, météorites…). Ce choix est fixé à la création de la partie.',
  spn: 'Un sponsor verse des crédits à chaque match de championnat pendant la durée du contrat (10 matchs, 1 saison ou 2 saisons ; la durée d’une saison dépend du nombre d’équipes dans la Ligue, la liste indique les matchs restants). Maximum 3 sponsors ; les offres changent à chaque journée.',
  shp: 'Investir dans la boutique augmente les ventes de maillots, écharpes, mugs et posters à chaque match. Le revenu dépend aussi de la confiance du conseil.',
  fin2: 'Tous vos transferts et prêts de la saison : joueur, note, club concerné, montant et date. Les chiffres du bas résument vos dépenses et vos gains.',
  fin3: 'Chaque barre montre la part d’une catégorie dans le total des revenus ou des dépenses de la saison.',
  mt2: 'Les transferts entre clubs adverses de la saison : joueur, note, club de départ, club d’arrivée, montant et date.',
  chm: 'Le classement de la Ligue. La pastille verte marque les places dans l’objectif fixé par le conseil, la dorée le leader. « Forme » donne les 5 derniers résultats (vert = victoire, gris = nul, rouge = défaite).',
  chm2: 'Les meilleurs de votre club cette saison. La note moyenne porte sur les 5 derniers matchs.',
  rtn: 'Chaque titulaire reçoit une note sur 10 en fin de match, selon ses buts, passes décisives, arrêts, le résultat de l’équipe et les buts encaissés. L’étoile marque l’homme du match. La note moyenne des 5 derniers matchs apparaît sur la fiche du joueur.',
  mt3: 'Une offre comporte deux parties. Le club vendeur répond d’abord sous 2 à 4 jours sur le montant du transfert (accord, refus ou contre-offre). Ensuite le joueur étudie ses conditions : prime de signature, salaire par match, prime de titre (versée si vous gagnez le championnat) et durée du contrat. Il peut accepter, refuser ou demander un meilleur salaire ; chaque contre-proposition est à traiter sous 3 jours. Rien n’est payé avant l’accord final.',
  mt1: 'Les joueurs les mieux notés du marché en ce moment. Touchez une ligne pour l’ouvrir dans la recherche, ou l’étoile pour le suivre.',
  fin1: 'Bilan de la saison : revenus et dépenses par catégorie, et courbe de votre trésorerie match après match.',
  form: 'Disposition de vos 6 joueurs de champ devant le gardien (ex. 2-3-1 = 2 défenseurs, 3 milieux, 1 attaquant). Plus de défenseurs = plus solide ; plus d’attaquants = plus de buts mais plus de risques. 7 formations sont possibles, avec de 1 à 3 joueurs par poste.',
  ment: 'Votre état d’esprit : Défensive (ne pas encaisser), Équilibrée, Offensive (marquer). Modifie la force de votre attaque et de votre défense.',
  press:
    'Intensité avec laquelle vous récupérez le ballon. Haut = milieu plus fort, mais vos joueurs se fatiguent plus vite.',
  fedit:
    'Effet spécial de l’équipe. Choisissez une brique d’effet, puis personnalisez son nom et sa description.',
  lvl: 'Force générale de l’équipe, de 1 à 20. Sert à générer les joueurs et à fixer les objectifs.',
  squad:
    'Votre effectif. Les 7 joueurs surlignés sont titulaires, les autres sont remplaçants. Touchez deux joueurs pour les échanger.',
  legend:
    'Colonnes : poste (GK gardien, DEF défenseur, MID milieu, ATT attaquant) · nom (★ = personnage de la série, ✦ = joueur fictif, 🩹 = blessé) · ⚽ buts · Fl = Fluide du joueur · barre = énergie · gros chiffre = niveau.',
  res: 'Scores des autres matchs de la journée en cours.',
  staff: 'Employés qui améliorent votre club. Chaque niveau coûte plus cher (maximum niveau 5).',
  sc: 'Entraîneur : fait mieux progresser vos joueurs entre deux saisons.',
  sk: 'Kiné : vos joueurs récupèrent plus d’énergie après chaque match et se blessent moins.',
  sa: 'Analyste : donne un bonus à la force de votre attaque et de votre défense.',
  sy: 'Centre de formation : deux jeunes talents rejoignent l’effectif à chaque fin de saison ; plus le niveau est haut, meilleurs ils sont.',
  stade:
    'Plus le stade est grand, plus la recette des matchs à domicile augmente. Elle dépend aussi du prix du billet et de la confiance du conseil.',
  stad: 'Plus le stade est grand, plus il accueille de spectateurs et plus la recette à domicile augmente. Chaque niveau coûte plus cher que le précédent (5 niveaux).',
  tk: 'Un billet cher rapporte plus par spectateur mais remplit moins le stade.',
  mks: 'Tous les joueurs disponibles à cette saison : ceux des autres équipes et les agents libres. Les équipes qui arrivent plus tard dans la Ligue n’y figurent qu’à partir de leur saison. Cherchez un nom ou filtrez par équipe, Fluide, planète, poste et niveau. Touchez un joueur pour voir sa fiche, « Offre » pour négocier : le club vend rarement en dessous de la valeur du joueur.',
  rsv: 'La réserve accueille jusqu’à 15 joueurs de plus que votre effectif : ils ne sont ni titulaires ni remplaçants et ne jouent pas les matchs. Ils restent payés et peuvent être rappelés, échangés avec un joueur de l’effectif ou prêtés. Seuls les changements hors match sont possibles.',
  mkt: 'Joueurs libres à recruter ; le prix dépend de leur niveau. Effectif limité à 15 joueurs. La liste se renouvelle régulièrement.',
  sell: 'Vous pouvez vendre vos remplaçants (pas les titulaires) pour la moitié de leur valeur. Gardez au moins 11 joueurs.',
  next: 'Votre prochain match. Cliquez sur « Jouer la journée » : les autres matchs de la journée sont joués en même temps.',
  fluide:
    'Le Fluide est le pouvoir spécial de votre équipe : il se déclenche au hasard pendant les matchs, plus souvent si vos joueurs ont un bon Fl.',
  conf: 'Confiance du conseil d’administration (0-100 %). Elle monte avec les victoires et baisse avec les défaites.',
  obj: 'Place à atteindre au classement en fin de saison. Objectif réussi = prime de 1500 crédits.',
  spons: 'Crédits gagnés à chaque match grâce à un sponsor accepté par mail.',
  cred: 'Les crédits sont l’argent du club : gagnés à chaque match (80 de droits TV, 150 par victoire, billetterie, sponsor), dépensés en transferts, staff et stade.',
  pts: '3 points par victoire, 1 par nul, 0 par défaite. Classement par points, puis différence de buts.',
  diff: 'Buts marqués moins buts encaissés. Sert à départager les égalités.',
  j: 'Nombre de matchs joués.',
  sub: '3 remplacements possibles pendant un match : touchez un titulaire puis un remplaçant.',
  cup: 'Après le championnat, les 8 meilleures équipes jouent une coupe à élimination directe (tirs au but si égalité). Le vainqueur gagne 2000 crédits.',
  imp: 'Charge votre fichier Excel (onglet « Joueurs ») pour remplacer les effectifs des équipes.',
  ed: 'Créez vos propres équipes, joueurs et Fluides. Les changements s’appliquent à une nouvelle partie.',
  start:
    'Choisissez l’équipe que vous dirigerez. Plus son niveau est élevé, plus elle est forte, mais plus l’objectif du conseil sera exigeant.',
  modjson:
    'Texte contenant votre mod : copiez-le pour le partager, ou collez celui d’un ami puis cliquez sur « Charger ».',
  cal: 'Votre calendrier de la saison : les trois prochains matchs en haut, puis le mois en cours avec l’adversaire, domicile (D) ou extérieur (E), la compétition et le score des matchs joués. Les flèches changent de mois, « Aujourd’hui » revient à la date du jeu. La liste en bas détaille les matchs du mois.',
  pitch:
    'Terrain vu de dessus, aux couleurs de la planète du match. Les passes, tirs et arrêts affichés correspondent exactement au texte du journal. « Rejouer l’action » revoit le dernier tir au ralenti. Tout se règle dans Paramètres > Animation des matchs.',
  edteams: '« Éditer » modifie une équipe, « + Nouvelle équipe » en crée une.',
};
// Fabrique la petite bulle « ? » pour une clé d'aide.
// Les bulles d'aide « ? » restent entièrement visibles : jamais cachées derrière le menu ni coupées par les bords.
(function () {
  const place = (e) => {
    const h = e.target && e.target.closest ? e.target.closest('.hp,.gtw') : null,
      t = h && h.querySelector('.tip');
    if (!t) return;
    t.style.transform = 'translateX(-50%)';
    const r = t.getBoundingClientRect(),
      sb = document.querySelector('.sb'),
      sr = sb ? sb.getBoundingClientRect() : { right: 0 },
      minL = Math.max(8, sr.right > 0 && !sb.classList.contains('open') ? sr.right + 8 : 8),
      maxR = window.innerWidth - 8;
    let dx = 0;
    if (r.left < minL) dx = minL - r.left;
    else if (r.right > maxR) dx = maxR - r.right;
    if (dx) t.style.transform = `translateX(calc(-50% + ${Math.round(dx)}px))`;
  };
  document.addEventListener('mouseover', place);
  document.addEventListener('focusin', place);
})();
const hp = (k) => `<span class="hp" tabindex="0">?<span class="tip">${HELP[k]}</span></span>`;
// Tableau qui dit où coller les bulles « ? » : [texte repéré dans la page, clé d'aide].
const HP = [
  ['<h2>Origine et Fluide', 'orig'],
  ['Titulaires</span>', 'titu'],
  ['Remplaçants</div>', 'remp'],
  ['<b>Statistiques</b>', 'mstat'],
  ['<h2>Entraînement', 'train'],
  ['Moral : ', 'moral'],
  ['<h2>Contrat', 'contrat'],
  ['<h2>Prêts', 'prets'],
  ['<h2>Palmarès', 'palm'],
  ['<h2>Succès', 'succ'],
  ['<h2>Dernières opérations', 'ops'],
  ['<h2>Sponsors', 'spn'],
  ['<h2>Boutique', 'shp'],
  ['<label>Formation ', 'form'],
  ['<label>Mentalité ', 'ment'],
  ['<label>Pressing ', 'press'],
  ['<label>Fluide ', 'fedit'],
  ['<label>Niveau ', 'lvl'],
  ['<h2>Effectif', 'squad'],
  ['contenu fictif.', 'legend'],
  ['<h2>Résultats de la journée', 'res'],
  ['<h2>Staff', 'staff'],
  ['<span class="mu">progression en fin de saison</span>', 'sc'],
  ['<span class="mu">récupération</span>', 'sk'],
  ['<span class="mu">force d’équipe</span>', 'sa'],
  ['<span class="mu">jeunes talents en fin de saison</span>', 'sy'],
  ['<h2>Stade', 'stade'],
  ['(plus cher = moins de monde)</span>', 'tk'],
  ['<h2>Marché des transferts', 'mkt'],
  ['<h2>Vendre', 'sell'],
  ['Prochain match : ', 'next'],
  ['🌀 Fluide : ', 'fluide'],
  ['Confiance du conseil : ', 'conf'],
  ['Objectif :', 'obj'],
  ['Sponsor : ', 'spons'],
  [' crédits</b>', 'cred'],
  ['<th>Pts', 'pts'],
  ['<th>Diff', 'diff'],
  ['<th>J', 'j'],
  ['Remplacements restants : ', 'sub'],
  ['Note équipe</span>', 'tnote'],
  ['<span>Astuce :</span>', 'dnd'],
  ['<b>🏆 Coupe de la Ligue', 'cup'],
  [' (.xlsx)</button>', 'imp'],
  ['Éditeur de mods</h1>', 'ed'],
  ['Ligue Galactique.', 'start'],
  ['Mod (JSON à copier/coller pour partager)', 'modjson'],
  ['<h2>Équipes', 'edteams'],
];
// Insère automatiquement les bulles d'aide dans le HTML d'une page.
const addHelp = (h) => {
  if (V.tab == 'mkt')
    h = h.replace(/<h2>Stade<\/h2><div class="card">[\s\S]*?<\/div><\/div>(?=<h2>Staff)/, '');
  HP.forEach(([s, k]) => {
    h = h.split(s).join(s + hp(k));
  });
  if (V.vw == 'l') h = h.split('<div class="pg">').join('<div class="pg l">');
  return h;
};
// Textes du Tutoriel.
const TU = [
  [
    'But du jeu',
    'Vous dirigez un club de la Ligue Galactique : composez l’équipe, choisissez la tactique, gérez l’argent et visez l’objectif fixé par le conseil. Chaque « ? » du jeu explique l’élément à côté duquel il se trouve : survolez-le (ou touchez-le sur mobile).',
  ],
  [
    'Les onglets',
    'Club : effectif et prochain match. Tactique : formation et placement. Match : le match en direct. Cal. : calendrier et scores. ✉️ : messages du club. Transferts : offres, prêts et staff. Gestion : stade, sponsors et boutique. Finances : revenus et dépenses. Class. : classement et coupe. Adversaires : fiches et tactiques de tous les clubs. Aide : cette page.',
  ],
  [
    'Jouer une journée',
    'Dans Club, cliquez sur « Jouer la journée ». Les autres rencontres sont simulées, et votre match se lance en direct dans l’onglet Match. Appuyez sur « Coup d’envoi ». Le match dure environ 2 à 3 minutes et s’arrête à la mi-temps pour vous laisser changer de tactique ou de joueurs ; vous pouvez aussi le mettre en pause à tout moment.',
  ],
  [
    'L’effectif et les joueurs',
    'Chaque joueur a un poste (GK gardien, DEF défenseur, MID milieu, ATT attaquant), un niveau (le gros chiffre, plus il est haut mieux c’est), une énergie (la barre : elle baisse quand il joue, remonte quand il se repose) et un Fluide personnel (Fl). Un joueur placé hors de son poste perd 25 % de son niveau. La fiche du joueur montre ses notes de forme, ses statistiques, sa carte de chaleur et sa gestion (entraînement, rôle, capitaine, Fluide). La petite barre d’expérience indique quand il gagne un niveau, jusqu’à son potentiel. Les attributs influencent le match : Finition et Réflexes (tirs, arrêts), Passe et Vision (milieu), Tacle et Physique (défense), Vitesse et Dribble (attaque), Détermination (fin de match). L’axe d’entraînement choisi les fait progresser.',
  ],
  [
    'La tactique',
    'Le jeu se joue à 7 : 1 gardien et 6 joueurs de champ. La formation décrit la répartition (2-3-1 = 2 défenseurs, 3 milieux, 1 attaquant). La mentalité déplace la force entre attaque et défense. Le pressing renforce le milieu mais fatigue. Dans Tactique, touchez deux joueurs pour les échanger ; un joueur en rouge est hors de son poste. 7 formations sont possibles (de 1 à 3 joueurs par poste). Sur le terrain, touchez un joueur : ses flèches le placent plus haut ou plus bas (deux crans) ou légèrement à gauche ou à droite (un cran), joueur par joueur, avec un vrai effet sur le match ; un clic dans le vide ou la touche Échap désélectionne. Trois vues : Équipe (formation et placement), Instructions (stratégies générales, d’attaque et de défense, et schéma sans ballon) et Rôles. Les compositions favorites s’enregistrent comme préréglages dans le Planificateur. Dans Instructions, la « ligne d’engagement du pressing » fixe la hauteur à partir de laquelle l’équipe presse l’adversaire.',
  ],
  [
    'Le match en direct',
    'Le terrain vu de dessus montre votre équipe en violet et l’adversaire en orange. Le commentaire décrit chaque action. Vous pouvez mettre en pause, changer la vitesse, la mentalité, et faire 3 remplacements. Les remplacements se font en touchant ou en glissant un titulaire vers un remplaçant. Pendant la pause, « ⚙ Tactique » ouvre le terrain, les remplaçants, les instructions et les rôles pour modifier la tactique (la formation reste fixe, les remplacements restent limités à 3). Le commentaire garde les 7 dernières lignes et le bouton « Gérer l’équipe » vous amène aux joueurs. Un cri de touche est possible toutes les 10 minutes, l’adjoint donne un conseil toutes les 15 minutes et l’analyse montre où se joue le ballon.',
  ],
  [
    'Les Fluides',
    'Chaque équipe possède un pouvoir spécial différent, décrit dans l’onglet Club. Il se déclenche au hasard pendant le match et est annoncé dans le commentaire (✨ pour une attaque, 🌀 pour une défense). Dans Tactique ou pendant le match, réglez l’usage du Fluide : Économisé, Modéré ou Abondance.',
  ],
  [
    'Calendrier et classement',
    'Chaque équipe joue toutes les autres deux fois (aller-retour). Victoire = 3 points, nul = 1, défaite = 0. Le calendrier montre les scores des autres équipes. À la fin de la saison, cliquez sur « Nouvelle saison » dans Class.. Le calendrier se présente en grille par mois : touchez un jour pour voir son détail.',
  ],
  [
    'Les messages (✉️)',
    'Le club vous écrit : bienvenue, objectifs, offres de sponsors (à accepter ou refuser), blessures, réactions de la presse et du conseil, bilan de saison. Un chiffre indique les messages non lus. La messagerie fonctionne comme une boîte mail : dossiers (non lus, suivis ⭐, à traiter, corbeille), recherche, et des réponses au choix pour certains messages (conseil, service médical, presse, centre de formation). Un message qui attend une réponse porte le badge « Réponse requise » : tant que vous n’y avez pas répondu, le bouton « Continuer » devient « Répondre au mail » et la partie ne peut pas avancer. Après votre réponse, un encadré vert ou rouge résume ce qu’elle a changé.',
  ],
  [
    'Argent, transferts et staff',
    'Les crédits servent à recruter des joueurs, vendre des remplaçants et améliorer le staff (entraîneur, kiné, analyste, centre de formation). Pour recruter, vous déposez une offre dans Transferts : le club vendeur répond sous 2 à 4 jours, puis le joueur étudie vos conditions (prime de signature, salaire, prime de titre, durée). Les contre-propositions se traitent dans l’onglet Offres. Gagnez des crédits en jouant, en gagnant et grâce aux sponsors. L’onglet Base de joueurs de Transferts permet de chercher n’importe quel joueur du jeu et d’en consulter la fiche, sans pouvoir l’acheter.',
  ],
  [
    'Le stade',
    'Améliorer le stade augmente les places et donc la recette à domicile. Le prix du billet influence le remplissage : trop cher, le stade se vide.',
  ],
  [
    'Les blessures',
    'Après un match, des titulaires peuvent se blesser pour plusieurs journées (🩹). Ils sont remplacés automatiquement. Un bon kiné réduit les risques.',
  ],
  [
    'La coupe',
    'Une fois le championnat terminé, lancez la Coupe de la Ligue depuis Class. : les 8 meilleures équipes s’affrontent en élimination directe.',
  ],
  [
    'Éditeur de mods et import',
    'Sur l’écran de départ, l’éditeur permet de créer des équipes, des joueurs et des Fluides. Dans Club, le bouton d’import charge un fichier Excel de joueurs.',
  ],
  [
    'Consignes tactiques',
    'Dans Tactique, réglez des consignes par ligne (défense, milieu, attaque) et une consigne pour chacun de vos 7 titulaires (Normal, Offensif, Défensif). Elles changent l’équilibre entre possession, tirs et solidité.',
  ],
  [
    'Calendrier et jours sans match',
    'Les matchs ont lieu environ une fois par semaine, avec une pause hivernale. Entre deux matchs, avancez jour par jour (▶ Jour suivant) ou jusqu’au prochain match (⏩) : profitez-en pour le mercato, la tactique, l’entraînement et les résultats des autres clubs dans l’onglet Cal. L’énergie et la progression des joueurs avancent chaque jour.',
  ],
  [
    'Carrière, difficulté et marché',
    'L’onglet Carrière montre la confiance du conseil, le palmarès et les succès. Un objectif manqué avec une confiance très basse mène au licenciement (une dernière chance par partie). La difficulté (Facile, Normal, Difficile) se choisit à la création. Les autres clubs s’échangent aussi des joueurs : les transferts importants sont signalés par mail.',
  ],
  [
    'Fluide, origine et nausées',
    'Chaque joueur vient d’une planète et maîtrise parfaitement (100 %) le Fluide de son origine. Son profil ⓘ indique sa compatibilité avec les 14 Fluides. Quand il change d’équipe, il peut rejeter le Fluide du nouveau club : plus l’équipe est forte, plus c’est probable. Il a alors un léger malaise (🤢) quelques matchs, puis s’approprie ce Fluide. Sous 30 % de compatibilité, le rejet est sévère : le joueur peut être incapable de jouer pendant plusieurs matchs, et jusqu’à une saison entière vers 5 %. Le marché et les prêts affichent la compatibilité (🧬) de chaque joueur avec votre Fluide, avec un filtre pour ne garder que les plus compatibles. Deux origines font exception : les joueurs de Paradisia ont le multifluide (compatibles à 100 % avec tous les Fluides, sans aucun rejet) et ceux des Pirates n’ont aucun Fluide (pas de nausées, aucune compatibilité avec les autres Fluides, mais plus de physique, d’endurance et de détermination). Ne confondez pas : Fluide (pouvoir), Endurance (attribut physique) et Énergie (fraîcheur du moment).',
  ],
  [
    'Entraînement, moral et derbys',
    'Dans le profil ⓘ d’un joueur, choisissez l’intensité d’entraînement (Repos, Normal, Intensif) et l’axe à travailler : chaque journée fait avancer la jauge vers +1 niveau (les jeunes progressent vite, les plus de 31 ans déclinent). Le moral (😀 à 😠) monte avec les victoires et le temps de jeu, baisse avec les défaites et le banc, et influence la performance : un joueur mal dans sa peau peut demander à partir. Les derbys (Snow Kids–Tigres Rouges, Snow Kids–Shadows, Lightnings–Xenons, Technodroids–Vortex, Pirates–Shadows) ont plus d’occasions, plus de fautes et une billetterie à +40 %.',
  ],
  [
    'Offres sur vos joueurs',
    'Quelques fois par saison, un club propose d’acheter l’un de vos joueurs. Le joueur peut refuser de partir (titulaire heureux, club moins bon) ; s’il accepte, vous pouvez accepter l’offre, faire une contre-proposition (+20 % ou +40 %, que le club peut refuser) ou refuser. Gardez toujours au moins 11 joueurs.',
  ],
  [
    'Événements',
    ' Des événements rares inspirés de la série peuvent survenir avant ou pendant un match : descente de police chez les Pirates (match arrêté, 1 point chacun), sabotage des Ombres, pluie de météorites, panne d’énergie, invasion de supporters, joueur disparu, offre suspecte. Ils arrivent aussi dans les matchs des autres clubs : vous êtes alors prévenu par un mail d’actualité.',
  ],
  [
    'Sauvegardes',
    'Le bouton « Sauvegardes » (onglet Club ou écran de départ) ouvre 5 emplacements manuels et une sauvegarde automatique, mise à jour après chaque match. Sauvegarder sur un emplacement déjà utilisé demande confirmation. Les sauvegardes restent dans ce navigateur et ne fonctionnent qu’avec le mod utilisé lors de la partie.',
  ],
  [
    'Gestion et finances',
    'L’onglet Gestion est présenté comme une page web aux couleurs de votre club : Match (stade, prix du billet), Sponsors (jusqu’à 3 contrats de 10 matchs, 1 saison ou 2 saisons, chacun avec son logo) et Boutique de produits dérivés (maillots, écharpes, mugs, posters, à vos couleurs) avec 5 niveaux d’investissement chacun. Le staff (entraîneur, kiné, analyste, centre de formation) s’améliore dans Transferts, onglet Staff. L’onglet Finances détaille tous vos revenus et dépenses de la saison.',
  ],
  [
    'Les prêts',
    'Dans Marché > Prêts, empruntez un joueur d’un autre club pour 6, 12 ou 18 matchs (frais payés d’avance, salaire à votre charge). Depuis le profil ⓘ d’un remplaçant, proposez-le en prêt : vous touchez des frais. Avec une option d’achat, un joueur emprunté peut être acheté définitivement avant la fin du prêt ; vos joueurs prêtés peuvent être rachetés par le club preneur. À la fin du prêt, le joueur retourne à son club.',
  ],
  [
    'Profil et contrats',
    'Touchez le ⓘ d’une carte pour ouvrir le profil complet : attributs détaillés, statistiques de la saison, contrat (durée, salaire par match, valeur). Les salaires sont payés après chaque match. Vous pouvez prolonger un contrat (une tentative par saison, accord non garanti) ; un joueur dont le contrat expire quitte le club en fin de saison.',
  ],
  [
    'Contenu de la série et contenu fictif',
    'Le jeu mélange des éléments de Galactik Football et du contenu inventé pour lui. Le symbole ★ désigne un personnage de la série. Le symbole ✦ discret signale un contenu fictif : joueur, équipe (les Vortex, les Comet) ou événement imaginé pour le jeu. Survolez-le pour le rappeler. Sans symbole, un nom d’équipe vient de la série ; les statistiques sont toujours une adaptation du jeu.',
  ],
  [
    'Accessibilité et confort',
    'Dans le menu de gauche, « Texte » agrandit toute l’interface de 15 % et « Contraste » rend les textes secondaires et les bordures plus visibles (activé par défaut). Vos choix sont retenus dans ce navigateur. Les informations importantes ne reposent jamais sur la couleur seule : chaque poste a son sigle, chaque jauge a sa valeur chiffrée au survol et un état faible est signalé en rouge ET dans l’infobulle. Les « ? » sont plus faciles à toucher sur mobile, et le clavier (Tab, Entrée) fonctionne avec un contour de focus visible.',
  ],
  [
    'Le match plein écran',
    'Pendant un match, la vue 3D occupe tout l’écran. Le tableau en haut affiche les équipes, le score, le chrono et le logo de la compétition. Les boutons du bas ouvrent les panneaux Stats, Journal, Compo et Consignes. Avant le coup d’envoi, une fenêtre montre les compositions.',
  ],
  [
    'Conférences de presse',
    'Avant et après un match, la journaliste Callie Mystic vous pose une question dans une fenêtre. Les questions varient : résultat, buteurs, joueur du match, état de l’équipe. Votre réponse influence l’ambiance du club. Celle d’après-match s’affiche après « Continuer ».',
  ],
  [
    'Les adversaires',
    'L’onglet Adversaires liste tous les clubs, classés. Tapez un nom de club ou de joueur pour chercher. La fiche affiche le classement, la forme, la prochaine rencontre, la tactique (formation avec et sans ballon, mentalité, pressing, style, consignes), les joueurs à surveiller, la composition probable et les cartes des joueurs. Les clubs de l’ordinateur utilisent des consignes standard, seule leur formation change. Le même volet s’ouvre depuis le classement ou depuis l’icône de l’adversaire dans « Prochain match ».',
  ],
  [
    'Glossaire',
    'Niveau : force d’un joueur. Énergie : forme du moment. Fl : Fluide du joueur. Crédits : argent du club. Confiance : avis du conseil. Pressing : intensité de récupération du ballon. Titulaire : joueur sur le terrain. Remplaçant : joueur sur le banc.',
  ],
];
// Page « Aide » (tutoriel).
function tutoView() {
  const o = V.tu ?? 0;
  return (
    '<div class="card"><button class="p" onclick="tourGo(0)">🎓 Lancer la visite guidée</button></div>' +
    TU.concat(
      NBU()
        ? [
            [
              NB,
              'Duel 1 contre 1 dans une arène sphérique, les soirs sans match de votre équipe. Choisissez un champion dans votre effectif. À chaque échange, l’attaquant choisit un tir (puissant, placé, courbe) et le défenseur tente de le deviner ou d’obstruer (faute autorisée). Le premier à 3 buts gagne, le perdant est éliminé du tournoi. Trois duels par tournoi.',
            ],
          ]
        : [],
    )
      .map(
        ([t, b], i) =>
          `<div class="card" style="cursor:pointer" onclick="V.tu=${o == i ? -1 : i};render()"><b>${o == i ? '▾' : '▸'} ${i + 1}. ${t}</b>${o == i ? `<div style="margin-top:6px">${b}</div>` : ''}</div>`,
      )
      .join('')
  );
}
// Étapes de la visite guidée (16 étapes) racontées par Clamp : [page affichée, titre, texte]. Chaque étape ouvre la page
// dont elle parle ; {N} est remplacé par le nombre d'étapes.
const TOUR = [
  [
    'ov',
    'Bienvenue, manager !',
    'Salut, manager ! Moi, c’est Clamp, et c’est moi qui vais te faire visiter les lieux. Je te montre tout en {N} étapes, tu peux me quitter quand tu veux avec « Passer la visite ». Là, c’est l’Aperçu, ta page d’accueil : boîte de réception, prochain match, résultats, classement, finances… Ta mission : mener ton club à l’objectif fixé par le conseil.',
  ],
  [
    'ov',
    'Le menu',
    'Le menu, c’est ta carte du monde : chaque page du jeu est là. Le bouton « Réduire le menu », en bas, passe du mode classique (icônes et noms) au mode tiroir (icônes seules). Sur tablette, c’est un ruban d’icônes ; sur mobile, il s’ouvre avec le bouton ☰. Et retiens ça : les petits « ? » partout dans le jeu, survole-les ou touche-les, ils t’expliquent chaque élément.',
  ],
  [
    'mail',
    'La boîte de réception',
    'Ici arrive tout le courrier du club : conseil, sponsors, service médical, presse… Les messages non lus ont un point coloré et un fond teinté ; la liste défile pour retrouver les anciens. Attention, c’est important : quand un mail attend une réponse, il porte le badge « Réponse requise », et le bouton « Continuer » en haut à droite devient « Répondre au mail ». Tu ne peux pas avancer dans la partie tant que tu n’as pas répondu. Pas de panique, je t’y emmène directement !',
  ],
  [
    'club',
    'Ton équipe',
    'Voici ton effectif : 7 titulaires et des remplaçants. Sur chaque carte, le symbole 🧬 indique la compatibilité du joueur avec le Fluide de ton équipe (Paradisia est compatible avec tout grâce au multifluide, les Pirates n’ont pas de Fluide). Touche deux joueurs pour les échanger. Jusqu’à 15 joueurs peuvent être mis en réserve : ils ne jouent pas, mais tu peux les replacer hors match ou les prêter. Le bouton « i » d’une carte ouvre la fiche : numéro de maillot, rôle tactique, capitaine (il y en a toujours un sur le terrain). La barre d’expérience sous la carte : à 100 %, il gagne un niveau, jusqu’à son potentiel.',
  ],
  [
    'tac',
    'La tactique',
    'Ici, tu règles la formation, la mentalité et le pressing, tu choisis un style de jeu, puis tu affines les consignes d’équipe (passes, tempo, ligne défensive, ligne d’engagement du pressing…). Sur le terrain, un joueur en rouge est hors de son poste. Touche un joueur pour le monter, le descendre ou le décaler avec ses flèches ; un clic dans le vide le désélectionne. Tout se règle avant le coup d’envoi, et aussi pendant la pause du match avec le bouton « ⚙ Tactique ».',
  ],
  [
    'adv',
    'Les adversaires',
    'Un bon manager prépare ses matchs ! Dans l’onglet Adversaires, tu peux chercher un club ou même un joueur, puis consulter la fiche complète du club à tout moment : classement, forme récente, prochaine rencontre, tactique (formation avec et sans ballon, mentalité, pressing, style, consignes), joueurs à surveiller, composition probable et cartes de tous ses joueurs. Tu peux aussi cliquer sur un club dans le classement du Championnat, ou sur l’icône de l’adversaire dans l’encadré « Prochain match » de l’Aperçu.',
  ],
  [
    'ov',
    'Lancer un match',
    'Le bouton « Continuer », en haut, fait avancer le calendrier ; quand un match est prévu, il devient « Jouer le match ». L’Aperçu précise si tu joues à domicile ou à l’extérieur. Avant le coup d’envoi, la journaliste Callie Mystic, de la Galactik Post, peut te réserver une conférence de presse : tes réponses influencent le moral et la confiance du conseil. Les autres matchs de la journée sont simulés en même temps.',
  ],
  [
    'ov',
    'Le match en direct',
    'Le match s’ouvre en plein écran, sans les autres menus, pour que tu restes concentré. Appuie sur « Coup d’envoi » : tu peux mettre en pause, changer la mentalité ou l’usage du Fluide, et faire jusqu’à 3 remplacements. Les cris de touche (un toutes les 10 minutes), les conseils de l’adjoint et l’analyse du match t’aident à réagir. Les mails reçus pendant le match t’attendent après le coup de sifflet final.',
  ],
  [
    'mail',
    'Après le match',
    'Chaque joueur reçoit une note de match. Le club t’écrit : objectifs, offres de sponsors à accepter ou refuser, interviews (Callie te pose des questions sur le match, sur les buteurs, sur ton équipe…), blessures, réactions de la presse. Quand tu réponds, le résultat de ta réponse s’affiche dans un encadré bien visible, vert si c’est positif et rouge si ça coûte cher : tu comprends tout de suite ce que ton choix a changé.',
  ],
  [
    'cal',
    'Calendrier et classement',
    'Retrouve ici toutes les journées et les scores des autres équipes. Victoire = 3 points, nul = 1. À la fin de la saison, les 8 meilleures équipes jouent la Coupe de la Ligue.',
  ],
  [
    'mkt',
    'Les transferts',
    'Dans l’Aperçu des transferts, touche n’importe où dans un encadré (meilleur joueur disponible, joueur convoité…) pour aller directement dans l’onglet correspondant. Dans Recherche, touche un joueur pour déposer une offre : montant du transfert, prime de signature, salaire, prime de titre et durée du contrat. Le club vendeur répond sous quelques jours, puis le joueur étudie tes conditions ; l’onglet Offres suit chaque négociation. Rien n’est payé avant l’accord. La Base de joueurs te laisse consulter la fiche de tous les joueurs du jeu, sans achat.',
  ],
  [
    'table',
    'Championnat',
    'Le classement détaillé, la forme récente de chaque équipe, les leaders de la ligue et le suivi de tes prochains adversaires. Clique sur un club pour ouvrir sa fiche : composition, tactique et cartes de ses joueurs.',
  ],
  [
    'fin',
    'Finances',
    'Revenus, dépenses, courbe de trésorerie et principaux postes : de quoi surveiller ton budget, y compris les salaires et les primes promises à tes joueurs.',
  ],
  [
    'gest',
    'Gestion, boutique et stade',
    'Dépense tes crédits intelligemment : agrandis le stade, gère la boutique et les sponsors dans Gestion, et améliore le staff (entraîneur, kiné, analyste, formation).',
  ],
  [
    'car',
    'Ta carrière de manager',
    'Chaque match te rapporte de l’expérience. À chaque niveau, tu gagnes un point de compétence à investir dans l’arbre de l’onglet Manager : 2 branches au choix sur 5, des bonus passifs, et des personnages qui gagnent en confiance.',
  ],
  [
    'tuto',
    'Besoin d’aide ?',
    'Voilà, tu sais l’essentiel ! L’onglet Aide contient un tutoriel complet, et tu peux relancer cette visite quand tu veux. Le jeu se sauvegarde automatiquement dans ton navigateur, mais exporte une sauvegarde de temps en temps. Bon match, manager !',
  ],
];
// Passe à une étape de la visite guidée.
function tourGo(i) {
  if (i >= TOUR.length) {
    tourEnd();
    return;
  }
  V.tour = i;
  V.tab = TOUR[i][0];
  // Retire les notifications en cours : elles masqueraient l'encadré de la visite.
  NQ.length = 0;
  document.querySelectorAll('.mtoast').forEach((e) => e.classList.remove('on'));
  render();
}
// Termine la visite guidée.
function tourEnd() {
  V.tour = null;
  try {
    localStorage.setItem('gmtour', '1');
  } catch (e) {}
  V.tab = 'ov';
  render();
}
// Encadré de la visite guidée.
function tourBox() {
  const i = V.tour;
  if (i == null) return '';
  const t = TOUR[i][1],
    x = TOUR[i][2].replace('{N}', TOUR.length);
  return `<div class="tourg"></div><div class="card tourb"><div class="tourh"><div class="toura"><svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#3a1a6a"/><circle cx="50" cy="42" r="20" fill="#d9a066"/><path d="M26 48l-10-22 18 8 6-20 14 14 14-14 6 20 18-8-10 22z" fill="#9a9aa4"/><path d="M10 100c4-26 20-36 40-36s36 10 40 36z" fill="#4b2d6e"/></svg><img src="img/clamp.jpg" alt="Clamp" onerror="this.remove()"></div><div class="tourn"><b>Clamp</b><span class="mu">Ton guide · étape ${i + 1}/${TOUR.length}</span></div></div><div class="tourt"><b>${t}</b><div style="margin:4px 0 8px">${x}</div></div><div class="ctl">${i ? `<button onclick="tourGo(${i - 1})" aria-label="Étape précédente">← <span class="tl2">Précédent</span></button>` : ''}<button class="p" onclick="tourGo(${i + 1})">${i == TOUR.length - 1 ? 'Terminer' : 'Suivant →'}</button><button onclick="tourEnd()">Passer<span class="tl2"> la visite</span></button></div></div>`;
}
// Carte joueur TOUJOURS en mode « carte » (même si l'affichage est en liste).
function pcC(...a) {
  const o = V.vw;
  V.vw = 'c';
  try {
    return pc(...a);
  } finally {
    V.vw = o;
  }
}
// Jauge d'expérience d'un joueur de votre équipe : à 100 %, il gagne un niveau.
function xpB(p, c) {
  try {
    if (!S || !me().sq.includes(p)) return '';
    const mx = p.o >= ptCap(p),
      v = mx ? 100 : Math.max(0, Math.min(100, Math.round(p.xp || 0)));
    return `<div class="pxp${c ? ' ' + c : ''}${mx ? ' mx' : ''}" title="${mx ? (p.o >= 95 ? 'Niveau maximum atteint' : 'Potentiel atteint : plus de progression possible') : 'Expérience : ' + v + ' % avant le prochain niveau'}"><i style="width:${v}%"></i></div>`;
  } catch (e) {
    return '';
  }
}
// Carte d'un joueur (ou ligne si le mode « liste » est actif).
function pc(p, cls, onclk, extra) {
  if (V.vw == 'l') return prow(p, cls, onclk, extra);
  const col = p.p == 'GK' ? '#e0a526' : p.p == 'DEF' ? '#3b8fe8' : p.p == 'MID' ? '#2fb36b' : '#e5484d';
  const kd =
      onclk[0] == 'm'
        ? onclk[5] == 'b'
          ? 'mk'
          : onclk[5] == 'l'
            ? 'lo'
            : 'sq'
        : onclk.startsWith("nk('rc'")
          ? 'mk'
          : onclk.startsWith("nk('cv'")
            ? 'nv'
            : onclk.startsWith('pr')
              ? 'ed'
              : 'sq',
    ix = onclk.split(',').pop().replace(/\D/g, '');
  return `<div class="pc ${cls}${p.pr ? ' prs' : p.c ? ' chr' : ''}" onclick="${onclk}" style="border-top:4px solid ${col};position:relative${phBg(p)}"><span class="pci" role="button" aria-label="Voir le profil" title="Voir le profil du joueur" onclick="event.stopPropagation();prof('${kd}',${ix})">i</span><div class="o">${p.o}</div>${capB(p)}<div class="ps" style="color:${col}">${p.p}${p.c ? ' ★' : fp(p)}</div><div class="pn${p.pr ? ' prn' : p.c ? ' chn' : ''}">${p.n
    .split(' ')
    .map((w, i, a) => (i < a.length - 1 ? w[0] + '.' : w))
    .join(
      ' ',
    )}</div><div class="gp">${gg(p.e, { size: 33, fs: 32, c: '#2fd0c5', tt: 'Endurance' })}${gg(p.f, { size: 33, fs: 32, c: '#b78bff', tt: 'Fluide' })}</div><div class="mu">⚽${p.g}${p.nz ? ' 🤢' : ''}${p.inj ? ' 🩹' + p.inj : ''}${p.sus ? ' · susp. ' + p.sus : ''}${p.ln ? ' 🔁' + p.ln.left : ''}</div>${xpB(p)}${extra || ''}</div>`;
}

// Achat/prêt/option sur un joueur : premier clic = confirmer, deuxième = valider.
function mk2(a, i) {
  const k = a + i;
  if (a == 'b' || V.mk == k || !ST.cf) {
    V.mk = null;
    a == 'b' ? ofOpenN((S.mkt[i] || {}).n) : a == 'l' ? borrow(i) : a == 'o' ? takeS(i) : sell(i);
  } else {
    V.mk = k;
    render();
  }
}
// Les neuf attributs d'un joueur (Vitesse, Finition…) et la table des salaires.
const AT = [
    'Vitesse',
    'Finition',
    'Dribble',
    'Passe',
    'Vision',
    'Tacle',
    'Physique',
    'Détermination',
    'Endurance',
  ],
  // Profil de chaque poste : bonus/malus par attribut (même ordre que AT). Plus l'écart est grand, plus
  // le poste est marqué : un défenseur excelle en Tacle/Physique, un milieu en Passe/Vision/Endurance,
  // un attaquant en Finition/Vitesse/Dribble. (Pour un GK, « Finition » est affiché comme « Réflexes ».)
  WT = {
    GK: [-4, 6, -7, -3, 1, -8, 2, 2, 0],
    DEF: [-1, -8, -5, -3, -2, 6, 5, 2, 1],
    MID: [0, -4, 2, 6, 6, -3, -1, 1, 3],
    ATT: [5, 7, 4, -3, -1, -8, 0, 1, 0],
  },
  sal = (p) => p.sw || Math.max(2, Math.round((p.o * p.o) / 300));
// Calcule les attributs détaillés d'un joueur à partir de son nom (valeurs stables).
function attrs(p) {
  let h = 0;
  for (const c of p.n) h = (h * 31 + c.charCodeAt(0)) % 9973;
  const pir = fluK(p) == 'none'; // compensation Pirates : plus physiques, endurants et déterminés
  return AT.map((a, i) => {
    h = (h * 37 + 17) % 9973;
    return Math.max(
      3,
      Math.min(20, Math.round(p.o / 5 + (WT[p.p] || WT.MID)[i] * 0.65 + Math.round(((h % 7) - 3) * 0.75) + ((p.ab || {})[i] || 0) + (pir && i >= 6 ? 2 : 0))),
    );
  });
}
// INFLUENCE DES ATTRIBUTS SUR LE JEU. La note générale compte déjà dans la force de l'équipe ; les attributs
// ajoutent l'écart propre au joueur (« atDev » = attribut réel moins ce que sa note laisse attendre pour son
// poste). Un joueur qui s'est entraîné sur un axe, ou naturellement doué dans un domaine, joue donc différemment.
//   Finition / Réflexes : réussite des tirs, arrêts du gardien · Passe, Vision : milieu et occasions créées
//   Tacle, Physique : défense (et moins de blessures) · Vitesse, Dribble : attaque · Détermination : fin de match.
function atDev(p) {
  const at = attrs(p),
    W = WT[p.p] || WT.MID,
    b = p.o / 5;
  return at.map((v, i) => v - (b + W[i] * 0.65));
}
const atCl = (v, m) => Math.max(-m, Math.min(m, v));
// Effets d'équipe des attributs des 7 titulaires (calculés à chaque tranche de match).
function atFx(t) {
  const s = slots(t.form),
    L = t.lu.map((li, k) => [t.sq[li], s[k]]).filter(([p]) => p),
    G = (g) => L.filter(([, x]) => x == g).map(([p]) => atDev(p)),
    av = (A, f) => (A.length ? A.reduce((z, d) => z + f(d), 0) / A.length : 0),
    M = G('MID'),
    D = G('DEF'),
    A = G('ATT'),
    all = L.map(([p]) => atDev(p));
  return {
    m: atCl(0.8 * av(M, (d) => (d[3] + d[4]) / 2), 2.5),
    d: atCl(0.8 * av(D, (d) => d[5] * 0.7 + d[6] * 0.3), 2.5),
    a: atCl(0.8 * av(A, (d) => (d[0] + d[2]) / 2), 2.5),
    c: atCl(0.004 * av(M.concat(A), (d) => d[4]), 0.015),
    det: av(all, (d) => d[7]),
  };
}
// Complète la fiche d'un joueur (âge, contrat, potentiel) s'il manque des champs.
function ensure(p) {
  if (fluK(p) == 'none') p.f = 0; // les Pirates n'ont pas de Fluide
  if (p.age == null) {
    let h = 0;
    for (const c of p.n) h = (h * 17 + c.charCodeAt(0)) % 997;
    p.age = 18 + (h % 16);
    p.ct = 1 + (h % 4);
    p.mp = p.mp || 0;
  }
  if (p.ct == null) p.ct = 3;
  if (p.pt == null) {
    const v = potOf(p);
    if (v) {
      p.pt = v;
      p.pd = 1;
    }
  }
}
// ÂGE LIMITE du potentiel : jusqu'à cet âge, un joueur peut encore progresser jusqu'à son potentiel.
const PTA = 29;
// Potentiel d'un joueur (note qu'il peut atteindre). S'il n'en a pas, il est déduit de son nom et de son âge :
// plus il est jeune, plus la marge est grande ; au-delà de PTA ans, plus de marge.
function potOf(p) {
  if (p.pt != null) return p.pt;
  let h = 0;
  for (const c of p.n) h = (h * 17 + c.charCodeAt(0)) % 997;
  const a = p.age ?? 18 + (h % 16);
  if (a > PTA || p.o >= 95) return 0;
  const g = Math.max(1, Math.round((30 - a) * 0.85 + ((h * 7 + 3) % 8) - 1.5));
  return Math.min(96, p.o + g);
}
// Note maximale qu'un joueur peut encore atteindre par l'entraînement.
const ptCap = (p) => (p.pt && p.age <= PTA ? Math.min(95, p.pt) : p.o);
// Ouvre la fiche détaillée d'un joueur.
function prof(k, i) {
  V.pf = { k, i };
  V.pn = '';
  render();
}
// Prolonge le contrat d'un joueur.
function renew(i, y) {
  const p = me().sq[i];
  ensure(p);
  const c = sal(p) * y * 8;
  if (p.rn || p.ct + y > 5 || S.cash < c) return;
  p.rn = 1;
  if (Math.random() < Math.max(0.2, Math.min(0.95, 0.45 + S.conf / 150 - p.o / 200))) {
    tx('Contrats', -c);
    p.ct += y;
    V.pn = '✅ ' + p.n + ' prolonge de ' + y + ' an(s).';
  } else V.pn = '❌ ' + p.n + ' refuse de prolonger.';
  save();
  render();
}
// Vieillissement : un joueur jeune progresse, un joueur âgé baisse.
function ageUp(p) {
  const a = p.age,
    cap = p.pt && a <= PTA ? Math.max(p.pt, p.o) : 95;
  if (p.pt && p.o < p.pt && a <= PTA)
    p.o = Math.min(p.pt, p.o + 1 + (a <= 22 && Math.random() < 0.4 ? 1 : 0));
  if (a < 30 && !(p.pt && a <= PTA)) {
    if (Math.random() < Math.min(0.6, 0.2 + (a - 18) * 0.04)) p.o = Math.min(cap, p.o + 1);
  } else if (a > 30 && Math.random() < Math.min(0.25, 0.08 + (a - 31) * 0.02)) p.o = Math.max(40, p.o - 1);
}
// Fin de saison : les contrats baissent d'un an ; les joueurs sans contrat partent.
function contracts() {
  S.teams.forEach((t, ti) => {
    t.sq.forEach((p) => {
      ensure(p);
      p.ct--;
      p.rn = 0;
      p.rq = 0;
      p.age++;
      ageUp(p);
    });
    try {
      rtTeam(t, ti);
    } catch (e) {}
    if (ti != S.t) {
      t.sq.forEach((p) => {
        if (p.ct <= 0) p.ct = 1 + ((Math.random() * 3) | 0);
      });
      return;
    }
    const keep = t.sq.filter((p) => p.ct > 0);
    if (keep.length < 11)
      t.sq
        .filter((p) => p.ct <= 0)
        .sort((a, b) => b.o - a.o)
        .slice(0, 11 - keep.length)
        .forEach((p) => {
          p.ct = 1;
        });
    const left = t.sq.filter((p) => p.ct <= 0);
    if (left.length) {
      mail('Fins de contrat', left.map((p) => p.n).join(', ') + ' quitte(nt) le club : contrat terminé.');
      left.forEach((p) => rmP(t, p));
    }
    const last = t.sq.filter((p) => p.ct == 1);
    if (last.length)
      mail(
        'Contrats à renouveler',
        'Dernier an de contrat : ' +
          last.map((p) => p.n).join(', ') +
          '. Ouvrez leur profil (ⓘ) pour négocier.',
      );
  });
}
// Filtre et tri de la liste de joueurs (poste, origine, niveau, nom).
function fl(a) {
  const f = V.fl || { p: '', q: '', s: 'o' };
  return a
    .filter(
      ([p]) =>
        (!f.p || p.p == f.p) &&
        (!f.o || planet(p.og || '') == f.o) &&
        (!f.c || !S || compat(p, me().name) >= f.c) &&
        (!f.q || p.n.toLowerCase().includes(f.q.toLowerCase())),
    )
    .sort((x, y) =>
      f.s == 'n'
        ? x[0].n.localeCompare(y[0].n)
        : f.s == 'c' && S
          ? compat(y[0], me().name) - compat(x[0], me().name)
          : f.s == 'e'
            ? (y[0].e ?? 100) - (x[0].e ?? 100)
            : y[0].o - x[0].o,
    );
}
// Barre de filtres au-dessus des listes de joueurs.
function fbar() {
  const f = V.fl || (V.fl = { p: '', q: '', s: 'o' });
  return `<div class="ctl" style="margin:6px 0"><select onchange="V.fl.p=this.value;render()">${['', 'GK', 'DEF', 'MID', 'ATT'].map((x) => `<option value="${x}" ${f.p == x ? 'selected' : ''}>${x || 'Tous postes'}</option>`).join('')}</select><select onchange="V.fl.o=this.value;render()"><option value="">Toutes origines</option>${TN.map(
    (n) => n[0],
  )
    .sort((x, y) => x.localeCompare(y))
    .map((x) => `<option value="${x}" ${f.o == x ? 'selected' : ''}>${x}</option>`)
    .join('')}</select><select onchange="V.fl.s=this.value;render()">${[
    ['o', 'Niveau'],
    ['n', 'Nom'],
    ['e', 'Énergie'],
    ['c', 'Compatibilité'],
  ]
    .map(([k, l]) => `<option value="${k}" ${f.s == k ? 'selected' : ''}>Tri : ${l}</option>`)
    .join('')}</select><select onchange="V.fl.c=+this.value;render()">${[
    [0, 'Compat. : toutes'],
    [30, 'Fluide ≥ 30 %'],
    [50, 'Fluide ≥ 50 %'],
    [70, 'Fluide ≥ 70 %'],
  ]
    .map(([k, l]) => `<option value="${k}" ${(f.c || 0) == k ? 'selected' : ''}>${l}</option>`)
    .join(
      '',
    )}</select><input placeholder="🔍 Nom" value="${f.q}" oninput="V.fl.q=this.value" onchange="render()" style="width:110px"></div>`;
}
// Bouton « Cartes / Liste ».
const vwBtn = () =>
  `<button onclick="vw()" style="padding:2px 8px">${V.vw == 'l' ? '▦ Cartes' : '☰ Liste'}</button>`;
// Bascule entre l'affichage en cartes et en liste (mémorisé).
function vw() {
  V.vw = V.vw == 'l' ? 'c' : 'l';
  try {
    localStorage.setItem('gmvw', V.vw);
  } catch (e) {}
  render();
}
// Ligne d'un joueur pour le mode liste.
function prow(p, cls, onclk, extra) {
  const kd =
      onclk[0] == 'm'
        ? onclk[5] == 'b'
          ? 'mk'
          : onclk[5] == 'l'
            ? 'lo'
            : 'sq'
        : onclk.startsWith("nk('rc'")
          ? 'mk'
          : onclk.startsWith("nk('cv'")
            ? 'nv'
            : onclk.startsWith('pr')
              ? 'ed'
              : 'sq',
    ix = onclk.split(',').pop().replace(/\D/g, '');
  return `<div class="row ${cls}${p.pr ? ' prs' : p.c ? ' chr' : ''}" onclick="${onclk}" style="cursor:pointer"><span class="pos">${p.p}</span><span class="nm">${p.c ? '★ ' : ''}<span class="${p.pr ? 'prn' : p.c ? 'chn' : ''}">${p.n}</span>${fp(p)}${p.nz ? ' 🤢' : ''}${p.inj ? ' 🩹' + p.inj : ''}${p.sus ? ' · susp. ' + p.sus : ''}${p.ln ? ' 🔁' + p.ln.left : ''}</span><span class="mu">⚽${p.g || 0}</span><span class="gp gpl">${gg(p.e ?? 100, { size: 30, fs: 32, c: '#2fd0c5', tt: 'Endurance' })}${gg(p.f, { size: 30, fs: 32, c: '#b78bff', tt: 'Fluide' })}</span>${xpB(p, 'l')}<b>${p.o}</b>${extra || ''}<span onclick="event.stopPropagation();prof('${kd}',${ix})">ⓘ</span></div>`;
}
// Encadré « Statistiques » du match (possession, passes, tirs…).
function statsBox(M) {
  return statsBox0(M) + anaBox(M) + ratBox(M);
}
// Couleur d'une note de match (de rouge à vert).
const rtCol = (v) => (v >= 8 ? '#2fb36b' : v >= 7 ? '#62c14a' : v >= 6 ? '#e0a526' : v >= 5 ? '#e8743b' : '#e5484d');
// Encadré « Notes des joueurs » affiché à la fin du match (notes sur 10, homme du match mis en avant).
function ratBox(M) {
  try {
    if (!M.done || !M.rt) return '';
    const col = (s) => {
      const L = M.rt[s].slice().sort((a, b) => b[2] - a[2]),
        av = L.length ? L.reduce((x, y) => x + y[2], 0) / L.length : 0;
      return `<div class="rbc"><div class="rbh"><span>${M.t[s].em} <b>${M.t[s].name}</b></span><span class="rbv" style="color:${rtCol(av)}" title="Note moyenne de l’équipe">${av.toFixed(1)}</span></div>${L.map(
        ([n, ps, r, g, a, fl]) =>
          `<div class="rbr${n == M.mmn ? ' rbm' : ''}"><span class="rbp">${ps}</span><span class="rbn">${fl ? `<svg class="ic" width="12" height="12" aria-hidden="true" style="color:${fl == 1 ? '#2fb36b' : '#e5484d'}" title="${fl == 1 ? 'Entré en jeu' : 'Remplacé'}"><use href="#${fl == 1 ? 'i-up' : 'i-down'}"/></svg> ` : ''}${n == M.mmn ? '<svg class="ic" width="13" height="13" aria-hidden="true"><use href="#i-star"/></svg> ' : ''}${n}</span><span class="rbi">${g ? `<svg class="ic" width="13" height="13" aria-hidden="true"><use href="#i-ball"/></svg>${g > 1 ? '×' + g : ''}` : ''}${a ? `<svg class="ic" width="13" height="13" aria-hidden="true"><use href="#i-footr"/></svg>${a > 1 ? '×' + a : ''}` : ''}</span><b class="rbt" style="background:${rtCol(r)}">${r.toFixed(1)}</b></div>`,
      ).join('')}</div>`;
    };
    return `<div class="card rbb"><b>Notes des joueurs</b>${hp('rtn')}${M.mmn ? `<div class="mu" style="margin:2px 0 6px">Homme du match : <b>${M.mmn}</b></div>` : ''}<div class="rbg">${col(0)}${col(1)}</div></div>`;
  } catch (e) {
    return '';
  }
}
// Encadré des statistiques de base du match.
function statsBox0(M) {
  const s = M.vst || M.st,
    P = s.poss[0] + s.poss[1] || 1,
    r = (l, a, b, pc) =>
      `<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:2px 0"><b style="width:34px;text-align:right">${a}${pc ? '%' : ''}</b><div style="flex:1;height:6px;background:#e8743b;border-radius:3px;overflow:hidden"><i style="display:block;height:100%;width:${(a / (a + b || 1)) * 100}%;background:var(--ac)"></i></div><b style="width:34px">${b}${pc ? '%' : ''}</b><span class="mu" style="width:70px">${l}</span></div>`,
    p0 = Math.round((s.poss[0] / P) * 100);
  return `<div class="card" style="margin-top:8px"><b>Statistiques</b>${r('Possession', p0, 100 - p0, 1)}${r('Passes', s.pas[0], s.pas[1])}${s.pa && s.pa[0][1] + s.pa[1][1] ? r('Réussite', Math.round((s.pa[0][0] / (s.pa[0][1] || 1)) * 100), Math.round((s.pa[1][0] / (s.pa[1][1] || 1)) * 100), 1) : ''}${r('Tirs', s.tir[0], s.tir[1])}${r('Cadrés', s.cad[0], s.cad[1])}${r('Fautes', s.fau[0], s.fau[1])}</div>`;
}
V.ln = V.ln || { m: 12, o: 0 };
// Frais d'un prêt (selon la valeur du joueur et la durée).
const lfee = (p, m) => Math.round(price(p) * 0.012 * m),
  lopt = (p) => Math.round(price(p) * 1.2);
// Joueur d'un autre club proposé en prêt.
function lop(i) {
  const o = (S.lo || [])[i];
  return o ? S.teams[o[0]].sq.find((p) => p.n == o[1]) : null;
}
// Génère les offres de prêt des autres clubs.
function offers() {
  const r = [];
  S.teams.forEach((t, ti) => {
    if (ti == S.t) return;
    const b = t.sq.map((p, i) => [p, i]).filter(([p, i]) => !t.lu.includes(i) && !p.ln);
    if (b.length) r.push([ti, b[(Math.random() * b.length) | 0][0].n]);
  });
  return r.sort(() => Math.random() - 0.5).slice(0, 6);
}
// Liste déroulante de la durée du prêt (6, 12 ou 18 matchs).
const durSel = () =>
  `<select onchange="V.ln.m=+this.value;render()">${[6, 12, 18].map((m) => `<option value="${m}" ${V.ln.m == m ? 'selected' : ''}>${m} matchs</option>`).join('')}</select><label><input type="checkbox" ${V.ln.o ? 'checked' : ''} onchange="V.ln.o=this.checked?1:0;render()"> Option d’achat</label>`;
// Page des prêts.
function loanView() {
  if (S.lod !== S.md || !S.lo) {
    S.lo = offers();
    S.lod = S.md;
  }
  const m = V.ln.m,
    mine = [];
  S.teams.forEach((t) =>
    t.sq.forEach((p) => {
      if (p.ln && p.ln.own == S.t && t != me())
        mine.push(
          `<div class="mu">${p.n} → ${t.name} · retour dans ${p.ln.left} matchs${p.ln.opt ? ' · option ' + p.ln.opt : ''}</div>`,
        );
    }),
  );
  return (
    `<h2>Prêts</h2>${vwBtn()}<div class="card"><div class="mu">Empruntez un joueur d’un autre club (frais payés d’avance, salaire à votre charge), ou prêtez un remplaçant depuis son profil ⓘ.</div><div class="ctl" style="margin:6px 0">${durSel()}</div><div class="pg">` +
    fl(S.lo.map((o, i) => [lop(i), i]).filter(([p]) => p))
      .map(([p, i]) =>
        pc(
          p,
          V.mk == 'l' + i ? 'sel' : '',
          `mk2('l',${i})`,
          `${cmp(p)}<div><b>${lfee(p, m)}</b> cr.${V.ln.o ? ' · opt. ' + lopt(p) : ''}${V.mk == 'l' + i ? ' · confirmer ?' : ''}</div>`,
        ),
      )
      .join('') +
    '</div>' +
    (mine.length ? '<h2>Mes joueurs prêtés</h2>' + mine.join('') : '') +
    '</div>'
  );
}
// Emprunte un joueur à un autre club.
function borrow(i) {
  const o = S.lo[i],
    t = me();
  if (!o) return;
  const ow = S.teams[o[0]],
    k = ow.sq.findIndex((p) => p.n == o[1]);
  if (k < 0) return;
  const p = ow.sq[k],
    m = V.ln.m,
    f = lfee(p, m);
  if (S.cash < f || sqN(t) >= 15) {
    mail('Prêt impossible', 'Crédits insuffisants ou effectif complet (15 joueurs maximum).');
    return render();
  }
  tx('Prêts', -f);
  tlog('lin', p, ow.name, f);
  ow.sq.splice(k, 1);
  autoLU(ow);
  ensure(p);
  p.ln = { own: o[0], left: m, opt: V.ln.o ? lopt(p) : 0 };
  t.sq.push(p);
  join(p, t);
  S.lo.splice(i, 1);
  mail(
    'Prêt accepté',
    p.n +
      ' (' +
      ow.name +
      ') est prêté pour ' +
      m +
      ' matchs. Frais : ' +
      f +
      ' crédits.' +
      (p.ln.opt ? ' Option d’achat : ' + p.ln.opt + '.' : ''),
  );
  save();
  render();
}
// Prête un joueur à un autre club.
function lend(i) {
  const t = me(),
    p = t.sq[i],
    m = V.ln.m;
  if (!p || p.ln || t.lu.includes(i) || (!p.rv && sqN(t) <= 11)) {
    V.pn = 'Impossible : titulaire, déjà prêté, ou effectif minimum atteint.';
    return render();
  }
  const c = S.teams.filter((x, j) => j != S.t && x.sq.length < 15);
  if (!c.length || Math.random() > 0.35 + p.o / 150) {
    V.pn = 'Aucun club n’a accepté cette offre.';
    return render();
  }
  const x = c[(Math.random() * c.length) | 0],
    f = lfee(p, m);
  if (p.rv) p.rvo = 1;
  rmP(t, p);
  tx('Prêts', f);
  tlog('lout', p, x.name, f);
  p.ln = { own: S.t, left: m, opt: V.ln.o ? lopt(p) : 0 };
  x.sq.push(p);
  join(p, x);
  V.pf = null;
  mail(
    'Prêt conclu',
    p.n +
      ' est prêté à ' +
      x.name +
      ' pour ' +
      m +
      ' matchs. Vous touchez ' +
      f +
      ' crédits.' +
      (p.ln.opt ? ' Option d’achat : ' + p.ln.opt + '.' : ''),
  );
  save();
  render();
}
// Lève l'option d'achat d'un joueur prêté.
function optBuy(i) {
  const p = me().sq[i];
  if (!p || !p.ln || !p.ln.opt || S.cash < p.ln.opt) return;
  tx('Prêts', -p.ln.opt);
  delete p.ln;
  V.pn = 'Option levée : ' + p.n + ' est à vous.';
  save();
  render();
}
// Section « Prêt » de la fiche d'un joueur.
function loanSec(p, i) {
  if (S.ctx == 'C') return '';
  const o = p.ln;
  if (o)
    return (
      `<h2>Prêt</h2><div>Prêté par <b>${S.teams[o.own].name}</b> · reste <b>${o.left}</b> matchs${o.opt ? ' · option d’achat : <b>' + o.opt + '</b>' : ''}</div>` +
      (o.opt
        ? `<button ${S.cash < o.opt ? 'disabled' : ''} onclick="optBuy(${i})">Lever l’option (${o.opt})</button>`
        : '')
    );
  return `<h2>Prêter ce joueur</h2><div class="ctl">${durSel()}</div><button style="margin-top:6px" onclick="lend(${i})">Proposer en prêt (frais : ${lfee(p, V.ln.m)})</button>`;
}
// Fait avancer les prêts à chaque match (retour des joueurs en fin de prêt).
function loans() {
  S.teams.forEach((t, ti) => {
    t.sq
      .filter((p) => p.ln)
      .forEach((p) => {
        if (--p.ln.left > 0) return;
        const was = p.ln,
          o = S.teams[was.own];
        rmP(t, p);
        if (was.opt && was.own == S.t && ti != S.t && Math.random() < 0.35) {
          tx('Prêts', was.opt);
          mail(
            'Option d’achat levée',
            t.name + ' achète définitivement ' + p.n + ' pour ' + was.opt + ' crédits.',
          );
          delete p.ln;
          t.sq.push(p);
          autoLU(t);
          return;
        }
        delete p.ln;
        o.sq.push(p);
        join(p, o);
        if (p.rvo) {
          delete p.rvo;
          if (o === me()) p.rv = 1; // il retourne en réserve
        }
        if (t != me()) autoLU(t);
        if (o != me()) autoLU(o);
        if (was.own == S.t) mail('Retour de prêt', p.n + ' revient dans votre effectif.');
        else if (ti == S.t) mail('Fin de prêt', p.n + ' retourne à ' + o.name + '.');
      });
  });
}
// PRODUITS DÉRIVÉS : [nom, revenu par niveau, coût de base]. Modifier ici pour rééquilibrer la
// boutique.
const MER = {
    ma: ['Maillots', 14, 500],
    ec: ['Écharpes', 7, 300],
    mu: ['Mugs', 5, 200],
    po: ['Posters', 4, 150],
  },
  // Nombre de matchs d'une équipe sur une saison (14 équipes = 26, 21 équipes = 40...).
  seasonM = () => (S && S.ctx != 'C' && S.teams && S.teams.length > 2 ? (S.teams.length - 1) * 2 : 26),
  dur = (m) => (m == seasonM() ? '1 saison' : m == 2 * seasonM() ? '2 saisons' : m + ' matchs'),
  spons = () => S.sps.reduce((a, s) => a + (s.left > 0 ? s.v : 0), 0),
  shop = () =>
    Math.round(Object.keys(MER).reduce((a, k) => a + S.mer[k] * MER[k][1], 0) * (0.6 + S.conf / 100));
// ENREGISTRE UNE DÉPENSE OU UN GAIN : tx(catégorie, montant). Applique la difficulté et met à jour
// l'argent et les finances.
function tx(c, a) {
  if (!a) return;
  const dd = S.df ?? 1;
  if (['Droits TV', 'Billetterie', 'Primes de victoire', 'Sponsors', 'Boutique'].includes(c))
    a = Math.round(a * [1.2, 1, 0.85][dd]);
  if (c == 'Salaires') a = Math.round(a * [0.85, 1, 1.15][dd]);
  a = Math.round(a * skM(c) * (c == 'Transferts' && a < 0 ? 1 - mgb('rc') : 1));
  S.cash += a;
  S.fn[c] = (S.fn[c] || 0) + a;
  S.tx.unshift([S.md + 1, c, a]);
  if (S.tx.length > 30) S.tx.length = 30;
}
// JOURNAL DES TRANSFERTS : k = 'in' (arrivée), 'out' (départ), 'lin' (prêt reçu), 'lout' (prêt accordé).
function tlog(k, p, o, a) {
  try {
    S.tl = S.tl || [];
    S.tl.unshift({ k, n: p.n, r: p.o, c: o, a, s: S.season, d: S.day });
    if (S.tl.length > 60) S.tl.length = 60;
  } catch (e) {}
}
// Génère les offres de sponsors disponibles.
function soffers() {
  const N = [
    'Nova Corp',
    'Technoid Inc.',
    'Comet Cola',
    'Orion Bank',
    'Zéta Motors',
    'Vega Foods',
    'Plasma Drinks',
    'Akillian Dairy',
  ].sort(() => Math.random() - 0.5);
  return [
    [10, 1.15],
    [seasonM(), 1],
    [2 * seasonM(), 0.9],
  ].map(([m, k], i) => ({
    n: N[i],
    m,
    left: m,
    v: Math.round((35 + S.st * 10 + S.conf * 0.5 + stL('a') * 5) * 0.45 * k * (0.9 + Math.random() * 0.25)),
  }));
}
// Signe un contrat de sponsor (3 maximum).
function takeS(i) {
  const o = S.so[i];
  V.mk = null;
  if (!o || S.sps.length >= 3) {
    mail('Sponsoring', 'Vous avez déjà 3 sponsors.');
    return render();
  }
  S.sps.push({ ...o });
  S.so.splice(i, 1);
  mail('Sponsor signé', o.n + ' : ' + o.v + ' crédits par match pendant ' + dur(o.m) + '.');
  save();
  render();
}
// Améliore un produit dérivé (jusqu'au niveau 5).
function upM(k) {
  const l = S.mer[k],
    c = Math.round((1 + l * 0.5) * MER[k][2]);
  if (l >= 5 || S.cash < c) return;
  tx('Boutique (investissement)', -c);
  S.mer[k]++;
  save();
  render();
}
// Carte « Stade » avec prix du billet.
function stadeCard() {
  return `<div class="card"><div class="row"><span class="nm">Stade niv. ${S.st} · ${2000 * S.st} places <span class="mu">recette estimée à domicile : ${gate()}</span></span><button onclick="upS()" ${S.st >= 5 || S.cash < S.st * 1000 + 500 ? 'disabled' : ''}>+ ${S.st * 1000 + 500}</button></div><div class="row"><span class="nm">Prix du billet : ${S.tk} <span class="mu">(plus cher = moins de monde)</span></span><button onclick="S.tk=Math.max(5,S.tk-1);save();render()">−</button><button onclick="S.tk=Math.min(25,S.tk+1);save();render()">+</button></div></div>`;
}
// Logos des sponsors (dessins plats, 64 x 64).
const SPL = {
  'Nova Corp': '<circle cx="32" cy="32" r="30" fill="#14193f"/><path d="M32 6l5.5 17.5L55 18l-11 14 11 14-17.5-5.5L32 58l-5.5-17.5L9 46l11-14L9 18l17.5 5.5z" fill="#ffd23f"/><circle cx="32" cy="32" r="7" fill="#14193f"/><circle cx="32" cy="32" r="3.5" fill="#ff7a4d"/>',
  'Technoid Inc.': '<rect x="2" y="2" width="60" height="60" rx="14" fill="#0e2a35"/><path d="M32 8l20 11.5v25L32 56 12 44.5v-25z" fill="#2fd6e8"/><path d="M32 18l12 7v14l-12 7-12-7V25z" fill="#0e2a35"/><circle cx="32" cy="32" r="4.5" fill="#b6f23a"/><path d="M32 8v10M52 19.5l-9 5.5M52 44.5L43 39M32 56V46M12 44.5L21 39M12 19.5l9 5.5" stroke="#0e2a35" stroke-width="2.5"/>',
  'Comet Cola': '<circle cx="32" cy="32" r="30" fill="#e8453a"/><circle cx="32" cy="32" r="24" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/><circle cx="42" cy="24" r="8" fill="#fff"/><path d="M36 30C26 36 18 44 10 52c12-2 22-6 30-14z" fill="#fff"/><path d="M30 34c-6 4-10 8-14 12" stroke="#e8453a" stroke-width="2" stroke-linecap="round"/>',
  'Orion Bank': '<circle cx="32" cy="32" r="30" fill="#ffd23f"/><circle cx="32" cy="32" r="24" fill="#1d2a6e"/><circle cx="19" cy="40" r="4" fill="#ffd23f"/><circle cx="32" cy="32" r="4" fill="#ffd23f"/><circle cx="45" cy="24" r="4" fill="#ffd23f"/><path d="M19 40L32 32 45 24" stroke="#ffd23f" stroke-width="2.5"/><path d="M14 52h36" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>',
  'Zéta Motors': '<path d="M32 3l26 8v22c0 14-11 24-26 28C17 57 6 47 6 33V11z" fill="#ff7a4d"/><path d="M18 20h28v6L28 40h18v6H18v-6l18-14H18z" fill="#1b1030"/><path d="M10 52h44" stroke="#1b1030" stroke-width="2.5" stroke-dasharray="6 3"/>',
  'Vega Foods': '<circle cx="32" cy="32" r="30" fill="#2fb36b"/><path d="M14 44C14 24 28 14 48 14c0 20-10 34-30 34z" fill="#b6f23a"/><path d="M16 46C26 36 34 28 44 18" stroke="#1c6b43" stroke-width="2.5" stroke-linecap="round"/><path d="M26 40l-1-8M33 33l-1-8" stroke="#1c6b43" stroke-width="2" stroke-linecap="round"/>',
  'Plasma Drinks': '<circle cx="32" cy="32" r="30" fill="#2a1a6e"/><path d="M32 6C22 20 14 28 14 38a18 18 0 0036 0C50 28 42 20 32 6z" fill="#a99bff"/><path d="M35 22L24 38h8l-3 12 12-18h-8z" fill="#ffd23f"/>',
  'Akillian Dairy': '<rect x="2" y="2" width="60" height="60" rx="14" fill="#6cc9ff"/><path d="M20 10h24l4 12v32a3 3 0 01-3 3H19a3 3 0 01-3-3V22z" fill="#fff"/><path d="M20 10h24l4 12H16z" fill="#2a6ccf"/><circle cx="26" cy="38" r="5" fill="#14193f"/><circle cx="38" cy="46" r="4" fill="#14193f"/><circle cx="40" cy="34" r="3" fill="#14193f"/>',
};
const spLogo = (n, sz = 40) =>
  `<svg class="spl" viewBox="0 0 64 64" width="${sz}" height="${sz}" role="img" aria-label="Logo ${n}">${SPL[n] || `<circle cx="32" cy="32" r="30" fill="#6b6f9a"/><text x="32" y="43" text-anchor="middle" font-size="32" font-weight="800" fill="#fff">${(n || '?')[0]}</text>`}</svg>`;
// Illustrations plates de la page « Gestion du club ».
const GIL = {
  st: '<svg viewBox="0 0 120 80"><ellipse cx="60" cy="62" rx="44" ry="10" fill="#000" opacity=".25"/><path d="M14 40v14c0 8 21 14 46 14s46-6 46-14V40z" fill="#e8583a"/><path d="M14 40c0-8 21-14 46-14s46 6 46 14-21 14-46 14S14 48 14 40z" fill="#f4f1ff"/><ellipse cx="60" cy="40" rx="32" ry="9.5" fill="#cfd6ff"/><ellipse cx="60" cy="40" rx="26" ry="7" fill="#2fb36b"/><path d="M60 33v14M34 40h52" stroke="#fff" stroke-width="1.2" opacity=".7"/><circle cx="60" cy="40" r="3.2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/></svg>',
  tk: '<svg viewBox="0 0 120 80"><g transform="rotate(-8 60 40)"><path d="M18 22h84v12a6 6 0 000 12v12H18V46a6 6 0 000-12z" fill="#ffd23f"/><rect x="26" y="28" width="68" height="24" rx="3" fill="none" stroke="#e08a1e" stroke-width="2" stroke-dasharray="4 3"/><path d="M60 22v36" stroke="#e08a1e" stroke-width="1.5" stroke-dasharray="2 3"/></g></svg>',
};
// Produits dérivés aux couleurs et au logo du club (maillot : a, b ; logo de l'équipe choisie).
function emU(em) {
  try {
    const m = /^⟦~[0-9a-f.]+⟧$/.exec(em || ''),
      k = /^⟦([a-z]{2})⟧$/.exec(em || '');
    return m ? crU(em) : k && LGB[k[1]] ? lgU(k[1]) : '';
  } catch (e) {
    return '';
  }
}
function merchIl(k) {
  const K = kitOf(me()),
    u = emU(me().em),
    lg = (x, y, w) => (u ? `<image href="${u}" x="${x}" y="${y}" width="${w}" height="${w}" preserveAspectRatio="xMidYMid meet"/>` : ''),
    ol = 'stroke="#0a0c22" stroke-width="1.6" stroke-linejoin="round"';
  return {
    ma: `<svg viewBox="0 0 120 80"><ellipse cx="60" cy="75" rx="30" ry="3.5" fill="#0a0c22" opacity=".18"/><path d="M36 8l14 4c3 5 17 5 20 0l14-4 18 14-9 10-8-5v42H35V27l-8 5-9-10z" fill="${K.a}" ${ol}/><path d="M18 22l9 10 8-5V19zM102 22l-9 10-8-5V19z" fill="${K.b}" ${ol}/><path d="M50 12c3 5 17 5 20 0" fill="none" stroke="${K.b}" stroke-width="3.5" stroke-linecap="round"/>${lg(48, 24, 24)}</svg>`,
    ec: `<svg viewBox="0 0 120 80"><ellipse cx="60" cy="74" rx="38" ry="3.5" fill="#0a0c22" opacity=".18"/><path d="M14 22c10-8 24-10 46-4 22-6 36-4 46 4l-6 14c-8-7-22-8-40-2-18-6-32-5-40 2z" fill="${K.a}" ${ol}/><path d="M26 20l-4 14M42 18l-3 14M78 18l3 14M94 20l4 14" stroke="${K.b}" stroke-width="5"/><path d="M20 36l-6 28h18l4-30zM100 36l6 28H88l-4-30z" fill="${K.a}" ${ol}/><path d="M18 46h14M16 54h16M88 46h14M88 54h16" stroke="${K.b}" stroke-width="4"/><path d="M16 64l-1 7M21 64l-1 7M26 64l-1 7M31 64l-1 7M89 64l1 7M94 64l1 7M99 64l1 7M104 64l1 7" stroke="${K.b}" stroke-width="2" stroke-linecap="round"/>${lg(50, 12, 20)}</svg>`,
    mu: `<svg viewBox="0 0 120 80"><ellipse cx="58" cy="73" rx="28" ry="3.5" fill="#0a0c22" opacity=".18"/><path d="M82 26h6a10 10 0 010 24h-6" fill="none" stroke="${K.b}" stroke-width="6"/><path d="M34 14h48v48a8 8 0 01-8 8H42a8 8 0 01-8-8z" fill="${K.a}" ${ol}/><rect x="34" y="14" width="48" height="8" fill="${K.b}" ${ol}/>${lg(42, 28, 32)}</svg>`,
    po: `<svg viewBox="0 0 120 80"><g transform="rotate(3 60 40)"><rect x="34" y="4" width="52" height="72" rx="3" fill="${K.b}" ${ol}/><rect x="38" y="8" width="44" height="64" rx="2" fill="${K.a}"/>${lg(44, 12, 32)}<path d="M44 52h32M48 59h24M52 66h16" stroke="${K.b}" stroke-width="3.5" stroke-linecap="round"/></g></svg>`,
  }[k];
}
// Fond des images : clair si le noir figure parmi les couleurs principales du club, noir sinon.
function gBg() {
  const K = kitOf(me()),
    dk = (c) => c && c[0] == '#' && c.length == 7 && 0.299 * parseInt(c.slice(1, 3), 16) + 0.587 * parseInt(c.slice(3, 5), 16) + 0.114 * parseInt(c.slice(5, 7), 16) < 60;
  return dk(K.a) || dk(K.b) ? '#e7e9ff' : '#07080f';
}
// Une tuile de la page : illustration, bulle d'aide, titre, détail et bouton.
const gTile = (ic, hk, t, d, act) =>
  `<div class="gtl"><div class="gti" style="background:${gBg()}">${GIL[ic] || merchIl(ic)}<span class="gth">${hp(hk)}</span></div><div class="gtb"><div class="gtt"><b>${t}</b><small>${d}</small></div>${act}</div></div>`;
// Page « Gestion du club » : présentée comme une page web (stade, sponsors, boutique).
function gestView() {
  if (S.sod !== S.md || !S.so) {
    S.so = soffers();
    S.sod = S.md;
  }
  const t = me(),
    K = kitOf(t),
    u = emU(t.em),
    lum = (c) => (c && c[0] == '#' && c.length == 7 ? 0.299 * parseInt(c.slice(1, 3), 16) + 0.587 * parseInt(c.slice(3, 5), 16) + 0.114 * parseInt(c.slice(5, 7), 16) : 0),
    slug = t.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    upS_ = S.st >= 5 || S.cash < S.st * 1000 + 500,
    mer = (k) => Math.round((1 + S.mer[k] * 0.5) * MER[k][2]);
  return `<div class="wb"><div class="wbt"><span class="wbn">‹</span><span class="wbn">›</span><span class="wbu"><i></i>galactik.club/${slug}</span></div><div class="wbp"><div class="wbh" style="background:${K.a};color:${lum(K.a) > 150 ? '#0a0c22' : '#fff'}">${u ? `<img class="wbg" alt="" src="${u}">` : ''}<span class="wbl" style="background:${K.b};color:${lum(K.b) > 150 ? '#0a0c22' : '#fff'}">the club</span><span class="wbs">${t.name}</span><span class="wbv">${[['wb-m', 'Match'], ['wb-s', 'Sponsors'], ['wb-b', 'Boutique']].map(([, l]) => `<a>${l}</a>`).join('')}</span><span class="wbk2">${S.cash} cr.</span></div><div class="wbm">
<div class="wbc" id="wb-m"><h2 class="wbk">Match</h2><div class="wbg2">${gTile('st', 'stad', `Stade niv. ${S.st} · ${2000 * S.st} places`, `recette estimée à domicile : ${gate()}`, `<button onclick="upS()" ${upS_ ? 'disabled' : ''}>${S.st >= 5 ? 'Max' : '+ ' + (S.st * 1000 + 500)}</button>`)}${gTile('tk', 'tk', `Prix du billet : ${S.tk}`, 'plus cher = moins de monde, mais plus par spectateur', `<span class="gtp"><button onclick="S.tk=Math.max(5,S.tk-1);save();render()" aria-label="Baisser le prix">−</button><button onclick="S.tk=Math.min(25,S.tk+1);save();render()" aria-label="Augmenter le prix">+</button></span>`)}</div></div>
<div class="wbc" id="wb-s"><h2 class="wbk">Sponsors</h2><div class="wbg2 wbs1"><div class="card gsp"><div class="gsh"><b>Sélectionnés</b>${hp('spn')}<span class="mu">(${S.sps.length}/3)</span></div>${S.sps.map((s) => `<div class="gsr">${spLogo(s.n, 38)}<b>${s.n}</b><span class="mu">${s.v}/match · reste ${Math.max(0, Math.min(s.left, s.m || s.left))} sur ${s.m || s.left} matchs</span></div>`).join('') || '<div class="mu">Aucun sponsor.</div>'}</div><div class="card gsp"><div class="gsh"><b>Offres du moment</b><span class="mu">touchez deux fois pour signer</span></div><div class="gso">${S.so.map((o, i) => `<div class="pc ${V.mk == 'o' + i ? 'sel' : ''}" onclick="mk2('o',${i})">${spLogo(o.n, 40)}<div class="pn">${o.n}</div><div class="o">${o.v}</div><div class="mu">par match</div><div class="mu">${dur(o.m)}</div>${V.mk == 'o' + i ? '<div class="mu">confirmer ?</div>' : ''}</div>`).join('')}</div></div></div></div>
<div class="wbc" id="wb-b"><h2 class="wbk">Boutique <small>revenu estimé : ${shop()} crédits par match ${hp('shp')}</small></h2><div class="wbg4">${Object.keys(MER).map((k) => gTile(k, 'shp', `${MER[k][0]} niv. ${S.mer[k]}/5`, `+${MER[k][1]} par niveau`, `<button onclick="upM('${k}')" ${S.mer[k] >= 5 || S.cash < mer(k) ? 'disabled' : ''}>${S.mer[k] >= 5 ? 'Max' : '+ ' + mer(k)}</button>`)).join('')}</div></div></div></div>`;
}
// Page « Finances » : trésorerie, revenus, dépenses, dernières opérations.
function finView() {
  const e = Object.entries(S.fn),
    R = e.filter(([, a]) => a > 0).sort((a, b) => b[1] - a[1]),
    D = e.filter(([, a]) => a < 0).sort((a, b) => a[1] - b[1]),
    sR = R.reduce((a, x) => a + x[1], 0),
    sD = D.reduce((a, x) => a + x[1], 0),
    hs = S.fh.concat([S.cash]),
    mx = Math.max(...hs, 1),
    mn = Math.min(...hs, 0),
    pts = hs
      .map((v, i) => `${i * (300 / Math.max(hs.length - 1, 1))},${60 - ((v - mn) / (mx - mn || 1)) * 55}`)
      .join(' '),
    rows = (L) =>
      L.map(
        ([c, a]) => `<tr><td style="text-align:left">${c}</td><td>${a > 0 ? '+' : ''}${a}</td></tr>`,
      ).join('') || '<tr><td>—</td><td></td></tr>';
  return `<div class="fvw fing"><div class="card fing1"><b>Trésorerie : ${S.cash} crédits</b>${hp('fin1')}<br><span class="mu">Saison ${S.season} · Revenus ${sR} · Dépenses ${-sD} · Résultat <b style="color:${sR + sD >= 0 ? 'var(--ok)' : '#d33'}">${sR + sD >= 0 ? '+' : ''}${sR + sD}</b></span><svg viewBox="0 0 300 64" preserveAspectRatio="none" style="width:100%;height:90px;margin-top:8px"><polyline fill="none" stroke="var(--ac)" stroke-width="2" vector-effect="non-scaling-stroke" points="${pts}"/></svg></div><div class="card"><b>Revenus</b><table>${rows(R)}</table></div><div class="card"><b>Dépenses</b><table>${rows(D)}</table></div><div class="card fing3"><b>Dernières opérations</b>${
    S.tx
      .slice(0, 12)
      .map(
        ([d, c, a]) =>
          `<div class="row"><span class="mu" style="width:34px">J${d}</span><span class="nm">${c}</span><b style="color:${a > 0 ? 'var(--ok)' : '#d33'}">${a > 0 ? '+' : ''}${a}</b></div>`,
      )
      .join('') || '<div class="mu">Aucune opération.</div>'
  }</div></div>`;
}

// ======================================================================
// SAUVEGARDES : EMPLACEMENTS, SAUVEGARDE AUTOMATIQUE, EXPORT / IMPORT
// ======================================================================
// Noms des emplacements de sauvegarde : le premier est la sauvegarde automatique.
const SL = ['gmauto', 'gms1', 'gms2', 'gms3', 'gms4', 'gms5'];
// Enregistre la partie dans un emplacement (avec un petit résumé : équipe, saison, journée,
// argent).
function slotSave(k) {
  try {
    if (!S) return false;
    localStorage.setItem(k, ser());
    localStorage.setItem(
      k + 'm',
      JSON.stringify({
        dv: DV,
        gv: GV,
        t: me().name,
        sn: S.season,
        md: S.md,
        c: S.cash,
        dt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      }),
    );
    return true;
  } catch (e) {
    return false;
  }
}
// Lit le résumé d'un emplacement.
function slotMeta(k) {
  try {
    return JSON.parse(localStorage.getItem(k + 'm'));
  } catch (e) {
    return null;
  }
}
// Mémoire de la dernière sauvegarde automatique (évite d'enregistrer si rien n'a changé).
const AS = { last: '', t: 0 };
// SAUVEGARDE AUTOMATIQUE INTELLIGENTE : n'enregistre que si la partie a changé, jamais pendant un
// match, et affiche un message (réglable).
function autosave(why) {
  try {
    if (!ST.as || !S) return;
    if (typeof V != 'undefined' && V.m && !V.m.done) return;
    const q = why == 'quiet',
      d = ser();
    if (d === AS.last) return;
    if (!q && Date.now() - AS.t < 15000 && why == 'tick') return;
    if (!slotSave('gmauto')) return;
    AS.last = d;
    AS.t = Date.now();
    if (!q && ST.nta !== 0)
      ntf({
        i: 'save',
        l: 'Sauvegarde automatique',
        t: 'Partie sauvegardée',
        s: why == 'tick' ? 'Enregistrement régulier de ta progression.' : 'Ta progression est à l’abri.',
        tp: 'a',
        d: 2600,
      });
  } catch (e) {}
}
setInterval(() => autosave('tick'), 180000);
addEventListener('pagehide', () => autosave('quiet'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) autosave('quiet');
});
// Actions sur un emplacement : sauvegarder, charger, supprimer.
function slotAct(a, i) {
  const k = SL[i];
  if (a == 's') {
    if (V.sc == 's' + i || !slotMeta(k)) {
      V.sc = null;
      V.sn = slotSave(k) ? 'Partie sauvegardée.' : 'Sauvegarde impossible (stockage plein).';
    } else V.sc = 's' + i;
  } else if (a == 'l') {
    const old = S;
    try {
      S = hyd(JSON.parse(localStorage.getItem(k)));
      mkSync();
      useT();
      natSyncAll();
      if (!S.teams.every((t) => FX[t.name])) throw 0;
      V.m = null;
      V.tab = 'ov';
      V.tour = null;
      V.sv = 0;
      V.menu = 0;
      V.pf = null;
      V.sn = '';
      save();
    } catch (e) {
      S = old;
      V.sn =
        e && e.newer
          ? 'Cette sauvegarde vient d’une version plus récente du jeu : elle ne peut pas être chargée ici.'
          : 'Chargement impossible (sauvegarde d’un autre mod ou corrompue).';
    }
  } else if (a == 'd') {
    if (V.sc == 'd' + i) {
      try {
        localStorage.removeItem(k);
        localStorage.removeItem(k + 'm');
      } catch (e) {}
      V.sc = null;
    } else V.sc = 'd' + i;
  }
  render();
}
// Télécharge un fichier de sauvegarde.
function svFile(name, txt) {
  const d = window.claude && window.claude.use ? window.claude.use('downloads') : null;
  return Promise.resolve(d)
    .then((x) => (x ? x.save({ filename: name, data: txt }) : Promise.reject({ code: 'unavailable' })))
    .then(() => 1)
    .catch((e) => {
      if (e && e.code == 'declined') return 0;
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return 1;
      } catch (_) {
        return -1;
      }
    });
}
// Exporte une sauvegarde dans un fichier.
function svExp(i) {
  let raw, m;
  try {
    if (i < 0) {
      if (!S) return;
      raw = ser();
      m = {
        dv: DV,
        gv: GV,
        t: me().name,
        sn: S.season,
        md: S.md,
        c: S.cash,
        dt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      };
    } else {
      raw = localStorage.getItem(SL[i]);
      m = slotMeta(SL[i]);
    }
    if (!raw) throw 0;
    let mod = null;
    try {
      mod = localStorage.getItem('gmmod');
    } catch (e) {}
    const nm = 'GFM-' + String(m.t || 'partie').replace(/[^a-z0-9]+/gi, '-') + '-saison' + m.sn + '.json';
    svFile(nm, JSON.stringify({ gfm: 1, ver: GV, meta: m, save: raw, mod: mod })).then((r) => {
      V.sn =
        r == 1
          ? 'Fichier de sauvegarde prêt : conservez-le pour recharger la partie sur un autre appareil.'
          : r == 0
            ? 'Export annulé.'
            : 'Export impossible dans ce navigateur.';
      render();
    });
  } catch (e) {
    V.sn = 'Export impossible : sauvegarde introuvable.';
    render();
  }
}
// Importe une sauvegarde depuis un fichier.
function svImp(inp) {
  const f = inp.files && inp.files[0];
  if (!f) return;
  const i = V.isl || 1,
    r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (d.gfm !== 1 || typeof d.save != 'string') throw 0;
      const t = JSON.parse(d.save);
      if (!t || !Array.isArray(t.teams)) throw 0;
      if ((t.dv || 0) > DV) {
        V.sn =
          'Ce fichier a été créé avec une version plus récente du jeu : il ne peut pas être importé ici.';
        render();
        return;
      }
      const m = d.meta || {
        t: 'Partie importée',
        sn: t.season || 1,
        md: t.md || 0,
        c: t.cash || 0,
        dt: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      };
      localStorage.setItem(SL[i], d.save);
      localStorage.setItem(SL[i] + 'm', JSON.stringify(m));
      let x = '';
      try {
        if (d.mod && !localStorage.getItem('gmmod')) {
          localStorage.setItem('gmmod', d.mod);
          x = ' Mods personnalisés inclus : rechargez la page pour les appliquer.';
        }
      } catch (e) {}
      V.sn = 'Partie importée dans l’emplacement ' + i + '. Appuyez sur « Charger ».' + x;
    } catch (e) {
      V.sn = 'Fichier invalide : ce n’est pas une sauvegarde GFM.';
    }
    render();
  };
  r.onerror = () => {
    V.sn = 'Lecture du fichier impossible.';
    render();
  };
  r.readAsText(f);
}
// Fenêtre qui prévient qu'une ancienne sauvegarde a été adaptée.
function mgBox() {
  if (!MG) return '';
  const n = MG.n;
  return `<div style="position:fixed;inset:0;background:#000b;z-index:90;display:flex;align-items:center;justify-content:center;padding:12px" onclick="MG=null;render()"><div class="card" style="max-width:440px;width:100%" onclick="event.stopPropagation()"><b style="font-size:17px">${n ? '⚠ Sauvegarde trop récente' : '⚠ Sauvegarde mise à jour'}</b><p>${n ? 'Cette partie a été créée avec une version plus récente du jeu et ne peut pas être chargée ici. Mettez le jeu à jour, ou ouvrez-la dans la version où elle a été créée.' : 'Cette partie a été créée avec une version plus ancienne du jeu. Elle a été adaptée automatiquement : les nouveautés s’appliquent dès maintenant. Par précaution, exportez une copie depuis « Sauvegardes ».'}</p><div class="ctl"><button class="p" onclick="MG=null;render()">Compris</button></div></div></div>`;
}
// Fenêtre « Sauvegardes ».
function svBox() {
  if (!V.sv) return '';
  return (
    `<div style="position:fixed;inset:0;background:#0008;z-index:70;display:flex;align-items:center;justify-content:center;padding:12px" onclick="V.sv=0;render()"><div class="card" style="max-width:460px;width:100%;max-height:90vh;overflow:auto" onclick="event.stopPropagation()"><b style="font-size:17px">💾 Sauvegardes</b>${V.sn ? `<div class="mu">${V.sn}</div>` : ''}` +
    SL.map((k, i) => {
      const m = slotMeta(k);
      return `<div class="row" style="flex-wrap:wrap"><span class="nm"><b>${i ? 'Emplacement ' + i : 'Sauvegarde auto'}</b><br><span class="mu">${m ? m.t + ' · Saison ' + m.sn + ' · J' + (m.md + 1) + ' · ' + m.c + ' cr. · ' + m.dt : 'Vide'}${m && (m.dv || 0) > DV ? '<br><b style="color:#e0457b">⚠ Version plus récente du jeu : chargement impossible</b>' : m && (m.dv || 0) < DV ? '<br><b style="color:#d6891a">⚠ Ancienne version : sera adaptée au chargement</b>' : ''}</span></span>${i && S ? `<button onclick="slotAct('s',${i})">${V.sc == 's' + i ? 'Écraser ?' : 'Sauvegarder'}</button>` : ''}${m ? `<button onclick="slotAct('l',${i})" ${(m.dv || 0) > DV ? 'disabled' : ''}>Charger</button><button onclick="svExp(${i})" title="Télécharger cette sauvegarde en fichier">Exporter</button><button onclick="slotAct('d',${i})">${V.sc == 'd' + i ? 'Confirmer ?' : '🗑'}</button>` : ''}</div>`;
    }).join('') +
    `<div class="mu" style="margin-top:10px">Pour jouer sur un autre appareil ou garder une copie : exportez un fichier, puis importez-le là-bas.</div><div class="ctl" style="margin-top:6px">${S ? '<button onclick="svExp(-1)">Exporter la partie en cours</button>' : ''}<label class="mu">Importer dans <select onchange="V.isl=+this.value">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${(V.isl || 1) == n ? 'selected' : ''}>Emplacement ${n}</option>`).join('')}</select></label><input type="file" accept=".json,application/json" onchange="svImp(this)" aria-label="Importer un fichier de sauvegarde"></div><div class="ctl" style="margin-top:10px"><button class="p" onclick="V.sv=0;V.sn='';render()">Fermer</button></div></div></div>`
  );
}
// Événements aléatoires d'un match (derby, rivalités, incidents).
function evRoll(M) {
  if (M.dby && (M.h == S.t || M.a == S.t))
    mail(
      (M.dby == 'C' ? '⚡ Classico : ' : '🔥 Derby : ') + M.t[0].name + ' – ' + M.t[1].name,
      M.dby == 'C'
        ? 'La grande rivalité historique : ambiance explosive, beaucoup plus d’occasions et de fautes, billetterie +40 % à domicile.'
        : 'Derby entre deux équipes de la même planète : ambiance électrique, plus d’occasions et de fautes, billetterie +20 % à domicile.',
    );
  if (S.evt === false) return;
  const A = M.t[0],
    B = M.t[1],
    us = M.h == S.t || M.a == S.t,
    r = Math.random();
  let e = null;
  if ((A.name == 'Pirates' || B.name == 'Pirates') && r < 0.09) e = 'pol';
  else if ((A.name == 'Shadows' || B.name == 'Shadows') && r < 0.09) e = 'sab';
  else {
    const q = Math.random();
    e =
      q < 0.01
        ? 'met'
        : q < 0.02
          ? 'bla'
          : q < 0.03
            ? 'sup'
            : q < 0.04
              ? 'kid'
              : us && q < 0.05
                ? 'cor'
                : null;
  }
  if (!e) return;
  M.ev = { k: e };
  const vs = A.name + ' – ' + B.name,
    hit = (t, n) => {
      const p = t.sq[t.lu[(Math.random() * t.lu.length) | 0]];
      p.inj = n;
      us && t == me() ? fixLU(t) : autoLU(t);
      return p.n;
    };
  let T0 = '',
    x0 = '';
  if (e == 'pol') {
    M.pol = 45 + 3 * ((Math.random() * 11) | 0);
    T0 = 'Descente de police';
    x0 =
      vs +
      ' : la police a débarqué pour arrêter des joueurs. Le match sera interrompu avant la fin (0-0, 1 point chacun).';
  }
  if (e == 'sab') {
    const v = A.name == 'Shadows' ? B : A,
      n = hit(v, 3);
    T0 = 'Sabotage des Ombres';
    x0 = vs + ' : ' + n + ' (' + v.name + ') a été agressé avant le match (absent 3 journées).';
  }
  if (e == 'met') {
    T0 = 'Pluie de météorites';
    x0 = vs + ' : le terrain est criblé d’impacts, le jeu sera haché (moins d’occasions).';
  }
  if (e == 'bla') {
    M.t.forEach((t) => t.lu.forEach((k) => (t.sq[k].e = Math.max(45, t.sq[k].e - 15))));
    T0 = 'Panne d’énergie du stade';
    x0 = vs + ' : une coupure de courant épuise les joueurs avant le coup d’envoi (-15 d’énergie).';
  }
  if (e == 'sup') {
    T0 = 'Invasion de supporters';
    x0 =
      vs +
      ' : des supporters envahissent le terrain.' +
      (A == me() ? ' Le club est condamné à 300 crédits d’amende.' : '');
    if (A == me()) tx('Amendes', -300);
  }
  if (e == 'kid') {
    const t = Math.random() < 0.5 ? A : B,
      n = hit(t, 2);
    T0 = 'Joueur disparu';
    x0 = vs + ' : ' + n + ' (' + t.name + ') a disparu avant le match, il manquera 2 journées.';
  }
  if (e == 'cor') {
    mail(
      'Offre suspecte avant ' + vs,
      'Un inconnu propose 800 crédits pour « faciliter » le match. Que faites-vous ?',
      [
        ['Accepter', 'br', 0],
        ['Refuser', 'nb', 0],
      ],
    );
    return;
  }
  mail((us ? 'Événement : ' : 'Actualité : ') + T0, x0);
}
// Réponse du joueur à un événement aléatoire.
function actEv(i, j) {
  const m = S.mail[i],
    a = m.a[j];
  if (a[1] == 'br') {
    tx('Pot-de-vin', 800);
    S.conf = Math.max(0, S.conf - 15);
    m.b += '\n\n→ Vous avez accepté (+800).';
    if (Math.random() < 0.4) {
      tx('Amende', -600);
      mail('Scandale', 'La ligue a découvert l’affaire : amende de 600 crédits.');
    }
  } else {
    S.conf = Math.min(100, S.conf + 5);
    m.b += '\n\n→ Vous avez refusé : le conseil apprécie votre intégrité.';
  }
  m.a = null;
  save();
  render();
}

// Textes juridiques : mentions légales, conditions d'utilisation, confidentialité, cookies.
const LEGD = {
  mn: [
    '📋',
    'Mentions légales',
    `<h3>Éditeur et nature du jeu</h3><p><b>Galactik Manager</b> (« GFM ») est un jeu de gestion <b>gratuit, sans aucun but lucratif</b>, réalisé par un fan, à titre de loisir : aucune recette, publicité, vente ni don n’est associé au jeu. Il est distribué sans publicité, sans achat intégré et sans abonnement.</p><p>Contact : utilisez le bouton « Signaler un bug / une idée » de l’accueil.</p><h3>Œuvre dont le jeu s’inspire</h3><p>Le jeu est un <b>projet de fans non officiel</b>. Il n’est ni affilié, ni approuvé, ni sponsorisé par les ayants droit de la série d’animation « Galactik Football ». Les noms, personnages, équipes et univers évoqués restent la propriété de leurs titulaires respectifs et ne sont utilisés que dans un esprit d’hommage.</p><p>Si vous êtes titulaire de droits et souhaitez demander une modification ou un retrait, contactez l’auteur par le bouton ci-dessus : il sera donné suite rapidement.</p><h3>Hébergement</h3><p>Le jeu est une page web statique. Il est hébergé sur GitHub Pages (GitHub, Inc., États-Unis) ou sur la plateforme qui vous a fourni le lien.</p><h3>Polices et bibliothèques tierces</h3><p>Les polices de caractères sont chargées depuis Google Fonts. Une bibliothèque libre (SheetJS, licence Apache 2.0) peut être chargée depuis cdnjs (Cloudflare) uniquement pour l’import/export de tableurs dans l’éditeur de mods.</p>`,
  ],
  cg: [
    '📋',
    'Conditions d’utilisation',
    `<h3>1. Objet</h3><p>Ces conditions encadrent l’usage du jeu Galactik Manager. En l’utilisant, vous les acceptez.</p><h3>2. Accès et gratuité</h3><p>Le jeu est gratuit et fourni <b>« en l’état »</b>, sans garantie de disponibilité, d’exactitude ou d’absence de bogue. Il est actuellement en <b>version bêta</b> : des fonctions peuvent changer, être supprimées ou être rééquilibrées à tout moment.</p><h3>3. Vos parties</h3><p>Vos parties sont enregistrées <b>uniquement sur votre appareil</b>. L’auteur n’y a pas accès et ne peut pas les récupérer. Pensez à les <b>exporter</b> depuis l’écran « Sauvegardes ». Une mise à jour peut rendre une ancienne sauvegarde incompatible ; les informations de compatibilité sont indiquées avant la création d’une partie.</p><h3>4. Usage acceptable</h3><p>Vous vous engagez à ne pas tenter de perturber l’hébergement du jeu, à ne pas le redistribuer comme s’il était le vôtre et à ne pas le vendre. Les mods et sauvegardes que vous créez ou partagez doivent respecter les droits des tiers.</p><h3>5. Propriété intellectuelle</h3><p>Le code et les éléments originaux du jeu appartiennent à leur auteur. Les éléments issus de l’univers « Galactik Football » appartiennent à leurs ayants droit (voir Mentions légales). Toute utilisation commerciale est interdite sans accord préalable.</p><h3>6. Retours et signalements</h3><p>Les messages envoyés via le bouton de retour sont volontaires et décrits dans la page « Confidentialité ». En envoyant une idée, vous autorisez l’auteur à l’utiliser librement dans le jeu.</p><h3>7. Responsabilité</h3><p>Dans les limites permises par la loi, l’auteur ne peut être tenu responsable de la perte de données, d’une interruption du service ou d’un dommage lié à l’usage du jeu.</p><h3>8. Modification</h3><p>Ces conditions peuvent évoluer avec le jeu. La version applicable est celle affichée ici.</p>`,
  ],
  pc: [
    '🔒',
    'Confidentialité',
    `<h3>En bref</h3><p><b>Aucun compte, aucune publicité, aucun traceur, aucune analyse d’audience.</b> Le jeu ne collecte ni ne vend de données personnelles.</p><h3>Données conservées sur votre appareil</h3><p>Le jeu enregistre dans le stockage local de votre navigateur : vos parties (sauvegarde automatique et emplacements), vos réglages (taille du texte, sons, affichage…), vos mods, et quelques repères (introduction ou visite guidée déjà vues). Ces données ne quittent <b>pas</b> votre appareil. Le nom que vous donnez à votre manager reste dans votre sauvegarde.</p><h3>Connexions à des services tiers</h3><p>Lors du chargement de la page, votre navigateur contacte <b>Google Fonts</b> (polices) et, uniquement dans l’éditeur de mods, <b>cdnjs / Cloudflare</b> (bibliothèque tableur). Ces services reçoivent, comme tout site web, votre adresse IP et des informations techniques standard, conformément à leur propre politique. L’hébergeur (GitHub Pages) peut aussi tenir des journaux techniques.</p><h3>Bouton « Signaler un bug / une idée »</h3><p>Rien n’est envoyé automatiquement. Si vous choisissez « Envoyer sur GitHub », une page GitHub s’ouvre avec votre message pré-rempli : vous le relisez et le publiez vous-même (avec votre compte GitHub, le message est alors public). Les infos techniques (version du jeu, navigateur, club et journée) ne sont jointes que si la case est cochée. Évitez d’y inscrire des informations personnelles.</p><h3>Vos droits</h3><p>Vos données étant stockées chez vous, vous gardez la main : vous pouvez les exporter, les supprimer depuis l’écran « Sauvegardes » ou en vidant les données du site dans votre navigateur. Pour toute question, utilisez le bouton de retour.</p><h3>Mineurs</h3><p>Le jeu ne demande aucune donnée personnelle ; les plus jeunes sont invités à jouer avec l’accord d’un parent.</p>`,
  ],
  ck: [
    '🛡',
    'Cookies et stockage local',
    `<h3>Cookies</h3><p>Le jeu <b>n’utilise aucun cookie</b> : ni cookie publicitaire, ni cookie de mesure d’audience, ni cookie de suivi. Aucun bandeau de consentement n’est donc nécessaire.</p><h3>Stockage local (localStorage)</h3><p>Pour fonctionner, le jeu utilise le stockage local de votre navigateur, strictement nécessaire à l’enregistrement de vos parties et de vos réglages :</p><ul><li><b>Parties</b> : sauvegarde automatique et 5 emplacements.</li><li><b>Réglages</b> : taille du texte, contraste, sons, affichage des joueurs, difficulté…</li><li><b>Mods</b> : vos personnalisations de l’éditeur.</li><li><b>Repères</b> : introduction et visite guidée déjà vues.</li></ul><p>Rien de tout cela n’est envoyé à un serveur.</p><h3>Hors-ligne (PWA)</h3><p>Si vous installez le jeu, un <i>service worker</i> peut conserver une copie des fichiers du jeu pour qu’il fonctionne sans connexion.</p><h3>Les effacer</h3><p>Supprimez vos parties depuis « Sauvegardes », ou videz les données du site dans les réglages de votre navigateur. <b>Attention</b> : cela efface définitivement vos parties non exportées.</p>`,
  ],
};
// Fenêtre qui affiche un texte juridique.
function legBox() {
  const d = LEGD[V.lg];
  if (!d) return '';
  return `<div style="position:fixed;inset:0;background:#0008;z-index:76;display:flex;align-items:center;justify-content:center;padding:12px" onclick="V.lg=0;render()"><div class="card legd" style="max-width:640px;width:100%;max-height:90vh;overflow:auto" onclick="event.stopPropagation()"><div class="ctl" style="gap:6px;margin-bottom:8px">${Object.entries(
    LEGD,
  )
    .map(
      ([k, v]) => `<button class="${k == V.lg ? 'p' : ''}" onclick="V.lg='${k}';render()">${v[1]}</button>`,
    )
    .join(
      '',
    )}</div><b style="font-size:18px">${d[0]} ${d[1]}</b><div class="mu" style="margin:2px 0 6px">Galactik Manager · version ${GV} · projet de fan gratuit</div><div class="legt">${d[2]}</div><div class="ctl" style="margin-top:12px"><button class="p" onclick="V.lg=0;render()">Fermer</button></div></div></div>`;
}
// Liens vers les textes juridiques en bas du menu.
const legLinks = () =>
  Object.entries(LEGD)
    .map(([k, v]) => `<button class="lgk" onclick="V.lg='${k}';render()">${v[1]}</button>`)
    .join('');

// Bouton « Nouvelle carrière » du menu.
function menuNew() {
  if (S) autosave();
  S = null;
  save();
  V.menu = 0;
  render();
}
// Bouton « Visite guidée » du menu.
function menuTour() {
  try {
    localStorage.removeItem('gmtour');
  } catch (e) {}
  V.menu = 0;
  if (S) tourGo(0);
  else render();
}
// Consommation de Fluide pendant un match.
function fz(M, s, f) {
  const t = M.t[s],
    m = t.fo ?? 1,
    df = M.sc[s] - M.sc[1 - s],
    late = M.min >= 60,
    p = Math.max(
      0.12,
      Math.min(
        0.9,
        [0.38, 0.56, 0.74][m] +
          (f - 60) / 500 +
          ((t.m ?? 1) - 1) * 0.04 +
          ((t.pr ?? 1) - 1) * 0.03 +
          (df < 0 ? (late ? 0.1 : 0.05) : df > 0 ? (late ? -0.08 : -0.03) : 0) +
          (m == 0 && late ? 0.2 : 0),
      ),
    );
  if (Math.random() >= p) return false;
  (M.fu = M.fu || [0, 0])[s]++;
  t.lu.forEach((k) => {
    t.sq[k].e = Math.max(40, t.sq[k].e - [0.15, 0.3, 0.6][m]);
  });
  return true;
}
// Liste « Usage du Fluide » (économisé, modéré, abondance).
const foSel = () =>
  `<label>Usage du Fluide <select onchange="me().fo=+this.value;save()">${['Économisé', 'Modéré', 'Abondance'].map((m, i) => `<option value="${i}" ${(me().fo ?? 1) == i ? 'selected' : ''}>${m}</option>`).join('')}</select></label>${hp('fo')}`;
// Affiche un écran de chargement court puis exécute une action.
function load(m, f) {
  if (V.ld) return;
  V.ld = m;
  render();
  setTimeout(() => {
    V.ld = null;
    f();
  }, 800);
}
// Écran de chargement.
const ldBox = () =>
  V.ld
    ? `<div style="position:fixed;inset:0;background:#000a;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;gap:12px"><div class="spin"></div><div>${V.ld}</div></div>`
    : '';

// Deux listes de rôles (avec et sans ballon) pour un titulaire de l'écran Tactique.
function roleRow(li, g) {
  const p = me().sq[li],
    o = (ph) =>
      ROLES[g][ph == 're' ? 'ep' : 'sp']
        .map((R, j) => `<option value="${j ? g + ':' + j : ''}" ${(p[ph] || '') == (j ? g + ':' + j : '') ? 'selected' : ''}>${R[0]}${j ? ' ' + '★'.repeat(roleStars(p, R)) : ''}</option>`)
        .join('');
  return rolePk(li, 're', [g], 1) + rolePk(li, 'rs', [g], 1);
}
// Génère parfois une offre d'un autre club pour un de tes joueurs.
function genOffer() {
  const t = me();
  if (Math.random() > 0.022 || sqN(t) <= 11) return;
  const c = t.sq.filter((p) => !p.ln),
    w = c.map((p) => Math.max(1, p.o - 45));
  let r = Math.random() * w.reduce((a, b) => a + b),
    k = 0;
  while ((r -= w[k]) > 0) k++;
  const p = c[k],
    cl = S.teams.map((x, i) => i).filter((i) => i != S.t && S.teams[i].sq.length < 15);
  if (!p || !cl.length) return;
  const ci = cl[(Math.random() * cl.length) | 0],
    cn = S.teams[ci].name,
    fee = Math.round(price(p) * (0.9 + Math.random() * 0.5)),
    st = t.lu.some((i) => t.sq[i] === p);
  ensure(p);
  const lv = (n) => (T.find((x) => x[0] == n) || [0, 10])[1],
    ls = lv(cn) - lv(t.name),
    sc =
      0.45 +
      ls * 0.04 +
      (st ? -0.15 : 0.25) +
      (p.age >= 30 ? 0.1 : 0) +
      (p.ct <= 1 ? 0.1 : 0) +
      (p.mo < 35 ? 0.2 : p.mo > 70 ? -0.1 : 0);
  if (Math.random() > Math.max(0.1, Math.min(0.9, sc))) {
    mail(
      'Offre repoussée par ' + p.n,
      cn +
        ' proposait ' +
        fee +
        ' crédits pour ' +
        p.n +
        ', mais le joueur refuse de partir : ' +
        (st ? 'il est titulaire et veut rester.' : 'il croit encore à son avenir ici.'),
    );
    return;
  }
  mail(
    'Offre de ' + cn + ' pour ' + p.n,
    cn +
      ' propose ' +
      fee +
      ' crédits (valeur : ' +
      price(p) +
      '). ' +
      p.n +
      ' est prêt à partir : ' +
      (st
        ? 'il cherche un nouveau défi.'
        : ls > 0
          ? 'il y voit plus de temps de jeu et un meilleur club.'
          : 'il veut plus de temps de jeu.') +
      ' Vous pouvez accepter, faire une contre-proposition (le club peut refuser) ou refuser.',
    [
      ['Accepter (' + fee + ')', 'ofA'],
      ['Contre +20 % (' + Math.round(fee * 1.2) + ')', 'ofC1'],
      ['Contre +40 % (' + Math.round(fee * 1.4) + ')', 'ofC2'],
      ['Refuser', 'ofN'],
    ],
  );
  S.mail[0].o = { n: p.n, c: ci, fee };
}
// Réponse à une offre d'un autre club.
function actOf(i, j) {
  const m = S.mail[i],
    a = m.a[j],
    o = m.o,
    t = me(),
    k = t.sq.findIndex((p) => p.n == o.n),
    c = S.teams[o.c];
  m.a = null;
  if (a[1] == 'ofN') {
    m.b += '\n\n→ Offre refusée.';
    save();
    return render();
  }
  if (k < 0 || sqN(t) <= 11 || c.sq.length >= 15) {
    m.b += '\n\n→ Transfert impossible (joueur indisponible, effectif minimum ou club complet).';
    save();
    return render();
  }
  let fee = o.fee;
  if (a[1] != 'ofA') {
    const f = a[1] == 'ofC1' ? 1.2 : 1.4;
    if (Math.random() >= (f == 1.2 ? 0.6 : 0.15)) {
      m.b += '\n\n→ Contre-proposition (' + Math.round(o.fee * f) + ') : le club retire son offre.';
      save();
      return render();
    }
    fee = Math.round(o.fee * f);
    m.b += '\n\n→ Contre-proposition acceptée par le club.';
  }
  V.sel = null;
  const p = t.sq[k],
    nm = t.lu.map((x) => t.sq[x].n);
  tx('Transferts', fee);
  tlog('out', p, c.name, fee);
  t.sq.splice(k, 1);
  c.sq.push(p);
  join(p, c);
  t.lu = nm.map((n) => t.sq.findIndex((q) => q.n == n));
  if (t.lu.includes(-1)) autoLU(t);
  mail('Transfert conclu', p.n + ' rejoint ' + c.name + ' pour ' + fee + ' crédits.');
  autoLU(c);
  save();
  render();
}
// Rivalités entre équipes (derbys).
const RIV = [
    // Classicos : les grandes rivalités historiques (les derbys sont les équipes d'une même planète).
    ['Snow Kids', 'Shadows'],
    ['Lightnings', 'Xenons'],
    ['Technodroids', 'Vortex'],
    ['Pirates', 'Shadows'],
  ],
  // Renvoie 'C' (classico), 'D' (derby : même planète) ou '' (match ordinaire).
  rivK = (a, b) =>
    RIV.some(([x, y]) => (x == a && y == b) || (x == b && y == a)) ? 'C' : a != b && planet(a) == planet(b) ? 'D' : '',
  isDerby = (a, b) => !!rivK(a, b);
// Après un match : met à jour le moral des joueurs (victoire, défaite, confiance).
function moral(M) {
  const t = me(),
    i = M.t.indexOf(t);
  if (i < 0) return;
  const g = M.sc[i],
    c = M.sc[1 - i],
    d = g > c ? 3 + mgb('mw') : g < c ? -3 + mgb('ml') : 0;
  t.sq.forEach((p, k) => {
    const st = t.lu.includes(k);
    p.mo = Math.max(0, Math.min(100, (p.mo ?? 60) + (st ? d + 1 : p.o >= 65 ? -2 : -1)));
    if (p.mo < 25 && p.o >= 65 && !p.rq && !st) {
      p.rq = 1;
      mail(p.n + ' est mécontent', p.n + ' se plaint de son temps de jeu et pourrait demander à partir.', [
        ['Le rassurer (+15 moral)', 'mo', 0],
        ['Ignorer', 'no2', 0],
      ]);
      S.mail[0].o = { n: p.n };
    }
  });
}
// Réponse du joueur à un mail de moral.
function actMo(i, j) {
  const m = S.mail[i],
    a = m.a[j],
    p = me().sq.find((x) => x.n == m.o.n);
  if (a[1] == 'mo' && p) {
    p.mo = Math.min(100, (p.mo || 0) + 15);
    m.b += '\n\n→ Vous l’avez rassuré.';
  } else m.b += '\n\n→ Vous avez ignoré sa demande.';
  m.a = null;
  save();
  render();
}
// Entraînement quotidien : les joueurs progressent selon l'axe choisi et le staff.
function train() {
  const t = me();
  t.sq.forEach((p) => {
    ensure(p);
    const y = p.age <= 24 ? 1.5 : p.age <= 29 ? 1 : 0.5,
      it = [0.5, 1, 1.8][p.in ?? 1];
    p.xp =
      (p.xp || 0) +
      (((3 + stL('c')) * y * it) / 7) * (1 + skV('f1') + mgb('tx') + (p.age <= 24 ? mgb('ty') : 0));
    if ((p.in ?? 1) == 2) p.e = Math.max(45, p.e - 0.5);
    if ((p.in ?? 1) == 0) p.e = Math.min(100, p.e + 0.5);
    // Reconversion de poste : progresse chaque jour (pause si « Repos », plus vite en « Intensif »).
    if (p.rc) {
      p.rc.left -= [0, 1, 1.6][p.in ?? 1];
      if (p.rc.left <= 0) {
        const to = p.rc.to;
        mail('Reconversion terminée : ' + p.n, p.n + ' joue désormais au poste de ' + POSN[to] + '.');
        p.p = to;
        delete p.rc;
      }
    }
    const cp = ptCap(p);
    if (p.o >= cp) p.xp = Math.min(p.xp, 100);
    else if (p.xp >= 100) {
      p.xp -= 100;
      p.o++;
      p.ab = p.ab || {};
      const f = p.fc ?? 0;
      p.ab[f] = Math.min(6, (p.ab[f] || 0) + 2);
      if (p.o >= 70)
        mail('Progression : ' + p.n, p.n + ' passe au niveau ' + p.o + ' grâce à l’entraînement.');
    }
  });
}
// RECONVERSION : un joueur de champ apprend un nouveau poste. Durée selon l'âge ; les gardiens sont exclus.
const POSN = { GK: 'gardien', DEF: 'défenseur', MID: 'milieu', ATT: 'attaquant' };
const rcDays = (p) => (p.age <= 21 ? 14 : p.age <= 26 ? 21 : p.age <= 30 ? 28 : 35);
function startRc(i, to) {
  const p = me().sq[i];
  if (!p || p.p == 'GK' || !to || to == 'GK' || to == p.p) return;
  p.rc = { to, left: rcDays(p), tot: rcDays(p) };
  save();
  render();
}
function stopRc(i) {
  const p = me().sq[i];
  if (p) delete p.rc;
  save();
  render();
}
// Section « Entraînement » de la fiche d'un joueur.
function trainSec(p, i) {
  ensure(p);
  const sel = (arr, v, fn) =>
    `<select onchange="${fn}">${arr.map((n, j) => `<option value="${j}" ${v == j ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  return `<h2>Entraînement</h2><div class="ctl"><label>Intensité ${sel(['Repos', 'Normal', 'Intensif'], p.in ?? 1, `me().sq[${i}].in=+this.value;save();render()`)}</label><label>Axe ${sel(p.p == 'GK' ? AT.map((n, j) => (j == 1 ? 'Réflexes' : n)) : AT, p.fc ?? 0, `me().sq[${i}].fc=+this.value;save()`)}</label></div><div class="mu" style="margin-top:8px">Progression vers +1 niveau : ${p.o >= ptCap(p) ? (p.o >= 95 ? 'niveau maximum' : 'potentiel atteint, plus de progression') : Math.round(p.xp || 0) + '/100'}</div>${xpB(p, 'w')}<div class="mu" style="margin-top:4px">Intensif = progrès plus rapides mais plus de fatigue.</div>${rcSec(p, i)}`;
}
// Bloc « Reconversion de poste » de la fiche joueur.
function rcSec(p, i) {
  if (p.p == 'GK') return '<h3 style="margin:12px 0 4px">Reconversion</h3><div class="mu">Un gardien ne peut pas changer de poste.</div>';
  const pct = p.rc ? Math.round(100 * (1 - Math.max(0, p.rc.left) / p.rc.tot)) : 0,
    opts = ['DEF', 'MID', 'ATT'].filter((g) => g != p.p);
  return `<h3 style="margin:12px 0 4px">Reconversion de poste${hp('rc')}</h3>${
    p.rc
      ? `<div class="mu">Il apprend le poste de <b>${POSN[p.rc.to]}</b> : ${pct} % (encore ${Math.max(1, Math.ceil(p.rc.left))} jours à intensité Normal). Au nouveau poste son malus diminue peu à peu ; à son poste actuel il est un peu moins efficace (−5 %).</div><div class="gg2" style="height:8px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden;margin:6px 0"><i style="display:block;height:100%;width:${pct}%;background:#b78bff"></i></div><div class="ctl"><button onclick="stopRc(${i})">Annuler la reconversion</button></div>`
      : `<div class="ctl"><label>Nouveau poste <select id="rcs${i}">${opts.map((g) => `<option value="${g}">${POSN[g][0].toUpperCase() + POSN[g].slice(1)}</option>`).join('')}</select></label><button class="p" onclick="startRc(${i},document.getElementById('rcs${i}').value)">Lancer (${rcDays(p)} jours)</button></div><div class="mu" style="margin-top:4px">Durée selon l’âge. Le joueur garde son poste jusqu’à la fin.</div>`
  }`;
}
// Convertit un numéro de jour en date.
const dateOf = (d) => dOf((S && S.ctx) || 'L', d),
  fmtDay = (n) =>
    new Date(Date.UTC(2026 + (S.season || 1) - 1, 7, 1 + (n || 0))).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }),
  ACH = {
    s5: 'Invaincu sur 5 matchs',
    der: 'Roi du derby',
    cash: 'Mécène (20 000 crédits)',
    st: 'Stade de légende',
    star: 'Une étoile est née (niveau 80)',
    champ: 'Champion de la ligue',
    dyn: 'Dynastie (2 titres)',
    cup: 'Coupe en poche',
  };
// Renvoie les deux équipes du prochain match.
function nxI() {
  const e = nextEv();
  if (!e) return null;
  if (e[0] == 'N')
    return [
      { em: '🌑', name: 'Duel nocturne' },
      { em: '', name: 'à l’Arène' },
    ];
  const D = e[0] != S.ctx && S.alt ? S.alt : S,
    m = D.fx[D.md] && D.fx[D.md].find(([h, b]) => h == D.t || b == D.t);
  return m ? [D.teams[m[0]], D.teams[m[1]]] : null;
}
// Bouton « Jouer le match ».
// Mails dont une réponse est attendue (hors contenus cachés, hors mails de plus de 10 jours).
function mailReq() {
  if (!S || !S.mail) return [];
  const r = [];
  S.mail.forEach((m, i) => {
    if (m.x || (m.dt != null && (S.day || 0) - m.dt > 10)) return;
    try {
      if (m.a && m.a.length) {
        if (m.a.some((a) => /^(qa|qr|br|nb)/.test(String(a[1])))) return;
        r.push(i);
      } else if (reps(m).length) r.push(i);
    } catch (e) {}
  });
  return r;
}
// Si une réponse est attendue : redirige vers le mail concerné et bloque la suite de la partie.
function mailGate() {
  const r = mailReq();
  if (!r.length) return false;
  V.tab = 'mail';
  V.mf = 'in';
  V.mq = '';
  V.ms = [];
  V.sb = 0;
  V.mo = r[r.length - 1];
  S.mail[V.mo].u = 0;
  try {
    ntf({ i: 'mail', l: 'Réponse requise', t: S.mail[V.mo].t, s: 'Répondez pour continuer la partie', tp: 'm', go: 'mail' });
  } catch (e) {}
  render();
  return true;
}
function playEv() {
  if (mailGate()) return;
  const e = nextEv();
  if (e && e[0] == 'N') return nbGo();
  ensureCtx();
  startMD();
}

// AVANCE D'UN JOUR : récupération, entraînement, offres, mails…
function dayTick() {
  S.day++;
  const U = new Set(),
    mine = [S.teams[S.t], S.alt && S.alt.teams[S.alt.t]];
  [S.teams, S.alt ? S.alt.teams : []].forEach((a) =>
    a.forEach((t) =>
      t.sq.forEach((p) => {
        if (!U.has(p)) {
          U.add(p);
          p.e = Math.min(
            100,
            p.e + 2 + (mine.includes(t) ? stL('k') * 0.5 + skV('v2') + mgb('en') * 0.5 : 0),
          );
        }
      }),
    ),
  );
  train();
  acTick();
  negTick();
  if (S.ctx != 'C') aiTransfers();
  if (S.ctx != 'C') genOffer();
  mdPre();
}
// TRANSFERTS ENTRE CLUBS : de temps en temps, un club adverse vend un remplaçant à un autre club.
// Chaque transfert est enregistré dans S.lt (tableau « Transferts de la Ligue »).
function aiTransfers() {
  try {
    if (!S.teams || Math.random() > 0.15) return;
    const mine = me(),
      ok = (t) => t !== mine && t.sq && !t.nat && t.name != MKD.n,
      T = S.teams.filter(ok),
      sellers = T.filter((t) => t.sq.length > 11),
      s = sellers[(Math.random() * sellers.length) | 0];
    if (!s) return;
    const c = s.sq.filter((p, i) => !s.lu.includes(i) && !p.c && !p.pr && !p.rare && !p.ln && !isCap(p, s));
    if (!c.length) return;
    const p = c[(Math.random() * c.length) | 0],
      buyers = T.filter((t) => t !== s && t.sq.length < 15);
    if (!buyers.length) return;
    const b = buyers[(Math.random() * buyers.length) | 0],
      worst = Math.min(...b.lu.map((i) => (b.sq[i] ? b.sq[i].o : 99)));
    if (p.o + 4 < worst) return;
    const fee = Math.max(10, Math.round(price(p) * (0.85 + Math.random() * 0.35)));
    rmP(s, p);
    b.sq.push(p);
    join(p, b);
    autoLU(b);
    S.lt = S.lt || [];
    S.lt.unshift({ n: p.n, p: p.p, r: p.o, f: s.name, t: b.name, a: fee, s: S.season, d: S.day });
    if (S.lt.length > 40) S.lt.length = 40;
  } catch (e) {}
}
// Change automatiquement de compétition (League/Cup) à la date d'un match de l'autre.
function autoCtx() {
  try {
    if (!S || S.mode != 'D' || !S.alt || (V.m && !V.m.done)) return;
    const e = nextEv(),
      want = e && e[0] != 'N' && S.day >= e[1] ? e[0] : S.ctx;
    if (want != S.ctx) {
      swapRaw();
      natSyncAll();
      V.sel = null;
      V.mk = null;
      V.pf = null;
      V.tab = 'ov';
    }
  } catch (x) {}
}

// Bouton « Continuer » : fait passer UN jour à la fois (un clic = un jour), jusqu'au jour du match.
function skipDays() {
  if (mailGate()) return;
  const e = nextEv();
  if (e && S.day < e[1]) dayTick();
  autoCtx();
  save();
  render();
}
// Transferts entre équipes gérées par l'ordinateur.
function aiMarket() {
  const ai = S.teams.map((t, i) => i).filter((i) => i != S.t);
  for (let k = 0; k < 2; k++) {
    const a = S.teams[ai[(Math.random() * ai.length) | 0]],
      b = S.teams[ai[(Math.random() * ai.length) | 0]];
    if (a === b || a.sq.length <= 11 || b.sq.length >= 15) continue;
    const c = a.sq.filter((p, i) => !a.lu.includes(i) && !p.ln);
    if (!c.length) continue;
    const p = c[(Math.random() * c.length) | 0];
    a.sq.splice(a.sq.indexOf(p), 1);
    b.sq.push(p);
    join(p, b);
    autoLU(a);
    if (p.o >= 70) mail('Transfert : ' + p.n, p.n + ' (' + a.name + ') rejoint ' + b.name + '.');
  }
}
// Carrière du joueur : palmarès, objectifs, licenciement possible.
function career(M) {
  const i = M.t.indexOf(me());
  if (i < 0) return;
  const g = M.sc[i],
    c = M.sc[1 - i];
  S.pal = S.pal || [];
  S.ach = S.ach || {};
  const A = (id, t) => {
    if (!S.ach[id]) {
      S.ach[id] = 1;
      skXp(40);
      mail('🏆 Succès : ' + t, 'Vous débloquez « ' + t + ' ».');
    }
  };
  if (S.form.slice(-5) == 'VVVVV') A('s5', ACH.s5);
  if (g > c && M.dby) {
    A('der', ACH.der);
    if (S.ob) S.ob.dw = (S.ob.dw || 0) + 1;
  }
  if (S.cash >= 20000) A('cash', ACH.cash);
  if (S.st >= 5) A('st', ACH.st);
  if (me().sq.some((p) => p.o >= 80)) A('star', ACH.star);
  if (S.conf <= 5 && S.md >= 8 && !S.fired) S.fired = 1;
  if (S.md >= S.fx.length) {
    const o = stdg(grpOf(me())),
      rk = o.indexOf(me()) + 1;
    S.pal.push({ s: S.season, club: me().name, r: rk, pts: me().pts, cup: null });
    if (rk == 1 && S.ctx != 'C') {
      S.titles = (S.titles || 0) + 1;
      A('champ', ACH.champ);
      if (S.titles >= 2) A('dyn', ACH.dyn);
    }
    if (S.conf <= 15 && rk > S.obj && S.ctx != 'C') S.fired = 1;
  }
}
// Fenêtre « Licencié » en cas de résultats insuffisants.
const frBox = () =>
  S && S.fired
    ? `<div style="position:fixed;inset:0;background:#000c;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px"><div class="card" style="max-width:420px;text-align:center"><div style="font-size:40px">📉</div><b style="font-size:18px">Vous êtes licencié</b><p class="mu">Le conseil d’administration a perdu confiance : résultats insuffisants et objectif manqué.</p><div class="ctl" style="justify-content:center">${S.lc ? '' : '<button onclick="S.fired=0;S.lc=1;S.conf=30;save();render()">🙏 Dernière chance</button>'}<button class="p" onclick="autosave();S=null;save();V.menu=1;render()">🏠 Menu</button></div></div></div>`
    : '';
// COMPÉTENCES DE MANAGER : branches (Relations, Vestiaire…) et leurs arbres de compétences.
const SKB = {
    r: {
      n: 'Relations',
      e: '🏛',
      c: '#d6336c',
      w: ['Odile Marchand', 'présidente du conseil'],
      hi: '« Votre réputation vous précède, manager. Le conseil vous écoutera davantage. »',
      g: [
        'Le conseil vous accorde un vote de confiance : +5 % de confiance.',
        'Odile plaide votre cause devant les actionnaires : +8 % de confiance.',
        'Le conseil vous cite en exemple : +12 % de confiance.',
      ],
    },
    v: {
      n: 'Vestiaire',
      e: '👥',
      c: '#1c9d6a',
      w: ['Haru Okamoto', 'médecin du club'],
      hi: '« Un groupe soudé guérit plus vite. Je m’occupe du vestiaire, vous gérez le reste. »',
      g: [
        'Haru organise une séance de cohésion : +8 de moral pour tout l’effectif.',
        'Une soirée d’équipe réussie : +10 de moral pour tout l’effectif.',
        'Le vestiaire vous suivrait n’importe où : +12 de moral pour tout l’effectif.',
      ],
    },
    t: {
      n: 'Tactique',
      e: '📋',
      c: '#e07b00',
      w: ['Brenn Castellan', 'entraîneur adjoint'],
      hi: '« J’ai passé la nuit sur les vidéos. On va leur préparer une surprise. »',
      g: [
        'Brenn partage ses dossiers vidéo : +40 d’expérience pour chaque joueur.',
        'Une séance tactique poussée : +60 d’expérience pour chaque joueur.',
        'Brenn vous confie tout son carnet : +80 d’expérience pour chaque joueur.',
      ],
    },
    f: {
      n: 'Formation',
      e: '🎓',
      c: '#7a3df5',
      w: ['Tiana Roux', 'directrice de l’académie'],
      hi: '« Les jeunes ont faim de jouer. Donnez-leur une chance, ils vous la rendront. »',
      g: [
        'Tiana vous présente deux pépites de l’académie.',
        'Nouvelle fournée de talents : deux jeunes rejoignent l’effectif.',
        'Tiana vous réserve ses meilleurs espoirs : deux jeunes rejoignent l’effectif.',
      ],
    },
    c: {
      n: 'Finances',
      e: '💰',
      c: '#0a8fb5',
      w: ['Gaspard Lorin', 'trésorier du club'],
      hi: '« Chaque crédit compte. Je vais vous trouver quelques économies. »',
      g: [
        'Gaspard débloque une réserve : +600 crédits.',
        'Un mécène séduit par vos comptes : +1 000 crédits.',
        'Gaspard clôt un excellent exercice : +1 500 crédits.',
      ],
    },
  },
  SKK = ['r', 'v', 't', 'f', 'c'],
  SKT = {
    r: [
      {
        id: 'r1',
        n: 'Diplomate',
        d: 'Une défaite fait moins baisser la confiance du conseil.',
        e: [0, 1, 2, 3],
        t: ['', 'Défaite : −2 de confiance', 'Défaite : −1 de confiance', 'Défaite : aucune perte'],
      },
      {
        id: 'r2',
        n: 'Réseau',
        d: 'Vos contrats de sponsoring rapportent davantage.',
        pre: 'r1',
        e: [0, 0.05, 0.1, 0.15],
        t: ['', 'Sponsors +5 %', 'Sponsors +10 %', 'Sponsors +15 %'],
      },
      {
        id: 'r3',
        n: 'Popularité',
        d: 'Une victoire fait monter plus fort la confiance du conseil.',
        pre: 'r2',
        e: [0, 1, 2, 3],
        t: ['', 'Victoire : +4 de confiance', 'Victoire : +5 de confiance', 'Victoire : +6 de confiance'],
      },
      {
        id: 'r4',
        n: 'Légende vivante',
        d: 'La confiance du conseil ne peut plus descendre sous 10 %, et la prime d’objectif augmente de 25 %.',
        cap: 'champ',
        e: [0, 1],
        t: ['', 'Plancher de confiance 10 % · prime +25 %'],
      },
    ],
    v: [
      {
        id: 'v1',
        n: 'Esprit d’équipe',
        d: 'Le moral de tout l’effectif progresse après chaque match.',
        e: [0, 0.5, 1, 1.5],
        t: ['', '+0,5 de moral par match', '+1 de moral par match', '+1,5 de moral par match'],
      },
      {
        id: 'v2',
        n: 'Récupération',
        d: 'Les joueurs récupèrent plus d’énergie chaque jour.',
        pre: 'v1',
        e: [0, 0.5, 1, 1.5],
        t: ['', '+0,5 d’énergie par jour', '+1 d’énergie par jour', '+1,5 d’énergie par jour'],
      },
      {
        id: 'v3',
        n: 'Infirmerie',
        d: 'Chaque blessure a une chance d’être raccourcie d’une journée après chaque match.',
        pre: 'v2',
        e: [0, 0.25, 0.5, 0.75],
        t: ['', '25 % de chance par match', '50 % de chance par match', '75 % de chance par match'],
      },
      {
        id: 'v4',
        n: 'Roi du vestiaire',
        d: 'Plus aucun joueur ne tombe sous 30 de moral : fini les demandes de départ pour temps de jeu.',
        cap: 'der',
        e: [0, 1],
        t: ['', 'Moral plancher à 30'],
      },
    ],
    t: [
      {
        id: 't1',
        n: 'Plan de jeu',
        d: 'Renforce la défense et l’attaque de votre équipe en match.',
        e: [0, 0.6, 1.2, 1.8],
        t: ['', 'Défense et attaque +0,6', 'Défense et attaque +1,2', 'Défense et attaque +1,8'],
      },
      {
        id: 't2',
        n: 'Moteur du milieu',
        d: 'Renforce le milieu de terrain en match.',
        pre: 't1',
        e: [0, 0.6, 1.2, 1.8],
        t: ['', 'Milieu +0,6', 'Milieu +1,2', 'Milieu +1,8'],
      },
      {
        id: 't3',
        n: 'Mur de gardien',
        d: 'Renforce le gardien et sa ligne de défense en match.',
        pre: 't2',
        e: [0, 0.6, 1.2, 1.8],
        t: ['', 'Gardien +0,6', 'Gardien +1,2', 'Gardien +1,8'],
      },
      {
        id: 't4',
        n: 'Maître stratège',
        d: 'Chaque ligne de l’équipe gagne +1 en match, en plus des autres bonus tactiques.',
        cap: 's5',
        e: [0, 1],
        t: ['', 'Toutes les lignes +1'],
      },
    ],
    f: [
      {
        id: 'f1',
        n: 'Pédagogue',
        d: 'Vos joueurs progressent plus vite à l’entraînement.',
        e: [0, 0.1, 0.2, 0.3],
        t: ['', 'Entraînement +10 %', 'Entraînement +20 %', 'Entraînement +30 %'],
      },
      {
        id: 'f2',
        n: 'Dénicheur',
        d: 'Les joueurs proposés sur le marché des transferts sont meilleurs.',
        pre: 'f1',
        e: [0, 1, 2, 3],
        t: ['', 'Marché +1 de niveau', 'Marché +2 de niveau', 'Marché +3 de niveau'],
      },
      {
        id: 'f3',
        n: 'Jeunes loups',
        d: 'Les jeunes talents du centre de formation arrivent plus forts.',
        pre: 'f2',
        e: [0, 2, 4, 6],
        t: ['', 'Jeunes +2 de niveau', 'Jeunes +4 de niveau', 'Jeunes +6 de niveau'],
      },
      {
        id: 'f4',
        n: 'Académie d’élite',
        d: 'Le centre de formation recrute trois jeunes au lieu de deux, chacun avec +3 de niveau.',
        cap: 'star',
        e: [0, 1],
        t: ['', '3 jeunes par fournée · +3 de niveau'],
      },
    ],
    c: [
      {
        id: 'c1',
        n: 'Billetterie',
        d: 'La billetterie rapporte davantage à chaque match à domicile.',
        e: [0, 0.05, 0.1, 0.15],
        t: ['', 'Billetterie +5 %', 'Billetterie +10 %', 'Billetterie +15 %'],
      },
      {
        id: 'c2',
        n: 'Négociateur',
        d: 'Les salaires versés coûtent moins cher au club.',
        pre: 'c1',
        e: [0, 0.04, 0.08, 0.12],
        t: ['', 'Salaires −4 %', 'Salaires −8 %', 'Salaires −12 %'],
      },
      {
        id: 'c3',
        n: 'Boutique',
        d: 'La boutique du club rapporte davantage.',
        pre: 'c2',
        e: [0, 0.06, 0.12, 0.18],
        t: ['', 'Boutique +6 %', 'Boutique +12 %', 'Boutique +18 %'],
      },
      {
        id: 'c4',
        n: 'Magnat',
        d: 'Une prime de 1 000 crédits est versée à la fin de chaque saison.',
        cap: 'cash',
        e: [0, 1],
        t: ['', '+1 000 crédits par saison'],
      },
    ],
  },
  SKN = {};
SKK.forEach((b) =>
  SKT[b].forEach((n) => {
    n.b = b;
    SKN[n.id] = n;
  }),
);
Object.assign(HELP, {
  sk: 'À chaque niveau, vous gagnez un point de compétence. Spécialisation : vous ne pouvez investir que dans 2 branches sur 5. Les personnages des branches choisies gagnent en confiance et vous font des cadeaux.',
  sk_xp:
    'L’expérience vient des matchs (victoire 30, nul 12, défaite 6, derby +10), des succès (+40) et des bilans de saison.',
});
SKK.forEach((b) =>
  SKT[b].forEach((n) => {
    HELP['sk_' + n.id] =
      n.d +
      (n.cap
        ? ' Nécessite le succès « ' + ACH[n.cap] + ' » et 6 points dans la branche (coût : 2 points).'
        : n.pre
          ? ' Nécessite « ' + SKN[n.pre].n + ' ».'
          : '');
  }),
);
// Accès aux points de compétence de la partie.
const SK = () => {
    S.sk = S.sk || { xp: 0, r: {}, ch: {}, g: {}, rs: 0 };
    return S.sk;
  },
  skR = (x) => Math.floor(x) + (Math.random() < x % 1 ? 1 : 0),
  skV = (id) => {
    if (typeof S === 'undefined' || !S || !S.sk) return 0;
    const r = S.sk.r[id] || 0;
    return r ? SKN[id].e[r] : 0;
  },
  skL = (id) => skV(id) + skV('t4'),
  skM = (c) =>
    (c == 'Billetterie'
      ? 1 + skV('c1')
      : c == 'Boutique'
        ? 1 + skV('c3')
        : c == 'Salaires'
          ? 1 - skV('c2')
          : c == 'Sponsors'
            ? 1 + skV('r2')
            : 1) *
    (['Billetterie', 'Boutique', 'Sponsors', 'Droits TV', 'Primes de victoire'].includes(c)
      ? 1 + mgb('inc')
      : 1) *
    (c == 'Sponsors' || c == 'Boutique' ? 1 + mgb('spn') : 1),
  skLv = () => {
    let n = 0;
    const x = SK().xp;
    while (n < 24 && 25 * (n + 1) * (n + 2) <= x) n++;
    return n + 1;
  },
  skCum = (L) => 25 * (L - 1) * L,
  skCost = (n) => (n.cap ? 2 : 1),
  skBp = (b) => SKT[b].reduce((s, n) => s + (SK().r[n.id] || 0) * skCost(n), 0),
  skAct = () => SKK.filter((b) => skBp(b) > 0),
  skSp = () => SKK.reduce((s, b) => s + skBp(b), 0),
  skPts = () => skLv() - skSp(),
  skTr = (b) => Math.min(100, skBp(b) * 8 + (SK().ch[b] || 0));
// Ajoute de l'expérience de manager ; un niveau donne un point de compétence.
function skXp(n) {
  const K = SK(),
    a = skLv();
  K.xp += n;
  const b = skLv();
  if (b > a)
    mail(
      'Niveau ' + b + ' de manager',
      'Votre expérience vous fait passer au niveau ' +
        b +
        '. Un point de compétence est disponible dans l’onglet Manager.',
    );
}
// Vérifie si une compétence peut être achetée.
function skCan(id) {
  const n = SKN[id],
    b = n.b,
    K = SK(),
    r = K.r[id] || 0,
    mx = n.cap ? 1 : 3;
  if (r >= mx) return [0, 'Rang maximal'];
  if (!skBp(b) && skAct().length >= 2) return [0, 'Spécialisation : 2 branches déjà choisies'];
  if (n.cap) {
    if (!(S.ach || {})[n.cap]) return [0, 'Débloquez le succès « ' + ACH[n.cap] + ' »'];
    if (skBp(b) < 6) return [0, 'Investissez 6 points dans la branche'];
  } else if (n.pre && !K.r[n.pre]) return [0, 'Demande « ' + SKN[n.pre].n + ' »'];
  if (skPts() < skCost(n)) return [0, 'Points insuffisants (' + skCost(n) + ' requis)'];
  return [1, ''];
}
// Achète un rang de compétence.
function skBuy(id) {
  const [ok] = skCan(id);
  if (!ok) return;
  const K = SK(),
    n = SKN[id],
    b = n.b,
    first = !skBp(b);
  K.r[id] = (K.r[id] || 0) + 1;
  if (first) {
    const B = SKB[b];
    mail(B.w[0] + ' · ' + B.w[1], B.hi);
  }
  V.skm = '';
  save();
  render();
}
// Remet les compétences à zéro (coûte 600 crédits).
function skReset() {
  const K = SK(),
    c = 600;
  if (!V.skr) {
    V.skr = 1;
    V.skm = '';
    render();
    return;
  }
  V.skr = 0;
  if (S.cash < c) {
    V.skm = 'Fonds insuffisants : ' + c + ' crédits requis.';
    render();
    return;
  }
  tx('Coaching', -c);
  K.r = {};
  K.rs = (K.rs || 0) + 1;
  V.skm = 'Compétences réinitialisées : tous vos points sont à nouveau disponibles.';
  save();
  render();
}
// Cadeau de bonus lors du déblocage d'une branche.
function skGift(b, t) {
  const B = SKB[b],
    p = me();
  if (b == 'r') S.conf = Math.min(100, S.conf + [5, 8, 12][t]);
  else if (b == 'v') p.sq.forEach((x) => (x.mo = Math.min(100, (x.mo ?? 60) + [8, 10, 12][t])));
  else if (b == 't') p.sq.forEach((x) => (x.xp = (x.xp || 0) + [40, 60, 80][t]));
  else if (b == 'f') youth();
  else tx('Mécénat', [600, 1000, 1500][t]);
  mail(B.w[0] + ' · ' + B.w[1], B.g[t]);
}
// Effets des compétences après chaque match.
function skTick(M) {
  const i = M.t.indexOf(me());
  if (i < 0) return;
  const K = SK(),
    t = me(),
    g = M.sc[i],
    c = M.sc[1 - i],
    k = g > c ? 'V' : g < c ? 'D' : 'N';
  skXp((k == 'V' ? 30 : k == 'N' ? 12 : 6) + (M.dby == 'C' ? 15 : M.dby ? 10 : 0) + (k == 'V' && g - c >= 3 ? 5 : 0));
  const m = skV('v1');
  if (m)
    t.sq.forEach((p) => {
      p.mo = Math.min(100, (p.mo ?? 60) + skR(m));
    });
  if (skV('v4'))
    t.sq.forEach((p) => {
      if ((p.mo ?? 60) < 30) p.mo = 30;
    });
  const h = skV('v3');
  if (h)
    t.sq.forEach((p) => {
      if (p.inj > 0 && Math.random() < h) p.inj--;
    });
  SKK.forEach((b) => {
    if (!skBp(b)) return;
    K.ch[b] = Math.min(40, (K.ch[b] || 0) + (k == 'V' ? 2 : 1));
    const G = K.g[b] || 0;
    if (G < 3 && skTr(b) >= [30, 60, 90][G]) {
      K.g[b] = G + 1;
      skGift(b, G);
    }
  });
}
// Page des compétences.
function skView() {
  const K = SK(),
    L = skLv(),
    P = skPts(),
    act = skAct(),
    nx = 25 * L * (L + 1),
    pc = L >= 25 ? 100 : Math.round(((K.xp - skCum(L)) / (nx - skCum(L))) * 100);
  const nodeH = (n) => {
    const r = K.r[n.id] || 0,
      mx = n.cap ? 1 : 3,
      [ok, why] = skCan(n.id);
    return `<div class="skw"><button class="skn ${r ? 'on' : ''}" ${ok ? '' : 'disabled'} onclick="skBuy('${n.id}')"><span class="skh2"><b>${n.cap ? '★ ' : ''}${n.n}</b><span class="skp">${Array.from({ length: mx }, (_, i) => `<i class="${i < r ? 'f' : ''}"></i>`).join('')}</span></span>${r ? `<span class="mu">${n.t[r]}</span>` : ''}${r < mx ? `<span style="font-size:12px">→ ${n.t[n.cap ? 1 : r + 1]} <span class="mu">(${skCost(n)} pt)</span></span>` : ''}${!ok && r < mx ? `<span class="mu skw2">${why}</span>` : ''}</button><span class="skq">${hp('sk_' + n.id)}</span></div>`;
  };
  const brH = (b) => {
    const B = SKB[b],
      pt = skBp(b),
      lk = !pt && act.length >= 2,
      tr = skTr(b);
    return `<div class="skb ${lk ? 'lk' : ''}" style="--bc:${B.c}"><div class="skt"><div class="skav">${B.w[0][0]}</div><div style="min-width:0"><div>${B.e} ${B.n}</div><div class="mu">${B.w[0]} · ${B.w[1]}</div></div></div><div><div class="mu">Confiance de ${B.w[0].split(' ')[0]}</div><div style="display:flex;justify-content:center">${gg(pt ? tr : 0, { size: 64, fs: 34, c: B.c, tt: 'Confiance de ' + B.w[0].split(' ')[0] })}</div><div class="mu">${pt ? 'Cadeaux : ' + (K.g[b] || 0) + '/3 (à 30, 60 et 90 %)' : lk ? 'Verrouillée par votre spécialisation' : 'Investissez un point pour la rencontrer'}</div></div>${SKT[b].map((n, i) => (i ? '<div class="skl"></div>' : '') + nodeH(n)).join('')}</div>`;
  };
  return `<div class="card"><div class="ctl" style="justify-content:space-between"><div><b style="font-size:18px">Niveau ${L}</b>${hp('sk')} <span class="mu">· ${K.xp} XP${L < 25 ? ' · prochain niveau à ' + nx : ' · niveau maximal'}</span>${hp('sk_xp')}</div><div class="ctl"><span><b>${P}</b> point${P > 1 ? 's' : ''} à dépenser · Spécialisation <b>${act.length}/2</b></span><button ${act.length ? '' : 'disabled'} onclick="skReset()">${V.skr ? 'Confirmer (−600 crédits)' : '↺ Réinitialiser (600 crédits)'}</button>${V.skr ? '<button onclick="V.skr=0;render()">Annuler</button>' : ''}</div></div><div style="display:flex;justify-content:center;margin-top:6px">${gg(pc, { size: 70, fs: 34, c: 'var(--ac)', tt: 'Progression du niveau' })}</div>${V.skm ? `<div class="mu" style="margin-top:6px">${V.skm}</div>` : ''}</div><div class="skg">${SKK.map(brH).join('')}</div>`;
}

// Éléments de création du manager : couleurs de peau, cheveux, accessoires, prénoms et noms.
const MGSK = ['#f8d9c0', '#f0bf9a', '#d9a273', '#b5784a', '#8a5632', '#5c3a22'],
  MGHC = ['#1b1b1f', '#4a2f1d', '#8b5a2b', '#d9a441', '#c0392b', '#9aa0a6', '#3ec6e0', '#d63384'],
  MGHS = ['Chauve', 'Court', 'Long', 'Chignon', 'Bouclé', 'Pointes'],
  MGAC = ['Aucun', 'Lunettes', 'Barbe', 'Casquette'],
  MGG = [
    ['h', 'Homme'],
    ['f', 'Femme'],
    ['x', 'Autre'],
  ],
  MGFN = [
    'Alix',
    'Noa',
    'Sacha',
    'Ilan',
    'Maëlys',
    'Yanis',
    'Camille',
    'Soren',
    'Lior',
    'Éden',
    'Tamsin',
    'Kenji',
    'Ruben',
    'Inès',
    'Malo',
    'Zélie',
  ],
  MGLN = [
    'Valcourt',
    'Mareno',
    'Kessler',
    'Ishikari',
    'Duprat',
    'Okonkwo',
    'Brandt',
    'Ferreira',
    'Lemaire',
    'Novak',
    'Santoro',
    'Haddad',
    'Moreau',
    'Tanaka',
    'Rivière',
    'Delacroix',
  ];
// Passés possibles du manager (Ancien commercial, etc.) et leurs bonus.
const BGS = [
  {
    id: 'com',
    e: '💼',
    n: 'Ancien commercial',
    d: 'Le sens des affaires.',
    b: ['Revenus du club +10 %', '+500 crédits de départ'],
    k: { inc: 0.1, cash0: 500 },
  },
  {
    id: 'jou',
    e: '⚽',
    n: 'Ancien joueur pro',
    d: 'Il connaît les vestiaires.',
    b: ['Moral de départ +10', 'Victoire : moral +1 · défaite : −1 de moins'],
    k: { mo0: 10, mw: 1, ml: 1 },
  },
  {
    id: 'ent',
    e: '📋',
    n: 'Ancien entraîneur',
    d: 'Respecté par le conseil.',
    b: [
      'Confiance du conseil +15 au départ',
      'Chaque victoire : confiance +1',
      'Progression des joueurs +10 %',
    ],
    k: { cf0: 15, cw: 1, tx: 0.1 },
  },
  {
    id: 'pub',
    e: '🎤',
    n: 'Personnalité publique',
    d: 'Les médias l’adorent.',
    b: ['Interviews : effets positifs +1', 'Sponsors et boutique +8 %'],
    k: { iv: 1, spn: 0.08 },
  },
  {
    id: 'med',
    e: '🩺',
    n: 'Ancien médecin du sport',
    d: 'Il soigne vite et bien.',
    b: ['Blessures plus courtes', 'Énergie : +1 récupérée par jour'],
    k: { med: 1, en: 2 },
  },
  {
    id: 'ana',
    e: '📊',
    n: 'Ancien analyste',
    d: 'Il lit le jeu comme personne.',
    b: ['Force d’équipe +1 (défense et attaque)'],
    k: { an: 1 },
  },
  {
    id: 'rec',
    e: '🔍',
    n: 'Ancien recruteur',
    d: 'Il déniche les bonnes affaires.',
    b: ['Transferts achetés −10 %', 'Marché : joueurs +2 de niveau'],
    k: { rc: 0.1, mk: 2 },
  },
  {
    id: 'edu',
    e: '🎓',
    n: 'Ancien éducateur',
    d: 'Il forme les talents.',
    b: ['Jeunes du centre +4 de niveau', 'Progression des jeunes +15 %'],
    k: { ed: 4, ty: 0.15 },
  },
];
Object.assign(HELP, {
  mc_id:
    'Le nom et le genre de votre manager. Ils apparaissent dans le premier mail et dans l’onglet Manager.',
  mc_look: 'Apparence purement visuelle : elle n’a aucun effet sur le jeu.',
  mc_bg:
    'Le passé de votre manager donne des bonus pour toute la carrière. Choisissez-en un : le choix est définitif.',
});
// Bonus apporté par le passé du manager.
const mgb = (k) => {
  const g = typeof S !== 'undefined' && S && S.mg && BGS.find((b) => b.id == S.mg.bg);
  return (g && g.k[k]) || 0;
};
// Dessine le portrait du manager.
function mgSvg(m, w) {
  const sk = MGSK[m.sk],
    hc = MGHC[m.hc],
    ol = '#1a1a2e',
    tp = (S && S.teams && S.teams[S.t] && PAL[S.teams[S.t].name]) || ['#6579ae', '#d71921'],
    oc = [tp[0], tp[1], '#2d6a4f', '#e07a1f', '#7b2cbf', '#f1f1f1'][m.oc || 0],
    st = `stroke="${ol}" stroke-width="3" stroke-linejoin="round"`,
    hs = m.hs;
  let back = '',
    front = '';
  if (hs == 2)
    back = `<path d="M32 60 Q30 22 60 20 Q90 22 88 60 L94 112 Q60 122 26 112Z" fill="${hc}" ${st}/>`;
  if (hs == 4)
    back = [
      [38, 44, 10],
      [46, 32, 11],
      [60, 27, 11],
      [74, 32, 11],
      [82, 44, 10],
    ]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}" ${st}/>`)
      .join('');
  if (hs == 3) back = `<circle cx="60" cy="24" r="10" fill="${hc}" ${st}/>`;
  if (hs == 1 || hs == 2 || hs == 3)
    front = `<path d="M35 57 Q35 30 60 30 Q85 30 85 57 Q76 41 60 41 Q44 41 35 57Z" fill="${hc}" ${st}/>`;
  if (hs == 4)
    front = `<path d="M37 54 Q40 38 60 38 Q80 38 83 54 Q76 46 60 46 Q44 46 37 54Z" fill="${hc}" ${st}/>`;
  if (hs == 5)
    front = `<path d="M36 56 L38 34 L48 44 L54 26 L62 42 L70 28 L74 44 L84 34 L84 56 Q76 44 60 44 Q44 44 36 56Z" fill="${hc}" ${st}/>`;
  const ac =
      m.ac == 1
        ? `<circle cx="50" cy="62" r="7" fill="none" ${st.replace('3', '2.5')}/><circle cx="70" cy="62" r="7" fill="none" ${st.replace('3', '2.5')}/><path d="M57 62 L63 62" stroke="${ol}" stroke-width="2.5"/>`
        : m.ac == 3
          ? `<path d="M34 52 Q36 26 60 26 Q84 26 86 52Z" fill="${tp[1]}" ${st}/><path d="M30 52 L90 52 L96 58 L26 58Z" fill="${tp[1]}" ${st}/>`
          : '',
    beard =
      m.ac == 2
        ? `<path d="M37 66 Q38 96 60 98 Q82 96 83 66 Q80 82 60 84 Q40 82 37 66Z" fill="${hc}" ${st}/>`
        : '';
  return `<svg viewBox="0 0 120 130" width="${w}" height="${(w * 130) / 120}" role="img" aria-label="Portrait du manager" style="border-radius:16px;background:${tp[0]}33;display:block"><circle cx="100" cy="20" r="26" fill="${tp[1]}" opacity=".18"/>${back}<rect x="52" y="78" width="16" height="20" fill="${sk}" ${st}/><path d="M12 130 Q14 96 44 92 L76 92 Q106 96 108 130Z" fill="${oc}" ${st}/><path d="M50 92 L60 106 L70 92" fill="none" ${st}/><circle cx="36" cy="64" r="5" fill="${sk}" ${st}/><circle cx="84" cy="64" r="5" fill="${sk}" ${st}/><ellipse cx="60" cy="62" rx="24" ry="28" fill="${sk}" ${st}/>${beard}${front}<circle cx="50" cy="62" r="2.6" fill="${ol}"/><circle cx="70" cy="62" r="2.6" fill="${ol}"/><path d="M44 55 L55 54 M65 54 L76 55" stroke="${ol}" stroke-width="2.5" stroke-linecap="round"/><path d="M60 64 L58 71 L62 71" fill="none" stroke="${ol}" stroke-width="2" stroke-linejoin="round" opacity=".6"/><path d="M52 77 Q60 83 68 77" fill="none" stroke="${ol}" stroke-width="2.8" stroke-linecap="round"/>${ac}</svg>`;
}
// Crée un manager au hasard.
function mcNew() {
  const r = (a) => a[(Math.random() * a.length) | 0];
  return {
    fn: r(MGFN),
    ln: r(MGLN),
    g: 'h',
    sk: (Math.random() * 6) | 0,
    hs: (Math.random() * 6) | 0,
    hc: (Math.random() * 8) | 0,
    ac: 0,
    oc: 0,
    bg: null,
  };
}
// Modifie un champ de la création du manager.
function mcS(k, v) {
  V.mc[k] = v;
  render();
}
// Bouton « Aléatoire » de la création du manager.
function mcRnd() {
  const o = V.mc,
    n = mcNew();
  V.mc = { ...n, g: o.g, bg: o.bg, n: o.n };
  render();
}
// Retour pendant la création du manager.
function mcBack() {
  const n = V.mc && V.mc.n;
  V.mc = null;
  if (n) {
    S = null;
    V.tour = null;
    save();
  }
  render();
}
// Valide la création du manager.
function mcOk() {
  const m = V.mc;
  if (!m || !m.bg) return;
  const fn = (m.fn || '').trim() || 'Alix',
    ln = (m.ln || '').trim();
  S.mg = { fn, ln, g: m.g, sk: m.sk, hs: m.hs, hc: m.hc, ac: m.ac, oc: m.oc, bg: m.bg };
  const t = me(),
    b = BGS.find((x) => x.id == m.bg);
  S.cash += mgb('cash0');
  S.conf = Math.min(100, S.conf + mgb('cf0'));
  if (mgb('mo0')) t.sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + mgb('mo0'))));
  const w = S.mail.find((x) => /^Bienvenue/.test(x.t));
  if (w) w.b = 'À l’attention de ' + fn + ' ' + ln + ' (' + b.n.toLowerCase() + ').\n\n' + w.b;
  V.mc = null;
  save();
  render();
}
// Écran de création du manager.
function mcView() {
  const m = V.mc,
    b = BGS.find((x) => x.id == m.bg),
    sw = (k, arr, cur) =>
      arr
        .map(
          (c, i) =>
            `<button class="sw ${cur == i ? 'on' : ''}" style="background:${c}" title="Choix ${i + 1}" onclick="mcS('${k}',${i})"></button>`,
        )
        .join(''),
    ch = (k, arr, cur) =>
      arr
        .map((n, i) => `<button class="${cur == i ? 'p' : ''}" onclick="mcS('${k}',${i})">${n}</button>`)
        .join(''),
    tp = PAL[me().name] || ['#6579ae', '#d71921'];
  return `<div class="mcw"><div class="ctl"><button onclick="mcBack()">← ${m.n ? 'Retour au choix du club' : 'Annuler'}</button></div><h1>🧑‍💼 Créez votre manager</h1><div class="mcg">
<div class="card mcp">${mgSvg(m, 190)}<b style="font-size:18px;margin-top:8px;display:block">${(m.fn || '…') + ' ' + (m.ln || '')}</b><div class="mu">${b ? b.e + ' ' + b.n : 'Choisissez un passé →'}</div><div class="mu" style="margin:4px 0 10px">Manager de ${me().em} ${me().name}</div>${b ? `<ul class="mcl">${b.b.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}<div class="ctl"><button onclick="mcRnd()">🎲 Aléatoire</button><button class="p" ${b ? '' : 'disabled'} onclick="mcOk()">✔ Valider</button></div></div>
<div class="card"><h2>Identité${hp('mc_id')}</h2><label class="mu">Prénom <input value="${m.fn.replace(/"/g, '')}" maxlength="16" onchange="mcS('fn',this.value)"></label> <label class="mu">Nom <input value="${m.ln.replace(/"/g, '')}" maxlength="16" onchange="mcS('ln',this.value)"></label><div class="ctl" style="margin-top:6px">${MGG.map(([k, n]) => `<button class="${m.g == k ? 'p' : ''}" onclick="mcS('g','${k}')">${n}</button>`).join('')}</div>
<h2>Apparence${hp('mc_look')}</h2><div class="mu">Peau</div><div>${sw('sk', MGSK, m.sk)}</div><div class="mu">Coiffure</div><div class="ctl">${ch('hs', MGHS, m.hs)}</div><div class="mu">Couleur de cheveux</div><div>${sw('hc', MGHC, m.hc)}</div><div class="mu">Accessoire</div><div class="ctl">${ch('ac', MGAC, m.ac)}</div><div class="mu">Tenue</div><div>${sw('oc', [tp[0], tp[1], '#2d6a4f', '#e07a1f', '#7b2cbf', '#f1f1f1'], m.oc)}</div></div>
<div class="card"><h2>Passé${hp('mc_bg')}</h2><div class="mcbg">${BGS.map((x) => `<button class="mcb ${m.bg == x.id ? 'on' : ''}" onclick="mcS('bg','${x.id}')"><b>${x.e} ${x.n}</b><br><span class="mu">${x.b.join(' · ')}</span></button>`).join('')}</div></div></div></div>`;
}

// Page « Manager » : compétences et carrière.
function careerView() {
  const P = skPts(),
    k = V.ct == 'sk' || V.ct == 'car' ? V.ct : 'ap',
    tb = [['ap', 'Aperçu'], ['sk', 'Compétences' + (P > 0 ? ` <b class="ch" style="padding:0 7px">${P}</b>` : '')], ['car', 'Carrière']];
  return (
    `<div class="fvw"><div class="tvt mtt">${tb.map(([q, l]) => `<button class="${k == q ? 'on' : ''}" onclick="V.ct='${q}';render()">${l}</button>`).join('')}</div>` +
    (k == 'sk' ? `<div class="sks">${skView()}</div>` : k == 'car' ? careerViewOld() : mgOverview()) +
    '</div>'
  );
}
// Aperçu du manager : portrait, dossier, développement (cliquable), confiance, trophées, succès.
function mgOverview() {
  const g = S.mg,
    b = g && (BGS.find((x) => x.id == g.bg) || BGS[0]),
    K = SK(),
    L = skLv(),
    nx = 25 * L * (L + 1),
    pc = L >= 25 ? 100 : Math.max(0, Math.min(100, Math.round(((K.xp - skCum(L)) / (nx - skCum(L))) * 100))),
    P = skPts(),
    lg = stK().log || [],
    w = lg.filter((x) => x.g > x.c).length,
    n = lg.filter((x) => x.g == x.c).length,
    d = lg.length - w - n,
    wp = lg.length ? Math.round((100 * w) / lg.length) : 0,
    ring = (v, c) => {
      const r = 52,
        cc = 2 * Math.PI * r;
      return `<svg viewBox="0 0 130 130" class="mgr"><circle cx="65" cy="65" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="12"/><circle cx="65" cy="65" r="${r}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${((cc * v) / 100).toFixed(1)} ${cc.toFixed(1)}" transform="rotate(-90 65 65)"/><text x="65" y="73" text-anchor="middle" font-size="26" font-weight="800" fill="currentColor">${v}%</text></svg>`;
    },
    ic = (i) => `<svg class="ic" aria-hidden="true"><use href="#i-${i}"/></svg>`,
    st = (i, v, l) => `<div class="mgs">${ic(i)}<b>${v}</b><small>${l}</small></div>`,
    pal = (S.pal || []).slice().reverse(),
    a = S.ach || {},
    ks = Object.keys(ACH),
    tile = (br) => {
      const B = SKB[br],
        on = skBp(br) > 0,
        lk = !on && skAct().length >= 2,
        mx = SKT[br].reduce((x, nd) => x + (nd.cap ? 1 : 3), 0),
        got = SKT[br].reduce((x, nd) => x + (K.r[nd.id] || 0), 0);
      return `<div class="mgt ${on ? 'on' : lk ? 'lk' : ''}" style="--bc:${B.c}"><span class="skav">${B.w[0][0]}</span><b>${B.n}</b><small>${on ? 'Confiance ' + skTr(br) + ' %' : lk ? 'Verrouillée' : 'À débloquer'}</small>${gg(Math.round((100 * got) / mx), { size: 54, fs: 34, c: B.c, tt: 'Déverrouillé ' + got + '/' + mx })}<small>Déverrouillé ${got}/${mx}</small></div>`;
    };
  return `<div class="mgw"><div class="mgl"><div class="card mgc">${
    g
      ? `<div class="mgpt">${mgSvg(g, 150)}</div><b class="mgn">${g.fn} ${g.ln}</b><div class="mu">${b.n}</div><ul class="mcl">${b.b.map((x) => `<li>${x}</li>`).join('')}</ul><div class="mgv"><b>Niveau ${L}</b>${hp('sk')}</div><div class="bar" style="width:100%;height:8px"><i style="width:${pc}%;background:var(--ac)"></i></div><div class="mu">${K.xp} XP${L < 25 ? ' / ' + nx : ' · niveau maximal'}</div><div class="mgpts">${P} point${P > 1 ? 's' : ''} de compétence</div>`
      : `<b>Votre manager</b><div class="mu" style="margin:4px 0 8px">Cette partie n’a pas encore de manager personnalisé.</div><button class="p" onclick="V.mc=mcNew();render()">Créer mon manager</button>`
  }</div><div class="card mgc"><b>Confiance du conseil</b>${hp('car1')}${gg(S.conf, { size: 130, fs: 34, c: S.conf < 25 ? '#d33' : 'var(--ok)', tt: 'Confiance' })}<div class="mu">Objectif : top ${S.obj} · titres : ${S.titles || 0}${S.lc ? ' · dernière chance utilisée' : ''}</div><div class="mgob">${obView()}</div></div></div>
  <div class="mgm"><div class="mgtop"><div class="card mgc"><div class="fvh"><b>Dossier du manager</b></div><div class="mgdos">${gg(wp, { size: 130, fs: 34, c: 'var(--ok)', tt: 'Pourcentage de victoires' })}<div class="mu" style="text-align:center">Pourcentage de victoires</div></div><div class="mgsr">${st('ball', lg.length, 'Joués')}${st('check', w, 'Victoires')}${st('meh', n, 'Nuls')}${st('cross', d, 'Défaites')}${st('trophy', S.titles || 0, 'Trophées')}</div></div>
  <div class="card mgc mgdev" role="button" tabindex="0" onclick="V.ct='sk';render()" onkeydown="if(event.key=='Enter')this.click()"><div class="fvh"><b>Développement du manager</b>${hp('sk')}<span class="mu" style="margin-left:auto">${P > 0 ? P + ' point' + (P > 1 ? 's' : '') + ' à dépenser ›' : 'Voir les compétences ›'}</span></div><div class="mgtl">${SKK.map(tile).join('')}</div></div></div>
  <div class="mgbot"><div class="card mgc"><div class="fvh"><b>Trophées et palmarès</b></div><div class="fvth mgph"><span>Saison</span><span>Club</span><span>Rang</span><span>Pts</span><span>Coupe</span></div><div class="fvtb">${
    pal.map((e) => `<div class="fvtr mgph"><span>${e.s}</span><span class="fvcl">${e.club}</span><b style="color:${e.r == 1 ? '#e8a20c' : 'inherit'}">${e.r == 1 ? ic('trophy') + ' ' : ''}${e.r}</b><span>${e.pts}</span><span>${e.cup || '—'}</span></div>`).join('') || '<div class="mu" style="padding:14px 2px;text-align:center">Aucune saison terminée.</div>'
  }</div></div>
  <div class="card mgc"><div class="fvh"><b>Succès</b><span class="mu">${Object.keys(a).length}/${ks.length}</span></div><div class="fvtb" style="max-height:300px">${ks.map((q) => `<div class="mgach ${a[q] ? 'on' : ''}">${ic(a[q] ? 'trophy' : 'lock')}<span>${ACH[q]}</span></div>`).join('')}</div></div></div></div></div>`;
}
// Mails d'interview avant/après match : listes de situations et de réponses possibles.
const MDP = [
    {
      t: 'Interview : avant le match',
      q: 'Comment abordez-vous le match contre @O ?',
      o: [
        {
          l: 'Afficher sa confiance : « Nous allons gagner. »',
          r: 'Vous promettez la victoire. Les médias retiendront votre phrase.',
          pr: 1,
        },
        {
          l: 'Rester respectueux envers l’adversaire',
          r: 'Une réponse sobre, bien accueillie.',
          cf: 1,
          mo: 1,
        },
        { l: '« Pas de commentaire. »', r: 'Le journaliste repart déçu.', cf: -1 },
      ],
    },
    {
      t: 'Interview : l’état du groupe',
      q: 'Vos joueurs sont-ils prêts pour affronter @O ?',
      o: [
        {
          l: 'Féliciter le groupe pour son travail',
          r: 'Les joueurs apprécient d’être cités publiquement.',
          mo: 3,
        },
        {
          l: 'Mettre la pression : « Il faudra faire mieux. »',
          r: 'Le message passe, mais certains le prennent mal.',
          mo: -2,
          cf: 2,
        },
        { l: 'Botter en touche', r: 'Vous évitez le sujet.' },
      ],
    },
    {
      t: 'Interview : le conseil',
      q: 'Le conseil d’administration attend-il un résultat précis face à @O ?',
      o: [
        { l: 'Défendre les décisions du conseil', r: 'Le conseil apprécie votre loyauté.', cf: 3, mo: -1 },
        {
          l: 'Regretter le manque de moyens',
          r: 'Les joueurs vous soutiennent, le conseil moins.',
          mo: 3,
          cf: -3,
        },
        { l: 'Rester neutre', r: 'Rien à signaler.' },
      ],
    },
    {
      t: 'Interview : le Fluide',
      q: 'Le Fluide fait débat avant @O : quel est votre avis ?',
      o: [
        {
          l: 'Défendre le Fluide : « C’est notre force. »',
          r: 'Les joueurs se sentent soutenus.',
          mo: 2,
          cf: -1,
        },
        {
          l: 'Le minimiser : « Le talent d’abord. »',
          r: 'Une position prudente qui rassure le conseil.',
          cf: 2,
          mo: -1,
        },
        { l: 'Ne pas se prononcer', r: 'Vous gardez vos distances.' },
      ],
    },
  ],
  MDW = [
    {
      t: 'Interview : après la victoire',
      q: 'À qui dédiez-vous cette victoire contre @O ?',
      o: [
        { l: 'Aux joueurs', r: 'Le vestiaire savoure.', mo: 4 },
        { l: 'Aux supporters', r: 'Le public est conquis.', cf: 3, mo: 1 },
        { l: 'Au conseil d’administration', r: 'Un joli geste envers la direction.', cf: 4, mo: -1 },
      ],
    },
  ],
  MDN = [
    {
      t: 'Interview : après le nul',
      q: 'Match nul contre @O : que s’est-il passé ?',
      o: [
        { l: 'Rester positif : « On progresse. »', r: 'Un message positif pour le groupe.', mo: 2 },
        { l: 'Faire son autocritique', r: 'Le conseil apprécie votre lucidité.', cf: 2, mo: -1 },
        { l: 'Critiquer l’arbitrage', r: 'Les joueurs vous approuvent, le conseil moins.', mo: 3, cf: -3 },
      ],
    },
  ],
  MDL = [
    {
      t: 'Interview : après la défaite',
      q: 'Défaite contre @O : qui est responsable ?',
      o: [
        { l: 'Assumer la responsabilité', r: 'Vous prenez la défaite sur vous.', cf: 2, mo: 1 },
        { l: 'Protéger les joueurs', r: 'Le vestiaire vous remercie.', mo: 4, cf: -1 },
        { l: 'Pointer du doigt l’équipe', r: 'Les joueurs le prennent très mal.', mo: -6, cf: 1 },
        {
          l: 'Critiquer l’arbitrage',
          r: 'Les joueurs applaudissent, le conseil grince des dents.',
          mo: 2,
          cf: -4,
        },
      ],
    },
  ];
MDW.push({
  t: 'Interview : la suite',
  q: 'Quel est votre objectif pour la suite de la saison ?',
  o: [
    { l: 'Viser le titre sans complexe', r: 'Une ambition affichée qui galvanise le vestiaire.', mo: 3, cf: -1, pr: 0 },
    { l: 'Rester humble : « Match après match. »', r: 'Une réponse mesurée, appréciée du conseil.', cf: 2 },
    { l: 'Féliciter l’adversaire', r: 'Un beau geste de fair-play.', cf: 1, mo: 1 },
  ],
});
MDN.push({
  t: 'Interview : le point de vue',
  q: 'Êtes-vous satisfait du point pris contre @O ?',
  o: [
    { l: 'Oui, un point précieux', r: 'Vous dédramatisez : le groupe respire.', mo: 1, cf: 1 },
    { l: 'Non, on voulait les trois points', r: 'Votre exigence est saluée, mais le groupe sent la pression.', mo: -1, cf: 2 },
    { l: 'Pas de commentaire', r: 'La journaliste n’insiste pas.' },
  ],
});
MDL.push({
  t: 'Interview : la réaction',
  q: 'Comptez-vous changer quelque chose dans votre équipe ?',
  o: [
    { l: 'Oui, des changements arrivent', r: 'Le vestiaire se tient sur ses gardes.', mo: -2, cf: 2 },
    { l: 'Non, je garde ma confiance au groupe', r: 'Les joueurs apprécient votre soutien.', mo: 3, cf: -1 },
    { l: 'Il faut analyser avant de décider', r: 'Une réponse prudente.', cf: 1 },
  ],
});
// ===== Questions et mails de presse variés, qui citent les joueurs du match =====
// ne = information nécessaire : sc (buteur), mvp (homme du match), gk (gardien), sub (remplaçant entré), low (joueur en difficulté), star (vedette), inj (blessé).
// pm = [lettre du joueur, variation de son moral] ; cr = crédits ; mo / cf = moral de l'équipe / confiance du conseil.
MDP.push(
  {
    t: 'Interview : la vedette', ne: 'star',
    q: '@P est votre joueur le plus en vue : comptez-vous sur lui face à @O ?',
    o: [
      { l: 'Oui, c’est notre leader', r: 'Le joueur se sent investi d’une vraie mission.', pm: ['P', 5] },
      { l: 'Je compte sur tout le groupe', r: 'Un message collectif qui rassure le vestiaire.', mo: 2 },
      { l: 'Le ménager pour la suite', r: 'Prudent : le conseil apprécie la gestion de la saison.', cf: 2, pm: ['P', -2] },
    ],
  },
  {
    t: 'Interview : le blessé', ne: 'inj',
    q: '@J est à l’infirmerie : est-ce un coup dur avant @O ?',
    o: [
      { l: 'Le rassurer publiquement', r: 'Le joueur apprécie votre soutien.', pm: ['J', 5] },
      { l: 'Minimiser : « Le groupe est riche. »', r: 'Vous gardez le contrôle, le conseil acquiesce.', cf: 2 },
      { l: 'Avouer que c’est une vraie perte', r: 'Honnête, mais le vestiaire s’inquiète un peu.', mo: -1, pm: ['J', 3] },
    ],
  },
  {
    t: 'Interview : les pronostics',
    q: 'Les pronostics donnent @O favori. Que répondez-vous ?',
    o: [
      { l: 'Tant mieux, on adore l’étiquette d’outsider', r: 'Les joueurs se sentent libérés de la pression.', mo: 3 },
      { l: 'Les pronostics ne gagnent pas les matchs', r: 'Une réponse classique, jugée très professionnelle.', cf: 2 },
      { l: 'Les provoquer : « On va leur montrer. »', r: 'Le défi est lancé : les supporters adorent, le conseil un peu moins.', mo: 2, cf: -1 },
    ],
  },
  {
    t: 'Interview : le style de l’adversaire',
    q: 'Que pensez-vous du style de jeu de @O ?',
    o: [
      { l: 'Un adversaire qui force le respect', r: 'Un fair-play salué par la presse.', cf: 2 },
      { l: 'Un jeu rugueux, mais on saura y répondre', r: 'Vos joueurs se sentent prévenus et motivés.', mo: 2, cf: -1 },
      { l: 'Ironiser sur leur manque d’idées', r: 'Une petite pique qui amuse les supporters.', mo: 1, cf: -2 },
    ],
  },
  {
    t: 'Interview : l’ambiance',
    q: 'Quelle est l’ambiance dans le vestiaire cette semaine ?',
    o: [
      { l: 'Excellente, on se sent invincibles', r: 'Une belle confiance affichée, mais la pression monte.', mo: 2, pr: 0, cf: 1 },
      { l: 'Sérieuse et concentrée', r: 'Le conseil apprécie la rigueur du groupe.', cf: 2 },
      { l: 'Tendue : il faut se remettre au travail', r: 'Franc, mais le vestiaire n’aime pas qu’on lave le linge en public.', mo: -2, cf: 1 },
    ],
  },
);
MDW.push(
  {
    t: 'Interview : le buteur', ne: 'sc',
    q: '@S a marqué contre @O : est-il votre meilleur atout offensif ?',
    o: [
      { l: 'Le couvrir d’éloges', r: 'Le buteur savoure, mais le reste du groupe note la différence.', pm: ['S', 6], mo: -1 },
      { l: 'Souligner l’effort collectif', r: 'Un message d’équipe apprécié de tous.', mo: 3 },
      { l: 'Lui demander encore plus', r: 'Exigeant : le conseil approuve, le joueur le prend avec philosophie.', cf: 2, pm: ['S', -2] },
    ],
  },
  {
    t: 'Interview : l’homme du match', ne: 'mvp',
    q: '@M est élu homme du match : méritait-il ce titre ?',
    o: [
      { l: 'Oui, un vrai leader', r: 'Le joueur est touché par vos mots.', pm: ['M', 6], cf: 1 },
      { l: 'Tout le groupe a brillé', r: 'Le vestiaire vous remercie de partager la lumière.', mo: 3 },
      { l: 'Plaisanter : « Il va encore réclamer une prime ! »', r: 'La salle de presse rit, le joueur beaucoup moins.', pm: ['M', -3], cf: 1 },
    ],
  },
  {
    t: 'Interview : le gardien', ne: 'gkw',
    q: '@K a été précieux dans les buts : un mot sur lui ?',
    o: [
      { l: 'Saluer son sang-froid', r: 'Le gardien est ravi de cette reconnaissance.', pm: ['K', 5] },
      { l: 'Féliciter toute la défense', r: 'Les défenseurs se sentent valorisés.', mo: 3 },
      { l: 'Rester sobre : « Il fait son travail. »', r: 'Une réponse neutre qui ne fait pas de vagues.' },
    ],
  },
  {
    t: 'Interview : le remplaçant', ne: 'sub',
    q: '@X est entré en jeu et a marqué les esprits : une réaction ?',
    o: [
      { l: 'Vanter la force de votre banc', r: 'Tout le groupe se sent concerné : la concurrence stimule.', mo: 3 },
      { l: 'Lui promettre plus de temps de jeu', r: 'Le joueur y croit, les titulaires un peu moins.', pm: ['X', 6], mo: -1 },
      { l: 'Rester mesuré', r: 'Rien de plus à ajouter.', cf: 1 },
    ],
  },
  {
    t: 'Interview : le tournant',
    q: 'Quel a été le tournant du match contre @O ?',
    o: [
      { l: 'Un ajustement tactique', r: 'La presse salue votre lecture du jeu.', cf: 3 },
      { l: 'L’état d’esprit des joueurs', r: 'Le vestiaire se sent mis en avant.', mo: 3 },
      { l: 'Un peu de réussite', r: 'Une réponse modeste, très appréciée du public.', mo: 1, cf: 1 },
    ],
  },
);
MDN.push(
  {
    t: 'Interview : le buteur du nul', ne: 'sc',
    q: '@S a marqué, mais le match s’arrête sur un nul : déçu pour lui ?',
    o: [
      { l: 'Le féliciter malgré le résultat', r: 'Un joueur reconnaissant.', pm: ['S', 5] },
      { l: 'Dire qu’on aurait dû finir le travail', r: 'Exigeant : le conseil approuve.', cf: 2, mo: -1 },
      { l: 'Se féliciter de la performance collective', r: 'Le groupe apprécie.', mo: 2 },
    ],
  },
  {
    t: 'Interview : la logique du match',
    q: 'Le résultat est-il logique au vu du match contre @O ?',
    o: [
      { l: 'Oui, personne ne méritait de gagner', r: 'Une analyse lucide, saluée.', cf: 2 },
      { l: 'Non, on méritait mieux', r: 'Vous soutenez vos joueurs, qui se sentent compris.', mo: 3, cf: -1 },
      { l: 'Ce sont les détails qui ont tranché', r: 'Une réponse sans polémique.', cf: 1 },
    ],
  },
  {
    t: 'Interview : le gardien du nul', ne: 'gka',
    q: '@K a évité le pire dans les cages : un mot sur sa prestation ?',
    o: [
      { l: 'Il a sauvé le point', r: 'Le gardien est touché de cette reconnaissance.', pm: ['K', 5] },
      { l: 'La défense doit mieux protéger sa surface', r: 'Un petit rappel à l’ordre.', mo: -1, cf: 2 },
      { l: 'Ne pas s’exprimer sur un seul joueur', r: 'Vous préservez l’unité du groupe.', mo: 1 },
    ],
  },
);
MDL.push(
  {
    t: 'Interview : le joueur en difficulté', ne: 'low',
    q: '@L a semblé en difficulté face à @O : va-t-il rester dans l’équipe ?',
    o: [
      { l: 'Le défendre : « Il a ma confiance. »', r: 'Le joueur vous en sera reconnaissant.', pm: ['L', 6] },
      { l: 'Le mettre en garde', r: 'Un message clair, mais pas très populaire.', pm: ['L', -5], cf: 1 },
      { l: 'Ne citer personne', r: 'Vous évitez de pointer un joueur du doigt.', mo: 1 },
    ],
  },
  {
    t: 'Interview : le gardien battu', ne: 'gkl',
    q: '@K a encaissé plusieurs buts : est-ce sa faute ?',
    o: [
      { l: 'Non, c’est toute l’équipe', r: 'Le gardien se sent soutenu.', pm: ['K', 5], mo: 1 },
      { l: 'Il doit faire mieux', r: 'Franc, mais le gardien accuse le coup.', pm: ['K', -4], cf: 1 },
      { l: 'Je ne parle pas des individualités', r: 'Une position de principe.', mo: 1 },
    ],
  },
  {
    t: 'Interview : la consolation', ne: 'sc',
    q: '@S a sauvé l’honneur : est-ce une consolation ?',
    o: [
      { l: 'Une bonne note dans une soirée difficile', r: 'Le buteur apprécie un peu de lumière.', pm: ['S', 4] },
      { l: 'Non, seule la victoire compte', r: 'Un message d’exigence pour tout le vestiaire.', cf: 2, mo: -1 },
      { l: 'Il faut regarder vers l’avant', r: 'Une réponse tournée vers la suite.', mo: 1, cf: 1 },
    ],
  },
  {
    t: 'Interview : les supporters',
    q: 'Les supporters sont déçus : un message pour eux ?',
    o: [
      { l: 'Les remercier et s’excuser', r: 'Un geste fort, apprécié des tribunes.', cf: 3 },
      { l: 'Promettre une réaction dès le prochain match', r: 'Le groupe sent le défi, mais la pression monte.', mo: 2, cf: -1 },
      { l: 'Demander de la patience', r: 'Le public attend encore des résultats.', cf: 1, mo: 1 },
    ],
  },
);
// Mails de presse variés (après un match) : chaque mail pose une question différente, avec ses propres réponses.
const PZ = [
  {
    t: 'Presse : le buteur du match', ne: 'sc', k: 'S',
    b: (f) => `La rédaction de la Galactik Post s’intéresse à ${f.S}, buteur du match. « Est-il le futur visage de votre attaque ? »`,
    o: [
      { l: 'Le présenter comme un cadre', r: 'Le joueur gagne en confiance, la presse reprend votre phrase.', pm: ['S', 6] },
      { l: 'Parler d’un joueur parmi d’autres', r: 'Vous préservez l’équilibre du vestiaire.', mo: 2 },
      { l: 'Rester évasif', r: 'La rédaction n’insiste pas.', cf: 1 },
    ],
  },
  {
    t: 'Presse : l’homme du match', ne: 'mvp', k: 'M',
    b: (f) => `${f.M} a été élu homme du match. La Galactik Post vous demande de le décrire en un mot.`,
    o: [
      { l: '« Irremplaçable »', r: 'Le joueur est flatté, ses coéquipiers un peu moins.', pm: ['M', 6], mo: -1 },
      { l: '« Travailleur »', r: 'Un compliment sobre, bien reçu par tout le vestiaire.', pm: ['M', 3], mo: 1 },
      { l: '« Il fait ce qu’il doit faire »', r: 'La réponse manque de chaleur.', pm: ['M', -2] },
    ],
  },
  {
    t: 'Presse : le gardien en lumière', ne: 'gkw', k: 'K',
    b: (f) => `La presse revient sur la prestation de ${f.K}. « Est-ce le meilleur gardien du championnat ? »`,
    o: [
      { l: 'Oui, sans hésiter', r: 'Le gardien se sent porté par le public.', pm: ['K', 6] },
      { l: 'Il progresse chaque semaine', r: 'Une réponse équilibrée qui motive le joueur.', pm: ['K', 3], cf: 1 },
      { l: 'Je ne compare pas', r: 'Rien à signaler.' },
    ],
  },
  {
    t: 'Presse : un remplaçant en vue', ne: 'sub', k: 'X',
    b: (f) => `${f.X} a fait forte impression en sortant du banc. Les journalistes veulent savoir s’il devient titulaire.`,
    o: [
      { l: 'Il aura sa chance', r: 'Le joueur est transcendé, le vestiaire prend note.', pm: ['X', 6] },
      { l: 'Le groupe est large, tous méritent leur place', r: 'Tout le monde se sent concerné.', mo: 2 },
      { l: 'Pas question d’en parler', r: 'Le sujet est clos.', cf: 1 },
    ],
  },
  {
    t: 'Presse : polémique arbitrale', ne: 'nw',
    b: () => 'Une décision arbitrale fait polémique après la rencontre. La rédaction vous demande votre réaction.',
    o: [
      { l: 'Accepter la décision', r: 'Un manager mesuré : le conseil apprécie.', cf: 3 },
      { l: 'Dénoncer l’arbitrage', r: 'Vos joueurs vous approuvent, la Ligue moins.', mo: 3, cf: -3 },
      { l: 'Ne pas commenter', r: 'La polémique retombe doucement.', cf: 1 },
    ],
  },
  {
    t: 'Presse : rumeur de transfert', ne: 'star', k: 'P',
    b: (f) => `La rumeur court : un grand club s’intéresserait à ${f.P}. Que répondez-vous ?`,
    o: [
      { l: 'Il n’est pas à vendre', r: 'Le joueur se sent désiré, le conseil observe.', pm: ['P', 6], cf: -1 },
      { l: 'Tout le monde a un prix', r: 'Le conseil apprécie le pragmatisme, le joueur beaucoup moins.', pm: ['P', -4], cf: 2 },
      { l: 'Pas de commentaire', r: 'La rumeur continue de courir.', pm: ['P', 1] },
    ],
  },
  {
    t: 'Presse : le vestiaire',
    b: () => 'La Galactik Post prépare un reportage sur l’ambiance du vestiaire et vous propose de vous exprimer.',
    o: [
      { l: 'Ouvrir les portes aux caméras', r: 'Une belle image du club : les joueurs sont contents de l’exposition.', mo: 2, cf: 2 },
      { l: 'Préférer la discrétion', r: 'Le vestiaire reste un sanctuaire.', mo: 1 },
      { l: 'Refuser poliment', r: 'La rédaction est un peu froissée.', cf: -1 },
    ],
  },
  {
    t: 'Presse : portrait du manager',
    b: () => 'Un magazine prépare un portrait de vous. Quelle image souhaitez-vous donner de votre philosophie de jeu ?',
    o: [
      { l: 'Un football offensif et spectaculaire', r: 'Les supporters adorent, le conseil attend des résultats.', mo: 2, cf: -1 },
      { l: 'Un football rigoureux et solide', r: 'Le conseil est séduit par votre sérieux.', cf: 2 },
      { l: 'Un manager proche de ses joueurs', r: 'Le vestiaire se sent considéré.', mo: 3 },
    ],
  },
];
// Informations sur le match qui vient de se terminer (buteurs, homme du match, gardien…), pour personnaliser les questions.
function pcFacts(M) {
  try {
    const i = M.t.indexOf(me()),
      L = (M.rt && M.rt[i]) || [],
      g = M.sc[i],
      c = M.sc[1 - i],
      sc = L.filter((x) => x[3] > 0).sort((a, b) => b[3] - a[3]),
      gk = L.find((x) => x[1] == 'GK'),
      sub = L.filter((x) => x[5] == 1).sort((a, b) => b[2] - a[2] + (b[3] - a[3]))[0],
      low = L.filter((x) => x[2] < 5.6).sort((a, b) => a[2] - b[2])[0],
      mv = M.mmn && L.find((x) => x[0] == M.mmn),
      top = me().sq.slice().sort((a, b) => b.o - a.o)[0];
    const f = { g, c, nw: g <= c ? 1 : 0 };
    if (sc[0]) f.S = sc[0][0];
    if (mv) f.M = mv[0];
    if (gk && gk[2] >= 6.5 && (c <= 1 || gk[2] >= 7)) f.Kw = gk[0];
    if (gk && (c >= 3 || gk[2] < 5.6)) f.Kl = gk[0];
    if (gk) f.K = gk[0];
    if (sub && sub[2] >= 6.5) f.X = sub[0];
    if (low) f.L = low[0];
    if (top) f.P = top.n;
    return f;
  } catch (e) {
    return {};
  }
}
// Vérifie qu'une question est possible avec ces informations.
function pcOk0(Q, f) {
  const n = Q.ne;
  if (!n) return true;
  f = f || {};
  return n == 'sc' ? !!f.S : n == 'mvp' ? !!f.M : n == 'gkw' ? !!f.Kw : n == 'gkl' ? !!f.Kl : n == 'gka' ? !!(f.Kw || f.Kl) : n == 'sub' ? !!f.X : n == 'low' ? !!f.L : n == 'star' ? !!f.P : n == 'inj' ? !!f.J : n == 'nw' ? !!f.nw : true;
}
// Remplace les noms (@O adversaire, @S buteur, @M homme du match, @K gardien, @X remplaçant, @L joueur en difficulté, @P vedette, @J blessé).
function pcTxt(s, o, f) {
  f = f || {};
  return String(s).replace(/@([OSMKXLPJ])/g, (m, x) => (x == 'O' ? o : f[x] || '…'));
}
// ===== CONFÉRENCE DE PRESSE (avant et après chaque match) : fenêtre avec la journaliste Callie Mystic =====
const KALI = 'Callie Mystic';
// Ouvre la conférence de presse : 2 questions tirées au hasard dans la liste de la situation.
function pcOpen(kind, o, k, sc, f) {
  if (typeof V == 'undefined' || !V || V.pc) return;
  const P = kind == 'pre' ? MDP : k == 'V' ? MDW : k == 'D' ? MDL : MDN,
    idx = P.map((x, i) => i).filter((i) => pcOk0(P[i], f)).sort(() => Math.random() - 0.5).slice(0, 2),
    g = [MDP, MDW, MDN, MDL].indexOf(P);
  V.pc = { kind, o, sc, f: f || {}, qs: idx.map((n) => ({ g, n })), i: 0, sel: -1, res: null };
}
// Réponse choisie (avant validation).
function pcSel(j) {
  if (V.pc && !V.pc.res) {
    V.pc.sel = j;
    render();
  }
}
// Valide la réponse : applique les effets et affiche la réaction.
function pcOk(skip) {
  const c = V.pc;
  if (!c || c.res) return;
  const q = c.qs[c.i],
    Q = [MDP, MDW, MDN, MDL][q.g][q.n],
    z = skip ? { l: 'Décliner de répondre', r: 'Vous quittez la question sans un mot. La journaliste note votre silence.', cf: -1 } : Q.o[c.sel];
  if (!z) return;
  c.res = { l: pcTxt(z.l, c.o, c.f), r: pcTxt(z.r, c.o, c.f), fx: mdEff(z, c.f) };
  skXp(2);
  save();
  render();
}
// Question suivante, ou retour au jeu.
function pcNext() {
  const c = V.pc;
  if (!c) return;
  if (c.i + 1 < c.qs.length) {
    c.i++;
    c.sel = -1;
    c.res = null;
  } else V.pc = null;
  render();
}
// Portrait de la journaliste : place pour l'image « img/callie_mystic.jpg » (si elle est ajoutée), sinon silhouette d'origine.
function kaliAv() {
  return `<div class="pcav"><svg viewBox="0 0 100 130" aria-hidden="true"><defs><linearGradient id="pcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5cff"/><stop offset="1" stop-color="#2b2f6b"/></linearGradient></defs><rect width="100" height="130" fill="url(#pcg)"/><circle cx="50" cy="48" r="20" fill="#e8c9b0"/><path d="M28 50c0-24 16-30 24-30s22 8 22 30c-4-12-10-16-22-16s-18 4-24 16z" fill="#3a2a5c"/><path d="M12 130c2-28 18-44 38-44s36 16 38 44z" fill="#f2f2f8"/><rect x="66" y="84" width="7" height="22" rx="3.5" fill="#222"/><circle cx="69.500" cy="80" r="7" fill="#ff8a3b"/></svg><img src="img/callie_mystic.jpg" alt="${KALI}" onerror="this.remove()"></div>`;
}
// Fenêtre « équipe adverse » : composition probable et cartes des joueurs (cliquer pour ouvrir la fiche).
function opOpen(n) {
  V.opw = n;
  render();
}
function opClose() {
  V.opw = null;
  render();
}
// Fiche de scouting d'un club (utilisée par la fenêtre adverse et l'onglet Adversaires).
function scoutBody(t, modal) {
  try {
    if (!t.lu || t.lu.length != slots(t.form).length) autoLU(t);
  } catch (e) {}
  const sl = slots(t.form),
    col = (q) => ({ GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' })[q] || '#888',
    card = (p) => pc(p, '', 'prof(\'nm\',this.dataset.n)').replace('<div class="pc ', `<div data-n="${mkEsc(p.n)}" class="pc `).replace(/onclick="event\.stopPropagation\(\);prof\('sq',\d+\)"/, `data-n="${mkEsc(p.n)}" onclick="event.stopPropagation();prof('nm',this.dataset.n)"`),
    line = (q) =>
      `<div class="opl">${sl
        .map((x, k) => (x == q ? t.sq[t.lu[k]] : null))
        .filter(Boolean)
        .map((p) => `<span class="opp" data-n="${mkEsc(p.n)}" onclick="prof('nm',this.dataset.n)" style="border-color:${col(p.p)}"><b>${p.o}</b><span>${p.n}</span></span>`)
        .join('')}</div>`,
    xi = new Set(t.lu.map((i) => t.sq[i]).filter(Boolean)),
    bench = t.sq.filter((p) => p && !xi.has(p));
  const avg = Math.round(t.lu.reduce((a, i) => a + ((t.sq[i] || {}).o || 0), 0) / Math.max(1, t.lu.length));
  const rk = S.teams
      .map((x) => x)
      .sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf),
    pos = rk.indexOf(t) + 1,
    PRL = ['Bas', 'Moyen', 'Haut'],
    sty = TSTY[t.sty || 0] || TSTY[0],
    fs = fsOf(t);
  let nx = null,
    lst = null;
  try {
    const cl = calList().filter((e) => e.opp === t && e.c != 'N');
    nx = cl.find((e) => !e.played);
    lst = cl.filter((e) => e.played && e.my != null).pop();
  } catch (e) {}
  const key = t.lu
      .map((i) => t.sq[i])
      .filter(Boolean)
      .sort((a, b) => b.o - a.o)
      .slice(0, 3),
    sc = t.sq
      .filter((p) => p && (p.g || 0) > 0)
      .sort((a, b) => (b.g || 0) - (a.g || 0))
      .slice(0, 3),
    ch = (p, x) =>
      `<span class="opp" data-n="${mkEsc(p.n)}" onclick="prof('nm',this.dataset.n)" style="border-color:${col(p.p)}"><b>${p.o}</b><span>${p.n}${x ? ' · ' + x : ''}</span></span>`,
    kv = (k, v) => `<div class="scv"><span>${k}</span><b>${v}</b></div>`,
    ins = INS.filter((i) => INS_MAIN.includes(i.k))
      .map((i) => kv(i.l.replace(/ \(.*\)/, ''), i.o[tiV(t, i.k)]))
      .join('');
  return `<div class="ctl" style="justify-content:space-between;align-items:flex-start"><div><b style="font-size:20px">${t.em} ${t.name}</b><div class="mu">${pos}${pos == 1 ? 'er' : 'e'} · ${t.pts} pts (${t.w || 0}V ${t.d || 0}N ${t.l || 0}D) · diff. ${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga} · note moyenne du onze ${avg} ${chForm(t)}</div></div>${modal ? '<button onclick="opClose()">✕ Fermer</button>' : ''}</div><div class="scm">${nx ? `<span>📅 Prochaine rencontre : <b>${fmtDay(nx.day)}</b> (${nx.h ? 'à domicile' : 'à l’extérieur'}, ${nx.c == 'C' ? 'Cup' : 'Ligue'})</span>` : '<span class="mu">Plus de rencontre prévue.</span>'}${lst ? `<span>Dernier duel : ${lst.my}-${lst.op}</span>` : ''}</div><h3 style="margin:12px 0 6px">Tactique ${hp('scout')}</h3><div class="scg">${kv('Formation', t.form)}${kv('Sans le ballon', fs)}${kv('Mentalité', MENT[t.m ?? 1])}${kv('Pressing', PRL[t.pr ?? 1])}${kv('Style', sty.n)}${ins}</div><h3 style="margin:12px 0 6px">Joueurs à surveiller</h3><div class="opl" style="justify-content:flex-start">${key.map((p) => ch(p, p.p)).join('')}${sc.map((p) => ch(p, p.g + ' but' + (p.g > 1 ? 's' : ''))).join('')}</div><h3 style="margin:12px 0 6px">Composition probable</h3><div class="opf">${['ATT', 'MID', 'DEF', 'GK'].map(line).join('')}</div><h3 style="margin:14px 0 6px">Joueurs (touchez une carte pour ouvrir sa fiche)</h3><div class="pg${V.vw == 'l' ? ' l' : ''}">${[...xi, ...bench].map(card).join('')}</div>`;
}
function opBox() {
  if (!V || !V.opw || V.pf || !S) return '';
  const t = (S.teams || []).find((x) => x.name == V.opw);
  if (!t) return '';
  return `<div class="mo opm" onclick="if(event.target===this)opClose()"><div class="card opc2">${scoutBody(t, 1)}</div></div>`;
}
// Onglet « Adversaires » : recherche de clubs et de joueurs, fiche complète avec tactiques, à tout moment.
function advView() {
  const q = (V.adq || '').trim().toLowerCase(),
    rk = S.teams
      .map((t, i) => [t, i])
      .sort((a, b) => b[0].pts - a[0].pts || b[0].gf - b[0].ga - (a[0].gf - a[0].ga) || b[0].gf - a[0].gf),
    my = me();
  let nx = null;
  try {
    nx = calList().find((e) => !e.played && e.c != 'N');
  } catch (e) {}
  const L = rk
    .map(([t], k) => ({ t, k, hit: q ? t.sq.filter((p) => p && p.n.toLowerCase().includes(q)).map((p) => p.n) : [] }))
    .filter((r) => r.t !== my && (!q || r.t.name.toLowerCase().includes(q) || r.hit.length));
  let sel = S.teams.find((x) => x.name == V.adt && x !== my);
  if (!sel) sel = (nx && nx.opp && nx.opp !== my && S.teams.includes(nx.opp) ? nx.opp : null) || (L[0] && L[0].t);
  const rows =
    L.map(
      (r) =>
        `<div class="adr ${sel === r.t ? 'sel' : ''}" onclick="V.adt=this.dataset.n;render()" data-n="${mkEsc(r.t.name)}"><span class="chnu">${r.k + 1}</span><span class="adn">${r.t.em} <b>${r.t.name}</b>${nx && nx.opp === r.t ? ' <small class="mreq">Prochain</small>' : ''}${r.hit.length ? `<small class="mu"> → ${r.hit.slice(0, 3).join(', ')}</small>` : ''}</span><span class="mu">${r.t.pts} pts</span>${chForm(r.t)}</div>`,
    ).join('') || '<div class="mu" style="padding:14px">Aucun club ni joueur ne correspond.</div>';
  return `<div class="fvw"><div class="adg"><div class="card adl"><div class="ctl" style="justify-content:space-between"><b>🔎 Adversaires ${hp('adv')}</b></div><input class="adq" placeholder="🔍 Club ou joueur…" value="${mkEsc(V.adq || '')}" onchange="V.adq=this.value;render()"><div class="adrs">${rows}</div></div><div class="card adc">${sel ? scoutBody(sel, 0) : '<div class="mu">Aucun club.</div>'}</div></div></div>`;
}
function pcBox() {
  const c = typeof V != 'undefined' && V && V.pc;
  if (!c || !S) return '';
  const q = c.qs[c.i],
    Q = [MDP, MDW, MDN, MDL][q.g][q.n],
    last = c.i + 1 >= c.qs.length,
    qt = pcTxt(Q.q, c.o, c.f);
  const body = c.res
    ? `<div class="pcyou"><small>Votre réponse</small>${c.res.l}</div><div class="pcr"><b>${KALI}</b> ${c.res.r}</div>${c.res.fx.length ? `<div class="pcfx">${c.res.fx.map((f) => `<span>${f}</span>`).join('')}</div>` : '<div class="mu" style="margin:6px 0">Aucun effet notable.</div>'}<div class="ctl" style="justify-content:flex-end;margin-top:10px"><button class="p" onclick="pcNext()">${last ? 'Retour au jeu' : 'Question suivante'}</button></div>`
    : `<div class="pco">${Q.o.map((z, j) => `<button class="${c.sel == j ? 'on' : ''}" onclick="pcSel(${j})">${pcTxt(z.l, c.o, c.f)}</button>`).join('')}</div><div class="ctl" style="justify-content:space-between;margin-top:10px"><button onclick="pcOk(1)" title="Ne pas répondre (−1 de confiance du conseil)">Décliner</button><button class="p" onclick="pcOk()" ${c.sel < 0 ? 'disabled' : ''}>Valider la réponse</button></div>`;
  return `<div class="mo pcm"><div class="card pcc"><div class="pch"><b>🎙️ Conférence de presse</b><span class="mu">${c.kind == 'pre' ? 'Avant le match' : 'Après le match'} contre ${c.o}${c.sc ? ' (' + c.sc + ')' : ''} · Galactik Post · question ${c.i + 1}/${c.qs.length}</span></div><div class="pcb">${kaliAv()}<div class="pcq"><div class="pcn">${KALI}<small>Journaliste · Galactik Post</small></div><div class="pcbb">${qt}</div></div></div>${body}</div></div>`;
}
// Applique les effets d'une réponse d'interview (moral, confiance du conseil, pari) et renvoie leur liste lisible.
function mdEff(z, f) {
  const t = me(),
    fx = [],
    bz = mgb('iv'),
    zm = z.mo > 0 ? z.mo + bz : z.mo,
    zc = z.cf > 0 ? z.cf + bz : z.cf;
  if (z.mo) {
    t.sq.forEach((p) => (p.mo = Math.max(0, Math.min(100, (p.mo ?? 60) + zm))));
    fx.push('Moral ' + (zm > 0 ? '+' : '') + zm);
  }
  if (z.cf) {
    S.conf = Math.max(0, Math.min(100, S.conf + zc));
    fx.push('Confiance du conseil ' + (zc > 0 ? '+' : '') + zc);
  }
  if (z.pm && f) {
    const nm = f[z.pm[0]],
      pp = nm && t.sq.find((x) => x.n == nm);
    if (pp) {
      const d = z.pm[1] > 0 ? z.pm[1] + bz : z.pm[1];
      pp.mo = Math.max(0, Math.min(100, (pp.mo ?? 60) + d));
      fx.push('Moral de ' + pp.n + ' ' + (d > 0 ? '+' : '') + d);
    }
  }
  if (z.pr) {
    S.pm = 1;
    fx.push('Pari sur la victoire');
  }
  return fx;
}
// Réponse du joueur à une interview.
function actMd(i, j) {
  const m = S.mail[i];
  if (!m.o) {
    // Réparation d'un mail d'interview sans référence (créé par une version précédente) : on retrouve la question par son titre.
    const g = [MDP, MDW, MDN, MDL].findIndex((P) => P.some((x) => x.t == m.t));
    if (g >= 0) m.o = { g, n: [MDP, MDW, MDN, MDL][g].findIndex((x) => x.t == m.t) };
  }
  const a = m.a[j],
    z = [MDP, MDW, MDN, MDL][m.o.g][m.o.n].o[a[2]],
    fx = mdEff(z);
  m.b += '\n\n→ ' + z.r + (fx.length ? ' (' + fx.join(' · ') + ')' : '');
  m.a = null;
  skXp(2);
  save();
  render();
}
// Envoie, après un match, un mail de presse (parfois) choisi parmi des sujets variés.
function pzMail(k, f) {
  try {
    if (Math.random() > 0.55) return;
    const P = PZ.filter((x) => pcOk0(x, f) && !S.mail.slice(0, 6).some((m) => m.t == x.t));
    if (!P.length) return;
    const x = P[Math.floor(Math.random() * P.length)],
      who = x.k ? f[x.k] || '' : '';
    mail(x.t, x.b(f), x.o.map((z, j) => [z.l, 'pz', PZ.indexOf(x), j, who]));
  } catch (e) {}
}
// Réponse du joueur à un mail de presse varié.
function actPz(i, j) {
  const m = S.mail[i],
    a = m.a[j],
    X = PZ[a[2]],
    z = X && X.o[a[3]];
  if (!z) return;
  const f = {};
  if (X.k) f[X.k] = a[4];
  const fx = mdEff(z, f);
  m.b += '\n\n→ ' + z.r + (fx.length ? ' (' + fx.join(' · ') + ')' : '');
  m.a = null;
  m.r = 1;
  skXp(1);
  save();
  render();
}
// Interview avant match (la veille).
function mdPre() {
  const e = nextEv();
  if (!e || e[0] == 'N' || S.day != e[1] - 1 || S.pmd === e[1]) return;
  S.pmd = e[1];
  const m = nxI(),
    o = m ? (m.find((x) => x.name != me().name) || m[1]).name : 'l’adversaire';
  const t = me(),
    st = t.sq.slice().sort((a, b) => b.o - a.o)[0],
    ij = t.sq.filter((p) => p.inj > 0).sort((a, b) => b.o - a.o)[0];
  pcOpen('pre', o, null, null, { P: st && st.n, J: ij && ij.n });
}
// Conséquences d'une interview après le match.
function mdPost(k, g, c, o, f) {
  S.mail.forEach((m) => {
    if (m.pmk && m.a) {
      m.a = null;
      m.b += '\n\n→ Vous n’avez pas répondu à temps.';
    }
  });
  if (S.pm) {
    S.pm = 0;
    if (k == 'V') {
      S.conf = Math.min(100, S.conf + 4);
      me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 4)));
      mail(
        'Presse : promesse tenue',
        'Vous aviez promis la victoire face à ' +
          o +
          ', et vous l’avez obtenue. Les médias saluent votre assurance. (Moral +4 · Confiance du conseil +4)',
      );
    } else {
      S.conf = Math.max(0, S.conf - 4);
      me().sq.forEach((p) => (p.mo = Math.max(0, (p.mo ?? 60) - 3)));
      mail(
        'Presse : promesse non tenue',
        'Vous aviez promis la victoire face à ' +
          o +
          '. Les médias ne vous épargnent pas. (Moral −3 · Confiance du conseil −4)',
      );
    }
  }
  // La conférence d'après-match s'ouvre quand le manager clique sur « Continuer » (pas pendant le match).
  S.pcw = { o, k, sc: g + ' - ' + c, f: f || {} };
  pzMail(k, f || {});
}
// Phrase d'objectif de classement.
function obRk() {
  return S.obj == 1 ? 'terminer premier' : 'terminer dans les ' + S.obj + ' premiers';
}
// Niveau de difficulté de l'objectif selon le niveau de l'équipe.
function obTier() {
  const rk =
    T.map((t) => t[1])
      .sort((a, b) => b - a)
      .indexOf((T[S.t] || [0, 0])[1]) + 1;
  return rk <= 4 ? 'A' : rk <= 9 ? 'B' : 'C';
}
// Génère les objectifs du conseil pour la saison.
function obGen(first) {
  if (S.ctx == 'C') return;
  const g = S.fx.length,
    tr = obTier(),
    W = Math.ceil(g * (tr == 'A' ? 0.6 : tr == 'B' ? 0.45 : 0.3)),
    has = S.fx.some((d) =>
      d.some(([a, b]) => (a == S.t || b == S.t) && isDerby(S.teams[a].name, S.teams[b].name)),
    ),
    subs = [{ k: 'w', n: W, t: 'Gagner au moins ' + W + ' matchs' }];
  if (tr == 'A' && has) subs.push({ k: 'dw', n: 1, t: 'Remporter au moins un derby' });
  else if (tr == 'C') subs.push({ k: 'cf', n: 50, t: 'Terminer avec au moins 50 % de confiance du conseil' });
  else {
    const c = Math.max(0, Math.round(S.cash / 100) * 100);
    subs.push({ k: 'cash', n: c, t: 'Terminer avec au moins ' + c + ' crédits en caisse' });
  }
  S.ob = { s: S.season, tr, subs, dw: 0 };
  if (!first && S.season > 1)
    mail(
      'Objectifs du conseil : saison ' + S.season,
      'Odile Marchand vous transmet les attentes du conseil pour cette saison.\n\n• Classement : ' +
        obRk() +
        '.\n' +
        subs.map((x) => '• ' + x.t + '.').join('\n') +
        '\n\nChaque objectif secondaire atteint rapporte 400 crédits et +3 de confiance ; un objectif manqué coûte 2 points de confiance.',
    );
}
// Génère les objectifs s'il n'y en a pas.
function obEnsure(first) {
  if (S.ctx == 'C') return;
  if (!S.ob || S.ob.s !== S.season) obGen(first);
}
// Texte des objectifs.
function obTxt() {
  obEnsure(1);
  return S.ob ? '\n' + S.ob.subs.map((x) => '• ' + x.t + ' (400 crédits).').join('\n') : '';
}
// Valeur actuelle d'un objectif.
function obVal(x) {
  return x.k == 'w' ? me().w : x.k == 'dw' ? S.ob.dw || 0 : x.k == 'cash' ? S.cash : S.conf;
}
// Évalue les objectifs en fin de saison et verse les récompenses.
function obEval() {
  if (S.ctx == 'C' || !S.ob || S.ob.done === S.season) return;
  S.ob.done = S.season;
  let g = 0,
    l = [];
  S.ob.subs.forEach((x) => {
    const ok = obVal(x) >= x.n;
    l.push((ok ? '✔ ' : '✘ ') + x.t);
    if (ok) {
      g++;
      tx('Primes', 400);
      S.conf = Math.min(100, S.conf + 3);
    } else S.conf = Math.max(0, S.conf - 2);
  });
  mail(
    'Bilan des objectifs secondaires',
    l.join('\n') +
      '\n\n' +
      (g
        ? g +
          ' objectif' +
          (g > 1 ? 's' : '') +
          ' atteint' +
          (g > 1 ? 's' : '') +
          ' : prime de ' +
          g * 400 +
          ' crédits.'
        : 'Aucun objectif secondaire atteint : le conseil est déçu.'),
  );
}
// Affiche les objectifs du conseil.
function obView() {
  if (S.ctx == 'C')
    return `<h2>Objectif de la fédération</h2><div class="card"><div class="row"><span class="nm">Terminer dans les 2 premiers de votre poule</span></div></div>`;
  obEnsure();
  const o = S.ob,
    rk = stdg(grpOf(me())).indexOf(me()) + 1,
    R = (ok, t, v, p) =>
      `<div style="margin:6px 0"><div class="row"><span class="nm">${ok ? '✔' : '○'} ${t}</span><span class="mu">${v}</span>${gg(Math.min(100, Math.round(p * 100)), { size: 48, fs: 34, c: ok ? 'var(--ok)' : '#e0a526' })}</div></div>`;
  return `<h2>Objectifs du conseil ${hp('obj')}</h2><div class="card"><div class="mu" style="margin-bottom:4px">Fixés par Odile Marchand, présidente du conseil · profil du club : ${{ A: 'ambitieux', B: 'ambitieux modéré', C: 'outsider' }[o.tr]}</div>${R(rk <= S.obj, obRk()[0].toUpperCase() + obRk().slice(1), 'actuellement ' + rk + 'e', Math.min(1, S.obj / rk))}${o.subs.map((x) => R(obVal(x) >= x.n, x.t, x.k == 'cash' ? S.cash + ' / ' + x.n : x.k == 'cf' ? S.conf + ' / ' + x.n + ' %' : obVal(x) + ' / ' + x.n, obVal(x) / Math.max(1, x.n))).join('')}</div>`;
}
// Ancienne page Carrière, encore utilisée comme contenu de l'onglet Carrière.
function careerViewOld() {
  const a = S.ach || {},
    pal = S.pal || [];
  return (
    `<div class="card"><b>Confiance du conseil</b>${hp('car1')}<div style="display:flex;justify-content:center;margin-top:4px">${gg(S.conf, { size: 130, fs: 34, c: S.conf < 25 ? '#d33' : 'var(--ok)' })}</div><div class="mu" style="margin-top:6px">Objectif : top ${S.obj} · titres : ${S.titles || 0}${S.lc ? ' · dernière chance utilisée' : ''}</div></div>${obView()}<h2>Palmarès</h2><div class="card">${pal.length ? '<table><tr><th>Saison</th><th>Club</th><th>Rang</th><th>Pts</th><th>Coupe</th></tr>' + pal.map((e) => `<tr><td>${e.s}</td><td>${e.club}</td><td>${e.r}</td><td>${e.pts}</td><td>${e.cup || '—'}</td></tr>`).join('') + '</table>' : '<div class="mu">Aucune saison terminée.</div>'}</div><h2>Succès (${Object.keys(a).length}/${Object.keys(ACH).length})</h2><div class="card">` +
    Object.keys(ACH)
      .map((k) => `<div class="row"><span class="nm">${a[k] ? '🏆' : '🔒'} ${ACH[k]}</span></div>`)
      .join('') +
    '</div>'
  );
}
// Change d'onglet. go2('ov') = Aperçu. Les identifiants des onglets sont dans la fonction shell.
// Bascule du menu latéral : sur PC/tablette large, classique ↔ tiroir (icônes seules) ; sur petit écran, ouvre/ferme le tiroir.
const sbTog = () => {
    if (window.innerWidth > 1024) {
      ST.sbm = ST.sbm ? 0 : 1;
      stSave();
    } else V.sb = !V.sb;
    render();
  },
  go2 = (k) => {
    if (V.m && V.tab == 'match') return; // mode match : pas d'autres menus avant « Continuer »
    V.tab = k;
    V.sb = 0;
    render();
  },
  goLab = () => {
    const e = nextEv();
    return V.m && !V.m.done
      ? '⚽ Match en cours'
      : !V.m && mailReq().length
        ? '✉️ Répondre au mail (' + mailReq().length + ')'
        : !e
        ? '🏆 Fin de saison'
        : S.day >= e[1]
          ? (e[0] == 'N' ? '🌑 Soirée nocturne' : '⚽ Jouer le match') +
            (S.mode == 'D' && e[0] != S.ctx && e[0] != 'N' ? ' · ' + (e[0] == 'C' ? 'Cup' : 'Ligue') : '')
          : '▶ Continuer';
  },
  news = () =>
    S.mail
      .filter((m) => !m.x)
      .slice(0, 6)
      .map((m) => m.t)
      .concat(
        (S.res || []).slice(0, 4).map(([a, b, x, y]) => `${S.teams[a].name} ${x}-${y} ${S.teams[b].name}`),
      )
      .join('   |   ') || 'Bienvenue dans la Ligue Galactique';
// Vrai quand la saison est entièrement terminée (plus aucun match à jouer, champion connu) : il ne reste que « Nouvelle saison ».
function seasonOver() {
  return !!S && !V.m && S.md >= S.fx.length && !nextEv() && (S.ctx != 'C' || (S.cup && S.cup.champ != null));
}
// Bouton principal « Continuer » / « Jouer le match ».
function cont2() {
  if (seasonOver()) return;
  if (V.m && V.m.done) return cont();
  if (V.m) {
    V.tab = 'match';
    return render();
  }
  const e = nextEv();
  if (!e) {
    V.tab = 'table';
    return render();
  }
  if (S.day >= e[1]) return playEv();
  skipDays();
}
// CADRE DE L'APPLICATION : barre latérale (liste des onglets), barre du haut et zone de contenu.
function shell(c) {
  const un = S.mail.filter((m) => m.u && !m.x).length,
    G = [
      [
        'Général',
        [
          ['ov', '🧭', 'Aperçu'],
          ['mail', '✉️', 'Boîte de réception'],
          ['tac', '📋', 'Tactique'],
          ['club', '👥', 'Équipe'],
          ['cal', '📅', 'Calendrier'],
        ],
      ],
      [
        'Club',
        [
          ['mkt', '🔄', S.ctx == 'C' ? 'Convocations' : 'Transferts'],
          ['car', '🧑‍💼', 'Manager'],
          ['table', '🏆', S.ctx == 'C' ? 'Galactik Cup' : 'Championnat'],
          ['gest', '🏟️', S.ctx == 'C' ? 'Gestion fédérale' : 'Gestion du club'],
        ]
          .concat(S.mode == 'C' ? [] : [['form', '🎓', 'Formation']])
          .concat([
            ['fin', '💰', 'Finances'],
            ['stat', '📊', 'Statistiques'],
          ['adv', '🔎', 'Adversaires'],
            ['gal', '🏅', 'Galerie'],
          ])
          .concat(NBU() ? [['nb', '🌑', NB]] : []),
      ],
      [
        'Match et aide',
        [
          ['match', '⚽', 'Match'],
          ['set', '⚙️', 'Paramètres'],
          ['tuto', '❓', 'Aide'],
        ],
      ],
    ],
    it = G.map(
      ([g, l]) =>
        `<div class="mu sgh" style="padding:10px 14px 2px;text-transform:uppercase;font-size:11px">${g}</div>` +
        l
          .map(
            ([k, i, n]) =>
              `<button class="si ${V.tab == k ? 'on' : ''}" title="${n}${HELP['t_' + k] ? ' — ' + HELP['t_' + k] : ''}" onclick="go2('${k}')"><span class="si1">${i}</span><span class="lb" style="flex:1">${n}</span>${k == 'car' && skPts() > 0 ? `<b class="ch" style="padding:0 7px">${skPts()}</b>` : ''}${k == 'mail' && un ? `<b class="ch" style="padding:0 7px;background:var(--ac2,#d33);color:var(--onac2,#fff)">${un}</b>` : ''}</button>`,
          )
          .join(''),
    ).join('');
  const foc = V.tab == 'match' && V.m; // MODE MATCH : plein écran, sans menus, jusqu'au bouton « Continuer »
  if (foc)
    return `<div class="sh foc"><div class="mn"><div class="tb"><img class="cl" src="${S.ctx == 'C' ? LGC : LGL}" alt=""><b class="tbn" style="font-size:17px">${me().em} ${me().name}</b><span style="flex:1"></span>${V.m.done ? '' : `<button onclick="stop();V.menu=1;render()" title="Met le match en pause et ouvre le menu principal.">🏠 Menu</button>`}</div><div class="ct">${c}</div></div></div>`;
  return `<div class="sh">${V.sb ? '<div class="sbk" onclick="V.sb=0;render()"></div>' : ''}<aside class="sb ${V.sb ? 'open' : ''}${ST.sbm ? ' mini' : ''}"><div class="sbt"><span class="sbe" onclick="sbeClk()">${me().em}</span><div class="sbn"><b style="${tfont(me().name)}">${me().name}</b>${tsTxt()}</div></div><button class="sbm" onclick="sbTog()" title="Basculer entre le menu classique et le tiroir (icônes seulement)" aria-label="Réduire ou agrandir le menu"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 4v16" stroke="currentColor" stroke-width="2"/></svg><span class="lb">Réduire le menu</span></button>${S.mode == 'D' ? `<div class="ctl sbsw" style="padding:6px 14px 0"><button class="p" onclick="swapCtx()" ${V.m ? 'disabled' : ''} title="Passer de ${S.ctx == 'C' ? 'la Cup à la Ligue' : 'la Ligue à la Cup'} (impossible pendant un match)."><span class="si1">⇄</span><span class="lb">${S.ctx == 'C' ? 'Aller à la Ligue' : 'Aller à la Cup'}</span></button></div>` : ''}${it}<div class="ctl sbft" style="padding:10px 14px"><button onclick="V.sv=1;V.sn='';render()" title="Sauvegardes"><span class="si1">💾</span><span class="lb"> Sauvegardes</span></button><button onclick="V.menu=1;render()" title="Menu principal"><span class="si1">🏠</span><span class="lb"> Menu</span></button></div></aside><div class="mn"><div class="tb"><button class="hb" onclick="V.sb=!V.sb;render()">☰</button><img class="cl" src="${S.ctx == 'C' ? LGC : LGL}" alt="${compName(S.ctx || 'L')}" title="${compName(S.ctx || 'L')}"><b class="tbn" style="font-size:17px">${me().em} ${me().name}</b><span class="ch">💰 ${S.cash}${hp('chc')}</span><span class="ch">🏛️ ${S.conf}%${hp('chf')}</span><span class="ch">📅 ${fmtDay(S.day)}${hp('chd')}</span><button class="go" onclick="cont2()" ${seasonOver() ? 'disabled title="La saison est terminée : lancez une nouvelle saison depuis le Championnat."' : ''}>${goLab()}</button>${hp('go')}</div><div class="ct">${c}</div></div><div class="tk"><span>${news()}</span></div><div class="lgc" aria-hidden="true"></div></div>`;
}
// Dessine une jauge en arc (confiance, moral, note globale…).
function gg(v, o = {}) {
  const mx = o.max || 100,
    f = Math.max(0, Math.min(1, o.f != null ? o.f : v / mx)),
    A0 = 160,
    SP = 220,
    R = 38,
    pt = (a) => [50 + R * Math.cos((a * Math.PI) / 180), 52 + R * Math.sin((a * Math.PI) / 180)],
    arc = (a, b) => {
      const p = pt(a),
        q = pt(b);
      return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}A${R} ${R} 0 ${b - a > 180 ? 1 : 0} 1 ${q[0].toFixed(2)} ${q[1].toFixed(2)}`;
    },
    c = o.c || (f < 0.34 ? '#c9363f' : f < 0.67 ? '#e0a526' : 'var(--ok)'),
    // Jauge en pourcentage : le signe % est ajouté quand la jauge est assez grande pour l'afficher.
    pc = o.t == null && !o.max && (o.size || 110) >= 40 && o.pc !== 0;
  return `<div class="gg" style="width:${o.size || 110}px"${o.tt ? ` title="${o.tt}"` : ''}><svg viewBox="0 8 100 62" aria-hidden="true"><path d="${arc(A0, A0 + SP)}" fill="none" stroke="var(--gt,#4a5578)" stroke-width="8" stroke-linecap="round"/>${f > 0.004 ? `<path d="${arc(A0, A0 + Math.max(1, SP * f))}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>` : ''}<text x="50" y="58" text-anchor="middle" font-size="${Math.round((o.fs || 23))}" font-weight="800" fill="currentColor">${o.t != null ? o.t : Math.round(v)}</text></svg>${o.l ? `<div class="ggl">${o.l}</div>` : ''}</div>`;
}
// Note globale d'une équipe (moyenne des lignes).
const tRate = (x) => {
  try {
    if (!x || !x.sq || !x.lu) return null;
    const q = str(x);
    return Math.round((q.gk + q.d + q.mid + q.a) / 4);
  } catch (e) {
    return null;
  }
};
// Contenu de l'encadré « Résultats des autres matchs » de l'Aperçu.
function resCard() {
  try {
    const L = S.lr;
    if (S.ctx == 'C' || !L || L.sn != S.season || !L.r.length)
      return '<div class="mu">Aucun résultat pour l’instant.</div>';
    const r = L.r
      .slice()
      .sort((a, b) => b[6] - a[6])
      .slice(0, 6);
    return `<div class="mu" style="font-size:11px;text-transform:uppercase;margin-bottom:2px">Journée ${L.md + 1}</div>${r.map((x) => `<div class="row" style="padding:3px 0;gap:6px"><span class="nm" style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x[0]} ${x[1]}</span><b style="flex:none">${x[2]} - ${x[3]}</b><span class="nm" style="flex:1;font-size:13px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x[4]} ${x[5]}</span></div>`).join('')}`;
  } catch (e) {
    return '';
  }
}
// PAGE « APERÇU » : boîte de réception, prochain match, résultats, championnat, transferts,
// manager, installations, vedette.
function ovView() {
  const t = me(),
    W = (ti, go, b, ga) =>
      `<div class="card w-${ga}" style="--ga:${ga}"><div class="ctl" style="justify-content:space-between"><b>${ti}</b>${go && HELP['w_' + go] ? hp('w_' + go) : ''}${go ? `<button style="padding:2px 8px" onclick="go2('${go}')">›</button>` : ''}</div>${b}</div>`,
    ms =
      S.mail
        .map((m, i) => [m, i])
        .filter(([m]) => !m.x)
        .slice(0, 4)
        .map(
          ([m, i]) =>
            `<div class="row ${m.u ? 'st' : ''}" onclick="S.mail[${i}].u=0;V.mo=${i};go2('mail')"><span class="nm">${m.u ? '● ' : ''}${m.t}</span><span class="mu">J${m.d}</span></div>`,
        )
        .join('') || '<div class="mu">Aucun message.</div>',
    o =
      S.ctx == 'C'
        ? stdg(grpOf(me())).map((x) => [x, S.teams.indexOf(x)])
        : S.teams
            .map((x, i) => [x, i])
            .sort((a, b) => b[0].pts - a[0].pts || b[0].gf - b[0].ga - (a[0].gf - a[0].ga)),
    rk = o.findIndex((z) => z[1] == S.t),
    lo = Math.max(0, Math.min(o.length - 6, rk - 2)),
    sl = (lo > 0 ? [0].concat([1, 2, 3, 4, 5].map((k) => lo + k)) : [0, 1, 2, 3, 4, 5]).filter(
      (j) => j < o.length,
    ),
    st = sl
      .map((j, n) => {
        const [x, i] = o[j];
        return (
          (n == 1 && j > 1
            ? '<tr><td colspan="4" class="mu" style="text-align:center;line-height:.6">⋯</td></tr>'
            : '') +
          `<tr class="${i == S.t ? 'me' : ''}"><td>${j + 1}</td><td>${x.em} ${x.name}${ft(x.name)}</td><td>${x.pl}</td><td>${x.pts}</td></tr>`
        );
      })
      .join(''),
    star = t.sq.slice().sort((a, b) => b.o - a.o)[0],
    ofr =
      S.mail
        .filter((m) => m.a && !m.x)
        .slice(0, 3)
        .map(
          (m) =>
            `<div class="row" onclick="V.mo=${S.mail.indexOf(m)};go2('mail')"><span class="nm">${m.t}</span></div>`,
        )
        .join('') || '<div class="mu">Aucune offre en attente.</div>';
  const ev = nextEv(),
    nm = ev && nxI();
  let nxt;
  if (nm) {
    const r0 = tRate(nm[0]),
      r1 = tRate(nm[1]),
      rc = (a, b) =>
        a == null
          ? ''
          : `<div class="rc" style="--c:${a > b ? 'var(--ok)' : a < b ? '#e0a526' : 'var(--ac)'}">${a}</div>`,
      D = ev[0] != S.ctx && S.alt && ev[0] != 'N' ? S.alt : S,
      up = [];
    if (ev[0] != 'N')
      for (let k = (D.md || 0) + 1; k <= (D.md || 0) + 3 && k < D.fx.length; k++) {
        const m = D.fx[k].find(([h, b]) => h == D.t || b == D.t);
        if (m) {
          const h = m[0] == D.t,
            op = D.teams[h ? m[1] : m[0]];
          up.push(
            `<div class="row" style="padding:3px 0"><span class="nm">${op.em} ${op.name}</span><span class="mu">${h ? 'Dom.' : 'Ext.'} · ${fmtDay(dOf(ev[0], k))}</span></div>`,
          );
        }
      }
    nxt = `<div class="mu" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:6px"><span>${(S.mode == 'D' && ev[0] != 'N') || S.ctx == 'C' ? compName(ev[0]) : ev[0] == 'N' ? 'Soirée nocturne' : compName(ev[0])}</span><span>${ev[0] == 'N' ? 'Duel' : 'Journée ' + (D.md + 1) + '/' + D.fx.length}</span><span>${fmtDay(ev[1])}</span>${ev[0] == 'N' ? '' : `<span class="nxh ${nm[0] === me() ? 'dm' : 'ex'}">${nm[0] === me() ? 'À domicile' : 'À l’extérieur'}</span>`}</div><div class="nxw"><div class="nxm"><div class="nxt${nm[0] !== me() ? ' opc' : ''}"${nm[0] !== me() ? ` data-n="${mkEsc(nm[0].name)}" onclick="opOpen(this.dataset.n)" role="button" title="Voir la composition de ${nm[0].name}"` : ''}><div class="cr">${nm[0].em}</div>${rc(r0, r1)}<b>${nm[0].name}</b></div><div class="nxv">${isDerby(nm[0].name, nm[1].name) ? '<span class="mu">Derby</span><br>' : ''}VS</div><div class="nxt${nm[1] !== me() ? ' opc' : ''}"${nm[1] !== me() ? ` data-n="${mkEsc(nm[1].name)}" onclick="opOpen(this.dataset.n)" role="button" title="Voir la composition de ${nm[1].name}"` : ''}><div class="cr">${nm[1].em}</div>${rc(r1, r0)}<b>${nm[1].name}</b></div></div>${up.length ? `<div class="nxu"><div class="mu" style="text-transform:uppercase;font-size:11px">Prochains adversaires</div>${up.join('')}</div>` : ''}</div>`;
  } else nxt = '<div class="mu">Saison terminée : consultez le classement et lancez la Coupe.</div>';
  const inst = [
      ['Stade', S.st + '/5', S.st / 5],
      [
        'Boutique',
        Object.values(S.mer).reduce((a, b) => a + b, 0) + '/20',
        Object.values(S.mer).reduce((a, b) => a + b, 0) / 20,
      ],
      ['Sponsors', S.sps.length + '/3', S.sps.length / 3],
      ...Object.keys(S.staff).map((k) => [NS[k][0], S.staff[k] + '/5', S.staff[k] / 5]),
    ],
    av = inst.reduce((a, x) => a + x[2], 0) / inst.length,
    mo = Math.round(t.sq.reduce((a, p) => a + (p.mo ?? 60), 0) / Math.max(1, t.sq.length));
  return (
    `<div class="fmg wide">` +
    W('Boîte de réception', 'mail', ms, 'inb') +
    W('Résultats des autres matchs', '', resCard(), 'res') +
    W('Prochain match', 'club', nxt, 'nxt') +
    W(
      S.ctx == 'C' ? 'Galactik Cup' : 'Championnat',
      'table',
      `<div class="ovt"><img class="tl" src="${S.ctx == 'C' ? LGC : LGL}" alt=""><table><tr><th>#</th><th>Équipe</th><th>J</th><th>Pts</th></tr>${st}</table></div>`,
      'cha',
    ) +
    W(
      'Transferts et offres',
      'mkt',
      ovNeg() + (ovNeg() && ofr.includes('Aucune offre en attente') ? '' : ofr) + `<div class="mu" style="margin-top:6px">Crédits : ${S.cash}</div>`,
      'tra',
    ) +
    W(
      'Manager',
      'car',
      `<div class="ctl" style="justify-content:space-around;flex-wrap:nowrap">${gg(S.conf, { l: 'Confiance', size: 116 })}${gg(mo, { l: 'Moral', size: 116 })}</div><div class="mu" style="margin-top:6px;text-align:center">Objectif : top ${S.obj} · titres : ${S.titles || 0} · ${['Facile', 'Normal', 'Difficile'][S.df ?? 1]}</div>`,
      'mgr',
    ) +
    W(
      'Installations',
      'gest',
      `<div class="ctl" style="flex-wrap:nowrap;gap:10px;align-items:center">${gg(0, { f: av, t: (av * 5).toFixed(1).replace('.0', ''), l: 'Note globale', size: 104 })}<div style="flex:1;min-width:0">${inst.map(([a, b]) => `<div class="row" style="padding:2px 4px"><span class="nm">${a}</span><b>${b}</b></div>`).join('')}</div></div>`,
      'ins',
    ) +
    W(
      'En vedette',
      'club',
      star
        ? `<div class="pg" style="grid-template-columns:96px">${pcC(star, '', `pick(${t.sq.indexOf(star)})`)}</div>`
        : '',
      'fea',
    ) +
    '</div>'
  );
}
// Couleur d'accent de chaque équipe (thème de l'interface).
const ACC = {
  'Snow Kids': '#5cc8ff',
  Shadows: '#9b6bff',
  'Team Paradisia': '#ff5fb0',
  Lightnings: '#ffd23f',
  Wambas: '#46e08a',
  Rykers: '#ff9a3d',
  Xenons: '#ff5a36',
  'Tigres Rouges': '#ff4d5e',
  Pirates: '#c9a227',
  Elektras: '#33e0ff',
  Cyclopes: '#2ee6c0',
  'Vortex': '#e4338f',
  Technodroids: '#a9bccf',
  'Comet': '#d65cff',
  Quasars: '#ffc83d',
  Echoes: '#c58bff',
  Nocturnes: '#7c8cff',
  Cumulus: '#9fb4d9',
  Magmas: '#ff7a1f',
  Titans: '#d98a45',
  Mirage: '#e8b04a',
};
// COULEURS DES MAILLOTS de chaque équipe : [couleur principale, couleur secondaire]. Modifier ici
// pour changer les couleurs d'une équipe.
const PAL = {
    'Snow Kids': ['#6579ae', '#d71921'],
    Shadows: ['#000000', '#94c152'],
    'Team Paradisia': ['#d71921', '#ffffff'],
    'Vortex': ['#0fa882', '#e4338f'],
    Xenons: ['#566a44', '#6942ac'],
    Lightnings: ['#1d506e', '#c9f7f6'],
    Wambas: ['#f5f75b', '#8c2e22'],
    Rykers: ['#9b8889', '#e08436'],
    'Tigres Rouges': ['#d71921', '#000000'],
    Pirates: ['#061a25', '#346c85'],
    Elektras: ['#110cd9', '#f68c03'],
    Cyclopes: ['#ffffff', '#d71921'],
    Technodroids: ['#07242e', '#ceb524'],
    'Comet': ['#5b2fc9', '#ffb703'],
    Quasars: ['#12122b', '#ffc83d'],
    Echoes: ['#6a45c8', '#ff8fd0'],
    Nocturnes: ['#2a1b4a', '#c9ccd8'],
    Cumulus: ['#5f6b82', '#ffd23f'],
    Magmas: ['#1c1612', '#ff7a1f'],
    Titans: ['#5a5f6b', '#c97a3a'],
    Mirage: ['#d9a441', '#7a3b1d'],
  },
  hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)),
  rh = (a) =>
    '#' +
    a
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join(''),
  mx = (a, b, t) => rh(hx(a).map((v, i) => v * (1 - t) + hx(b)[i] * t)),
  lm = (h) => {
    const c = hx(h).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  },
  cr = (a, b) => {
    const x = lm(a),
      y = lm(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  },
  ens = (c, bg, m) => {
    let k = 0;
    m = m || 4.5;
    while (cr(c, bg) < m && k++ < 14) c = mx(c, '#ffffff', 0.12);
    return c;
  };
// Copie des couleurs d'origine.
const PAL0 = JSON.parse(JSON.stringify(PAL));
// Fabrique tout le thème de couleurs de l'interface à partir de deux couleurs.
function palette(P) {
  const D = P[0],
    X = P[1],
    base = lm(D) > 0.5 ? (lm(X) > 0.5 ? '#3a3f5c' : X) : D,
    bg = mx(base, '#05070d', 0.9),
    card = mx(base, '#05070d', 0.8),
    sb = mx(base, '#05070d', 0.5),
    tx = '#eef1f8',
    cand = [D, X].map((c) => [c, cr(c, bg)]).sort((a, b) => b[1] - a[1]),
    ac = ens(cand[0][0], bg);
  return {
    '--bg': bg,
    '--card': card,
    '--bd': mx(card, '#ffffff', 0.2),
    '--sb': sb,
    '--tx': tx,
    '--mu': mx(tx, bg, 0.45),
    '--ac': ac,
    '--onac': cr(ac, '#0b0f1a') > cr(ac, '#ffffff') ? '#0b0f1a' : '#ffffff',
    '--hi': mx(bg, ac, 0.2),
    '--dm': ens(D, sb, 3),
    '--ac2': ens(cand[1][0], sb, 3),
    '--onac2':
      cr(ens(cand[1][0], sb, 3), '#0b0f1a') > cr(ens(cand[1][0], sb, 3), '#ffffff') ? '#0b0f1a' : '#ffffff',
    '--ok': '#3ddc97',
    '--bgg': `linear-gradient(135deg, ${mx(base, '#05070d', 0.8)} 0%, ${bg} 55%, ${bg} 72%, ${mx(base === D ? X : D, '#05070d', 0.84)} 100%)`,
  };
}
// Applique le thème de couleurs et la taille du texte à la page.
function theme() {
  try {
    const b = document.body;
    if (!b) return;
    b.style.zoom = [1, 1.15, 1.3][ST.zoom] > 1 ? [1, 1.15, 1.3][ST.zoom] : '';
    b.classList.toggle('rm', !!ST.rm);
    b.classList.toggle('nohp', !ST.hpb);
    const ks = [
        '--bg',
        '--card',
        '--bd',
        '--sb',
        '--tx',
        '--mu',
        '--ac',
        '--onac',
        '--hi',
        '--dm',
        '--ok',
        '--ac2',
        '--onac2',
        '--bgg',
      ],
      P =
        S && S.teams && !V.menu && !V.ed && !V.hv && !V.nth ? PAL[me().name] || ['#4b3fd9', '#ffb703'] : null;
    if (!P) {
      ks.forEach((k) => b.style.removeProperty(k));
      b.style.colorScheme = '';
      return;
    }
    const t = palette(P);
    for (const k in t) b.style.setProperty(k, t[k]);
    if (A.hc) {
      b.style.setProperty('--mu', '#d3d9e6');
      b.style.setProperty('--bd', mx(t['--card'], '#ffffff', 0.4));
    }
    b.style.colorScheme = 'dark';
  } catch (e) {}
}
// Planète d'origine de chaque équipe.
const PL = {
    'Snow Kids': 'Akillian',
    'Tigres Rouges': 'Akillian',
    Shadows: 'Ombra',
    'Team Paradisia': 'Paradisia',
    'Vortex': 'Kaldor',
    Lightnings: 'Xzion',
    Wambas: 'Wamba Prime',
    Rykers: 'Unadar',
    Xenons: 'Archipel Xenon',
    Pirates: 'Pirates',
    Elektras: 'Hektonïa',
    Cyclopes: 'Cyclopia',
    Technodroids: 'Technoïd',
    'Comet': 'Vega',
    Quasars: 'Hélion',
    Echoes: 'Lyrrhia',
    Nocturnes: 'Ombra',
    Cumulus: 'Xzion',
    Magmas: 'Unadar',
    Titans: 'Kéthros',
    Mirage: 'Sahélis',
  },
  planet = (n) => PL[n] || n;
// COMPATIBILITÉ FLUIDE entre un joueur et une équipe (1 = parfaite).
// Particularités de Fluide selon l'origine : « multi » = Paradisia (le multifluide, composant de tous les
// fluides : compatible à 100 % avec tout), « none » = Pirates (aucun fluide, donc aucune compatibilité).
// Le Souffle d'Akillian s'éveille chez les Tigres Rouges à partir de la saison 2.
const trSouffle = () => ((typeof S == 'object' && S && S.season) || 1) >= 2,
  fxOf = (n) => (n == 'Tigres Rouges' && trSouffle() && FX['Snow Kids'] ? FX['Snow Kids'] : FX[n]);
function fluK(p) {
  try {
    const pl = planet(p.og || '');
    if (p.og == 'Tigres Rouges' && !trSouffle()) return 'none';
    return pl == 'Paradisia' ? 'multi' : pl == 'Pirates' ? 'none' : '';
  } catch (e) {
    return '';
  }
}
function compat(p, tn) {
  const og = p.og || tn;
  if (fluK(p) == 'multi') return 100;
  if (og == 'Tigres Rouges' && tn != 'Tigres Rouges' && !trSouffle()) return 0;
  if (og == 'Tigres Rouges' && trSouffle() && planet(tn) == 'Akillian') return 100;
  if (fluK(p) == 'none') return planet(og) == planet(tn) ? 100 : 0;
  if (og == tn || ((TN.some((x) => x[0] == tn) || NEWT.some((x) => x.n == tn)) && planet(og) == planet(tn))) return 100;
  if (p.cp && p.cp[tn] != null) return p.cp[tn];
  let h = 0;
  for (const c of p.n + tn) h = (h * 31 + c.charCodeAt(0)) % 997;
  const lv = (T.find((x) => x[0] == tn) || [0, 10])[1];
  return Math.max(
    5,
    Math.min(99, (planet(og) == planet(tn) ? 85 : 55) + (h % 16) - Math.max(0, lv - 10) * 3),
  );
}
// Arrivée d'un joueur dans une équipe (effet de la compatibilité sur le moral et le Fluide).
function join(p, t) {
  delete p.rv;
  p.og = p.og || T[(Math.random() * T.length) | 0][0];
  const c = compat(p, t.name),
    u = t === me();
  if (c >= 100 || fluK(p) == 'none') {
    p.nz = null;
    return;
  }
  if (Math.random() * 100 > c) {
    const x = c < 30 ? Math.round(26 * Math.pow((30 - c) / 25, 2) + (30 - c) / 5) : 0,
      n = c < 30 ? Math.ceil(x * 0.5) + 3 : Math.ceil((100 - c) / 20) + 1;
    p.nz = { l: n, t: n, s: c < 30 ? (100 - c) / 100 : (100 - c) / 200, x: x };
    if (x > 0) p.inj = Math.max(p.inj || 0, x);
    if (u)
      mail(
        x ? 'Rejet sévère : ' + p.n : 'Nausées : ' + p.n,
        x
          ? p.n +
              ' rejette violemment le Fluide de ' +
              t.name +
              ' (compatibilité ' +
              c +
              ' %) : il est incapable de jouer pendant ' +
              x +
              ' matchs' +
              (x >= 26 ? ' (une saison entière)' : '') +
              ', puis il restera diminué le temps de se l’approprier.'
          : p.n +
              ' rejette le Fluide de ' +
              t.name +
              ' (compatibilité ' +
              c +
              ' %) : léger malaise pendant environ ' +
              n +
              ' matchs.',
      );
  } else {
    p.cp = p.cp || {};
    p.cp[t.name] = Math.max(c, 90);
    p.nz = null;
    if (u)
      mail(
        'Fluide accepté : ' + p.n,
        p.n + ' s’adapte sans difficulté au Fluide de ' + t.name + ' (compatibilité ' + c + ' %).',
      );
  }
}
// Section « Origine et Fluide » de la fiche d'un joueur.
function fluSec(p, t) {
  const og = p.og || (t ? t.name : '?');
  return (
    `<h2>Origine et Fluide</h2><div>Planète : <b>${planet(og)}</b> · Fluide d’origine : <b>${fluK(p) == 'multi' ? 'Multifluide (compatible avec tous les Fluides)' : fluK(p) == 'none' ? (p.og == 'Tigres Rouges' ? 'Aucun (le Souffle d’Akillian ne se manifeste pas encore chez les Tigres Rouges ; compensé par leurs bottes cybernétiques)' : 'Aucun (les Pirates n’ont pas de Fluide ; compensés par plus de physique, d’endurance et de détermination)') : (FX[og] || {}).n || '—'}</b></div>${p.nz ? `<div style="color:#d33"><b>${p.nz.x ? '🛌 Rejet sévère' : '🤢 Nausées'}</b> : rejet du Fluide de l’équipe${p.nz.x && p.inj ? ', incapable de jouer encore ' + p.inj + ' match(s)' : ''}, adaptation dans ~${Math.ceil(p.nz.l)} match(s)</div>` : '<div class="mu">État : 🙂 à l’aise avec le Fluide de son équipe</div>'}<details class="dd" style="margin-top:4px"><summary class="mu">▸ Compatibilité avec chaque Fluide (votre équipe : ${t ? compat(p, t.name) + ' %' : '—'})</summary><div class="fc">` +
    T.map((x) => {
      const c = compat(p, x[0]);
      return `<div class="row" style="padding:2px 0;${t && x[0] == t.name ? 'font-weight:800' : ''}"><span class="nm">${x[2]} ${(fxOf(x[0]) || {}).n || x[0]}</span>${gg(c, { size: 44, fs: 34, c: '#b78bff', tt: 'Compatibilité : ' + c + ' %' })}</div>`;
    }).join('') +
    '</div></details>'
  );
}
// Petit texte de compatibilité affiché sur les cartes.
const cmp = (p) => {
  const c = compat(p, me().name),
    k = fluK(p);
  if (k)
    return `<div class="mu" title="${k == 'multi' ? 'Multifluide : compatible avec tous les Fluides.' : 'Les Pirates n’ont pas de Fluide : aucun rejet, mais aucune technique de Fluide.'}" style="cursor:help;color:var(--ok)">🧬 ${k == 'multi' ? 'Multifluide' : 'Sans Fluide'}</div>`;
  return `<div class="mu" title="Compatibilité Fluide : plus elle est élevée, plus le joueur s’adapte facilement au Fluide de votre équipe. Sous 60 % il risque des nausées, sous 30 % un rejet sévère." style="cursor:help;color:${c < 30 ? '#d33' : c < 60 ? '#c80' : 'var(--ok)'}">🧬 ${c}%${c < 30 ? ' ⚠️' : ''}</div>`;
};
// Fiche détaillée d'un joueur (fenêtre).
// ======================================================================
// FICHE JOUEUR (inspirée d'une fiche de jeu de gestion, mêlée aux particularités de notre jeu :
// Fluide, origine, personnages de la série, cartes prismatiques, rôles, entraînement…).
// ======================================================================
const pfIc = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pfCol = (v) => (v >= 16 ? '#2fb36b' : v >= 12 ? '#a6d637' : v >= 8 ? '#e0a526' : '#e5484d');
const pfRing = (v, c) => `<span class="pfr" style="--rc:${c || pfCol(v)}">${v}</span>`;
// Terrain : zones de jeu (heatmap) + repère de position moyenne du joueur.
function pfPitch(p) {
  const real = p.hm && (p.hmn || 0) > 0,
    x0 = [0.05, 0.24, 0.46, 0.68][Math.max(0, POS.indexOf(p.p))],
    g = real ? p.hm : hmCalc(p, x0, 0.5);
  let s = 0,
    cx = 0,
    cy = 0;
  g.forEach((v, i) => {
    s += v;
    cx += v * ((i % HMC) * 20 + 10);
    cy += v * (Math.floor(i / HMC) * 20 + 10);
  });
  s = s || 1;
  const col = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' }[p.p] || '#888',
    dot = `<circle cx="${(cx / s).toFixed(1)}" cy="${(cy / s).toFixed(1)}" r="6.5" fill="${col}" stroke="#fff" stroke-width="1.6"/><circle cx="${(cx / s).toFixed(1)}" cy="${(cy / s).toFixed(1)}" r="11" fill="none" stroke="${col}" stroke-width="1" opacity=".7"/>`;
  return hmSvg(p).replace('</svg>', dot + '</svg>');
}
// Courbe de progression : de la note actuelle vers le potentiel.
function pfTrend(p) {
  const prog = p.pt && p.age <= PTA && p.pt > p.o,
    a0 = p.age,
    a1 = prog ? Math.max(a0 + 3, 27) : Math.max(a0 + 3, 30),
    v0 = p.o,
    v1 = prog ? Math.max(p.pt, p.o) : p.o,
    lo = Math.floor(Math.min(v0, v1) - 3),
    hi = Math.ceil(Math.max(v0, v1) + 3),
    X = (a) => 38 + ((a - a0) / (a1 - a0)) * 190,
    Y = (v) => 14 + (1 - (v - lo) / (hi - lo)) * 78,
    pts = [];
  for (let a = a0; a <= a1; a += (a1 - a0) / 12) {
    const t = (a - a0) / (a1 - a0),
      e = prog ? 1 - Math.pow(1 - t, 1.8) : 0;
    pts.push(`${X(a).toFixed(1)},${Y(v0 + (v1 - v0) * e).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 240 112" class="pfg" role="img" aria-label="Tendance de développement"><g stroke="#ffffff22"><line x1="38" y1="14" x2="228" y2="14"/><line x1="38" y1="53" x2="228" y2="53"/><line x1="38" y1="92" x2="228" y2="92"/></g><g fill="#9aa5c0" font-size="9" font-family="Montserrat,sans-serif"><text x="4" y="17">${hi}</text><text x="4" y="56">${Math.round((hi + lo) / 2)}</text><text x="4" y="95">${lo}</text><text x="38" y="108">${a0} ans</text><text x="228" y="108" text-anchor="end">${Math.round(a1)} ans</text></g><polyline points="${pts.join(' ')}" fill="none" stroke="var(--pc)" stroke-width="2.4" stroke-dasharray="${prog ? '' : '4 3'}"/><circle cx="${X(a0)}" cy="${Y(v0).toFixed(1)}" r="4" fill="#fff" stroke="var(--pc)" stroke-width="2"/>${prog ? `<circle cx="${X(a1)}" cy="${Y(v1).toFixed(1)}" r="4" fill="none" stroke="var(--pc)" stroke-width="2"/>` : ''}</svg>`;
}
function profBox() {
  const f = V.pf;
  if (!f) return '';
  const p = f.k == 'sq' ? me().sq[f.i] : f.k == 'mk' ? S.mkt[f.i] : f.k == 'nv' ? NAV[f.i] : f.k == 'lo' ? lop(f.i) : f.k == 'nm' ? plIndex().get(f.i) : f.k == 'lt' ? (() => { const [a, n] = String(f.i).slice(1).split('|'); return ((S.teams[+a] || {}).sq || []).find((x) => x.n == n); })() : V.ep[f.i];
  if (!p) return '';
  ensure(p);
  const at = attrs(p),
    sq = f.k == 'sq',
    tm = [...S.teams, ...(S.alt ? S.alt.teams : [])].find((t) => t.sq && t.sq.includes(p)),
    T0 = tm || me(),
    st = p.ss || {},
    pcol = { GK: '#e0a526', DEF: '#3b8fe8', MID: '#2fb36b', ATT: '#e5484d' }[p.p] || '#888',
    PN = { GK: 'Gardien', DEF: 'Défenseur', MID: 'Milieu', ATT: 'Attaquant' }[p.p],
    og = p.og || T0.name,
    cp = compat(p, T0.name),
    rp = p.rp || [],
    avg = rp.length ? (rp.reduce((a, b) => a + b, 0) / rp.length).toFixed(1) : null;
  // Attributs groupés (9 attributs du jeu, dans l'ordre de AT).
  const ar = (i) => `<div class="pfar"><span>${p.p == 'GK' && i == 1 ? 'Réflexes' : AT[i]}</span>${pfRing(at[i])}</div>`,
    grp = (t, a) => `<div class="pfag"><div class="pkt"><b>${t}</b></div>${a.map(ar).join('')}</div>`;
  const moL = (p.mo ?? 60) >= 70 ? 'Excellent' : (p.mo ?? 60) >= 50 ? 'Bon' : (p.mo ?? 60) >= 35 ? 'Moyen' : 'Bas',
    enL = (p.e ?? 100) >= 80 ? 'En forme' : (p.e ?? 100) >= 50 ? 'Correcte' : (p.e ?? 100) >= 30 ? 'Fatigué' : 'Épuisé',
    cpL = fluK(p) == 'multi' ? 'Multifluide' : fluK(p) == 'none' ? 'Sans Fluide' : cp >= 90 ? 'Parfaite' : cp >= 60 ? 'Bonne' : cp >= 30 ? 'Risque de nausées' : 'Rejet sévère',
    tile = (t, k, g, l, extra) => `<div class="pk pft2"><div class="pkt"><b>${t}</b>${hp(k)}</div>${g}<div class="pfl">${l}</div>${extra || ''}</div>`;
  const yc = st.yc || 0,
    rc = st.rc || 0,
    avail = p.inj ? `Blessé : ${p.inj} j.` : p.sus ? `Suspendu : ${p.sus} match${p.sus > 1 ? 's' : ''}` : 'Disponible';
  const tiles =
    `<div class="pf4">` +
    tile('Moral', 'pfmo', gg(p.mo ?? 60, { size: 84 }), moL) +
    tile('Condition', 'pfco', gg(p.e ?? 100, { size: 84, c: '#2fd0c5' }), enL) +
    tile('Fluide', 'pffl', gg(p.f, { size: 84, c: '#b78bff' }), 'Compat. ' + cp + ' % · ' + cpL) +
    tile(
      'Disponibilité',
      'pfsu',
      `<div class="pfcd"><i class="cy" style="background:#ff8a3b"></i></div>`,
      avail,
      `<div class="pfl mu">${yc + rc + (st.ex || 0)} exclusion${yc + rc + (st.ex || 0) > 1 ? 's' : ''}</div>`,
    ) +
    `</div>`;
  const attrCard = `<div class="pk"><div class="pkt"><b>Attributs</b>${hp('pfa')}</div><div class="pfa3">${grp('Technique', [1, 2, 3, 5])}${grp('Physique', [0, 6, 8])}${grp('Mental', [4, 7])}</div></div>`;
  // Informations (texte).
  const info = [];
  if (p.c) info.push(`${p.n} est un personnage de la série.`);
  if (p.pr) info.push('Carte prismatique : un joueur d’exception.');
  info.push(`Originaire de ${planet(og)} · Fluide d’origine : ${(FX[og] || {}).n || '—'}.`);
  info.push(
    cp >= 60
      ? `Il s’accorde bien au Fluide de ${T0.name} (${cp} %).`
      : cp >= 30
        ? `Compatibilité de ${cp} % avec le Fluide de ${T0.name} : risque de nausées.`
        : `Compatibilité de ${cp} % avec le Fluide de ${T0.name} : rejet sévère probable.`,
  );
  if (p.nz) info.push(p.nz.x ? 'Il subit actuellement un rejet sévère du Fluide.' : 'Il souffre de nausées liées au Fluide.');
  info.push(`${p.age} ans · ${p.ct} an${p.ct > 1 ? 's' : ''} de contrat restant${p.ct > 1 ? 's' : ''}, salaire ${sal(p)} par match.`);
  if (p.pt && p.age <= PTA) info.push(`Potentiel estimé : ${p.pt}.`);
  if (isCap(p, T0)) info.push('Il porte le brassard de capitaine.');
  if (p.ln) info.push(`En prêt (${p.ln.left} match${p.ln.left > 1 ? 's' : ''} restant${p.ln.left > 1 ? 's' : ''}).`);
  const infoCard = `<div class="pk"><div class="pkt"><b>Informations</b>${hp('pfi')}</div><ul class="pfin">${info.map((x) => `<li>${x}</li>`).join('')}</ul></div>`;
  // Statut et contrat.
  const li = sq ? me().lu.indexOf(f.i) : -1,
    stat = p.ln ? 'Prêté' : p.rv ? 'En réserve' : li >= 0 ? 'Titulaire · ' + slots(me().form)[li] : sq ? 'Remplaçant' : tm ? tm.name : 'Disponible';
  const contrat =
    `<div class="pk"><div class="pkt"><b>Statut et contrat</b></div><div class="pf2c"><div><span class="mu">Statut</span><b>${stat}</b></div><div><span class="mu">Contrat</span><b>${p.ct} an${p.ct > 1 ? 's' : ''}</b></div><div><span class="mu">Salaire</span><b>${sal(p)} / match</b></div><div><span class="mu">Valeur</span><b>${price(p)}</b></div></div>` +
        (sq
      ? `<div class="ctl" style="margin-top:8px">${[1, 2, 3].map((y) => `<button ${p.rn || p.ct + y > 5 || S.cash < sal(p) * y * 8 ? 'disabled' : ''} onclick="renew(${f.i},${y})">+${y} an${y > 1 ? 's' : ''} (${sal(p) * y * 8})</button>`).join('')}</div><div class="mu" style="font-size:12px">${p.rn ? 'Négociation déjà tentée cette saison.' : 'Une tentative par saison ; accord non garanti, le coût n’est payé qu’en cas d’accord.'}</div>`
      : '') +
    `</div>`;
  const dev =
    p.pt && p.age <= PTA && p.pt <= p.o ? 'Au sommet' : p.age <= 21 ? 'Jeune talent' : p.age <= PTA ? 'En développement' : p.age <= 30 ? 'Au sommet' : 'Vers le déclin',
    trend = `<div class="pk"><div class="pkt"><b>Tendance de développement</b>${hp('pfd')}</div><div class="pfgw">${pfTrend(p)}<div class="pf2c"><div><span class="mu">Développement</span><b>${dev}</b></div><div><span class="mu">Note actuelle</span><b>${p.o}</b></div><div><span class="mu">Potentiel</span><b>${p.pt && p.age <= 26 ? (p.pt > p.o ? p.o + ' – ' + p.pt : p.o + ' (atteint)') : '—'}</b></div></div></div></div>`;
  const mg = (h) => (sq && h ? `<div class="pk pfm3">${h}</div>` : ''),
    mgT = sq ? mg(trainSec(p, f.i)) : '',
    mgR = sq ? mg(roleSec(p, f.i)) : '',
    mgC = sq ? mg(capSec(p, f)) : '';
  const fl = `<details class="pk dd" open><summary><b>Origine et Fluide : compatibilité avec chaque équipe</b></summary>${fluSec(p, f.k == 'ed' ? null : me())}</details>`;
  // Colonne de gauche.
  const r1 = rolePick(p, 're'),
    r2 = rolePick(p, 'rs'),
    rn = (r, ph) => (r && ROLES[r.g] ? ROLES[r.g][ph][r.i][0] : 'Standard'),
    row = (a, b) => `<div class="pfi"><span>${a}</span><b>${b}</b></div>`;
  const left =
    `<div class="pk"><div class="pfi0">${row('Âge', p.age + ' ans')}${row('Pied', FTN[foot(p)])}${row('Planète', planet(og))}${row('Fluide d’origine', (FX[og] || {}).n || '—')}${row('Matchs joués', p.mp || 0)}${row('Valeur', price(p))}</div></div>` +
    `<div class="pk"><div class="pkt"><b>Position et zones de jeu</b>${hp('heat')}</div>${pfPitch(p)}<div class="pfi0" style="margin-top:8px">${row('Poste', PN)}${row('Rôle avec ballon', rn(r1, 'ep'))}${row('Rôle sans ballon', rn(r2, 'sp'))}</div></div>` +
    (sq ? `<div class="pk"><div class="pkt"><b>Actions</b></div>${loanSec(p, f.i)}${rvSec(p, f.i)}</div>` : '');
  // Colonne de droite.
  const tt = ptSec(p),
    ic = (n, l, v) => `<div class="pfs">${pfIc(n)}<span>${l}</span><b>${v}</b></div>`,
    stats =
      `<div class="pk"><div class="pkt"><b>Perfs récentes</b>${hp('pfp')}</div><div class="pfrp">${[0, 1, 2, 3, 4].map((i) => `<span class="${rp[i] != null ? 'ok' : ''}">${rp[i] != null ? rp[i].toFixed(1) : '–'}</span>`).join('')}</div><div class="pfl">Note moyenne : <b>${avg ?? '–'}</b></div></div>` +
      `<div class="pk"><div class="pkt"><b>Statistiques de la saison</b>${hp('pfs')}</div>${ic('team', 'Apparitions', p.mp || 0)}${ic('ball', 'Buts', p.g || 0)}${ic('swap', 'Passes décisives', st.a || 0)}${ic('target', 'Tirs cadrés', (st.ot || 0) + ' / ' + (st.sh || 0))}${p.p == 'GK' ? ic('glove', 'Arrêts', st.sv || 0) : ''}${p.p == 'GK' || p.p == 'DEF' ? ic('shield', 'Sans but encaissé', st.cs || 0) : ''}${ic('medal', 'Homme du match', st.mm || 0)}<div class="pfs"><i class="pfcc cy" style="background:#ff8a3b"></i><span>Exclusions</span><b>${yc + rc + (st.ex || 0)}</b></div></div>` +
      (tt ? `<div class="pk">${tt.replace(/^<h2>Titres<\/h2>/, '<div class="pkt"><b>Titres</b></div>')}</div>` : '');
  const shirt = `<div class="pk pfsh">${jersey(kitOf(T0), pnum(T0, p), p.n, 110)}<div class="pfl">Numéro de maillot : <b>${pnum(T0, p)}</b></div></div>`;
  return `<div class="pfm" onclick="V.pf=null;render()"><div class="pfc${p.pr ? ' prs' : p.c ? ' chr' : ''}" style="--pc:${pcol}" onclick="event.stopPropagation()"><div class="pfh">${photo(p)}<div style="flex:1 1 auto;min-width:0"><div class="pfn">${p.c ? '★ ' : ''}<span class="${p.pr ? 'prn' : p.c ? 'chn' : ''}">${p.n}</span>${fp(p)}${p.nz ? ' ' + pfIc('sick') : ''}</div><div class="pfch"><span class="chp" style="background:var(--pc);color:#071016">${PN}</span>${tm ? `<span class="chp">${tm.name}</span>` : ''}<span class="chp" title="${FTN[foot(p)]}">${footIc(p)}${FTN[foot(p)]}</span><span class="chp">${p.age} ans</span><span class="chp">${planet(og)}</span>${p.inj ? `<span class="chp" style="background:#d33;color:#fff">${pfIc('warn')}indisponible ${p.inj} j.</span>` : ''}${p.ln ? `<span class="chp">${pfIc('loan')}prêt</span>` : ''}</div></div>${tm ? `<div class="pft" title="${tm.name}">${tm.em}</div>` : ''}<div class="pfv"><span>${pfIc('coin')}${price(p)}</span><span class="mu">${sal(p)} / match · ${p.ct} an${p.ct > 1 ? 's' : ''}</span></div><div class="pfrg"><div><span>Général</span><div class="pfo">${p.o}</div>${xpB(p, 'h')}</div><div><span>Potentiel</span><div class="pfo pt">${p.pt && p.age <= 26 ? p.pt : '—'}</div></div></div><button class="pfx" onclick="V.pf=null;V.pn='';render()" aria-label="Fermer">✕</button></div><div class="pfsc"><div class="pf2"><div class="pc1">${left}${mgT}${mgC}</div><div class="pc2">${tiles}${attrCard}<div class="pf2r"><div class="pc2s">${infoCard}${trend}</div><div class="pc2s">${contrat}${fl}</div></div></div><div class="pc3">${stats}${shirt}${mgR}</div></div>${V.pn ? `<div style="margin:8px 18px 0"><b>${V.pn}</b></div>` : ''}</div></div></div>`;
}
// Ajuste les barres de progression.
function barFix() {
  try {
    document.querySelectorAll('.bar').forEach((b) => {
      const i = b.firstElementChild;
      if (!i) return;
      const w = Math.round(parseFloat(i.style.width) || 0),
        pl = !!b.closest('.pc,.row');
      const lo = pl && w < 30;
      b.classList.toggle('lo', lo);
      b.title = (pl ? 'Énergie : ' : 'Niveau : ') + w + ' %' + (lo ? ' (faible : risque de fatigue)' : '');
      b.setAttribute('role', 'img');
      b.setAttribute('aria-label', b.title);
    });
  } catch (e) {}
}
// Gère les sections repliables.
function fold() {
  try {
    const c = document.querySelector('.ct');
    if (!c) return;
    V.dt = V.dt || {};
    [...c.children].forEach((h) => {
      if (h.tagName != 'H2') return;
      let n = h.nextElementSibling;
      const arr = [];
      while (n && arr.length < 4) {
        arr.push(n);
        if (n.classList.contains('card')) break;
        n = n.nextElementSibling;
      }
      if (!n || !n.classList.contains('card')) return;
      const t0 = ((h.firstChild && h.firstChild.textContent) || '').replace(/\(.*?\)/g, '').trim(),
        k = V.tab + ':' + t0,
        d = document.createElement('details'),
        s = document.createElement('summary');
      d.className = 'dt card';
      d.open = true; // sections toujours dépliées : plus de repli
      s.addEventListener('click', (ev) => ev.preventDefault());
      d.addEventListener('toggle', () => {
        if (!d.open) d.open = true;
      });
      s.innerHTML = h.innerHTML;
      d.appendChild(s);
      c.insertBefore(d, h);
      arr.forEach((x) => {
        if (x.classList.contains('card')) x.classList.add('in');
        d.appendChild(x);
      });
      h.remove();
      d.addEventListener('toggle', () => {
        V.dt[k] = d.open;
      });
    });
    // Classements : titre + onglets + résultats dans un seul encadré.
    [...c.children].forEach((x) => {
      const t = x.classList.contains('ctl') && x.firstElementChild;
      const nx = x.nextElementSibling;
      if (!t || t.tagName != 'B' || !/^Classements/.test(t.textContent) || !nx || !nx.classList.contains('card')) return;
      const d = document.createElement('details'),
        sm = document.createElement('summary');
      d.className = 'dt card';
      d.open = true;
      sm.appendChild(t);
      if (x.firstElementChild && x.firstElementChild.classList.contains('hp')) sm.appendChild(x.firstElementChild);
      sm.addEventListener('click', (ev) => ev.preventDefault());
      d.appendChild(sm);
      c.insertBefore(d, x);
      x.style.margin = '0 0 8px';
      d.appendChild(x);
      nx.classList.add('in');
      d.appendChild(nx);
    });
    // Transferts : trois colonnes aux emplacements FIXES (plus de trous ni de sauts).
    if (V.tab == 'mkt' && c.children.length > 3) {
      const kids = [...c.children],
        col = (n) => {
          const e = document.createElement('div');
          e.className = 'tcol mk' + n;
          return e;
        },
        A = col('a'),
        B = col('b'),
        C = col('c');
      const sec = kids.filter((e) => e.tagName == 'DETAILS' || e.classList.contains('card'));
      sec.forEach((e, i) => {
        const t = (e.querySelector('summary') || e).textContent || '';
        (/Marché/.test(t) ? C : i <= 2 ? A : B).appendChild(e);
      });
      const w = document.createElement('div');
      w.className = 'tcols mkc';
      [A, B, C].forEach((e) => e.children.length && w.appendChild(e));
      c.appendChild(w);
    }
  } catch (e) {}
}
// Transforme un texte en identifiant simple (minuscules, sans accents).
const slug = (s) =>
    String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ''),
  F = (m) => m.f || (m.f = snd(m.t, m.b));
// Associe un courrier à un expéditeur (nom, adresse, couleur) selon son contenu.
function snd(t, b) {
  const c = slug(me().name),
    L = 'galactikleague.gal',
    P = (n, e, i, k) => ({ n, e, i, k });
  let m;
  if (/Derby|Classico/.test(t)) return P('Ligue Galactique · Sécurité', 'securite@' + L, '🔥', '#d33');
  if (t[0] == '\u200b') return P('Monsieur Nether', 'monsieur.nether@ombre-mail.gal', '❓', '#555');
  if (/Offre suspecte/.test(t)) return P('Expéditeur inconnu', 'anonyme@ombre-mail.gal', '❓', '#555');
  if (/Scandale|Amende/.test(t)) return P('Commission de discipline', 'discipline@' + L, '⚖️', '#7a4dd8');
  if (/^Interview/.test(t))
    return P('Galactik Post · Interview', 'interview@galactikpost.gal', '🎙️', '#e8743b');
  if (/^Presse|^Actualité/.test(t)) return P('Galactik Post', 'redaction@galactikpost.gal', '📰', '#e8743b');
  if (/^Événement/.test(t)) return P('Ligue Galactique', 'ligue@' + L, '📣', '#3b8fe8');
  if (/Blessure|Remplacements automatiques|Rejet sévère|Nausées|Fluide accepté|Fluide maîtrisé/.test(t))
    return P('Service médical', 'medical@' + c + '.gal', '🩺', '#2fb36b');
  if ((m = t.match(/^Offre de (.+) pour/)))
    return P('Direction de ' + m[1], 'direction@' + slug(m[1]) + '.gal', '🏢', '#3b8fe8');
  if (/Offre repoussée/.test(t)) return P('Agent du joueur', 'agent@agence-stellaire.gal', '💼', '#c9a227');
  if (/^Transfert :|Marché des transferts/.test(t))
    return P('Galactik Transferts', 'mercato@galactiktransferts.gal', '🔄', '#3b8fe8');
  if (/^Sponsor signé/.test(t)) {
    const n = b.split(' : ')[0];
    return P(n, 'partenariats@' + slug(n) + '.gal', '🤝', '#c9a227');
  }
  if (/ponsor/.test(t)) return P('Service partenariats', 'partenariats@' + c + '.gal', '🤝', '#c9a227');
  if (/Contrats|Fins de contrat/.test(t))
    return P('Service juridique', 'juridique@' + c + '.gal', '⚖️', '#7a4dd8');
  if (/Option d’achat|rêt/.test(t)) return P('Service des prêts', 'prets@' + L, '🔁', '#3b8fe8');
  if (/Transfert conclu/.test(t))
    return P('Service des transferts', 'transferts@' + c + '.gal', '🔄', '#3b8fe8');
  if (/Progression|Centre de formation/.test(t))
    return P('Centre de formation', 'formation@' + c + '.gal', '🎓', '#2fb36b');
  if ((m = t.match(/^(.+) est mécontent/)))
    return P('Agent de ' + m[1], 'agent.' + slug(m[1]) + '@agence-stellaire.gal', '💼', '#c9a227');
  if (/Stade/.test(t)) return P('Service des installations', 'installations@' + c + '.gal', '🏟️', '#2fb36b');
  if (/Succès/.test(t)) return P('Ligue Galactique', 'ligue@' + L, '🏆', '#e0a526');
  if (/Bienvenue|Bilan|conseil|Alerte financière/.test(t))
    return P('Conseil d’administration', 'conseil@' + c + '.gal', '🏛️', '#7a4dd8');
  return P('Ligue Galactique', 'ligue@' + L, '📣', '#3b8fe8');
}
// Signature d'un expéditeur de courrier.
function mSig(s) {
  const n = s.n,
    c = me().name;
  let r,
    tm = null;
  if (/^Inconnu|^Monsieur Nether|^Expéditeur inconnu/.test(n)) return '';
  if (/^Conseil d/.test(n)) r = ['Odile Marchand', 'Présidente du conseil d’administration · ' + c];
  else if (/^Service médical/.test(n)) r = ['Dr Haru Okamoto', 'Médecin du club · ' + c];
  else if (/^Centre de formation/.test(n)) r = ['Tiana Roux', 'Directrice de l’académie · ' + c];
  else if (/Interview/.test(n)) r = ['Callie Mystic', 'Journaliste · Galactik Post'];
  else if (/^Galactik Post/.test(n)) r = ['La rédaction', 'Galactik Post'];
  else if (/Sécurité/.test(n)) r = ['Direction de la sécurité', 'Ligue Galactique'];
  else if (/^Commission de discipline/.test(n))
    r = ['Le président de la commission', 'Ligue Galactique · Discipline'];
  else if (/^Service des prêts/.test(n)) r = ['Service des prêts', 'Ligue Galactique'];
  else if (/^Ligue Galactique/.test(n)) r = ['Le secrétariat', 'Ligue Galactique'];
  else if (/^Direction de /.test(n))
    ((r = ['Direction sportive', '']), (tm = (S.teams || []).find((x) => x.name == n.slice(13))));
  else if (/^Agent/.test(n)) r = ['Agence Stellaire', 'Représentation des joueurs'];
  else if (/^Galactik Transferts/.test(n)) r = ['Cellule mercato', 'Galactik Transferts'];
  else if (/^Service partenariats/.test(n)) r = ['Service partenariats', c];
  else if (/^Service juridique/.test(n)) r = ['Service juridique', c];
  else if (/^Service des transferts/.test(n)) r = ['Service des transferts', c];
  else if (/^Service des installations/.test(n)) r = ['Service des installations', c];
  else r = ['L’équipe partenariats', n];
  if (!tm && (r[1] == c || r[1].endsWith(' · ' + c))) tm = me();
  const ro = tm ? r[1].replace(' · ' + c, '').replace(c, '') : r[1];
  return `<div class="msig">${r[0]}${ro ? `<br><span class="mu">${ro}</span>` : ''}${tm ? `<div class="mst"><span class="mse">${tm.em}</span><span>${tm.name}</span></div>` : ''}</div>`;
}
// Page « Boîte de réception ».
// Tous les joueurs connus du jeu (équipes, marché, académie), indexés par leur nom.
function plIndex() {
  const m = new Map(),
    add = (p) => p && p.n && p.n.length >= 4 && !m.has(p.n) && m.set(p.n, p);
  try {
    S.teams.forEach((t) => (t.sq || []).forEach(add));
    (S.mkt || []).forEach(add);
    ((S.ac && S.ac.y) || []).forEach(add);
  } catch (e) {}
  return m;
}
// Dans le texte d'un mail : met en gras les noms de joueurs et retourne ces joueurs (pour afficher leurs cartes).
function mailNames(b) {
  const ix = plIndex(),
    names = [...ix.keys()].sort((a, c) => c.length - a.length),
    found = [];
  if (!names.length || !b) return { h: b, L: found };
  const re = new RegExp(
    '(?<![\\p{L}])(' + names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}])',
    'gu',
  );
  const h = String(b)
    .split(/(<[^>]*>)/)
    .map((x) =>
      x[0] == '<'
        ? x
        : x.replace(re, (n) => {
            const p = ix.get(n);
            if (p && !found.includes(p)) found.push(p);
            return `<b>${n}</b>`;
          }),
    )
    .join('');
  const L = found.slice(0, 6);
  V.mpl = L.map((p) => p.n);
  return { h, L };
}
// Ouvre la fiche d'un joueur cité dans un mail (V.mpl = noms affichés).
function prn(k) {
  const n = (V.mpl || [])[k],
    t = me(),
    i = t.sq.findIndex((p) => p.n == n);
  if (i >= 0) return prof('sq', i);
  V.pf = { k: 'nm', i: n };
  V.pn = '';
  render();
}
// Sépare le texte d'un mail de ses « résultats » (réponses et décisions ajoutées à la fin).
function mailSplit(b) {
  const P = String(b).split(/\n\n(?=→|↩️ Votre réponse)/);
  return { main: P[0], res: P.slice(1) };
}
// Encadré bien visible : choix du joueur et résultat obtenu (vert = favorable, rouge = défavorable).
function mailRes(t) {
  const bad = /refus|impossible|insuffisant|retourne|pas répondu|retire son offre|indisponible|complet/i.test(t) || (/[−-]\d/.test(t) && !/\+\d/.test(t));
  let ch = '',
    rs = t.replace(/^→ ?/, '');
  const m = /^↩️ Votre réponse : ([^\n]*)\n([\s\S]*)$/.exec(t);
  if (m) {
    ch = m[1];
    rs = m[2];
  }
  return `<div class="mres ${bad ? 'bad' : 'ok'}"><div class="mresh"><span class="mresi">${bad ? '✖' : '✔'}</span><b>Résultat de votre décision</b></div>${ch ? `<div class="mresc"><small>Votre choix</small><span>${ch}</span></div>` : ''}<div class="mresr">${rs}</div></div>`;
}
function mailView() {
  const f = V.mf || 'in',
    q = (V.mq || '').toLowerCase(),
    all = S.mail.map((m, i) => [m, i]),
    fl = {
      in: (m) => !m.x,
      unr: (m) => m.u && !m.x,
      star: (m) => m.s && !m.x,
      act: (m) => m.a && !m.x,
      trash: (m) => m.x,
    },
    cnt = (k) => all.filter(([m]) => fl[k](m)).length,
    L = all.filter(
      ([m]) => fl[f](m) && (!q || (m.t + ' ' + F(m).n + ' ' + F(m).e + ' ' + m.b).toLowerCase().includes(q)),
    ),
    sh = L,
    ids = new Set(L.map(([, i]) => i)),
    sel = (V.ms || []).filter((i) => ids.has(i)),
    shIds = sh.map(([, i]) => i),
    RQ = mailReq(),
    unrN = all.filter(([m]) => m.u && !m.x).length,
    allOn = shIds.length && shIds.every((i) => sel.includes(i));
  const side = `<select class="mfs" title="Dossier" onchange="V.mf=this.value;V.mp=0;V.ms=[];V.mo=-1;render()">${[
    ['in', '📥 Boîte de réception'],
    ['unr', '✉️ Non lus'],
    ['star', '⭐ Suivis'],
    ['act', '⚡ À traiter'],
    ['trash', '🗑️ Corbeille'],
  ]
    .map(([k, n]) => `<option value="${k}" ${f == k ? 'selected' : ''}>${n}${cnt(k) ? ' (' + cnt(k) + ')' : ''}</option>`)
    .join('')}</select>`;
  const rows =
    sh
      .map(([m, i]) => {
        const s = F(m);
        return `<div class="mr ${m.u ? 'u' : ''} ${V.mo === i ? 'sel' : ''} ${sel.includes(i) ? 'chk' : ''}" onclick="mOpen(${i})"><span class="mdot ${m.u ? 'u' : ''}" title="${m.u ? 'Non lu' : 'Lu'}"></span><span class="mck ${sel.includes(i) ? 'on' : ''}" onclick="event.stopPropagation();mTog(${i})">${sel.includes(i) ? '✓' : ''}</span><span class="av" style="background:${s.k}">${s.i}</span><div class="mt"><div class="ms"><b>${s.n}</b><span class="mu">${fmtDay(m.dt || 0)}</span></div><div class="mj">${m.u ? '<b>' + m.t + '</b>' : m.t}${m.a ? ' ⚡' : ''}${RQ.includes(i) ? ' <span class="mreq">Réponse requise</span>' : ''}${/\n\n(→|↩️ Votre réponse)/.test(m.b) ? ' <span class="mrd">✓ Répondu</span>' : ''}</div><div class="mu mp">${mailSplit(m.b).main.replace(/\n/g, ' ').slice(0, 70)}</div></div><span class="stz" onclick="event.stopPropagation();mStar(${i})">${m.s ? '⭐' : '☆'}</span></div>`;
      })
      .join('') || '<div class="mu" style="padding:16px">Aucun message.</div>';
  const m = S.mail[V.mo],
    s = m && F(m),
    MB = m ? mailSplit(m.b) : { main: '', res: [] },
    MN = m ? mailNames(MB.main) : { h: '', L: [] },
    pane = m
      ? `<div class="ctl" style="justify-content:space-between"><button class="mb" onclick="V.mo=-1;render()">← Retour</button><span><button onclick="mUnread(${V.mo})">✉️ Non lu</button> <button onclick="mStar(${V.mo})">${m.s ? '⭐' : '☆'}</button> ${m.x ? `<button onclick="mRestore(${V.mo})">↩ Restaurer</button> <button onclick="mPurge(${V.mo})">❌ Supprimer définitivement</button>` : `<button onclick="mDel(${V.mo})">🗑</button>`}</span></div><h3 style="margin:10px 0 6px;font-size:18px">${m.t}</h3><div class="ctl" style="gap:10px;flex-wrap:nowrap"><span class="av" style="background:${s.k}">${s.i}</span><div><b>${s.n}</b> <span class="mu">&lt;${s.e}&gt;</span><div class="mu">à ${me().name} · ${fmtDay(m.dt || 0)} · J${m.d}</div></div></div><div style="white-space:pre-line;margin:12px 0 8px;line-height:1.5">${MN.h}</div>${MB.res.map(mailRes).join('')}${MN.L.length ? `<div class="mpl"><div class="mu" style="margin-bottom:4px">${MN.L.length > 1 ? 'Joueurs cités' : 'Joueur cité'}</div><div class="pg${V.vw == 'l' ? ' l' : ''}">${MN.L.map((p, k) => pc(p, '', 'prn(' + k + ')').replace(/prof\('(?:ed|sq|mk|lo)',[^)]*\)/g, 'prn(' + k + ')')).join('')}</div></div>` : ''}${mSig(s)}${m.a ? `<div class="ctl">${m.a.map((a, j) => `<button class="p" onclick="act(${V.mo},${j})">${a[0]}</button>`).join('')}</div>` : ''}${
          reps(m).length
            ? `<div class="mu" style="margin-top:10px">↩️ Répondre :</div><div class="ctl">${reps(m)
                .map(([l, k]) => `<button onclick="reply(${V.mo},'${k}')">${l}</button>`)
                .join('')}</div>`
            : ''
        }`
      : '<div class="mu" style="padding:30px;text-align:center">📬 Sélectionnez un message pour le lire.</div>';
  return `<div class="card wide mbox ${m ? 'open' : ''}">${RQ.length ? `<div class="mgate">✉️ <b>Réponse requise</b> : répondez ${RQ.length > 1 ? 'aux ' + RQ.length + ' mails marqués' : 'au mail marqué'} « Réponse requise » pour pouvoir continuer la partie.</div>` : ''}<div class="mtop"><b>📥 Messagerie ${hp('mbox')}</b>${side}<input placeholder="🔍 Rechercher dans les messages" value="${V.mq || ''}" onchange="V.mq=this.value;V.mp=0;V.ms=[];render()"><span class="mck ${allOn ? 'on' : ''}" title="Tout sélectionner" onclick="mTogAll([${shIds}])">${allOn ? '✓' : ''}</span>${sel.length ? `<span class="mu"><b>${sel.length}</b> sélectionné${sel.length > 1 ? 's' : ''}</span>${f == 'trash' ? `<button onclick="mSelRestore()">Restaurer (${sel.length})</button><button onclick="mSelPurge()">Supprimer définitivement (${sel.length})</button>` : `<button class="p" onclick="mSelDel()">Supprimer (${sel.length})</button>`}<button onclick="V.ms=[];render()">Annuler</button>` : ''}<span class="mu">${L.length} message${L.length > 1 ? 's' : ''}${unrN ? ' · <b class="mnb">' + unrN + ' non lu' + (unrN > 1 ? 's' : '') + '</b>' : ''}</span><button onclick="mReadAll()">Tout marquer comme lu</button>${f == 'trash' ? '<button onclick="mEmpty()">Vider la corbeille</button>' : ''}</div><div class="mgrid"><div class="mlist">${rows}</div><div class="mpane">${pane}</div></div></div>`;
}
// Ouvre un message.
function mOpen(i) {
  const m = S.mail[i];
  if (!m) return;
  m.u = 0;
  V.mo = i;
  render();
}
// Marque un message avec une étoile.
function mStar(i) {
  S.mail[i].s = !S.mail[i].s;
  save();
  render();
}
// Marque un message comme non lu.
function mUnread(i) {
  S.mail[i].u = 1;
  V.mo = -1;
  save();
  render();
}
// Coche une case de message.
function mTog(i) {
  const a = V.ms || [];
  V.ms = a.includes(i) ? a.filter((x) => x !== i) : a.concat(i);
  render();
}
// Coche tous les messages.
function mTogAll(ids) {
  const a = V.ms || [],
    all = ids.length && ids.every((i) => a.includes(i));
  V.ms = all ? a.filter((i) => !ids.includes(i)) : [...new Set(a.concat(ids))];
  render();
}
// Liste des messages cochés.
function mSel() {
  return (V.ms || []).filter((i) => S.mail[i]);
}
// Met les messages cochés à la corbeille.
function mSelDel() {
  const rq = mailReq();
  mSel().forEach((i) => {
    if (!rq.includes(i)) S.mail[i].x = 1;
  });
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Restaure les messages cochés.
function mSelRestore() {
  mSel().forEach((i) => delete S.mail[i].x);
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Supprime définitivement les messages cochés.
function mSelPurge() {
  const k = new Set(mSel().map((i) => S.mail[i]));
  S.mail = S.mail.filter((m) => !k.has(m));
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Met un message à la corbeille.
function mDel(i) {
  if (mailReq().includes(i)) return;
  S.mail[i].x = 1;
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Restaure un message.
function mRestore(i) {
  delete S.mail[i].x;
  V.mo = -1;
  save();
  render();
}
// Supprime définitivement un message.
function mPurge(i) {
  S.mail.splice(i, 1);
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Vide la corbeille.
function mEmpty() {
  S.mail = S.mail.filter((m) => !m.x);
  V.ms = [];
  V.mo = -1;
  save();
  render();
}
// Ajoute un jeune joueur à l'équipe.
function youth1() {
  const t = me(),
    U = new Set(S.teams.flatMap((x) => x.sq.map((p) => p.n)));
  t.sq.push({
    n: uname(
      U,
      ['Kael', 'Nyra', 'Zane', 'Orin', 'Juno', 'Mira', 'Tovi', 'Wren'],
      ['Voss', 'Korr', 'Nyx', 'Reyes', 'Storm', 'Fenn', 'Kell', 'Doyle'],
    ),
    p: POS[(1 + Math.random() * 3) | 0],
    o: 45 + stL('y') * 4 + ((Math.random() * 8) | 0),
    e: 100,
    f: (40 + Math.random() * 50) | 0,
    g: 0,
    og: t.name,
  });
}
// Réponses proposées pour un message.
function reps(m) {
  const n = F(m).n,
    t = m.t;
  if (m.r || m.a || m.x) return [];
  if (n.startsWith('Conseil'))
    return [
      ['Promettre des résultats', 'c1'],
      ['Demander une rallonge (+600)', 'c2'],
      ['Demander du temps', 'c3'],
    ];
  if (n == 'Service médical') {
    if (/^Blessure : /.test(t))
      return [
        ['Accélérer la rééducation (−2 matchs, 200 cr.)', 'm1'],
        ['Laisser faire', 'm0'],
      ];
    if (/^(Nausées|Rejet sévère) : /.test(t))
      return [
        ['Suivi renforcé (adaptation −1 match, 150 cr.)', 'm2'],
        ['Laisser faire', 'm0'],
      ];
  }
  if (n == 'Galactik Post' && /^Presse/.test(t)) {
    if (PZ.some((x) => x.t == t)) return [];
    if (/^Presse : démonstration/.test(t))
      return [
        ['Rester humble', 'p1'],
        ['Dédier la victoire aux supporters', 'p3'],
        ['Afficher ses ambitions', 'p4'],
      ];
    if (/^Presse : déroute/.test(t))
      return [
        ['Assumer la défaite', 'p5'],
        ['Protéger les joueurs', 'p6'],
        ['Contre-attaquer', 'p2'],
      ];
    if (/^Presse : promesse tenue/.test(t))
      return [
        ['Rester humble', 'p1'],
        ['Promettre de nouveau la victoire', 'p7'],
      ];
    if (/^Presse : promesse non tenue/.test(t))
      return [
        ['Assumer son erreur', 'p5'],
        ['Promettre de se rattraper', 'p8'],
        ['Contre-attaquer', 'p2'],
      ];
    return [
      ['Rester diplomate', 'p1'],
      ['Contre-attaquer', 'p2'],
    ];
  }
  if (n == 'Centre de formation' && /^Centre/.test(t))
    return [
      ['Demander une recrue de plus (300 cr.)', 'f1'],
      ['Remercier', 'm0'],
    ];
  return [];
}
// Envoie la réponse choisie à un message.
function reply(i, k) {
  const m = S.mail[i];
  if (!m || m.r) return;
  const t = m.t,
    p = me().sq.find((x) => t.includes(x.n)),
    lab = (reps(m).find((x) => x[1] == k) || [''])[0];
  let a = 'Message reçu.';
  if (k == 'c1') {
    S.conf = Math.min(100, S.conf + 3);
    a = 'Le conseil prend note de vos engagements et attend des résultats.';
  } else if (k == 'c2') {
    if (S.conf >= 50) {
      tx('Dotation exceptionnelle', 600);
      a = 'Le conseil accorde une rallonge de 600 crédits.';
    } else {
      S.conf = Math.max(0, S.conf - 2);
      a = 'Le conseil refuse : la confiance n’est pas suffisante.';
    }
  } else if (k == 'c3') {
    if (S.md < 10) {
      S.conf = Math.min(100, S.conf + 2);
      a = 'Le conseil accepte de vous laisser du temps.';
    } else {
      S.conf = Math.max(0, S.conf - 2);
      a = 'Le conseil estime que le temps est écoulé.';
    }
  } else if (k == 'm1' && p && p.inj) {
    if (S.cash >= 200) {
      tx('Soins', -200);
      p.inj = Math.max(0, p.inj - 2);
      a = 'Rééducation accélérée : ' + p.n + ' reviendra plus tôt.';
    } else a = 'Crédits insuffisants.';
  } else if (k == 'm2' && p && p.nz) {
    if (S.cash >= 150) {
      tx('Soins', -150);
      p.nz.l = Math.max(0.5, p.nz.l - 1);
      a = 'Suivi renforcé : adaptation accélérée.';
    } else a = 'Crédits insuffisants.';
  } else if (k == 'p1') {
    S.conf = Math.min(100, S.conf + 1);
    a = 'Article mesuré : l’opinion reste favorable.';
  } else if (k == 'p2') {
    if (Math.random() < 0.5) {
      S.conf = Math.min(100, S.conf + 3);
      a = 'Votre sortie fait mouche : les supporters applaudissent.';
    } else {
      S.conf = Math.max(0, S.conf - 3);
      a = 'La sortie se retourne contre vous : polémique.';
    }
  } else if (k == 'p3') {
    S.conf = Math.min(100, S.conf + 1);
    me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 2)));
    a = 'Les tribunes adorent votre dédicace : l’ambiance est au beau fixe. (Moral +2 · Confiance du conseil +1)';
  } else if (k == 'p4') {
    me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 3)));
    S.conf = Math.max(0, S.conf - 1);
    a = 'Vos ambitions galvanisent le vestiaire, mais le conseil attend désormais des résultats. (Moral +3 · Confiance du conseil −1)';
  } else if (k == 'p5') {
    S.conf = Math.min(100, S.conf + 2);
    a = 'Vous assumez : le conseil apprécie votre lucidité. (Confiance du conseil +2)';
  } else if (k == 'p6') {
    me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 3)));
    a = 'Le vestiaire apprécie que vous preniez sa défense. (Moral +3)';
  } else if (k == 'p7') {
    S.pm = 1;
    me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 1)));
    a = 'Nouveau pari : vous promettez encore la victoire au prochain match. (Pari sur la victoire · Moral +1)';
  } else if (k == 'p8') {
    me().sq.forEach((p) => (p.mo = Math.min(100, (p.mo ?? 60) + 2)));
    a = 'Vous promettez de vous rattraper : le groupe se remobilise. (Moral +2)';
  } else if (k == 'f1') {
    if (sqN(me()) >= 15) a = 'Effectif complet (15 joueurs).';
    else if (S.cash >= 300) {
      tx('Formation', -300);
      youth1();
      a = 'Une recrue supplémentaire rejoint l’effectif.';
    } else a = 'Crédits insuffisants.';
  }
  m.b += '\n\n↩️ Votre réponse : ' + lab + '\n' + F(m).n + ' : ' + a;
  m.r = 1;
  save();
  render();
}
// Marque tous les messages comme lus.
function mReadAll() {
  S.mail.forEach((m) => (m.u = 0));
  save();
  render();
}
// MENU D'ACCUEIL : carrière, chargement, éditeur, tutoriel, visite guidée, vidéo.
function menuView() {
  const au = slotMeta('gmauto'),
    has = !!S;
  const nw = V.nw
    ? `<div class="mo" onclick="V.nw=0;render()"><div class="card" style="max-width:480px;width:100%;max-height:90vh;overflow:auto" onclick="event.stopPropagation()"><b style="font-size:18px">✨ Les nouveautés</b><div class="mu" style="margin:2px 0 8px">Version ${GV}</div><ul style="line-height:1.45;margin:0 0 12px;padding-left:18px"><li><b>Gestion du club en page web</b> : l’onglet est présenté comme un site : barre d’adresse, bandeau aux couleurs et au logo de votre club, puis les rubriques Match (stade, prix du billet), Sponsors et Boutique, chacune avec ses illustrations. Les coûts et les revenus ne changent pas.</li><li><b>Boutique aux couleurs du club</b> : maillots, écharpes, mugs et posters reprennent les couleurs du maillot et le logo de votre club. Le fond des images est noir, ou clair si le club porte du noir.</li><li><b>Logos des sponsors</b> : les 8 sponsors (Nova Corp, Technoid Inc., Comet Cola, Orion Bank, Zéta Motors, Vega Foods, Plasma Drinks, Akillian Dairy) ont chacun leur logo, dans vos sponsors et dans les offres du moment.</li><li><b>Staff en encadrés</b> : dans Transferts, l’onglet Staff sépare Entraîneur, Kiné, Analyste et Centre de formation, chacun avec son pictogramme, sa jauge de niveau et son bouton d’amélioration. Le bouton « Améliorer le centre » de la Formation y mène directement.</li><li><b>Historique des offres</b> : l’encadré Historique de l’onglet Offres a une hauteur limitée et défile à l’intérieur.</li><li><b>Menu principal compact</b> : les tuiles s’adaptent à la hauteur de l’écran (PC, tablette, mobile) : plus besoin de défiler. Les pastilles (clubs, planètes…) et la mention de projet de fans tiennent sur une seule ligne.</li><li><b>Contraste élevé activé par défaut</b> : les textes secondaires et les bordures sont renforcés dès le départ ; vous pouvez le couper dans les Paramètres.</li><li><b>Correction</b> : les cartes de joueurs affichées dans les mails (« Joueur cité ») s’affichent de nouveau correctement.</li></ul><button class="p" onclick="V.nw=0;render()">Fermer</button></div></div>`
    : '';
  const ins = V.ins
    ? `<div class="mo" onclick="V.ins=0;render()"><div class="card" style="max-width:460px;width:100%" onclick="event.stopPropagation()"><b style="font-size:18px">📥 Télécharger et installer sur PC</b><p class="mu">Deux façons de jouer hors du navigateur par défaut :</p><p><b>1. Télécharger</b> : un dossier à extraire, avec un lanceur Windows.</p><div class="ctl"><button class="p" onclick="pcDl()">⬇ Télécharger pour PC (.zip)</button>${PWA ? '<button onclick="pwaI();V.ins=0;render()">Installer maintenant</button>' : ''}</div><p class="mu">${V.pcm || 'Le dossier contient le jeu et un lanceur Windows qui l’ouvre dans sa propre fenêtre (Edge ou Chrome), sans toucher à votre navigateur par défaut.'}</p><p><b>2. Installer comme application</b> :</p><ol style="line-height:1.5;padding-left:20px"><li>Ouvrez le jeu dans <b>Chrome</b> ou <b>Edge</b>, directement depuis son lien.</li><li>Cliquez sur l’icône d’installation à droite de la barre d’adresse, ou sur le menu ⋮ puis <b>« Installer Galactik Manager »</b>.</li></ol><p class="mu">Si l’option n’apparaît pas, le navigateur ne la propose pas pour cette page. Firefox et Safari ne permettent pas cette installation sur PC.</p><button onclick="V.ins=0;V.pcm='';render()">Fermer</button></div></div>`
    : '';
  const rmb = V.rm
    ? `<div class="mo" onclick="V.rm=0;render()"><div class="card" style="max-width:480px;width:100%;max-height:90vh;overflow:auto" onclick="event.stopPropagation()"><b style="font-size:18px">🚀 Roadmap</b><div class="mu" style="margin:2px 0 10px">Ce qui est déjà disponible et ce qui arrive, dans l’ordre prévu.</div><div class="rmt">${RMP.map(([t, d, st], i) => `<div class="rmn"><i class="rmd"></i><div><b>${t}</b> <span class="chp rms">${st}</span><div class="mu">${d}</div></div></div>`).join('')}</div><button class="p" onclick="V.rm=0;render()">Fermer</button></div></div>`
    : '';
  const bye = V.bye
    ? `<div class="mo" style="background:#000d"><div class="card" style="max-width:420px;text-align:center"><div style="font-size:44px">👋</div><b style="font-size:20px">À bientôt, manager !</b><p class="mu">${has ? 'Votre partie a été sauvegardée automatiquement. ' : ''}Vous pouvez fermer cet onglet.</p><button class="p" onclick="V.bye=0;render()">Retour au menu</button></div></div>`
    : '';
  // Tuile du menu : classe de couleur, contenu décoratif, titre, sous-titre, action, aide.
  const T = (c, x, t, d, on, hk) =>
      `<div class="gt ${c}" role="button" tabindex="0" onclick="${on}" onkeydown="if(event.key=='Enter')this.click()">${x}<b>${t}${hk ? hp(hk) : ''}</b><small>${d}</small></div>`,
    O = (ic, t, d, on, hk) =>
      `<div class="gt gb" role="button" tabindex="0" onclick="${on}" onkeydown="if(event.key=='Enter')this.click()"><span class="gbo">${ic}</span><b>${t}${hk ? hp(hk) : ''}</b><small>${d}</small></div>`,
    PH = '<span class="ph"></span>',
    rq = has ? mailReq().length : 0,
    ur = has ? S.mail.filter((m) => m.u && !m.x).length : 0,
    cont = has
      ? T('m c1', `${PH}<span class="bd">${me().em}</span>`, 'Continuer la carrière', `${me().name} · saison ${S.season} · journée ${Math.min(S.md + 1, S.fx.length)}/${S.fx.length}${rq ? `<br>${rq} mail${rq > 1 ? 's' : ''} à traiter` : ur ? `<br>${ur} non lu${ur > 1 ? 's' : ''}` : ''}`, 'V.menu=0;render()', 'm_cont')
      : au
        ? T('m c1', `${PH}<span class="bd">▶</span>`, 'Reprendre la sauvegarde auto', `${au.t} · saison ${au.sn} · journée ${au.md + 1} · ${au.dt}`, "slotAct('l',0)", 'm_cont')
        : T('m c1 off', `${PH}<span class="bd">–</span>`, 'Continuer la carrière', 'Aucune partie en cours. Lancez une nouvelle carrière.', '', 'm_cont');
  return `<div class="mm"><div class="mbg"></div><div class="mw gx gxa2"><div class="mh"><h1>GFM</h1><small class="gv">${GV}</small><span class="gxi">${[['V.nw=1', '✨', 'Les nouveautés', 'm_news'], ['V.rm=1', '🚀', 'Roadmap', 'm_road'], ['V.fb=1', '💬', 'Signaler un bug / une idée', 'm_fb'], ...(PWAS() || !PCON ? [] : [['pwaI()', '📥', 'Télécharger / installer sur PC', 'm_inst']]), ['V.stp=1', '⚙️', 'Paramètres', 'm_pref'], ['quit()', '⏻', 'Quitter', 'm_quit']].map(([f, ic, t, k]) => `<button class="gxb" onclick="${f};render()" title="${t}" aria-label="${t}">${ic}<span>${t}</span></button>`).join('')}</span></div><div class="mtg">${cont}${T('m c2', `${PH}<span class="bd">+</span>`, 'Nouvelle carrière', mkU() ? '15 clubs · 15 planètes' : '14 clubs · 14 planètes', 'menuNew()', 'm_new')}${T('m ch', '', 'Charger une partie', '5 emplacements et sauvegarde automatique', "V.sv=1;V.sn='';render()", 'm_load')}${T('n md', '', 'Éditeur de mods', 'Équipes, joueurs, Fluides, couleurs', 'V.menu=0;V.ed=1;V.et=null;render()', 'm_ed')}${T('n tu', '', 'Tutoriel', 'Effectif, tactique, Fluides, finances', 'V.hv=1;render()', 'm_tuto')}${T('n v', '', 'Visite guidée', TOUR.length + ' étapes avec Clamp', 'menuTour()', 'm_tour')}${O('▶', 'Découvrir la série', 'Vidéo de @andsboy · 14 min · YouTube', "window.open('https://www.youtube.com/watch?v=3w1j_jVfzYE','_blank','noopener')", 'm_vid')}${O('⚙️', 'Paramètres', '', 'V.stp=1;render()', 'm_pref')}${O('⏻', 'Quitter', '', 'quit()', 'm_quit')}</div><div class="gxz"><div class="gxc"><span>${mkU() ? 15 : 14} clubs</span><span>${mkU() ? 15 : 14} planètes</span><span>2 compétitions</span><span>7 contre 7</span></div><div class="gxw"><b>Projet de fans non officiel</b> · gratuit et sans aucun but lucratif · non affilié aux ayants droit de « Galactik Football ».</div><div class="gxf">${legLinks()}</div></div></div>${nw}${rmb}${ins}${bye}</div>`;
}
// Bouton « Quitter » : sauvegarde automatique puis message d'au revoir.
function quit() {
  if (S) autosave();
  V.bye = 1;
  render();
}
// Enregistre la partie en cours dans le navigateur (emplacement principal).
function save() {
  try {
    localStorage.setItem('gm6', ser());
  } catch (e) {}
}
try {
  V.vw = localStorage.getItem('gmvw') || 'c';
} catch (e) {}
try {
  MOD = JSON.parse(localStorage.getItem('gmmod')) || MOD;
} catch (e) {}
applyMod();
try {
  S = hyd(JSON.parse(localStorage.getItem('gm6')));
  mkSync();
  useT();
  natSyncAll();
} catch (e) {
  S = null;
}
try {
  if (!localStorage.getItem('gm_intro2')) V.intro = 1;
} catch (e) {}
render();
