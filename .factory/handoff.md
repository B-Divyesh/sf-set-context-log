# Set Context Log — adversarial review 1 handoff

## Outcome

Review verdict: **FAIL**. No product code was modified. The full report is in
`.factory/review-1.md`.

Blocking results:

- the cold first screen does not name the intended user or expose a primary
  try action;
- no sample demo exists;
- `/demo` and `/?demo=1` read and write the real IndexedDB namespace;
- `.factory/claims.json` and all `@claim:` tests are absent;
- `Buy full archive` returns HTTP 404; and
- arbitrary paths render the home app with HTTP 200 instead of a designed 404.

The report also records every landing/README sentence with a word count,
unlisted claims, copy rewrites, metadata/header/footer gaps, and the missing
same-day session boundary.

## Verification performed

From a clean clone of
`9b1a0474382106328aee88fc177dda2192d1fb73`:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results: 0 known vulnerabilities, 7/7 unit tests, successful `dist/` build,
and 12/12 Playwright tests. These are untagged quality tests, not claim tests.

Live checks used fresh Chromium contexts at 390×844 and 1440×1000. They
covered cold first screens, direct demo URLs, cross-route IndexedDB behavior,
offline reload, request-origin interception, metadata/routes, link status,
keyboard/dialog focus, and axe. Axe returned zero violations at both
viewports; anonymous log/offline traffic was first-party only. The factory
URL verifier also passed with no console/page errors.

Earlier verification findings for cache policy, manifest MIME, and security
headers remain fixed in source and production. Temporary screenshots and raw
browser evidence were kept under `/tmp/set-context-review-evidence` and were
not committed.

## Work left

Implement and test every finding in `.factory/review-1.md`, then run a complete
adversarial review again rather than a diff-only check. The highest-priority
work is the isolated seeded demo, claims registry/tests, working or removed
checkout, clear first-screen action, and real 404 routing.
