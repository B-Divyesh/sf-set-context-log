# Set Context Log

Set Context Log records weight, reps, effort, and what changed for each lifting
set. It is for self-directed lifters who want last-session context before
their next set.

Try the isolated sample at
<https://set-context-log.sociobot.in/?demo=1>. It opens with realistic sessions
and never reads or changes the real log (`demo-isolation`).

## What it does

- Records kg or lb, reps, effort, six set-context markers, and a note
  (`set-fields`).
- Shows last-session context when you choose a saved exercise
  (`last-session-recall`).
- Separates two sessions on the same day when you select **Finish session**
  (`same-day-sessions`).
- Groups the history by session (`session-history`).
- Downloads every set as JSON or CSV (`json-export`, `csv-export`).
- Imports new set IDs without replacing existing records (`json-import-merge`).
- Keeps saved units unchanged when you change the default (`unit-preservation`).
- Reloads the installed app offline after the first visit (`offline-reload`).

The app is free to use and needs no account. Anonymous use loads no analytics,
remote fonts, third-party scripts, or cloud sync (`anonymous-runtime`). Your
sets stay in browser storage, and the erase control removes them
(`local-storage`).

It records sets. It does not create workout plans or send records to a server
(`anonymous-runtime`, `local-storage`).

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The production demo route is `/?demo=1` or
`/demo`; see [`.factory/demo.md`](.factory/demo.md).

## Test and build

```sh
npm test
npm run build
npm run test:e2e
npm run test:claims
```

The claim registry is [`.factory/claims.json`](.factory/claims.json). Each row
contains the exact command for its tagged test.

`npm run build` type-checks the source, builds the site, creates route files,
and generates the service worker. It writes `dist/index.html` and `dist/sw.js`
(`build-output`).

## Technical storage and deployment

Real records use the `set-context-log` IndexedDB database. Demo records use
`demo:set-context-log`. Each has a separate localStorage fallback.

Deploy the complete `dist/` directory to a static HTTPS host.
`staticwebapp.config.json` gives versioned assets immutable caching. It
revalidates HTML and `sw.js`. It also sets the manifest MIME type, CSP,
permissions policy, and the designed 404 response (`deployment-policy`).

Privacy and Terms use real routes with shared navigation and route metadata
(`site-routes`). The production site is
<https://set-context-log.sociobot.in>.

The visual system and original image provenance are recorded in
[`.factory/design.md`](.factory/design.md) (`art-provenance`).

## License

MIT — see [LICENSE](LICENSE).
