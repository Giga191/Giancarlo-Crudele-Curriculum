# CLAUDE.md — Stato del progetto (LEGGERE SEMPRE PRIMA DI INIZIARE)

> ⚠️ **ISTRUZIONE PERMANENTE PER CLAUDE:** questo file va **LETTO SEMPRE, per intero,
> all'inizio di OGNI sessione/chat, PRIMA di fare qualsiasi cosa.** È la **fonte unica di verità**.
> **Va aggiornato a ogni modifica significativa** (vedi § Changelog in fondo) e va sempre tenuta
> aggiornata la sezione **§ 0. Ultima domanda aperta**. Dopo ogni blocco di lavoro, comunicare
> esplicitamente all'utente **"CLAUDE.md aggiornato"**.
> Lingua del progetto e del committente: **italiano**.

---

## 0. Ultima domanda aperta (in attesa di risposta dall'utente)

> Aggiornare SEMPRE questa sezione con l'ultima cosa chiesta all'utente, così se cambia chat
> si riprende esattamente da qui.

**Stato (2026-07-07):** ✅ **CV e foto aggiornati** dal nuovo curriculum fornito dall'utente
(cartella `Nuovo Cv e nuova foto/`): nuova foto profilo (giacca) ritagliata a 400×400,
nuovo lavoro **Sviluppatore @ Tecno Quality**, nuove competenze (VB.NET, Power BI, Apache
Superset, Hyper-V, Docker, BI/VPN), PDF scaricabile aggiornato. Vedi changelog 2026-07-07.

**Stato (2026-07-06):** 🎉 **SITO ONLINE!** → **https://giancarlo-crudele-cv.onrender.com**
Deploy su Render completato (vedi changelog). Repo: https://github.com/Giga191/Giancarlo-Crudele-Curriculum
(pubblico, branch `master`, auto-deploy attivo: ogni `git push` ripubblica da solo).
✅ **Easter egg AGGIUNTI** (richiesti entrambi dall'utente): gatto nero da accarezzare +
tuffo nella fontana con splash (vedi changelog 2026-07-06).
✅ **Rifiniture del 2026-07-06**: fix collisioni fontana (+zampillo solido, acqua che rallenta),
gatto con animazioni articolate (siede, trotta, si guarda intorno, sbatte le palpebre),
suoni dei passi (con sciacquettio in acqua), splash a 3 strati. **Pushate e ONLINE**
(commit fb96e97, deploy Render live e verificato nel bundle pubblicato).
**Nessuna domanda in sospeso.** Opzionale in futuro: dominio personalizzato (dashboard Render).

*(Già confermato dall'utente: sì, ad ogni blocco di lavoro devo scrivere "CLAUDE.md aggiornato".)*

---

## 1. Obiettivo
Sito web **curriculum vitae interattivo** di **Giancarlo Crudele** (sviluppatore software).
Deve essere professionale ma **simpatico e molto interattivo**.

**Visione attuale (in corso):** esperienza **3D stile bruno-simon.com**. L'utente controlla un
**avatar che cammina in una città medievale**; ogni struttura ha una **porta**; entrando, il CV
di quella sezione esce come uno **stendardo** (pergamena medievale).

---

## 2. Decisioni prese (NON ridiscutere senza richiesta esplicita)
- **3D che SOSTITUISCE** la vecchia versione 2.5D isometrica (l'iso va archiviato, non cancellato).
- **Stack target: Vite + Three.js**.
- **Stile grafico: low-poly cartoon (asset Kenney CC0)**.
- **Greybox prima**: prima tutto con forme primitive segnaposto, poi si sostituiscono con gli asset belli.
- **Bilingue IT / EN** con switch (default IT, salvato in localStorage).
- ~~**Avatar Mixamo**~~ → **Avatar KayKit Knight** (CC0, riggato, 75 animazioni): Mixamo richiede
  login Adobe non automatizzabile; il cavaliere KayKit è equivalente, in stile e già integrato.
  **Edifici Kenney** per la versione finale. ✅ entrambi fatti.
- Mantenere in Fase finale un piccolo **"Salta al CV"** (pagina testuale accessibile) per recruiter/SEO/mobile.

### Ambiente
- ✅ **Node.js v24.18.0 LTS + npm 11.16.0 INSTALLATI** (2026-07-04, via winget) e **migrazione a Vite COMPLETATA**.
  Three.js ora arriva da npm (import-map CDN rimosso). Il vecchio vincolo "niente Node" non esiste più.
- ⚠️ Nota shell: il PATH di una nuova sessione PowerShell di Claude non include node/npm;
  ricaricare con `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')` nella stessa chiamata.

### Mappatura quartieri → sezioni CV (confermata)
| Edificio medievale          | Sezione CV   | id          |
|-----------------------------|--------------|-------------|
| 🏠 Casa del villaggio        | Chi sono     | `about`     |
| 🏰 Gilda / Castello          | Esperienza   | `experience`|
| 📜 Torre del Sapere          | Istruzione   | `education` |
| 🔨 Fucina del fabbro         | Competenze   | `skills`    |
| 🚩 Mercato dei Mercanti      | Lingue       | `languages` |
| 🍺 Taverna                   | Hobby        | `hobbies`   |
| 🕊️ Torre del Messaggero      | Contatti     | `contact`   |

---

## 3. Struttura dei file
```
Progetto sito curriculum/
├─ CLAUDE.md                  ← QUESTO FILE (stato + changelog)
├─ README.md                  ← istruzioni per l'utente
├─ curriculum giancarlo crudele.pdf   ← CV originale
├─ package.json               ← Vite + three@0.160 + nipplejs (scripts: dev/build/preview)
├─ vite.config.js             ← multipagina (/ iso + /3d/), porta 5500, apre /3d/
├─ .gitignore                 ← node_modules/, dist/
├─ node_modules/              ← dipendenze npm (non toccare a mano)
│
├─ 3d/                        ← ✅ CITTÀ 3D ATTIVA (modelli Kenney)
│  ├─ index.html              ← pagina 3D
│  ├─ game.css                ← HUD, etichette, prompt, joystick, STENDARDO
│  ├─ game.js                 ← motore: scena, avatar, città, porte, stendardo
│  └─ buildings.js            ← ⭐ compositore edifici Kenney (7 quartieri da moduli GLB)
│
├─ public/models/             ← asset Kenney CC0 (GLB + colormap.png)
│  ├─ town/                   ← Fantasy Town Kit 2.0 (pareti, tetti, bancarelle, alberi…)
│  └─ castle/                 ← Castle Kit (torri, mura, bandiere)
│
├─ scripts/shot.mjs           ← screenshot headless della città (Brave+puppeteer-core, per Claude)
│
├─ js/                        ← logica condivisa
│  ├─ content.js              ← ⭐ TUTTI i contenuti CV bilingue (FONTE UNICA dei testi)
│  ├─ city.js                 ← (sito iso) motore città isometrica SVG
│  └─ app.js                  ← (sito iso) i18n, pannelli, audio, giorno/notte
│
├─ css/style.css              ← (sito iso) stile
├─ index.html                 ← (sito iso 2.5D) — DA ARCHIVIARE in /_archivio-iso quando il 3D è pronto
│
├─ assets/
│  ├─ foto.jpg                ← foto profilo (estratta dal PDF) 250x250
│  └─ cv-giancarlo-crudele.pdf← copia scaricabile del CV
│
└─ .claude/launch.json        ← config preview (python http.server :5500, apre /3d/)
```

### Regole sui contenuti
- **Tutti i testi del CV stanno in `js/content.js`** (oggetto `CONTENT`, con chiavi `it`/`en`).
  È riusato sia dal sito iso sia dalla città 3D. **Per cambiare i testi si tocca solo questo file.**
- `content.js` espone anche `window.CONTENT = CONTENT` (serve ai moduli ES del 3D).
- Dopo la migrazione a Vite, `game.js` lo importa direttamente (`import "../js/content.js"`);
  il vecchio `<script src="../js/content.js?v=N">` in `3d/index.html` è stato rimosso
  (niente più cache-busting manuale: ci pensa Vite).

---

## 4. Stato attuale — ✅ FATTO e VERIFICATO
**Vertical slice 3D giocabile in `/3d/`** (Fasi 1+2 + assaggio Fase 5):
- Avatar greybox che **cammina** (WASD/frecce + joystick mobile), con animazione gambe/braccia e ombra.
- **Camera ISOMETRICA** (scelta utente 2026-07-04): `OrthographicCamera`, pitch fisso ≈35.26°
  (`ISO_PITCH`), segue l'avatar; trascina per ruotare lo yaw, **rotella = zoom** (`VIEW_HALF` 9–26).
- **7 edifici greybox** (i quartieri) con **porte**, archi, tetti e **etichette** proiettate sullo schermo.
- Luci, ombre, cielo, nebbia, alberi, piazza centrale.
- **Prompt "Entra"** alla porta + tasto **E** / pulsante mobile.
- **Stendardo** (pergamena) che mostra la sezione CV, bilingue, da `content.js`. Renderer per tutte le 7 sezioni.
- Switch lingua IT/EN.

**Sito iso 2.5D (versione precedente)** — completo e funzionante, con foto, giorno/notte, audio, avatar che cammina.
Resterà come archivio una volta pronto il 3D.

---

## 5. Prossimi passi (roadmap)
- [x] ~~**Fase 3** — collisioni più curate~~ ✅ 2026-07-05: OBB orientati per gli edifici + cerchi
      per alberi/fontana/lampioni, verificate numericamente (280 punti di test).
- [x] ~~**Installare Node.js** → **migrare a Vite**~~ ✅ fatto il 2026-07-04 (Node 24.18 LTS, Vite 8, three@0.160 da npm, import-map rimosso; build e dev verificati).
- [x] ~~**Fase 4** — città completa con modelli **Kenney**~~ ✅ fatto il 2026-07-04 (vedi changelog).
- [x] ~~**Fase 5** — rifinire ingresso porta + stendardo~~ ✅ 2026-07-05: l'avatar si gira verso la
      porta, dissolvenza nera 380ms, poi lo stendardo si srotola. Suono d'apertura se audio attivo.
- [x] ~~**Fase 6** (quasi tutta)~~ ✅ 2026-07-05: avatar **KayKit Knight** animato (Idle/Running_A,
      crossfade), audio Web Audio (blip, off di default, pulsante 🔇/🔊), **giorno/notte** (pulsante
      🌙/☀️, lerp cielo/nebbia/luci + 4 PointLight sui lampioni), **"Salta al CV"** (`cv.html`
      accessibile/SEO, pulsante 📄 nell'HUD, link ritorno alla città).
- [x] ~~**Deploy**~~ ✅ 2026-07-06: **online su Render** → https://giancarlo-crudele-cv.onrender.com
- [x] ~~Archiviare il sito iso in `/_archivio-iso`~~ ✅ 2026-07-06 (radice `/` = redirect alla città 3D).
- [x] ~~Easter egg~~ ✅ 2026-07-06: fatti ENTRAMBI (gatto nero accarezzabile + tuffo in fontana con splash).

### Tarature in attesa di feedback utente
- Velocità avatar (`SPEED` in `game.js`), zoom iso (`VIEW_HALF`, range rotella 9–26),
  angolo iso (`ISO_PITCH`), distanze tra edifici (`DISTRICTS`).
- N.B. con la camera ortografica `CAM_DIST` non influenza più la scala (solo il clipping): per
  avvicinare/allontanare la vista si agisce su `VIEW_HALF`.

---

## 6. Come avviare / verificare
```bash
# dalla cartella del progetto (dev server Vite, hot-reload)
npm run dev
```
- Città 3D:  http://localhost:5500/3d/
- Sito iso:  http://localhost:5500/
- Build produzione: `npm run build` (output in `dist/`; il sito iso dà 3 warning sugli
  script classici non bundlabili — atteso, verrà archiviato). Anteprima build: `npm run preview`.
- In alternativa funziona ancora `python -m http.server 5500`? **NO per il 3D**: ora `game.js`
  importa `three` da npm, serve il dev server Vite. Il sito iso invece funziona con qualsiasi server.

### Nota su preview/screenshot (importante per Claude)
- Lo **screenshot del preview va in timeout** quando c'è un **canvas WebGL in rendering continuo**
  (il loop requestAnimationFrame non "si ferma"). Funziona **solo alla prima cattura su un server
  appena avviato** con `preview_start`. Per ispezionare lo stato usare **`preview_eval`**
  (es. leggere `window.CONTENT`, contare `.blabel`, ecc.).
- Il preview a volte si "incastra": rimedio = **stop + start** del server.

---

## 7. Chi è l'utente
**Giancarlo Crudele** — perito informatico, diplomato ITS Apulia Digital Maker (Developer 4.0, voto 100),
laureando in Ing. Informatica (Mercatorum). Competenze: Java, C#, C++, C, SQL, HTML/CSS/JS/PHP/Bootstrap,
basi Angular. Inglese B2. Personalità simpatica/carismatica; appassionato di videogiochi, fumetti, sport,
cinema, musica, moda. Scrive in italiano.

---

## 8. Changelog (aggiungere in cima, con data)

### 2026-07-07 (aggiornamento CV + foto nuova) 📄📸
Richiesta utente: integrare le info del nuovo curriculum (`Nuovo Cv e nuova foto/`) e la nuova foto.
- **Foto profilo**: `Nuovo Cv e nuova foto/Foto.png` (1180×1333, ritratto in giacca) → ritaglio
  quadrato centrato sul volto (lato 1080, offset x50/y40) e resize a **400×400**, JPG q88 (~21 KB)
  via **System.Drawing (PowerShell)** — niente sharp/ImageMagick disponibili. Salvata sia in
  `public/assets/foto.jpg` (runtime servito) sia in `assets/foto.jpg` (sorgente). Mostrata in cerchio
  nel banner "Chi sono" del 3D e nell'header di `cv.html`.
- **`js/content.js`** (fonte unica testi): aggiunto il lavoro attuale **Sviluppatore @ Tecno Quality**
  (Rutigliano, Dic 2025 – Attuale) in cima a `experience.items` con i 5 punti dal CV (VB.NET,
  dashboard BI, Hyper-V/Docker su Linux, reti VPN + hardware in rete, automazione/integrazione).
  Competenze: **VB.NET** aggiunto ai Linguaggi; nuovo gruppo **"BI & Infrastruttura"** (Power BI,
  Apache Superset, Hyper-V, Docker); rimosso "AutoCAD Architecture" (non nel CV); nuovi tag
  (Business Intelligence, Virtualizzazione, Reti & VPN, Patente B).
- **PDF scaricabile**: nuovo `Giancarlo_crudele.pdf` copiato in `public/assets/cv-giancarlo-crudele.pdf`
  (e `assets/`).
- Verificato: build OK, preview OK (nuova foto + Tecno Quality nello stendardo Esperienza).

### 2026-07-06 (foresta attorno al villaggio) 🌲🌲
Richiesta utente: bosco fitto che nasconda "la fine del mondo".
- **`buildForest()` in buildings.js**: ~900 alberi in 9 anelli concentrici (r 50→88, un albero
  ogni ~4.2 unità con jitter, scala 0.85–1.4·K, 2 varianti Kenney) — ma **InstancedMesh**:
  una sola mesh istanziata per ogni mesh dei 2 modelli albero → pochi draw call, va bene
  anche su mobile. PRNG **LCG seminato** = layout deterministico. ⚠️ `frustumCulled=false`
  sulle InstancedMesh (il bounding della geometria singola non copre il bosco → sparirebbero).
- **game.js**: terreno 180→**500** (oltre la nebbia: il bordo del piano non si vede più
  nemmeno a zoom max), **confine mondo circolare r=54** in `resolveCollision` (sostituisce il
  clamp box ±78; si cammina tra le prime file del bosco ma non si sfonda), **collider (r 1.1)
  solo sulle prime 2 file** (~156, le uniche raggiungibili) → 186 collider totali, costo irrisorio.
- Verificato headless: panoramica zoom max senza orizzonte visibile, vista dal confine ok,
  clamp a 54.00 esatto, 0 errori console. Build OK.

### 2026-07-06 (splash della fontana migliorato) 🔊💦
`Sound.splash()` rifatto in **3 strati** (prima: singolo burst di rumore lowpass):
(1) **tonfo** d'impatto — sinusoide 260→70 Hz in 0.18 s; (2) **corpo** — rumore 0.7 s con
inviluppo in potenza 1.6 e **bandpass che si apre a 2600 Hz ("sciaff") e ridiscende a 700**;
(3) **5 goccioline** — "plin" sinusoidali 900–1800 Hz con micro-glissando in giù, sparsi
tra +0.15 e +0.55 s. NB Web Audio: le rampe esponenziali non partono/arrivano a 0 → si usa
0.0001 (o linearRamp per l'attacco). Verificato headless (2 splash consecutivi, ctx running,
0 errori) e build OK.

### 2026-07-06 (collisioni fontana + animazioni gatto + suoni passi) 🐾👣
Richieste utente, tutto in `game.js`:
- **Fix collisioni fontana** (si poteva entrare camminando!): il push-out lasciava il giocatore a
  ~4.1999 dal centro (float), il frame dopo `inFountain < 4.2` era vero e il collider veniva
  ignorato. Ora `inWater` è uno **stato con isteresi**: diventa true SOLO atterrando dentro
  (tuffo), false oltre r=4.45 → il bordo non "sfarfalla" mai. In più: **zampillo centrale solido**
  (collider r=1.1 sempre attivo, anche in acqua/volo) e **l'acqua rallenta** (SPEED ×0.55).
- **Gatto rifatto ad articolazioni**: `torso` con perno sull'anca posteriore (→ **posa SEDUTA**
  quando è fermo o coccolato: busto -0.55 rad, zampe davanti dritte, dietro ripiegate, coda a
  terra), zampe con perno all'anca (geometria traslata) che **trottano in diagonale** (fasi 0/π),
  **testa mobile** (si guarda intorno da fermo con seni sovrapposti, ciondola durante le coccole),
  **sbatte le palpebre** ogni 2.5–6 s (scale.y occhi). Transizioni via `sitT` lerp.
- **Suoni dei passi**: `Sound.step(inWater)` — burst di rumore lowpass ~300–440 Hz (freq random:
  ogni passo diverso), in acqua bandpass 1300 Hz (sciacquettio) + **3 goccioline** per passo
  (`spawnDrops`, estratto da `doSplash`). Cadenza 0.28 s (0.34 in acqua), tonfo all'atterraggio
  del salto. Come tutto l'audio: attivo solo con 🔊 on.
- `__dbg` esteso (inWater, Sound). Verificato headless (test A–G): camminando ci si ferma a
  r=4.2, col salto inWater+26 schizzi, zampillo blocca a r=1.1, si esce camminando, seduta/trotto/
  coccole ok, 0 errori console. Build OK.

### 2026-07-06 (easter egg: gatto nero + tuffo in fontana) 🐈‍⬛💦
Richiesti entrambi dall'utente. Tutto in `game.js` (sezione 3b) + `content.js` (ui.petCat) + `game.css` (.heart):
- **Gatto nero procedurale** (primitive THREE, niente GLB: corpo/testa/orecchie a cono/zampe/coda
  in gruppo `tailG` animato, occhi verdi emissive → brillano di notte). **Vaga per la città**:
  meta casuale `newCatTarget()` (r 8–42, mai in fontana), `resolveCollision` per gli ostacoli,
  anti-incastro (stall>1.2s → nuova meta), rotazione fluida con `wrapAngle`, passetti su sin(t).
- **Carezze**: entro 3.2 unità il prompt diventa "Accarezza il gatto 🐈‍⬛" (priorità sulla porta;
  su mobile il pulsante Entra diventa 🐾) → **E**/tap = `petCat()`: gatto fermo 2.4s girato verso
  il giocatore, coda felice, **fusa** (`Sound.purr`, 3 blip sawtooth bassi) e **3 cuoricini DOM**
  (proiezione camera → div.heart con animazione heart-float).
- **Tuffo in fontana**: collider fontana marcato `fountain:true`; `resolveCollision(pos,
  ignoreFountain)` lo salta se in volo o già dentro → si entra SOLO saltando, dentro ci si
  muove e si esce camminando (il bordo respinge solo da fuori). All'atterraggio in acqua
  (dist<4.2) → `doSplash`: **26 gocce** (sfere azzurre, fisica con gravità, scala=vita 0.9s)
  + `Sound.splash` (rumore bianco filtrato lowpass in dissolvenza).
- `__dbg` esteso (doSplash, petCat, cat, splashCount). Verificato headless: prompt gatto,
  pet+cuori, tuffo (dentroFontana+aTerra+26 schizzi), 0 errori, build OK. NB: negli screenshot
  headless può comparire un riquadro-fantasma da VRAM non inizializzata (artefatto GPU, non è un bug).

### 2026-07-06 (DEPLOY SU RENDER) 🚀
**Il sito è online: https://giancarlo-crudele-cv.onrender.com** (CDN + HTTPS gratis di Render;
dominio proprio non necessario, agganciabile in futuro dal dashboard). Passi fatti:
- **Pre-deploy**: sito iso 2.5D spostato in `/_archivio-iso` (con README; `js/content.js` resta
  in `js/` perché condiviso con 3D e cv.html); nuova **`index.html` radice = redirect a `/3d/`**
  (meta refresh + `location.replace`, con og-meta e link fallback a città/CV); `vite.config.js`
  aggiornato (input: home/city3d/cv → build senza più warning); **og:url/og:image assoluti**
  in `3d/index.html` e nella radice. Verificato redirect nel preview e build pulita.
- **Git/GitHub**: `git init` + commit iniziale (71 file); installata **gh CLI 2.96 via winget**;
  login `gh auth login --web` fatto dall'utente in una finestra dedicata (Start-Process, con
  watcher in background che aspetta `gh auth status` ok — il primo watcher da 6 min è scaduto,
  al secondo tentativo da 30 min l'utente ha completato). Account GitHub: **Giga191** (identità
  git già configurata sul PC). Repo **pubblico**: https://github.com/Giga191/Giancarlo-Crudele-Curriculum
  (il nome richiesto "Giancarlo Crudele Curriculum" ha gli spazi → GitHub non li ammette, usati i trattini).
- **Render** (MCP, workspace "My Workspace"): `create_static_site` name=`giancarlo-crudele-cv`,
  branch master, build `npm ci && npm run build`, publishPath `dist`, **auto-deploy on commit**
  (ogni push su master ripubblica da solo). Servizio: srv-d95vusfavr4c73cbhuk0
  (dashboard: https://dashboard.render.com/static/srv-d95vusfavr4c73cbhuk0).
- **Verificato online**: 200 su `/`, `/3d/`, `/cv.html`, `/og-image.png`. Primo deploy live in ~19s.
- NB il MCP Render a inizio sessione può richiedere di riselezionare il workspace:
  basta chiamare `list_workspaces` (uno solo → si autoseleziona).

### 2026-07-05 notte (fix portale del castello) 🏰
Segnalazione utente: una parte del castello Esperienza era sbagliata. Era il **portale**:
`castle/wall-doorway` è **METÀ blocco** (x ∈ [-0.5, 0] misurato dal GLB con script che legge
gli accessor min/max, `scratchpad/glb-info.mjs`) tagliato **lungo l'asse del passaggio**;
il vecchio codice piazzava le due metà a 1 cella di distanza (buco fuori centro + spuntone).
Fix in buildings.js: le due metà **ruotate di ±90° e accoppiate dorso a dorso in x=0**
(arco completo rivolto alla piazza), **scala z×2** per coprire le 2 celle centrali della cinta.
Nota per il futuro: primo tentativo con rot 0/π = muro cieco (l'arco corre lungo l'asse x
del pezzo, non z). Verificato con screenshot frontale: arco centrato, cinta continua. Build OK.

### 2026-07-05 notte (restyling villaggio pre-deploy) 🏘️
Richiesta utente: disposizione più carina, Chi sono e Hobby più belli, più dettagli.
- **Disposizione a ventaglio regolare**: `DISTRICTS` ora è generato da `polar(k,R)` (settori di
  2π/7, raggio per stazza). **Ordine di lettura del CV in senso orario**: chi sono → esperienza →
  … → contatti; il **castello (k=0) troneggia in fondo alla vista iniziale** (direzione −45°,
  opposta alla camera: attenzione, +x/−z è VICINO alla camera, non lontano — primo tentativo
  era specchiato). Strade/porte/etichette/collisioni si adattano da sole.
- **Alberi procedurali**: uno in ogni varco tra due quartieri (R 30–34) + fila di sfondo dietro
  gli edifici (R 45–51, jitter deterministico). Niente più coordinate a mano.
- **Casa del villaggio (Chi sono)**: persiane al PT, vetri al piano legno, camino sulla falda
  posteriore, panchina accanto alla porta.
- **Taverna (Hobby)**: porta in legno, gagliardetto sul colmo (h etichetta 2.7→4.0), camino
  cucina, seconda panca (dehor), banco birra `stall-red` a lato.
- **Piazza**: 3 panchine rivolte alla fontana nei varchi tra le strade (collider r=0.8),
  ritornate da `buildPlaza()`.
- Nuovi pezzi in MODELS: wall-window-shutters, wall-wood-door, wall-wood-window-glass
  (GLB già presenti in public/models/town).
- Verifiche: screenshot panoramica + primi piani casa/taverna OK, 0 errori console, build OK.

### 2026-07-05 notte (bandiera castello + SALTO) 🤸
- **Bandiera del mastio staccata** (segnalata dall'utente con screenshot): in `buildings.js`
  era piazzata a un'altezza stimata (`kY(2.02) + 1.4*1.35`) più alta del tetto reale → ora la
  cima viene **misurata col Box3 del pezzo top** e la bandiera si pianta a `peakY - 0.12`.
  Lezione: per impilare pezzi Kenney non fidarsi delle altezze "a occhio", misurare col Box3.
- **Salto del cavaliere** (richiesta utente): fisica verticale in `game.js` (`JUMP_V=9.5`,
  `GRAVITY=26` → apice ≈1.7 unità, ~0.73s), tasto **SPAZIO** (con preventDefault per non
  cliccare i pulsanti HUD a fuoco) + **pulsante mobile ⤴** (`#jump-btn-mobile`, sempre visibile
  su `body.touch`, sopra "Entra", pointerdown). Animazione: clip `Jump_Full_Short` (fallback
  primo clip /jump/i) con LoopOnce; il crossfade idle↔corsa è sospeso in aria e ripristinato
  all'atterraggio. **Camera ancorata a y=0** (prima seguiva player.y: col salto sobbalzava).
  Comandi aggiornati in `controls-hint`, `ui.welcomeKeys` (it/en) e `__dbg` (tryJump, grounded).
- Verifiche (scripts/shot.mjs, headless): bandiera attaccata alla punta, salto y=1.56 a metà
  volo + atterraggio a 0, pulsante mobile visibile e funzionante al tocco, 0 errori, build OK.

### 2026-07-05 notte (fix sito iso 2.5D) 🚶
Su segnalazione utente (dal telefono si vede l'iso alla radice `/` e ha difetti visibili):
- **Omino sui tetti** (2 cause): (1) la strada collegava le porte con rette che TAGLIAVANO gli
  edifici; (2) l'avatar era sempre disegnato sopra tutto. Fix in `js/city.js`: nuova costante
  `ROAD` = anello di waypoint che gira attorno alle impronte (con rampa cieca per Competenze);
  `animateMotion` sostituito da walker JS (rAF) che segue i waypoint, **si specchia** quando va
  a sinistra, **sosta 1.3s davanti a ogni porta** (passo in pausa via `.avatar.paused` in CSS)
  e a ogni frame viene **reinserito nel DOM alla profondità giusta** (regola iso: davanti se
  a est o a sud dell'impronta) → ora sparisce dietro gli edifici. `walkerRAF` a livello modulo,
  cancellato a ogni `renderCity` (il cambio lingua ri-renderizza: verificato 1 solo avatar).
- **Alberi/lampioni compenetranti**: riposizionati tutti (alberi ad anello sui bordi dell'isola,
  lampioni ai lati delle strade). Verifica numerica con script Node (distanza segmento-rettangolo
  + overlap AABB): zero compenetrazioni strade/alberi/lampioni vs edifici, alberi dentro l'isola.
- Verificato nel preview: 7 edifici, avatar in cammino sulle strade, depth-sort osservato
  (avatar inserito prima di "hobbies" quando ci passa dietro), soste alle porte, 0 errori console.
- Percorso più lungo di prima: ~30 celle + 7 soste ≈ 40s/giro a 0.9 celle/s (`WALK_SPEED`).

### 2026-07-05 sera (revisione completa del codice) 🔍
Riletti per intero game.js, buildings.js, game.css, index.html, cv.html, vite.config. 4 bug trovati e corretti:
- **Tablet touch >720px senza tastiera non poteva entrare negli edifici**: la regola CSS che mostra
  il pulsante "Entra" era solo nella media query ≤720px → aggiunta `body.touch .enter-btn-mobile.show`.
- **Rotella sullo stendardo aperto zoomava la città** dietro la pergamena → wheel ignorato se `bannerOpen`.
- **Pinch-zoom attivo anche con stendardo aperto** → touchmove ignorato se `bannerOpen`.
- **L'avatar si muoveva (WASD/joystick) mentre lo stendardo era aperto** → input bloccati durante
  lettura e transizione. + Aggiornato l'header obsoleto di game.js ("prototipo greybox").
Note NON bloccanti da ricordare al deploy: (1) il sito iso nella `dist/` è rotto (script classici non
bundlati — tanto verrà archiviato prima del deploy); (2) `og:image` va assolutizzato col dominio;
(3) `scripts/shot.mjs` ha il percorso di Brave hardcoded (solo strumento di sviluppo di questo PC).
Smoke test post-fix: flusso E→dissolvenza→stendardo→contatore OK, build OK, zero errori console.

### 2026-07-05 sera (5 migliorie pre-deploy) 🛣️
- **Strade**: `buildRoad()` in buildings.js — sentieri radiali di tessere `town/road` (scala 0.55·K,
  larghezza piena sembrava un'autostrada) dalla piazza alla porta di ogni edificio.
- **Pergamena di benvenuto**: overlay `#welcome` (z-index 18, sotto l'HUD così lingua/pulsanti
  restano cliccabili), testi bilingue in `content.js` (`ui.welcome*`), bottone "Inizia l'esplorazione".
- **Contatore visite**: badge `0/7` nell'HUD + spunta ✓ verde sulle etichette degli edifici visitati;
  persistito in `localStorage.visited3d`; si aggiorna in `openBanner`.
- **Mobile**: **pinch-zoom** a due dita (con rotazione disabilitata durante il pizzico).
- **Social/SEO**: meta description + Open Graph in `3d/index.html`; `public/og-image.png`
  (⚠️ og:image va reso assoluto col dominio al deploy). Foto profilo nello stendardo "Chi sono".
- **Asset runtime spostati in `public/assets/`** (foto.jpg, cv pdf): i percorsi generati da JS
  non passano dal bundler, servono in public/ per funzionare nella build.
- Verificato con screenshot: benvenuto, strade, contatore 1/7 + localStorage, foto nel banner. Build OK.

### 2026-07-05 (FASI 3+5+6: avatar, collisioni, rifiniture) ⚔️
- **Avatar**: manichino greybox → **cavaliere KayKit** (`public/models/character/knight.glb`,
  CC0 da GitHub KayKit-Character-Pack-Adventures, texture embedded, 75 animazioni).
  `AnimationMixer` con crossfade Idle↔Running_A; `frustumCulled=false` sulle mesh skinnate;
  scala automatica a 2.5 unità dal bounding box. Mixamo scartato (login Adobe non automatizzabile).
- **Collisioni precise**: `resolveCollision` ora gestisce **OBB orientati** (trasformazione nel
  sistema locale dell'edificio, push-out, ritorno in mondo) + **cerchi** (alberi r=1.1,
  fontana r=4.2, lampioni r=0.6). Verifica numerica: 280 punti interni tutti espulsi, esterni intatti.
- **Transizione porta**: E → avatar si gira verso la porta → dissolvenza `#fade` 380ms → stendardo.
- **Audio**: oggetto `Sound` (Web Audio, nessun file) portato dal sito iso; pulsante 🔇/🔊 in HUD,
  suoni su apertura/chiusura stendardo e cambio lingua. Off di default, stato in localStorage.
- **Giorno/notte**: pulsante 🌙/☀️; `applyDayNight()` interpola cielo/nebbia/hemi/sole e accende
  4 PointLight ambrate sui lampioni della piazza. Bellissimo in notturna.
- **"Salta al CV"**: nuova pagina **`cv.html`** (radice) — CV testuale accessibile bilingue,
  stesso `js/content.js`, foto, barre competenze, contatti, download PDF, link alla città 3D.
  Pulsante 📄 nell'HUD del 3D. Aggiunta come terza pagina in `vite.config.js`.
- **`scripts/shot.mjs`**: ora accetta anche l'URL (per fotografare cv.html); fix crash Vite
  (EBUSY watcher: non scaricare file in `public/` col dev server acceso, o riavviarlo).
- Verifiche: screenshot notte/cavaliere/cv/stendardo OK, `npm run build` OK (3 pagine, 147 KB gzip).

### 2026-07-04 (agg. 3 — FASE 4: città Kenney) 🏰
- **Scaricati asset Kenney CC0**: Fantasy Town Kit 2.0 + Castle Kit (40 GLB scelti → `public/models/`,
  ~700 KB, con `Textures/colormap.png` esterna referenziata dai GLB).
- **Creato `3d/buildings.js`**: compositore modulare — i kit Kenney sono a moduli 1×1
  (pannelli-parete spessi 0.1 sul bordo +x della cella, segmenti torre impilabili).
  Scala `K = 3.2` (1 cella → 3.2 unità mondo). Anello di pareti `ring()` (porte/finestre
  parametriche, celle d'angolo con doppio pannello), tetto `hipRoof()` = **una sola
  `roof-point` scalata sull'intera pianta** (le falde a tessere lasciano un buco visibile:
  i pannelli del kit sono sottili, niente backface). 7 edifici: casa (2 piani legno),
  castello (cinta+4 torri+mastio+portale a doppio arco), torre del sapere, fucina (camino+carro),
  mercato (bancarelle rosse/verdi+stendardo), taverna (insegna+panca+lanterna), torre del
  messaggero (loggia aperta+stendardo lungo). Alberi Kenney, fontana+lampioni in piazza.
- **game.js**: `buildCity()` dopo `preloadModels()` (loader con progresso), avatar scalato 0.85,
  distanze quartieri allargate (~×1.4), zoom default 19 (rotella 10–32), luci alzate
  (hemi 1.7, sun 2.1 — i materiali GLB rendono più scuri dei greybox), `window.__dbg` in dev.
- **Verifica visiva con screenshot headless**: creato `scripts/shot.mjs`
  (puppeteer-core + **Brave** — Edge/Chrome non presenti sul PC). Iterati e corretti:
  spaziatura edifici, buco nei tetti, stendardo mercato sul tetto, luci. Verificati portale
  castello, torre contatti, prompt "Entra" e apertura stendardo CV (tasto E) via screenshot.
- `npm run build` OK. Il vecchio Nature Kit non serve (alberi già nel Fantasy Town Kit).

### 2026-07-04 (agg. 2 — camera isometrica)
- **Camera del gioco 3D convertita a ISOMETRICA** (richiesta utente): `PerspectiveCamera` →
  `OrthographicCamera` con pitch fisso `ISO_PITCH = atan(1/√2) ≈ 35.26°`, yaw iniziale diagonale (135°).
- Aggiunto **zoom con rotella** (`VIEW_HALF` 9–26, `updateFrustum()`); resize adattato all'ortografica.
- Nebbia ritarata (95→200) per la nuova distanza camera (`CAM_DIST = 60`, che in ortografica
  serve solo a non tagliare la scena). Drag per ruotare lo yaw invariato.
- Hint comandi aggiornato in `3d/index.html`. Verificato: build OK, dev server OK.

### 2026-07-04
- **Installato Node.js v24.18.0 LTS + npm 11.16.0** (winget, `OpenJS.NodeJS.LTS`).
- **Migrazione a Vite completata**: creati `package.json` (type module, scripts dev/build/preview),
  `vite.config.js` (multipagina iso+3d, porta 5500, apre `/3d/`), `.gitignore`.
  Installati `three@0.160.0`, `nipplejs`, `vite@8` (dev).
- `3d/index.html`: rimossi import-map CDN e `<script>` di content.js.
  `3d/game.js`: aggiunto `import "../js/content.js"` (Vite bundla tutto).
- **Verificato**: `npm run build` OK (bundle 3D ~125 KB gzip); dev server OK, pagine `/` e `/3d/` rispondono 200,
  import `three` risolto da node_modules.
- `.claude/launch.json`: preview ora lancia `npm run dev` invece di `python -m http.server`.

### 2026-06-23 (agg.)
- Aggiunta **§ 0. Ultima domanda aperta** (registra l'ultima domanda fatta all'utente, per ripartire dopo un cambio chat).
- Rafforzata l'istruzione: **leggere sempre CLAUDE.md per intero a inizio sessione** e dire **"CLAUDE.md aggiornato"** dopo ogni blocco di lavoro (confermato dall'utente).

### 2026-06-23
- **Creato questo `CLAUDE.md`** come stato/handoff del progetto (su richiesta utente: file letto in automatico ogni sessione).
- **Pivot a città medievale 3D** stile bruno-simon.com. Decisioni: sostituire iso, Vite+Three.js, low-poly Kenney, greybox first. Mappatura quartieri confermata.
- **Costruita e verificata la vertical slice 3D** in `/3d/` (avatar che cammina, 7 edifici con porte+etichette, camera follow, ombre, prompt, stendardo CV bilingue). Three.js via CDN perché Node non installato.
- `content.js`: aggiunto `window.CONTENT = CONTENT`; incluso con `?v=2` in `3d/index.html` (cache-bust).
- **Sito iso 2.5D** (versione precedente) completato: città isometrica SVG, bilingue, foto estratta dal PDF, etichette fisse, avatar che cammina, giorno/notte, audio Web Audio opzionale.
