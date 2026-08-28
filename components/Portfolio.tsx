"use client";

/* eslint-disable @next/next/no-img-element -- This shared component is deployed by Vite, not Next Image. */

import { FormEvent, useMemo, useRef, useState } from "react";

const EMAIL = "okecaleb139@gmail.com";
const PHONE = "2348065755296";

const capabilityRows = [
  {
    problem: "Repeated manual work",
    outcome: "Connect the steps, route decisions, notify the right person, and keep important approvals visible.",
    tools: "n8n / Make / Zapier",
  },
  {
    problem: "Messy incoming data",
    outcome: "Collect, clean, normalize, filter, deduplicate, and deliver information in a dependable format.",
    tools: "REST APIs / Python / JavaScript",
  },
  {
    problem: "Structured phone enquiries",
    outcome: "Capture caller intent, validate required details, follow business rules, and hand uncertain cases to a person.",
    tools: "Vapi / Webhooks / n8n",
  },
];

const systemLayers = [
  ["Capture", "Forms, voice calls, webhooks"],
  ["Orchestrate", "n8n, Make, Zapier"],
  ["Process", "Python, JavaScript, REST APIs"],
  ["Run and review", "Docker, logs, alerts, human approval"],
];

const processSteps = [
  ["Understand", "A current-process map and a clear definition of the bottleneck."],
  ["Design", "The system rules, data fields, integrations, and likely failure paths."],
  ["Build", "A narrow working pilot with validation, logs, alerts, and approvals."],
  ["Test and hand over", "Normal cases, edge cases, known limits, and clear ownership."],
];

type FormValues = { name: string; replyContact: string; business: string; process: string; outcome: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmissionState = "idle" | "submitting" | "success" | "error";
const emptyForm: FormValues = { name: "", replyContact: "", business: "", process: "", outcome: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name so I know how to address you.";
  if (!values.replyContact.trim()) errors.replyContact = "Enter an email address or WhatsApp number so I can reply.";
  if (!values.process.trim()) errors.process = "Explain how this work is currently handled.";
  if (!values.outcome.trim()) errors.outcome = "Describe what a successful result would look like.";
  return errors;
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [brief, setBrief] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const errors = useMemo(() => validate(values), [values]);
  const visibleErrors = (Object.keys(errors) as Array<keyof FormValues>).filter((field) => touched[field]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setBrief(null);
    setNotice("");
    setSubmissionState("idle");
  }

  function reviewBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new FormData(event.currentTarget).get("website")) return;
    setTouched({ name: true, replyContact: true, business: true, process: true, outcome: true });
    if (Object.keys(errors).length) {
      setBrief(null);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    setBrief(`Automation project brief\n\nName: ${values.name.trim()}\nReply contact: ${values.replyContact.trim()}\nBusiness or team: ${values.business.trim() || "Not provided"}\nHow the process works today: ${values.process.trim()}\nWhat success looks like: ${values.outcome.trim()}`);
    setNotice("Your brief is ready. Check the details, then submit it securely or use a direct send option.");
  }

  async function submitBrief() {
    if (!brief || submissionState === "submitting" || submissionState === "success") return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setSubmissionState("submitting");
    setNotice("Submitting your brief securely...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          contact: values.replyContact.trim(),
          business: values.business.trim(),
          workflow: values.process.trim(),
          outcome: values.outcome.trim(),
          website: "",
        }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "The submission could not be saved.");
      setSubmissionState("success");
      setNotice("Brief received. Your details were saved successfully. I will reply using the contact you provided.");
    } catch (error) {
      const message = error instanceof Error && error.name === "AbortError"
        ? "The request timed out. Try again, or use WhatsApp or email below."
        : "The brief could not be submitted. Your details are still here, so you can retry or use WhatsApp or email.";
      setSubmissionState("error");
      setNotice(message);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function copyBrief() {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      setNotice("Brief copied to your clipboard.");
    } catch {
      setNotice("Copy was blocked by your browser. You can still send with WhatsApp or email.");
    }
  }

  return (
    <main id="top">
      <a className="skipLink" href="#content">Skip to main content</a>

      <header className="siteHeader">
        <nav className="nav shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Caleb Oke home">
            <strong>Caleb Oke</strong>
            <span>AI Automation Builder</span>
          </a>
          <button className="menuButton" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "Close" : "Menu"}
          </button>
          <div className={menuOpen ? "navLinks open" : "navLinks"} id="primary-navigation">
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Capabilities</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a className="navAction" href="#contact" onClick={() => setMenuOpen(false)}>Start a project</a>
          </div>
        </nav>
      </header>

      <div id="content">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="heroCopy">
            <h1 id="hero-title">Automation built for real work.</h1>
            <p className="heroLead">Workflow, data, and voice systems with tested logic, visible failures, and human control.</p>
            <div className="heroActions">
              <a className="button primary" href="#work">View case studies</a>
              <a className="button secondary" href="#contact">Start a project</a>
            </div>
            <nav className="profileLinks" aria-label="Professional profiles">
              <a href="https://github.com/techcaleb139" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/caleb-oke-6464b0216/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/tech_caleb_/" target="_blank" rel="noreferrer">Instagram</a>
            </nav>
          </div>

          <figure className="portraitFrame">
            <img
              src="/caleb-portrait.webp"
              srcSet="/caleb-portrait-480.webp 480w, /caleb-portrait-800.webp 800w, /caleb-portrait.webp 1122w"
              sizes="(max-width: 720px) calc(100vw - 40px), (max-width: 1024px) 42vw, 430px"
              alt="Caleb Oke wearing a navy shirt against a grey studio background"
              width="1122"
              height="1402"
              fetchPriority="high"
            />
            <figcaption>
              <strong>Caleb Oke</strong>
              <span>Computer Science student building practical AI automation systems</span>
            </figcaption>
          </figure>
        </section>

        <section className="projectIndex" aria-labelledby="documented-systems-title">
          <div className="shell projectIndexInner">
            <h2 id="documented-systems-title">Documented systems</h2>
            <a href="#voice-ai"><span>Voice AI ordering</span><strong>Academy prototype</strong></a>
            <a href="#job-pipeline"><span>Job alert pipeline</span><strong>Working personal system</strong></a>
          </div>
        </section>

        <section className="section workSection shell" id="work">
          <header className="sectionIntro workIntro">
            <h2>Systems, tested and explained.</h2>
            <p>I show what each build did, what the test demonstrated, and what still needs stronger validation.</p>
          </header>

          <CaseStudy
            id="voice-ai"
            variant="split"
            context="TS Academy final project / Academy prototype"
            title="Voice AI Restaurant Ordering Prototype"
            summary="Built as a graded prototype around a fictional Nigerian restaurant scenario. It handled test calls and sample data, but has not yet been validated in live restaurant operations."
            observed="A test call reached n8n and routed sample order and reservation fields into Google Sheets."
            limitation="Dish-name transcription, interruptions, ambiguous quantities, and missing fields need stronger validation."
            nextTest="Add field-level confirmation and test noisy calls, interruptions, and incomplete orders before any live pilot."
            tools="Vapi / n8n / Webhooks / Google Sheets / REST APIs"
            image="/voice-ordering-case-study.webp"
            alt="Workflow diagram for the restaurant voice ordering prototype"
            caption="Test path from Vapi through n8n to Google Sheets"
            href="https://github.com/techcaleb139/voice-ai-ordering-system"
            stages={[
              ["Enquiry", "A test caller describes an order or reservation."],
              ["Capture", "Vapi transcribes the call and collects the details."],
              ["Route", "n8n receives the webhook and applies the workflow rules."],
              ["Record", "The sample fields are written to Google Sheets."],
              ["Review", "A person checks missing or uncertain information."],
            ]}
          />

          <CaseStudy
            id="job-pipeline"
            variant="wide"
            context="Working personal system / Data automation"
            title="Automated Job Search Engine and Alert Pipeline"
            summary="A self-hosted workflow that collects remote job listings, normalizes inconsistent fields, filters them, removes duplicates, and sends selected matches to Telegram."
            observed="A recorded run processed 110 listings into 3 high-priority alerts."
            limitation="It runs locally, so scheduled monitoring depends on my computer being online."
            nextTest="Move the workflow to dependable hosting and measure repeated scheduled runs, API failures, and duplicate handling over time."
            tools="n8n / REST APIs / JavaScript / Regex / Docker / Telegram"
            image="/job-pipeline-case-study.webp"
            alt="Workflow diagram for the automated job alert pipeline"
            caption="Multiple job sources routed through normalization, filtering, deduplication, and Telegram"
            href="https://github.com/techcaleb139/job-alert-pipeline"
            stages={[
              ["Fetch", "Collect listings from several job sources."],
              ["Normalize", "Convert inconsistent fields into one structure."],
              ["Filter", "Keep roles that match the configured criteria."],
              ["Deduplicate", "Remove repeated listings before delivery."],
              ["Alert", "Send selected matches to Telegram for human review."],
            ]}
          />
        </section>

        <section className="section capabilitiesSection" id="services">
          <div className="shell">
            <header className="sectionIntro">
              <h2>Problems I can scope now.</h2>
              <p>I am taking on focused pilots and small builds where the process, result, and handover can be clearly defined.</p>
            </header>

            <div className="capabilityTable" aria-label="Automation capabilities">
              {capabilityRows.map((row) => (
                <article className="capabilityRow" key={row.problem}>
                  <h3>{row.problem}</h3>
                  <p>{row.outcome}</p>
                  <span>{row.tools}</span>
                </article>
              ))}
            </div>

            <dl className="systemMap">
              {systemLayers.map(([term, detail]) => (
                <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section processSection shell" aria-labelledby="process-title">
          <header className="sectionIntro processIntro">
            <h2 id="process-title">From process map to handover.</h2>
            <p>Every stage produces something you can inspect before the work moves forward.</p>
          </header>
          <ol className="processTrack">
            {processSteps.map(([title, detail]) => (
              <li key={title}><h3>{title}</h3><p>{detail}</p></li>
            ))}
          </ol>
        </section>

        <section className="section aboutSection" id="about">
          <div className="shell aboutLayout">
            <div className="aboutStatement">
              <h2>I care about systems that fail clearly, not silently.</h2>
              <p>Impressive complexity matters less than a system that solves the actual problem predictably.</p>
            </div>
            <div className="aboutCopy">
              <p>I am a Computer Science student who moved from learning Python into building practical automation workflows. I completed a three-month AI and automation program at TS Academy and kept building after graduation.</p>
              <p>I work locally first, test the happy path and likely failure cases, then document what the system can and cannot do.</p>
              <p>My current focus is becoming stronger at deployment, APIs, databases, maintenance, and production handover. I do not present academy work as client work, and I will say when a process is not ready to automate.</p>
              <p className="locationLine">Based in Nigeria. Available for clearly scoped remote projects.</p>
            </div>
          </div>
        </section>

        <section className="section contactSection shell" id="contact">
          <div className="contactIntro">
            <h2>Describe the process that needs work.</h2>
            <p>Share what happens today and what a useful result would look like. I will reply with questions, not a generic sales pitch.</p>
            <div className="contactMethods" aria-label="Direct contact options">
              <a href={`mailto:${EMAIL}?subject=Automation%20project%20enquiry`}><span>Email</span><strong>{EMAIL}</strong></a>
              <a href={`https://wa.me/${PHONE}?text=Hi%20Caleb%2C%20I%27d%20like%20to%20discuss%20an%20automation%20project.`} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>+234 806 575 5296</strong></a>
              <a href="https://www.linkedin.com/in/caleb-oke-6464b0216/" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>View professional profile</strong></a>
            </div>
          </div>

          <form className="contactForm" onSubmit={reviewBrief} noValidate>
            <div className="formHeading">
              <h3>{brief ? "Review your project brief" : "Start with a short brief"}</h3>
              <p>Nothing is sent until you review the details and press the secure submit button.</p>
            </div>
            <input className="honeypot" type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" />

            {!brief && (
              <>
                {visibleErrors.length > 0 && (
                  <div className="errorSummary" role="alert" tabIndex={-1} ref={errorSummaryRef} aria-labelledby="error-title">
                    <h4 id="error-title">Please fix {visibleErrors.length === 1 ? "this field" : "these fields"}</h4>
                    <ul>{visibleErrors.map((field) => <li key={field}><a href={`#${field}`}>{errors[field]}</a></li>)}</ul>
                  </div>
                )}

                <fieldset>
                  <legend>About you</legend>
                  <p className="groupHelp">Tell me how to reach you. A company name is optional.</p>
                  <FormField label="Your name" name="name" value={values.name} error={touched.name ? errors.name : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="name" placeholder="John Robert" />
                  <FormField label="Reply email or WhatsApp" name="replyContact" value={values.replyContact} error={touched.replyContact ? errors.replyContact : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="email" placeholder="john.robert@example.com or +234..." />
                  <FormField label="Business or team" optional name="business" value={values.business} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="organization" placeholder="Northstar Studio" />
                </fieldset>

                <fieldset>
                  <legend>About the process</legend>
                  <p className="groupHelp">Plain language is enough. You do not need to know the technical solution.</p>
                  <FormField multiline label="How does this process work today?" name="process" value={values.process} error={touched.process ? errors.process : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="Describe the steps, who handles them, and where delays or repeated work occur." />
                  <FormField multiline label="What would a successful result look like?" name="outcome" value={values.outcome} error={touched.outcome ? errors.outcome : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="Tell me what should become faster, more accurate, easier to track, or more reliable." />
                </fieldset>

                <button className="button primary submitButton" type="submit">Review my brief</button>
                <p className="formNote">No account required. Your brief is stored only after you explicitly submit it.</p>
              </>
            )}

            {brief && (
              <section className="briefReview" aria-labelledby="brief-title">
                <div className="briefReviewHeader">
                  <h4 id="brief-title">Check the details before sending</h4>
                  <button type="button" className="textButton" onClick={() => { setBrief(null); setNotice(""); setSubmissionState("idle"); }}>Edit details</button>
                </div>
                <dl className="reviewGrid">
                  <div><dt>Name</dt><dd>{values.name.trim()}</dd></div>
                  <div><dt>Reply contact</dt><dd>{values.replyContact.trim()}</dd></div>
                  <div><dt>Business or team</dt><dd>{values.business.trim() || "Not provided"}</dd></div>
                  <div><dt>How the process works today</dt><dd>{values.process.trim()}</dd></div>
                  <div><dt>What success looks like</dt><dd>{values.outcome.trim()}</dd></div>
                </dl>
                <div className="sendActions">
                  <button className="button primary secureSubmit" type="button" onClick={submitBrief} disabled={submissionState === "submitting" || submissionState === "success"}>
                    {submissionState === "submitting" ? "Submitting..." : submissionState === "success" ? "Brief submitted" : submissionState === "error" ? "Retry secure submission" : "Submit project brief"}
                  </button>
                  <button className="button secondary" type="button" onClick={copyBrief}>Copy brief</button>
                  <a className="button secondary" href={`https://wa.me/${PHONE}?text=${encodeURIComponent(brief)}`} target="_blank" rel="noreferrer">Send on WhatsApp</a>
                  <a className="button secondary" href={`mailto:${EMAIL}?subject=Automation%20project%20enquiry&body=${encodeURIComponent(brief)}`}>Send by email</a>
                </div>
              </section>
            )}

            <p className={`formStatus ${submissionState}`} aria-live="polite">{notice}</p>
          </form>
        </section>
      </div>

      <footer className="footer">
        <div className="shell footerLayout">
          <div><strong>Caleb Oke</strong><span>Practical automation. Clear evidence. Human control.</span></div>
          <nav aria-label="Footer navigation"><a href="#work">Work</a><a href="#services">Capabilities</a><a href="#about">About</a><a href="#top">Back to top</a></nav>
        </div>
      </footer>
    </main>
  );
}

type CaseProps = {
  id: string;
  variant: "split" | "wide";
  context: string;
  title: string;
  summary: string;
  observed: string;
  limitation: string;
  nextTest: string;
  tools: string;
  image: string;
  alt: string;
  caption: string;
  href: string;
  stages: string[][];
};

function CaseStudy({ id, variant, context, title, summary, observed, limitation, nextTest, tools, image, alt, caption, href, stages }: CaseProps) {
  return (
    <article className={`caseStudy ${variant}`} id={id}>
      <header className="caseHeader">
        <h3>{title}</h3>
        <p>{summary}</p>
        <dl className="caseMeta">
          <div><dt>Project status</dt><dd>{context}</dd></div>
        </dl>
        <a className="textLink" href={href} target="_blank" rel="noreferrer">Read the repository</a>
      </header>

      <figure className="caseVisual">
        <img src={image} alt={alt} width="800" height="450" loading="lazy" />
        <figcaption>{caption}</figcaption>
      </figure>

      <ol className="verificationRail" aria-label={`${title} system path`}>
        {stages.map(([stage, detail]) => (
          <li key={stage}><strong>{stage}</strong><span>{detail}</span></li>
        ))}
      </ol>

      <div className="evidencePanel">
        <div className="observedEvidence"><h4>What the test showed</h4><p>{observed}</p></div>
        <div><h4>Known limit</h4><p>{limitation}</p></div>
        <div><h4>Next test</h4><p>{nextTest}</p></div>
      </div>

      <p className="toolLine"><strong>System components</strong><span>{tools}</span></p>
    </article>
  );
}

type FieldProps = { label: string; name: keyof FormValues; value: string; error?: string; optional?: boolean; multiline?: boolean; placeholder: string; autoComplete?: string; onChange: (field: keyof FormValues, value: string) => void; onBlur: (field: keyof FormValues) => void };

function FormField({ label, name, value, error, optional, multiline, placeholder, autoComplete, onChange, onBlur }: FieldProps) {
  const shared = {
    id: name,
    name,
    value,
    placeholder,
    autoComplete,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${name}-hint ${name}-error` : `${name}-hint`,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(name, event.target.value),
    onBlur: () => onBlur(name),
  };
  return (
    <div className="field">
      <label htmlFor={name}>{label}{optional && <span>Optional</span>}</label>
      <span className="srOnly" id={`${name}-hint`}>{optional ? "This field is optional." : "This field is required."}</span>
      {multiline ? <textarea {...shared} rows={4} /> : <input {...shared} />}
      {error && <p className="fieldError" id={`${name}-error`}>{error}</p>}
    </div>
  );
}
