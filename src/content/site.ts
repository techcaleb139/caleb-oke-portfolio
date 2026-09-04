/* Page copy that is not a project and not an offer.
   Every string here is taken verbatim from design-reference/homepage-full.html.
   The reference uses placeholder hrefs, so real URLs come from the profile
   block below. */

export const profile = {
  name: "Caleb Oke",
  role: "AI automation builder",
  email: "okecaleb139@gmail.com",
  whatsapp: "2348065755296",
  github: "https://github.com/techcaleb139",
  linkedin: "https://www.linkedin.com/in/caleb-oke-6464b0216/",
  instagram: "https://www.instagram.com/tech_caleb_/",
  handle: "@tech_caleb_",
};

/* Anchors are root-relative. The header and footer render on case study
   pages too, where a bare "#work" resolves against a page that has no such
   id and the link silently does nothing. */
export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
];

export const navAction = { label: "Start a conversation", href: "/#contact" };

export const hero = {
  eyebrow: "Available for remote work.",
  title: "I build the systems that stop work falling through the cracks.",
  lead: "Forms, spreadsheets, APIs and voice tools, connected so information reaches the right place without anyone retyping it. Every project below shows what I built, what it measured, and what it still cannot do.",
  primary: { label: "See what I have built", href: "/#work" },
  secondary: { label: "Book a workflow audit", href: "/#contact" },
  /* One line, not a strip. "Every build documented" restated the lead
     paragraph two lines above it; "Computer Science student" is a credential
     sitting beside a measured result, and About already says it. What is left
     is the only measured result on the page. */
  proof: "124 job listings filtered to 5 alerts in one recorded run",
};

export const projectsHeading = "What I have built";

export const projectsIntro =
  "Every project here is documented with what worked, what the numbers were, and what is not yet proven.";

export const projectsClosing =
  "More systems are in progress and will be added here as they are finished and tested.";

export const about = {
  heading: "About me",
  portrait: {
    /* The PNG stays the fallback. The webp files are the same 4:5 portrait
       re-encoded at 480, 800 and 1122 wide, already in the repo. The slot is
       320px on desktop, so a browser fetches roughly 13-29KB instead of the
       PNG's 2MB. */
    src: "/images/caleb-portrait.png",
    webpSrcSet: "/caleb-portrait-480.webp 480w, /caleb-portrait-800.webp 800w, /caleb-portrait.webp 1122w",
    sizes: "(max-width: 720px) calc(100vw - 40px), 320px",
    alt: "Caleb Oke, photographed from the shoulders up against a plain background",
    width: 1122,
    height: 1402,
  },
  paragraphs: [
    "I am Caleb Oke. I am a Computer Science student in Nigeria and I build AI automations for creators and small service businesses.",
    "I finished a three month AI and automation programme at TS Academy, and since then I have kept building with n8n, Vapi, Python, webhooks and REST APIs. The restaurant assistant on this page came out of that programme. The job pipeline is something I built for myself and still run.",
    "I write up what I build, including the parts that fail, because a system that has never been tested against bad input is not finished. If you are weighing up whether a process on your team can be automated, the audit is the cheapest way to find out.",
  ],
  footnote: {
    before: "I document the work as I go on Instagram and TikTok as ",
    link: "@tech_caleb_",
  },
};

export const contact = {
  heading: "Tell me what you do manually",
  intro: "Describe the task in a few sentences. I will ask follow up questions if I need them, and I will tell you if I think it is not worth automating.",
  labels: {
    name: "Your name",
    contact: "Email or WhatsApp number",
    workflow: "What would you like to automate?",
  },
  submit: "Send",
  sending: "Sending...",
  note: "I reply within two working days.",
  /* Shown only when JavaScript is off, in place of the form. Without it the
     form would GET the page back with the message in the URL, which looks
     like it sent and does not. */
  noScript: "Sending this form needs JavaScript. Use the email or WhatsApp links above and it reaches me the same way.",
  /* Only the contact message appears in the reference design. The other two
     are written to match its register: say what to add, and why. */
  errors: {
    name: "Add your name so I know who I am replying to.",
    contact: "Add an email address or a WhatsApp number so I can reply.",
    workflow: "Describe the task you would like automated.",
    failed: "That did not send. Try again, or use WhatsApp or email above.",
  },
  success: {
    heading: "Thanks, that has reached me.",
    body: "I reply within two working days. If it is urgent, WhatsApp is faster.",
  },
};

export const footerLinks = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
];
