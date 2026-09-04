/* rel="noopener" below is specified by both the brief and the reference
   design. The lint rule prefers noreferrer, but that would also strip the
   referrer from the Loom link, which was not asked for, and every browser
   this site targets supports noopener on its own. */
/* eslint-disable react/jsx-no-target-blank */
import { isVideoSlot, type MediaSlot, type VideoSlot } from "../lib/project-types.ts";
import { imageKey, imageRecipes, variantPath } from "../lib/image-sizes.ts";

/* One image slot. A fixed aspect-ratio box, a thin --border outline, and a
   --muted caption underneath. Intrinsic width/height are always set so the
   box never shifts while the file loads. */
export function ProjectMedia({ slot }: { slot: MediaSlot | VideoSlot }) {
  const framed = <MediaFrame slot={slot} />;

  if (isVideoSlot(slot)) {
    return (
      <a
        className="mediaSlot videoSlot"
        href={slot.href}
        target="_blank"
        rel="noopener"
      >
        {framed}
        <span className="videoMeta">
          <span className="videoLabel">{slot.label}</span>
          <span className="videoNote">{slot.note}</span>
        </span>
      </a>
    );
  }

  return (
    <figure
      className="mediaSlot"
      style={slot.maxWidth ? { maxWidth: slot.maxWidth } : undefined}
      data-align={slot.align}
    >
      {framed}
      {slot.caption ? <figcaption className="mediaCaption">{slot.caption}</figcaption> : null}
    </figure>
  );
}

function MediaFrame({ slot }: { slot: MediaSlot | VideoSlot }) {
  /* A slot whose native ratio is far from its container is rendered as a
     zoomed background crop instead of an <img>, so the interesting region
     stays in frame. It carries role="img" and a label to stay accessible. */
  if (slot.zoom) {
    /* A CSS background cannot use srcset/sizes, so the webp variants are
       offered to image-set() as 1x and 2x. base.css applies --bg-set only
       behind @supports, leaving --bg-fallback (the original file) for
       anything that cannot do image-set. */
    const recipe = imageRecipes[imageKey(slot.src)];
    const key = imageKey(slot.src);
    const set = recipe
      ? recipe.widths.map((width, index) => `url("${variantPath(key, width)}") ${index + 1}x`).join(", ")
      : null;

    return (
      <div
        className="mediaFrame"
        data-ratio={slot.ratio}
        data-background=""
        role="img"
        aria-label={slot.alt}
        style={{
          ["--bg-fallback" as string]: `url("${slot.src}")`,
          ["--bg-set" as string]: set ? `image-set(${set})` : `url("${slot.src}")`,
          backgroundSize: `${slot.zoom}% auto`,
          backgroundPosition: slot.position,
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  /* webp variants are generated at build time by scripts/generate-images.ts.
     The original file stays the <img> src, so it is still the fallback and
     the filename on disk is unchanged. */
  const key = imageKey(slot.src);
  const recipe = imageRecipes[key];

  return (
    <div className="mediaFrame" data-ratio={slot.ratio}>
      <picture>
        {recipe ? (
          <source
            type="image/webp"
            srcSet={recipe.widths.map((width) => `${variantPath(key, width)} ${width}w`).join(", ")}
            sizes={recipe.sizes}
          />
        ) : null}
        <img
          src={slot.src}
          alt={slot.alt}
          width={slot.width}
          height={slot.height}
          loading="lazy"
          decoding="async"
          style={slot.position ? { objectPosition: slot.position } : undefined}
        />
      </picture>
      {isVideoSlot(slot) ? (
        <span className="playBadge" aria-hidden="true">
          <span className="playTriangle" />
        </span>
      ) : null}
    </div>
  );
}
