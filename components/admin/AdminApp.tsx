import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioProject } from "../../lib/project-types.ts";
import { blankProject } from "../../lib/project-types.ts";
import {
  type AdminSessionState,
  changeAdminPassword,
  getAdminProjects,
  getAdminSession,
  isAuthenticationError,
  loginAdmin,
  logoutAdmin,
  mutateProject,
} from "./admin-api.ts";
import ProjectEditor from "./ProjectEditor.tsx";

type AdminView = "projects" | "security";
type ProjectFilter = "active" | "published" | "draft" | "archived";

export default function AdminApp() {
  const [session, setSession] = useState<AdminSessionState | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [baseline, setBaseline] = useState<PortfolioProject | null>(null);
  const [view, setView] = useState<AdminView>("projects");
  const [filter, setFilter] = useState<ProjectFilter>("active");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error" | "info"; message: string } | null>(null);
  const [reauthRequired, setReauthRequired] = useState(false);

  const changed = Boolean(selected && baseline && JSON.stringify(selected) !== JSON.stringify(baseline));

  useEffect(() => {
    document.title = "Portfolio publishing desk | Caleb Oke";
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots) robots.content = "noindex, nofollow, noarchive";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/admin`;
  }, []);

  useEffect(() => {
    getAdminSession().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (!session?.authenticated) return;
    getAdminProjects()
      .then((items) => {
        setProjects(items);
        const first = items.find((project) => project.publicationStatus !== "archived") || items[0];
        if (first) {
          const copy = structuredClone(first);
          setSelected(copy);
          setBaseline(structuredClone(copy));
        }
      })
      .catch((error) => setNotice({ tone: "error", message: error instanceof Error ? error.message : "Projects could not be loaded." }))
      .finally(() => setBusy(false));
  }, [session?.authenticated]);

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  function selectProject(project: PortfolioProject, force = false) {
    if (!force && changed && !window.confirm("Discard the unsaved changes and open another project?")) return;
    const copy = structuredClone(project);
    setSelected(copy);
    setBaseline(structuredClone(copy));
    setNotice(null);
    setView("projects");
  }

  function startProject() {
    if (changed && !window.confirm("Discard the unsaved changes and start a new project?")) return;
    const project = blankProject();
    setSelected(project);
    setBaseline(structuredClone(project));
    setNotice(null);
    setView("projects");
  }

  async function handleProjectAction(action: "save" | "publish" | "unpublish" | "archive" | "restore" | "delete", confirmTitle?: string) {
    if (!selected || !session?.csrfToken) return;
    setBusy(true);
    setNotice({ tone: "info", message: action === "publish" ? "Publishing the project..." : "Saving the project..." });
    try {
      const result = await mutateProject(session.csrfToken, action, selected, confirmTitle);
      setProjects(result.projects);
      if (result.deleted) {
        const next = result.projects.find((project) => project.publicationStatus !== "archived") || result.projects[0] || null;
        if (next) selectProject(next, true);
        else {
          setSelected(null);
          setBaseline(null);
        }
      } else if (result.project) {
        setSelected(structuredClone(result.project));
        setBaseline(structuredClone(result.project));
      }
      setNotice({ tone: "success", message: result.deployment.message });
    } catch (error) {
      if (isAuthenticationError(error)) {
        setReauthRequired(true);
        setNotice({ tone: "info", message: "Your session expired. Sign in again to keep working; your unsaved edits are still here." });
        return;
      }
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "The project could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!session?.csrfToken) return;
    if (changed && !window.confirm("Sign out and discard the unsaved changes?")) return;
    try {
      await logoutAdmin(session.csrfToken);
    } finally {
      setSession({ authenticated: false });
      setProjects([]);
      setSelected(null);
      setBaseline(null);
    }
  }

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesQuery = !query.trim() || `${project.title} ${project.category} ${project.statusLabel}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "active"
      ? project.publicationStatus !== "archived"
      : project.publicationStatus === filter;
    return matchesQuery && matchesFilter;
  }), [projects, query, filter]);

  if (session === null) return <AdminBoot />;
  if (!session.authenticated) return <Login onAuthenticated={setSession} />;

  return (
    <main className="adminShell">
      <header className="adminTopbar">
        <a className="adminBrand" href="/" target="_blank" rel="noreferrer"><strong>Caleb Oke</strong><span>Portfolio publishing desk</span></a>
        <nav aria-label="Admin navigation">
          <button type="button" data-current={view === "projects"} onClick={() => setView("projects")}>Projects</button>
          <button type="button" data-current={view === "security"} onClick={() => setView("security")}>Security</button>
          <a href="/" target="_blank" rel="noreferrer">View site</a>
        </nav>
        <button className="adminSignOut" type="button" onClick={signOut}>Sign out</button>
      </header>

      {notice && <div className={`adminNotice ${notice.tone}`} role="status"><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)}>Dismiss</button></div>}

      {view === "security" ? (
        <SecurityView session={session} onSessionChange={setSession} onAuthenticationRequired={() => setReauthRequired(true)} />
      ) : (
        <div className="adminWorkspace">
          <aside className="projectRail" aria-label="Project library">
            <div className="projectRailHeading"><div><h1>Projects</h1><p>{projects.length} total</p></div><button type="button" onClick={startProject}>New project</button></div>
            <label className="adminSearch"><span className="srOnly">Search projects</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label>
            <div className="projectFilters" role="group" aria-label="Filter projects">
              {(["active", "published", "draft", "archived"] as ProjectFilter[]).map((item) => <button type="button" key={item} data-current={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
            <div className="projectRailList">
              {busy && !projects.length ? <ProjectListSkeleton /> : filteredProjects.length ? filteredProjects.map((project) => (
                <button className="projectRailItem" type="button" data-current={selected?.id === project.id} key={project.id} onClick={() => selectProject(project)}>
                  <strong>{project.title}</strong>
                  <span><i className={`realStatus ${project.publicationStatus}`}>{project.publicationStatus}</i>{project.category}</span>
                </button>
              )) : <div className="projectRailEmpty"><strong>No matching projects</strong><p>Change the filter or create a new project.</p></div>}
            </div>
          </aside>

          <section className="adminMain">
            {selected && baseline && session.csrfToken ? (
              <ProjectEditor key={selected.id || "new-project"} project={selected} baseline={baseline} csrfToken={session.csrfToken} busy={busy} onChange={setSelected} onAction={handleProjectAction} onAuthenticationRequired={() => setReauthRequired(true)} />
            ) : (
              <div className="adminEmptyState"><h1>Build the next case study.</h1><p>Create a project, save it privately, and publish only when the evidence and limits are ready.</p><button className="adminPrimaryButton" type="button" onClick={startProject}>Create a project</button></div>
            )}
          </section>
        </div>
      )}
      {reauthRequired && <Reauthenticate onAuthenticated={(nextSession) => { setSession(nextSession); setReauthRequired(false); setNotice({ tone: "success", message: "Session restored. Your unsaved edits were preserved." }); }} />}
    </main>
  );
}

function Login({ onAuthenticated }: { onAuthenticated(session: AdminSessionState): void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onAuthenticated(await loginAdmin(email, password));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adminLogin">
      <section>
        <a href="/" className="adminBrand"><strong>Caleb Oke</strong><span>Portfolio publishing desk</span></a>
        <div className="adminLoginCopy"><h1>Private publishing access.</h1><p>Edit projects, review every claim, and publish updates to the live portfolio.</p></div>
        <form onSubmit={submit}>
          {error && <p className="adminInlineError" role="alert">{error}</p>}
          <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={14} maxLength={128} /></label>
          <button className="adminPrimaryButton" type="submit" disabled={busy}>{busy ? "Checking access..." : "Sign in"}</button>
        </form>
        <p className="adminLoginNote">This route is not indexed. Sessions expire after eight hours and credentials are never stored in the browser.</p>
      </section>
    </main>
  );
}

function SecurityView({ session, onSessionChange, onAuthenticationRequired }: { session: AdminSessionState; onSessionChange(session: AdminSessionState): void; onAuthenticationRequired(): void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session.csrfToken) return;
    if (nextPassword !== confirmPassword) {
      setMessage({ tone: "error", text: "The new passwords do not match." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const updated = await changeAdminPassword(session.csrfToken, currentPassword, nextPassword);
      onSessionChange(updated);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setMessage({ tone: "success", text: updated.message || "Password updated." });
    } catch (error) {
      if (isAuthenticationError(error)) {
        onAuthenticationRequired();
        return;
      }
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "The password could not be changed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="securityPage">
      <header><h1>Security</h1><p>Manage the single administrator account for this portfolio.</p></header>
      <div className="securityGrid">
        <div className="securitySummary"><h2>Current session</h2><dl><div><dt>Signed in as</dt><dd>{session.email}</dd></div><div><dt>Session expires</dt><dd>{session.expiresAt ? formatDate(session.expiresAt) : "Within eight hours"}</dd></div><div><dt>Session storage</dt><dd>Secure HTTP-only cookie</dd></div></dl></div>
        <form className="securityForm" onSubmit={changePassword}>
          <h2>Change password</h2>
          <p>Use at least 14 characters. Changing it signs out other sessions.</p>
          {message && <p className={`adminInlineMessage ${message.tone}`} role="status">{message.text}</p>}
          <label>Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label>New password<input type="password" autoComplete="new-password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} minLength={14} maxLength={128} required /></label>
          <label>Confirm new password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={14} maxLength={128} required /></label>
          <button className="adminPrimaryButton" type="submit" disabled={busy}>{busy ? "Updating..." : "Update password"}</button>
        </form>
      </div>
    </section>
  );
}

function Reauthenticate({ onAuthenticated }: { onAuthenticated(session: AdminSessionState): void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    emailRef.current?.focus();
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('input, button, a[href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.removeEventListener("keydown", keepFocusInside);
      previouslyFocused?.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onAuthenticated(await loginAdmin(email, password));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adminReauthOverlay" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <section ref={dialogRef}>
        <p className="realStatus">Session expired</p>
        <h1 id="reauth-title">Sign in to keep your edits.</h1>
        <p>Your current project remains open behind this dialog.</p>
        <form onSubmit={submit}>
          {error && <p className="adminInlineError" role="alert">{error}</p>}
          <label>Email address<input ref={emailRef} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={14} maxLength={128} /></label>
          <button className="adminPrimaryButton" type="submit" disabled={busy}>{busy ? "Checking access..." : "Restore session"}</button>
        </form>
      </section>
    </div>
  );
}

function AdminBoot() {
  return <main className="adminBoot" aria-live="polite"><div className="adminBootMark">Caleb Oke</div><p>Checking secure access...</p></main>;
}

function ProjectListSkeleton() {
  return <div className="projectRailSkeleton" aria-label="Loading projects"><i /><i /><i /></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
