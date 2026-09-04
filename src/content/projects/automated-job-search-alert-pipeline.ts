import type { Project } from "../../../lib/project-types.ts";

const project: Project = {
  slug: "automated-job-search-alert-pipeline",
  title: "Automated job search and alert pipeline",
  status: "Running system",
  order: 20,

  opening:
    "A scheduled workflow that pulls remote job listings from three sources, normalises fields that none of them format the same way, filters against my criteria, removes duplicates it has already seen, and sends what is left to Telegram.",

  media: [
    {
      src: "/images/telegram-alert.jpg",
      alt: "Telegram alert arriving on a phone, one message per job listing with the role title, company and a link",
      caption:
        "One alert as it arrives on the phone. One message per listing that survived the filters.",
      ratio: "phone",
      width: 591,
      height: 1224,
      position: "top",
      maxWidth: "270px",
      align: "center",
    },
  ],

  findings: {
    heading: "What one recorded run did",
    body: "124 listings collected across three sources. Boolean and exclusion filters cut them to seven. Deduplication against previous runs left five. Five alerts arrived in Telegram.",
  },

  funnel: {
    stages: [
      { label: "Collected from 3 sources", count: "124" },
      { label: "After filters", count: "7" },
      { label: "After removing duplicates", count: "5" },
      { label: "Sent to Telegram", count: "5" },
    ],
    caption: "One recorded run. The workflow canvas below shows the same counts.",
  },

  evidence: [
    {
      src: "/images/n8n-job-pipeline-canvas.png",
      alt: "n8n workflow canvas for the job pipeline, with item counts printed along the connectors between the fetch, normalise, filter, deduplicate and Telegram nodes",
      caption:
        "The same run inside n8n. The numbers printed along the connectors are the counts passing between each step.",
      ratio: "wide",
      width: 1857,
      height: 886,
    },
  ],

  notProven: {
    heading: "What is not proven",
    body: "It runs from my own computer on a schedule, which means it stops when the machine sleeps. It has not been tested across weeks of unattended running, API outages, or source websites changing their response format.",
  },

  nextStep: {
    heading: "What I would do next",
    body: "Move it to hosting that does not depend on my laptop, then measure failure rate, duplicate handling and cost across repeated scheduled runs.",
  },

  tools: ["n8n", "REST APIs", "Telegram"],

  seoTitle: "Automated Job Search Alert Pipeline | Caleb Oke",
  seoDescription:
    "An n8n pipeline that collects remote job listings from three sources, filters and deduplicates them, and sends the survivors to Telegram.",

  caseStudy: `## Overview

Full write-up to follow.
`,
};

export default project;
