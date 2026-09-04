/* rel="noopener" below is specified by both the brief and the reference
   design. The lint rule prefers noreferrer, but that would also strip the
   referrer from the Loom link, which was not asked for, and every browser
   this site targets supports noopener on its own. */
/* eslint-disable react/jsx-no-target-blank */
import { isVideoSlot, type MediaSlot, type VideoSlot } from "../lib/project-types.ts";

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
    return (
      <div
        className="mediaFrame"
        data-ratio={slot.ratio}
        role="img"
        aria-label={slot.alt}
        style={{
          backgroundImage: `url("${slot.src}")`,
          backgroundSize: `${slot.zoom}% auto`,
          backgroundPosition: slot.position,
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  return (
    <div className="mediaFrame" data-ratio={slot.ratio}>
      <img
        src={slot.src}
        alt={slot.alt}
        width={slot.width}
        height={slot.height}
        loading="lazy"
        decoding="async"
        style={slot.position ? { objectPosition: slot.position } : undefined}
      />
      {isVideoSlot(slot) ? (
        <span className="playBadge" aria-hidden="true">
          <span className="playTriangle" />
        </span>
      ) : null}
    </div>
  );
}
