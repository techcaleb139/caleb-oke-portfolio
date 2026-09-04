/* Width ladders for the build-time webp generation.
   Single source of truth: the Vite plugin encodes exactly these widths, and
   ProjectMedia builds its srcset from the same table, so the two can never
   drift apart.

   Widths come from the real CSS slots, not the source dimensions.

   Layout maths behind the numbers, from src/styles/tokens.css and
   components.css, with box-sizing: border-box throughout:

     page gutter   64px desktop, 20px at <=720px      (--gutter)
     card padding  40px desktop, 20px at <=720px      (--card-pad)
     card cap      900px                              (--col)

   A project card's inner content width is therefore:
     desktop, capped   900 - 2*40                    = 820px
     720-1028px band   viewport - 2*64 - 2*40        = vw - 208
     <=720px           viewport - 2*20 - 2*20        = vw - 80

   820px is the widest any full-width slot ever renders. */

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

/* Full-width slot inside a project card: 820px at the desktop cap.
   0.5x / 1x / 1.5x / 2x of that. The 400 covers phones at 1x, 820 covers
   both a large phone at 1x and the desktop slot, 1232 and 1640 cover
   high-density screens. */
const FULL_WIDTH: ImageRecipe = {
  widths: [400, 820, 1232, 1640],
  sizes: "(max-width: 720px) calc(100vw - 80px), (max-width: 1028px) calc(100vw - 208px), 820px",
};

export const imageRecipes: Record<string, ImageRecipe> = {
  /* Video thumbnail. 16:9, full width of the card. */
  "test-call-thumbnail.png": FULL_WIDTH,

  /* The order sheet. Native 1917x937 ratio, full width of the card. */
  "sheet-orders.png": FULL_WIDTH,

  /* Sole evidence slot on the job pipeline, so it fills the card width. */
  "n8n-job-pipeline-canvas.png": FULL_WIDTH,

  /* Left column of the two-slot evidence grid: (820 - 24 gap) * 2.37/3.37
     = 560px on desktop. Below 720px the grid collapses to one column and it
     grows to the full inner width, up to 640px. 640 is the worst case, so
     the ladder is 0.5x / 1x / 1.5x / 2x of that. */
  "n8n-restaurant-canvas.png": {
    widths: [320, 640, 960, 1280],
    sizes: "(max-width: 720px) calc(100vw - 80px), 560px",
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
     the drawn image is 3.7x the slot width: 236px slot * 3.7 = 874px on
     desktop. A CSS background cannot use sizes, so these two widths are
     offered to image-set() as 1x and 2x and picked by pixel ratio. */
  "vapi-transcript.png": {
    widths: [960, 1919],
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
