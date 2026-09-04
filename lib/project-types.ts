/* The shape of one project. Every field here is content, never layout.
   Adding a project means adding a file under src/content/projects/ and
   listing it in that directory's index.ts. Nothing else changes. */

/** Fixed aspect ratios for image slots, so a screenshot can never letterbox
    or crop badly. Values live in src/styles/tokens.css as --ratio-*. */
export type MediaRatio =
  | "wide"        /* 16:9   - n8n canvases, video thumbnail */
  | "sheet"       /* 2.05:1 - sheet-orders.png, its native ratio */
  | "transcript"  /* 3:4    - vapi transcript */
  | "phone"       /* 9:16   - telegram alert */
  | "portrait";   /* 4:5    - portrait */

export type MediaSlot = {
  /** Path under /public. */
  src: string;
  /** Real description of what the screenshot shows. Never "screenshot". */
  alt: string;
  /** Shown underneath in --muted. */
  caption: string;
  ratio: MediaRatio;
  /** Intrinsic pixel size, set on the img so nothing shifts while loading. */
  width: number;
  height: number;
  /** object-position, for slots where the crop matters. */
  position?: string;
  /** Renders as a zoomed background crop at this percentage instead of an
      <img>, for a slot whose native ratio is far from the container. */
  zoom?: number;
  /** Caps the rendered width and centres the slot, e.g. the phone screenshot. */
  maxWidth?: string;
  /** Centres the caption too. */
  align?: "center";
};

export type VideoSlot = MediaSlot & {
  href: string;
  /** Accent link text under the thumbnail. */
  label: string;
  /** Muted note beside the label. */
  note: string;
};

export type ProseSection = {
  heading: string;
  body: string;
};

export type FunnelStage = {
  label: string;
  count: string;
};

export type Funnel = {
  stages: FunnelStage[];
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Text inside the outlined accent badge. */
  status: string;
  /** Opening paragraph, directly under the title. */
  opening: string;
  /** Media shown between the opening paragraph and the first section. */
  media: (MediaSlot | VideoSlot)[];
  /** "What the tests showed" for one project, "What one recorded run did"
      for another, so the heading is data rather than a constant. */
  findings: ProseSection;
  /** Optional funnel, rendered after findings. */
  funnel?: Funnel;
  /** Media shown after findings. Two slots render side by side, one full width. */
  evidence: MediaSlot[];
  notProven: ProseSection;
  nextStep: ProseSection;
  tools: string[];
  /** Long-form case study body for /projects/<slug>. Markdown. */
  /* Long-form write-up. Omit until there is one: the case study page
     renders nothing rather than an empty "Overview" heading. */
  caseStudy?: string;
  seoTitle: string;
  seoDescription: string;
  /** Lower sorts first. */
  order: number;
};

export function isVideoSlot(slot: MediaSlot | VideoSlot): slot is VideoSlot {
  return "href" in slot;
}
