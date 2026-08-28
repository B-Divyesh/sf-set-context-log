# Set Context Log — polish 1 handoff

## Outcome

Perfection-loop round 1 is complete. Every finding in `.factory/review-1.md`
is resolved. No earlier review or polish file exists; the two earlier
verification reports were also rechecked. The product remains a static,
local-first PWA with its mid-century training-instrument visual system.

The broken paid offer was removed because the billing product is not enabled.
The full archive, search, context percentage, logging, recall, import, and
export are now free.

## What changed

- Rewrote the first screen around the lifting job and added the one-click
  `/?demo=1` action.
- Added `/demo` with six realistic sets, a persistent banner, reset/exit
  controls, and a separate `demo:set-context-log` database plus `demo:`
  localStorage fallback.
- Added explicit session IDs and **Finish session**, including separate
  same-day workouts and immediate previous-session recall.
- Added `.factory/claims.json` with 17 claims and exactly one tagged browser
  test for each claim.
- Added real static route output, route-specific titles/canonicals/social
  metadata, a 1200×630 share image, a 180px touch icon, shared legal chrome,
  focus transfer, and a designed HTTP 404.
- Rewrote product, runtime, README, privacy, and terms copy. Removed the dead
  billing code and all unavailable purchase claims.
- Added the required catalog sentence, demo documentation, copy audit, and
  finding-by-finding report in `.factory/polish-1.md`.

## Verification

Clean clone of commit `07b2cab`:

- `npm ci`: 59 packages installed; 0 vulnerabilities.
- `npm test`: 12/12 passed.
- `npm run build`: passed; `dist/index.html`, `dist/demo/index.html`, designed
  404, and versioned `dist/sw.js` emitted.
- Every command in `.factory/claims.json`: 17/17 passed individually.
- `npm run test:e2e`: 50/50 passed across desktop and Pixel 5 projects.
- Build payload: JS 18.15 KB (6.59 KB gzip), CSS 18.63 KB (4.85 KB gzip), hero
  WebP 51.2 KB. No downloaded fonts.
- Local cold-browser matrix: six routes/viewports, zero axe violations, zero
  unexpected console errors, one h1 and one main each, and zero horizontal
  overflow. See `.factory/evidence/polish-1/local-browser.json`.
- Live Lighthouse mobile: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 180 ms, CLS 0.062.

Production deployment completed through
`/opt/fleet/lib/deploy-static.sh set-context-log dist` with deployment ID
`e257d37e-ec09-4bbb-909b-b207d0cf5b89`.

Cold production checks on 2026-08-28:

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 with their own titles,
  canonicals, one h1, one main, zero axe violations, and no console errors.
- `/not-a-real-route-polish-1` returns HTTP 404 with the designed page.
- `/?demo=1` seeded six rows; real data stayed hidden; reset restored the seed;
  **Start for real** returned to the unchanged real record.
- Offline reload worked, a new set saved offline, and it survived another
  offline reload.
- Anonymous demo traffic remained on
  `https://set-context-log.sociobot.in`.
- Manifest MIME, immutable hashed-asset caching, CSP, permissions policy,
  framing, nosniff, and referrer headers are live.
- Root and demo passed the supplied `verify-url.sh` with no console errors.

Evidence is under `.factory/evidence/polish-1/`. The complete clean-clone log
is `clean-clone-tests.txt`; live browser and HTTP results are
`live-browser.json` and `live-http.txt`. Lighthouse evidence is
`lighthouse-live-summary.json`.

## Run it

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

## Known gaps

None found in the requested scope.
