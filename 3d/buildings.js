/* =========================================================================
   COMPOSITORE EDIFICI KENNEY (CC0)
   I kit Kenney sono modulari: pannelli-parete 1×1 (spessore 0.1, appoggiati
   sul bordo +x della propria cella), tessere-tetto 1×1, segmenti di torre
   impilabili. Qui assembliamo i 7 "quartieri" del CV su una griglia di celle
   e scaliamo tutto di K per portarlo alle unità mondo del gioco.
   Kit usati: Fantasy Town Kit 2.0 (public/models/town), Castle Kit (…/castle).
   ========================================================================= */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const K = 3.2; // scala: 1 cella Kenney → K unità mondo (1 piano ≈ 3.2)

const BASE = import.meta.env.BASE_URL + "models/";

/* ---------- caricamento (una volta sola per modello, poi si clona) ---------- */
const MODELS = [
  // fantasy town (altri pezzi già copiati in public/models restano disponibili per il futuro)
  "town/wall", "town/wall-door", "town/wall-doorway-square-wide",
  "town/wall-window-glass", "town/wall-window-round", "town/wall-window-shutters",
  "town/wall-wood", "town/wall-wood-window-shutters",
  "town/wall-wood-door", "town/wall-wood-window-glass",
  "town/roof-point", "town/chimney", "town/road",
  "town/stall-red", "town/stall-green", "town/stall-bench",
  "town/fountain-round", "town/lantern", "town/cart", "town/banner-red", "town/banner-green",
  "town/tree", "town/tree-high-round",
  // castle
  "castle/tower-square-base", "castle/tower-square-mid", "castle/tower-square-mid-door",
  "castle/tower-square-mid-windows", "castle/tower-square-mid-open",
  "castle/tower-square-top-roof-high-windows", "castle/tower-square-top-roof-rounded",
  "castle/tower-square-top-roof-high",
  "castle/wall", "castle/wall-doorway",
  "castle/flag", "castle/flag-pennant", "castle/flag-banner-long"
];

const lib = new Map();

export function preloadModels(onProgress) {
  const loader = new GLTFLoader();
  let done = 0;
  return Promise.all(MODELS.map(path => new Promise((res, rej) => {
    loader.load(BASE + path + ".glb", g => {
      g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      lib.set(path, g.scene);
      onProgress?.(++done, MODELS.length);
      res();
    }, undefined, rej);
  })));
}

/* piazza un clone del modello dentro g (coordinate in celle Kenney) */
function P(g, path, x, z, rotY = 0, y = 0, scale = 1) {
  const src = lib.get(path);
  if (!src) throw new Error("modello non precaricato: " + path);
  const m = src.clone(true);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  if (scale !== 1) m.scale.setScalar(scale);
  g.add(m);
  return m;
}
const range = n => [...Array(n).keys()];

/* =========================================================================
   ANELLO DI PARETI — un piano di un edificio w×d celle.
   Convenzione: il fronte (porta) è a +z. Ogni cella di bordo riceve il suo
   pannello ruotato verso l'esterno; le celle d'angolo ne ricevono due.
   fam = "wall" (intonaco) | "wall-wood" (legno)
   opts.door  = nome pezzo porta sul fronte (centrato), es. "wall-door"
   opts.win   = nome pezzo finestra usato sulle celle alterne (null = muro pieno)
   ========================================================================= */
function ring(g, w, d, y, fam, opts = {}) {
  const px = cx => cx - (w - 1) / 2, pz = cz => cz - (d - 1) / 2;
  const doorCx = Math.floor((w - 1) / 2);
  const sides = [
    { cells: range(d).map(cz => [w - 1, cz]), rot: 0,            dir: "e" },
    { cells: range(d).map(cz => [0,     cz]), rot: Math.PI,      dir: "w" },
    { cells: range(w).map(cx => [cx, d - 1]), rot: -Math.PI / 2, dir: "s" },
    { cells: range(w).map(cx => [cx, 0    ]), rot: Math.PI / 2,  dir: "n" }
  ];
  for (const s of sides) s.cells.forEach(([cx, cz], i) => {
    let name = fam;
    const corner = (cx === 0 || cx === w - 1) && (cz === 0 || cz === d - 1);
    if (s.dir === "s" && opts.door && cx === doorCx) name = opts.door;
    else if (!corner && opts.win && i % 2 === (s.dir === "s" ? 1 : 0)) name = opts.win;
    P(g, "town/" + name, px(cx), pz(cz), s.rot, y);
  });
}

/* =========================================================================
   TETTO A PADIGLIONE — un'unica piramide (roof-point scalata sull'intera
   pianta): i pannelli-falda del kit sono sottili e assemblati a tessere
   lasciano un'apertura visibile dall'alto in isometrica.
   roofH = altezza del colmo sopra le pareti (in celle Kenney)
   ========================================================================= */
function hipRoof(g, w, d, y, roofH = 0.5 + 0.4 * Math.min(w, d)) {
  const m = lib.get("town/roof-point").clone(true);
  m.position.set(0, y, 0);
  // la piramide nativa è 1.1×0.5×1.1: si scala per coprire w×d con gronda
  m.scale.set((w + 0.5) / 1.1, roofH / 0.5, (d + 0.5) / 1.1);
  g.add(m);
  return m;
}

/* =========================================================================
   I 7 EDIFICI — ognuno restituisce { group, w, d, h } in CELLE Kenney
   (game.js li scala di K e calcola porta/collisioni/etichetta)
   ========================================================================= */
const BUILDERS = {

  /* 🏠 Casa del villaggio — Chi sono
     Cottage accogliente: persiane al piano terra, vetri al piano in legno,
     camino fumante sul tetto e panchina davanti alla porta. */
  about() {
    const g = new THREE.Group();
    ring(g, 3, 3, 0, "wall",      { door: "wall-door", win: "wall-window-shutters" });
    ring(g, 3, 3, 1, "wall-wood", { win: "wall-wood-window-glass" });
    hipRoof(g, 3, 3, 2);
    P(g, "town/chimney", -1.2, -0.9, 0, 2.3, 0.9);   // camino sulla falda posteriore
    P(g, "town/lantern", 1.05, 1.55, 0, 0, 0.9);
    P(g, "town/stall-bench", -1.15, 1.6, Math.PI);   // panchina davanti casa
    return { group: g, w: 3, d: 3, h: 2.7 };
  },

  /* 🏰 Castello della Gilda — Esperienza */
  experience() {
    const g = new THREE.Group();
    const w = 4, d = 4;
    const px = cx => cx - (w - 1) / 2, pz = cz => cz - (d - 1) / 2;
    // cinta muraria: blocchi pieni del castle kit sul perimetro
    for (const cx of range(w)) for (const cz of range(d)) {
      const border = cx === 0 || cx === w - 1 || cz === 0 || cz === d - 1;
      if (!border) continue;
      const front = cz === d - 1 && (cx === 1 || cx === 2);
      if (front) {
        // Portale d'ingresso centrato: wall-doorway è METÀ blocco (x ∈ [-0.5, 0],
        // misurato dal GLB) tagliato lungo l'asse del passaggio. Le due metà,
        // ruotate di ±90° e accoppiate dorso a dorso, formano l'arco completo
        // rivolto verso la piazza; la scala z×2 (larghezza mondo dopo la
        // rotazione) copre le 2 celle centrali della cinta.
        if (cx === 1) for (const rot of [Math.PI / 2, -Math.PI / 2]) {
          const m = lib.get("castle/wall-doorway").clone(true);
          m.position.set(0, 0, pz(cz));
          m.rotation.y = rot;
          m.scale.set(1, 1, 2);
          g.add(m);
        }
        continue; // la cella cx=2 è già coperta dal portale allargato
      }
      P(g, "castle/wall", px(cx), pz(cz));
    }
    // torri angolari
    for (const [cx, cz] of [[0, 0], [w - 1, 0], [0, d - 1], [w - 1, d - 1]]) {
      P(g, "castle/tower-square-base", px(cx), pz(cz));
      P(g, "castle/tower-square-mid", px(cx), pz(cz), 0, 1.01);
      P(g, "castle/tower-square-top-roof-high", px(cx), pz(cz), 0, 2.02);
    }
    // mastio centrale
    const kY = s => 1.4 * s; // il mastio è scalato 1.4
    P(g, "castle/tower-square-base", 0, -0.3, 0, 0, 1.4);
    P(g, "castle/tower-square-mid-windows", 0, -0.3, 0, kY(1.01), 1.4);
    const keepTop = P(g, "castle/tower-square-top-roof-high-windows", 0, -0.3, 0, kY(2.02), 1.4);
    // bandiera sulla cima MISURATA del tetto (l'altezza stimata 1.4*1.35 la lasciava a mezz'aria)
    const peakY = new THREE.Box3().setFromObject(keepTop).max.y;
    P(g, "castle/flag", 0, -0.3, 0, peakY - 0.12);
    return { group: g, w, d, h: 4.9 };
  },

  /* 📜 Torre del Sapere — Istruzione */
  education() {
    const g = new THREE.Group();
    P(g, "castle/tower-square-mid-door", 0, 0, 0);          // porta a terra
    P(g, "castle/tower-square-mid-windows", 0, 0, 0, 1.01);
    P(g, "castle/tower-square-mid-windows", 0, 0, 0, 2.02);
    P(g, "castle/tower-square-top-roof-high-windows", 0, 0, 0, 3.03);
    P(g, "castle/flag-pennant", 0, 0, 0, 3.03 + 1.08);
    return { group: g, w: 1.2, d: 1.2, h: 4.4 };
  },

  /* 🔨 Fucina del fabbro — Competenze */
  skills() {
    const g = new THREE.Group();
    ring(g, 3, 3, 0, "wall", { door: "wall-doorway-square-wide", win: "wall-window-round" });
    hipRoof(g, 3, 3, 1);
    P(g, "town/chimney", 1.2, 0.9, 0, 1.3, 0.9);            // camino del fabbro, vicino alla gronda
    P(g, "town/cart", 2.1, 0.6, 0.5);                       // carro degli attrezzi
    P(g, "town/stall-bench", 1.7, 1.3, Math.PI / 2);        // banco da lavoro
    return { group: g, w: 3, d: 3, h: 1.8 };
  },

  /* 🚩 Mercato dei Mercanti — Lingue */
  languages() {
    const g = new THREE.Group();
    ring(g, 3, 2, 0, "wall", { door: "wall-doorway-square-wide", win: "wall-window-glass" });
    hipRoof(g, 3, 2, 1);
    // bancarelle colorate ai lati dell'ingresso (le lingue = merci da tutto il mondo)
    P(g, "town/stall-red", -1.6, 1.15, Math.PI);
    P(g, "town/stall-green", 1.6, 1.15, Math.PI);
    P(g, "town/banner-red", 0.8, 0.5, -Math.PI / 2, 0); // stendardo appeso alla facciata
    return { group: g, w: 3, d: 2, h: 1.8 };
  },

  /* 🍺 Taverna — Hobby
     Locanda vivace: porta in legno, gagliardetto sul colmo, camino della
     cucina, insegna, "dehor" con due panche e banco della birra a lato. */
  hobbies() {
    const g = new THREE.Group();
    ring(g, 4, 3, 0, "wall",      { door: "wall-wood-door", win: "wall-window-glass" });
    ring(g, 4, 3, 1, "wall-wood", { win: "wall-wood-window-shutters" });
    hipRoof(g, 4, 3, 2);
    P(g, "castle/flag-pennant", 0, 0, 0, 3.62);              // gagliardetto in cima al tetto
    P(g, "town/chimney", 1.35, -0.8, 0, 2.3, 0.9);           // camino della cucina
    P(g, "town/banner-green", 1.05, 1.05, -Math.PI / 2, 1);  // insegna della taverna
    P(g, "town/lantern", -1.05, 1.55, 0, 0, 0.9);
    P(g, "town/stall-bench", -1.8, 1.4, 0);                  // panche del dehor
    P(g, "town/stall-bench", 1.95, 1.5, Math.PI);
    P(g, "town/stall-red", -2.35, 0.6, Math.PI / 2);         // banco della birra a lato
    return { group: g, w: 4, d: 3, h: 4.0 };                 // h alzata: etichetta sopra il gagliardetto
  },

  /* 🕊️ Torre del Messaggero — Contatti */
  contact() {
    const g = new THREE.Group();
    P(g, "castle/tower-square-mid-door", 0, 0, 0);
    P(g, "castle/tower-square-mid-windows", 0, 0, 0, 1.01);
    P(g, "castle/tower-square-mid-open", 0, 0, 0, 2.02);    // loggia aperta: partono i piccioni!
    P(g, "castle/tower-square-top-roof-rounded", 0, 0, 0, 3.03);
    P(g, "castle/flag-banner-long", 0.47, 0, 0, 1.4);       // lungo stendardo sul fronte
    return { group: g, w: 1.2, d: 1.2, h: 4.1 };
  }
};

/* costruisce l'edificio di un quartiere: gruppo già scalato di K */
export function buildDistrict(id) {
  const { group, w, d, h } = BUILDERS[id]();
  group.scale.setScalar(K);
  return { group, w: w * K, d: d * K, h: h * K };
}

/* albero Kenney (variante alternata) */
export function buildTree(i = 0) {
  const src = lib.get(i % 2 ? "town/tree-high-round" : "town/tree");
  const t = src.clone(true);
  t.scale.setScalar(K * (0.9 + (i % 3) * 0.15));
  t.rotation.y = i * 1.7; // rotazioni "casuali" ma deterministiche
  return t;
}

/* =========================================================================
   FORESTA — anelli concentrici di alberi ISTANZIATI attorno al villaggio,
   abbastanza fitti da chiudere l'orizzonte ("la fine del mondo").
   ~900 alberi ma pochissimi draw call: per ogni mesh dei 2 modelli albero
   si crea UNA InstancedMesh con le matrici di tutte le sue istanze.
   PRNG seminato (LCG): layout deterministico, stesso bosco a ogni visita.
   Ritorna { group, inner } — inner = tronchi delle prime 2 file, le uniche
   raggiungibili camminando (per i collider in game.js).
   ========================================================================= */
export function buildForest(rStart = 50, rEnd = 88, seed = 7) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);

  // 1) posizioni: anelli sfalsati, un albero ogni ~4.2 unità lungo l'anello
  const placements = [[], []]; // per i 2 tipi di albero
  const inner = [];
  let ringIdx = 0;
  for (let R = rStart; R <= rEnd; R += 4.3, ringIdx++) {
    const n = Math.round((2 * Math.PI * R) / 4.2);
    const a0 = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i + (rnd() - 0.5) * 0.6) * (2 * Math.PI / n);
      const rr = R + (rnd() - 0.5) * 2.6;
      const p = { x: Math.cos(a) * rr, z: Math.sin(a) * rr,
                  rot: rnd() * Math.PI * 2, s: K * (0.85 + rnd() * 0.55) };
      placements[rnd() < 0.45 ? 1 : 0].push(p);
      if (ringIdx < 2) inner.push([p.x, p.z]);
    }
  }

  // 2) una InstancedMesh per ogni mesh dei modelli albero
  const group = new THREE.Group();
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion();
  const V = new THREE.Vector3(), SC = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  ["town/tree", "town/tree-high-round"].forEach((path, ti) => {
    const src = lib.get(path);
    src.updateMatrixWorld(true);
    const list = placements[ti];
    src.traverse(o => {
      if (!o.isMesh) return;
      const im = new THREE.InstancedMesh(o.geometry, o.material, list.length);
      im.castShadow = true; im.receiveShadow = true;
      im.frustumCulled = false; // il bounding della singola geometria non copre il bosco intero
      list.forEach((p, i) => {
        Q.setFromAxisAngle(UP, p.rot);
        M.compose(V.set(p.x, 0, p.z), Q, SC.setScalar(p.s)).multiply(o.matrixWorld);
        im.setMatrixAt(i, M);
      });
      im.instanceMatrix.needsUpdate = true;
      group.add(im);
    });
  });
  return { group, inner };
}

/* strada radiale: dalla piazza fino a `clearance` unità mondo dal target */
export function buildRoad(target, clearance) {
  const g = new THREE.Group();
  const dir = new THREE.Vector2(target[0], target[1]);
  const len = dir.length();
  dir.normalize();
  const angle = Math.atan2(dir.x, dir.y);
  const S = K * 0.55; // sentiero stretto: a scala piena sembrerebbe un'autostrada
  for (let r = 15, end = len - clearance; r < end; r += S) {
    const m = lib.get("town/road").clone(true);
    m.position.set(dir.x * r, 0.04, dir.y * r); // sopra il disco della piazza (y 0.02)
    m.rotation.y = angle;
    m.scale.setScalar(S);
    g.add(m);
  }
  return g;
}

/* arredo della piazza centrale: fontana + lampioni + panchine
   Ritorna anche le posizioni MONDO di lampioni e panchine (collisioni; i
   lampioni servono pure alle luci notturne) */
export function buildPlaza() {
  const g = new THREE.Group();
  P(g, "town/fountain-round", 0, 0, 0, 0, 1.15);
  const R = 4.2, lanterns = [];
  for (const a of [0.6, 2.2, 4.0, 5.6]) {
    P(g, "town/lantern", Math.cos(a) * R, Math.sin(a) * R, -a);
    lanterns.push([Math.cos(a) * R * K, Math.sin(a) * R * K]);
  }
  // panchine rivolte alla fontana, nei varchi tra le strade radiali
  const B = 7 / K, benches = [];
  for (const a of [2.35, 4.15, 5.95]) {
    P(g, "town/stall-bench", Math.cos(a) * B, Math.sin(a) * B, -a);
    benches.push([Math.cos(a) * 7, Math.sin(a) * 7]);
  }
  g.scale.setScalar(K);
  return { group: g, lanterns, benches };
}
