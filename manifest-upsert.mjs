#!/usr/bin/env node
// =============================================================================
// manifest-upsert.mjs — fügt/aktualisiert einen Nightly-PoC im manifest.json
// =============================================================================
// Upsert BY SLUG. Kuratierte Einträge (nightly:false) werden NIE überschrieben
// (Schutz gegen versehentliches Platten der 6 Stamm-PoCs durch den Builder).
// Atomar genug für den sequentiellen Nightly-Lauf (max 2 PoCs/Nacht): liest,
// modifiziert, schreibt das ganze File — kein Teil-Write.
//
// Aufruf:
//   node manifest-upsert.mjs --slug poc-anniel --title "Anniel" \
//     --effort mid --desc "Hero-Reveal + …" --built 2026-06-14 [--stage Nightly]
// Exit 0 = upserted, Exit 2 = slug ist kuratiert (kein Write), Exit 1 = Fehler.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(__dirname, 'manifest.json');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  args[k] = process.argv[i + 1];
}
for (const req of ['slug', 'title', 'effort', 'desc', 'built']) {
  if (!args[req]) { console.error(`FATAL: --${req} fehlt`); process.exit(1); }
}
if (!['quick', 'mid', 'award'].includes(args.effort)) {
  console.error(`FATAL: effort "${args.effort}" ungültig (quick|mid|award)`); process.exit(1);
}

const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));
m.items = m.items || [];
const existing = m.items.find((it) => it.slug === args.slug);
if (existing && existing.nightly === false) {
  console.error(`SKIP: slug "${args.slug}" ist kuratiert (nightly:false) — nicht überschrieben.`);
  process.exit(2);
}

const entry = {
  slug: args.slug,
  title: args.title,
  stage: args.stage || 'Nightly',
  effort: args.effort,
  desc: args.desc,
  nightly: true,
  built: args.built,
};

if (existing) {
  Object.assign(existing, entry);
  console.log(`updated: ${args.slug}`);
} else {
  m.items.push(entry);
  console.log(`added: ${args.slug}`);
}
writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n');
