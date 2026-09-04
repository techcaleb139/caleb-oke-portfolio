/* Width ladders for the build-time webp generation.
   Single source of truth: the Vite plugin encodes exactly these widths, and
   ProjectMedia builds its srcset from the same table, so the two can never
   drift apart.

   Widths come from the real CSS slots, not the source dimensions.

   Layout maths behind the numbers, from src/styles/tokens.css and
   components.css, with box-sizing: border-box throughout:

     page gutter   64px desktop, 20px at <=720px      (--gutter)
     card padding  40px desktop, 20px at <=720px      (--card-pad)
     card cap      1240px                             (--w-wide)

   A project card's inner content width is therefore:
     desktop, capped   1240 - 2*40                   = 1160px
     720-1368px band   viewport - 2*64 - 2*40        = vw - 208
     <=720px           viewport - 2*20 - 2*20        = vw - 80

   1160px is the widest any full-width slot ever renders, and the card
   reaches that cap at a 1368px viewport. */

export type ImageRecipe = {
  widths: number[];
  /* The sizes attribute. Tells the browser the slot width before layout, so
     it can pick from the ladder on the first pass. */
  sizes: string;
  /* True for the transcript, which renders as a zoomed CSS background rather
     than an <img>, and so is selected by device pixel ratio via image-set()
     instead of by width via sizes. */
  background?: boolean;
};

/* Full-width slot inside a project card: 1160px at the desktop cap.
   0.5x / 1x / 1.5x / 2x of that, with the top rung clamped to the source's
   native width by the build step rather than upscaled. */
const FULL_WIDTH: ImageRecipe = {
  widths: [580, 1160, 1740, 2320],
  sizes: "(max-width: 720px) calc(100vw - 80px), (max-width: 1368px) calc(100vw - 208px), 1160px",
};

export const imageRecipes: Record<string, ImageRecipe> = {
  /* Video thumbnail. 16:9, full width of the card. */
  "test-call-thumbnail.png": FULL_WIDTH,

  /* The order sheet. Native 1917x937 ratio, full width of the card. */
  "sheet-orders.png": FULL_WIDTH,

  /* Sole evidence slot on the job pipeline, so it fills the card width. */
  "n8n-job-pipeline-canvas.png": FULL_WIDTH,

  /* Left column of the two-slot evidence grid: (1160 - 24 gap) * 2.37/3.37
     = 799px on desktop. Below 720px the grid collapses to one column, where
     it reaches at most 640px, so desktop is now the worst case. */
  "n8n-restaurant-canvas.png": {
    widths: [400, 800, 1200, 1600],
    sizes: "(max-width: 720px) calc(100vw - 80px), 800px",
  },

  /* Telegram alert. Pinned to 270px by maxWidth on the slot itself, so it
     never renders wider than that except on a phone narrower than 350px.
     Native is 591 wide, which is 2.2x the slot, so the ladder stops there
     rather than upscaling. */
  "telegram-alert.jpg": {
    widths: [270, 591],
    sizes: "(max-width: 350px) calc(100vw - 80px), 270px",
  },

  /* Vapi transcript. Rendered as a background at background-size: 370%, so
     the drawn image is 3.7x the slot width: a 337px slot draws at 1247px on
     desktop, and a 295px slot on a 375px phone draws at 1092px. A CSS
     background cannot use sizes, so these two widths go to image-set() as 1x
     and 2x and are picked by pixel ratio. */
  "vapi-transcript.png": {
    widths: [1280, 1919],
    sizes: "",
    background: true,
  },
};

/* /images/foo.png -> foo.png */
export function imageKey(src: string): string {
  return src.slice(src.lastIndexOf("/") + 1);
}

/* foo.png at 820 -> /images/generated/foo-820.webp */
export function variantPath(key: string, width: number): string {
  return `/images/generated/${key.replace(/\.(png|jpg|jpeg)$/i, "")}-${width}.webp`;
}
