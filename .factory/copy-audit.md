# Copy audit — polish 1

Audited 2026-08-28. Counts treat hyphenated terms, URLs, and code tokens as
one word. No sentence exceeds 22 words. No shipped sentence uses a banned
marketing word.

## First-screen read aloud

“Log what changed each lifting set. For self-directed lifters who need last
session’s context before the next set. Try it with sample data.”

The job, user, and first action fit in one breath. The action’s adjacent line
explains that it opens a separate sample.

## Landing and app copy

| Words | Sentence or complete UI message |
| ---: | --- |
| 6 | Log what changed each lifting set. |
| 12 | For self-directed lifters who need last session’s context before the next set. |
| 7 | Opens a separate demo with sample sessions. |
| 2 | No account. |
| 6 | Works offline after first visit. |
| 3 | Free to use. |
| 9 | Review the last set before logging the next one. |
| 4 | Opening your local log… |
| 9 | Choose a saved exercise or type a new one. |
| 4 | No saved sets yet. |
| 7 | Your first set will appear here. |
| 9 | Saved exercises show their previous session above the entry fields. |
| 11 | Add weight, reps, effort, a set-context marker, or a short note. |
| 9 | Previous-set context appears before you log the next set. |
| 7 | Saved markers appear with each past set. |
| 6 | Download a JSON backup or CSV file. |
| 8 | Import adds new sets without replacing saved sets. |
| 3 | It records sets. |
| 12 | It does not create workout plans or send records to a server. |
| 7 | Review set context before the next lift. |
| 5 | Original generated hero art. |
| 8 | Changing the default does not convert saved sets. |
| 5 | A fresh version is ready. |

Headings and controls are also literal: “Log today’s sets,” “Finish session,”
“Choose an exercise,” “Mark what changed,” “Review last session,” “Past sets
and notes,” “Export JSON,” “Export CSV,” “Import JSON,” “Change settings,”
“Install app,” “Keep set,” and “Reload app.”

## Runtime copy

| Maximum words | Message or template |
| ---: | --- |
| 11 | No earlier session for [exercise]. Save this set to review it next session. |
| 3 | No context marked. |
| 6 | No saved exercises match that search. |
| 7 | [Exercise] set saved in this browser. |
| 19 | The set could not be saved because browser storage is unavailable. Check site storage permission, then try again. |
| 15 | Remove the [exercise] set at [weight] [unit] × [reps]? This cannot be undone. |
| 2 | Set removed. |
| 18 | The set could not be removed because browser storage is unavailable. Reload while online, then try again. |
| 9 | Default unit saved. Saved sets were not converted. |
| 18 | The default unit could not be saved because browser storage is unavailable. Check site storage permission, then try again. |
| 15 | Erase all [count] sets and settings from this browser? Export first if you need a backup. |
| 5 | All local training data erased. |
| 15 | The data could not be erased because browser storage is unavailable. Reload while online, then try again. |
| 9 | Session finished. Start another set when you are ready. |
| 18 | The session could not be finished because browser storage is unavailable. Check site storage permission, then try again. |
| 6 | Exported [count] sets as JSON. |
| 6 | Exported [count] sets as CSV. |
| 8 | Backup read successfully; all sets were already here. |
| 17 | The backup could not be saved because browser storage is unavailable. Check site storage permission, then try again. |
| 14 | The app could not be installed. Use your browser menu to try again. |
| 13 | Offline setup failed. Keep this page open, then reload while online to try again. |
| 8 | Demo reset to the original sample sessions. |
| 16 | The demo could not be reset because browser storage is unavailable. Reload the demo, then try again. |
| 14 | The demo could not be cleared. Reset the demo before starting your real log. |
| 14 | Set Context Log could not open browser storage. Reload the page or allow site storage. |

Validation and import messages are direct recovery instructions. Their longest
message is 12 words: “That file is not a Set Context Log v1 backup.”

## README copy

| Words | Sentence or product bullet |
| ---: | --- |
| 14 | Set Context Log records weight, reps, effort, and what changed for each lifting set. |
| 15 | It is for self-directed lifters who want the last session’s context before their next set. |
| 21 | Try the isolated sample at [demo URL]. It opens with realistic sessions and never reads or changes the real log. |
| 14 | Records kg or lb, reps, effort, six set-context markers, and a note. |
| 11 | Shows the previous session when you choose a saved exercise. |
| 14 | Separates two sessions on the same day when you select Finish session. |
| 7 | Groups the history by session. |
| 8 | Downloads every set as JSON or CSV. |
| 9 | Imports new set IDs without replacing existing records. |
| 9 | Keeps saved units unchanged when you change the default. |
| 10 | Reloads the installed app offline after the first visit. |
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
| 5 | The production site is [URL]. |
| 10 | The visual system and original image provenance are recorded in .factory/design.md. |
| 4 | MIT — see LICENSE. |

## Terminology

| Concept | One term used |
| --- | --- |
| Marker or note attached to a set | set context |
| Context shown from the last completed workout | previous-session context |
| One bounded workout | session |
| Stored earlier sessions | history |
| Downloadable restore file | JSON backup |
| Browser-only sample environment | demo |
