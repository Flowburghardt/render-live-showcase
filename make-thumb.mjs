#!/usr/bin/env node
// =============================================================================
// make-thumb.mjs — erzeugt thumbs/<slug>.png aus einem gebauten PoC-Ordner
// =============================================================================
// Best-effort Thumbnail-Screenshot für Nightly-PoCs. Startet einen lokalen
// stdlib-HTTP-Server über das statische dist, lädt es headless, ERZWINGT den
// Reveal-Endzustand (freeze: Animationen aus, opacity:1/transform:none, GSAP→
// progress(1), Lenis stop — sonst ist ein Hero-Reveal-PoC beim Shot schwarz),
// und schiesst einen 16:10-Viewport-Shot.
//
// Leer-Erkennung über PNG-Bytegröße: ein einfarbig/schwarzes 1280×800-PNG
// komprimiert auf wenige KB. Liegt der Shot unter MIN_BYTES, wird er NICHT
// gespeichert (Exit 3) → der Generator-Fallback (CSS-Cover) greift. So wird
// nie ein schwarzes Thumbnail deployed.
//
// Puppeteer ist optional: fehlt es (z.B. auf einem Host ohne Chromium), Exit 4
// (skip) — der Build läuft weiter, der Fallback greift. KEINE harte Abhängigkeit.
//
// Aufruf:
//   node make-thumb.mjs --slug poc-anniel --dir /pfad/zum/dist [--out thumbs/poc-anniel.png]
// Exit: 0 = Thumb geschrieben · 3 = zu leer (kein Write) · 4 = kein Puppeteer · 1 = Fehler
// =============================================================================
import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
const slug = args.slug;
const dir = args.dir;
const out = args.out || join(__dirname, 'thumbs', `${slug}.png`);
const MIN_BYTES = Number(args.min || 9000); // unter ~9 KB ist der Shot fast sicher einfarbig/leer

if (!slug || !dir) { console.error('FATAL: --slug und --dir nötig'); process.exit(1); }
if (!existsSync(dir)) { console.error(`FATAL: dir fehlt (${dir})`); process.exit(1); }

// --- Puppeteer optional auflösen (lokal Mac: wcheck; Prime: global/env) ---
async function loadPuppeteer() {
  const candidates = [
    process.env.RL_PUPPETEER,
    'puppeteer',
    '/Users/florianburghardt/.claude/tools/wcheck/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js',
    '/root/.npm-global/lib/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js',
  ].filter(Boolean);
  for (const c of candidates) {
    try { const m = await import(c); return m.default || m; } catch (_) { /* next */ }
  }
  return null;
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary', '.mp4': 'video/mp4' };

// FREEZE-Snippet (synchron mit design-extract scripts/freeze-reveals.js gehalten)
const FREEZE = `() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-play-state:paused!important;transition:none!important;opacity:1!important;visibility:visible!important;transform:none!important;clip-path:none!important;-webkit-clip-path:none!important;filter:none!important}';
  document.head.appendChild(s);
  try { if (window.gsap?.globalTimeline) window.gsap.globalTimeline.progress(1);
        if (window.ScrollTrigger?.getAll) window.ScrollTrigger.getAll().forEach(t=>{try{t.progress(1)}catch(e){}}); } catch(e){}
  try { if (window.lenis?.stop) window.lenis.stop(); } catch(e){}
  document.querySelectorAll('[style*="opacity"],[style*="visibility"],[style*="transform"],[style*="clip"]').forEach(el=>{
    el.style.setProperty('opacity','1','important'); el.style.setProperty('visibility','visible','important'); el.style.setProperty('transform','none','important');
  });
  return true;
}`;

async function main() {
  const puppeteer = await loadPuppeteer();
  if (!puppeteer) { console.error('SKIP: Puppeteer nicht gefunden → Fallback-Cover greift.'); process.exit(4); }

  // stdlib static server
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/' || p.endsWith('/')) p += 'index.html';
      const fp = normalize(join(dir, p));
      if (!fp.startsWith(normalize(dir))) { res.writeHead(403); return res.end(); }
      const buf = await readFile(fp);
      res.writeHead(200, { 'Content-Type': MIME[extname(fp).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  let browser, code = 1;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    // Lazy-/Reveal-Trigger: einmal durchscrollen, dann freeze, dann hoch
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 800));
    });
    await page.evaluate(FREEZE);
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 600));
    const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1280, height: 800 } });

    if (buf.length < MIN_BYTES) {
      console.error(`SKIP: Shot ${buf.length} B < ${MIN_BYTES} B (leer/einfarbig) → Fallback-Cover.`);
      code = 3;
    } else {
      await writeFile(out, buf);
      const sz = (await stat(out)).size;
      console.log(`thumb geschrieben: ${out} (${sz} B)`);
      code = 0;
    }
  } catch (e) {
    console.error(`FEHLER beim Screenshot: ${e.message} → Fallback-Cover.`);
    code = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  process.exit(code);
}
main();
