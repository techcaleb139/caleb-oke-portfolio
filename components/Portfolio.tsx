"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioProject } from "../lib/project-types.ts";
import { builtProjects, publishedProjects } from "../src/content/project-data.ts";

const EMAIL = "okecaleb139@gmail.com";
const PHONE = "2348065755296";

const capabilityRows = [
  {
    service: "Connect routine admin work",
    fit: "For teams copying information between forms, spreadsheets, email, and internal tools.",
    outcome: "Move submitted information to the right place, notify the right person, and keep approval steps visible.",
    tools: "n8n / Make / Zapier",
  },
  {
    service: "Collect and clean data",
    fit: "For businesses receiving records from websites, APIs, documents, or several platforms.",
    outcome: "Standardize fields, remove duplicates, filter unwanted records, and deliver the useful data.",
    tools: "REST APIs / Python / JavaScript",
  },
  {
    service: "Prototype phone assistants",
    fit: "For repeated enquiries, bookings, order capture, and first-line qualification calls.",
    outcome: "Capture required details, check them against business rules, and send uncertain requests to a person.",
    tools: "Vapi / Webhooks / n8n",
  },
];

const processSteps = [
  ["Map the task", "List the current steps, the people involved, and where work is repeated."],
  ["Plan the rules", "Define the data fields, decisions, exceptions, and human approval points."],
  ["Build a pilot", "Connect the tools and add validation, logs, and failure alerts."],
  ["Test and hand over", "Test normal and unusual cases, record the limits, and document operation."],
];

type FormValues = { name: string; replyContact: string; business: string; process: string; outcome: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;
type SubmissionState = "idle" | "submitting" | "success" | "error";
const emptyForm: FormValues = { name: "", replyContact: "", business: "", process: "", outcome: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name so I know how to address you.";
  if (!values.replyContact.trim()) errors.replyContact = "Enter an email address or WhatsApp number so I can reply.";
  if (!values.process.trim()) errors.process = "Describe the task or process you want help with.";
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
    setBrief(`Automation project enquiry\n\nName: ${values.name.trim()}\nReply contact: ${values.replyContact.trim()}\nBusiness or team: ${values.business.trim() || "Not provided"}\nTask or process: ${values.process.trim()}\nDesired result: ${values.outcome.trim() || "Not provided yet"}`);
    setNotice("Your message is ready. Check the details, then submit it securely or use a direct send option.");
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
      setNotice("Message received. Your details were saved successfully. I will reply using the contact you provided.");
    } catch (error) {
      const message = error instanceof Error && error.name === "AbortError"
        ? "The request timed out. Try again, or use WhatsApp or email below."
        : "The message could not be submitted. Your details are still here, so you can retry or use WhatsApp or email.";
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
      setNotice("Message copied to your clipboard.");
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
            <h1 id="hero-title">I build automations that reduce repetitive work.</h1>
            <p className="heroLead">I connect forms, spreadsheets, APIs, and voice tools so information moves without repeated copying.</p>
            <div className="heroActions">
              <a className="button primary" href="#work">View my projects</a>
              <a className="button secondary" href="#contact">Contact me</a>
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
              <span>Based in Nigeria. Available for remote work.</span>
            </figcaption>
          </figure>
        </section>

        <section className="section capabilitiesSection" id="services">
          <div className="shell servicesLayout">
            <header className="sectionIntro servicesIntro">
              <h2>Automation services</h2>
              <p>I take on small, defined projects where the current steps and the required result can be explained plainly.</p>
            </header>

            <div className="capabilityTable" aria-label="Automation capabilities">
              {capabilityRows.map((row) => (
                <article className="capabilityRow" key={row.service}>
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
            <h2>Selected projects</h2>
            <p>These are systems I have built and tested. Each project shows an observed result and the next improvement I would make.</p>
          </header>

          <div className="workGrid">
            {visibleProjects.map((project) => (
              <CaseStudy project={project} key={project.id || project.slug} />
            ))}
          </div>
        </section>

        <section className="section processSection shell" aria-labelledby="process-title">
          <header className="sectionIntro processIntro">
            <h2 id="process-title">How I work</h2>
            <p>The work starts with the current task, not with a tool.</p>
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
              <h2>About me</h2>
              <p>I build automation systems, test where they fail, and document how they should be used.</p>
              <figure className="aboutPortrait">
                <img
                  src="/caleb-portrait-800.webp"
                  srcSet="/caleb-portrait-480.webp 480w, /caleb-portrait-800.webp 800w, /caleb-portrait.webp 1122w"
                  sizes="(max-width: 700px) calc(100vw - 32px), 360px"
                  width="1122"
                  height="1402"
                  loading="lazy"
                  alt="Caleb Oke, AI automation builder"
                />
              </figure>
            </div>
            <div className="aboutCopy">
              <p>I am Caleb Oke, a Computer Science student and AI automation builder based in Nigeria.</p>
              <p>I completed a three-month AI and automation programme at TS Academy. Since then, I have continued building with n8n, Vapi, Python, JavaScript, webhooks, and REST APIs.</p>
              <p>The restaurant voice assistant shown here is an academy prototype. The job alert pipeline is a personal system that I currently run from my computer.</p>
              <p className="locationLine">I am available for remote automation projects with a defined problem and scope.</p>
            </div>
          </div>
        </section>

        <section className="section contactSection shell" id="contact">
          <div className="contactIntro">
            <h2>Contact me</h2>
            <p>Tell me what your team does manually today, and what you&apos;d like automated instead.</p>
            <div className="contactMethods" aria-label="Direct contact options">
              <a href={`mailto:${EMAIL}?subject=Automation%20project%20enquiry`}><span>Email</span><strong>{EMAIL}</strong></a>
              <a href={`https://wa.me/${PHONE}?text=Hi%20Caleb%2C%20I%27d%20like%20to%20discuss%20an%20automation%20project.`} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>+234 806 575 5296</strong></a>
              <a href="https://www.linkedin.com/in/caleb-oke-6464b0216/" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>View professional profile</strong></a>
            </div>
            <div className="contactNext">
              <h3>What happens next</h3>
              <ol>
                <li><strong>Initial Review:</strong> I reply using the email or WhatsApp you provide.</li>
                <li><strong>Discovery & Scoping:</strong> We confirm the current steps, access needed, and what a useful result looks like.</li>
                <li><strong>Pilot Proposal:</strong> If it&apos;s a fit, I propose a small paid pilot before a larger build.</li>
              </ol>
            </div>
          </div>

          <form className="contactForm" onSubmit={reviewBrief} noValidate>
            <div className="formHeading">
              <h3>{brief ? "Review your message" : "Start a conversation"}</h3>
              <p>Share the task in a few sentences. I will ask follow-up questions if needed.</p>
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

                <fieldset className="formGrid identityFields">
                  <legend>Your details</legend>
                  <p className="groupHelp">Tell me who you are and where I should reply.</p>
                  <FormField label="Your name" name="name" value={values.name} error={touched.name ? errors.name : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="name" placeholder="John Robert" />
                  <FormField label="Preferred contact (email or WhatsApp)" name="replyContact" value={values.replyContact} error={touched.replyContact ? errors.replyContact : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="email" placeholder="john.robert@example.com or +234..." />
                </fieldset>

                <fieldset className="workFields">
                  <legend>What would you like to automate?</legend>
                  <p className="groupHelp">A short description is enough. I&apos;ll figure out the right tools to build it.</p>
                  <FormField multiline label="Task or process" name="process" value={values.process} error={touched.process ? errors.process : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="For example: enquiries arrive by WhatsApp, then someone copies the details into a spreadsheet and follows up manually." />
                  <details className="optionalDetails">
                    <summary>Add business and outcome details <span>Optional</span></summary>
                    <div className="optionalFields">
                      <FormField label="Business or team" optional name="business" value={values.business} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="organization" placeholder="Northstar Studio" />
                      <FormField multiline label="Desired result" optional name="outcome" value={values.outcome} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="What should become faster, easier to track, or more reliable?" />
                    </div>
                  </details>
                </fieldset>

                <button className="button primary submitButton" type="submit">Review message</button>
                <p className="formNote">No account required. Nothing is stored until you submit the reviewed message.</p>
              </>
            )}

            {brief && (
              <section className="briefReview" aria-labelledby="brief-title">
                <div className="briefReviewHeader">
                  <h4 id="brief-title">Check your message before sending</h4>
                  <button type="button" className="textButton" onClick={() => { setBrief(null); setNotice(""); setSubmissionState("idle"); }}>Edit details</button>
                </div>
                <dl className="reviewGrid">
                  <div><dt>Name</dt><dd>{values.name.trim()}</dd></div>
                  <div><dt>Reply contact</dt><dd>{values.replyContact.trim()}</dd></div>
                  <div><dt>Business or team</dt><dd>{values.business.trim() || "Not provided"}</dd></div>
                  <div><dt>Task or process</dt><dd>{values.process.trim()}</dd></div>
                  <div><dt>Desired result</dt><dd>{values.outcome.trim() || "Not provided yet"}</dd></div>
                </dl>
                <div className="sendActions">
                  <button className="button primary secureSubmit" type="button" onClick={submitBrief} disabled={submissionState === "submitting" || submissionState === "success"}>
                    {submissionState === "submitting" ? "Submitting..." : submissionState === "success" ? "Message submitted" : submissionState === "error" ? "Retry secure submission" : "Submit message"}
                  </button>
                  <button className="button secondary" type="button" onClick={copyBrief}>Copy message</button>
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
          <div><strong>Caleb Oke</strong><span>AI Automation Builder</span></div>
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
        <div><h4>What happened in testing</h4><p>{project.observedResult}</p></div>
        <div><h4>Next improvement</h4><p>{project.nextTest}</p></div>
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
