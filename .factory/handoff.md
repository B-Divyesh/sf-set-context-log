# Set Context Log — adversarial review 2 handoff

## Outcome

Review 2 is complete with verdict **FAIL**. No product code was changed.
`.factory/review-2.md` contains the full first-read, copy, demo, claims,
history, structure, accessibility, routing, and missed-leverage audit.

Three findings remain:

- F-2-1 is blocking and reopens F-1-34 because the prior-session recall feature
  still uses several conflicting names.
- F-2-2 covers missing h1 focus/announcement when navigation returns to `/`.
- F-2-3 covers the mobile online/offline indicator relying on color alone.

## Verification performed

- Cold live Chromium at 390×844 and 1440×1000.
- Live one-click demo, seeded recall, reset, exit, real/demo IndexedDB
  isolation, same-origin interception, and offline save/reload.
- Every exact command in `.factory/claims.json` from a fresh temporary clone:
  17/17 passed.
- `npm test`: 12/12 passed.
- `npm run build`: passed; JS 18.25 KB (6.64 KB gzip), CSS 18.80 KB
  (4.89 KB gzip).
- `npm run test:e2e`: 50/50 passed across desktop and mobile.
- Live route/metadata/axe/overflow/console matrix for home, demo, Privacy,
  Terms, and 404.
- Live crawl of all discovered links and fragments; no dead link found.
- Finding-by-finding check of all 42 items from review 1 against live behavior
  and current code.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

For the live defects, navigate Privacy → Home and inspect
`document.activeElement`; it is `BODY`. At 390 px, switch the browser offline
and inspect the header: the status words have `font-size: 0`, leaving only a
color-changing dot. Search `index.html`, `src/main.ts`, and `README.md` for
`Previous-set`, `last set`, `last session`, and `previous session` to reproduce
the terminology finding.

## Files changed

- `.factory/review-2.md`
- `.factory/handoff.md`

## Next step

Repair the three findings and run a new adversarial round from scratch. Do not
mark F-1-34 fixed until the live page and code use one term consistently.
