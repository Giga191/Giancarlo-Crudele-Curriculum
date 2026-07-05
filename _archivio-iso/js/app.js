/* =========================================================================
   APP  —  collega contenuti, città e interfaccia
   ========================================================================= */

let LANG = localStorage.getItem("lang") || "it";

/* Restituisce il testo nella lingua corrente.
   Accetta sia stringhe semplici sia oggetti {it,en}. */
function L(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[LANG] ?? v.it ?? "";
}
/* Helper passato a city.js per le etichette degli edifici */
function sectionLabel(id, field) { return L(CONTENT.sections[id][field]); }

const $ = sel => document.querySelector(sel);

/* -------------------------------------------------------------------------
   AUDIO  —  effetti generati con Web Audio (nessun file esterno)
   Spento di default; si attiva dal pulsante 🔇/🔊.
   ------------------------------------------------------------------------- */
const Sound = {
  on: localStorage.getItem("sound") === "on",
  ctx: null,
  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  blip(freq = 520, dur = 0.12, type = "sine", gain = 0.06) {
    if (!this.on) return;
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
  },
  open()  { this.blip(660, 0.14, "triangle", 0.07); setTimeout(() => this.blip(880, 0.12, "triangle", 0.05), 80); },
  click() { this.blip(440, 0.09, "sine", 0.05); },
  toggle() { this.on = !this.on; localStorage.setItem("sound", this.on ? "on" : "off"); return this.on; }
};

/* -------------------------------------------------------------------------
   COSTRUZIONE DEL CONTENUTO DI UNA SEZIONE (pannello)
   ------------------------------------------------------------------------- */
function buildSection(id) {
  const s = CONTENT.sections[id];
  const ui = CONTENT.ui;
  let html = `
    <header class="panel-head">
      <span class="panel-icon">${s.icon || ""}</span>
      <div>
        <h2>${L(s.title)}</h2>
        <p class="panel-sub">${L(s.subtitle)}</p>
      </div>
    </header>
    <div class="panel-content">`;

  switch (id) {
    case "about":
      html += `<div class="about-photo">
          <img src="${CONTENT.profile.photo}" alt="${CONTENT.profile.name}"
               onerror="this.style.display='none';this.parentElement.classList.add('no-photo')">
          <span class="avatar-initials">GC</span>
        </div>`;
      html += s.body[LANG].map(p => `<p>${p}</p>`).join("");
      break;

    case "experience":
    case "education":
      html += `<div class="timeline">`;
      s.items.forEach(it => {
        html += `
          <article class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <span class="tl-period">${L(it.period)}</span>
              <h3>${L(it.role)}</h3>
              <p class="tl-org">${L(it.org)} · ${L(it.place)}</p>
              <ul>${it.desc[LANG].map(d => `<li>${d}</li>`).join("")}</ul>
            </div>
          </article>`;
      });
      html += `</div>`;
      break;

    case "skills":
      s.groups.forEach(grp => {
        html += `<h3 class="skill-group">${L(grp.name)}</h3><div class="bars">`;
        grp.skills.forEach(sk => {
          html += `
            <div class="bar">
              <div class="bar-top"><span>${sk.name}</span><span>${sk.level}</span></div>
              <div class="bar-track"><i style="--w:${sk.level}%"></i></div>
            </div>`;
        });
        html += `</div>`;
      });
      html += `<div class="tags">${s.tags[LANG].map(t => `<span>${t}</span>`).join("")}</div>`;
      break;

    case "languages":
      html += `<div class="bars">`;
      s.items.forEach(it => {
        html += `
          <div class="bar">
            <div class="bar-top"><span>${L(it.name)}</span><span>${L(it.level)}</span></div>
            <div class="bar-track"><i style="--w:${it.value}%"></i></div>
          </div>`;
      });
      html += `</div>`;
      break;

    case "hobbies":
      html += `<div class="hobby-grid">`;
      s.items.forEach(h => {
        html += `<div class="hobby"><span>${h.icon}</span><b>${L(h.label)}</b></div>`;
      });
      html += `</div>`;
      break;

    case "contact":
      const p = CONTENT.profile;
      html += `<p class="contact-lead">${L(s.text)}</p>
        <div class="contact-list">
          <a href="mailto:${p.email}"><span>✉️</span>${p.email}</a>
          <a href="tel:${p.phone.replace(/\s/g,'')}"><span>📞</span>${p.phone}</a>
          <a href="${p.linkedin}" target="_blank" rel="noopener"><span>💼</span>LinkedIn</a>
        </div>
        <a class="btn btn-primary" href="${p.cvFile}" download><span>⬇️</span> ${L(ui.downloadCv)}</a>`;
      break;
  }

  html += `</div>
    <button class="btn btn-ghost panel-back">← ${L(ui.backToCity)}</button>`;
  return html;
}

/* -------------------------------------------------------------------------
   APERTURA / CHIUSURA PANNELLO
   ------------------------------------------------------------------------- */
const overlay = $("#overlay");
const panel = $("#panel");

function openSection(id) {
  panel.innerHTML = buildSection(id);
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");
  panel.scrollTop = 0;
  Sound.open();
  panel.querySelector(".panel-back").addEventListener("click", closeSection);
}
function closeSection() {
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

/* -------------------------------------------------------------------------
   TESTI DI INTERFACCIA STATICI
   ------------------------------------------------------------------------- */
function paintUI() {
  const p = CONTENT.profile, ui = CONTENT.ui;
  $("#profile-name").textContent = p.name;
  $("#profile-role").textContent = L(p.role);
  $("#hero-title").textContent = L(ui.heroTitle);
  $("#hint").textContent = L(ui.hint);
  $("#enter-btn").textContent = L(ui.enter);
  $("#dl-top").innerHTML = `⬇️ <span>${L(ui.downloadCv)}</span>`;
  $("#dl-top").href = p.cvFile;
  $("#footer").textContent = L(ui.footer);
  document.documentElement.lang = LANG;
  $("#lang-it").classList.toggle("active", LANG === "it");
  $("#lang-en").classList.toggle("active", LANG === "en");
}

/* Applica il tema giorno/notte */
function applyTheme(night) {
  document.body.classList.toggle("night", night);
  localStorage.setItem("theme", night ? "night" : "day");
  const btn = $("#theme-toggle");
  if (btn) btn.textContent = night ? "🌞" : "🌙";
}

function setLang(lang) {
  LANG = lang;
  localStorage.setItem("lang", lang);
  paintUI();
  renderCity($("#city"), sectionLabel, openSection);
  // se un pannello è aperto, ridisegnalo nella nuova lingua
  if (overlay.classList.contains("open")) {
    const cur = panel.dataset.current;
    if (cur) openSection(cur);
  }
}

/* -------------------------------------------------------------------------
   AVVIO
   ------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  applyTheme(localStorage.getItem("theme") === "night");
  $("#sound-toggle").textContent = Sound.on ? "🔊" : "🔇";
  paintUI();
  renderCity($("#city"), sectionLabel, openSection);

  $("#lang-it").addEventListener("click", () => { Sound.click(); setLang("it"); });
  $("#lang-en").addEventListener("click", () => { Sound.click(); setLang("en"); });
  $("#overlay-bg").addEventListener("click", closeSection);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSection(); });

  // giorno / notte
  $("#theme-toggle").addEventListener("click", () => {
    Sound.click();
    applyTheme(!document.body.classList.contains("night"));
  });

  // audio on/off
  $("#sound-toggle").addEventListener("click", () => {
    const on = Sound.toggle();
    $("#sound-toggle").textContent = on ? "🔊" : "🔇";
    if (on) Sound.open();           // piccola conferma sonora all'accensione
  });

  // bottone "Esplora": scorre/punta verso la città
  $("#enter-btn").addEventListener("click", () => {
    Sound.click();
    $("#city-stage").scrollIntoView({ behavior: "smooth" });
  });

  // togli lo schermo di caricamento
  setTimeout(() => document.body.classList.add("loaded"), 250);
});

/* memorizza la sezione corrente per il cambio lingua a pannello aperto */
const _open = openSection;
openSection = function (id) { panel.dataset.current = id; _open(id); };
