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

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

export const navAction = { label: "Start a conversation", href: "#contact" };

export const hero = {
  eyebrow: "Nigeria. Available for remote work.",
  title: "I build the small systems that stop work falling through the cracks.",
  lead: "Forms, spreadsheets, APIs and voice tools, connected so information reaches the right place without anyone retyping it. Every project below shows what I built, what it measured, and what it still cannot do.",
  primary: { label: "See what I have built", href: "#work" },
  secondary: { label: "Book a workflow audit", href: "#contact" },
  stats: [
    "2 systems built and tested",
    "124 job listings filtered to 5 alerts in one recorded run",
    "Computer Science student",
  ],
};

export const projectsHeading = "What I have built";

export const projectsIntro =
  "Every project here is documented with what worked, what the numbers were, and what is not yet proven.";

export const projectsClosing =
  "More systems are in progress and will be added here as they are finished and tested.";

export const about = {
  heading: "About me",
  portrait: {
    src: "/images/caleb-portrait.png",
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
  note: "I reply within two working days.",
  success: {
    heading: "Thanks, that has reached me.",
    body: "I reply within two working days. If it is urgent, WhatsApp is faster.",
  },
};

export const footerLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];
