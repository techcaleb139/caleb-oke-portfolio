import generatedProjects from "./projects.generated.json" with { type: "json" };
import type { PortfolioProject } from "../../lib/project-types.ts";

export const builtProjects = generatedProjects as PortfolioProject[];

export function publishedProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return projects
    .filter((project) => project.publicationStatus === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export function projectBySlug(projects: PortfolioProject[], slug: string): PortfolioProject | undefined {
  return projects.find((project) => project.slug === slug && project.publicationStatus === "published");
}
