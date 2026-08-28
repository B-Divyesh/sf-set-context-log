# Verification — Set Context Log

**Result: FAIL — deployment acceptance**

Verified on 2026-08-28 against candidate commit
`80c50ed5b98f710b9534292c56f9ed50cad40b4c` and
`https://set-context-log.sociobot.in`.

The product code and the deployed artifact match, and the core product is
working. The release fails the supplied PWA performance/caching contract
because the production server does not apply long-lived immutable caching to
hashed assets. The server also sends the manifest with a generic binary MIME
type. These are deployment configuration issues, not a source-artifact
mismatch.

## Candidate and deployment identity

- Clean checkout started at `80c50ed5b98f710b9534292c56f9ed50cad40b4c` with no
  pre-existing working-tree changes.
- `npm ci` completed with 0 vulnerabilities.
- SHA-256 comparisons of local `dist/` and production were identical for
  `index.html`, `manifest.webmanifest`, `sw.js`, the hashed JS and CSS, hero
  WebP, `offline.html`, and both legal pages.
- The deployed HTML references `assets/index-BtRBVWcN.js` and
  `assets/style-55qrQLO2.css`, exactly as produced by this candidate build.

## Local quality gates

- `npm test`: PASS — 6/6 Vitest unit tests.
- `npm run build`: PASS — TypeScript `--noEmit`, Vite build, and generated
  service worker all succeeded. There is no separate lint script in
  `package.json`.
- `npm run test:e2e`: PASS — 4/4 Playwright 1.58.2 mobile tests, including
  logging/persistence, import/recall, axe, and an offline reload.
- Build budgets: JS 16,621 B (6.41 kB gzip), CSS 18,303 B (4.86 kB gzip), hero
  WebP 51,234 B, no downloaded webfonts. All are within the supplied
  200 kB/50 kB/300 kB budgets.

## Independent browser/product checks

Fresh Chromium sessions against production passed the following:

- Normal flow: logged a Back squat set with weight, reps, RPE, keyboard-toggled
  `Form` marker, and note; it survived a reload in IndexedDB.
- Boundary and recovery: accepted 0 kg, 1 rep, RPE 10 and 5,000 lb, 999 reps,
  RPE 1; rejected blank exercise, 5,000.1 weight, and 8.25 RPE with specific
  recovery messages and focus on the invalid field.
- JSON: invalid JSON produced a useful error; a valid `set-context-log/v1`
  backup imported, set the default unit to lb, and recalled the earlier Bench
  press session (including `Pause` and note). JSON export was portable and CSV
  contained the documented header and note.
- Privacy/data: no account or analytics request occurred. Initial runtime
  requests were first-party only; the only designed external request is license
  verification when a license exists. A mocked returned license was saved,
  stripped from the URL, verified once, and unlocked the archive. Per-set
  kg/lb history remained unconverted.
- PWA: production service worker was active and controlling the page. After
  `context.setOffline(true)`, a reload rendered the application shell and
  `Offline · sets still save`. The update-message path revealed the in-app
  reload toast.
- Accessibility: one `h1`, language, title, main landmark, meaningful hero
  alt, skip link, visible 3 px focus outline, keyboard checkbox activation,
  no 390 px horizontal overflow, and all checked visible controls at least
  44×44 px. Axe reported 0 serious or critical violations.
- Motion/layout: desktop 1440 px and mobile 390 px had no horizontal overflow;
  reduced-motion changed set animation duration to `0.01ms`.
- Browser health: no console errors or page errors during the independent
  normal, invalid, persistence, import/export, offline, or license-path tests.
- Lighthouse 12.8.2, mobile production run: Performance 100, Accessibility
  100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, Speed Index 1.1 s,
  TBT 0 ms, CLS 0.002. INP is not measured in a synthetic no-interaction
  Lighthouse run.

## Defects

### P1 — required immutable caching absent on production static assets

The deployed hashed JS, CSS, and hero asset all return:

```
Cache-Control: public, must-revalidate, max-age=30
```

Observed on `/assets/index-BtRBVWcN.js`, `/assets/style-55qrQLO2.css`, and
`/assets/panel-memory.webp` on 2026-08-28. The PWA acceptance contract
requires long-lived immutable caching for hashed assets. A service worker does
precache the shell once installed, but first visits and cache expiry still
revalidate these immutable resources every 30 seconds. Configure the static
host to return, for example, `public, max-age=31536000, immutable` for hashed
assets (and retain short revalidation for HTML and `sw.js`).

### P2 — manifest has an incorrect generic MIME type

`/manifest.webmanifest` returns `Content-Type: application/octet-stream`.
Serve it as `application/manifest+json` (or an accepted JSON manifest MIME)
to meet the web-app-manifest response contract reliably across browsers.
Chromium accepted this deployment during the smoke test, so this is not a
current functional failure.

### P3 — missing defense-in-depth response policies

The production HTML response has HSTS, `nosniff`, and a referrer policy, but
no `Content-Security-Policy`, `Permissions-Policy`, or frame-ancestors/X-Frame
policy. This did not expose a product-flow failure and is recorded as a
hardening recommendation. A restrictive same-origin CSP is appropriate for
this static local-first app, with the Sociobot API explicitly allowed only for
license verification.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
curl -sSI https://set-context-log.sociobot.in/assets/index-BtRBVWcN.js
curl -sSI https://set-context-log.sociobot.in/manifest.webmanifest
```

For a Lighthouse run in this container, use the Playwright Chromium binary:

```sh
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome \
  npx --yes lighthouse@12.8.2 https://set-context-log.sociobot.in \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage --disable-gpu'
```
