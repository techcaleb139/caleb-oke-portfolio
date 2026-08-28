import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PortfolioProject } from "../lib/project-types.ts";

type ProjectDetailProps = {
  slug: string;
  initialProject?: PortfolioProject;
};

export default function ProjectDetail({ slug, initialProject }: ProjectDetailProps) {
  const [project, setProject] = useState<PortfolioProject | undefined>(initialProject);
  const [loading, setLoading] = useState(!initialProject);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/projects?slug=${encodeURIComponent(slug)}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Project request failed")))
      .then((result: { projects?: PortfolioProject[] }) => {
        setProject(result.projects?.[0]);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!project || typeof document === "undefined") return;
    document.title = project.seoTitle || `${project.title} | Caleb Oke`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = project.seoDescription || project.summary;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/projects/${project.slug}`;
  }, [project]);

  if (loading) {
    return (
      <main className="projectPage">
        <div className="shell projectLoading" aria-live="polite">
          <div className="projectSkeleton projectSkeletonTitle" />
          <div className="projectSkeleton projectSkeletonLine" />
          <div className="projectSkeleton projectSkeletonVisual" />
          <span className="srOnly">Loading case study</span>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="projectPage">
        <section className="shell projectNotFound">
          <h1>Case study not found.</h1>
          <p>This project may be unpublished or the link may have changed.</p>
          <a className="button primary" href="/">Return to the portfolio</a>
        </section>
      </main>
    );
  }

  return (
    <main className="projectPage">
      <a className="skipLink" href="#case-study-content">Skip to case study</a>
      <header className="siteHeader">
        <nav className="nav shell" aria-label="Case study navigation">
          <a className="brand" href="/"><strong>Caleb Oke</strong><span>AI Automation Builder</span></a>
          <a className="navAction" href="/#contact">Start a project</a>
        </nav>
      </header>

      <article id="case-study-content">
        <header className="projectHero shell">
          <a className="projectBackLink" href="/#work">Back to documented systems</a>
          <div className="projectHeroGrid">
            <div>
              <h1>{project.title}</h1>
              <p>{project.summary}</p>
              <dl className="projectFactLine">
                <div><dt>Status</dt><dd>{project.statusLabel}</dd></div>
                <div><dt>Category</dt><dd>{project.category}</dd></div>
                <div><dt>Tools</dt><dd>{project.tools.join(" / ")}</dd></div>
              </dl>
              <div className="projectHeroActions">
                {project.repositoryUrl && <a className="button secondary" href={project.repositoryUrl} target="_blank" rel="noreferrer">View repository</a>}
                {project.liveUrl && <a className="button secondary" href={project.liveUrl} target="_blank" rel="noreferrer">Open live project</a>}
              </div>
            </div>
            <figure className="caseVisual projectHeroVisual">
              <img src={project.imageUrl} alt={project.imageAlt} width="1200" height="675" fetchPriority="high" />
              {project.imageCaption && <figcaption>{project.imageCaption}</figcaption>}
            </figure>
          </div>
        </header>

        <section className="projectEvidence shell" aria-labelledby="project-evidence-title">
          <h2 id="project-evidence-title">Evidence and limits.</h2>
          <div className="projectEvidenceGrid">
            <div><h3>What the test showed</h3><p>{project.observedResult}</p></div>
            <div><h3>Known limit</h3><p>{project.knownLimit}</p></div>
            <div><h3>Next test</h3><p>{project.nextTest}</p></div>
          </div>
        </section>

        <section className="projectPath shell" aria-labelledby="project-path-title">
          <h2 id="project-path-title">System path.</h2>
          <ol className="verificationRail" aria-label={`${project.title} system path`}>
            {project.stages.map((stage) => (
              <li key={stage.title}><strong>{stage.title}</strong><span>{stage.detail}</span></li>
            ))}
          </ol>
        </section>

        <section className="projectNarrative shell">
          <div className="markdownBody">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  const external = typeof href === "string" && /^https?:\/\//.test(href);
                  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} {...props}>{children}</a>;
                },
              }}
            >
              {project.contentMarkdown}
            </ReactMarkdown>
          </div>
          <aside className="projectClose">
            <h2>Have a process like this?</h2>
            <p>Describe the current workflow and the result you need. I will reply with questions before suggesting a build.</p>
            <a className="button primary" href="/#contact">Start a project</a>
          </aside>
        </section>
      </article>

      <footer className="footer">
        <div className="shell footerLayout">
          <div><strong>Caleb Oke</strong><span>Practical automation. Clear evidence. Human control.</span></div>
          <nav aria-label="Footer navigation"><a href="/">Portfolio</a><a href="/#contact">Contact</a></nav>
        </div>
      </footer>
    </main>
  );
}
