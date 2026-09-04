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

      <Section section={project.findings} />

      {project.funnel ? <FunnelDiagram funnel={project.funnel} /> : null}

      {project.evidence.length > 0 ? (
        <div className="evidence" data-count={project.evidence.length}>
          {project.evidence.map((slot) => (
            <ProjectMedia key={slot.src} slot={slot} />
          ))}
        </div>
      ) : null}

      <Section section={project.notProven} />
      <Section section={project.nextStep} />

      <div className="projectFoot">
        <span className="toolList">{project.tools.join(" \u00b7 ")}</span>
        <a href={`/projects/${project.slug}`}>Read the full case study</a>
      </div>
    </article>
  );
}

function Section({ section }: { section: ProseSection }) {
  return (
    <div className="projectSection">
      <h4>{section.heading}</h4>
      <p>{section.body}</p>
    </div>
  );
}

/* Counts in Instrument Serif, labels in muted Public Sans. No bars, no
   chart library, no icons. Horizontal on desktop, stacked on mobile. */
function FunnelDiagram({ funnel }: { funnel: Funnel }) {
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
