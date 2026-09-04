/* Width ladders for the build-time webp generation.

   Single source of truth in two directions:

   1. The Vite plugin encodes exactly these widths and ProjectMedia builds its
      srcset from the same table, so the encoder and the markup cannot drift.
   2. Every width and every sizes string below is COMPUTED from the layout
      constants, never typed out. Changing --w-wide moves the ladders, the
      breakpoints and the sizes attributes together.

   The one thing that cannot be shared is the CSS itself: TypeScript cannot
   read a custom property. LAYOUT mirrors src/styles/tokens.css and
   components.css by hand, and tests/image-ladders.test.mjs parses those files
   and fails if any value here disagrees.

   That link broke once already. When --col 900 became --w-wide 1240 the
   ladders silently kept their old numbers: the images still rendered, just at
   the wrong size, and nothing failed. */

/* ---- Mirrored from CSS. Guarded by tests/image-ladders.test.mjs. ---- */
export const LAYOUT = {
  /** --w-wide, the project card cap. */
  wide: 1240,
  /** --gutter, desktop and at most 720px. */
  gutter: 64,
  gutterSmall: 20,
  /** --card-pad, desktop and at most 720px. */
  cardPad: 40,
  cardPadSmall: 20,
  /** The one breakpoint in the stylesheet. */
  mobileBreakpoint: 720,
  /** .evidence gap, and the first column of .evidence[data-count="2"]. */
  evidenceGap: 24,
  evidenceMajor: 2.37,
  /** maxWidth on the Telegram slot in its content file. */
  telegramSlot: 270,
  /** background-size on the transcript slot, as a multiplier of its box. */
  transcriptZoom: 3.7,
} as const;

/* ---- Derived. Nothing below is a typed-in number. ---- */

/** Widest a full-width slot ever renders: the card at its cap, less padding. */
export const cardInner = LAYOUT.wide - 2 * LAYOUT.cardPad;

/** Viewport at which the card stops growing and the slot hits cardInner. */
export const cardCapViewport = LAYOUT.wide + 2 * LAYOUT.gutter;

/** Chrome either side of a slot: page gutter plus card padding. */
const mobileInset = 2 * (LAYOUT.gutterSmall + LAYOUT.cardPadSmall);
const midInset = 2 * (LAYOUT.gutter + LAYOUT.cardPad);

/** The two columns of the evidence grid, once the gap is taken out. */
const evidenceTrack = cardInner - LAYOUT.evidenceGap;
export const evidenceMajor = Math.round(evidenceTrack * (LAYOUT.evidenceMajor / (LAYOUT.evidenceMajor + 1)));
export const evidenceMinor = Math.round(evidenceTrack / (LAYOUT.evidenceMajor + 1));

/** 0.5x / 1x / 1.5x / 2x of a slot. The build clamps the top rung to the
    source's native width rather than upscaling. */
function ladder(slot: number, multipliers: number[] = [0.5, 1, 1.5, 2]): number[] {
  return multipliers.map((m) => Math.round(slot * m));
}

export type ImageRecipe = {
  widths: number[];
  /** Tells the browser the slot width before layout, so it can pick from the
      ladder on the first pass. Empty for a background, which has no sizes. */
  sizes: string;
  /** Rendered as a zoomed CSS background rather than an <img>, so it is
      selected by device pixel ratio via image-set() instead of by width. */
  background?: boolean;
};

/** A slot that fills the card: shrinks with the viewport, then caps. */
function fullWidth(): ImageRecipe {
  return {
    widths: ladder(cardInner),
    sizes:
      `(max-width: ${LAYOUT.mobileBreakpoint}px) calc(100vw - ${mobileInset}px), ` +
      `(max-width: ${cardCapViewport}px) calc(100vw - ${midInset}px), ` +
      `${cardInner}px`,
  };
}

/** A slot in the evidence grid, which collapses to full width on mobile. */
function evidenceSlot(desktop: number): ImageRecipe {
  const worstCase = Math.max(desktop, LAYOUT.mobileBreakpoint - mobileInset);
  return {
    widths: ladder(worstCase),
    sizes: `(max-width: ${LAYOUT.mobileBreakpoint}px) calc(100vw - ${mobileInset}px), ${desktop}px`,
  };
}

/** A slot pinned by maxWidth, which only shrinks on a very narrow phone. */
function pinnedSlot(width: number): ImageRecipe {
  return {
    widths: ladder(width, [1, 2]),
    sizes: `(max-width: ${width + mobileInset}px) calc(100vw - ${mobileInset}px), ${width}px`,
  };
}

/** A zoomed background: drawn at a multiple of its box, picked by pixel
    ratio, because a CSS background cannot use sizes. */
function zoomedBackground(slot: number, zoom: number): ImageRecipe {
  const drawn = Math.round(slot * zoom);
  return { widths: ladder(drawn, [1, 2]), sizes: "", background: true };
}

export const imageRecipes: Record<string, ImageRecipe> = {
  "test-call-thumbnail.png": fullWidth(),
  "sheet-orders.png": fullWidth(),
  "n8n-job-pipeline-canvas.png": fullWidth(),
  "n8n-restaurant-canvas.png": evidenceSlot(evidenceMajor),
  "telegram-alert.jpg": pinnedSlot(LAYOUT.telegramSlot),
  "vapi-transcript.png": zoomedBackground(evidenceMinor, LAYOUT.transcriptZoom),
};

/* /images/foo.png -> foo.png */
export function imageKey(src: string): string {
  return src.slice(src.lastIndexOf("/") + 1);
}

/* foo.png at 1160 -> /images/generated/foo-1160.webp */
export function variantPath(key: string, width: number): string {
  return `/images/generated/${key.replace(/\.(png|jpg|jpeg)$/i, "")}-${width}.webp`;
}
