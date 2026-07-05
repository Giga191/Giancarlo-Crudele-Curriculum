/* =========================================================================
   CITTÀ ISOMETRICA  —  motore di rendering SVG
   -------------------------------------------------------------------------
   Disegna una piccola città in proiezione isometrica.
   Ogni edificio è un gruppo SVG cliccabile collegato a una sezione del CV.
   Include: strade, avatar che cammina, lampioni, stelle e modalità notte.
   Per modificare la mappa lavora sull'array makeBuildings in fondo al file.
   ========================================================================= */

const SVG_NS = "http://www.w3.org/2000/svg";

/* Handle del loop dell'avatar: viene cancellato a ogni re-render
   (es. cambio lingua) per non avere due walker attivi insieme. */
let walkerRAF = 0;

/* Costanti di proiezione isometrica */
const U  = 34;   // mezza-larghezza di una cella (asse orizzontale)
const Uh = 30;   // altezza di un'unità verticale (asse z)

/* Converte una coordinata 3D di griglia (x,y,z) in coordinata schermo */
function iso(x, y, z) {
  return { x: (x - y) * U, y: (x + y) * (U / 2) - z * Uh };
}
function pt(x, y, z) { const p = iso(x, y, z); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }

/* Helper per creare elementi SVG */
function el(name, attrs = {}) {
  const e = document.createElementNS(SVG_NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

/* Schiarisce/scurisce un colore esadecimale di una percentuale */
function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, Math.max(0, Math.round(r + r * percent)));
  g = Math.min(255, Math.max(0, Math.round(g + g * percent)));
  b = Math.min(255, Math.max(0, Math.round(b + b * percent)));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* Parallelepipedo (3 facce visibili) */
function box(parent, gx, gy, w, d, hBase, hTop, color) {
  const top = shade(color, 0.18), right = shade(color, -0.08), left = shade(color, -0.26);
  parent.appendChild(el("polygon", {
    points: `${pt(gx+w,gy,hTop)} ${pt(gx+w,gy+d,hTop)} ${pt(gx+w,gy+d,hBase)} ${pt(gx+w,gy,hBase)}`, fill: right }));
  parent.appendChild(el("polygon", {
    points: `${pt(gx,gy+d,hTop)} ${pt(gx+w,gy+d,hTop)} ${pt(gx+w,gy+d,hBase)} ${pt(gx,gy+d,hBase)}`, fill: left }));
  parent.appendChild(el("polygon", {
    points: `${pt(gx,gy,hTop)} ${pt(gx+w,gy,hTop)} ${pt(gx+w,gy+d,hTop)} ${pt(gx,gy+d,hTop)}`, fill: top }));
}

/* Tetto a falde */
function roof(parent, gx, gy, w, d, hBase, peak, color) {
  const ridgeY = gy + d / 2, a = shade(color, 0.12), b = shade(color, -0.2);
  parent.appendChild(el("polygon", {
    points: `${pt(gx,gy,hBase)} ${pt(gx+w,gy,hBase)} ${pt(gx+w,ridgeY,hBase+peak)} ${pt(gx,ridgeY,hBase+peak)}`, fill: a }));
  parent.appendChild(el("polygon", {
    points: `${pt(gx,gy+d,hBase)} ${pt(gx+w,gy+d,hBase)} ${pt(gx+w,ridgeY,hBase+peak)} ${pt(gx,ridgeY,hBase+peak)}`, fill: b }));
}

/* Finestrelle (classe "window": si illuminano in modalità notte) */
function windows(parent, gx, gy, w, d, hBase, hTop, rows, cols, glass = "#bfe9ff") {
  const padX = 0.18, padZ = 0.18;
  const usableW = w - padX * 2, usableH = (hTop - hBase) - padZ * 2;
  const cw = usableW / cols, ch = usableH / rows, wW = cw * 0.6, wH = ch * 0.6;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = gx + padX + c * cw + (cw - wW) / 2;
    const z0 = hBase + padZ + r * ch + (ch - wH) / 2;
    parent.appendChild(el("polygon", {
      class: "window",
      points: `${pt(x0,gy+d,z0)} ${pt(x0+wW,gy+d,z0)} ${pt(x0+wW,gy+d,z0+wH)} ${pt(x0,gy+d,z0+wH)}`,
      fill: glass, opacity: 0.92 }));
  }
}

/* Tessera di terreno */
function tile(parent, gx, gy, w, d, color) {
  parent.appendChild(el("polygon", {
    points: `${pt(gx,gy,0)} ${pt(gx+w,gy,0)} ${pt(gx+w,gy+d,0)} ${pt(gx,gy+d,0)}`, fill: color }));
}

/* Alberello isometrico */
function tree(parent, gx, gy) {
  box(parent, gx+0.4, gy+0.4, 0.2, 0.2, 0, 0.6, "#8a5a3b");
  box(parent, gx+0.15, gy+0.15, 0.7, 0.7, 0.6, 1.25, "#3f9d57");
  box(parent, gx+0.28, gy+0.28, 0.44, 0.44, 1.25, 1.6, "#4cb568");
}

/* Lampione (la luce si accende di notte, classe "lamp-light") */
function lamp(parent, gx, gy) {
  box(parent, gx, gy, 0.12, 0.12, 0, 1.2, "#3a3f55");
  const top = iso(gx + 0.06, gy + 0.06, 1.35);
  parent.appendChild(el("circle", { class: "lamp-light", cx: top.x, cy: top.y, r: 6, fill: "#cfd3dd" }));
}

/* =========================================================================
   DEFINIZIONE DEGLI EDIFICI
   ========================================================================= */
function makeBuildings(t) {
  return [
    {
      id: "education", gx: 0, gy: 0, w: 2.6, d: 2.6, top: 4.0, color: "#7c83ff",
      front: [1.3, 2.8], label: t("education", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 2.4, b.color);
        windows(g, b.gx, b.gy, b.w, b.d, 0, 2.4, 2, 3);
        roof(g, b.gx, b.gy, b.w, b.d, 2.4, 1.0, "#5b62e0");
        box(g, b.gx+1.0, b.gy+1.0, 0.6, 0.6, 3.4, 4.0, "#ffd479");
      }
    },
    {
      id: "experience", gx: 3.2, gy: 0, w: 2.0, d: 2.0, top: 4.6, color: "#ff8a5c",
      front: [4.2, 2.3], label: t("experience", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 4.2, b.color);
        windows(g, b.gx, b.gy, b.w, b.d, 0, 4.2, 5, 3);
        box(g, b.gx+0.3, b.gy+0.3, 1.4, 1.4, 4.2, 4.6, "#e06a3e");
      }
    },
    {
      id: "about", gx: 0, gy: 3.2, w: 2.2, d: 2.2, top: 2.7, color: "#ffd166",
      front: [1.1, 5.6], label: t("about", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 1.6, b.color);
        windows(g, b.gx, b.gy, b.w, b.d, 0, 1.6, 1, 2, "#fff3c9");
        roof(g, b.gx, b.gy, b.w, b.d, 1.6, 1.1, "#d64545");
        box(g, b.gx+1.5, b.gy+0.3, 0.35, 0.35, 1.6, 2.6, "#b23a3a");
      }
    },
    {
      id: "skills", gx: 3.0, gy: 3.0, w: 2.4, d: 2.0, top: 3.3, color: "#4ecdc4",
      front: [4.2, 5.3], label: t("skills", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 1.8, b.color);
        windows(g, b.gx, b.gy, b.w, b.d, 0, 1.8, 1, 4, "#d9fff9");
        box(g, b.gx, b.gy, b.w, b.d, 1.8, 2.0, "#36a99f");
        box(g, b.gx+0.4, b.gy+0.7, 0.5, 0.5, 2.0, 3.1, "#bdbdbd");
        box(g, b.gx+0.4, b.gy+0.7, 0.5, 0.5, 3.1, 3.3, "#ff6b6b");
      }
    },
    {
      id: "languages", gx: 6.0, gy: 1.4, w: 1.8, d: 1.8, top: 4.3, color: "#a78bfa",
      front: [6.9, 3.5], label: t("languages", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 1.4, b.color);
        box(g, b.gx+0.6, b.gy+0.6, 0.6, 0.6, 1.4, 3.2, "#8b6df0");
        box(g, b.gx+0.35, b.gy+0.35, 1.1, 1.1, 3.2, 3.7, "#c4b5fd");
        box(g, b.gx+0.7, b.gy+0.7, 0.4, 0.4, 3.7, 4.3, "#60a5fa");
      }
    },
    {
      id: "hobbies", gx: 5.6, gy: 4.2, w: 2.2, d: 2.0, top: 2.6, color: "#ff5d8f",
      front: [6.7, 6.6], label: t("hobbies", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 1.6, b.color);
        windows(g, b.gx, b.gy, b.w, b.d, 0, 1.6, 1, 3, "#ffe0ec");
        box(g, b.gx, b.gy, b.w, b.d, 1.6, 1.85, "#e84a78");
        box(g, b.gx+0.4, b.gy+0.2, 1.4, 0.18, 1.85, 2.6, "#ffe66d");
      }
    },
    {
      id: "contact", gx: 2.6, gy: 6.0, w: 1.4, d: 1.4, top: 3.1, color: "#f4f1de",
      front: [3.3, 7.7], label: t("contact", "title"),
      build(g, b) {
        box(g, b.gx, b.gy, b.w, b.d, 0, 1.0, "#e0ddc8");
        box(g, b.gx+0.2, b.gy+0.2, 1.0, 1.0, 1.0, 2.4, "#ffffff");
        box(g, b.gx+0.2, b.gy+0.2, 1.0, 1.0, 1.4, 1.8, "#ef476f");
        box(g, b.gx+0.35, b.gy+0.35, 0.7, 0.7, 2.4, 3.1, "#ffd166");
      }
    }
  ];
}

/* Anello stradale: waypoint in coordinate griglia, in senso di marcia.
   Gira ATTORNO agli edifici (mai dentro le loro impronte); i punti con
   `stop` sono le porte, dove l'avatar fa una breve sosta.
   Il tratto Competenze è una "rampa" cieca: si va alla porta e si torna. */
const ROAD = [
  { p: [1.3, 2.8], stop: "education"  },
  { p: [4.2, 2.8] },
  { p: [4.2, 2.3], stop: "experience" },
  { p: [5.6, 2.3] },
  { p: [5.6, 3.5] },
  { p: [6.9, 3.5], stop: "languages"  },
  { p: [8.1, 3.5] },
  { p: [8.1, 6.6] },
  { p: [6.7, 6.6], stop: "hobbies"    },
  { p: [4.2, 6.6] },
  { p: [4.2, 5.3], stop: "skills"     },
  { p: [4.2, 6.6] },
  { p: [4.2, 7.7] },
  { p: [3.3, 7.7], stop: "contact"    },
  { p: [1.1, 7.7] },
  { p: [1.1, 5.6], stop: "about"      },
  { p: [2.6, 5.6] },
  { p: [2.6, 2.8] }
];

/* =========================================================================
   RENDER PRINCIPALE
   ========================================================================= */
function renderCity(svg, getLabel, onSelect) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const defs = el("defs");
  defs.innerHTML = `
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#23306b" flood-opacity="0.25"/>
    </filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  svg.appendChild(defs);

  const world = el("g", { id: "world" });
  svg.appendChild(world);

  /* --- stelle (visibili solo di notte) --- */
  const stars = el("g", { class: "stars" });
  for (let i = 0; i < 46; i++) {
    const x = -400 + ((i * 137) % 820);
    const y = -270 + ((i * 71) % 230);
    const r = 0.6 + ((i * 53) % 18) / 10;
    stars.appendChild(el("circle", { cx: x, cy: y, r, fill: "#fff" }));
  }
  world.appendChild(stars);

  /* --- terreno --- */
  const ground = el("g", { class: "ground" });
  world.appendChild(ground);
  const G0 = -1.4, G1 = 8.4;
  ground.appendChild(el("polygon", { points: `${pt(G0,G0,0)} ${pt(G1,G0,0)} ${pt(G1,G1,0)} ${pt(G0,G1,0)}`, fill: "#7ec86b" }));
  ground.appendChild(el("polygon", {
    points: `${pt(G1,G0,0)} ${pt(G1,G1,0)} ${pt(G0,G1,0)} ${pt(G0,G1,-0.6)} ${pt(G1,G1,-0.6)} ${pt(G1,G0,-0.6)}`,
    fill: "#6b4f3a" }));

  const buildings = makeBuildings(getLabel);
  buildings.forEach(b => tile(ground, b.gx-0.3, b.gy-0.3, b.w+0.6, b.d+0.6, "#caa86a"));

  /* --- strade: anello disegnato lungo i waypoint di ROAD --- */
  let dStr = "";
  ROAD.forEach((w, i) => {
    const p = iso(w.p[0], w.p[1], 0);
    dStr += (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
  });
  dStr += "Z";
  ground.appendChild(el("path", {
    d: dStr, fill: "none", stroke: "#d9c9a3", "stroke-width": 15,
    "stroke-linejoin": "round", "stroke-linecap": "round" }));
  ground.appendChild(el("path", {
    d: dStr, fill: "none", stroke: "#efe6cf", "stroke-width": 3,
    "stroke-dasharray": "2 12", "stroke-linecap": "round" }));

  /* --- alberi e lampioni ---
     Posizioni verificate: fuori dalle impronte degli edifici, lontano
     dalle strade e dentro il bordo dell'isola (l'albero occupa ~0.85 celle). */
  [[-1.0,1.6],[2.7,-1.2],[5.6,-1.0],[7.4,-0.8],[-1.1,5.9],[-0.5,7.5],[6.9,7.4]].forEach(([x,y]) => tree(ground, x, y));
  [[2.85,2.5],[5.4,2.5],[2.25,5.8],[5.5,6.9]].forEach(([x,y]) => lamp(ground, x, y));

  /* --- edifici (ordinati back-to-front) --- */
  const bEls = [];   // gruppi edificio in ordine di profondità (per il depth-sort dell'avatar)
  buildings
    .slice().sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy))
    .forEach(b => {
      const g = el("g", { class: "building", "data-section": b.id, filter: "url(#soft)" });
      g.style.cursor = "pointer";
      b.build(g, b);

      // etichetta SEMPRE visibile, posizionata appena sopra l'edificio
      const center = iso(b.gx + b.w / 2, b.gy + b.d / 2, b.top);
      const labelG = el("g", { class: "blabel" });
      const txt = b.label, wEst = Math.max(72, txt.length * 9 + 36);
      const lx = center.x, ly = center.y - 20;
      labelG.appendChild(el("rect", { x: lx - wEst/2, y: ly - 16, rx: 11, width: wEst, height: 30, fill: "rgba(20,28,60,0.82)" }));
      const tEl = el("text", { x: lx, y: ly + 5, "text-anchor": "middle", class: "blabel-text", fill: "#fff", "font-size": "15", "font-weight": "600" });
      tEl.textContent = (CONTENT.sections[b.id].icon || "") + "  " + txt;
      labelG.appendChild(tEl);
      g.appendChild(labelG);

      g.addEventListener("click", () => onSelect(b.id));
      world.appendChild(g);
      bEls.push({ el: g, x2: b.gx + b.w, y2: b.gy + b.d });
    });

  /* --- avatar che cammina lungo le strade ---
     Guidato in JS: segue i waypoint di ROAD, fa una sosta davanti a ogni
     porta e a ogni frame viene reinserito nel DOM alla profondità giusta,
     così scompare DIETRO gli edifici invece di camminare sui tetti. */
  const avatar = el("g", { class: "avatar" });
  const flipG = el("g");                       // specchia il personaggio quando va verso sinistra
  const walker = el("g", { class: "walker" }); // il CSS anima il passo su questo gruppo
  walker.appendChild(el("ellipse", { cx: 0, cy: 1, rx: 9, ry: 3.5, fill: "rgba(20,20,40,.22)" }));      // ombra
  walker.appendChild(el("rect", { x: -7, y: -20, width: 14, height: 18, rx: 6, fill: "#ff8a5c" }));       // corpo
  walker.appendChild(el("rect", { x: -7, y: -8, width: 14, height: 7, rx: 3, fill: "#5b62e0" }));         // gambe/pantaloni
  walker.appendChild(el("circle", { cx: 0, cy: -26, r: 8, fill: "#f4c9a0" }));                            // testa
  walker.appendChild(el("path", { d: "M -8 -27 A 8 8 0 0 1 8 -27 L 6 -29 L -6 -29 Z", fill: "#5b3a22" }));// capelli
  flipG.appendChild(walker);
  avatar.appendChild(flipG);
  world.appendChild(avatar);

  const segs = ROAD.map((w, i) => {
    const next = ROAD[(i + 1) % ROAD.length];
    return {
      a: w.p, b: next.p,
      len: Math.hypot(next.p[0] - w.p[0], next.p[1] - w.p[1]),
      stopAtEnd: !!next.stop
    };
  });
  const WALK_SPEED = 0.9;   // celle di griglia al secondo
  const DOOR_PAUSE = 1.3;   // sosta (s) davanti a ogni porta
  let segI = 0, segDone = 0, pause = 0, lastT = performance.now(), lastRef = null;

  function placeAvatar(gx, gy, dirX) {
    const p = iso(gx, gy, 0);
    avatar.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    flipG.setAttribute("transform", `scale(${dirX},1)`);
    // l'avatar è DAVANTI a un edificio se sta a est o a sud della sua impronta
    const behind = bEls.find(e => gx < e.x2 && gy < e.y2);
    const ref = behind ? behind.el : null;
    if (ref !== lastRef) { world.insertBefore(avatar, ref); lastRef = ref; }
  }

  function stepWalker(now) {
    walkerRAF = requestAnimationFrame(stepWalker);
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    if (pause > 0) { pause -= dt; return; }
    avatar.classList.remove("paused");
    let move = WALK_SPEED * dt;
    while (move > 0) {
      const s = segs[segI];
      const rest = s.len - segDone;
      if (move < rest) { segDone += move; move = 0; }
      else {
        move -= rest; segDone = 0;
        const stopHere = s.stopAtEnd;
        segI = (segI + 1) % segs.length;
        if (stopHere) { pause = DOOR_PAUSE; avatar.classList.add("paused"); move = 0; }
      }
    }
    const s = segs[segI], t = s.len ? segDone / s.len : 0;
    const gx = s.a[0] + (s.b[0] - s.a[0]) * t;
    const gy = s.a[1] + (s.b[1] - s.a[1]) * t;
    const screenDx = (s.b[0] - s.a[0]) - (s.b[1] - s.a[1]);   // segno del moto orizzontale a schermo
    placeAvatar(gx, gy, screenDx < -0.01 ? -1 : 1);
  }
  cancelAnimationFrame(walkerRAF);
  placeAvatar(ROAD[0].p[0], ROAD[0].p[1], 1);
  walkerRAF = requestAnimationFrame(t => { lastT = t; stepWalker(t); });

  /* --- nuvole --- */
  const clouds = el("g", { class: "clouds" });
  [[-260,-210,1],[180,-250,0.8],[400,-180,1.1]].forEach(([cx,cy,s], i) => {
    const c = el("g", { class: "cloud", style: `--i:${i}` });
    [[0,0,34],[34,6,26],[-30,8,24],[6,-14,22]].forEach(([dx,dy,r]) =>
      c.appendChild(el("circle", { cx: cx+dx, cy: cy+dy, r: r*s, fill: "#fff", opacity: 0.9 })));
    clouds.appendChild(c);
  });
  world.appendChild(clouds);

  fitWorld(svg, world);
}

function fitWorld(svg, world) {
  const bb = world.getBBox();
  const pad = 60;
  svg.setAttribute("viewBox",
    `${(bb.x - pad).toFixed(0)} ${(bb.y - pad).toFixed(0)} ${(bb.width + pad*2).toFixed(0)} ${(bb.height + pad*2).toFixed(0)}`);
}
