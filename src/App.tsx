import { FormEvent, Fragment, useState } from "react";

const techSkills = [
  "n8n",
  "Vapi",
  "Make.com",
  "Zapier",
  "Python",
  "JavaScript",
  "Docker",
  "Telegram",
  "Google Sheets",
];

const capabilities = [
  {
    num: "01",
    title: "Voice AI Systems",
    desc: "Autonomous conversational phone agents that handle inbound reservations, customer qualification, support triage, and call routing according to strict business logic.",
  },
  {
    num: "02",
    title: "Workflow Automation",
    desc: "Production-grade automated pipelines that bridge CRMs, databases, messaging channels, spreadsheets, and internal tooling with zero manual intervention.",
  },
  {
    num: "03",
    title: "Data and API Pipelines",
    desc: "Multi-source ingestion engines with automated schema normalization, strict regex boundary filtering, deduplication hashing, and instant broadcast delivery.",
  },
  {
    num: "04",
    title: "Controlled AI Agents",
    desc: "Reasoning agents that interact with external APIs, execute tool calls, parse complex unstructured data, and safely escalate sensitive edge cases to human operators.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Process Audit",
    desc: "Identify manual bottlenecks, operational friction, data flows, and the concrete outcome required.",
  },
  {
    num: "02",
    title: "Architecture Design",
    desc: "Map API integrations, data schemas, decision trees, failure paths, and safe human fallback routes.",
  },
  {
    num: "03",
    title: "Engine Build",
    desc: "Construct deterministic workflows, webhook endpoints, LLM parsers, and validation layers.",
  },
  {
    num: "04",
    title: "Stress Testing",
    desc: "Exercise happy paths, malformed payloads, rate limits, network timeouts, and edge cases.",
  },
  {
    num: "05",
    title: "Deploy & Monitor",
    desc: "Launch with end-to-end documentation, environment configs, error alerting, and clear system ownership.",
  },
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [briefData, setBriefData] = useState<{ encoded: string } | null>(null);

  async function prepareBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Honeypot bot check — hidden field should always be empty
    if (data.get("website")) return;

    const name = data.get("name");
    const business = data.get("business");
    const process = data.get("process");
    const outcome = data.get("outcome");

    const brief = `Automation project brief\n\nName: ${name}\nBusiness: ${business}\nCurrent manual process: ${process}\nDesired outcome: ${outcome}`;
    const encoded = encodeURIComponent(brief);

    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, business, workflow: process, outcome }),
      });

      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setBriefData({ encoded });
      window.setTimeout(() => setCopied(false), 6000);
    } catch {
      window.location.href = `mailto:okecaleb139@gmail.com?subject=${encodeURIComponent(
        "Automation project enquiry"
      )}&body=${encoded}`;
    }
  }

  return (
    <main>
      <a className="skipLink" href="#content">
        Skip to main content
      </a>

      {/* Ambient Radial Background Glows */}
      <div className="ambientGlow" aria-hidden="true">
        <div className="glowTopLeft" />
        <div className="glowTopRight" />
        <div className="glowCenter" />
      </div>

      {/* Floating Glassmorphism Header */}
      <header className="navHeader">
        <nav className="navBar" aria-label="Main navigation">
          <a className="navBrand" href="#top" aria-label="Caleb Oke Home">
            <span className="brandName">Caleb Oke</span>
            <span className="brandDot">/</span>
            <span className="brandRole">AI Automation Engineer</span>
          </a>

          <button
            className="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <div
            id="site-navigation"
            className={menuOpen ? "navLinks open" : "navLinks"}
          >
            <a
              className="navLink"
              href="#work"
              onClick={() => setMenuOpen(false)}
            >
              Work
            </a>
            <a
              className="navLink"
              href="#services"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </a>
            <a
              className="navLink"
              href="#about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </a>
            <a
              className="navCta"
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              Discuss Your Project ↗
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero shell" id="top">
        <div>
          <div className="heroBadge">
            AI Automation Engineer · Systems &amp; Workflows
          </div>

          <h1 className="heroTitle">
            Architecting AI systems for
            <span className="gradientShine">real business work.</span>
          </h1>

          <p className="heroDescription">
            I help businesses automate customer phone calls, repetitive
            operational workflows, and data pipelines using Voice AI, n8n,
            Make.com, Zapier, APIs, and custom code.
          </p>

          <div className="heroActions">
            <a className="btnPrimary" href="#work">
              View Case Studies ↓
            </a>
            <a className="btnSecondary" href="#contact">
              Discuss Your Project ↗
            </a>
          </div>

          {/* Social Profiles */}
          <div className="socialRow" aria-label="Professional and Social Profiles">
            <a
              className="socialPill"
              href="https://www.linkedin.com/in/caleb-oke-6464b0216/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              LinkedIn
            </a>

            <a
              className="socialPill"
              href="https://github.com/techcaleb139"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Profile"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              GitHub
            </a>

            <a
              className="socialPill"
              href="https://www.instagram.com/tech_caleb_/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Profile"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              @tech_caleb_
            </a>

            <a
              className="socialPill"
              href="https://wa.me/2348065755296"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Contact"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.1-.54-1.27-.6-.17-.06-.29-.09-.41.09-.12.19-.48.6-.59.72-.11.12-.23.14-.42.05-.19-.09-.81-.3-1.54-.95-.57-.51-.95-1.14-1.06-1.33-.11-.19-.01-.29.08-.38.08-.08.19-.23.28-.34.09-.12.12-.2.18-.34.06-.14.03-.26-.02-.35-.05-.09-.41-.99-.56-1.36-.15-.36-.3-.31-.41-.32h-.35c-.12 0-.32.05-.48.23-.17.19-.64.63-.64 1.53 0 .9.66 1.78.75 1.9.09.12 1.29 1.97 3.13 2.76.44.19.78.3 1.05.39.44.14.84.12 1.16.07.35-.05 1.1-.45 1.25-.88.16-.44.16-.81.11-.88-.04-.08-.16-.12-.35-.22z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Live Architecture Console Visual */}
        <div className="heroConsole">
          <div className="consoleHeader">
            <div className="consoleDots">
              <span className="dot dotRed" />
              <span className="dot dotYellow" />
              <span className="dot dotGreen" />
            </div>
            <span className="consoleTitle">AUTOMATION ENGINE CONSOLE</span>
            <span className="consoleBadge">LIVE EXECUTION</span>
          </div>

          <div className="consoleBody">
            <div className="consoleStep">
              <span className="stepNum">01</span>
              <div className="stepDetails">
                <strong>Inbound Call &amp; Webhook Intake</strong>
                <span>Vapi.ai speech stream → Event payload dispatched</span>
              </div>
            </div>

            <div className="consoleStep">
              <span className="stepNum">02</span>
              <div className="stepDetails">
                <strong>LLM Intent Classifier &amp; Extraction</strong>
                <span>Entity validation with custom regex boundary parser</span>
              </div>
            </div>

            <div className="consoleStep">
              <span className="stepNum">03</span>
              <div className="stepDetails">
                <strong>Deterministic Business Logic</strong>
                <span>n8n / Make.com routing · Inventory &amp; price calculation</span>
              </div>
            </div>

            <div className="consoleStep">
              <span className="stepNum">04</span>
              <div className="stepDetails">
                <strong>Real-Time Data Persistence</strong>
                <span>Sync to Google Sheets, CRMs, and Telegram bot alerts</span>
              </div>
            </div>
          </div>

          <div className="consoleFooter">
            <span>Engineered by Caleb Oke</span>
            <strong>Status: 200 OK</strong>
          </div>
        </div>
      </section>

      {/* Technical Capabilities Marquee Rail */}
      <section className="techRail" aria-label="Technical capabilities">
        <div className="shell">
          <div className="techGrid">
            {techSkills.map((skill, index) => (
              <Fragment key={skill}>
                <span className="techPill">
                  <span className="techDot" />
                  {skill}
                </span>
                {index === 4 && (
                  <span className="techRowBreak" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <div id="content">
        {/* Selected Work Section */}
        <section className="shell section" id="work">
          <div className="sectionHeading">
            <span className="sectionKicker">Selected Work</span>
            <h2>Systems I have engineered.</h2>
            <p>
              Documented production workflows demonstrating voice processing,
              data normalization, and API automation.
            </p>
          </div>

          {/* Case 01: Mama Tee's Voice AI */}
          <article className="caseCard">
            <div className="caseHeader">
              <span className="caseTag">Voice AI · Hospitality Operations</span>
              <span className="caseNumber">Case Study 01</span>
            </div>

            <div className="caseIntro">
              <div>
                <h3>Mama Tee&apos;s Kitchen — Autonomous Voice Ordering</h3>
                <p>
                  A localized conversational voice assistant for an Abuja restaurant
                  that handles inbound phone calls, takes food orders with Nigerian
                  menu items, manages table reservations, and syncs directly into
                  Google Sheets in real-time.
                </p>
              </div>

              <div className="outcomeBox">
                <small>Demonstrated Outcome</small>
                <p>
                  Live voice conversations are automatically transcribed, parsed,
                  and validated into structured Google Sheets records without
                  human administrative delay.
                </p>
              </div>
            </div>

            <figure className="caseVisualWrapper">
              <img src="/voice-ordering-case-study.webp" alt="Architecture diagram of the Voice AI Ordering System" className="object-contain w-full h-full" width="800" height="450" loading="lazy" />
              <figcaption>
                <span>Live System Flow</span>
                <span>Customer Speech → LLM Menu Parser → Google Sheets Real-Time Sync</span>
              </figcaption>
            </figure>

            <div className="engineeringGrid" id="voice-details">
              <div className="engCard">
                <small>Technical Complexity</small>
                <p>
                  Handling localized Nigerian dish names, customer speech
                  interruptions, ambiguous order quantities, and strict data
                  sanitization before persisting records.
                </p>
              </div>
              <div className="engCard">
                <small>Engineering Approach</small>
                <p>
                  Vapi &amp; LLM manage natural voice conversation, while
                  deterministic n8n nodes enforce rigid business rules, pricing
                  calculations, and database consistency.
                </p>
              </div>
            </div>

            <div className="caseFooter">
              <div className="techTags">
                {["Vapi", "n8n", "Webhooks", "Google Sheets", "REST APIs"].map(
                  (t) => (
                    <span className="techTag" key={t}>
                      {t}
                    </span>
                  )
                )}
              </div>

              <a
                className="githubLink"
                href="https://github.com/techcaleb139/voice-ai-ordering-system"
                target="_blank"
                rel="noopener noreferrer"
              >
                View GitHub Repository ↗
              </a>
            </div>
          </article>

          {/* Case 02: Multi-Source Job Intelligence Pipeline */}
          <article className="caseCard">
            <div className="caseHeader">
              <span className="caseTag">Data Automation · Intelligence Engine</span>
              <span className="caseNumber">Case Study 02</span>
            </div>

            <div className="caseIntro">
              <div>
                <h3>Automated Job Search Engine &amp; Alert Pipeline</h3>
                <p>
                  A self-hosted, twice-daily monitoring system that gathers listings
                  from multiple remote job APIs, standardizes inconsistent schemas,
                  filters with strict regex rules, and delivers qualified matches
                  instantly to Telegram.
                </p>
              </div>

              <div className="outcomeBox">
                <small>Demonstrated Outcome</small>
                <p>
                  110 raw job postings are ingested, schema-normalized, regex-filtered,
                  deduplicated via hashing, and condensed into 3 high-priority
                  Telegram alerts.
                </p>
              </div>
            </div>

            <figure className="caseVisualWrapper">
              <img src="/job-pipeline-case-study.webp" alt="Architecture diagram of the automated Job Alert Pipeline" className="object-contain w-full h-full" width="800" height="450" loading="lazy" />
              <figcaption>
                <span>Live System Flow</span>
                <span>110 Raw Listings Ingested → 3 High-Confidence Alerts Dispatched</span>
              </figcaption>
            </figure>

            <div className="engineeringGrid" id="job-details">
              <div className="engCard">
                <small>Technical Complexity</small>
                <p>
                  Reconciling conflicting API schemas, handling rate limits,
                  parsing timezone constraints, and preventing false positives
                  from short query keywords.
                </p>
              </div>
              <div className="engCard">
                <small>Engineering Approach</small>
                <p>
                  Built a custom recursive descent parser with regex boundary
                  matching to eliminate false hits, paired with MD5 hash
                  deduplication across runs.
                </p>
              </div>
            </div>

            <div className="caseFooter">
              <div className="techTags">
                {["n8n", "REST APIs", "JavaScript", "Regex", "Docker", "Telegram"].map(
                  (t) => (
                    <span className="techTag" key={t}>
                      {t}
                    </span>
                  )
                )}
              </div>

              <a
                className="githubLink"
                href="https://github.com/techcaleb139/job-alert-pipeline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View GitHub Repository ↗
              </a>
            </div>
          </article>
        </section>

        {/* Capabilities Section (Bento Grid) */}
        <section className="servicesSection section" id="services">
          <div className="shell">
            <div className="sectionHeading">
              <span className="sectionKicker">Capabilities</span>
              <h2>What I build for businesses.</h2>
              <p>
                From customer-facing voice interfaces to back-office workflow
                orchestration, I build systems that run quietly and reliably.
              </p>
            </div>

            <div className="bentoGrid">
              {capabilities.map((c) => (
                <div className="bentoCard" key={c.num}>
                  <span className="bentoNum">{c.num}</span>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="shell section" id="process">
          <div className="sectionHeading">
            <span className="sectionKicker">Work Methodology</span>
            <h2>Clear engineering before complex tooling.</h2>
            <p>
              A disciplined delivery framework focused on measurable reliability
              and zero operational headaches.
            </p>
          </div>

          <div className="processRow">
            {processSteps.map((step) => (
              <div className="processStep" key={step.num}>
                <span className="stepBadge">{step.num}</span>
                <strong>{step.title}</strong>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="shell section" id="about">
          <div className="aboutCard">
            <div className="aboutPortraitBox">
              <img src="/caleb-portrait.webp" alt="Caleb Oke, AI Automation Engineer" className="object-cover w-full h-full" width="400" height="400" loading="eager" />
            </div>

            <div className="aboutBio">
              <span className="sectionKicker">About Caleb Oke</span>
              <h2>Curious about where software should take over, and where it should not.</h2>
              <p>
                I got into automation while studying computer science. I was
                learning Python and wanted something real to build with it, not
                just study it. That led to a four month scholarship training
                program at TS Academy, and a skill I kept using after I graduated.
              </p>

              <div
                id="about-more"
                className={`aboutExpandedContent ${showFullAbout ? "open" : ""}`}
                aria-hidden={!showFullAbout}
              >
                <p>
                  Most automation I see isn&apos;t badly designed, it&apos;s neglected.
                  Platforms change underneath a workflow and nobody checks it again.
                  My rule: if a system fails, it should fail loud, not rot silently.
                </p>
                <p>
                  I started out automating repetitive tasks. I quickly realized the
                  real value was a level up: systems that can reason through a task,
                  not just repeat it. That is what pulled me toward AI directly. I
                  build and test everything in Docker first, locally and free,
                  before it touches a live platform.
                </p>
                <p>
                  Work with me and you get the process, not just the workflow: an
                  honest audit of what is costing you time, architecture built
                  around your real constraints, and testing before anything goes
                  live. If automation is not even the right answer yet, I will tell
                  you that too.
                </p>
              </div>

              <button
                type="button"
                className="aboutToggleBtn"
                onClick={() => setShowFullAbout(!showFullAbout)}
                aria-expanded={showFullAbout}
                aria-controls="about-more"
              >
                {showFullAbout ? "Show Less ↑" : "Read Full Background ↓"}
              </button>

              <div className="aboutQuoteBox">
                “I care less about impressive looking complexity and more about
                whether the system solves the actual problem predictably.”
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="shell section" id="contact">
          <div className="contactGrid">
            <div className="contactInfo">
              <span className="sectionKicker">Contact</span>
              <h2>Have a manual workflow ready for automation?</h2>
              <p>
                Tell me what your team handles by hand and what you want
                automated. Fill out the brief, or reach me directly below.
              </p>

              <div className="contactCards">
                <a
                  className="contactItem"
                  href="mailto:okecaleb139@gmail.com?subject=Automation%20project%20enquiry"
                  onClick={() => {
                    navigator.clipboard?.writeText("okecaleb139@gmail.com");
                    setEmailCopied(true);
                    window.setTimeout(() => setEmailCopied(false), 4000);
                  }}
                >
                  <div className="contactItemLeft">
                    <span className="contactIcon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </span>
                    <div>
                      <strong>Email Caleb</strong>
                      <span className="contactSublabel">Tap to send an email</span>
                    </div>
                  </div>
                  <span className="contactActionText">
                    {emailCopied ? "✓ Email Copied!" : "Send Email ↗"}
                  </span>
                </a>

                <a
                  className="contactItem"
                  href="https://wa.me/2348065755296?text=Hi%20Caleb%2C%20I%27d%20like%20to%20discuss%20an%20automation%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="contactItemLeft">
                    <span className="contactIcon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.1-.54-1.27-.6-.17-.06-.29-.09-.41.09-.12.19-.48.6-.59.72-.11.12-.23.14-.42.05-.19-.09-.81-.3-1.54-.95-.57-.51-.95-1.14-1.06-1.33-.11-.19-.01-.29.08-.38.08-.08.19-.23.28-.34.09-.12.12-.2.18-.34.06-.14.03-.26-.02-.35-.05-.09-.41-.99-.56-1.36-.15-.36-.3-.31-.41-.32h-.35c-.12 0-.32.05-.48.23-.17.19-.64.63-.64 1.53 0 .9.66 1.78.75 1.9.09.12 1.29 1.97 3.13 2.76.44.19.78.3 1.05.39.44.14.84.12 1.16.07.35-.05 1.1-.45 1.25-.88.16-.44.16-.81.11-.88-.04-.08-.16-.12-.35-.22z" />
                      </svg>
                    </span>
                    <div>
                      <strong>Message Caleb</strong>
                      <span className="contactSublabel">WhatsApp &amp; Phone Calls</span>
                    </div>
                  </div>
                  <span className="contactActionText">Open WhatsApp ↗</span>
                </a>

                <a
                  className="contactItem"
                  href="https://www.linkedin.com/in/caleb-oke-6464b0216/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="contactItemLeft">
                    <span className="contactIcon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </span>
                    <div>
                      <strong>Connect with Caleb</strong>
                      <span className="contactSublabel">LinkedIn Network</span>
                    </div>
                  </div>
                  <span className="contactActionText">View LinkedIn Profile ↗</span>
                </a>
              </div>
            </div>

            <form className="contactForm" onSubmit={prepareBrief}>
              {/* Honeypot field — hidden from humans, traps bots */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
              />
              <div className="formGroup">
                <label className="formLabel" htmlFor="name">
                  Your Name
                </label>
                <input
                  className="formInput"
                  id="name"
                  name="name"
                  required
                  placeholder="How should I address you?"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel" htmlFor="business">
                  Business or Team
                </label>
                <input
                  className="formInput"
                  id="business"
                  name="business"
                  required
                  placeholder="What does your team do?"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel" htmlFor="process">
                  Current Manual Workflow
                </label>
                <textarea
                  className="formTextarea"
                  id="process"
                  name="process"
                  required
                  placeholder="What repetitive task or bottleneck is slowing your operations?"
                />
              </div>

              <div className="formGroup">
                <label className="formLabel" htmlFor="outcome">
                  Desired Outcome
                </label>
                <textarea
                  className="formTextarea"
                  id="outcome"
                  name="outcome"
                  required
                  placeholder="e.g. Instant response times, automated CRM sync, zero manual entry..."
                />
              </div>

              <button className="btnPrimary btnFull" type="submit">
                {copied
                  ? "✓ Brief Copied to Clipboard!"
                  : "Generate & Copy Project Brief ↗"}
              </button>

              {briefData && copied && (
                <div className="briefActionsRow">
                  <div className="briefActionsButtons">
                    <a
                      className="briefActionLink briefWhatsApp"
                      href={`https://wa.me/2348065755296?text=${briefData.encoded}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Send on WhatsApp ↗
                    </a>
                    <a
                      className="briefActionLink briefGmail"
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=okecaleb139@gmail.com&su=Automation%20project%20enquiry&body=${briefData.encoded}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Send via Gmail ↗
                    </a>
                  </div>
                </div>
              )}

              <p className="formStatus" aria-live="polite">
                {copied
                  ? "Your project brief is copied! Send it directly via WhatsApp or Email."
                  : "We'll follow up as soon as possible."}
              </p>
            </form>
          </div>
        </section>
      </div>

      {emailCopied && (
        <div className="toast" role="status" aria-live="polite">
          <strong>Email copied!</strong>
          <span>okecaleb139@gmail.com is on your clipboard.</span>
        </div>
      )}

      {copied && (
        <div className="toast" role="status" aria-live="polite">
          <strong>Project brief copied!</strong>
          <span>Choose WhatsApp or Email to send it directly to Caleb.</span>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="shell footerContainer">
          <div>
            <strong>Caleb Oke</strong> · AI Automation Engineer
          </div>

          <div className="footerLinks">
            <a
              href="https://www.linkedin.com/in/caleb-oke-6464b0216/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/techcaleb139"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.instagram.com/tech_caleb_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/2348065755296"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
