"use client";

import { FormEvent, useState } from "react";

const skills = ["n8n", "Vapi", "Make.com", "Zapier", "APIs", "JavaScript", "Python", "Webhooks", "AI agents", "Docker", "Telegram", "Google Sheets"];
const services = [
  ["01", "Voice AI systems", "AI receptionists, phone qualification, reservations, support and call routing designed around real business rules."],
  ["02", "Workflow automation", "Reliable systems that move work between CRMs, spreadsheets, email, internal tools and third party APIs."],
  ["03", "Data and API pipelines", "Multi source ingestion, normalization, filtering, deduplication and reporting built for operational use."],
  ["04", "Controlled AI agents", "Agents that reason over information, use tools and hand risky decisions back to a human."],
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  async function prepareBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const brief = `Automation project brief\n\nName: ${data.get("name")}\nBusiness: ${data.get("business")}\nCurrent manual process: ${data.get("process")}\nDesired outcome: ${data.get("outcome")}`;
    await navigator.clipboard.writeText(brief);
    setCopied(true);
  }
  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="CoreWill home"><span>CW</span><span className="brandWords"><strong>CoreWill</strong><small>Caleb Oke</small></span></a>
        <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">Menu</button>
        <div className={menuOpen ? "navLinks open" : "navLinks"}>
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="navCta" href="#contact" onClick={() => setMenuOpen(false)}>Discuss a project <span>↗</span></a>
        </div>
      </nav>
      <section className="hero shell" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><span className="statusDot" /> Caleb Oke · Founder, CoreWill</p>
          <h1>AI systems that do <em>real business work.</em></h1>
          <p className="heroText">I design voice agents, intelligent workflows and data pipelines that connect your tools, handle repetitive work and keep humans in control where judgment matters.</p>
          <div className="heroActions"><a className="button primary" href="#work">See the systems <span>↓</span></a><a className="button textButton" href="#contact">Tell me what is slowing you down <span>↗</span></a></div>
          <div className="proofLine"><strong>Proof, not promises.</strong><span>Two documented systems. Real architecture. No invented metrics.</span></div>
        </div>
        <div className="heroVisual" aria-label="Automation system overview">
          <div className="portraitFrame"><div className="portraitPlaceholder"><span>Caleb Oke</span><small>Identity preserved portrait pending original photos</small></div><div className="portraitTag">Based in Nigeria · Working remotely</div></div>
          <div className="signalCard signalOne"><span>VOICE</span><strong>Customer call understood</strong><small>Vapi → n8n → business action</small></div>
          <div className="signalCard signalTwo"><span>DATA</span><strong>Only relevant matches pass</strong><small>APIs → filtering → Telegram</small></div>
        </div>
      </section>
      <section className="skillRail" aria-label="Technical capabilities"><div className="skillTrack">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
      <section className="work shell section" id="work">
        <div className="sectionIntro"><p className="kicker">Selected work</p><h2>Systems I have built.</h2><p>These are portfolio systems, presented honestly. Each demonstrates the architecture, decisions and working outcome without pretending it was a paid client deployment.</p></div>
        <article className="case caseVoice">
          <div className="caseMeta"><span>01</span><span>Voice AI · Restaurant operations</span></div>
          <div className="caseContent"><div><p className="caseLabel">Mama Tee&apos;s Kitchen</p><h3>Autonomous voice ordering system</h3><p>A localized voice assistant for an Abuja restaurant that handles inbound calls, takes structured food orders, books reservations and answers business enquiries.</p></div><div className="outcome"><span>Demonstrated outcome</span><p>A live conversation becomes validated, structured operational data without manual order entry.</p></div></div>
          <div className="architecture" aria-label="System architecture"><div><small>01</small><strong>Customer call</strong><span>Natural conversation</span></div><i>→</i><div><small>02</small><strong>Vapi agent</strong><span>Intent and extraction</span></div><i>→</i><div><small>03</small><strong>n8n workflow</strong><span>Validation and routing</span></div><i>→</i><div><small>04</small><strong>Google Sheets</strong><span>Operational record</span></div></div>
          <div className="caseFooter"><div>{["Vapi", "n8n", "Webhooks", "Google Sheets", "Prompt engineering"].map(x => <span key={x}>{x}</span>)}</div><a href="#voice-details">Read engineering notes <span>↗</span></a></div>
        </article>
        <div className="engineeringNotes" id="voice-details"><div><span>What made it difficult</span><p>Nigerian names and local dishes, incomplete customer information, intent routing and keeping invalid data out of the operational record.</p></div><div><span>Engineering judgment</span><p>The language model handles conversation and extraction. Deterministic workflow logic enforces rules that must behave consistently every time.</p></div></div>
        <article className="case caseData">
          <div className="caseMeta"><span>02</span><span>Data automation · Job intelligence</span></div>
          <div className="caseContent"><div><p className="caseLabel">Multi source pipeline</p><h3>Automated job search engine</h3><p>A self hosted, twice daily monitoring system that gathers listings from multiple sources, standardizes inconsistent data and sends only qualified matches to Telegram.</p></div><div className="outcome"><span>Demonstrated outcome</span><p>Raw listings are normalized, evaluated against precise criteria, deduplicated and delivered as focused alerts.</p></div></div>
          <div className="pipelineVisual"><div className="sources"><span>Apify LinkedIn API</span><span>RemoteOK API</span></div><div className="pipe">→</div><div className="processor"><small>CUSTOM PARSER</small><strong>Normalize → parse → filter</strong><code>&quot;ai&quot; ≠ &quot;maintenance&quot;</code></div><div className="pipe">→</div><div className="destination"><span>Telegram</span><strong>Qualified alerts</strong><small>Stateful deduplication</small></div></div>
          <div className="caseFooter"><div>{["n8n", "REST APIs", "JavaScript", "Regex", "Docker", "Telegram"].map(x => <span key={x}>{x}</span>)}</div><a href="#job-details">Read engineering notes <span>↗</span></a></div>
        </article>
        <div className="engineeringNotes" id="job-details"><div><span>What made it difficult</span><p>Different source schemas, work authorization and timezone exclusions, complex search expressions and avoiding repeat alerts.</p></div><div><span>A bug worth solving</span><p>A custom recursive descent parser and word boundary matching stop short terms such as “ai” from producing false positives inside unrelated words.</p></div></div>
      </section>
      <section className="services section" id="services"><div className="shell"><div className="sectionIntro light"><p className="kicker">What I can build</p><h2>Automation shaped around the way your business actually works.</h2></div><div className="serviceGrid">{services.map(([num,title,copy]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="process shell section"><div className="sectionIntro"><p className="kicker">How I work</p><h2>Clear thinking before clever tools.</h2></div><div className="steps">{[["01","Understand","Find the bottleneck, the people involved and the outcome that matters."],["02","Design","Map integrations, decisions, data, edge cases and safe human handoffs."],["03","Build","Connect the system and make important rules predictable."],["04","Test","Exercise happy paths, messy inputs and failure scenarios."],["05","Deploy","Document the approved system and make ownership clear."]].map(s => <div key={s[0]}><span>{s[0]}</span><strong>{s[1]}</strong><p>{s[2]}</p></div>)}</div></section>
      <section className="about shell section" id="about"><div className="aboutQuote">“I care less about impressive looking workflows and more about whether the system solves the actual problem.”</div><div className="aboutCopy"><p className="kicker">Caleb Oke · Founder, CoreWill</p><h2>Curious about where software should take over, and where it should not.</h2><p>I got into automation through a simple question: how much repetitive business work can software handle before a human genuinely needs to step in?</p><p>That curiosity led me into APIs, workflow tools, voice AI and agent based systems. Through CoreWill, I build with practical guardrails because useful automation should be reliable, understandable and designed for the people who live with it.</p></div></section>
      <section className="contact section" id="contact"><div className="shell contactGrid"><div><p className="kicker">Start with the problem</p><h2>Have a process you think AI could automate?</h2><p>Describe what your team does manually and what you want to improve. This creates a concise brief you can send directly to Caleb.</p><div className="contactActions"><a href="mailto:okecaleb139@gmail.com"><strong>Email Caleb</strong><span>okecaleb139@gmail.com ↗</span></a><a href="https://wa.me/2348065755296" target="_blank" rel="noreferrer"><strong>WhatsApp</strong><span>+234 806 575 5296 ↗</span></a><a href="tel:+2348065755296"><strong>Call</strong><span>+234 806 575 5296 ↗</span></a></div><p className="contactNote">No pressure. No invented savings calculator. Just a useful starting point.</p></div><form onSubmit={prepareBrief}><label>Your name<input name="name" required placeholder="How should I address you?" /></label><label>Business or team<input name="business" required placeholder="What does your team do?" /></label><label>What happens manually today?<textarea name="process" required placeholder="Walk me through the repetitive process." /></label><label>What would a better outcome look like?<textarea name="outcome" required placeholder="Faster response, fewer errors, less admin…" /></label><button className="button primary" type="submit">{copied ? "Brief copied — send it to Caleb" : "Copy my project brief"} <span>↗</span></button></form></div></section>
      <footer className="shell"><div className="brand"><span>CW</span><span className="brandWords"><strong>CoreWill</strong><small>Caleb Oke · AI Automation Engineer</small></span></div><p>AI agents · Voice systems · Business workflow automation</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
