# Set Context Log

Set Context Log is a private, offline-first set recorder for self-directed
lifters. It captures weight, reps, RPE, a one-tap context marker, and a short
set-specific note. When the exercise comes up in a later session, the prior
sets and their caveats appear before the next entry.

The app is a decision-memory layer, not a workout program, exercise catalog,
social feed, wearable client, or medical tool. The production site is
<https://set-context-log.sociobot.in>.

## Product behavior

- Fast set entry with per-entry kg/lb (history is never silently converted)
- `Clean`, `Grip`, `Pause`, `Tempo`, `Form`, and `Easy` context keys
- Automatic prior-session recall for the selected exercise
- Today view plus a local archive grouped by session date
- IndexedDB storage with a localStorage fallback
- Portable JSON backup/import and spreadsheet-ready CSV export
- Installable PWA with a precached shell and tested offline reload
- Optional $9 one-time license for full archive visibility, search, and the
  context-rate readout; logging, recall, accessibility, and export stay free

No account, analytics, third-party runtime script, remote font, or cloud sync
is used. Training data never leaves the device. A stored paid license is
verified against the Sociobot billing API at most once per day.

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

The development server uses Vite. Service-worker registration is intentionally
disabled in development to avoid stale local assets.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It type-checks the application,
builds with Vite, and generates the versioned service worker. Static output is
written to `dist/`, with `dist/index.html` at its root. The Playwright suite is
pinned to 1.58.2 and covers mobile logging, persistence, import/recall,
accessibility, and an offline reload.

To exercise staging billing, set `VITE_BILLING_API_BASE` at build time:

```sh
VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1 npm run build
```

Production defaults to `https://api.sociobot.in/api/v1`. No product ID or
payment-provider credential is stored in this repository.

## Data and deployment

The JSON format is identified by `set-context-log/v1`; imports merge by set ID
and do not overwrite existing sets. Browser storage should not be treated as a
backup, so users who value long-term records should export periodically.

Deploy the complete `dist/` directory to any static host with HTTPS. The
factory owns infrastructure, DNS, billing registration, and production
deployment. Privacy and terms are available at `/privacy/` and `/terms/`.

The visual system and image provenance are in
[`.factory/design.md`](.factory/design.md). Build verification and known gaps
are recorded in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
