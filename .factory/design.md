# Set Context Log — visual thesis

## Direction: the mid-century training instrument

Set Context Log should feel like a compact, dependable measuring instrument
found beside a 1960s training bench: warm enamel, stamped labels, a dark gauge
face, and one vermilion control used only for the important action. The visual
language supports the product's purpose—remembering the condition of a set—by
making prior evidence read like a clipped service card, not a social feed or a
spreadsheet. Decoration is limited to things that explain state: ruled paper,
gauge ticks, and an original hero still life of the instrument.

The interface is intentionally single-mode. Its warm paper field and near-black
ink are essential to the archival logbook metaphor; explicit backgrounds are
painted at every layer. A dark scheme would turn that metaphor into a generic
dashboard, so the app instead keeps one high-contrast treatment in all system
themes.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| paper | `#F4EBD8` | page and archival paper |
| paper-high | `#FFF9EC` | working controls and lifted sheets |
| panel | `#D9CBAE` | instrument housing |
| ink | `#20241E` | primary text and hard outlines |
| olive | `#4D5638` | brand surface and secondary controls |
| olive-dark | `#303722` | accessible olive text/background |
| muted | `#686656` | secondary text (AA on paper-high) |
| vermilion | `#B63C28` | primary action and alerts |
| vermilion-dark | `#7D2519` | hover/accessible small text |
| brass | `#BA8A3B` | focus halo and selected markers |
| success | `#2F6848` | saved/online status |
| warning | `#8A5515` | offline/update status |
| danger | `#8B2E25` | destructive actions |

All body combinations target WCAG AA (4.5:1 minimum). Status always includes a
word or symbol, never color alone. Focus uses a two-part ink/brass ring.

## Type

- Display and labels: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, then
  system sans-serif. Uppercase is limited to short instrument labels with
  generous tracking.
- Body and controls: `Georgia`, `Charter`, `Cambria`, serif. The warmth and
  distinct numerals suit a handwritten training record without sacrificing
  legibility.
- No font downloads. System faces preserve privacy, speed, and offline first
  paint. Numeric inputs and log rows use `font-variant-numeric: tabular-nums`.
- Scale: 14 label / 16 body / 20 section / 28 subhead / 44 display (fluid down
  to 36 on narrow screens). Body line height is 1.5.

## Spacing and shape

An 8 px base rhythm (`4, 8, 12, 16, 24, 32, 48, 64`). Reading measure tops out
at 72 characters; the workbench is 1120 px. Controls are at least 48 px high,
with 12 px between adjacent touch targets. Cards appear only for separate
objects: the previous-set context card, the active entry console, and individual
history sessions. Corners are restrained (`2–12 px`) like formed sheet metal,
not pill-heavy software chrome. Two-pixel rules and offset shadows provide the
physical depth.

## Interaction grammar

- The persistent top rail exposes the product name, offline state, and settings.
- Demo mode adds a vermilion specimen label with reset and exit controls. Its
  compact first screen reveals the seeded workbench without losing the normal
  page’s job-first heading.
- The first task is always exercise selection. Choosing an exercise reveals its
  previous-set context directly above the entry row, preserving decision order.
- Set context uses six large labeled keys (`Clean`, `Grip`, `Pause`,
  `Tempo`, `Form`, `Easy`). A short note remains optional and specific.
- Saving produces a brief mechanical press and a live-region confirmation; the
  saved row enters from its source. Deletion requires a named confirmation.
- History groups by session and exercise. The mobile screen drops explanatory
  hero copy after first use and stacks the numeric controls without hiding the
  recall evidence.

## Motion

Motion has mechanical origin and lasts 160–240 ms: button depression, card
settling, toast entering from the lower rail. Only `transform` and `opacity`
animate. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and
smooth scrolling are removed and status changes are instant.

## Original asset plan and provenance

### `panel-memory.webp`

- Use: compact landing/empty-state illustration; it clarifies the product as a
  decision-memory instrument rather than a workout tracker.
- Prompt sheet / use case: `stylized-concept`.
- Subject: top-down three-quarter still life of a compact mid-century exercise
  log instrument, with one weight dial, rep counter, six context keys, and a
  previous-set paper card emerging from a slot.
- World/materials: warm cream enamel, olive bakelite, brushed brass, red-orange
  key, fibrous paper, subtle gym-bench rubber texture.
- Light/lens: soft directional studio light, 50 mm product lens, restrained
  shadows, quiet editorial composition with clear object silhouette.
- Palette words: parchment, warm cream, army olive, charcoal ink, oxidized
  brass, vermilion.
- Negative list: people, hands, bodies, logos, brand marks, legible text,
  watermark, neon, gradient background, futuristic screens, medical imagery,
  photographic gym clutter.
- Model: factory Azure image deployment (`factory-image`), generated 2026-08-27.
- License/provenance: original AI-generated asset commissioned for this product;
  no third-party source material is shipped. Source PNG and exact prompt sidecar
  are retained in `assets/src/`.

App icons and functional symbols are hand-authored SVG/CSS geometry using the
same panel vocabulary. They are original product assets.

The 1200×630 `public/og-image.png` is a centered crop of the generated source
art. `public/icons/apple-touch-icon.png` is a 180×180 derivative of the
hand-authored app icon. Both were produced locally on 2026-08-28; no new source
material was introduced.
