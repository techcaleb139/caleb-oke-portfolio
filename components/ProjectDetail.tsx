import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "../lib/project-types.ts";
import { ProjectMedia } from "./ProjectMedia.tsx";

/* The case study template, generated from a project's content file.
   The long-form body comes from that file's `caseStudy` markdown and is
   deliberately thin for now. */
export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <main className="caseStudyPage" id="top">
      <a className="skipLink" href="#case-body">Skip to the case study</a>

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

        <section className="projectSection">
          <h2>{project.findings.heading}</h2>
          <p>{project.findings.body}</p>
        </section>

        <section className="projectSection">
          <h2>{project.notProven.heading}</h2>
          <p>{project.notProven.body}</p>
        </section>

        <section className="projectSection">
          <h2>{project.nextStep.heading}</h2>
          <p>{project.nextStep.body}</p>
        </section>

        <article id="case-body" className="caseProse">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.caseStudy}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
