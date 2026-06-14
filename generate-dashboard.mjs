#!/usr/bin/env node
// =============================================================================
// generate-dashboard.mjs — rendert index.html aus manifest.json + Template
// =============================================================================
// Liest index.template.html (Shell + CSS, physisch unverändert) und ersetzt NUR
// den Karten-Block zwischen <!-- CARDS:START --> / <!-- CARDS:END --> sowie den
// <!-- COUNT -->-Platzhalter. CSS wird NIE generiert → kein Design-Drift.
//
// Filtert Einträge raus, deren PoC-Ordner (noch) nicht existiert (Build-Gate-
// Sicherheit: keine toten Karten). Node-Stdlib only, keine deps.
//
// Aufruf:  node generate-dashboard.mjs
// Verify:  diff <(git show HEAD:index.html) index.html   # nur Karten-Block ändert sich
// =============================================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(__dirname, 'index.template.html');
const MANIFEST = join(__dirname, 'manifest.json');
const OUT = join(__dirname, 'index.html');

const EFFORT = {
  quick: { cls: 'b-guenstig', label: 'günstig' },
  mid:   { cls: 'b-80',       label: '80 %' },
  award: { cls: 'b-award',    label: 'award' },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function card(it) {
  const eff = EFFORT[it.effort] || EFFORT.mid;
  const title = esc(it.title);
  const stage = esc(it.stage || '');
  const desc = it.desc_html ? it.desc : esc(it.desc || '');
  let nightly = '';
  if (it.nightly && it.built) {
    const [, m, d] = it.built.split('-');
    nightly = ` · <span style="color:var(--muted)">auto-built ${d}.${m}</span>`;
  }
  return `    <a class="card" href="${it.slug}/" target="_blank" rel="noopener">
      <div class="thumb" style="background-image:url(thumbs/${it.slug}.png)"></div>
      <div class="body">
        <div class="row"><span class="stage">${stage}</span><span class="badge ${eff.cls}">${eff.label}</span></div>
        <div class="name">${title}</div>
        <p class="desc">${desc}</p>
        <span class="go">→ live ansehen${nightly}</span>
      </div>
    </a>`;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const items = (manifest.items || []).filter((it) => {
  const ok = existsSync(join(__dirname, it.slug));
  if (!ok) console.warn(`[skip] Ordner fehlt für slug "${it.slug}" — Karte ausgelassen.`);
  return ok;
});

const cards = items.map(card).join('\n');
const nightlyCount = items.filter((it) => it.nightly).length;
const countTxt = `${items.length} PoC${items.length === 1 ? '' : 's'}` +
  (nightlyCount ? ` · ${nightlyCount} auto-built` : '');

let html = readFileSync(TEMPLATE, 'utf8');
const startRe = /<!-- CARDS:START[^>]*-->/;
const endRe = /<!-- CARDS:END -->/;
const sIdx = html.search(startRe);
const eIdx = html.search(endRe);
if (sIdx === -1 || eIdx === -1) {
  console.error('FATAL: CARDS-Marker im Template nicht gefunden.');
  process.exit(1);
}
const startMarker = html.match(startRe)[0];
html = html.slice(0, sIdx) + startMarker + '\n' + cards + '\n    ' + html.slice(eIdx);
html = html.replace('<!-- COUNT -->', countTxt);

writeFileSync(OUT, html);
console.log(`index.html generiert: ${items.length} Karten (${nightlyCount} nightly).`);
