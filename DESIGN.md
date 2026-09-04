---
name: Caleb Oke Portfolio
description: A quiet, evidence-first portfolio for practical automation work. Five colours, one typeface, no ornament.
colors:
  bg: "#FAF8F4"
  text: "#1A1917"
  muted: "#6B6A64"
  border: "#E5E2DA"
  accent: "#14584A"
fonts:
  display: Public Sans 800 / 700
  body: Public Sans 400 / 500
---

# Design system: Caleb Oke portfolio

This documents the **locked** system. The source of truth for every value is
`design-reference/homepage-full.html`, the design export. It is gitignored
because it is a 6MB bundle; Caleb holds it locally.

Where this document and the code disagree, the code in `src/styles/tokens.css`
wins, and this document is out of date.

## The five colours

These five are the entire palette. **No other colour value appears anywhere in
the codebase** — not in CSS, not in JSON, not in an SVG.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#FAF8F4` | Page background. Nothing else. |
| `--text` | `#1A1917` | All body text, all headings, always. |
| `--muted` | `#6B6A64` | Captions and metadata only. Never a sentence. |
| `--border` | `#E5E2DA` | Hairlines and image outlines. |
| `--accent` | `#14584A` | Anchors, buttons, the status badge, focus rings. |

### Rules that are enforced by tests

- **Body text is always `var(--text)`.** A global rule sets it. If you find
  yourself colouring a word inside a sentence, that is a bug.
- **The accent is permitted only** on anchors, buttons, the status badge and
  focus rings.
- `--muted` is for captions and metadata, never for prose. It is the token
  most likely to be misused as "quieter body text".

Two tests guard this, both in `tests/rendered-html.test.mjs`:

- `the inlined stylesheet uses only the five palette colours` — parses every
  hex and functional colour out of the inlined CSS.
- `manifest.json uses only the five palette colours` — the stylesheet check
  cannot see JSON. This one exists because `manifest.json` kept `#05080d`
  from the previous design long after everything else had changed, and it
  paints Android browser chrome and the install splash screen.

**Contrast against `--bg`**, all passing WCAG AA for normal text:

| Pair | Ratio |
| --- | --- |
| `--text` on `--bg` | 16.6:1 |
| `--accent` on `--bg` | 7.8:1 |
| `--muted` on `--bg` | 5.1:1 |

`--muted` is the one to re-check if it ever moves. It has the least headroom,
and it is used at 13px where AA still only requires 4.5:1.

## Typography

**Public Sans sets everything** — hero, every heading, body, UI and captions.
Self-hosted from `public/fonts/` as woff2 subsets. There is no second family.

This replaced Instrument Serif in September 2026. The reasoning is worth
keeping, because it is the kind of decision that gets quietly reverted:

- Instrument Serif reads editorial. The site documents systems, and the brief
  became *direct and technical*, which a heavy grotesque answers and a
  high-contrast display serif does not.
- Instrument Serif ships in **one weight**, so the hero could only be made
  larger, never heavier.
- Public Sans is a **100–900 variable font that the site already shipped**, so
  the display weights cost zero additional bytes and dropping Instrument
  Serif removed 31.9 KB.

**Weights are the hierarchy now, alongside size:**

| Token | Value | Used by |
| --- | --- | --- |
| `--weight-hero` | 800 | `h1`, funnel counts |
| `--weight-heading` | 700 | `h2`, `h3`, `h4`, brand wordmark, success heading |
| — | 500 | UI emphasis |
| — | 400 | body copy, captions |

Tracking tightens as size grows: `--tracking-hero` is `-0.035em`,
`--tracking-heading` is `-0.025em`. A heavy grotesque at 64px needs negative
tracking or it reads loose and soft.

### Two traps

**`font-weight: 100 900` on every `@font-face` is load-bearing.** `base.css`
sets `font-synthesis: none`. If a face is declared at a single weight, the
browser will not synthesise the missing ones and will not fall back — it
renders the nearest declared weight instead, silently. Declaring the full
axis is what makes 700 and 800 real. A test asserts this.

**The preload must be the file that paints the LCP element.** The `h1` is the
largest contentful paint, so `index.html` preloads
`public-sans-latin.woff2` and nothing else. A preload left pointing at a
retired face is wasted bandwidth on the critical path. A test asserts there is
exactly one font preload.

Self-hosting is not a preference, it is a requirement: `vercel.json` sets a
Content Security Policy of `font-src 'self' data:`, so Google Fonts is blocked
at the browser level. A `<link>` to `fonts.googleapis.com` would fail silently
in production.

The latin subset is preloaded and every face is declared `font-display: swap`.

Base body text is **17px / 1.6**, with prose capped at **66ch** (`--measure`).
The 66ch cap comes from the reference; the original brief said roughly 68.

### One known weak pair

`h2` at 40px and a project `h3` at 34px are only a 1.18 ratio apart on
desktop, at the same weight and in the same family. Every other adjacent pair
is 1.5 or wider. Context carries it — a project title sits inside a bordered
card under a status badge — but if the two ever need separating, drop
`--step-project` to 30px for a 1.33 ratio. At 390px the pair is already fine
at 1.25.

The full scale lives in `src/styles/tokens.css` with a mobile override at
`max-width: 720px`. Headings run `60 / 40 / 34 / 22` on desktop and
`38 / 30 / 24 / 19` on mobile.

## Layout

| Token | Desktop | ≤720px |
| --- | --- | --- |
| `--page` | 1120px | — |
| `--col` | 900px | — |
| `--col-narrow` | 640px | — |
| `--gutter` | 64px | 20px |
| `--section-y` | 80px | 40px |
| `--card-pad` | 40px | 20px |

## Image slots and the width maths

**This is the part most likely to rot.** The webp width ladders in
`lib/image-sizes.ts` are derived from `--col`, `--gutter` and `--card-pad`.
Change any of those three and the ladders are silently wrong — the images will
still render, they will just be the wrong size, and nothing will fail.

The derivation, with `box-sizing: border-box` throughout:

```
card inner width  = --col − 2 × --card-pad   = 900 − 80  = 820px   (desktop, capped)
                  = viewport − 2×64 − 2×40   = vw − 208            (720–1028px band)
                  = viewport − 2×20 − 2×20   = vw − 80             (≤720px)
```

**820px is the widest any full-width slot ever renders.** Every ladder is built
from that number.

| Slot | Rendered width | Widths generated |
| --- | --- | --- |
| Video thumbnail, order sheet, job pipeline canvas | 820px | 400, 820, 1232, 1640 |
| Restaurant canvas (`2.37fr` of the evidence grid) | 560px desktop, 640px mobile | 320, 640, 960, 1280 |
| Telegram alert (pinned by `maxWidth: 270px`) | 270px | 270, 591 |
| Vapi transcript | 236px slot × 3.7 zoom = 874px drawn | 960, 1919 |

Two notes on the last two rows:

- The **restaurant canvas gets wider on mobile**, not narrower: the evidence
  grid collapses to one column below 720px, so 640 is the worst case, not 560.
- The **transcript** renders as a zoomed CSS background, which cannot use
  `sizes`. It uses `image-set()` at 1x and 2x behind an `@supports` guard, with
  the original PNG as the declared fallback. It is the only image where mobile
  downloads more than desktop.

Fixed aspect ratios, so a screenshot can never letterbox or crop badly:

| Ratio token | Value | Used by |
| --- | --- | --- |
| `--ratio-wide` | 16 / 9 | n8n canvases, video thumbnail |
| `--ratio-sheet` | 1917 / 937 | order sheet, its native ratio |
| `--ratio-transcript` | 3 / 4 | Vapi transcript |
| `--ratio-phone` | 9 / 16 | Telegram alert |
| `--ratio-portrait` | 4 / 5 | portrait |

Every image slot carries a thin `--border` outline, a `--muted` caption
underneath, and explicit `width`/`height` so nothing shifts as it loads.

## Components

Six components carry the whole site. Every one is built from the same four
moves: a hairline `--border`, generous padding, one weight change, and the
accent used sparingly. Nothing here has a radius, a shadow, or a fill other
than `--bg` and `--accent`.

### Buttons

Three kinds, and the distinction is meaning, not decoration.

| | Fill | Border | Text | Padding | Hover |
| --- | --- | --- | --- | --- | --- |
| `.buttonPrimary` / `.navAction` | `--accent` | `--accent` | `--bg` | `13px 22px` / `9px 16px` | fill and border go `--text` |
| `.buttonText` | none | bottom only, `--accent` | `--accent` | `0 0 2px` | text and rule go `--text` |
| `.formActions button` | `--accent` | `--accent` | `--bg` | `13px 28px` | fill and border go `--text` |

The submit button is the only one with press feedback: `scale(0.98)` over
140ms. It is the one moment a visitor commits to something. Disabled state is
`opacity: 0.65` and `cursor: not-allowed`, used while a submission is in
flight so a double tap cannot create two records.

**The trap:** `.navAction` sits inside `.navDesktop`, so `.navDesktop > a` at
specificity (0,1,1) beats `.navAction` at (0,1,0). It shipped once with a
transparent bottom border — three accent sides and a missing fourth. The nav
underline rule is scoped `:not(.navAction)` for that reason.

### Status badge

`.badge` — the only place other than links, buttons and focus rings where the
accent is allowed.

- `1px solid var(--accent)` outline, `--accent` text, no fill
- `--step-badge` (12px), padding `4px 10px`
- `align-self: flex-start`, so it never stretches to its container

It states what kind of thing a project is — "Academy prototype", "Running
system" — before any claim about it is read. It appears above the title on
both the homepage card and the case study page. A visitor arriving from search
has not seen the homepage and needs it more, not less.

### Image slot

`.mediaSlot` wraps `.mediaFrame` plus a `.mediaCaption`. The frame is a fixed
aspect-ratio box so a screenshot can never letterbox or crop badly.

- `1px solid var(--border)` outline, `overflow: hidden`
- `aspect-ratio` from the `data-ratio` attribute — see the ratio table above
- The image is `position: absolute; inset: 0; object-fit: cover`
- Caption: `--step-meta`, `--muted`, `padding-top: 8px`, capped at `--measure`
- Explicit `width`/`height` on every image, and `loading="lazy"`

Two variants. `data-align="center"` narrows and centres the slot with a
centred caption, used for the Telegram phone shot. A slot with a `zoom` value
renders as a zoomed CSS background with `role="img"` and an `aria-label`
rather than an `<img>`, used for the transcript, because the interesting
region is a crop of a much wider screenshot.

### Funnel

Four labelled stages in a CSS grid. No bars, no chart library, no icons, no
SVG — the numbers are the diagram.

- `grid-template-columns: repeat(var(--stages), 1fr)`, driven by the data
- Hairline `border-left` between stages; first and last drop their outer
  padding so the row aligns flush with the column
- Label: `--step-meta`, `--muted`, `min-height: 36px` so counts sit on one
  baseline regardless of label wrap
- Count: `--step-figure` at `--weight-hero` with `tabular-nums`

Horizontal on desktop, stacked below 720px. It is a `<ol>`, because the
stages are a real sequence and the order carries information.

### Form field

`.field` — label, control, and error message as one column with a 7px gap.

- Visible `<label>` above the control, never placeholder-only
- `border: 1px solid var(--muted)`, **not** `--border`. An input boundary is a
  UI component under WCAG 1.4.11 and needs 3:1; `--border` on `--bg` is only
  1.22:1, while `--muted` is 5.11:1. This is the one place the border token is
  deliberately not used for a border.
- Error state darkens the boundary to `--text` and puts the message under the
  field behind a 3px rule, linked with `aria-describedby`. **No red** — the
  palette has five colours and none of them is red. Weight and position carry
  the error instead of hue.

### Offer card

`.offer` — a bordered column with the price under the title and a rule above
the footnote.

- `1px solid var(--border)`, padding `--card-pad-sm` (26px, 20px on mobile)
- Title `--step-card` at heading weight, price `--step-meta` in `--muted`
- Body `--step-card-body` (16px), one step down from page body
- `.offerLimit` uses `margin-top: auto` with a `padding-top: 20px` rule, so
  the honest-limitation line pins to the bottom of every card and the three
  form one line regardless of body length

Three across on desktop, one column below 720px. The grid takes `--col`, so
the cards are the widest thing in the section.

## Constraints

**Do not add:**

- **Gradients.** Anywhere.
- **Shadows.** No `box-shadow`, no `text-shadow`, no elevation.
- **Icon grids.** No icon sets, no decorative glyphs. The funnel diagram is
  explicitly icon-free.
- **Generated imagery.** No illustrations, no stock photography, no AI images.
  Every image on the site is a screenshot of something that actually ran, or a
  photograph of Caleb.
- **Chart libraries.** The funnel is four numbers in a CSS grid with hairline
  borders. No bars, no SVG chart, no dependency.
- **A sixth colour.** Including in JSON, SVG or an inline style.
- **Border radius.** Every corner on the site is square.

**Do:**

- Reach for a hairline `--border` rule before reaching for a container.
- Let whitespace do the separating.
- Set numbers at `--weight-hero` and their labels in muted 400.
- Keep the accent rare. It should read as a signal, not as decoration.

## Accessibility

- Every interactive element has a visible focus ring in `--accent`. Default
  outlines are never removed without a replacement.
- Heading levels run in order, no skipped levels. Tested.
- Every image has alt text describing what the screenshot shows, never
  "screenshot". Tested.
- The mobile menu is a `<details>` element, so it opens without JavaScript.
- The site works with JavaScript disabled for everything except form
  submission. Pages are prerendered to static HTML at build time.
