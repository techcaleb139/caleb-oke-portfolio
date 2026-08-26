"use client";

/* eslint-disable @next/next/no-img-element -- This shared component is deployed by Vite, not Next Image. */

import { FormEvent, useMemo, useRef, useState } from "react";

const EMAIL = "okecaleb139@gmail.com";
const PHONE = "2348065755296";
const skills = ["n8n", "Vapi", "Make.com", "Zapier", "Python", "JavaScript", "Docker", "REST APIs"];
const services = [
  ["Workflow automation", "Connect forms, spreadsheets, messaging tools, CRMs, and internal processes with visible approvals and clear failure alerts."],
  ["Data and API pipelines", "Collect, clean, filter, deduplicate, and route data from multiple sources into one dependable flow."],
  ["Voice AI prototypes", "Prototype structured call flows for enquiries, reservations, and qualification, with business rules and human fallback."],
];
const steps = [
  ["01", "Understand", "Map the current process, bottlenecks, people, and the result that matters."],
  ["02", "Design", "Define integrations, decision rules, data structure, and failure paths before building."],
  ["03", "Build", "Create a scoped version with validation, logs, alerts, and human control where needed."],
  ["04", "Test", "Run normal and edge cases, document limitations, and agree on ownership before handover."],
];

type FormValues = { name: string; business: string; process: string; outcome: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;
const emptyForm: FormValues = { name: "", business: "", process: "", outcome: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name so I know how to address you.";
  if (!values.process.trim()) errors.process = "Describe the current manual process or bottleneck.";
  if (!values.outcome.trim()) errors.outcome = "Describe the result you want the system to create.";
  return errors;
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [brief, setBrief] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const errors = useMemo(() => validate(values), [values]);
  const visibleErrors = (Object.keys(errors) as Array<keyof FormValues>).filter((field) => touched[field]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setBrief(null);
    setNotice("");
  }

  function reviewBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new FormData(event.currentTarget).get("website")) return;
    setTouched({ name: true, business: true, process: true, outcome: true });
    if (Object.keys(errors).length) {
      setBrief(null);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    setBrief(`Automation project brief\n\nName: ${values.name.trim()}\nBusiness or team: ${values.business.trim() || "Not provided"}\nCurrent process: ${values.process.trim()}\nDesired outcome: ${values.outcome.trim()}`);
    setNotice("Your brief is ready. Review it, then choose how you want to send it.");
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
          <a className="brand" href="#top" aria-label="Caleb Oke home"><span>Caleb Oke</span><small>AI Automation Builder</small></a>
          <button className="menuButton" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
          <div className={menuOpen ? "navLinks open" : "navLinks"} id="primary-navigation">
            {[["Work", "#work"], ["Services", "#services"], ["About", "#about"]].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <a className="navAction" href="#contact" onClick={() => setMenuOpen(false)}>Start a conversation</a>
          </div>
        </nav>
      </header>

      <div id="content">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="heroCopy">
            <p className="availability">Based in Nigeria. Available for remote projects.</p>
            <h1 id="hero-title">I build practical automations for real work.</h1>
            <p className="heroLead">Voice, workflow, and data systems built with clear rules, visible failures, and human control.</p>
            <div className="heroActions"><a className="button primary" href="#work">View my work</a><a className="button secondary" href="#contact">Discuss a project</a></div>
            <div className="profileLinks" aria-label="Professional profiles">
              <a href="https://github.com/techcaleb139" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/caleb-oke-6464b0216/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/tech_caleb_/" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
          <figure className="portraitFrame">
            <img src="/caleb-portrait.png" alt="Caleb Oke wearing a navy shirt against a grey studio background" width="1122" height="1402" fetchPriority="high" />
            <figcaption><strong>Caleb Oke</strong><span>Computer Science student and automation builder</span></figcaption>
          </figure>
        </section>

        <section className="proofBar" aria-label="Portfolio evidence"><div className="shell proofGrid">
          <div><strong>Working personal system</strong><span>Job alert pipeline used in my own workflow</span></div>
          <div><strong>Academy prototype</strong><span>Voice ordering project tested with sample data</span></div>
          <div><strong>Open to scoped pilots</strong><span>Small, clearly defined automation projects</span></div>
        </div></section>

        <section className="section shell" id="work">
          <div className="sectionIntro"><h2>Built work, with the limits included.</h2><p>These are documented builds. I separate what was tested from what still needs real-world validation.</p></div>
          <CaseStudy
            meta={["Academy prototype", "Voice AI"]}
            title="Voice AI Restaurant Ordering Prototype — TS Academy Final Project"
            summary="Built as a graded prototype around a fictional Nigerian restaurant scenario. It handled test calls and sample data, but has not yet been validated in live restaurant operations."
            tested="A test call reached n8n and routed sample order and reservation fields into Google Sheets."
            limits="Dish-name transcription, interruptions, ambiguous quantities, and missing fields need stronger validation."
            tags={["Vapi", "n8n", "Webhooks", "Google Sheets", "REST APIs"]}
            image="/voice-ordering-case-study.webp"
            alt="Workflow diagram for the restaurant voice ordering prototype"
            caption="Test call to Vapi, n8n, and Google Sheets"
            href="https://github.com/techcaleb139/voice-ai-ordering-system"
          />
          <CaseStudy
            reverse meta={["Working personal system", "Data automation"]}
            title="Automated Job Search Engine and Alert Pipeline"
            summary="A self-hosted workflow that collects remote job listings, normalizes inconsistent fields, filters them, removes duplicates, and sends selected matches to Telegram."
            tested="110 listings were processed into 3 high-priority alerts during a recorded run."
            limits="It runs locally, so scheduled monitoring depends on my computer being online."
            tags={["n8n", "REST APIs", "JavaScript", "Regex", "Docker", "Telegram"]}
            image="/job-pipeline-case-study.webp"
            alt="Workflow diagram for the automated job alert pipeline"
            caption="Multiple APIs to filtering, deduplication, and Telegram"
            href="https://github.com/techcaleb139/job-alert-pipeline"
          />
        </section>

        <section className="section services" id="services"><div className="shell servicesLayout">
          <div className="sectionIntro stickyIntro"><h2>Where I can help now.</h2><p>I am taking on scoped pilots and small builds where the process, result, and handover can be clearly defined.</p><div className="skillLine" aria-label="Tools I work with">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
          <div className="serviceList">{services.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div></section>

        <section className="section shell processSection">
          <div className="sectionIntro"><h2>A careful path from idea to handover.</h2><p>The process stays simple enough to explain and detailed enough to test.</p></div>
          <ol className="processList">{steps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
        </section>

        <section className="section about" id="about"><div className="shell aboutLayout">
          <div><h2>I care about systems that fail clearly, not silently.</h2><blockquote>“Impressive complexity matters less than a system that solves the actual problem predictably.”</blockquote></div>
          <div className="aboutCopy">
            <p>I am a Computer Science student who moved from learning Python into building real automation workflows. I completed a three-month AI and automation program at TS Academy and kept building after graduation.</p>
            <p>I work locally first, test the happy path and likely failure cases, then document what the system can and cannot do.</p>
            <div className={aboutOpen ? "aboutMore open" : "aboutMore"} id="about-more"><p>My current focus is becoming stronger at deployment, APIs, databases, maintenance, and production handover. I do not present academy work as client work, and I will say when a process is not ready to automate.</p></div>
            <button className="textButton" type="button" aria-expanded={aboutOpen} aria-controls="about-more" onClick={() => setAboutOpen(!aboutOpen)}>{aboutOpen ? "Show less" : "Read more about my approach"}</button>
          </div>
        </div></section>

        <section className="section shell contact" id="contact">
          <div className="contactIntro"><h2>Tell me what is taking too much manual effort.</h2><p>Share the current process and the result you want. I will respond with questions, not a generic sales pitch.</p><ul>
            <li><a href={`mailto:${EMAIL}?subject=Automation%20project%20enquiry`}>Email: {EMAIL}</a></li>
            <li><a href={`https://wa.me/${PHONE}?text=Hi%20Caleb%2C%20I%27d%20like%20to%20discuss%20an%20automation%20project.`} target="_blank" rel="noreferrer">WhatsApp: +234 806 575 5296</a></li>
            <li><a href="https://www.linkedin.com/in/caleb-oke-6464b0216/" target="_blank" rel="noreferrer">LinkedIn profile</a></li>
          </ul></div>

          <form className="contactForm" onSubmit={reviewBrief} noValidate>
            <div className="formHeading"><h3>Start with a short brief</h3><p>Nothing is sent automatically. You will review the message before choosing WhatsApp or email.</p></div>
            <input className="honeypot" type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" />
            {visibleErrors.length > 0 && <div className="errorSummary" role="alert" tabIndex={-1} ref={errorSummaryRef} aria-labelledby="error-title"><h4 id="error-title">Please fix {visibleErrors.length === 1 ? "this field" : "these fields"}</h4><ul>{visibleErrors.map((field) => <li key={field}><a href={`#${field}`}>{errors[field]}</a></li>)}</ul></div>}
            <FormField label="Your name" name="name" value={values.name} error={touched.name ? errors.name : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="name" placeholder="Amina Yusuf" />
            <FormField label="Business or team" optional name="business" value={values.business} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} autoComplete="organization" placeholder="Northstar Studio" />
            <FormField multiline label="Current manual process" name="process" value={values.process} error={touched.process ? errors.process : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="What happens today, who handles it, and where does it slow down?" />
            <FormField multiline label="Desired outcome" name="outcome" value={values.outcome} error={touched.outcome ? errors.outcome : undefined} onChange={updateField} onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))} placeholder="What should become faster, clearer, or more reliable?" />
            <button className="button primary submitButton" type="submit">Review my brief</button>
            <p className="formNote">No account required. No information leaves this page until you choose a send option.</p>
            {brief && <section className="briefReview" aria-labelledby="brief-title"><div className="briefReviewHeader"><h4 id="brief-title">Your brief is ready</h4><button type="button" className="textButton" onClick={copyBrief}>Copy brief</button></div><pre>{brief}</pre><div className="sendActions"><a className="button primary" href={`https://wa.me/${PHONE}?text=${encodeURIComponent(brief)}`} target="_blank" rel="noreferrer">Send on WhatsApp</a><a className="button secondary" href={`mailto:${EMAIL}?subject=Automation%20project%20enquiry&body=${encodeURIComponent(brief)}`}>Send by email</a></div></section>}
            <p className="formStatus" aria-live="polite">{notice}</p>
          </form>
        </section>
      </div>

      <footer className="footer"><div className="shell footerLayout"><div><strong>Caleb Oke</strong><span>AI Automation Builder</span></div><nav aria-label="Footer navigation"><a href="#work">Work</a><a href="#services">Services</a><a href="#about">About</a><a href="#top">Back to top</a></nav></div></footer>
    </main>
  );
}

type CaseProps = { meta: string[]; title: string; summary: string; tested: string; limits: string; tags: string[]; image: string; alt: string; caption: string; href: string; reverse?: boolean };
function CaseStudy({ meta, title, summary, tested, limits, tags, image, alt, caption, href, reverse }: CaseProps) {
  return <article className={reverse ? "caseStudy reverse" : "caseStudy"}><div className="caseText"><div className="caseMeta">{meta.map((item) => <span key={item}>{item}</span>)}</div><h3>{title}</h3><p>{summary}</p><dl className="evidenceList"><div><dt>Tested</dt><dd>{tested}</dd></div><div><dt>Known limits</dt><dd>{limits}</dd></div></dl><div className="tagList">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a className="textLink" href={href} target="_blank" rel="noreferrer">Read the repository</a></div><figure className="caseVisual"><img src={image} alt={alt} width="800" height="450" loading="lazy" /><figcaption>{caption}</figcaption></figure></article>;
}

type FieldProps = { label: string; name: keyof FormValues; value: string; error?: string; optional?: boolean; multiline?: boolean; placeholder: string; autoComplete?: string; onChange: (field: keyof FormValues, value: string) => void; onBlur: (field: keyof FormValues) => void };
function FormField({ label, name, value, error, optional, multiline, placeholder, autoComplete, onChange, onBlur }: FieldProps) {
  const shared = { id: name, name, value, placeholder, autoComplete, "aria-invalid": Boolean(error), "aria-describedby": error ? `${name}-hint ${name}-error` : `${name}-hint`, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(name, event.target.value), onBlur: () => onBlur(name) };
  return <div className="field"><label htmlFor={name}>{label}{optional && <span>Optional</span>}</label><span className="srOnly" id={`${name}-hint`}>{optional ? "This field is optional." : "This field is required."}</span>{multiline ? <textarea {...shared} rows={4} /> : <input {...shared} />}{error && <p className="fieldError" id={`${name}-error`}>{error}</p>}</div>;
}
