# Set Context Log — repair handoff

## Verification status: PASS locally; live deployment verification follows this repair

This repair addresses all three findings in the independent report for
candidate `80c50ed5b98f710b9534292c56f9ed50cad40b4c` without changing the
product's researched job, local-first storage, paid-unlock contract, or passed
flows.

### Repair delivered

- Added `public/staticwebapp.config.json`, which Vite copies to the root of
  `dist/` for the factory's Azure Static Web Apps deployment. HTML and `sw.js`
  use `public, max-age=0, must-revalidate`; only `/assets/*` uses
  `public, max-age=31536000, immutable`.
- Renamed the formerly unversioned hero to
  `panel-memory-c9dfb7b9.webp` (its SHA-256 prefix) before applying immutable
  caching. Vite's JS/CSS outputs already have content-versioned names.
- Maps `.webmanifest` to `application/manifest+json` through Azure Static Web
  Apps' `mimeTypes` configuration (route-header overrides do not replace Azure's
  inferred MIME type on the live service).
- Added a restrictive same-origin CSP, an explicit permissions policy,
  `X-Frame-Options: DENY`, `nosniff`, referrer policy, and cross-domain-policy
  protection. The only external CSP connection allowances are the documented
  production and pilot Sociobot license-verification APIs.

### Regression coverage and local evidence (2026-08-28)

- `npm ci`: pass; 0 known vulnerabilities.
- `npm test`: pass, 7/7 tests. `tests/deployment-config.test.ts` asserts the
  exact cache, manifest MIME, CSP, permissions, and anti-framing rules.
- `npm run build`: pass. The build now runs
  `scripts/verify-deployment-config.mjs`, which verifies the emitted
  `dist/staticwebapp.config.json`, short document/service-worker cache policy,
  immutable asset policy, manifest MIME type, and that every immutable asset
  is content-versioned (including the hero).
- `npm run test:e2e`: pass, 12/12 Chromium tests across 1440×1000 desktop and
  Pixel 5 mobile. Coverage includes logging/persistence/export,
  import/recall, keyboard Space/Enter marker and submit behavior, axe serious/
  critical scan, offline reload, and the service-worker update message.
- Azure Static Web Apps CLI served the built `dist/` and returned exact headers:
  JS and hero `Cache-Control: public, max-age=31536000, immutable`; manifest
  `Content-Type: application/manifest+json`; HTML and `sw.js`
  `public, max-age=0, must-revalidate`; CSP, permissions policy, and
  `X-Frame-Options: DENY` on all responses.
- Factory `verify-url.sh` against that emulator: HTTP 200, title/lang/one h1/
  main/alt/button-label checks passed, and no console or page errors at desktop
  or 390 px mobile.
- Browser request smoke at 1440×1000 and 390×844: no horizontal overflow, no
  console errors, and only first-party runtime requests before any optional
  license is supplied.
- Lighthouse 12.8.2 mobile emulator run: Performance **100**, Accessibility
  **100**, Best Practices **100**, SEO **100**; FCP **1.2 s**, LCP **1.6 s**,
  TBT **40 ms**, CLS **0.002**. Initial JS is 16,621 B (6.41 kB gzip), CSS is
  18,303 B (4.86 kB gzip), and the hero is 51,234 B.

The original independent failure report remains at
[`.factory/verification.md`](verification.md). Generated local evidence stays
ignored in `.factory/evidence/`.

---

# Original build handoff

## Delivered

Set Context Log v1 is a complete static, installable, local-first PWA for the
brief's decision-memory job. A lifter can choose or create an exercise, see the
most recent earlier session for that exercise, enter weight/reps/RPE with a
per-set kg/lb unit, add one or more one-tap context markers plus a short note,
and immediately see the saved set in today's session and history.

Data is stored in IndexedDB with a localStorage fallback. Refresh, tab close,
install, and offline use retain state. JSON export/import and CSV export are
available to every user. Imports validate the `set-context-log/v1` schema,
merge by set ID, and never overwrite existing entries. Destructive removal is
confirmed with the exact set or record count.

The $9 one-time paid tier uses only the Sociobot billing contract. It unlocks
the full local archive, archive search, and the context-rate readout. Logging,
prior-session recall, export/import, accessibility, and safety behavior remain
free. Return licenses are stored under `sb_license:set-context-log`, removed
from the URL, verified at most daily, cached for offline use, and can be
restored by pasting a token. The build-time `VITE_BILLING_API_BASE` supports the
factory's pilot endpoint without hardcoding product IDs.

The custom mid-century instrument-panel system is documented in
`.factory/design.md`. The original generated hero source and exact prompt are
kept in `assets/src/`; the shipped 1080×720 WebP is 51,234 bytes. Hand-authored
SVG/PNG install icons, matching splash colors, `/privacy/`, `/terms/`, an
offline fallback, robots file, and sitemap are included. There are no runtime
CDNs, fonts, analytics, ads, or third-party scripts.

## Run and deploy

```sh
npm install
npm test
npm run build
npm run test:e2e
```

The exact deploy command is `npm run build`. It type-checks, creates the Vite
production bundle, and generates a content-versioned service worker. Deploy
`./dist`; `./dist/index.html` is at the root.

## Verification (2026-08-27, local production preview)

- `npm test`: 6/6 unit tests passed (validation, prior-session recall, context
  rate, CSV escaping/unit preservation, and JSON import validation).
- `npm run test:e2e`: 4/4 Playwright 1.58.2 mobile tests passed: log and refresh
  persistence, JSON import and automatic recall, axe accessibility scan, and
  explicit offline reload via `context.setOffline(true)`.
- Axe: zero serious or critical violations, including color contrast.
- Factory `verify-url.sh`: HTTP 200; title and `lang` present; exactly one h1;
  main landmark present; 0 images missing alt; 0 unlabeled buttons; 0 console
  or page errors.
- Lighthouse 12.8.2 mobile: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**.
- Lighthouse metrics: LCP **1.4 s**, CLS **0.002**, total blocking time **0 ms**,
  Speed Index **0.9 s**.
- Responsive browser check: 390×844 and 1440×1000, no horizontal overflow and
  no console errors.
- Production assets: initial JS 16,621 bytes (6.41 KB gzip), CSS 18,303 bytes
  (4.86 KB gzip), hero WebP 51,234 bytes; no webfonts. These are comfortably
  inside the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.
- `npm audit`: 0 known vulnerabilities after pinning Vite 7.3.6 and Vitest
  3.2.7.

Local Lighthouse and screenshot evidence was generated under the ignored
`.factory/evidence/` directory; it is intentionally not part of the deploy.

## Known gaps and next steps

- A real purchase/return was not executed because factory-side product
  registration and a test license are outside this repository. Checkout,
  return-token capture, restore, daily verification, revoked/invalid handling,
  and offline cached access are implemented against the documented endpoint.
- Sessions are grouped by the device's local calendar day. Two separate
  workouts of the same exercise on one day are treated as one session; a later
  version could add an explicit “Finish session” control if pilot behavior
  shows this matters.
- Data intentionally has no cloud sync or automatic backup. Users must export
  before clearing browser/site data or moving devices.
- The app makes no medical claims and does not integrate wearables, workout
  programming, social features, or nutrition, matching the stated non-goals.

Recommended next step: register the `set-context-log` test product, build with
`VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1`, and perform the
documented test-card checkout before production release.
