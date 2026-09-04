/* The project list.
   To add a project: create a sibling file, import it here, add it to the
   array. Nothing in components/ needs to change. Order on the page comes
   from each project's `order` field, not from this array. */

import type { Project } from "../../../lib/project-types.ts";
import voiceAiRestaurantOrderingPrototype from "./voice-ai-restaurant-ordering-prototype.ts";
import automatedJobSearchAlertPipeline from "./automated-job-search-alert-pipeline.ts";

const projects: Project[] = [
  voiceAiRestaurantOrderingPrototype,
  automatedJobSearchAlertPipeline,
];

export const allProjects: Project[] = [...projects].sort(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
);

export function projectBySlug(slug: string): Project | undefined {
  return allProjects.find((project) => project.slug === slug);
}
