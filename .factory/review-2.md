# Adversarial first-read review 2 — Set Context Log

**Verdict: FAIL**

Reviewed 2026-08-28 against commit
`bf70ca9f2e11c5aa0c090119fbd407b83c7e1566` and
<https://set-context-log.sociobot.in>. Fresh Chromium contexts used 390×844
and 1440×1000 viewports. One earlier finding is only partly fixed, so it is
blocking again. Two additional findings remain. A PASS requires zero findings.

## Thirty-second first read, before scrolling

### 390×844

- **What it does:** records what changed during each lifting set and brings
  earlier context back before a later set.
- **Who it is for:** self-directed lifters who need context from their last
  session.
- **What to click first:** `Try it with sample data`; the adjacent text says it
  opens a separate demo with sample sessions.

All three answers are present above the fold. The exact text is `Log what
changed each lifting set`, `For self-directed lifters who need last session’s
context before the next set`, and `Try it with sample data` / `Opens a separate
demo with sample sessions.` The primary action begins at 391 px. The three
facts (`No account`, `Works offline after first visit`, `Free to use`) are also
visible.

### 1440×1000

The same three answers are clear above the fold. The action begins at 524 px,
and the three facts are visible. The top of the working set-entry UI is also
visible. No first-screen blocking finding remains from F-1-1.

## Findings, ordered by severity

### Blocking

#### F-2-1 — Previous-session recall still uses conflicting names (reopens F-1-34)

- **Historical ID:** F-1-34. This is reopened as blocking under the round-2 ID
  required by this review.
- **Exact locations and quotes:** landing eyebrow `Previous-set context`;
  lede `last session’s context`; image caption `Review the last set before
  logging the next one`; How it works copy `Saved exercises show their previous
  session` and `Previous-set context appears`; README `last session’s context`
  and `Shows the previous session`.
- **Code evidence:** `index.html` ships all of those variants, and
  `src/main.ts` renders `Previous-set context` above a card containing every set
  from the prior session. `.factory/copy-audit.md` says the chosen term is
  `previous-session context`, but that term is not used consistently in the
  shipped copy.
- **Live evidence:** the demo recall card contains two Back squat sets from Aug
  25, while the nearby image caption says `Review the last set`. A visitor
  cannot tell whether recall means one earlier set or the whole earlier
  session.
- **Why this fails:** F-1-34 required one term for this feature and was marked
  fixed in polish 1. The deployed product still alternates among set, last set,
  last session, and previous session. The earlier finding is therefore only
  partly fixed and must be blocking again under the history rule.
- **Concrete fix:** use `last-session context` everywhere. For example:
  `Last-session context`; `For self-directed lifters who need last-session
  context before the next set`; `Review last-session context before logging the
  next set`; and `Shows last-session context when you choose an exercise`.
  Update the terminology table and add a copy test that rejects the retired
  variants.

### Minor

#### F-2-2 — Returning to the home route does not move or announce focus

- **Exact location:** navigation from `/privacy/` or `/demo` to `/`, and browser
  Back from either route to `/`.
- **Evidence:** the live `/privacy/` and `/demo` documents focus their h1. After
  selecting the brand link to `/`, or after `page.goBack()` to `/`,
  `document.activeElement` is `BODY`; `#page-title` is not focused and
  `#route-status` is empty. The same behavior is present in code: `legal.js`
  focuses legal-page h1 elements and `configureRoute()` announces only demo;
  the normal home route has no corresponding path.
- **Why this fails:** keyboard and screen-reader users get no focus or live
  announcement when the destination is the home route. The requested route
  behavior is asymmetric even though the browser Back action otherwise works.
- **Concrete fix:** run the same h1 focus and polite route announcement for the
  home document on navigation and `pageshow`. Add a browser test for
  Privacy → Home and Demo → Back → Home.

#### F-2-3 — Mobile connection status communicates state by color alone

- **Exact location:** header status at widths up to 760 px.
- **Exact text/code:** the DOM contains `● Online` or `● Offline · sets still
  save`, but `.connection-status { font-size: 0; }` hides all visible words on
  mobile. Only the same round dot remains, colored green online and orange
  offline.
- **Live evidence:** at 390 px the header shows only a colored dot next to the
  wordmark. The accessible name remains available to assistive technology, but
  a sighted visitor who cannot distinguish the colors has no non-color cue.
- **Why this fails:** state must not depend on color alone. It also contradicts
  the design record’s policy that status includes a word or distinct symbol.
- **Concrete fix:** keep short visible text such as `Online` and `Offline` at
  390 px, or use visibly different symbols plus text. Add a mobile test that
  confirms the status word has a non-zero rendered font size in both states.

## Copy audit

Counts treat hyphenated terms, URLs, and code tokens as one word. Claim IDs in
README parentheses are included. No item exceeds 22 words and no banned
marketing word appears. F-2-1 is the terminology flag. Technical names occur
only in the README’s technical section and identify the actual browser or file
format, so they are not flagged as promotional jargon.

### Landing-page sentences and complete statements

| Words | Exact copy | Flag |
| ---: | --- | --- |
| 6 | Log what changed each lifting set. | — |
| 12 | For self-directed lifters who need last session’s context before the next set. | F-2-1 |
| 7 | Opens a separate demo with sample sessions. | — |
| 2 | No account. | — |
| 6 | Works offline after first visit. | — |
| 3 | Free to use. | — |
| 9 | Review the last set before logging the next one. | F-2-1 |
| 4 | Opening your local log… | — |
| 9 | Choose a saved exercise or type a new one. | — |
| 4 | No saved sets yet. | — |
| 7 | Your first set will appear here. | — |
| 9 | Saved exercises show their previous session above the entry fields. | F-2-1 |
| 11 | Add weight, reps, effort, a set-context marker, or a short note. | — |
| 9 | Previous-set context appears before you log the next set. | F-2-1 |
| 7 | Saved markers appear with each past set. | — |
| 6 | Download a JSON backup or CSV file. | — |
| 8 | Import adds new sets without replacing saved sets. | — |
| 3 | It records sets. | — |
| 12 | It does not create workout plans or send records to a server. | — |
| 7 | Review set context before the next lift. | F-2-1 |
| 5 | Original generated hero art. | — |
| 8 | Changing the default does not convert saved sets. | — |
| 5 | A fresh version is ready. | — |

All conditional validation, confirmation, success, failure, import, install,
offline, reset, and exit messages were also checked in `src/main.ts` and
`src/domain.ts`. Their maximum is 19 words. None uses a banned word or exceeds
22 words.

### README sentences and product bullets

| # | Words | Exact copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 14 | Set Context Log records weight, reps, effort, and what changed for each lifting set. | — |
| 2 | 15 | It is for self-directed lifters who want the last session’s context before their next set. | F-2-1 |
| 3 | 6 | Try the isolated sample at https://set-context-log.sociobot.in/?demo=1. | — |
| 4 | 14 | It opens with realistic sessions and never reads or changes the real log (`demo-isolation`). | — |
| 5 | 13 | Records kg or lb, reps, effort, six set-context markers, and a note (`set-fields`). | — |
| 6 | 11 | Shows the previous session when you choose a saved exercise (`previous-session-recall`). | F-2-1 |
| 7 | 13 | Separates two sessions on the same day when you select Finish session (`same-day-sessions`). | — |
| 8 | 6 | Groups the history by session (`session-history`). | — |
| 9 | 9 | Downloads every set as JSON or CSV (`json-export`, `csv-export`). | — |
| 10 | 9 | Imports new set IDs without replacing existing records (`json-import-merge`). | — |
| 11 | 10 | Keeps saved units unchanged when you change the default (`unit-preservation`). | — |
| 12 | 10 | Reloads the installed app offline after the first visit (`offline-reload`). | — |
| 13 | 10 | The app is free to use and needs no account. | — |
| 14 | 13 | Anonymous use loads no analytics, remote fonts, third-party scripts, or cloud sync (`anonymous-runtime`). | — |
| 15 | 13 | Your sets stay in browser storage, and the erase control removes them (`local-storage`). | — |
| 16 | 3 | It records sets. | — |
| 17 | 14 | It does not create workout plans or send records to a server (`anonymous-runtime`, `local-storage`). | — |
| 18 | 6 | Open the URL printed by Vite. | — |
| 19 | 10 | The production demo route is `/?demo=1` or `/demo`; see `.factory/demo.md`. | — |
| 20 | 5 | The claim registry is `.factory/claims.json`. | — |
| 21 | 10 | Each row contains the exact command for its tagged test. | — |
| 22 | 17 | `npm run build` type-checks the source, builds the site, creates route files, and generates the service worker. | — |
| 23 | 6 | It writes `dist/index.html` and `dist/sw.js` (`build-output`). | — |
| 24 | 7 | Real records use the `set-context-log` IndexedDB database. | — |
| 25 | 4 | Demo records use `demo:set-context-log`. | — |
| 26 | 6 | Each has a separate localStorage fallback. | — |
| 27 | 10 | Deploy the complete `dist/` directory to a static HTTPS host. | — |
| 28 | 6 | `staticwebapp.config.json` gives versioned assets immutable caching. | — |
| 29 | 5 | It revalidates HTML and `sw.js`. | — |
| 30 | 16 | It also sets the manifest MIME type, CSP, permissions policy, and the designed 404 response (`deployment-policy`). | — |
| 31 | 13 | Privacy and Terms use real routes with shared navigation and route metadata (`site-routes`). | — |
| 32 | 5 | The production site is https://set-context-log.sociobot.in. | — |
| 33 | 12 | The visual system and original image provenance are recorded in `.factory/design.md` (`art-provenance`). | — |
| 34 | 4 | MIT — see LICENSE. | — |

### Headings, controls, and terminology

- All static headings make sense out of context except for the inconsistent
  recall naming recorded in F-2-1. The heading outline has one h1 and no level
  skips.
- Result controls are named with actions: `Try it with sample data`, `Log this
  set`, `Finish session`, `Export JSON`, `Export CSV`, `Import JSON`, `Reset
  demo`, `Start for real`, `Change settings`, `Save settings`, `Erase all local
  data`, `Keep set`, `Remove set`, `Install app`, and `Reload app`.
- `Effort (RPE, optional)` introduces the lifting abbreviation beside a plain
  label. JSON, CSV, IndexedDB, localStorage, MIME, and CSP occur where the
  product names file formats or the README documents deployment internals.
- The intended terminology is otherwise stable: `set context`, `session`,
  `history`, `JSON backup`, and `demo`.

## Demo and sandbox behavior

- One click from `/` opens `/?demo=1`; `/demo` also works directly.
- The first demo screen already shows Back squat, a two-set Aug 25 recall card,
  one current set, six total rows across four sessions, and realistic notes.
- The sticky banner reads `Demo — sample data, nothing is saved` and exposes
  `Reset demo` and `Start for real` at 390 px and desktop.
- A real record named `Real-only press` was hidden from the demo. A demo-only
  record was saved, reset removed it and restored six seed rows, and `Start for
  real` returned to the unchanged real record.
- IndexedDB contained separate `set-context-log` and
  `demo:set-context-log` databases. Live demo traffic used only
  `https://set-context-log.sociobot.in`.
- After the live service worker was ready, the network was disabled. The demo
  reloaded, displayed `Offline`, saved `Offline review row`, and retained it
  through a second offline reload.

The demo therefore meets the one-click, populated-screen, reset, isolation,
and offline requirements. No sandbox finding remains.

## Claim verification

The repository was cloned into a new temporary directory. `npm ci` reported
zero vulnerabilities. Every exact `test` command in `.factory/claims.json`
was executed separately.

| Claim ID | Result | Observed evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Seed, reset, separate database, and real-record preservation passed. |
| `set-fields` | PASS | All numeric, unit, marker, and note fields appeared in JSON. |
| `previous-session-recall` | PASS | Prior numbers, markers, and notes appeared before entry. |
| `local-storage` | PASS | Reload, erase, same-origin traffic, and fallback namespace passed. |
| `json-export` | PASS | Six distinct seeded records were downloaded. |
| `csv-export` | PASS | Headers, row count, units, markers, commas, and quotes passed. |
| `json-import-merge` | PASS | Duplicate stayed unchanged and new ID was added. |
| `unit-preservation` | PASS | Saved kg record stayed kg after default changed to lb. |
| `session-history` | PASS | Four session groups contained all six sample sets. |
| `same-day-sessions` | PASS | A finished session became same-day recall. |
| `offline-reload` | PASS | Offline reload, save, and second reload passed. |
| `anonymous-runtime` | PASS | Requests and loaded resources remained same-origin. |
| `free-use` | PASS | All product controls were available without purchase UI. |
| `build-output` | PASS | App, demo document, and versioned worker existed. |
| `deployment-policy` | PASS | Cache, MIME, security policy, and HTTP 404 checks passed. |
| `site-routes` | PASS | Titles, metadata, landmarks, canonicals, and legal links passed. |
| `art-provenance` | PASS | Source/derivative hashes, prompt record, and image dimensions passed. |

Cross-checking the live landing page and README found no claim-like sentence
without a matching registry entry. There is no untested claim.

Additional repository gates passed: `npm test` (12/12), `npm run build`, and
`npm run test:e2e` (50/50 across desktop and mobile).

## Earlier-finding regression audit

Every finding in `.factory/review-1.md` was checked against the live site and
the current code. `.factory/polish-1.md`, both earlier verification reports,
and the prior handoff were read. `Fixed` below means both deployed behavior and
its implementation/test were confirmed; F-1-34 is the exception.

| Earlier ID | Status | Live and code confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | Job, user, action, and adjacent outcome are above the fold. |
| F-1-2 | Fixed | One-click populated demo, banner, reset, exit, title, and sitemap entry exist. |
| F-1-3 | Fixed | Separate demo database and fallback keys preserve real data. |
| F-1-4 | Fixed | Registry contains 17 uniquely tagged claims; all commands pass. |
| F-1-5 | Fixed | No price, checkout, license, or purchase UI remains live or in source. |
| F-1-6 | Fixed | Unknown live route returns the designed page with HTTP 404. |
| F-1-7 | Fixed | Live recall card shows the prior session before the entry fields. |
| F-1-8 | Fixed | Six named markers and all set fields save and export. |
| F-1-9 | Fixed | Same-origin requests, separate storage, fallback, reload, and erase pass. |
| F-1-10 | Fixed | JSON backup copy and complete download test pass. |
| F-1-11 | Fixed | CSV download and escaping test pass. |
| F-1-12 | Fixed | Import merge preserves duplicates and adds new IDs. |
| F-1-13 | Fixed | `Fast` is absent; per-record units remain unchanged. |
| F-1-14 | Fixed | Live demo is grouped into four explicit sessions. |
| F-1-15 | Fixed | Live and local offline reload/save checks pass. |
| F-1-16 | Fixed | Entire product is free; paid split is absent. |
| F-1-17 | Fixed | No account or third-party runtime appears; traffic is same-origin. |
| F-1-18 | Fixed | License verification code and claim are absent. |
| F-1-19 | Fixed | Merchant/payment copy is absent. |
| F-1-20 | Fixed | Footer disclosure and registered provenance evidence exist. |
| F-1-21 | Fixed | Unsupported Node 20 claim is absent. |
| F-1-22 | Fixed | Development service-worker claim is absent. |
| F-1-23 | Fixed | Build command and emitted files pass the registered test. |
| F-1-24 | Fixed | README points to the per-claim registry instead of broad coverage copy. |
| F-1-25 | Fixed | Credential claim and billing/model integration are absent. |
| F-1-26 | Fixed | Short policy sentences and registered deployment checks pass. |
| F-1-27 | Fixed | Privacy and Terms return 200 with shared links and metadata. |
| F-1-28 | Fixed | Canonical, OG/Twitter tags, 1200×630 image, and 180 px touch icon are live. |
| F-1-29 | Fixed | Legal pages use shared brand, nav, skip link, footer, and reciprocal legal links. |
| F-1-30 | Fixed | Root footer includes legal links, factory attribution, and build ID. |
| F-1-31 | Fixed | Choose → Mark → Review sequence follows the working log. |
| F-1-32 | Fixed | h1 is the six-word job statement. |
| F-1-33 | Fixed | Former metaphor-only headings are absent; current headings are literal. |
| F-1-34 | **Reopened** | Live/source still alternate previous-set, last set, last session, and previous session; see F-2-1. |
| F-1-35 | Fixed | Vague outcome lines are absent; saved-marker behavior is concrete. |
| F-1-36 | Fixed | `JSON backup` replaces portable-copy jargon; payment jargon is absent. |
| F-1-37 | Fixed | Settings, install, keep, and reload controls name their result. |
| F-1-38 | Fixed | README opens with the job; technical terms are confined to technical sections. |
| F-1-39 | Fixed | Unmeasured `Fast` claim is absent. |
| F-1-40 | Fixed | No README sentence exceeds 22 words. |
| F-1-41 | Fixed | `Finish session`, independent IDs, and same-day recall work. |
| F-1-42 | Fixed | Storage/import/install/offline/reset/exit errors state failure and recovery. |

## Structure, accessibility, and link crawl

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200. A random path returns
  the designed instrument-style 404 with HTTP 404.
- Each checked route has the required title pattern, one h1, one main, a meta
  description, canonical, OG/Twitter image metadata, favicon, header, and
  footer. The sitemap lists all intended routes.
- At 390 px and 1440 px there was no horizontal overflow, no unexpected
  application console error, and no axe violation at any impact level on the
  four routes or designed 404. The expected browser network error for the 404
  document itself was not counted as an application console error.
- Every discovered internal URL and fragment resolved. Privacy and Terms were
  reciprocal, mail links were explicit, and the external Param Factory link
  returned 200.
- Browser Back restored the correct document and scroll behavior, but home
  focus failed as recorded in F-2-2.
- Reduced-motion CSS removes smooth scrolling and shortens animation. Targets,
  form labels, alt text, contrast, and dialog focus tests passed. The remaining
  color-only mobile status is F-2-3.
- The mid-century training-instrument palette, narrow display type, ruled recall
  card, physical controls, generated still life, and restrained shape language
  are distinct from a generic SaaS template.

## Missed leverage

No missed-leverage finding. The brief asks for a local set recorder,
previous-session recall, and JSON/CSV portability; all are present, and JSON
import is included. Cloud and wearable sync are explicit non-goals. An AI step
would add network/key disclosure to a job that is already deterministic and
would not provide obvious value.

## What would make this perfect

Resolve F-2-1, F-2-2, and F-2-3, then rerun the full checklist. Specifically:
ship one plain name for prior-session recall, focus and announce the home h1 on
route arrival/back navigation, and keep a visible non-color connection label
on mobile. Add regression tests for all three. Nothing else in the reviewed
scope needs a product feature.
