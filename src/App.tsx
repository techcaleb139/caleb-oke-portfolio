import Portfolio from "../components/Portfolio.tsx";
import ProjectDetail from "../components/ProjectDetail.tsx";
import { projectBySlug } from "./content/projects/index.ts";

export type AppProps = {
  initialPath?: string;
};

export default function App({ initialPath = "/" }: AppProps) {
  const pathname = initialPath.split("?")[0].replace(/\/+$/, "") || "/";

  const projectMatch = pathname.match(/^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (projectMatch) {
    const project = projectBySlug(projectMatch[1]);
    if (project) return <ProjectDetail project={project} />;
  }

  return <Portfolio />;
}
