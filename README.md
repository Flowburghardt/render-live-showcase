# render-live-showcase

Statisches Deploy-Bundle für **render-live.brghrdt.dev** (internes PoC-Dashboard, Basic-Auth-geschützt, VDS Prime / Coolify). PoC-Ordner liegen flach im Root, das Dashboard `index.html` wird **dynamisch** aus `manifest.json` generiert.

> Internes Board nur für Florian („schau, was man bauen kann") — kein Pitch-Material, jederzeit rückbaubar. Auth via Traefik-Middleware `render-live-auth` (Coolify custom_labels, App-uuid `wzddxgw8mu5fl3k7zpn3vexd`).

## Architektur

- `index.template.html` — Shell + CSS (Controlled-Neon-Design). **Single Source des Designs.** CSS hier ändern, nie in der generierten `index.html`.
- `manifest.json` — `items[]` mit `{slug,title,stage,effort,desc,desc_html?,nightly,built?}`. Reihenfolge = Anzeige-Reihenfolge.
- `generate-dashboard.mjs` — rendert `index.html` (node, keine deps): ersetzt nur den Karten-Block zwischen `<!-- CARDS:START/END -->` + den `<!-- COUNT -->`-Platzhalter. Filtert Einträge ohne existierenden Ordner raus.
- `Dockerfile` — nginx:alpine, `COPY . /usr/share/nginx/html/`, **kein HEALTHCHECK** (Coolify managed das).
- `.dockerignore` — hält `*.mjs`, `manifest.json`, `index.template.html`, `README.md` aus dem öffentlich ausgelieferten Container.

`effort` → Badge: `quick`=günstig · `mid`=80 % · `award`=award.

## Dashboard neu generieren

```bash
node generate-dashboard.mjs        # index.html aus manifest.json + template
git add index.html manifest.json && git commit -m "dashboard: …" && git push
# Coolify deployt bei Push auto; sicherheitshalber explizit:
curl -X POST -H "Authorization: Bearer $(cat ~/.credentials/coolify-prime-token)" \
  "https://coolify.brghrdt.dev/api/v1/deploy?uuid=wzddxgw8mu5fl3k7zpn3vexd&force=true"
```

## Auto-Deploy (Nightly-Builder)

Der `nightly-poc-builder.sh` (auf Prime, Vault-SoT `14-Scripte/prime/`) pflegt nach grünem Build einen frischen PoC hier ein: kopiert `dist/` → `<slug>/`, **upsert** den Manifest-Eintrag by-slug (kuratierte Einträge werden NIE überschrieben), regeneriert, committet + pusht (SSH-Deploy-Key `id_ed25519_render_showcase`), triggert Coolify-Deploy, verifiziert.

**Single-Writer-Regel:** Nur Prime committet PoCs + `built`-Marker hier. `poc_built` im Vault-DESIGN.md schreibt ausschließlich Prime — der Mac fasst dieses Feld nie an (sonst vds-merge-Kollision).

## Rollback — einen PoC vom Dashboard nehmen

```bash
cd /root/render-live-showcase            # bzw. Mac-Klon
git rm -r <slug>/                        # PoC-Ordner raus
# manifest.json: den <slug>-Eintrag aus items[] löschen (z.B. via jq):
jq '.items |= map(select(.slug != "<slug>"))' manifest.json > m.tmp && mv m.tmp manifest.json
node generate-dashboard.mjs              # index.html neu (Karte verschwindet)
git add -A && git commit -m "rollback: <slug> vom Dashboard entfernt" && git push
curl -X POST -H "Authorization: Bearer $(cat ~/.credentials/coolify-prime-token)" \
  "https://coolify.brghrdt.dev/api/v1/deploy?uuid=wzddxgw8mu5fl3k7zpn3vexd&force=true"
```

## Basic-Auth zurücknehmen (Dashboard wieder public)

custom_labels der App auf das Coolify-Default-Set OHNE `render-live-auth`-Middleware patchen (PATCH `applications/wzddxgw8mu5fl3k7zpn3vexd`, base64), dann redeploy. Detail: `memory/feedback_coolify-prime-deploy-gotchas.md`.
