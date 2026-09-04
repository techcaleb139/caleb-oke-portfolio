/* The three offer cards, plus the copy around them. */

export type Offer = {
  title: string;
  price: string;
  body: string;
  /** Sits below a rule at the foot of the card, in --muted. */
  limit: string;
};

export const offersHeading = "What you can hire me for";

export const offersIntro =
  "I take on small projects with a defined process and a result we can both check. Prices below are starting points, not quotes.";

export const offers: Offer[] = [
  {
    title: "Workflow audit",
    price: "From $75",
    body: "A 45 minute call where you walk me through one process. I send back a map of the current steps, an estimate of the hours it costs you, the risks I can see, and what I would do first.",
    limit: "Fee credited toward a build if you book within 14 days.",
  },
  {
    title: "Automation quick win",
    price: "From $350",
    body: "One trigger, one process, up to three connected tools. Comes with logs, failure alerts, written documentation and a handover call so you can run it without me.",
    limit: "No custom dashboards or 24/7 support at this price.",
  },
  {
    title: "Care plan",
    price: "From $150 per month",
    body: "Monitoring for an automation already running. Expired tokens, changed APIs, duplicate records and silent failures get caught and fixed before they cost you leads.",
    limit: "Monthly one page report on runs, failures and costs.",
  },
];

export const offersClosing =
  "The most common first project is lead intake and follow up. An enquiry arrives, gets cleaned, lands in your sheet or CRM, alerts you, and creates a follow up task if nobody has replied.";
