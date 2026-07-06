/* =========================================================================
   CITTÀ MEDIEVALE 3D  —  motore
   Three.js da npm (bundle Vite). Cavaliere KayKit che esplora la città dei
   7 quartieri del CV (edifici Kenney assemblati in buildings.js); le porte
   aprono lo "stendardo" con la sezione del curriculum. Camera isometrica,
   giorno/notte, audio Web Audio, contatore visite, pagina "Salta al CV".
   ========================================================================= */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "../js/content.js"; // definisce window.CONTENT (fonte unica dei testi CV)
import { preloadModels, buildDistrict, buildTree, buildPlaza, buildRoad, buildForest } from "./buildings.js";

const CONTENT = window.CONTENT;
let LANG = localStorage.getItem("lang") || "it";
const L = v => (v == null ? "" : typeof v === "string" ? v : (v[LANG] ?? v.it ?? ""));
const $ = s => document.querySelector(s);

/* -------------------------------------------------------------------------
   AUDIO — effetti Web Audio senza file (portato dal sito iso). Off di default.
   ------------------------------------------------------------------------- */
const Sound = {
  on: localStorage.getItem("sound") === "on",
  ctx: null,
  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  blip(freq = 520, dur = 0.12, type = "sine", gain = 0.06) {
    if (!this.on) return;
    try {
      this.ensure();
      if (this.ctx.state === "suspended") this.ctx.resume();
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq;
      o.connect(g); g.connect(this.ctx.destination);
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur);
    } catch { /* audio non disponibile: silenzio */ }
  },
  open()  { this.blip(660, 0.14, "triangle", 0.07); setTimeout(() => this.blip(880, 0.12, "triangle", 0.05), 80); },
  click() { this.blip(440, 0.09, "sine", 0.05); },
  /* fusa del gatto: tre brevi vibrati bassi */
  purr()  { this.blip(170, 0.1, "sawtooth", 0.04); setTimeout(() => this.blip(140, 0.1, "sawtooth", 0.04), 100); setTimeout(() => this.blip(170, 0.14, "sawtooth", 0.04), 200); },
  /* splash in 3 strati: tonfo d'impatto (sinusoide che affonda) + corpo dello
     splash (rumore col filtro che si apre "sciaff" e si richiude) + goccioline
     che ricadono ("plin" sparsi nel mezzo secondo successivo) */
  splash() {
    if (!this.on) return;
    try {
      this.ensure();
      if (this.ctx.state === "suspended") this.ctx.resume();
      const t0 = this.ctx.currentTime, out = this.ctx.destination;

      // 1) tonfo: il "gluck" grave del corpo che buca l'acqua
      const o = this.ctx.createOscillator(), og = this.ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(260, t0);
      o.frequency.exponentialRampToValueAtTime(70, t0 + 0.18);
      og.gain.setValueAtTime(0.25, t0);
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.connect(og); og.connect(out);
      o.start(t0); o.stop(t0 + 0.25);

      // 2) corpo: rumore in dissolvenza, bandpass che sale e ridiscende
      const dur = 0.7, n = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6);
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8;
      f.frequency.setValueAtTime(500, t0);
      f.frequency.exponentialRampToValueAtTime(2600, t0 + 0.08);
      f.frequency.exponentialRampToValueAtTime(700, t0 + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(out);
      src.start(t0);

      // 3) goccioline: 5 "plin" acuti a tempi e altezze casuali
      for (let i = 0; i < 5; i++) {
        const dt = 0.15 + Math.random() * 0.4, fr = 900 + Math.random() * 900;
        const po = this.ctx.createOscillator(), pg = this.ctx.createGain();
        po.type = "sine";
        po.frequency.setValueAtTime(fr, t0 + dt);
        po.frequency.exponentialRampToValueAtTime(fr * 0.6, t0 + dt + 0.06);
        pg.gain.setValueAtTime(0, t0 + dt);
        pg.gain.linearRampToValueAtTime(0.045, t0 + dt + 0.01);
        pg.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.09);
        po.connect(pg); pg.connect(out);
        po.start(t0 + dt); po.stop(t0 + dt + 0.12);
      }
    } catch { /* audio non disponibile */ }
  },
  /* passo: tonfo di rumore filtrato passa-basso; in acqua diventa uno sciacquettio */
  step(inWater = false) {
    if (!this.on) return;
    try {
      this.ensure();
      if (this.ctx.state === "suspended") this.ctx.resume();
      const dur = inWater ? 0.1 : 0.055;
      const n = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = inWater ? "bandpass" : "lowpass";
      f.frequency.value = inWater ? 1300 : 300 + Math.random() * 140; // ogni passo un po' diverso
      const g = this.ctx.createGain(); g.gain.value = inWater ? 0.12 : 0.08;
      src.connect(f); f.connect(g); g.connect(this.ctx.destination);
      src.start();
    } catch { /* audio non disponibile */ }
  },
  toggle() { this.on = !this.on; localStorage.setItem("sound", this.on ? "on" : "off"); return this.on; }
};

/* =========================================================================
   1) SCENA, LUCI, RENDERER
   ========================================================================= */
const app = $("#app");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#a9d6f5");
scene.fog = new THREE.Fog("#a9d6f5", 95, 200); // tarata sulla distanza della camera iso

/* camera ISOMETRICA: proiezione ortografica (niente prospettiva) + angolo fisso dall'alto */
let VIEW_HALF = 19; // metà altezza dell'inquadratura in unità mondo (= livello di zoom)
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400);
function updateFrustum() {
  const a = innerWidth / innerHeight;
  camera.left = -VIEW_HALF * a; camera.right = VIEW_HALF * a;
  camera.top = VIEW_HALF; camera.bottom = -VIEW_HALF;
  camera.updateProjectionMatrix();
}
updateFrustum();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight("#ffffff", "#6f8f4a", 1.7); // più luce: i materiali GLB ne vogliono di più dei greybox
scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff4d6", 2.1);
sun.position.set(30, 50, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 160;
scene.add(sun);

/* terreno + piazza centrale */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500), // ben oltre la nebbia: il bordo del mondo non si vede mai
  new THREE.MeshStandardMaterial({ color: "#6fae54" })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const plaza = new THREE.Mesh(
  new THREE.CircleGeometry(16, 40),
  new THREE.MeshStandardMaterial({ color: "#c9b072" })
);
plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.02;
plaza.receiveShadow = true;
scene.add(plaza);

/* =========================================================================
   2) CITTÀ  —  i 7 quartieri del CV
   Disposti a VENTAGLIO REGOLARE attorno alla piazza (settori di ~51°),
   in ordine di lettura del CV: girando in senso orario si incontra
   chi sono → esperienza → istruzione → competenze → lingue → hobby → contatti.
   k=0 è la direzione "in fondo" alla vista iniziale (lì troneggia il castello);
   il raggio è adattato alla stazza dell'edificio.
   ========================================================================= */
const SECTOR = (Math.PI * 2) / 7;
const polar = (k, R) => {
  const a = -Math.PI * 0.25 - k * SECTOR; // -45°: il lato opposto alla camera iniziale
  return [R * Math.sin(a), R * Math.cos(a)];
};
const DISTRICTS = [
  { id:"about",      pos: polar(-1, 30) },
  { id:"experience", pos: polar( 0, 35) },
  { id:"education",  pos: polar( 1, 30) },
  { id:"skills",     pos: polar( 2, 31) },
  { id:"languages",  pos: polar( 3, 31) },
  { id:"hobbies",    pos: polar( 4, 33) },
  { id:"contact",    pos: polar( 5, 29) }
];

/* alberi generati dagli stessi settori: uno in ogni varco tra due quartieri
   (anello interno) + una fila di sfondo dietro gli edifici (anello esterno) */
const TREES = [];
for (let k = 0; k < 7; k++) {
  TREES.push(polar(k - 0.5, 30 + (k % 2) * 4));
  TREES.push(polar(k + (k % 3 - 1) * 0.14, 45 + (k % 3) * 3));
}

const doors = [];   // { sectionId, pos:Vector3, label:HTMLElement, labelWorld:Vector3 }
const colliders = []; // { x, z, hw, hd, rot } oppure { x, z, r }
const labelsRoot = $("#labels");

/* sezioni già visitate (persistite) + etichetta con spunta */
const visited = new Set(JSON.parse(localStorage.getItem("visited3d") || "[]"));
function labelHtml(id) {
  const sec = CONTENT.sections[id];
  return `<span class="ico">${sec.icon}</span>${L(sec.title)}` +
         (visited.has(id) ? `<span class="done">✓</span>` : "");
}
function updateVisitHud() {
  const el = $("#visit-counter");
  el.textContent = `${visited.size}/${DISTRICTS.length}`;
  el.title = L(CONTENT.ui.visited);
}

/* costruisce la città con i modelli Kenney (chiamata dopo il preload dei GLB) */
function buildCity() {
  DISTRICTS.forEach(b => {
    const { group, w, d, h } = buildDistrict(b.id);
    group.position.set(b.pos[0], 0, b.pos[1]);
    // ruota la facciata (locale +z) verso la piazza (origine)
    const toCenter = new THREE.Vector3(-b.pos[0], 0, -b.pos[1]).normalize();
    const rot = Math.atan2(toCenter.x, toCenter.z);
    group.rotation.y = rot;
    scene.add(group);

    // collisione OBB: rettangolo esatto dell'edificio, orientato come lui
    colliders.push({ x: b.pos[0], z: b.pos[1], hw: w / 2 + 0.35, hd: d / 2 + 0.35, rot });

    // posizione mondo della porta (davanti alla facciata)
    const doorWorld = new THREE.Vector3(b.pos[0], 1, b.pos[1]).add(toCenter.clone().multiplyScalar(d / 2 + 1.6));

    // strada dalla piazza alla porta
    scene.add(buildRoad(b.pos, d / 2 + 1));

    // etichetta fluttuante
    const lab = document.createElement("div");
    lab.className = "blabel";
    lab.innerHTML = labelHtml(b.id);
    labelsRoot.appendChild(lab);

    doors.push({
      sectionId: b.id, pos: doorWorld, label: lab,
      labelWorld: new THREE.Vector3(b.pos[0], h + 1.6, b.pos[1])
    });
  });

  // alberi Kenney (collisione a cerchio sul tronco)
  TREES.forEach((p, i) => {
    const t = buildTree(i);
    t.position.set(p[0], 0, p[1]);
    scene.add(t);
    colliders.push({ x: p[0], z: p[1], r: 1.1 });
  });

  // foresta fitta attorno al villaggio (chiude l'orizzonte); collider solo
  // sulle prime 2 file: oltre non ci si arriva (confine mondo r=54)
  const forest = buildForest();
  scene.add(forest.group);
  forest.inner.forEach(([x, z]) => colliders.push({ x, z, r: 1.1 }));

  // fontana + lampioni + panchine in piazza
  const plazaProps = buildPlaza();
  scene.add(plazaProps.group);
  colliders.push({ x: 0, z: 0, r: 4.2, fountain: true }); // bordo fontana (scavalcabile col salto!)
  colliders.push({ x: 0, z: 0, r: 1.1 });                 // zampillo centrale: solido anche dentro l'acqua
  plazaProps.benches.forEach(([x, z]) => colliders.push({ x, z, r: 0.8 }));
  plazaProps.lanterns.forEach(([x, z]) => {
    colliders.push({ x, z, r: 0.6 });
    // luce calda del lampione (spenta di giorno, accesa in notturna)
    const lamp = new THREE.PointLight("#ffb45e", 0, 22, 1.6);
    lamp.position.set(x, 4.6, z);
    scene.add(lamp);
    lampLights.push(lamp);
  });
}

/* =========================================================================
   2b) GIORNO / NOTTE  —  interpolazione cielo, nebbia, luci + lampioni
   ========================================================================= */
const lampLights = [];
let night = false, nightT = 0; // 0 = giorno, 1 = notte
const SKY_DAY = new THREE.Color("#a9d6f5"), SKY_NIGHT = new THREE.Color("#0d1830");
const SUN_DAY = new THREE.Color("#fff4d6"), SUN_NIGHT = new THREE.Color("#9db8ff");
const tmpColor = new THREE.Color();

function applyDayNight(dt) {
  const target = night ? 1 : 0;
  nightT += Math.sign(target - nightT) * Math.min(Math.abs(target - nightT), dt * 0.8);
  tmpColor.copy(SKY_DAY).lerp(SKY_NIGHT, nightT);
  scene.background.copy(tmpColor);
  scene.fog.color.copy(tmpColor);
  hemi.intensity = 1.7 - 1.35 * nightT;
  sun.intensity = 2.1 - 1.8 * nightT;
  sun.color.copy(SUN_DAY).lerp(SUN_NIGHT, nightT);
  for (const l of lampLights) l.intensity = 60 * nightT;
}

/* =========================================================================
   3) AVATAR  —  Cavaliere KayKit (CC0), riggato e animato (Idle / Running_A)
   ========================================================================= */
const player = new THREE.Group();
player.position.set(0, 0, 6);
scene.add(player);

let mixer = null, actIdle = null, actMove = null, actJump = null;
function loadAvatar() {
  return new Promise((res, rej) => new GLTFLoader().load(
    import.meta.env.BASE_URL + "models/character/knight.glb",
    g => {
      const m = g.scene;
      // frustumCulled=false: le mesh skinnate escono dal bounding box originale animando
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
      const box = new THREE.Box3().setFromObject(m);
      m.scale.setScalar(2.5 / (box.max.y - box.min.y)); // alto ~2.5 unità mondo
      player.add(m);
      mixer = new THREE.AnimationMixer(m);
      const clip = n => g.animations.find(c => c.name === n);
      actIdle = mixer.clipAction(clip("Idle"));
      actMove = mixer.clipAction(clip("Running_A") || clip("Walking_A"));
      const jumpClip = g.animations.find(c => /jump_full_short/i.test(c.name)) ||
                       g.animations.find(c => /jump/i.test(c.name));
      if (jumpClip) {
        actJump = mixer.clipAction(jumpClip);
        actJump.setLoop(THREE.LoopOnce, 1);
        actJump.clampWhenFinished = true;
        if (import.meta.env.DEV) console.log("clip salto:", jumpClip.name);
      }
      actIdle.play();
      res();
    }, undefined, rej));
}

/* ---- salto: piccola fisica verticale (gravità + velocità iniziale) ---- */
const JUMP_V = 9.5, GRAVITY = 26;   // apice ≈ 1.7 unità, in aria ≈ 0.73 s
let vy = 0, grounded = true;
/* in acqua: ci si entra SOLO atterrando dentro la fontana (tuffo); lo stato ha
   isteresi (si spegne oltre r=4.45) così il collider del bordo non "sfarfalla"
   quando il push-out lascia il giocatore a un pelo dal raggio (bug float). */
let inWater = false;
function tryJump() {
  if (!grounded || bannerOpen || entering) return;
  grounded = false; vy = JUMP_V;
  Sound.blip(500, 0.16, "triangle", 0.05);
  if (mixer && actJump) {
    (wasMoving ? actMove : actIdle).fadeOut(0.08);
    actJump.reset().fadeIn(0.08).play();
  }
}

/* =========================================================================
   3b) EASTER EGG — gatto nero + tuffo nella fontana
   ========================================================================= */

/* Gatto nero low-poly costruito con primitive (in tono col villaggio Kenney).
   Il TORSO ha il perno sull'anca posteriore: inclinandolo, il gatto si SIEDE.
   Le zampe hanno il perno all'anca (geometria traslata) e trottano in diagonale;
   la TESTA è un gruppo mobile (si guarda intorno, si gode le coccole). */
let cat = null, nearCat = false;
const CAT_SPEED = 2.4;
function buildCat() {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: "#161616", roughness: 0.9 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: "#37e06e", emissive: "#37e06e", emissiveIntensity: 0.8 });
  const mesh = (geo, mat = fur) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };

  const torso = new THREE.Group(); torso.position.set(0, 0.30, -0.33); g.add(torso);
  const body = mesh(new THREE.BoxGeometry(0.5, 0.42, 0.95)); body.position.set(0, 0.15, 0.33); torso.add(body);

  const head = new THREE.Group(); head.position.set(0, 0.44, 0.85); torso.add(head);
  head.add(mesh(new THREE.BoxGeometry(0.4, 0.38, 0.38)));
  const eyes = [];
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.ConeGeometry(0.09, 0.18, 4)); ear.position.set(s * 0.13, 0.25, -0.02); head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), eyeMat);
    eye.position.set(s * 0.1, 0.02, 0.20); head.add(eye); eyes.push(eye); // occhi verdi (luminosi in notturna)
  }

  const legGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1); legGeo.translate(0, -0.15, 0); // perno all'anca
  const legs = [];
  for (const s of [-1, 1]) for (const fz of [-1, 1]) {
    const leg = mesh(legGeo);
    leg.position.set(s * 0.16, 0, fz * 0.33 + 0.33);
    legs.push({ m: leg, front: fz > 0, phase: s * fz > 0 ? 0 : Math.PI }); // trotto: diagonali in fase
    torso.add(leg);
  }

  const tailG = new THREE.Group(); tailG.position.set(0, 0.32, -0.15);
  const tail = mesh(new THREE.BoxGeometry(0.07, 0.07, 0.5));
  tail.position.z = -0.25; tailG.add(tail); torso.add(tailG);

  g.position.set(10, 0, 14);
  return { group: g, torso, head, eyes, legs, tail: tailG,
           target: null, idle: 0, pet: 0, stall: 0, sitT: 0, blinkT: 2 };
}

function newCatTarget() {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 34;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x, z) > 6) return new THREE.Vector3(x, 0, z); // mai in fontana: i gatti odiano l'acqua
  }
  return new THREE.Vector3(12, 0, 12);
}

const wrapAngle = d => { while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

function updateCat(dt) {
  const g = cat.group, t = clock.elapsedTime;
  let moving = false;

  if (cat.pet > 0) { // coccole: si siede girato verso il giocatore
    cat.pet -= dt;
    const ry = Math.atan2(player.position.x - g.position.x, player.position.z - g.position.z);
    g.rotation.y += wrapAngle(ry - g.rotation.y) * Math.min(1, dt * 8);
  } else if (cat.idle > 0) { // pausa: si siede e si guarda intorno
    cat.idle -= dt;
  } else { // a spasso verso la meta
    if (!cat.target) { cat.target = newCatTarget(); cat.stall = 0; }
    const d = new THREE.Vector3().subVectors(cat.target, g.position); d.y = 0;
    const dist = d.length();
    if (dist < 0.7) { cat.target = null; cat.idle = 1.5 + Math.random() * 3; }
    else {
      d.normalize();
      const step = Math.min(CAT_SPEED * dt, dist);
      const next = g.position.clone().addScaledVector(d, step);
      next.y = 0;
      resolveCollision(next);            // il gatto rispetta gli ostacoli (fontana compresa)
      const moved = next.distanceTo(g.position);
      g.position.copy(next);
      cat.stall = moved < step * 0.4 ? cat.stall + dt : 0; // incastrato contro un muro?
      if (cat.stall > 1.2) { cat.target = null; cat.stall = 0; }
      g.rotation.y += wrapAngle(Math.atan2(d.x, d.z) - g.rotation.y) * Math.min(1, dt * 6);
      moving = true;
    }
  }

  /* ---- posa e animazione ---- */
  cat.sitT += ((moving ? 0 : 1) - cat.sitT) * Math.min(1, dt * 5); // 0 = in piedi, 1 = seduto
  const sit = cat.sitT;
  cat.torso.rotation.x = -0.55 * sit; // busto su: posa seduta
  for (const l of cat.legs) {
    const trot = moving ? Math.sin(t * 11 + l.phase) * 0.55 : 0;   // trotto: diagonali insieme
    l.m.rotation.x = trot * (1 - sit) + (l.front ? 0.55 : 1.15) * sit; // davanti dritte, dietro ripiegate
  }
  g.position.y = moving ? Math.abs(Math.sin(t * 9)) * 0.05 * (1 - sit) : 0; // passetti

  // testa: compensa la seduta; durante le coccole ciondola, da fermo si guarda intorno
  let hx = 0.3 * sit, hy = 0, hz = 0;
  if (cat.pet > 0) { hx += 0.12; hz = Math.sin(t * 7) * 0.16; }
  else if (!moving) hy = Math.sin(t * 0.6) * 0.45 + Math.sin(t * 1.7) * 0.12;
  cat.head.rotation.x += (hx - cat.head.rotation.x) * Math.min(1, dt * 5);
  cat.head.rotation.y += (hy - cat.head.rotation.y) * Math.min(1, dt * 5);
  cat.head.rotation.z += (hz - cat.head.rotation.z) * Math.min(1, dt * 6);

  // coda: felice alle coccole, pigra da seduto, ondeggia nel trotto; a terra da seduto
  cat.tail.rotation.y = cat.pet > 0 ? Math.sin(t * 14) * 0.7
                      : !moving     ? Math.sin(t * 2.1) * 0.5
                      :               Math.sin(t * 6) * 0.3;
  cat.tail.rotation.x = -0.5 * sit;

  // sbatte le palpebre ogni 2.5–6 s
  cat.blinkT -= dt;
  if (cat.blinkT <= 0) cat.blinkT = 2.5 + Math.random() * 3.5;
  const eyeY = cat.blinkT < 0.12 ? 0.15 : 1;
  for (const e of cat.eyes) e.scale.y = eyeY;
}

function petCat() {
  if (!cat || bannerOpen || entering || cat.pet > 0) return;
  if (cat.group.position.distanceTo(player.position) > 3.4) return;
  cat.pet = 2.4;
  cat.target = null;
  Sound.purr();
  // cuoricini che salgono sopra il gatto (overlay DOM)
  const v = cat.group.position.clone(); v.y += 1.3; v.project(camera);
  const hx = (v.x * 0.5 + 0.5) * innerWidth, hy = (-v.y * 0.5 + 0.5) * innerHeight;
  for (let i = 0; i < 3; i++) setTimeout(() => {
    const h = document.createElement("div");
    h.className = "heart"; h.textContent = "❤️";
    h.style.left = (hx + (Math.random() - 0.5) * 44) + "px";
    h.style.top = hy + "px";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }, i * 220);
}

/* Splash della fontana: schizzi d'acqua a fisica semplice, scala = vita residua */
const splashes = [];
const splashGeo = new THREE.SphereGeometry(0.1, 6, 5);
const splashMat = new THREE.MeshStandardMaterial({ color: "#bfe6ff", roughness: 0.25 });
function spawnDrops(x, z, count) {
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(splashGeo, splashMat);
    m.position.set(x + (Math.random() - 0.5) * 0.6, 0.5, z + (Math.random() - 0.5) * 0.6);
    const a = Math.random() * Math.PI * 2, r = 1.2 + Math.random() * 2.4;
    splashes.push({ m, vx: Math.cos(a) * r, vy: 4 + Math.random() * 3.5, vz: Math.sin(a) * r, life: 0.9 });
    scene.add(m);
  }
}
function doSplash(x, z) { Sound.splash(); spawnDrops(x, z, 26); }
function updateSplashes(dt) {
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.vy -= 14 * dt;
    s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt;
    s.life -= dt;
    s.m.scale.setScalar(Math.max(s.life, 0.01));
    if (s.life <= 0 || s.m.position.y < 0) { scene.remove(s.m); splashes.splice(i, 1); }
  }
}

/* =========================================================================
   4) INPUT  (tastiera, mouse-drag, joystick)
   ========================================================================= */
const keys = {};
addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "KeyE") { if (nearCat) petCat(); else tryEnter(); }
  if (e.code === "Space") { e.preventDefault(); tryJump(); } // preventDefault: niente "click" sui pulsanti HUD a fuoco
  if (e.code === "Escape") closeBanner();
});
addEventListener("keyup", e => { keys[e.code] = false; });

let cameraYaw = Math.PI * 0.75;              // vista diagonale classica da iso
const ISO_PITCH = Math.atan(1 / Math.SQRT2); // ≈ 35.26°, l'angolo isometrico "vero"
const CAM_DIST = 60; // lontana per non tagliare la scena: con l'ortografica la scala non cambia

// rotazione visuale con trascinamento
let dragging = false, lastX = 0;
renderer.domElement.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; });
addEventListener("pointermove", e => {
  if (!dragging || touchCount >= 2) return; // con due dita si fa lo zoom, non la rotazione
  cameraYaw -= (e.clientX - lastX) * 0.005; lastX = e.clientX;
});
addEventListener("pointerup", () => dragging = false);

// zoom con la rotella (cambia l'ampiezza dell'inquadratura ortografica)
addEventListener("wheel", e => {
  if (bannerOpen) return; // la rotella sullo stendardo scorre il testo, non zooma la città
  VIEW_HALF = Math.max(10, Math.min(32, VIEW_HALF + Math.sign(e.deltaY) * 1.5));
  updateFrustum();
}, { passive: true });

// zoom a pizzico su mobile (due dita)
let pinchD = 0, touchCount = 0;
const touchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
addEventListener("touchstart", e => {
  touchCount = e.touches.length;
  if (touchCount === 2) pinchD = touchDist(e.touches);
}, { passive: true });
addEventListener("touchmove", e => {
  if (bannerOpen) return;
  if (e.touches.length === 2 && pinchD) {
    const d = touchDist(e.touches);
    VIEW_HALF = Math.max(10, Math.min(32, VIEW_HALF * pinchD / d));
    pinchD = d;
    updateFrustum();
  }
}, { passive: true });
addEventListener("touchend", e => {
  touchCount = e.touches.length;
  if (touchCount < 2) pinchD = 0;
}, { passive: true });

// joystick mobile
const joyInput = new THREE.Vector2(0, 0);
const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
if (isTouch) document.body.classList.add("touch");
(function setupJoystick() {
  const base = $("#joystick"), knob = $("#joystick-knob");
  let active = false, cx = 0, cy = 0, R = 46;
  const start = e => { active = true; const r = base.getBoundingClientRect(); cx = r.left + r.width/2; cy = r.top + r.height/2; move(e); };
  const move = e => {
    if (!active) return;
    const t = e.touches ? e.touches[0] : e;
    let dx = t.clientX - cx, dy = t.clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > R) { dx = dx / len * R; dy = dy / len * R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joyInput.set(dx / R, dy / R);
  };
  const end = () => { active = false; joyInput.set(0, 0); knob.style.transform = "translate(-50%,-50%)"; };
  base.addEventListener("touchstart", start, { passive: true });
  base.addEventListener("touchmove", move, { passive: true });
  base.addEventListener("touchend", end);
  base.addEventListener("pointerdown", start);
  addEventListener("pointermove", e => active && move(e));
  addEventListener("pointerup", end);
})();
$("#enter-btn-mobile").addEventListener("click", () => { if (nearCat) petCat(); else tryEnter(); });
$("#jump-btn-mobile").addEventListener("pointerdown", e => { e.stopPropagation(); tryJump(); }); // pointerdown: reattivo e non avvia il drag-camera

/* =========================================================================
   5) AGGIORNAMENTO  (movimento, collisioni, camera, etichette, porte)
   ========================================================================= */
const clock = new THREE.Clock();
const SPEED = 8;
if (import.meta.env.DEV) window.__dbg = { player, camera, scene, colliders, resolveCollision, tryJump, doSplash, petCat, Sound, setYaw: v => { cameraYaw = v; }, get grounded() { return grounded; }, get inWater() { return inWater; }, get cat() { return cat; }, get splashCount() { return splashes.length; } }; // ispezione in sviluppo
let facing = 0;
let nearDoor = null;
const prompt = $("#prompt"), promptText = $("#prompt-text"), enterBtnM = $("#enter-btn-mobile");
const tmp = new THREE.Vector3();

/* Collisioni precise: cerchi (alberi, fontana, lampioni) e OBB
   (rettangoli ORIENTATI: gli edifici sono ruotati verso la piazza).
   ignoreFountain: in volo (o già in acqua) il bordo fontana non respinge —
   è così che ci si tuffa dentro e se ne esce camminando. */
function resolveCollision(pos, ignoreFountain = false) {
  for (const c of colliders) {
    if (c.fountain && ignoreFountain) continue;
    if (c.r) { // cerchio: spingi fuori radialmente
      const dx = pos.x - c.x, dz = pos.z - c.z;
      const dist = Math.hypot(dx, dz);
      if (dist < c.r) {
        const f = c.r / (dist || 1);
        pos.x = c.x + dx * f; pos.z = c.z + dz * f;
      }
    } else { // OBB: porta il punto nel sistema locale dell'edificio, push-out, ritorna in mondo
      const cos = Math.cos(c.rot || 0), sin = Math.sin(c.rot || 0);
      const dx = pos.x - c.x, dz = pos.z - c.z;
      let lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
      if (Math.abs(lx) < c.hw && Math.abs(lz) < c.hd) {
        const px = c.hw - Math.abs(lx), pz = c.hd - Math.abs(lz);
        if (px < pz) lx = Math.sign(lx || 1) * c.hw;
        else         lz = Math.sign(lz || 1) * c.hd;
        pos.x = c.x + lx * cos + lz * sin;
        pos.z = c.z - lx * sin + lz * cos;
      }
    }
  }
  // confine del mondo: cerchio dentro la foresta (si cammina tra le prime file)
  const rr = Math.hypot(pos.x, pos.z);
  if (rr > 54) { pos.x *= 54 / rr; pos.z *= 54 / rr; }
}

let wasMoving = false, stepT = 0;
function update(dt) {
  // direzione di movimento relativa alla camera
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

  let ix = 0, iz = 0;
  if (!bannerOpen && !entering) { // fermo mentre leggi lo stendardo o stai entrando
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1;
    if (joyInput.lengthSq() > 0.02) { ix += joyInput.x; iz += -joyInput.y; }
  }

  const move = new THREE.Vector3()
    .addScaledVector(fwd, iz).addScaledVector(right, ix);
  const moving = move.lengthSq() > 0.001;

  // uscita dall'acqua camminando oltre il bordo (isteresi: vedi dichiarazione di inWater)
  if (inWater && Math.hypot(player.position.x, player.position.z) > 4.45) inWater = false;

  if (moving) {
    move.normalize().multiplyScalar(SPEED * (inWater ? 0.55 : 1) * dt); // l'acqua rallenta
    const next = player.position.clone().add(move);
    resolveCollision(next, !grounded || inWater);
    player.position.copy(next);
    facing = Math.atan2(move.x, move.z);
  }

  // passi: suono a cadenza regolare camminando a terra (in acqua: sciacquettio + gocce)
  if (moving && grounded) {
    stepT -= dt;
    if (stepT <= 0) {
      stepT = inWater ? 0.34 : 0.28;
      Sound.step(inWater);
      if (inWater) spawnDrops(player.position.x, player.position.z, 3);
    }
  } else stepT = 0.09; // il primo passo parte appena ci si avvia
  // rotazione fluida verso la direzione
  let d = facing - player.rotation.y;
  while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  player.rotation.y += d * Math.min(1, dt * 12);

  // salto: gravità, quota e atterraggio
  if (!grounded) {
    vy -= GRAVITY * dt;
    player.position.y += vy * dt;
    if (player.position.y <= 0) {
      player.position.y = 0; vy = 0; grounded = true;
      // atterraggio: in fontana → SPLASH! 💦 (ed entra lo stato "in acqua"), altrimenti tonfo
      inWater = Math.hypot(player.position.x, player.position.z) < 4.2;
      if (inWater) doSplash(player.position.x, player.position.z);
      else Sound.step();
      if (actJump) {
        actJump.fadeOut(0.12);
        (moving ? actMove : actIdle).reset().fadeIn(0.12).play();
      }
    }
  }

  // easter egg: gatto a spasso + schizzi della fontana
  if (cat) updateCat(dt);
  updateSplashes(dt);

  // animazioni del cavaliere: dissolvenza idle ↔ corsa (in aria comanda il salto)
  if (mixer) {
    if (grounded && moving !== wasMoving && actIdle && actMove) {
      const from = moving ? actIdle : actMove, to = moving ? actMove : actIdle;
      from.fadeOut(0.18); to.reset().fadeIn(0.18).play();
    }
    mixer.update(dt);
  }
  wasMoving = moving;

  // camera che segue (ancorata a terra: durante il salto non sobbalza)
  const cp = ISO_PITCH;
  camera.position.set(
    player.position.x + Math.sin(cameraYaw) * Math.cos(cp) * CAM_DIST,
    Math.sin(cp) * CAM_DIST,
    player.position.z + Math.cos(cameraYaw) * Math.cos(cp) * CAM_DIST
  );
  camera.lookAt(player.position.x, 1.4, player.position.z);

  // porta più vicina
  nearDoor = null; let best = 5.2;
  for (const d of doors) {
    const dist = player.position.distanceTo(d.pos);
    if (dist < best) { best = dist; nearDoor = d; }
  }
  // gatto nelle vicinanze? (ha la precedenza sulla porta)
  nearCat = !!cat && !bannerOpen && cat.group.position.distanceTo(player.position) < 3.2;

  if (nearCat) {
    promptText.textContent = L(CONTENT.ui.petCat);
    prompt.classList.add("show");
    if (isTouch) { enterBtnM.textContent = "🐾"; enterBtnM.classList.add("show"); }
  } else if (nearDoor && !bannerOpen) {
    promptText.textContent = "Entra · " + L(CONTENT.sections[nearDoor.sectionId].title);
    prompt.classList.add("show");
    if (isTouch) { enterBtnM.textContent = "Entra"; enterBtnM.classList.add("show"); }
  } else {
    prompt.classList.remove("show");
    enterBtnM.classList.remove("show");
  }

  // proiezione etichette edifici
  for (const d of doors) {
    tmp.copy(d.labelWorld).project(camera);
    if (tmp.z > 1) { d.label.style.opacity = "0"; continue; }
    d.label.style.opacity = "0.95";
    d.label.style.left = (tmp.x * 0.5 + 0.5) * innerWidth + "px";
    d.label.style.top = (-tmp.y * 0.5 + 0.5) * innerHeight + "px";
  }
}

function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  update(dt);
  applyDayNight(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

/* =========================================================================
   6) STENDARDO  (overlay del CV)
   ========================================================================= */
let bannerOpen = false, entering = false;
const overlay = $("#banner-overlay"), scroll = $("#banner-scroll");
const fadeEl = $("#fade");

/* transizione d'ingresso: l'avatar si gira verso la porta, dissolvenza, stendardo */
function tryEnter() {
  if (!nearDoor || bannerOpen || entering) return;
  entering = true;
  facing = Math.atan2(nearDoor.pos.x - player.position.x, nearDoor.pos.z - player.position.z);
  Sound.open();
  fadeEl.classList.add("on");
  setTimeout(() => {
    openBanner(nearDoor.sectionId);
    fadeEl.classList.remove("on");
    entering = false;
  }, 380);
}

function openBanner(id) {
  scroll.innerHTML = renderSection(id);
  overlay.classList.add("open");
  bannerOpen = true;
  prompt.classList.remove("show");
  // segna la sezione come visitata
  if (!visited.has(id)) {
    visited.add(id);
    localStorage.setItem("visited3d", JSON.stringify([...visited]));
    const door = doors.find(d => d.sectionId === id);
    if (door) door.label.innerHTML = labelHtml(id);
    updateVisitHud();
  }
}
function closeBanner() {
  if (!bannerOpen) return;
  overlay.classList.remove("open"); bannerOpen = false;
  Sound.click();
}
$("#banner-close").addEventListener("click", closeBanner);
overlay.addEventListener("click", e => { if (e.target === overlay) closeBanner(); });

function renderSection(id) {
  const s = CONTENT.sections[id];
  let h = `<div class="banner-head">
      <div class="ico">${s.icon}</div>
      <h2>${L(s.title)}</h2>
      <div class="sub">${L(s.subtitle)}</div>
    </div><div class="banner-sep"></div>`;

  if (id === "about") {
    h += `<div class="banner-photo"><img src="../${CONTENT.profile.photo}" alt="${CONTENT.profile.name}"
           onerror="this.parentElement.style.display='none'"></div>`;
    h += s.body[LANG].map(p => `<p>${p}</p>`).join("");
  } else if (id === "experience" || id === "education") {
    s.items.forEach(it => {
      h += `<div class="banner-item">
        <div class="when">${L(it.period)}</div>
        <h3>${L(it.role)}</h3>
        <div class="where">${L(it.org)} · ${L(it.place)}</div>
        <ul>${it.desc[LANG].map(x => `<li>${x}</li>`).join("")}</ul>
      </div>`;
    });
  } else if (id === "skills") {
    s.groups.forEach(g => {
      h += `<h3>${L(g.name)}</h3>`;
      g.skills.forEach(sk => h += bar(sk.name, sk.level + "", sk.level));
    });
    h += `<div class="tags">${s.tags[LANG].map(t => `<span>${t}</span>`).join("")}</div>`;
  } else if (id === "languages") {
    s.items.forEach(it => h += bar(L(it.name), L(it.level), it.value));
  } else if (id === "hobbies") {
    h += `<div class="hobby-grid">${s.items.map(x =>
      `<div class="hobby"><span>${x.icon}</span><b>${L(x.label)}</b></div>`).join("")}</div>`;
  } else if (id === "contact") {
    const p = CONTENT.profile;
    h += `<p>${L(s.text)}</p><div class="banner-contact">
        <a href="mailto:${p.email}">✉️ ${p.email}</a>
        <a href="tel:${p.phone.replace(/\s/g,'')}">📞 ${p.phone}</a>
        <a href="${p.linkedin}" target="_blank" rel="noopener">💼 LinkedIn</a>
      </div><a class="btn-cv" href="../${p.cvFile}" download>⬇️ ${L(CONTENT.ui.downloadCv)}</a>`;
  }
  return h;
}
function bar(name, label, value) {
  return `<div class="bar"><div class="bar-top"><span>${name}</span><span>${label}</span></div>
    <div class="bar-track"><i style="--w:${value}%"></i></div></div>`;
}

/* =========================================================================
   7) LINGUA, RESIZE, AVVIO
   ========================================================================= */
function setLang(l) {
  LANG = l; localStorage.setItem("lang", l);
  $("#lang-it").classList.toggle("active", l === "it");
  $("#lang-en").classList.toggle("active", l === "en");
  doors.forEach(d => { d.label.innerHTML = labelHtml(d.sectionId); });
  renderWelcome();
  updateVisitHud();
  if (bannerOpen) {
    const cur = overlay.dataset.cur; if (cur) scroll.innerHTML = renderSection(cur);
  }
}
$("#lang-it").addEventListener("click", () => { Sound.click(); setLang("it"); });
$("#lang-en").addEventListener("click", () => { Sound.click(); setLang("en"); });

/* pergamena di benvenuto */
function renderWelcome() {
  $("#welcome-title").textContent = L(CONTENT.ui.welcomeTitle);
  $("#welcome-text").textContent = L(CONTENT.ui.welcomeText);
  $("#welcome-keys").innerHTML = L(CONTENT.ui.welcomeKeys);
  $("#welcome-btn").textContent = L(CONTENT.ui.welcomeBtn);
}
$("#welcome-btn").addEventListener("click", () => {
  $("#welcome").classList.add("hidden");
  Sound.open();
});

/* pulsanti HUD: audio e giorno/notte */
const soundBtn = $("#sound-toggle"), nightBtn = $("#night-toggle");
soundBtn.textContent = Sound.on ? "🔊" : "🔇";
soundBtn.addEventListener("click", () => {
  const on = Sound.toggle();
  soundBtn.textContent = on ? "🔊" : "🔇";
  if (on) Sound.open();
});
nightBtn.addEventListener("click", () => {
  night = !night;
  nightBtn.textContent = night ? "☀️" : "🌙";
  Sound.click();
});
const _open = openBanner;
openBanner = id => { overlay.dataset.cur = id; _open(id); };
setLang(LANG);

addEventListener("resize", () => {
  updateFrustum();
  renderer.setSize(innerWidth, innerHeight);
});

// nascondi suggerimento dopo un po'
setTimeout(() => $("#controls-hint")?.style.setProperty("opacity", "0"), 7000);

// via! prima si caricano i modelli Kenney, poi si costruisce la città
const loaderText = $("#loader p");
Promise.all([
  preloadModels((done, total) => {
    if (loaderText) loaderText.textContent = `Costruisco la città… ${done}/${total}`;
  }),
  loadAvatar()
]).then(() => {
  buildCity();
  cat = buildCat();          // 🐈‍⬛ easter egg: il gatto entra in scena
  scene.add(cat.group);
  setLang(LANG); // riallinea le etichette appena create alla lingua attiva
  $("#loader").classList.add("hidden");
  loop();
}).catch(err => {
  console.error("Caricamento modelli fallito:", err);
  if (loaderText) loaderText.textContent = "Errore nel caricamento dei modelli 😢";
});
