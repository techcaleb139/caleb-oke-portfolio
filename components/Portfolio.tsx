import ContactForm from "./ContactForm.tsx";
import ProjectCard from "./ProjectCard.tsx";
import SiteFooter from "./SiteFooter.tsx";
import SiteHeader from "./SiteHeader.tsx";
import { allProjects } from "../src/content/projects/index.ts";
import { offers, offersClosing, offersHeading, offersIntro } from "../src/content/offers.ts";
import {
  about,
  contact,
  hero,
  profile,
  projectsClosing,
  projectsHeading,
  projectsIntro,
} from "../src/content/site.ts";

export default function Portfolio() {
  return (
    <div id="top">
      <a className="skipLink" href="#main">Skip to main content</a>
      <SiteHeader />

      <main id="main">
        {/* ---- hero ---- */}
        <section className="hero">
          <div className="shell heroInner">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="heroLead">{hero.lead}</p>

            <div className="heroActions">
              <a className="buttonPrimary" href={hero.primary.href}>{hero.primary.label}</a>
              <a className="buttonText" href={hero.secondary.href}>{hero.secondary.label}</a>
            </div>

            <p className="heroProof">{hero.proof}</p>
          </div>
        </section>

        {/* ---- offers ---- */}
        <section className="section" id="services">
          <div className="shell">
            <header className="sectionIntro">
              <h2>{offersHeading}</h2>
              <p>{offersIntro}</p>
            </header>

            <div className="offerGrid">
              {offers.map((offer) => (
                <article className="offer" key={offer.title}>
                  <h3>{offer.title}</h3>
                  <p className="offerPrice">{offer.price}</p>
                  <p className="offerBody">{offer.body}</p>
                  <p className="offerLimit">{offer.limit}</p>
                </article>
              ))}
            </div>

            <p className="offersClosing">{offersClosing}</p>
          </div>
        </section>

        {/* ---- projects ---- */}
        <section className="section" id="work">
          <div className="shell">
            <header className="sectionIntro">
              <h2>{projectsHeading}</h2>
              <p>{projectsIntro}</p>
            </header>

            <div className="projectList">
              {allProjects.map((project) => (
                <ProjectCard project={project} key={project.slug} />
              ))}
            </div>

            <p className="projectsClosing">{projectsClosing}</p>
          </div>
        </section>

        {/* ---- about ---- */}
        <section className="section" id="about">
          <div className="shell aboutGrid">
            <div className="mediaFrame" data-ratio="portrait">
              <picture>
                <source type="image/webp" srcSet={about.portrait.webpSrcSet} sizes={about.portrait.sizes} />
                <img
                  src={about.portrait.src}
                  alt={about.portrait.alt}
                  width={about.portrait.width}
                  height={about.portrait.height}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>

            <div className="aboutBody">
              <h2>{about.heading}</h2>
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <p className="aboutFootnote">
                {about.footnote.before}
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
                  {about.footnote.link}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ---- contact ---- */}
        <section className="section" id="contact">
          <div className="shell contactInner">
            <h2>{contact.heading}</h2>
            <p>{contact.intro}</p>

            <div className="contactDirect">
              <a href={`mailto:${profile.email}`}>Email</a>
              <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>

            {/* With JavaScript off the form cannot submit, and leaving it on
                screen would let someone fill it in and lose the message to a
                GET reload. Hide it and point at the direct links instead. */}
            <noscript>
              <style>{".contactForm{display:none}"}</style>
              <p className="noScriptNote">{contact.noScript}</p>
            </noscript>

            <ContactForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
