export type ProjectPublicationStatus = "draft" | "published" | "archived";
export type ProjectLayoutVariant = "split" | "wide";

export type ProjectStage = {
  title: string;
  detail: string;
};

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  statusLabel: string;
  category: string;
  publicationStatus: ProjectPublicationStatus;
  layoutVariant: ProjectLayoutVariant;
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  repositoryUrl: string;
  liveUrl: string;
  observedResult: string;
  knownLimit: string;
  nextTest: string;
  tools: string[];
  stages: ProjectStage[];
  contentMarkdown: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  featured: boolean;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

export type ProjectInput = Omit<
  PortfolioProject,
  "id" | "version" | "createdAt" | "updatedAt" | "publishedAt"
> & {
  id?: string;
  version?: number;
};

export function blankProject(): PortfolioProject {
  return {
    id: "",
    slug: "",
    title: "",
    summary: "",
    statusLabel: "",
    category: "Workflow automation",
    publicationStatus: "draft",
    layoutVariant: "split",
    imageUrl: "",
    imageAlt: "",
    imageCaption: "",
    repositoryUrl: "",
    liveUrl: "",
    observedResult: "",
    knownLimit: "",
    nextTest: "",
    tools: [],
    stages: [],
    contentMarkdown: "## Overview\n\nDescribe the problem, the system, and what you learned.\n",
    seoTitle: "",
    seoDescription: "",
    sortOrder: 100,
    featured: true,
    version: 0,
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  };
}
