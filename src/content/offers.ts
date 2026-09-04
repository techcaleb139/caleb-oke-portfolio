/* The four offer cards, plus the copy around them. */

export type Offer = {
  title: string;
  price: string;
  body: string;
  /** Sits below a rule at the foot of the card, in --muted. Omitted on the
      free call, which has nothing to qualify. */
  limit?: string;
};

export const offersHeading = "What you can hire me for";

export const offersIntro =
  "I take on small projects with a defined process and a result we can both check. Prices below are starting points, not quotes.";

/* The order is the sequence a client actually moves through: talk, diagnose,
   build, maintain. */
export const offers: Offer[] = [
  {
    title: "First call",
    price: "Free, 20 minutes",
    body: "A short call where you walk me through one process. I'll tell you whether it's worth automating, and I'll say so if it isn't.",
  },
  {
    title: "Process teardown",
    price: "From $80",
    body: "I map the current steps, estimate the hours it costs you, name the risks I can see, and tell you what I'd do first. Written and sent back to you.",
    limit: "Fee credited toward a build if you book within 14 days.",
  },
  {
    title: "One process, automated",
    price: "From $300",
    body: "One defined business process. One trigger, one main outcome, up to two connected tools. Includes testing, failure alerts, and handover notes. Usually delivered within 5-7 working days after access and scope are confirmed.",
    limit: "Additional workflows, dashboards and ongoing support are quoted separately.",
  },
  {
    title: "Kept running",
    price: "From $75/month",
    body: "Changes and fixes when a connected API changes or the process does.",
    limit: "Two business day response.",
  },
];

export const offersClosing =
  "The most common first project is lead intake and follow up. An enquiry arrives, gets cleaned, lands in your sheet or CRM, alerts you, and creates a follow up task if nobody has replied.";

/* Muted, under the closing paragraph. Says who holds the accounts and who
   pays for them, before anyone has to ask. */
export const offersToolCosts =
  "Third-party subscriptions are billed directly to you and remain in your name and control. I do not mark them up. Any expected software or usage costs will be confirmed before the project begins.";
