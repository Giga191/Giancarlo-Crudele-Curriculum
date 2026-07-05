// Screenshot headless della città 3D (Brave + puppeteer-core)
// uso: node shot.mjs <output.png> [evalJS] [url]
import puppeteer from "puppeteer-core";

const out = process.argv[2] || "shot.png";
const evalJs = process.argv[3];
const url = process.argv[4] || "http://localhost:5500/3d/";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  headless: true,
  args: ["--no-first-run", "--disable-extensions", "--hide-scrollbars", "--mute-audio"]
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const errors = [];
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });

await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
// aspetta che il loader sparisca (modelli caricati) o al massimo 15s; pagine senza loader passano subito
await page.waitForFunction(() => { const l = document.querySelector("#loader"); return !l || l.classList.contains("hidden"); }, { timeout: 15000 }).catch(() => errors.push("TIMEOUT: loader ancora visibile"));
await new Promise(r => setTimeout(r, 1200)); // qualche frame di rendering

if (evalJs) {
  console.log("EVAL:", JSON.stringify(await page.evaluate(evalJs)));
  await new Promise(r => setTimeout(r, 800)); // lascia assestare camera/animazioni
}
await page.screenshot({ path: out });
console.log("SHOT:", out);
console.log(errors.length ? errors.join("\n") : "NO-ERRORS");
await browser.close();
