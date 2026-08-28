-- Corrective migration for the incomplete projects table created by 001.
-- It preserves the old table as projects_legacy_001 before creating the reviewed CMS schema.
-- Do not execute until Caleb explicitly says "run it".

-- statement
ALTER TABLE projects RENAME TO projects_legacy_001;

-- statement
ALTER TABLE projects_legacy_001 RENAME CONSTRAINT projects_pkey TO projects_legacy_001_pkey;

-- statement
ALTER TABLE projects_legacy_001 RENAME CONSTRAINT projects_slug_key TO projects_legacy_001_slug_key;

-- statement
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 600),
  status_label text NOT NULL CHECK (char_length(status_label) BETWEEN 1 AND 100),
  category text NOT NULL CHECK (char_length(category) BETWEEN 1 AND 100),
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  layout_variant text NOT NULL DEFAULT 'split' CHECK (layout_variant IN ('split', 'wide')),
  image_url text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  image_caption text NOT NULL DEFAULT '',
  repository_url text NOT NULL DEFAULT '',
  live_url text NOT NULL DEFAULT '',
  observed_result text NOT NULL,
  known_limit text NOT NULL,
  next_test text NOT NULL,
  tools jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(tools) = 'array'),
  stages jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(stages) = 'array'),
  content_markdown text NOT NULL,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 100 CHECK (sort_order BETWEEN 0 AND 9999),
  featured boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CHECK (publication_status <> 'published' OR published_at IS NOT NULL)
);

-- statement
INSERT INTO projects (
  id, slug, title, summary, status_label, category, publication_status, layout_variant,
  image_url, image_alt, repository_url, live_url, observed_result, known_limit, next_test,
  tools, stages, content_markdown, seo_title, seo_description, sort_order, featured,
  created_at, updated_at
)
SELECT
  id,
  slug,
  title,
  COALESCE(NULLIF(summary, ''), 'Legacy project imported for review.'),
  COALESCE(NULLIF(status, ''), 'Legacy record'),
  'Workflow automation',
  'draft',
  CASE WHEN layout = 'wide' THEN 'wide' ELSE 'split' END,
  COALESCE(workflow_image_url, ''),
  COALESCE(workflow_image_alt, ''),
  COALESCE(repo_url, ''),
  COALESCE(live_url, ''),
  COALESCE(NULLIF(observed_result, ''), 'No observed result was recorded.'),
  COALESCE(NULLIF(known_limit, ''), 'No known limit was recorded.'),
  COALESCE(NULLIF(next_test, ''), 'Review this imported record before publishing.'),
  to_jsonb(COALESCE(tools, ARRAY[]::text[])),
  COALESCE(system_stages, '[]'::jsonb),
  COALESCE(NULLIF(case_study_markdown, ''), '## Imported project\n\nReview this legacy record before publishing.'),
  COALESCE(seo_title, ''),
  COALESCE(seo_description, ''),
  LEAST(9999, GREATEST(0, COALESCE(display_order, 100))),
  COALESCE(featured, false),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM projects_legacy_001;

-- statement
CREATE INDEX projects_publication_order_idx ON projects (publication_status, featured DESC, sort_order, published_at DESC NULLS LAST);

-- statement
CREATE TABLE cms_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- statement
CREATE TABLE cms_sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES cms_admin_users(id) ON DELETE CASCADE,
  csrf_token text NOT NULL,
  user_agent_hash text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- statement
CREATE INDEX cms_sessions_expiry_idx ON cms_sessions (expires_at);

-- statement
CREATE TABLE cms_login_attempts (
  id bigserial PRIMARY KEY,
  identity_hash text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- statement
CREATE INDEX cms_login_attempts_identity_idx ON cms_login_attempts (identity_hash, attempted_at DESC);

-- statement
CREATE TABLE cms_audit_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES cms_admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  project_slug text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(detail) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- statement
CREATE INDEX cms_audit_log_created_idx ON cms_audit_log (created_at DESC);
