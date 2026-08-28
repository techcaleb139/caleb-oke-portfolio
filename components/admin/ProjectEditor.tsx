import { cloneElement, isValidElement, useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { PortfolioProject, ProjectStage } from "../../lib/project-types.ts";
import { isAuthenticationError, uploadProjectImage } from "./admin-api.ts";
import MarkdownEditor from "./MarkdownEditor.tsx";

type ProjectAction = "save" | "publish" | "unpublish" | "archive" | "restore" | "delete";

type ProjectEditorProps = {
  project: PortfolioProject;
  baseline: PortfolioProject;
  csrfToken: string;
  busy: boolean;
  onChange(project: PortfolioProject): void;
  onAction(action: ProjectAction, confirmTitle?: string): Promise<void>;
  onAuthenticationRequired(): void;
};

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isProjectImageUrl(value: string): boolean {
  return /^\/[a-zA-Z0-9/_.,+%()@-]+$/.test(value) || isHttpUrl(value);
}

export default function ProjectEditor({ project, baseline, csrfToken, busy, onChange, onAction, onAuthenticationRequired }: ProjectEditorProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [publishAttempted, setPublishAttempted] = useState(false);
  const publishErrorRef = useRef<HTMLDivElement>(null);
  const changed = useMemo(() => JSON.stringify(project) !== JSON.stringify(baseline), [project, baseline]);
  const publishMissing = useMemo(() => [
    { missing: !project.title.trim(), label: "Add the project title.", target: "project-title" },
    { missing: !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug), label: "Use a valid lowercase URL slug.", target: "project-slug" },
    { missing: !project.statusLabel.trim(), label: "Add a truthful status label.", target: "project-status-label" },
    { missing: !project.category.trim(), label: "Add a project category.", target: "project-category" },
    { missing: !project.summary.trim(), label: "Add the project summary.", target: "project-summary" },
    { missing: !project.observedResult.trim(), label: "Describe what the test showed.", target: "project-observed-result" },
    { missing: !project.knownLimit.trim(), label: "Describe a known limit.", target: "project-known-limit" },
    { missing: !project.nextTest.trim(), label: "Describe the next test.", target: "project-next-test" },
    { missing: !project.imageUrl || !isProjectImageUrl(project.imageUrl), label: project.imageUrl ? "Use a valid project image URL." : "Add a project image.", target: "project-image-url" },
    { missing: !project.imageAlt.trim(), label: "Describe the project image.", target: "project-image-alt" },
    { missing: project.stages.length < 2, label: "Add at least two system stages.", target: "project-add-stage" },
    ...project.stages.flatMap((stage, index) => [
      { missing: !stage.title.trim(), label: `Add a name for system stage ${index + 1}.`, target: `project-stage-${index}-title` },
      { missing: !stage.detail.trim(), label: `Describe what happens in system stage ${index + 1}.`, target: `project-stage-${index}-detail` },
    ]),
    { missing: project.tools.length < 1, label: "Add at least one system component.", target: "project-tools" },
    { missing: project.contentMarkdown.trim().length < 120, label: "Write a fuller case study.", target: "project-case-study" },
    { missing: !project.repositoryUrl && !project.liveUrl, label: "Add a repository or live project link.", target: "project-repository-url" },
    { missing: Boolean(project.repositoryUrl) && !isHttpUrl(project.repositoryUrl), label: "Use a valid repository URL.", target: "project-repository-url" },
    { missing: Boolean(project.liveUrl) && !isHttpUrl(project.liveUrl), label: "Use a valid live project URL.", target: "project-live-url" },
  ].filter((item) => item.missing), [project]);

  function update<K extends keyof PortfolioProject>(field: K, value: PortfolioProject[K]) {
    onChange({ ...project, [field]: value });
  }

  function generatedSlug() {
    const slug = project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
    update("slug", slug);
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploadProgress(0);
    try {
      const url = await uploadProjectImage(file, csrfToken, setUploadProgress);
      update("imageUrl", url);
      setUploadProgress(100);
    } catch (error) {
      if (isAuthenticationError(error)) onAuthenticationRequired();
      setUploadError(error instanceof Error ? error.message : "The image could not be uploaded.");
      setUploadProgress(null);
    }
  }

  function updateStage(index: number, field: keyof ProjectStage, value: string) {
    update("stages", project.stages.map((stage, stageIndex) => stageIndex === index ? { ...stage, [field]: value } : stage));
  }

  function moveStage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= project.stages.length) return;
    const stages = [...project.stages];
    [stages[index], stages[target]] = [stages[target], stages[index]];
    update("stages", stages);
  }

  function requestPublish() {
    if (publishMissing.length) {
      setPublishAttempted(true);
      window.requestAnimationFrame(() => publishErrorRef.current?.focus());
      return;
    }
    setPublishAttempted(false);
    void onAction("publish");
  }

  function focusMissingField(target: string) {
    document.getElementById(target)?.focus();
  }

  return (
    <div className="adminEditorGrid">
      <div className="adminEditorCanvas">
        <header className="adminEditorHeader">
          <div>
            <h1>{project.id ? project.title || "Untitled project" : "New project"}</h1>
            <p>{changed ? "Unsaved changes" : project.updatedAt ? `Saved ${formatDate(project.updatedAt)}` : "Not saved yet"}</p>
          </div>
          <a href={project.slug ? `/projects/${project.slug}` : "/#work"} target="_blank" rel="noreferrer">Open public preview</a>
        </header>

        <EditorSection title="Project identity" description="The facts visitors see before they inspect the evidence.">
          <AdminField label="Project title" required error={publishAttempted && !project.title.trim() ? "Add the project title before publishing." : undefined}>
            <input id="project-title" value={project.title} onChange={(event) => update("title", event.target.value)} maxLength={160} aria-invalid={publishAttempted && !project.title.trim()} />
          </AdminField>
          <div className="adminField adminSlugField">
            <label htmlFor="project-slug">URL slug <span>Required</span></label>
            <div><input id="project-slug" value={project.slug} onChange={(event) => update("slug", event.target.value.toLowerCase())} maxLength={120} aria-invalid={publishAttempted && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)} aria-describedby={`project-slug-help${publishAttempted && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) ? " project-slug-error" : ""}`} /><button type="button" onClick={generatedSlug}>Generate</button></div>
            <p id="project-slug-help" className="adminFieldHelp">Public URL: /projects/{project.slug || "your-project-slug"}</p>
            {publishAttempted && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) && <p id="project-slug-error" className="adminFieldError" role="alert">Use lowercase letters, numbers, and single hyphens only.</p>}
          </div>
          <div className="adminTwoColumns">
            <AdminField label="Truthful status label" required help="Examples: Academy prototype, Working personal system, Client pilot." error={publishAttempted && !project.statusLabel.trim() ? "Add a truthful status label before publishing." : undefined}>
              <input id="project-status-label" value={project.statusLabel} onChange={(event) => update("statusLabel", event.target.value)} maxLength={100} aria-invalid={publishAttempted && !project.statusLabel.trim()} />
            </AdminField>
            <AdminField label="Category" required help="Examples: Voice AI, Workflow automation, Data automation." error={publishAttempted && !project.category.trim() ? "Add a project category before publishing." : undefined}>
              <input id="project-category" value={project.category} onChange={(event) => update("category", event.target.value)} maxLength={100} aria-invalid={publishAttempted && !project.category.trim()} />
            </AdminField>
          </div>
          <AdminField label="Summary" required help="Explain what the system does and its real validation status in plain language." error={publishAttempted && !project.summary.trim() ? "Add the project summary before publishing." : undefined}>
            <textarea id="project-summary" value={project.summary} onChange={(event) => update("summary", event.target.value)} maxLength={600} rows={4} aria-invalid={publishAttempted && !project.summary.trim()} />
          </AdminField>
        </EditorSection>

        <EditorSection title="Evidence" description="Keep results, limits, and the next test beside each other.">
          <AdminField label="What the test showed" required error={publishAttempted && !project.observedResult.trim() ? "Describe what the test showed before publishing." : undefined}>
            <textarea id="project-observed-result" value={project.observedResult} onChange={(event) => update("observedResult", event.target.value)} rows={4} maxLength={1200} aria-invalid={publishAttempted && !project.observedResult.trim()} />
          </AdminField>
          <AdminField label="Known limit" required error={publishAttempted && !project.knownLimit.trim() ? "Describe a known limit before publishing." : undefined}>
            <textarea id="project-known-limit" value={project.knownLimit} onChange={(event) => update("knownLimit", event.target.value)} rows={4} maxLength={1200} aria-invalid={publishAttempted && !project.knownLimit.trim()} />
          </AdminField>
          <AdminField label="Next test" required error={publishAttempted && !project.nextTest.trim() ? "Describe the next test before publishing." : undefined}>
            <textarea id="project-next-test" value={project.nextTest} onChange={(event) => update("nextTest", event.target.value)} rows={4} maxLength={1200} aria-invalid={publishAttempted && !project.nextTest.trim()} />
          </AdminField>
        </EditorSection>

        <EditorSection title="System path" description="Add the ordered stages a visitor should understand. Two to eight stages work best.">
          <div className="stageList">
            {project.stages.map((stage, index) => (
              <div className="stageEditor" key={`${index}-${stage.title}`}>
                <div className="stageOrder"><span>{index + 1}</span><button type="button" onClick={() => moveStage(index, -1)} disabled={index === 0}>Move up</button><button type="button" onClick={() => moveStage(index, 1)} disabled={index === project.stages.length - 1}>Move down</button></div>
                <AdminField label="Stage name" required error={publishAttempted && !stage.title.trim() ? `Add a name for stage ${index + 1}.` : undefined}><input id={`project-stage-${index}-title`} value={stage.title} onChange={(event) => updateStage(index, "title", event.target.value)} maxLength={60} aria-invalid={publishAttempted && !stage.title.trim()} /></AdminField>
                <AdminField label="What happens" required error={publishAttempted && !stage.detail.trim() ? `Describe what happens in stage ${index + 1}.` : undefined}><textarea id={`project-stage-${index}-detail`} value={stage.detail} onChange={(event) => updateStage(index, "detail", event.target.value)} maxLength={280} rows={2} aria-invalid={publishAttempted && !stage.detail.trim()} /></AdminField>
                <button className="adminTextAction dangerText" type="button" onClick={() => update("stages", project.stages.filter((_, stageIndex) => stageIndex !== index))}>Remove stage</button>
              </div>
            ))}
          </div>
          <button id="project-add-stage" className="adminSecondaryButton" type="button" disabled={project.stages.length >= 8} aria-describedby={publishAttempted && project.stages.length < 2 ? "project-stages-error" : undefined} onClick={() => update("stages", [...project.stages, { title: "", detail: "" }])}>Add system stage</button>
          {publishAttempted && project.stages.length < 2 && <p id="project-stages-error" className="adminFieldError" role="alert">Add at least two system stages before publishing.</p>}
        </EditorSection>

        <EditorSection title="Tools and links" description="List only tools that were actually part of this build.">
          <AdminField label="System components" required help="Separate tool names with commas." error={publishAttempted && project.tools.length < 1 ? "Add at least one system component before publishing." : undefined}>
            <input id="project-tools" aria-invalid={publishAttempted && project.tools.length < 1} value={project.tools.join(", ")} onChange={(event) => update("tools", event.target.value.split(",").map((tool) => tool.trim()).filter(Boolean))} />
          </AdminField>
          <div className="adminTwoColumns">
            <AdminField label="Repository URL" error={publishAttempted && !project.repositoryUrl && !project.liveUrl ? "Add a repository URL or a live project URL before publishing." : publishAttempted && Boolean(project.repositoryUrl) && !isHttpUrl(project.repositoryUrl) ? "Use a valid HTTP or HTTPS repository URL." : undefined}><input id="project-repository-url" aria-invalid={publishAttempted && ((!project.repositoryUrl && !project.liveUrl) || (Boolean(project.repositoryUrl) && !isHttpUrl(project.repositoryUrl)))} type="url" value={project.repositoryUrl} onChange={(event) => update("repositoryUrl", event.target.value)} placeholder="https://github.com/..." /></AdminField>
            <AdminField label="Live project URL" error={publishAttempted && Boolean(project.liveUrl) && !isHttpUrl(project.liveUrl) ? "Use a valid HTTP or HTTPS live project URL." : undefined}><input id="project-live-url" type="url" aria-invalid={publishAttempted && Boolean(project.liveUrl) && !isHttpUrl(project.liveUrl)} value={project.liveUrl} onChange={(event) => update("liveUrl", event.target.value)} placeholder="https://..." /></AdminField>
          </div>
        </EditorSection>

        <EditorSection title="Project image" description="Use a real workflow image, product screenshot, or approved photograph. Do not use decorative AI filler.">
          {project.imageUrl && <figure className="adminImagePreview"><img src={project.imageUrl} alt={project.imageAlt || "Current project image preview"} /><figcaption>{project.imageCaption || "Current project image"}</figcaption></figure>}
          <div className="adminUploadRow">
            <label className="adminUploadButton">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event.target.files?.[0])} /></label>
            {uploadProgress !== null && <span aria-live="polite">Upload {uploadProgress}%</span>}
          </div>
          {uploadError && <p className="adminInlineError">{uploadError}</p>}
          <AdminField label="Image URL" required help="You can paste an HTTPS URL if Blob upload is not configured." error={publishAttempted && (!project.imageUrl || !isProjectImageUrl(project.imageUrl)) ? project.imageUrl ? "Use a valid HTTP, HTTPS, or portfolio-relative image URL." : "Add a project image before publishing." : undefined}><input id="project-image-url" aria-invalid={publishAttempted && (!project.imageUrl || !isProjectImageUrl(project.imageUrl))} type="text" inputMode="url" value={project.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} /></AdminField>
          <AdminField label="Image alternative text" required help="Describe what the image proves or shows for someone who cannot see it." error={publishAttempted && !project.imageAlt.trim() ? "Describe what the project image shows before publishing." : undefined}><input id="project-image-alt" aria-invalid={publishAttempted && !project.imageAlt.trim()} value={project.imageAlt} onChange={(event) => update("imageAlt", event.target.value)} maxLength={240} /></AdminField>
          <AdminField label="Image caption"><input value={project.imageCaption} onChange={(event) => update("imageCaption", event.target.value)} maxLength={240} /></AdminField>
        </EditorSection>

        <EditorSection title="Full case study" description="Write the detailed story in Markdown. The public page renders it as structured, readable content.">
          <MarkdownEditor id="project-case-study" invalid={publishAttempted && project.contentMarkdown.trim().length < 120} error={publishAttempted && project.contentMarkdown.trim().length < 120 ? "Write at least 120 characters of case-study content before publishing." : undefined} value={project.contentMarkdown} onChange={(value) => update("contentMarkdown", value)} />
        </EditorSection>

        <EditorSection title="Search preview" description="These fields control how the case study can appear in search results and link previews.">
          <AdminField label="SEO title" help={`${project.seoTitle.length}/70 characters`}><input value={project.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} maxLength={70} placeholder={`${project.title || "Project title"} | Caleb Oke`} /></AdminField>
          <AdminField label="SEO description" help={`${project.seoDescription.length}/170 characters`}><textarea value={project.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} maxLength={170} rows={3} /></AdminField>
        </EditorSection>
      </div>

      <aside className="publishInspector" aria-label="Publishing controls">
        <div className="publishStatus">
          <span className={`realStatus ${project.publicationStatus}`}>{project.publicationStatus}</span>
          <strong>{project.id ? `Revision ${project.version}` : "New record"}</strong>
        </div>
        <label className="adminCheck"><input type="checkbox" checked={project.featured} onChange={(event) => update("featured", event.target.checked)} /><span>Show on the portfolio homepage</span></label>
        <AdminField label="Display order" help="Lower numbers appear first."><input type="number" min="0" max="9999" value={project.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></AdminField>
        <AdminField label="Homepage layout"><select value={project.layoutVariant} onChange={(event) => update("layoutVariant", event.target.value as PortfolioProject['layoutVariant'])}><option value="split">Split evidence layout</option><option value="wide">Wide evidence layout</option></select></AdminField>

        {publishAttempted && publishMissing.length > 0 && (
          <div className="publishErrorSummary" ref={publishErrorRef} tabIndex={-1} role="alert" aria-labelledby="publish-error-title">
            <h2 id="publish-error-title">Complete before publishing</h2>
            <ul>{publishMissing.map((item) => <li key={item.target}><button type="button" onClick={() => focusMissingField(item.target)}>{item.label}</button></li>)}</ul>
          </div>
        )}

        <div className="publishActions">
          {project.publicationStatus === "published" ? (
            <button className="adminPrimaryButton" type="button" disabled={busy} onClick={requestPublish}>{busy ? "Working..." : "Publish updates"}</button>
          ) : project.publicationStatus === "archived" ? (
            <button className="adminPrimaryButton" type="button" disabled={busy} onClick={() => onAction("restore")}>{busy ? "Working..." : "Restore to drafts"}</button>
          ) : (
            <button className="adminPrimaryButton" type="button" disabled={busy} onClick={requestPublish}>{busy ? "Working..." : "Publish project"}</button>
          )}
          {project.publicationStatus !== "archived" && <button className="adminSecondaryButton" type="button" disabled={busy || !changed} onClick={() => onAction("save")}>{project.id ? "Save changes" : "Save draft"}</button>}
          {project.publicationStatus === "published" && <button className="adminTextAction" type="button" disabled={busy} onClick={() => onAction("unpublish")}>Move back to draft</button>}
          {project.id && project.publicationStatus !== "archived" && <button className="adminTextAction" type="button" disabled={busy} onClick={() => onAction("archive")}>Move to archive</button>}
        </div>

        {project.id && project.publicationStatus === "archived" && (
          <div className="adminDangerZone">
            {!deleteOpen ? <button type="button" onClick={() => setDeleteOpen(true)}>Permanently delete</button> : (
              <>
                <p>This cannot be undone. Type the full project title to continue.</p>
                <input value={deleteTitle} onChange={(event) => setDeleteTitle(event.target.value)} aria-label="Project title confirmation" />
                <button type="button" disabled={busy || deleteTitle !== project.title} onClick={() => onAction("delete", deleteTitle)}>Delete permanently</button>
              </>
            )}
          </div>
        )}

        <div className="publishChecklist">
          <h2>Publish checklist</h2>
          <ul>
            <ChecklistItem done={Boolean(project.imageUrl && project.imageAlt.trim())} label="Image and alternative text" />
            <ChecklistItem done={project.stages.length >= 2} label="At least two system stages" />
            <ChecklistItem done={project.tools.length >= 1} label="System components" />
            <ChecklistItem done={project.contentMarkdown.trim().length >= 120} label="Full case study" />
            <ChecklistItem done={Boolean(project.repositoryUrl || project.liveUrl)} label="Repository or live link" />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="adminEditorSection"><header><h2>{title}</h2><p>{description}</p></header><div className="adminSectionFields">{children}</div></section>;
}

function AdminField({ label, help, error, required, children }: { label: string; help?: string; error?: string; required?: boolean; children: ReactElement<{ id?: string; required?: boolean; "aria-describedby"?: string }> }) {
  const generatedId = useId().replaceAll(":", "");
  const control = isValidElement(children) ? children : null;
  const controlId = control?.props.id || `admin-field-${generatedId}`;
  const helpId = help ? `${controlId}-help` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [control?.props["aria-describedby"], helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="adminField">
      <label htmlFor={controlId}>{label}{required && <span>Required</span>}</label>
      {control && cloneElement(control, { id: controlId, required: required || control.props.required, "aria-describedby": describedBy })}
      {help && <p id={helpId} className="adminFieldHelp">{help}</p>}
      {error && <p id={errorId} className="adminFieldError" role="alert">{error}</p>}
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return <li data-complete={done ? "true" : "false"}><span>{done ? "Ready" : "Needed"}</span>{label}</li>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
