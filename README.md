# CV interattivo — Giancarlo Crudele 🏙️

Un curriculum vitae sotto forma di **città isometrica 3D** interattiva: ogni edificio
apre una sezione del percorso (chi sono, esperienza, istruzione, competenze, lingue,
hobby, contatti). Bilingue **Italiano / Inglese**.

Tecnologia: **HTML + CSS + JavaScript puro** (nessun framework, nessun build step).

---

## ▶️ Come aprirlo in locale

Apri semplicemente `index.html` con un doppio click, **oppure** (consigliato, così
il download del PDF funziona sempre) avvia un piccolo server locale:

```bash
# dalla cartella del progetto
python -m http.server 5500
```

Poi vai su `http://localhost:5500`.

---

## ✏️ Come modificare i contenuti

Tutti i testi del CV sono in **un solo file**: `js/content.js`.
Ogni voce ha la versione italiana (`it`) e inglese (`en`). Modifica lì e basta.

- **Foto** → metti la tua immagine in `assets/foto.jpg` (campo `profile.photo`).
- **PDF del CV** → sostituisci `assets/cv-giancarlo-crudele.pdf`.
- **Livelli competenze (0-100)** → sono indicativi, regolali in `sections.skills`.

Per cambiare la **mappa della città** (posizione/forma/colore degli edifici)
lavora su `js/city.js`, array `makeBuildings`.

---

## 🎨 Colori e stile

La palette e tutto lo stile sono in `css/style.css`, in alto nel blocco `:root`
(variabili `--accent`, `--accent-2`, ecc.).

---

## 🌍 Pubblicare gratis online (GitHub Pages)

1. Crea un account su [github.com](https://github.com) (se non ce l'hai).
2. Crea un nuovo repository, es. `cv` (pubblico).
3. Carica tutti i file di questa cartella nel repository.
4. Vai su **Settings → Pages**, sezione *Build and deployment*:
   - Source: **Deploy from a branch**
   - Branch: **main** / cartella **/ (root)** → Save.
5. Dopo qualche minuto il sito sarà online su
   `https://<tuo-utente>.github.io/cv/`.

In alternativa puoi trascinare la cartella su [netlify.com/drop](https://app.netlify.com/drop)
e ottenere un link immediato.

---

## 📁 Struttura

```
index.html          Struttura della pagina
css/style.css       Stile, città, pannelli, animazioni
js/content.js       ← I TUOI CONTENUTI (modifica qui)
js/city.js          Motore della città isometrica (SVG)
js/app.js           Logica: lingua, apertura sezioni
assets/             Foto e PDF del CV
```
