import type { CSSProperties } from "react";
import type { Funnel, Project, ProseSection } from "../lib/project-types.ts";
import { ProjectMedia } from "./ProjectMedia.tsx";

/* One project, rendered entirely from its content file. Nothing here is
   specific to a particular project, so the section works with two entries
   or with six without a layout change. */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project">
      <span className="badge">{project.status}</span>
      <h3>{project.title}</h3>
      <p>{project.opening}</p>

      {project.media.map((slot) => (
        <ProjectMedia key={slot.src} slot={slot} />
      ))}

      <ProseSectionBlock section={project.findings} level={4} />

      {project.funnel ? <FunnelDiagram funnel={project.funnel} /> : null}

      {project.evidence.length > 0 ? (
        <div className="evidence" data-count={project.evidence.length}>
          {project.evidence.map((slot) => (
            <ProjectMedia key={slot.src} slot={slot} />
          ))}
        </div>
      ) : null}

      <ProseSectionBlock section={project.notProven} level={4} />
      <ProseSectionBlock section={project.nextStep} level={4} />

      <div className="projectFoot">
        <span className="toolList">{project.tools.join(" \u00b7 ")}</span>
        <a href={`/projects/${project.slug}`}>Read the full case study</a>
      </div>
    </article>
  );
}

/* Shared with the case study template, which renders the same sections one
   heading level up: h4 inside a card on the homepage, h2 on a page whose h1
   is the project title. Keeping the level a prop is what stops either page
   skipping a level. */
export function ProseSectionBlock({ section, level }: { section: ProseSection; level: 2 | 4 }) {
  const Heading = level === 2 ? "h2" : "h4";
  return (
    <div className="projectSection">
      <Heading>{section.heading}</Heading>
      <p>{section.body}</p>
    </div>
  );
}

/* Counts in the display weight, labels in muted Public Sans. No bars, no
   chart library, no icons. Horizontal on desktop, stacked on mobile. */
export function FunnelDiagram({ funnel }: { funnel: Funnel }) {
  return (
    <div className="funnelBlock">
      <ol className="funnel" style={{ "--stages": funnel.stages.length } as CSSProperties}>
        {funnel.stages.map((stage) => (
          <li key={stage.label} className="funnelStage">
            <span className="funnelLabel">{stage.label}</span>
            <span className="funnelCount">{stage.count}</span>
          </li>
        ))}
      </ol>
      <p className="mediaCaption">{funnel.caption}</p>
    </div>
  );
}
