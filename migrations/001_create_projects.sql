-- Applied to Neon by Antigravity before the requested review pause.
-- Preserved exactly as the historical migration; do not run it again.

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  status text,
  summary text,
  workflow_image_url text,
  workflow_image_alt text,
  repo_url text,
  live_url text,
  observed_result text,
  known_limit text,
  next_test text,
  tools text[],
  system_stages jsonb,
  case_study_markdown text,
  seo_title text,
  seo_description text,
  layout text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
