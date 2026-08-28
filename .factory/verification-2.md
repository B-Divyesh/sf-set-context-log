# Independent verification 2 — Set Context Log

## Verdict: PASS

Verified on 2026-08-28 against candidate commit
`7732dc4b265a546816f6b0429b15d3d2f5331bda` and the live production URL
<https://set-context-log.sociobot.in>. This is a fresh verification report;
the earlier report remains at `.factory/verification.md`.

## Candidate and deployment identity

- The checkout was clean at the requested commit before verification.
- Fresh `npm ci` completed with **0 vulnerabilities**.
- Byte-for-byte SHA-256 comparisons matched local `dist/` to production for
  `index.html`, the JS, CSS, hero WebP, `sw.js`, manifest, offline fallback,
  privacy page, and terms page. Production references the exact candidate
  assets: `index-BtRBVWcN.js`, `style-55qrQLO2.css`, and
  `panel-memory-c9dfb7b9.webp`.

## Automated quality gates

- `npm test`: **7/7 passed** (domain and deployment-policy coverage).
- `npm run build`: passed; includes TypeScript `--noEmit`, Vite production
  build, service-worker generation, and emitted deployment-config validation.
- `npm run test:e2e`: **12/12 passed** across 1440×1000 Chromium and the
  mobile project. It covers persistence/recall/export, keyboard marker and
  submit behavior, import, axe, offline reload, and update notification.
- No lint script is present in `package.json`; TypeScript checking is part of
  the required build.
- Fresh mobile Lighthouse against the production build: Performance **96**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP **2.0 s**,
  LCP **2.0 s**, TBT **150 ms**, CLS **0.002**.
- Build payloads: initial JS **16,621 B** (6.41 kB gzip), CSS **18,303 B**
  (4.86 kB gzip), no webfonts, and hero WebP **51,234 B**. All applicable
  static-PWA budgets pass.

## Independent functional and UX evidence

- At exact **390×844**, logged a `5000 lb × 999` set at RPE 10 with Grip and
  Pause markers plus a note; it persisted and CSV export preserved the lb
  unit and marker list. This confirms units are per-entry, not converted.
- Invalid/recovery cases gave the correct actionable error and recovery focus:
  blank exercise, `5000.25` weight, fractional reps, quarter-point RPE, and
  malformed JSON import. Settings changed the default unit without rewriting
  the saved entry. Set deletion opened a named confirmation and cancel kept
  the data.
- Exact 390px and desktop checks found no horizontal overflow or console/page
  errors. Keyboard Tab exposed the skip link and its 3px focus ring; Settings
  opened with focus on its close control and Escape returned focus to Settings.
  Existing keyboard tests also exercised Space on a context marker and Enter
  to submit.
- `prefers-reduced-motion: reduce` matched and reduces transitions/animations
  to 0.01 ms.
- A fresh live axe scan at 390px found **0 serious/critical** violations.
- Production service worker reached a controller, retained the app shell on a
  forced offline reload, and displayed `Offline · sets still save`. A separate
  controlled old-version/then-current-version service-worker exercise produced
  the real in-app `A fresh version is ready.` update toast.

## Privacy, requests, and response policy

- Fresh anonymous live browser traffic used only
  `https://set-context-log.sociobot.in`; no analytics, ads, remote fonts, or
  third-party runtime requests were observed. Source review finds the optional
  Sociobot license verifier is the only product-initiated cross-origin request,
  and only when a license is stored.
- Live HTML, service worker, legal pages, JS/CSS/image, and manifest have the
  expected restrictive CSP, permissions policy, `X-Frame-Options: DENY`,
  `nosniff`, and strict-origin referrer policy. The manifest is served as
  `application/manifest+json`.
- Documents and `sw.js` use `Cache-Control: public, max-age=0,
  must-revalidate`; content-addressed assets use `public, max-age=31536000,
  immutable`; the manifest uses one-day revalidating cache. The deployed
  behavior therefore resolves the prior deployment-only cache/MIME failure.

## Defects

| Severity | Findings |
| --- | --- |
| Critical | None observed. |
| High | None observed. |
| Medium | None observed. |
| Low | None observed. |

## Scope note

No real paid checkout was attempted: it requires an externally registered test
product/license and is outside this candidate's deployed anonymous flow. The
free core job, local storage, export/import, recall, offline behavior, and the
documented license request boundary were verified.
