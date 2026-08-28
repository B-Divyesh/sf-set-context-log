# Polish report 1 — Set Context Log

**Result: PASS — 42/42 findings resolved**

Candidate `9b1a047` was repaired from review commit `1b4f0de`. The functional
repair was deployed from `07b2cab`; final documentation and evidence were added
after the cold production check. Earlier review/polish files were searched:
`review-1.md` is the only review and no earlier polish report exists.

Evidence shorthand below:

- `clean`: `.factory/evidence/polish-1/clean-clone-tests.txt`
- `live`: `.factory/evidence/polish-1/live-browser.json`
- `http`: `.factory/evidence/polish-1/live-http.txt`
- `home`: `.factory/evidence/polish-1/live-home-mobile.png`
- `demo`: `.factory/evidence/polish-1/live-demo-mobile.png`
- `404`: `.factory/evidence/polish-1/live-404-mobile.png`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the vague hero with the requested job-first headline, named self-directed lifters, and placed the sample action plus explanation on the first screen. | `home`; live `/`; mobile first-action test in `app.spec.ts`. |
| F-1-2 | Added one-click `/?demo=1` and `/demo`, six sample sets across four sessions, the persistent required banner, reset, exit, demo title, sitemap entry, and `.factory/demo.md`. | `@claim:demo-isolation`; `demo`; live `/?demo=1` and `/demo`. |
| F-1-3 | Routed demo reads/writes to `demo:set-context-log` and `demo:` fallback keys. Reset and exit clear only that namespace. | `@claim:demo-isolation` and `@claim:local-storage`; live flow proves a real record remains hidden and unchanged. |
| F-1-4 | Added `.factory/claims.json`, registry validation, and exactly one tagged test for each of 17 claims. | `claims-manifest.test.ts`; `clean` shows all 17 commands passed individually. |
| F-1-5 | Removed the dead price, checkout link, restore UI, license runtime, and payment copy. All features are free. | `@claim:free-use`; “removes unavailable billing” unit test; live `/` contains no purchase UI. |
| F-1-6 | Removed the catch-all home fallback, emitted explicit demo output, and added the styled 404 with HTTP 404 response override. | `@claim:deployment-policy`, `@claim:site-routes`; `404`; `http`. |
| F-1-7 | Standardized previous-session context and show the last completed session before entry. | `@claim:previous-session-recall`; populated recall card in `demo`. |
| F-1-8 | Replaced “one-tap” copy with six named set-context markers and retained all numeric/note fields. | `@claim:set-fields`; demo screenshot. |
| F-1-9 | Registered browser storage/privacy behavior, isolated both storage modes, and tested erase plus request origins. | `@claim:local-storage`; `@claim:anonymous-runtime`; live origin list. |
| F-1-10 | Replaced “portable copy” with “JSON backup” and validates schema plus every sample row. | `@claim:json-export`. |
| F-1-11 | Registered CSV output and tests headers, row count, units, markers, commas, and quote escaping. | `@claim:csv-export`. |
| F-1-12 | Registered import merge semantics and tests duplicate preservation plus one new ID. | `@claim:json-import-merge`. |
| F-1-13 | Removed “Fast,” rewrote unit language, and tests that changing the default leaves saved kg/lb untouched. | `@claim:unit-preservation`. |
| F-1-14 | History now groups by explicit session ID instead of date alone. | `@claim:session-history`. |
| F-1-15 | Registered offline behavior and tests a demo reload, offline save, and second offline reload. | `@claim:offline-reload`; live offline result. |
| F-1-16 | Removed the unregistered paid/free split and made the complete archive, search, and context percentage free. | `@claim:free-use`; live `/`. |
| F-1-17 | Rewrote and registered the no-account/runtime boundary. | `@claim:anonymous-runtime`; live requests contain only the product origin. |
| F-1-18 | Removed license verification behavior and its once-per-day claim with the unavailable paid feature. | “removes unavailable billing” unit test; source has no license module. |
| F-1-19 | Removed the unverified Sociobot/Dodo merchant statement. | “removes unavailable billing” unit test; live `/`. |
| F-1-20 | Replaced the loose footer claim with a registered provenance claim and recorded source/derivative hashes, prompt, and dimensions. | `@claim:art-provenance`; `.factory/design.md`. |
| F-1-21 | Removed the unsupported Node 20 minimum statement. | “removes unavailable billing and unsupported setup claims” unit test. |
| F-1-22 | Removed the unregistered development service-worker behavior claim. | Same unsupported-claims unit test; README inspection. |
| F-1-23 | Registered build behavior and checks app, demo, and versioned worker output after type-check/build. | `@claim:build-output`; `clean`. |
| F-1-24 | Replaced the broad Playwright coverage sentence with direct claim-registry commands and identifiers. | Manifest mapping test; `clean`. |
| F-1-25 | Removed the repository credential claim and removed all payment integration code. A scan rejects billing variables, Azure model endpoints, and embedded Sociobot keys. | Unsupported-claims unit test. |
| F-1-26 | Split the long policy sentence and registered cache, MIME, CSP, permissions, and 404 behavior. | `@claim:deployment-policy`; `http`. |
| F-1-27 | Registered and crawled Privacy and Terms for status, title, h1, header, footer, canonical, and reciprocal legal links. | `@claim:site-routes`; live route matrix. |
| F-1-28 | Added route canonicals, OG/Twitter metadata, 1200×630 derived share image, and 180×180 touch icon. | `@claim:site-routes`; `@claim:art-provenance`; live image URLs return 200 in `http`. |
| F-1-29 | Rebuilt both legal pages with the shared wordmark, primary nav, skip link, full footer, factory link, and build ID. | `@claim:site-routes`; local `privacy-mobile.png`; live `/privacy/` and `/terms/`. |
| F-1-30 | Added Param Factory attribution, both legal links, generated-art disclosure, and Build 1.1.0 to the root footer. | `@claim:site-routes`; `home`. |
| F-1-31 | Added the three-step Choose → Mark → Review sequence directly after the working log. | `home`; live `/`. |
| F-1-32 | Changed the h1 to “Log what changed each lifting set.” | `home`; `verify-url.sh` live root evidence. |
| F-1-33 | Replaced metaphor-dependent headings with Current session, Log today’s sets, No saved sets yet, and Past sets and notes. Removed the upgrade heading. | `.factory/copy-audit.md`; `home` and `demo`. |
| F-1-34 | Standardized the product vocabulary to set context, previous-session context, saved in this browser, and sets with context. | Terminology table in `.factory/copy-audit.md`; `@claim:previous-session-recall`. |
| F-1-35 | Replaced vague outcomes with “Review the last set before logging the next one” and “Saved markers appear with each past set.” | Copy audit; `home`. |
| F-1-36 | Replaced “portable copy” with “JSON backup” and removed merchant jargon with the unavailable checkout. | Copy audit; `@claim:json-export`; free live page. |
| F-1-37 | Renamed controls to Change settings, Install app, Keep set, and Reload app. | “result-naming controls” unit test; `app.spec.ts` update and dialog tests. |
| F-1-38 | Rewrote README from the job outward, uses set context consistently, and keeps browser internals under Technical storage and deployment. | `.factory/copy-audit.md`; banned-copy unit test. |
| F-1-39 | Removed unmeasured “Fast” and states the observable per-set unit behavior. | Copy audit; `@claim:unit-preservation`. |
| F-1-40 | Split the 28-word deployment sentence into three short statements. | README table in `.factory/copy-audit.md`; banned/unsupported copy tests. |
| F-1-41 | Added **Finish session**, session IDs independent of date, rollover on a new date, and same-day previous-session recall. | `@claim:same-day-sessions`; `@claim:session-history`. |
| F-1-42 | Every storage, import, install, offline, reset, and exit failure now names the operation, likely cause, and next action. | “actionable recovery messages” unit test; runtime table in `.factory/copy-audit.md`. |

## Final verification summary

- Fresh clone: 0 vulnerabilities, 12/12 unit/config tests, 17/17 claim
  commands, build PASS, and 50/50 full browser tests.
- Local cold matrix: zero axe violations and zero horizontal overflow at 390px
  and 1440px.
- Live cold matrix: all intended routes correct; unknown route HTTP 404; zero
  axe violations and no unexpected console errors.
- Live Lighthouse mobile: 97 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.2 s, TBT 180 ms, CLS 0.062.
- Live response policies: immutable hashed assets, manifest MIME, CSP,
  permissions, referrer, frame, and nosniff headers all present.

No finding is deferred.
