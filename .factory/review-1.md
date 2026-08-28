# Adversarial first-read review 1 — Set Context Log

**Verdict: FAIL**

Reviewed 2026-08-28 against commit
`9b1a0474382106328aee88fc177dda2192d1fb73` and
<https://set-context-log.sociobot.in>. The review used fresh Chromium contexts
at 390×844 and 1440×1000. There are blocking findings, unlisted claims, and
minor copy/structure findings. A PASS requires zero findings and no untested
claim.

## Thirty-second first read, before scrolling

### 390×844

- **What I think it does:** it records a detail about a lifting set in addition
  to weight and reps, then shows that detail before a later set.
- **Who I think it is for:** probably a person who lifts, but the page never
  names the intended self-directed lifter or the problem of forgetting why a
  set changed.
- **What I should click first:** unclear. The visible controls are `LOG SET`,
  `HISTORY`, `YOUR DATA`, and `Settings`; the form is below the fold and there
  is no primary try action.

The exact copy doing the work is `Remember the set, not just the numbers.` and
`Weight and reps say what happened. Record the detail that explains it—then see
that detail before you lift again.` It explains the broad behavior, but it does
not name the user and it is followed by no primary action.

### 1440×1000

The same interpretation applies. The top of the logging form is visible near
the bottom of the viewport, but its submit action is below the fold. The first
screen still offers no primary try action or adjacent explanation of what a
click will do.

## Findings, ordered by severity

### Blocking

#### F-1-1 — The first screen does not identify the user or a first action

- **Exact location:** hero headline and lede; mobile and desktop first screen.
- **Exact quote:** `Remember the set, not just the numbers.` / `Weight and reps
  say what happened. Record the detail that explains it—then see that detail
  before you lift again.`
- **Why this fails:** a cold visitor can infer the behavior, but cannot confirm
  that this is for self-directed lifters who forget why a set changed. No
  primary action appears in the first screen.
- **Concrete fix:** use `Log what changed each lifting set` as the headline and
  `For self-directed lifters who need last session’s context before the next
  set.` as the supporting sentence. Add `Try it with sample data`, with
  `Opens a separate demo with three realistic sessions` beside it.

#### F-1-2 — There is no one-click sample demo

- **Exact location:** first screen, `/demo`, and `/?demo=1`.
- **Evidence:** neither first screen contains `Try it with sample data`.
  `/demo` and `/?demo=1` show the empty real app. They contain no realistic
  sample sets, no `Demo — sample data, nothing is saved` banner, no `Reset
  demo`, and no `Start for real`.
- **Why this fails:** a visitor cannot see prior-set recall or a useful history
  within 30 seconds without creating records manually.
- **Concrete fix:** add a first-screen action linking to `/demo`; seed at least
  three realistic sessions for two exercises so recall, context markers,
  history, search, and export are already visible. Keep the required banner
  and both controls visible throughout demo mode. Set the route title to
  `Demo — Set Context Log`, add it to the sitemap, and document the flow in
  `.factory/demo.md`.

#### F-1-3 — `/demo` reads and writes real storage

- **Exact location:** live `/demo`, `/?demo=1`, `src/storage.ts`.
- **Evidence:** a record named `Real baseline` created on `/` was visible twice
  on `/demo`. A record named `Demo route entry` created on `/demo` was then
  visible twice on `/`. IndexedDB exposed only the database
  `set-context-log`; there is no `demo:` database or key prefix.
- **Why this fails:** the demo URL is not a sandbox and can expose or modify a
  visitor’s real training log.
- **Concrete fix:** route every demo read and write through a separate
  namespace such as `demo:set-context-log`; never open the production database
  while the demo banner is shown. `Reset demo` must recreate only seeded demo
  data. Add a test that seeds real storage, mutates and resets demo storage,
  and proves the real record is unchanged and invisible in the demo.

#### F-1-4 — The required claims manifest and tagged claim tests do not exist

- **Exact location:** `.factory/claims.json` and test suite.
- **Evidence:** `.factory/claims.json` is absent and `rg '@claim:'` returns no
  matches. There were therefore zero listed claim commands to run from the
  clean clone. The untagged suites passed (`npm test`: 7/7;
  `npm run test:e2e`: 12/12), but they cannot establish claim coverage.
- **Why this fails:** no product, privacy, price, or offline sentence maps to
  exactly one reproducible sandbox test.
- **Concrete fix:** add `.factory/claims.json`; add one test tagged
  `@claim:<id>` for every claim below; run every entry from a fresh demo
  context. Remove any sentence that cannot be tested.

#### F-1-5 — The paid call to action is dead

- **Exact location:** `Buy full archive` at the one-time upgrade panel.
- **Evidence:** its live target,
  `https://api.sociobot.in/api/v1/products/set-context-log/checkout`, returns
  HTTP 404 with `{"error":"enabled factory product","status":404}`.
- **Why this fails:** the page offers a $9 purchase that cannot be started.
- **Concrete fix:** register and enable the factory product, add an automated
  claim test that verifies the CTA reaches the expected checkout handoff, and
  complete a test purchase/return. Until then, remove the price and purchase
  CTA instead of advertising an unavailable paid feature.

#### F-1-6 — Unknown routes masquerade as the product home page

- **Exact location:** `/definitely-not-a-real-route` and
  `public/staticwebapp.config.json` navigation fallback.
- **Evidence:** an arbitrary path returns HTTP 200 with the home title,
  headline, form, and footer. There is no designed 404 route.
- **Why this fails:** a mistyped or stale link gives no indication that the
  destination is invalid; this is broken routing, not a useful fallback.
- **Concrete fix:** add a designed `/404` in this product’s instrument style,
  with a clear `Return to log` link, and configure unmatched routes to serve it
  with HTTP 404 while retaining explicit SPA rewrites only for real routes.

### Unlisted claims

Every row is a separate finding because there is no corresponding
`.factory/claims.json` entry. The fix in each case is to add the named entry
and an observable demo-sandbox test, or remove/rewrite the claim.

| ID | Exact quote and location | Why unverified | Concrete test or rewrite |
| --- | --- | --- | --- |
| F-1-7 | Hero: `Record the detail that explains it—then see that detail before you lift again.` Empty state: `Your first set will appear here and become recall for the next session.` README: `When the exercise comes up in a later session, the prior sets and their caveats appear before the next entry.` | Prior-session recall is a core behavior with no registered claim. | Import two dated demo sessions, select the repeated exercise, and assert the previous session’s numbers, markers, and note appear before entry. |
| F-1-8 | Hero: `ONE-TAP CONTEXT`; README: `It captures weight, reps, RPE, a one-tap context marker, and a short set-specific note.` and the six `context keys` bullet. | Input coverage and “one-tap” are not registered. | In demo mode, activate each marker once and assert the saved set contains the entered fields. Replace `one-tap` with `six context markers` if interaction count is not tested. |
| F-1-9 | Hero: `STORED ON THIS DEVICE`; data section: `Sets live in this browser’s private storage.` README: `IndexedDB storage with a localStorage fallback` and `Training data never leaves the device.` | Storage and privacy claims are not registered. | Intercept the entire demo flow, assert only allowed same-origin requests, inspect the demo IndexedDB namespace, and separately exercise the fallback. |
| F-1-10 | Data section: `Export a portable copy whenever you want.` README: `Portable JSON backup/import and spreadsheet-ready CSV export.` | JSON export is not registered. | Download JSON from seeded demo data and validate the schema plus one row per sample set. Replace `portable` with `Download a JSON backup`. |
| F-1-11 | Button/README: `Export CSV` / `spreadsheet-ready CSV export`. | CSV export is not registered. | Download CSV and assert the header, escaping, unit, markers, and one row per demo set. |
| F-1-12 | Data section: `Import restores a Set Context Log JSON backup without replacing existing sets.` README: `imports merge by set ID and do not overwrite existing sets.` | Merge and non-overwrite behavior is not registered. | Import a fixture containing one duplicate and one new ID; assert the old record is unchanged and only the new record is added. |
| F-1-13 | README: `Fast set entry with per-entry kg/lb (history is never silently converted)`. Settings: `Changing this never converts or rewrites your history.` | The unit behavior is unregistered; `Fast` is also unmeasured. | Test mixed kg/lb records and a default-unit change. Remove `Fast` unless a numeric timing bound is stated and measured. |
| F-1-14 | README: `Today view plus a local archive grouped by session date`. | Archive grouping is not registered. | Seed records across three dates and assert each appears under the correct date group. |
| F-1-15 | README: `Installable PWA with a precached shell and tested offline reload.` Meta description: `Private, local-first, and offline.` Privacy page: `After installation it works offline.` | Offline behavior is tested in an untagged test but absent from the claims manifest. | Register `offline-reload`; enter `/demo`, wait for the worker, go offline, reload, and assert the seeded UI and a new saved demo set remain available. |
| F-1-16 | Upgrade: `Unlock your full on-device archive, exercise search, and context-rate readout.` / `Logging, recall, and all exports always remain free.` / `$9 one time`. README contains the same paid/free split. | Price, paid unlocks, and free guarantees have no registered tests. | Use recorded billing fixtures to assert exact $9 checkout metadata, unlocked features, and that logging/recall/exports remain available without a license. |
| F-1-17 | Landing: `NO ACCOUNT. NO CLOUD.` README: `No account, analytics, third-party runtime script, remote font, or cloud sync is used.` | These privacy/runtime claims are unregistered. | Intercept anonymous demo traffic and inspect loaded resources; assert no auth flow, analytics, remote font/script, or non-allowed origin. |
| F-1-18 | README: `A stored paid license is verified against the Sociobot billing API at most once per day.` | Verification frequency is unregistered. | Use a fixture endpoint and fake clock; reload repeatedly within and after 24 hours and assert the request count. |
| F-1-19 | Landing: `Secure checkout by Sociobot/Dodo, merchant of record.` | The statement is unregistered and the linked checkout currently returns 404. | Do not make the claim until a test checkout verifies the merchant handoff; then add a fixture-backed claim test. |
| F-1-20 | Footer: `Original illustration generated for this product.` | Provenance is documented but not registered as a claim. | Add a repository test that verifies the shipped hash, source image, prompt sidecar, and provenance record, or change the footer to a link to the provenance record. |
| F-1-21 | README: `Requires Node.js 20 or newer.` | The minimum runtime statement has no registered test. | Add a CI matrix/fixture that runs install, tests, and build on Node 20; register the supported-runtime claim. |
| F-1-22 | README: `Service-worker registration is intentionally disabled in development to avoid stale local assets.` | Development behavior has no registered test. | Start the development server and assert no service-worker registration occurs. |
| F-1-23 | README: “`npm run build` is the deployment command. It type-checks the application, builds with Vite, and generates the versioned service worker. Static output is written to `dist/`, with `dist/index.html` at its root.” | The build passed, but these sentences have no claims entry or tagged test. | Register one build-output claim and tag a test that runs the command and asserts type-check success, `dist/index.html`, and the versioned worker. |
| F-1-24 | README: `The Playwright suite is pinned to 1.58.2 and covers mobile logging, persistence, import/recall, accessibility, and an offline reload.` | The version is pinned and the suite passes, but coverage is not mapped to claim IDs. | Replace this broad sentence with links to the individual registered claims/tests. |
| F-1-25 | README: `No product ID or payment-provider credential is stored in this repository.` | Secret/provider-boundary claim is unregistered. | Add a repository scan that rejects provider credentials, Azure endpoints, and direct payment-provider code. |
| F-1-26 | README: `The included staticwebapp.config.json supplies immutable caching only for content-versioned assets, short revalidation for HTML and sw.js, the correct web-manifest MIME type, and the app’s CSP and permissions policy.` | An existing untagged unit test covers much of this, but there is no claims entry. | Register the deployment-policy claim and tag the existing deployment-config test after splitting the 28-word sentence. |
| F-1-27 | README: `Privacy and terms are available at /privacy/ and /terms/.` | The routes work, but the claim is unregistered. | Add a link-crawl claim that asserts both routes return 200 and contain the expected title, h1, header, footer, and canonical. |

### Major structure and copy findings

#### F-1-28 — Canonical, social metadata, and the required share image are absent

- **Exact location:** `/`, `/privacy/`, and `/terms/` document heads.
- **Evidence:** no canonical, Open Graph title/description/image, or Twitter
  card exists on any route. The root references a 192px apple-touch icon, not
  the required 180px asset. A probe for `/og-image.png` returns 404.
- **Why this fails:** shared links have no product-specific preview and route
  identity is not declared.
- **Concrete fix:** add route-specific canonical and OG/Twitter tags, a real
  1200×630 image derived from the original instrument art, and a 180×180
  apple-touch icon.

#### F-1-29 — Legal pages do not use the standard site header and footer

- **Exact location:** `/privacy/` and `/terms/`.
- **Evidence:** both use a single back link, no skip link, no shared navigation,
  and a one-line footer. They omit the other legal link, `Built by Param
  Factory`, and a version/build ID.
- **Why this fails:** the visitor loses the product navigation and the site’s
  common landmarks when entering through a legal deep link.
- **Concrete fix:** reuse the root header, skip link, and full footer on both
  legal pages. Keep the route-specific h1 and title.

#### F-1-30 — The root footer is incomplete

- **Exact location:** root footer.
- **Exact quote:** `S/C A quiet instrument for better next-set decisions.`
- **Why this fails:** it includes Privacy and Terms but omits `Built by Param
  Factory` and a version/build ID required by the site skeleton.
- **Concrete fix:** add linked factory attribution and an exposed build ID.

#### F-1-31 — The landing-page skeleton omits a clear “How it works” sequence

- **Exact location:** between the first screen and privacy/paid sections.
- **Evidence:** three benefit labels (`ONE-TAP CONTEXT`, `PRIOR-SET RECALL`,
  `STORED ON THIS DEVICE`) do not show the required three-step verb sequence or
  realistic product states.
- **Why this fails:** a first-time visitor cannot preview select → log → recall
  without manually using an empty form.
- **Concrete fix:** add `Choose an exercise`, `Mark what changed`, and `Review
  last session` with populated product screenshots or the live seeded UI.

#### F-1-32 — The hero headline is vague about the job

- **Exact quote/location:** `Remember the set, not just the numbers.` (h1).
- **Why this fails:** “remember” does not say that the visitor logs the reason
  a lifting set changed.
- **Concrete rewrite:** `Log what changed each lifting set`.

#### F-1-33 — Several headings depend on the visual metaphor

- **Exact locations:** `YOUR NEXT-SET MEMORY`, `TODAY’S WORKBENCH`, `ARCHIVE
  STANDING BY`, `What your sets remember`, and `ONE-TIME INSTRUMENT UPGRADE`.
- **Why this fails:** heard as a headings list, “memory,” “workbench,” “standing
  by,” and “instrument” do not name the content beneath them.
- **Concrete rewrites:** `Recall context next session`, `Log today’s sets`,
  `No saved sets yet`, `Past sets and notes`, and `Full archive — $9 once`.

#### F-1-34 — The landing page uses too many terms for the same set detail

- **Exact quotes:** `detail`, `context`, `prior-set recall`, `evidence trail`,
  `private storage`, `on-device archive`, and `context-rate readout`.
- **Why this fails:** the visitor must infer whether these are different
  features or the same saved note/marker.
- **Concrete fix:** use `set context` for the saved marker/note, `previous-set
  context` for recall, `saved on this device` for storage, and `sets with
  context` for the percentage.

#### F-1-35 — Two landing sentences make vague outcome claims

- **Exact quotes:** `Better decisions out.` and `Context markers will build an
  evidence trail you can actually use.`
- **Why this fails:** neither names an observable result; `actually` is
  promotional filler.
- **Concrete rewrites:** `Review the last set before logging the next one.` and
  `Saved markers appear with each past set.`

#### F-1-36 — Two landing phrases use avoidable jargon

- **Exact quotes:** `Export a portable copy whenever you want.` and `Secure
  checkout by Sociobot/Dodo, merchant of record.`
- **Why this fails:** “portable copy” does not name the file; “merchant of
  record” is payment-industry language.
- **Concrete rewrites:** `Download a JSON backup.` and `Sociobot handles the
  payment and receipt.` The latter must appear only after checkout works.

#### F-1-37 — Four buttons do not name their result fully

- **Exact locations:** `Settings`, conditional `Install`, confirmation `Keep
  it`, and update `Reload`.
- **Why this fails:** the plain-words control rule requires result-naming verbs;
  “it” and the bare nouns/verbs depend on surrounding context.
- **Concrete rewrites:** `Change settings`, `Install app`, `Keep set`, and
  `Reload app`.

#### F-1-38 — README terminology is inconsistent and jargon-heavy

- **Exact quotes:** `offline-first set recorder`, `RPE`, `context marker`,
  `caveats`, `decision-memory layer`, `per-entry`, `context keys`,
  `prior-session recall`, `IndexedDB`, `localStorage`, `PWA`, `precache`, and
  `context-rate readout`.
- **Why this fails:** the same saved information is called a marker, caveat,
  key, context, and memory. The opening assumes product and browser vocabulary
  before stating the job plainly.
- **Concrete fix:** open with `Set Context Log records weight, reps, effort,
  and what changed for each lifting set.` Use `set context` consistently. Move
  IndexedDB, localStorage, PWA, and precache details under a clearly technical
  development subsection.

#### F-1-39 — README uses an unmeasured marketing adjective

- **Exact quote/location:** product-behavior bullet `Fast set entry with
  per-entry kg/lb (history is never silently converted)`.
- **Why this fails:** `Fast` has no number or claim test.
- **Concrete rewrite:** `Record kg or lb on each set; changing the default does
  not convert saved sets.`

#### F-1-40 — One README sentence exceeds 22 words

- **Exact quote/location:** `The included staticwebapp.config.json supplies
  immutable caching only for content-versioned assets, short revalidation for
  HTML and sw.js, the correct web-manifest MIME type, and the app’s CSP and
  permissions policy.` (28 words under this review’s word-count method).
- **Why this fails:** it combines cache, MIME, CSP, and permissions policies in
  one sentence.
- **Concrete rewrite:** `staticwebapp.config.json gives versioned assets
  immutable caching. It revalidates HTML and sw.js. It also sets the manifest
  MIME type, CSP, and permissions policy.`

#### F-1-41 — The brief’s session concept has no explicit boundary

- **Exact location:** the earlier handoff at the reviewed base commit states:
  `Two separate workouts of the same exercise on one day are treated as one
  session`. The review handoff replaces that file in this commit; the quoted
  version remains in Git history at `9b1a047`.
- **Why this matters:** a normal lifter can train twice in one day, but prior
  “session” recall is keyed only to the calendar date. The second workout
  cannot recall the first as a separate session.
- **Concrete feature:** add `Finish session` / `Start another session`, store a
  session identifier independent of date, and test same-day recall. This is
  the only missed-leverage feature found. AI assistance and cloud sync are not
  implied: the brief explicitly rejects an AI workout generator and names
  cloud sync as a non-goal, while import/export already exists.

#### F-1-42 — Three fallback errors do not say enough to recover

- **Exact quotes:** `That action could not be completed. Try again.`, `That
  backup could not be imported.`, and `Offline setup was unavailable. The app
  still works while this page stays open.`
- **Why this fails:** the messages name neither the likely cause nor a specific
  recovery action. Retrying the same unknown action is not guidance.
- **Concrete rewrites:** preserve the operation name and caught failure reason.
  Use, for example, `The set could not be removed because browser storage is
  unavailable. Reload while online, then try again.` / `The backup could not
  be read. Choose an unedited Set Context Log JSON file.` / `Offline setup
  failed. Keep this page open, then reload while online to try again.`

## Copy audit

Word counts treat hyphenated terms, slash-separated terms, code tokens, and
URLs as one word. Headings and controls are audited in F-1-32 through F-1-40;
the tables below enumerate sentences and sentence-like product bullets.

### Landing page

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 7 | Remember the set, not just the numbers. | F-1-32 |
| 2 | 6 | Weight and reps say what happened. | — |
| 3 | 14 | Record the detail that explains it—then see that detail before you lift again. | F-1-1, F-1-7 |
| 4 | 2 | Context in. | F-1-34 |
| 5 | 3 | Better decisions out. | F-1-35 |
| 6 | 9 | Choose a previous lift or type a new one. | — |
| 7 | 4 | No sets logged yet. | — |
| 8 | 13 | Your first set will appear here and become recall for the next session. | F-1-7 |
| 9 | 5 | Log a working set above. | — |
| 10 | 11 | Context markers will build an evidence trail you can actually use. | F-1-35 |
| 11 | 2 | No account. | F-1-17 |
| 12 | 2 | No cloud. | F-1-17 |
| 13 | 5 | Your training data stays yours. | F-1-9 |
| 14 | 7 | Sets live in this browser’s private storage. | F-1-9, F-1-34 |
| 15 | 7 | Export a portable copy whenever you want. | F-1-10, F-1-36 |
| 16 | 12 | Import restores a Set Context Log JSON backup without replacing existing sets. | F-1-12 |
| 17 | 7 | Keep the whole training record in view. | F-1-33 |
| 18 | 10 | Unlock your full on-device archive, exercise search, and context-rate readout. | F-1-16, F-1-34 |
| 19 | 8 | Logging, recall, and all exports always remain free. | F-1-16 |
| 20 | 7 | Secure checkout by Sociobot/Dodo, merchant of record. | F-1-5, F-1-19, F-1-36 |
| 21 | 3 | Have a license? | — |
| 22 | 7 | A quiet instrument for better next-set decisions. | F-1-33, F-1-35 |
| 23 | 6 | Original illustration generated for this product. | F-1-20 |
| 24 | 8 | Changing this never converts or rewrites your history. | F-1-13 |
| 25 | 5 | A fresh version is ready. | — |

No landing sentence exceeds 22 words and none contains a word from the attached
banned-word list.

### README

| # | Words | Sentence or product bullet | Flag |
| ---: | ---: | --- | --- |
| 1 | 12 | Set Context Log is a private, offline-first set recorder for self-directed lifters. | F-1-38 |
| 2 | 14 | It captures weight, reps, RPE, a one-tap context marker, and a short set-specific note. | F-1-8, F-1-38 |
| 3 | 20 | When the exercise comes up in a later session, the prior sets and their caveats appear before the next entry. | F-1-7, F-1-38 |
| 4 | 19 | The app is a decision-memory layer, not a workout program, exercise catalog, social feed, wearable client, or medical tool. | F-1-38 |
| 5 | 6 | The production site is https://set-context-log.sociobot.in. | — |
| 6 | 11 | Fast set entry with per-entry kg/lb (history is never silently converted) | F-1-13, F-1-39 |
| 7 | 9 | Clean, Grip, Pause, Tempo, Form, and Easy context keys | F-1-8, F-1-38 |
| 8 | 7 | Automatic prior-session recall for the selected exercise | F-1-7, F-1-38 |
| 9 | 10 | Today view plus a local archive grouped by session date | F-1-14 |
| 10 | 6 | IndexedDB storage with a localStorage fallback | F-1-9, F-1-38 |
| 11 | 7 | Portable JSON backup/import and spreadsheet-ready CSV export | F-1-10, F-1-11 |
| 12 | 10 | Installable PWA with a precached shell and tested offline reload | F-1-15, F-1-38 |
| 13 | 20 | Optional $9 one-time license for full archive visibility, search, and the context-rate readout; logging, recall, accessibility, and export stay free | F-1-16, F-1-38 |
| 14 | 13 | No account, analytics, third-party runtime script, remote font, or cloud sync is used. | F-1-17 |
| 15 | 6 | Training data never leaves the device. | F-1-9 |
| 16 | 16 | A stored paid license is verified against the Sociobot billing API at most once per day. | F-1-18 |
| 17 | 5 | Requires Node.js 20 or newer. | F-1-21 |
| 18 | 5 | The development server uses Vite. | — |
| 19 | 12 | Service-worker registration is intentionally disabled in development to avoid stale local assets. | F-1-22 |
| 20 | 7 | npm run build is the deployment command. | F-1-23 |
| 21 | 13 | It type-checks the application, builds with Vite, and generates the versioned service worker. | F-1-23 |
| 22 | 11 | Static output is written to dist/, with dist/index.html at its root. | F-1-23 |
| 23 | 18 | The Playwright suite is pinned to 1.58.2 and covers mobile logging, persistence, import/recall, accessibility, and an offline reload. | F-1-24 |
| 24 | 12 | To exercise staging billing, set VITE_BILLING_API_BASE at build time: | — |
| 25 | 5 | Production defaults to https://api.sociobot.in/api/v1. | — |
| 26 | 11 | No product ID or payment-provider credential is stored in this repository. | F-1-25 |
| 27 | 18 | The JSON format is identified by set-context-log/v1; imports merge by set ID and do not overwrite existing sets. | F-1-12 |
| 28 | 18 | Browser storage should not be treated as a backup, so users who value long-term records should export periodically. | — |
| 29 | 11 | Deploy the complete dist/ directory to any static host with HTTPS. | — |
| 30 | 28 | The included staticwebapp.config.json supplies immutable caching only for content-versioned assets, short revalidation for HTML and sw.js, the correct web-manifest MIME type, and the app’s CSP and permissions policy. | F-1-26, F-1-40 (>22) |
| 31 | 15 | Hosts that do not read Azure Static Web Apps configuration must apply equivalent response rules. | — |
| 32 | 10 | The factory owns infrastructure, DNS, billing registration, and production deployment. | — |
| 33 | 9 | Privacy and terms are available at /privacy/ and /terms/. | F-1-27 |
| 34 | 9 | The visual system and image provenance are in .factory/design.md. | — |
| 35 | 9 | Build verification and known gaps are recorded in .factory/handoff.md. | — |
| 36 | 3 | MIT — see LICENSE. | — |

No README sentence contains a word from the attached banned-word list. The
`Fast` adjective is separately flagged because it is unmeasured marketing
copy.

### Conditional and runtime landing copy

Counts use one word for a substituted exercise name, number, or set value.
Fragments are included because they are announced or shown as complete UI
messages.

| # | Words | Sentence template | Flag |
| ---: | ---: | --- | --- |
| 1 | 9 | Free archive: your latest 14 days stay visible here. | F-1-16 |
| 2 | 6 | Every set remains stored and exportable. | F-1-9, F-1-10, F-1-11 |
| 3 | 5 | No earlier session for [exercise]. | — |
| 4 | 10 | Log today’s evidence and it will be ready next time. | F-1-7, F-1-34 |
| 5 | 3 | No context marked. | — |
| 6 | 6 | No exercises match that search. | — |
| 7 | 3 | Checking your license… | — |
| 8 | 7 | Full archive is active on this device. | F-1-16 |
| 9 | 7 | This license is no longer active. | — |
| 10 | 7 | You can purchase a new license above. | F-1-5 |
| 11 | 4 | License check is offline. | — |
| 12 | 7 | Reconnect and try again; logging still works. | — |
| 13 | 7 | [Exercise] set logged on this device. | F-1-9 |
| 14 | 6 | The set could not be saved. | — |
| 15 | 8 | Check this browser’s storage permission and try again. | — |
| 16 | variable | Remove the [exercise] set at [weight] [unit] × [reps]? | — |
| 17 | 4 | This cannot be undone. | — |
| 18 | 2 | Set removed. | — |
| 19 | 6 | That action could not be completed. | F-1-42 |
| 20 | 2 | Try again. | F-1-42 |
| 21 | 3 | Default unit saved. | — |
| 22 | 4 | History was not converted. | F-1-13 |
| 23 | 11 | Erase all [n] locally stored sets and settings from this device? | — |
| 24 | 7 | Export first if you need a backup. | — |
| 25 | 5 | All local training data erased. | — |
| 26 | 6 | Exported [n] sets as JSON. | F-1-10 |
| 27 | 6 | Exported [n] sets as CSV. | F-1-11 |
| 28 | 5 | Imported [n] new sets. | F-1-12 |
| 29 | 8 | Backup read successfully; all sets were already here. | F-1-12 |
| 30 | 6 | That backup could not be imported. | F-1-42 |
| 31 | 8 | Paste the license token from your receipt. | — |
| 32 | 5 | Offline setup was unavailable. | F-1-42 |
| 33 | 9 | The app still works while this page stays open. | F-1-42 |
| 34 | 5 | Private database storage is unavailable. | F-1-38 |
| 35 | 7 | Using this browser’s simpler local storage instead. | F-1-38 |
| 36 | 4 | IndexedDB could not open. | F-1-38 |
| 37 | 9 | Your sets will use local storage on this device. | F-1-9 |
| 38 | 9 | Set Context Log could not open its local storage. | — |
| 39 | 8 | Reload the page or check browser storage permissions. | — |
| 40 | 4 | Enter an exercise name. | — |
| 41 | 8 | Enter a weight from 0 to 5,000. | — |
| 42 | 7 | Enter whole-number reps from 1 to 999. | — |
| 43 | 10 | RPE must be from 1 to 10 in half-point steps. | F-1-38 |
| 44 | 7 | That file is not valid JSON. | — |
| 45 | 6 | Choose a Set Context Log backup. | — |
| 46 | 6 | That backup has no readable data. | — |
| 47 | 10 | That file is not a Set Context Log v1 backup. | — |

## Demo, privacy, offline, and claim execution evidence

- Direct demo entry: `/demo` and `/?demo=1` both loaded the production app and
  its real data. No demo UI or sample appeared.
- Namespace: IndexedDB listed only `set-context-log`; a record crossed from
  `/` to `/demo` and another crossed back from `/demo` to `/`.
- Reset: no reset control exists, so reset behavior is untestable.
- Offline: after one `/demo` load and service-worker activation, Chromium was
  put offline. Reload succeeded, `Offline · sets still save` appeared, and the
  entered record remained visible. This verifies behavior, not sandboxing.
- Network interception: the anonymous log/offline flow requested only
  `https://set-context-log.sociobot.in`. This supports the observed free-flow
  privacy behavior, but no registered privacy claim exists.
- Clean clone: `npm ci` passed with 0 known vulnerabilities; `npm test` passed
  7/7; `npm run build` passed and produced `dist/`; `npm run test:e2e` passed
  12/12. No `@claim:` tags exist.

## Structure, accessibility, and history checks that passed

- Root title is `Set Context Log — remember what changed the set`; Privacy and
  Terms use route-specific title patterns. Each checked document has exactly
  one h1, `lang="en"`, a main landmark, a meta description, and a favicon.
- Root has a working skip link, meaningful hero alt text, no unlabeled buttons,
  no console errors, and no horizontal-overflow issue observed at either
  viewport.
- Fresh live axe scans at 390×844 and 1440×1000 returned zero violations.
  Keyboard Tab exposed a 3px visible skip-link focus ring. Settings moved focus
  to `Close settings`; Escape returned focus to `Settings`.
- Root, Privacy, Terms, manifest, icons, robots, and sitemap return 200. The
  checkout link and arbitrary-route behavior are recorded above.
- `/#history` opens the history section, `#data` changes the in-page location,
  and Back restores `#history` and its scroll position. These are valid
  in-page anchors rather than app routes. Privacy and Terms make full document
  navigations; the only missing product route is the demo recorded in F-1-2.
- The visual identity is distinct: the warm paper/olive/vermilion instrument
  panel, ruled surface, narrow display face, and original hero art do not read
  as a generic SaaS template.
- Earlier `.factory/review-*.md` and `.factory/polish-*.md` files do not exist.
  The earlier handoff and both verification reports were read. Verification
  defects P1 (immutable caching), P2 (manifest MIME), and P3 (response policy)
  are fixed in code and live: content-versioned assets return one-year
  immutable caching; the manifest returns `application/manifest+json`; CSP,
  permissions policy, anti-framing, nosniff, and referrer policy are present.
  No earlier finding ID is reopened.

## What would make this perfect

Resolve every finding above, then repeat this entire review from a fresh
browser and clone. The finished version needs a job-first hero with a visible
sample action; a seeded, resettable, storage-isolated demo; a complete claims
manifest with one tagged test per claim; a working or removed purchase path; a
real 404 and complete route metadata; consistent headers/footers; plain and
consistent `set context` terminology; and explicit same-day session boundaries.
At that point the review should contain no qualification, untested statement,
dead link, or remaining copy flag.
