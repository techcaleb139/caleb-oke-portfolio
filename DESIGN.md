---
name: Caleb Oke Portfolio
description: An evidence-first commissioning dossier for accountable automation work.
colors:
  commissioning-blue: "#0b4db8"
  commissioning-blue-hover: "#083d93"
  commissioning-blue-soft: "#e7eefb"
  mineral-canvas: "#f1f5f7"
  white-surface: "#ffffff"
  quiet-mineral: "#e7edf1"
  carbon-ink: "#12202b"
  slate-copy: "#506270"
  mineral-line: "#c9d4dc"
  mineral-line-strong: "#9eacb7"
  on-commissioning-blue: "#ffffff"
  failure-red: "#a61b16"
  failure-wash: "#fff0ef"
  verified-green: "#176b4b"
  verified-wash: "#e8f5ef"
  dark-canvas: "#0e171f"
  dark-surface: "#15232d"
  dark-surface-quiet: "#192934"
  dark-ink: "#eff4f7"
  dark-muted: "#a8b5be"
  dark-line: "#2d3c47"
  dark-line-strong: "#53636f"
  dark-commissioning-blue: "#79a7ff"
  dark-commissioning-blue-hover: "#96baff"
  dark-commissioning-blue-soft: "#1c3358"
  dark-on-commissioning-blue: "#0e171f"
  dark-failure-red: "#ff938a"
  dark-failure-wash: "#3a2020"
  dark-verified-green: "#7bd6ad"
  dark-verified-wash: "#15382b"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(4rem, 5.8vw, 5.1rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.7rem, 4.9vw, 4.6rem)"
    fontWeight: 660
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 3.8vw, 3.7rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Azeret Mono, Cascadia Mono, monospace"
    fontSize: "0.76rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  dossier: "8px"
spacing:
  tight: "10px"
  control: "14px"
  cluster: "22px"
  panel: "28px"
  section-min: "96px"
  section-max: "152px"
components:
  button-primary:
    backgroundColor: "{colors.commissioning-blue}"
    textColor: "{colors.on-commissioning-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.dossier}"
    padding: "0 21px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.commissioning-blue-hover}"
    textColor: "{colors.on-commissioning-blue}"
    typography: "{typography.body}"
    rounded: "{rounded.dossier}"
    padding: "0 21px"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.dossier}"
    padding: "0 21px"
    height: "50px"
  input-default:
    backgroundColor: "{colors.mineral-canvas}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.dossier}"
    padding: "13px 14px"
    height: "50px"
  card-dossier:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.dossier}"
    padding: "28px"
---

# Design System: Caleb Oke Portfolio

## Overview

**Creative North Star: "The Commissioning Dossier"**

The portfolio behaves like a concise technical dossier prepared before a system is commissioned. It is evidence-first and trust-first: strong claims sit beside the workflow image, test observation, known limit, and next human checkpoint that make each claim credible. Cool mineral surfaces create calm scrutiny, while commissioning blue marks the actions, labels, and system stages that deserve attention.

The interface is spacious but not ornamental. Broad editorial fields, documentary images, ruled evidence structures, and terse mono labels make the page feel inspected and accountable. Human presence is literal in the approved portrait and procedural in every review or handover step; the system must never drift into generic AI-agency spectacle, anonymous dark-tech gloss, or inflated proof.

**Key Characteristics:**

- Evidence and limitation are presented as a matched pair.
- Cool mineral surfaces carry most of the page; commissioning blue stays directional.
- Real portraits and workflow captures outrank decorative illustration.
- One gently rounded corner language keeps the dossier coherent.
- Dense operational detail is separated by rules, spacing, and mono evidence labels.
- Motion is brief, interruptible, and absent when reduced motion is requested.

## Colors

The palette pairs cool mineral neutrals with a single commissioning-blue accent, reserving red and green for truthful system feedback; the same semantic roles switch to a darker mineral set through the user's color-scheme preference.

### Primary

- **Commissioning Blue:** Directs primary actions, linked evidence, numbered stages, and terse operational labels.
- **Deep Commissioning Blue:** Replaces the primary accent on hover so interaction gains certainty without glow or spectacle.
- **Commissioning Wash:** Marks low-intensity interactive surfaces, including project-index hover and input focus support.

### Neutral

- **Mineral Canvas:** The default page field; cool enough to feel technical without becoming clinical.
- **White Surface:** The clean inspection layer used for forms, capability sections, and the project index.
- **Quiet Mineral:** A stronger tonal band for reflective or biographical content.
- **Carbon Ink:** The high-contrast text and control color.
- **Slate Copy:** Secondary copy, captions, and supporting metadata.
- **Mineral Line / Strong Mineral Line:** The ruled structure for tables, rails, cards, fields, and separators.
- **Dark Mineral Set:** A complete semantic dark-mode mapping for canvas, surfaces, ink, muted copy, rules, and the commissioning accent.

### Tertiary

- **Failure Red / Failure Wash:** Validation and submission failure only.
- **Verified Green / Verified Wash:** Confirmed submission success only.

### Named Rules

**The Commissioning Blue Rule.** Blue points to action, evidence, state, or system sequence; it is never sprayed across passive decoration.

**The Evidence State Rule.** Red and green communicate observed form or submission state only, never project category or personality.

**The Mineral Continuity Rule.** Light and dark themes preserve the same semantic hierarchy rather than becoming separate visual identities.

## Typography

**Display Font:** Archivo (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Atkinson Hyperlegible Next (with Segoe UI and sans-serif fallbacks)  
**Label/Mono Font:** Azeret Mono (with Cascadia Mono and monospace fallbacks)

**Character:** Archivo gives claims a compressed, engineered authority; Atkinson Hyperlegible Next keeps long explanations unusually readable; Azeret Mono makes evidence labels feel recorded rather than advertised. The trio separates proposition, explanation, and verification without decorative type effects.

### Hierarchy

- **Display** (700, fluid 4rem–5.1rem, 1.02): The single opening proposition; on small screens it resolves to a 3rem–4.5rem range.
- **Headline** (660, fluid 2.7rem–4.6rem, 1.02): Major section statements, held to roughly 15 characters per line where the layout permits.
- **Title** (650, fluid 2.25rem–3.7rem, 1.02): Case-study titles and other evidence-group headings.
- **Body** (400, 17px, 1.65): Explanatory content, generally constrained near 62ch; compact metadata steps down below this base.
- **Label** (500, 0.76rem, 1.5): Status, stage, tool, caption, and process metadata; keep it terse and use ordinary case.

### Private CMS optical scale

The publishing desk is a dense operator surface, so it uses a deliberately tighter optical scale than the public narrative pages. These sizes are design-system values, not arbitrary component overrides:

- **Micro record:** 0.58rem, 0.64rem, 0.66rem, 0.68rem, 0.69rem, 0.7rem, and 0.72rem for revision, status, checklist, stage, and timestamp data.
- **Compact control:** 0.8rem, 0.82rem, and 0.86rem for filters, inputs, buttons, and rail titles.
- **Operator body:** 0.95rem, 1rem, 1.1rem, and 1.35rem for explanatory copy, section labels, and the publishing-desk mark.
- **Operator display:** 2rem, 2.35rem, 2.6rem, 2.85rem, 3rem, and 3.2rem for login, editor, empty-state, and security-page titles across responsive breakpoints.

The close increments preserve hierarchy in a data-dense interface without borrowing the public site’s oversized editorial rhythm. Do not introduce another CMS size unless it replaces an existing step.

### Named Rules

**The Three Voices Rule.** Archivo states the proposition, Atkinson explains it, and Azeret records evidence; do not swap these roles for novelty.

**The Balanced Claim Rule.** Large headings use tight leading and balanced wrapping, while explanatory copy stays comfortably spaced and measure-limited.

## Layout

The primary shell is capped at 1200px with 32px side gutters on desktop, 24px at tablet widths, 20px below 760px, and 15px below 430px. Sections use a fluid vertical interval from 96px to 152px; the mobile section interval becomes 88px. The hero is a weighted two-column field with copy on the left and the approved portrait on the right, while case studies alternate between a split evidence layout and a 12-column wide layout.

Evidence structures use explicit grids: five equal stages in the verification rail, a two-column observed/limit/next-test panel, three-column capability rows, and a four-cell system map. At 1024px the complex split sections collapse to one column; at 760px rails and tables become stacked reading sequences, the navigation becomes a bounded menu panel, and touch targets remain at least 44px high. At 430px dual-column utilities become single-column.

**The Inspection Order Rule.** Responsive collapse preserves reading order—claim, image, system path, observed result, known limit, next test—so mobile never separates proof from context.

**The Broad Field Rule.** Empty space is part of the evidence hierarchy; do not fill the 96px–152px section rhythm with decorative modules.

## Elevation & Depth

The system is flat by default and uses ruled boundaries plus tonal layering for most separation. One ambient dossier shadow lifts only substantial inspection surfaces: the portrait, mobile menu, contact form, and framed workflow imagery. The sticky header uses translucent canvas and a 16px backdrop blur to preserve orientation without becoming a floating glass card.

### Shadow Vocabulary

- **Dossier Lift** (`0 18px 48px rgba(18, 32, 43, 0.09)`; dark mode `0 18px 48px rgba(0, 0, 0, 0.28)`): Large, consequential surfaces only.
- **Workflow Lift** (`0 18px 48px rgba(18, 32, 43, 0.08)`): The restrained frame beneath real workflow evidence.
- **Focus Halo** (`0 0 0 3px var(--accent-soft)`): Field focus only, paired with the commissioning-blue border.

### Named Rules

**The Flat-by-Default Rule.** If a one-pixel rule or tonal shift explains the boundary, do not add a shadow.

**The Consequence Rule.** Elevation marks surfaces where the visitor inspects identity, navigation, evidence, or their own submitted information.

## Shapes

The form language uses one gently curved 8px dossier radius across buttons, images, fields, status blocks, the system map, navigation panels, and substantial containers. Large compositions remain rectilinear and grid-led; fine rules, not nested pills, define structure. Workflow imagery is clipped to the same radius and set inside a dark evidence frame so source material reads as an artifact rather than decoration.

**The One Radius Rule.** Use the established 8px corner wherever a contained surface needs rounding; do not introduce a second soft-card radius.

**The No Pill Rule.** Labels and metadata remain typographic or rule-bound, not capsule-shaped badges.

## Components

### Buttons

Buttons feel direct and commissioning-ready: substantial, quiet, and explicit.

- **Shape:** Gently curved dossier corners (8px) with a 50px minimum height and 21px horizontal padding.
- **Primary:** Commissioning-blue fill with white text in light mode; the dark semantic mapping reverses to dark canvas text on lighter blue.
- **Hover / Focus:** Primary darkens on precise-pointer hover; every button inherits a visible 3px focus outline with 4px offset; active press scales to 0.98.
- **Secondary:** Transparent with the strong mineral border; hover shifts both border and text to commissioning blue.
- **Disabled:** Opacity falls to 0.5, the pointer becomes unavailable, and press transform is removed.

### Cards / Containers

Containers feel like inspected sheets or equipment plates, not interchangeable marketing cards.

- **Corner Style:** One 8px dossier radius on bounded surfaces; evidence rails themselves remain straight and ruled.
- **Background:** White or quiet-mineral surfaces over the mineral canvas; workflow evidence uses a dark capture frame.
- **Shadow Strategy:** Flat by default; Dossier Lift only on consequential surfaces.
- **Border:** One-pixel mineral rules, strengthened only for inputs and explicit boundaries.
- **Internal Padding:** Compact evidence cells begin around 22px–28px; the contact form expands fluidly from 28px to 50px on larger screens.

### Inputs / Fields

Fields feel like part of a reviewable brief rather than a lead-capture funnel.

- **Style:** Strong mineral stroke, mineral-canvas fill, 8px radius, and 13px by 14px internal padding; single-line inputs keep a 50px minimum height.
- **Focus:** Commissioning-blue border, white surface, and a 3px commissioning wash halo.
- **Error / Disabled:** Invalid fields use failure red and its wash; inline errors remain visible text, and the form adds a linked summary when needed.

### Navigation

The sticky navigation uses compact body labels and a dark ink action, with a translucent mineral header and one bottom rule. On mobile, a 44px menu control reveals a white dossier panel between 20px gutters; links expand to 46px touch rows, and the project action becomes centered and full-width within the panel.

### Evidence Rail

The signature verification rail is a five-stage ordered path separated by one-pixel rules. Azeret Mono stage names use commissioning blue, while concise slate explanations make each system step inspectable. It stacks in source order on mobile and never becomes a carousel.

### Evidence Panel

Observed result, known limit, and next test form one ruled unit. The observed result receives the wider field, while the limit and next test share the narrower column; mobile collapses them to a single sequence without changing their relationship.

## Do's and Don'ts

### Do:

- **Do** pair every consequential claim with observed evidence, a known limit, or a next test.
- **Do** use commissioning blue for direction and verification cues, not as ambient decoration.
- **Do** preserve the approved portrait and real workflow imagery as the dominant visual proof.
- **Do** maintain the 8px dossier radius, one-pixel mineral rules, and generous section rhythm.
- **Do** preserve visible focus, 44px touch targets, reduced-motion behavior, and semantic light/dark parity.
- **Do** keep human review, confirmation, and handover checkpoints visible in system narratives.

### Don't:

- **Don't** turn the portfolio into a generic AI-agency card grid, neon tech spectacle, or anonymous dark dashboard.
- **Don't** imply client deployment, operational savings, or production readiness when the evidence only supports a prototype or personal system.
- **Don't** hide limitations below decorative imagery or detach them from the result they qualify.
- **Don't** add pill badges, gradient fills, ornamental glows, or competing accent colors.
- **Don't** replace workflow captures with abstract AI illustrations when real system evidence exists.
- **Don't** animate structural content continuously; use only brief entry and state transitions, and honor reduced-motion preferences.
