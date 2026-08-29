"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioProject } from "../lib/project-types.ts";
import { builtProjects, publishedProjects } from "../src/content/project-data.ts";

const EMAIL = "okecaleb139@gmail.com";
const PHONE = "2348065755296";

const capabilityRows = [
  {
    service: "Workflow automation",
    fit: "For teams moving information between forms, spreadsheets, email, and internal tools by hand.",
    outcome: "I connect the steps, route decisions, send alerts, and keep important approvals visible.",
    tools: "n8n / Make / Zapier",
  },
  {
    service: "Data and API workflows",
    fit: "For businesses collecting inconsistent data from websites, APIs, documents, or several platforms.",
    outcome: "I collect, clean, normalize, filter, and deliver the information in one dependable format.",
    tools: "REST APIs / Python / JavaScript",
  },
  {
    service: "Voice AI prototypes",
    fit: "For structured calls such as enquiries, bookings, order capture, and first-line qualification.",
    outcome: "I capture intent, validate required details, follow business rules, and hand uncertain calls to a person.",
    tools: "Vapi / Webhooks / n8n",
  },
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

type PortfolioProps = { initialProjects?: PortfolioProject[] };

function projectAnchor(project: PortfolioProject): string {
  if (project.slug === "voice-ai-restaurant-ordering-prototype") return "voice-ai";
  if (project.slug === "automated-job-search-alert-pipeline") return "job-pipeline";
  return project.slug;
}

export default function Portfolio({ initialProjects = builtProjects }: PortfolioProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [brief, setBrief] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [projects, setProjects] = useState<PortfolioProject[]>(initialProjects);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const errors = useMemo(() => validate(values), [values]);
  const visibleErrors = (Object.keys(errors) as Array<keyof FormValues>).filter((field) => touched[field]);
  const visibleProjects = useMemo(() => publishedProjects(projects), [projects]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Project request failed")))
      .then((result: { projects?: PortfolioProject[] }) => {
        if (Array.isArray(result.projects) && result.projects.length) setProjects(result.projects);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.info("Using the built project snapshot.");
        }
      });
    return () => controller.abort();
  }, []);

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
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a className="navAction" href="#contact" onClick={() => setMenuOpen(false)}>Discuss a project</a>
          </div>
        </nav>
      </header>

      <div id="content">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="heroCopy">
            <h1 id="hero-title">Repetitive work, automated.</h1>
            <p className="heroLead">Workflow automation, data pipelines, and voice AI systems built around your real process.</p>
            <div className="heroActions">
              <a className="button primary" href="#contact">Discuss a project</a>
              <a className="button secondary" href="#work">See proof</a>
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
              <span>AI Automation Builder</span>
            </figcaption>
          </figure>
        </section>

        <section className="section capabilitiesSection" id="services">
          <div className="shell servicesLayout">
            <header className="sectionIntro servicesIntro">
              <h2>What I can build for you.</h2>
              <p>Focused automation projects for small businesses, online teams, and creators with a clear process to improve.</p>
              <a className="textLink" href="#contact">Tell me what is slowing you down</a>
            </header>

            <div className="capabilityTable" aria-label="Automation capabilities">
              {capabilityRows.map((row, index) => (
                <article className="capabilityRow" key={row.service}>
                  <span className="serviceNumber" aria-hidden="true">0{index + 1}</span>
                  <div>
                    <h3>{row.service}</h3>
                    <p className="serviceFit">{row.fit}</p>
                  </div>
                  <p>{row.outcome}</p>
                  <span className="serviceTools">{row.tools}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section workSection shell" id="work">
          <header className="sectionIntro workIntro">
            <h2>Proof, not promises.</h2>
            <p>Each build includes the result I observed and the limitation I still need to solve.</p>
          </header>

          <div className="workGrid">
            {visibleProjects.map((project) => (
              <CaseStudy project={project} key={project.id || project.slug} />
            ))}
          </div>
        </section>

        <section className="section processSection shell" aria-labelledby="process-title">
          <header className="sectionIntro processIntro">
            <h2 id="process-title">A clear path from problem to handover.</h2>
            <p>You can inspect the rules, test results, and known limits before taking ownership.</p>
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
              <h2>Clear systems. Honest limits. Human control.</h2>
              <p>I would rather show you a known failure than hide it behind a confident demo.</p>
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
            <h2>Tell me what is taking too much time.</h2>
            <p>Share the current process and the result you want. I will reply with practical questions and a sensible next step.</p>
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
          <nav aria-label="Footer navigation"><a href="#work">Work</a><a href="#services">Services</a><a href="#about">About</a><a href="#top">Back to top</a></nav>
        </div>
      </footer>
    </main>
  );
}

function CaseStudy({ project }: { project: PortfolioProject }) {
  const id = projectAnchor(project);
  return (
    <article className="caseStudy" id={id}>
      <figure className="caseVisual">
        <img src={project.imageUrl} alt={project.imageAlt} width="800" height="450" loading="lazy" />
      </figure>

      <header className="caseHeader">
        <p className="caseStatus">{project.statusLabel}</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </header>

      <div className="caseEvidence">
        <div><h4>Observed result</h4><p>{project.observedResult}</p></div>
        <div><h4>Known limit</h4><p>{project.knownLimit}</p></div>
      </div>

      <div className="caseFooter">
        <span>{project.category}</span>
        <a className="textLink" href={`/projects/${project.slug}`}>View case study</a>
      </div>
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
