import type { Project } from "../../../lib/project-types.ts";

const project: Project = {
  slug: "voice-ai-restaurant-ordering-prototype",
  title: "Voice AI restaurant ordering prototype",
  status: "Academy prototype",
  order: 10,

  opening:
    "A caller phones a fictional Nigerian restaurant and speaks to an AI assistant. The assistant takes the order, confirms the details back, and the workflow routes the fields into the right sheet. Orders, reservations and escalations each go to their own tab.",

  media: [
    {
      src: "/images/test-call-thumbnail.png",
      alt: "Still frame from the recorded test call",
      caption: "",
      ratio: "wide",
      width: 1918,
      height: 1080,
      href: "https://www.loom.com/share/c9cfbcbf81d74a678251b7c0fd5fa066",
      label: "Watch a test call, 3 minutes",
      note: "Opens on Loom",
    },
    {
      src: "/images/sheet-orders.png",
      alt: "Google Sheet of captured order rows, one row per call, with columns for the caller, the items ordered and the routing decision",
      caption:
        "The sheet the assistant writes to. Each row is one call, split into order, reservation and escalation tabs.",
      ratio: "sheet",
      width: 1917,
      height: 937,
      position: "top left",
    },
  ],

  findings: {
    heading: "What the tests showed",
    body: "A test call reached the n8n webhook and wrote order and reservation fields into Google Sheets in under two seconds. Where the assistant transcribed a caller name incorrectly, the record was routed to an escalation sheet instead of being confirmed.",
  },

  evidence: [
    {
      src: "/images/n8n-restaurant-canvas.png",
      alt: "n8n workflow canvas for the restaurant assistant, showing the webhook node branching into separate Google Sheets nodes for orders, reservations and escalations",
      caption:
        "The workflow behind the call. The webhook receives the fields, then routing sends each type of request to its own tab.",
      ratio: "wide",
      width: 1917,
      height: 983,
    },
    {
      src: "/images/vapi-transcript.png",
      alt: "Vapi call transcript panel showing the assistant reading the order back and the caller confirming it",
      caption:
        "The transcript panel from one call. The assistant reads the order back and the caller confirms it.",
      ratio: "transcript",
      width: 1919,
      height: 977,
      zoom: 370,
      position: "100% 49%",
    },
  ],

  notProven: {
    heading: "What is not proven",
    body: "This was built as a graded academy project around a fictional restaurant. It has run on test calls and sample data only. It has not handled a noisy line, an interrupted caller, or a real kitchen during service.",
  },

  nextStep: {
    heading: "What I would do next",
    body: "Add field level confirmation before an order is accepted, then test against noisy calls and incomplete orders before proposing any live pilot.",
  },

  tools: ["Vapi", "n8n", "Google Sheets"],

  seoTitle: "Voice AI Restaurant Ordering Prototype | Caleb Oke",
  seoDescription:
    "A voice AI ordering prototype built with Vapi, n8n and Google Sheets, documented with what the test calls showed and what is not yet proven.",

};

export default project;
