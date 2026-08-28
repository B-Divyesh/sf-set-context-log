# Adversarial first-read review 3 — Set Context Log

**Verdict: PASS**

Reviewed 2026-08-28 on commit a0439348fe65b6c2b9f0754595572b749934e6f3 and live production at https://set-context-log.sociobot.in. This is a fresh, full review at 390×844 and 1440×1000; it is not a diff-only check. There are zero blocking or minor findings and no untested claim.

## Thirty-second first read

### 390×844

- **What it does:** records what changed on a lifting set and recalls that context before a later set.
- **For whom:** self-directed lifters who need the last session’s context.
- **First click:** **Try it with sample data**. Its adjacent text says it opens a separate demo with sample sessions.

All answers are visible before scrolling. Exact text: “Log what changed each lifting set”; “For self-directed lifters who need last-session context before the next set.”; “Try it with sample data”; and “Opens a separate demo with sample sessions.” The three plain facts—“No account”, “Works offline after first visit”, and “Free to use”—are visible too.

### 1440×1000

The job, intended lifter, primary action, result of the action, and three facts are visible before scroll. The first part of the genuine set-entry UI is also visible. No first-read blocking condition remains.

## Copy audit

Counts treat hyphenated terms, URLs, and code tokens as one word. The landing list includes complete statements/messages that can appear without visitor data. No item is over 22 words. No banned marketing adjective, inconsistent product term, unclear heading, non-result-naming control, or product jargon flag was found. “RPE” occurs only after the plain optional field name “Effort”.

### Landing statements

| Words | Statement |
| ---: | --- |
| 6 | Log what changed each lifting set. |
| 12 | For self-directed lifters who need last-session context before the next set. |
| 7 | Opens a separate demo with sample sessions. |
| 2 | No account. |
| 6 | Works offline after first visit. |
| 3 | Free to use. |
| 8 | Review last-session context before logging the next set. |
| 4 | Opening your local log… |
| 9 | Choose a saved exercise or type a new one. |
| 4 | No saved sets yet. |
| 7 | Your first set will appear here. |
| 8 | Saved exercises show last-session context above the entry fields. |
| 11 | Add weight, reps, effort, a set-context marker, or a short note. |
| 8 | Last-session context appears before you log the next set. |
| 7 | Saved markers appear with each past set. |
| 6 | Download a JSON backup or CSV file. |
| 8 | Import adds new sets without replacing saved sets. |
| 3 | It records sets. |
| 12 | It does not create workout plans or send records to a server. |
| 7 | Review set context before the next lift. |
| 5 | Original generated hero art. |
| 8 | Changing the default does not convert saved sets. |
| 5 | A fresh version is ready. |

The semantic headings “Log today’s sets”, “Carry useful context into the next set”, “Past sets and notes”, and “Your sets stay in this browser” stand alone clearly. Controls name their results: Try it with sample data, Log this set, Finish session, Export JSON, Export CSV, Import JSON, Reset demo, Start for real, Change settings, Save settings, Erase all local data, Keep set, Remove set, Install app, and Reload app.

### README statements

| Words | Statement |
| ---: | --- |
| 14 | Set Context Log records weight, reps, effort, and what changed for each lifting set. |
| 14 | It is for self-directed lifters who want last-session context before their next set. |
| 6 | Try the isolated sample at https://set-context-log.sociobot.in/?demo=1. |
| 14 | It opens with realistic sessions and never reads or changes the real log (demo-isolation). |
| 14 | Records kg or lb, reps, effort, six set-context markers, and a note (set-fields). |
| 9 | Shows last-session context when you choose a saved exercise (last-session-recall). |
| 14 | Separates two sessions on the same day when you select Finish session (same-day-sessions). |
| 7 | Groups the history by session (session-history). |
| 8 | Downloads every set as JSON or CSV (json-export, csv-export). |
| 9 | Imports new set IDs without replacing existing records (json-import-merge). |
| 9 | Keeps saved units unchanged when you change the default (unit-preservation). |
| 10 | Reloads the installed app offline after the first visit (offline-reload). |
| 10 | The app is free to use and needs no account. |
| 11 | Anonymous use loads no analytics, remote fonts, third-party scripts, or cloud sync. |
| 10 | Your sets stay in browser storage, and the erase control removes them. |
| 3 | It records sets. |
| 12 | It does not create workout plans or send records to a server. |
| 7 | Open the URL printed by Vite. |
| 11 | The production demo route is /?demo=1 or /demo; see .factory/demo.md. |
| 6 | The claim registry is .factory/claims.json. |
| 9 | Each row contains the exact command for its tagged test. |
| 13 | npm run build type-checks the source, builds the site, creates route files, and generates the service worker. |
| 7 | It writes dist/index.html and dist/sw.js. |
| 7 | Real records use the set-context-log IndexedDB database. |
| 4 | Demo records use demo:set-context-log. |
| 6 | Each has a separate localStorage fallback. |
| 10 | Deploy the complete dist/ directory to a static HTTPS host. |
| 6 | staticwebapp.config.json gives versioned assets immutable caching. |
| 5 | It revalidates HTML and sw.js. |
| 13 | It also sets the manifest MIME type, CSP, permissions policy, and the designed 404 response. |
| 10 | Privacy and Terms use real routes with shared navigation and route metadata. |
| 5 | The production site is https://set-context-log.sociobot.in. |
| 10 | The visual system and original image provenance are recorded in .factory/design.md. |
| 4 | MIT — see LICENSE. |

The current terminology table is accurate: set context, last-session context, session, history, JSON backup, and demo. Every visitor-facing claim-like sentence maps to a claims.json ID; remaining technical instructions are setup facts, not product promises.

## Demo and sandbox

One click opens /?demo=1; /demo works directly. The first demo screen already shows a Back squat recall card with two August 25 sets, one current Back squat set, and six realistic sets across four sessions. The persistent mobile banner says “Demo — sample data, nothing is saved” and provides Reset demo and Start for real.

Fresh storage inspection found separate demo:set-context-log and set-context-log databases. The isolation test creates a real record, mutates/resets demo data, and confirms the real record remains unchanged. Demo traffic was first-party only. With a controlled service worker, an offline reload had navigator.onLine false, retained the populated recall, and visibly read “Offline · sets still save” (11px text at 390px).

## Claims and local verification

npm ci completed with zero vulnerabilities. npm test passed 13 tests. npm run build passed and wrote dist/. npm run test:e2e passed. npm run test:claims passed all 17 claims. Every exact manifest command was then invoked separately; none failed.

| Claim | Result |
| --- | --- |
| demo-isolation | PASS — separate storage survives demo reset/exit. |
| set-fields | PASS — export contains numbers, unit, six markers, and note. |
| last-session-recall | PASS — prior details precede entry. |
| local-storage | PASS — persist/reload/erase work locally. |
| json-export | PASS — every seed downloads. |
| csv-export | PASS — rows, units, markers, escaping work. |
| json-import-merge | PASS — duplicate is preserved; new ID is added. |
| unit-preservation | PASS — saved unit remains unchanged. |
| session-history | PASS — six seeds appear in four sessions. |
| same-day-sessions | PASS — Finish session separates same-day recall. |
| offline-reload | PASS — demo reloads, saves, and reloads offline. |
| anonymous-runtime | PASS — no account or third-party runtime. |
| free-use | PASS — core controls have no purchase UI. |
| build-output | PASS — app, demo document, versioned worker emitted. |
| deployment-policy | PASS — headers, MIME, cache, and 404 checked. |
| site-routes | PASS — metadata and shared skeleton checked. |
| art-provenance | PASS — image/provenance records match. |

## Earlier-finding regression audit

Every review, polish report, verification report, and handoff was read. “Fixed” means live behavior and current supporting code/test were confirmed, rather than trusting the earlier status.

| Finding | Status | Confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | Cold first screen names job, user, action, and result. |
| F-1-2 | Fixed | One-click populated demo, banner, reset, and exit. |
| F-1-3 | Fixed | Separate namespace and isolation test. |
| F-1-4 | Fixed | 17 uniquely tagged claim tests. |
| F-1-5 | Fixed | Purchase path and price are absent. |
| F-1-6 | Fixed | Unknown route is styled HTTP 404. |
| F-1-7 | Fixed | Recall is before set entry. |
| F-1-8 | Fixed | Six markers and all fields save/export. |
| F-1-9 | Fixed | Local-only storage, erase, request checks pass. |
| F-1-10 | Fixed | Complete JSON backup test. |
| F-1-11 | Fixed | CSV row/escaping test. |
| F-1-12 | Fixed | Import only adds new IDs. |
| F-1-13 | Fixed | No speed claim; per-set unit retained. |
| F-1-14 | Fixed | History groups by session. |
| F-1-15 | Fixed | Offline demo reload/save exercised. |
| F-1-16 | Fixed | Complete app is free. |
| F-1-17 | Fixed | Anonymous runtime is first-party only. |
| F-1-18 | Fixed | License claim/feature removed. |
| F-1-19 | Fixed | Merchant/checkout copy removed. |
| F-1-20 | Fixed | Art provenance is recorded and hash-tested. |
| F-1-21 | Fixed | Node-version claim removed. |
| F-1-22 | Fixed | Development-worker claim removed. |
| F-1-23 | Fixed | Build-output claim tested. |
| F-1-24 | Fixed | README points to exact claim commands. |
| F-1-25 | Fixed | Billing/model integration and credential claim absent. |
| F-1-26 | Fixed | Deployment policy is short and tested. |
| F-1-27 | Fixed | Privacy and Terms are real shared routes. |
| F-1-28 | Fixed | Canonical, social image, and icons are live. |
| F-1-29 | Fixed | Legal pages share header/footer. |
| F-1-30 | Fixed | Footer has legal links, attribution, build ID. |
| F-1-31 | Fixed | Choose → Mark → Review sequence present. |
| F-1-32 | Fixed | H1 states the job. |
| F-1-33 | Fixed | Task headings are literal. |
| F-1-34 | Fixed | Recall wording is last-session context everywhere. |
| F-1-35 | Fixed | Recall outcome is concrete. |
| F-1-36 | Fixed | JSON-backup wording; no payment jargon. |
| F-1-37 | Fixed | Controls name results. |
| F-1-38 | Fixed | README is job-first; technical terms scoped. |
| F-1-39 | Fixed | Unmeasured Fast claim removed. |
| F-1-40 | Fixed | README statements are within 22 words. |
| F-1-41 | Fixed | Same-day sessions stay separate. |
| F-1-42 | Fixed | Failure messages provide recovery. |
| F-2-1 | Fixed | Recall term is last-session context. |
| F-2-2 | Fixed | Privacy → Home and Back focus #page-title and announce. |
| F-2-3 | Fixed | Mobile status uses visible Online/Offline text. |

## Structure, links, identity, and leverage

Home, Demo, Privacy, and Terms each return 200. An arbitrary route returns the designed 404, “Page not found — Set Context Log”, with a clear Return to log action. Inspected routes have one h1, main, header/footer, lang=en, title, description, canonical, OG/Twitter metadata, favicon, and legal links. robots.txt and sitemap.xml are present. Internal routes, the image, and the Param Factory external link all returned 200; hash links resolve in-page.

The mid-century training-instrument visual system is distinct: warm paper, olive rail, vermilion action, ruled recall card, instrument controls, and original product artwork. It is not a generic SaaS template. There is no missed AI feature: this deterministic local-recording job explicitly excludes workout generation, sync, and wearable work. The implied valuable portability step exists as JSON/CSV export plus JSON import.

## What would make this perfect

Nothing remains in the reviewed scope. Preserve the isolated demo, the last-session context terminology, and the tagged claim tests in future changes.
