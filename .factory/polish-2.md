# Polish 2 — Set Context Log

**Result: PASS — 45/45 cumulative findings resolved.**

Product repair commit: `b0996d622d018ab79ddb2047a25655fbf64337ed`.
It was built from a clean clone and deployed to
<https://set-context-log.sociobot.in>. Evidence is under
`.factory/evidence/polish-2/`; live screenshots are
`live-home-mobile.png`, `live-demo-mobile.png`, and `live-404-mobile.png`.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the job-first headline, named self-directed lifters, and retained the first-screen sample action. | Live `/`; `home/screenshot-mobile.png`; browser first-screen test. |
| F-1-2 | Kept direct `?demo=1` and `/demo` entry, seeded sessions, banner, reset, exit, title, and sitemap route. | `@claim:demo-isolation`; live `/?demo=1`; `live-demo-mobile.png`. |
| F-1-3 | Kept demo data in the `demo:set-context-log` namespace, separate from real data. | `@claim:demo-isolation`; `@claim:local-storage`; live demo reset check. |
| F-1-4 | Kept the claim registry and one uniquely tagged test per claim. | `claims-manifest.test.ts`; clean-clone 17/17 claim commands. |
| F-1-5 | Kept the unavailable purchase path removed; the complete product is free. | `@claim:free-use`; live `/`. |
| F-1-6 | Kept the styled 404 route and Azure response override. | `@claim:deployment-policy`; live unknown route HTTP 404; `live-404-mobile.png`. |
| F-1-7 | Recall continues to show the most recent completed session before entry. | `@claim:last-session-recall`; live `/?demo=1`. |
| F-1-8 | Six context markers and all saved fields remain available. | `@claim:set-fields`; live demo. |
| F-1-9 | Local storage, separate demo storage, erase, and same-origin use remain tested. | `@claim:local-storage`; `@claim:anonymous-runtime`. |
| F-1-10 | JSON backup export remains complete and schema-tested. | `@claim:json-export`. |
| F-1-11 | CSV export remains complete with units, markers, and escaped notes. | `@claim:csv-export`. |
| F-1-12 | JSON import still merges new IDs without replacing existing records. | `@claim:json-import-merge`. |
| F-1-13 | Default-unit changes still preserve saved per-entry units. | `@claim:unit-preservation`. |
| F-1-14 | History remains grouped by explicit session. | `@claim:session-history`. |
| F-1-15 | Offline demo reload and saving remain covered. | `@claim:offline-reload`; full browser suite. |
| F-1-16 | The complete feature set remains free without an account or license. | `@claim:free-use`; live `/`. |
| F-1-17 | No-account and no-third-party-runtime boundary remains enforced. | `@claim:anonymous-runtime`; cold live request checks. |
| F-1-18 | Removed unavailable license verification and the related claim. | `claims-manifest.test.ts`; source scan. |
| F-1-19 | Removed unavailable merchant and checkout copy. | `@claim:free-use`; live `/`. |
| F-1-20 | Original-art provenance remains documented and verified. | `@claim:art-provenance`; `.factory/design.md`. |
| F-1-21 | Removed unsupported Node-version marketing claim. | `claims-manifest.test.ts`. |
| F-1-22 | Removed unsupported development-worker marketing claim. | `claims-manifest.test.ts`. |
| F-1-23 | Build still type-checks and emits the app, demo route, and versioned worker. | `@claim:build-output`; clean-clone build. |
| F-1-24 | README continues to point to exact claim commands. | `claims-manifest.test.ts`; README. |
| F-1-25 | No billing or model credentials/integration remain in the static product. | `claims-manifest.test.ts`; source scan. |
| F-1-26 | Deployment security and cache policy remain tested. | `@claim:deployment-policy`; live response headers. |
| F-1-27 | Privacy and Terms remain real shared-layout routes. | `@claim:site-routes`; live `/privacy/` and `/terms/`. |
| F-1-28 | Canonical, social metadata, and icons remain emitted for real routes. | `@claim:site-routes`; `home/verify.json`. |
| F-1-29 | Legal pages retain shared navigation, skip link, footer, and reciprocal links. | `@claim:site-routes`; `privacy/screenshot-mobile.png`. |
| F-1-30 | Root footer retains legal links, factory attribution, generated-art note, and build label. | `@claim:site-routes`; live `/`. |
| F-1-31 | The Choose → Mark → Review sequence remains adjacent to the working log. | Live `/`; `home/screenshot-mobile.png`. |
| F-1-32 | The single h1 remains “Log what changed each lifting set.” | `@claim:site-routes`; `home/verify.json`. |
| F-1-33 | Literal task headings remain in place. | `.factory/copy-audit.md`; live `/`. |
| F-1-34 | Repaired the partly-fixed terminology: every visitor-facing recall reference now says **last-session context**. | Copy regression test; `@claim:last-session-recall`; live `/?demo=1`. |
| F-1-35 | The recall outcome is now concrete and uses the single recall term. | `.factory/copy-audit.md`; live `/`. |
| F-1-36 | JSON-backup language and plain privacy copy remain in place. | `@claim:json-export`; README. |
| F-1-37 | Controls continue to name their result. | `claims-manifest.test.ts`; full browser suite. |
| F-1-38 | README remains job-first and confines technical names to technical sections. | `.factory/copy-audit.md`; README. |
| F-1-39 | No unmeasured speed claim is present. | Copy regression test; source scan. |
| F-1-40 | Copy audit confirms no shipped sentence exceeds 22 words. | `.factory/copy-audit.md`. |
| F-1-41 | Same-day sessions remain separated and recallable. | `@claim:same-day-sessions`. |
| F-1-42 | Storage, import, install, offline, reset, and exit recovery messages remain actionable. | `claims-manifest.test.ts`; full browser suite. |
| F-2-1 | Replaced `previous-set`, `previous session`, `last set`, and `last session` recall copy with **last-session context** in page, metadata, README, demo docs, design record, and claim ID. | Terminology regression test; live demo shows “Last-session context: Back squat.” |
| F-2-2 | Home route now sets a polite route announcement and focuses its h1 on both normal arrival and `pageshow`/Back restoration. | Browser test “moves focus and announces when returning home by link and browser Back”; live Privacy → Home check. |
| F-2-3 | Mobile status keeps the visible `Online`/`Offline` word at 390 px instead of hiding it with `font-size: 0`. | Browser test “keeps a visible connection word at mobile width in both states”; cold live computed font size `11px`. |

## Verification

- Clean clone at `b0996d6`: `npm ci` (0 vulnerabilities), `npm test`
  (13/13), `npm run build`, and `npm run test:e2e` (54/54) passed.
- Each of the 17 commands listed in `.factory/claims.json` was run separately
  in that clean clone; all passed.
- `/opt/fleet/lib/verify-url.sh` passed on live home, demo, Privacy, and Terms.
  The reports show title, `lang`, one h1, main landmark, image alt coverage,
  and zero application console errors.
- Live axe scans at 390 px found zero serious or critical issues on home, demo,
  Privacy, Terms, and 404. Live unknown route returned HTTP 404 with title
  `Page not found — Set Context Log`.
