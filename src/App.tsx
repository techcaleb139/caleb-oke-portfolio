import { lazy, Suspense } from "react";
import Portfolio from "../components/Portfolio.tsx";
import ProjectDetail from "../components/ProjectDetail.tsx";
import type { PortfolioProject } from "../lib/project-types.ts";
import { builtProjects, projectBySlug, publishedProjects } from "./content/project-data.ts";

const AdminApp = lazy(() => import("../components/admin/AdminApp.tsx"));

export type AppProps = {
  initialPath?: string;
  initialProjects?: PortfolioProject[];
};

export default function App({ initialPath = "/", initialProjects = builtProjects }: AppProps) {
  const pathname = initialPath.split("?")[0].replace(/\/+$/, "") || "/";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <Suspense fallback={<AdminLoading />}>
        <AdminApp />
      </Suspense>
    );
  }

  const projectMatch = pathname.match(/^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (projectMatch) {
    const slug = projectMatch[1];
    return <ProjectDetail slug={slug} initialProject={projectBySlug(initialProjects, slug)} />;
  }

  return <Portfolio initialProjects={publishedProjects(initialProjects)} />;
}

function AdminLoading() {
  return (
    <main className="adminBoot" aria-live="polite">
      <div className="adminBootMark">Caleb Oke</div>
      <p>Opening the publishing desk...</p>
    </main>
  );
}
