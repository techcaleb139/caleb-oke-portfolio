import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "../lib/project-types.ts";
import { FunnelDiagram, ProseSectionBlock } from "./ProjectCard.tsx";
import { ProjectMedia } from "./ProjectMedia.tsx";
import SiteFooter from "./SiteFooter.tsx";
import SiteHeader from "./SiteHeader.tsx";

/* The case study template, generated from a project's content file.

   It carries the same header, footer, status badge and evidence as the
   homepage card, because a visitor arriving here from search has not seen the
   homepage: they need the navigation, the contact route, and the badge that
   says what kind of thing they are reading before they read any claim. */
export default function ProjectDetail({ project }: { project: Project }) {
  const caseStudy = project.caseStudy?.trim();

  return (
    <div id="top">
      <a className="skipLink" href="#main">Skip to main content</a>
      <SiteHeader />

      <main className="caseStudyPage" id="main">
        <header className="caseStudyHeader shell">
          <a className="backLink" href="/#work">Back to all work</a>
          <span className="badge">{project.status}</span>
          <h1>{project.title}</h1>
          <p>{project.opening}</p>
          <p className="toolList">{project.tools.join(" \u00b7 ")}</p>
        </header>

        <div className="shell caseStudyBody">
          {project.media.map((slot) => (
            <ProjectMedia key={slot.src} slot={slot} />
          ))}

          <ProseSectionBlock section={project.findings} level={2} />

          {project.funnel ? <FunnelDiagram funnel={project.funnel} /> : null}

          {project.evidence.length > 0 ? (
            <div className="evidence" data-count={project.evidence.length}>
              {project.evidence.map((slot) => (
                <ProjectMedia key={slot.src} slot={slot} />
              ))}
            </div>
          ) : null}

          <ProseSectionBlock section={project.notProven} level={2} />
          <ProseSectionBlock section={project.nextStep} level={2} />

          {/* Rendered only when there is a write-up behind it. An empty
              "Overview" heading promises content that does not exist. */}
          {caseStudy ? (
            <article className="caseProse">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{caseStudy}</ReactMarkdown>
            </article>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
