-- Portfolio database schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL editor

-- Profile table (single row)
CREATE TABLE IF NOT EXISTS profile (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT '',
  title VARCHAR(200) NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  profile_image_url VARCHAR(500),
  ascii_image_url VARCHAR(500),
  resume_file_url VARCHAR(500),
  typing_animation_texts JSONB DEFAULT '[]',
  oneliner_config JSONB DEFAULT '{}',
  socials JSONB DEFAULT '[]',
  tech_stack JSONB DEFAULT '[]',
  expertise_cards JSONB DEFAULT '[]',
  name_animation_speed NUMERIC(4,1) DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  content TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  thumbnail_url VARCHAR(500),
  external_url VARCHAR(500),
  tag VARCHAR(100),
  tag_color VARCHAR(20) DEFAULT '#6366f1',
  read_duration INT DEFAULT 5,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  technologies VARCHAR(500),
  github_url VARCHAR(500),
  live_url VARCHAR(500),
  preview_image_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'Active Development',
  completed_date VARCHAR(50),
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  show_code_button BOOLEAN DEFAULT TRUE,
  show_live_demo_button BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  authors VARCHAR(500),
  venue VARCHAR(300),
  publication_year INT,
  abstract_text TEXT,
  doi VARCHAR(200),
  pdf_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  code_url VARCHAR(500),
  status VARCHAR(50),
  show_citations BOOLEAN DEFAULT FALSE,
  citation_count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  show_pdf_button BOOLEAN DEFAULT TRUE,
  show_code_button BOOLEAN DEFAULT FALSE,
  show_doi_button BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profile_updated_at BEFORE UPDATE ON profile FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
-- Public read access for published content
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Profile: anyone can read
CREATE POLICY "profile_public_read" ON profile FOR SELECT USING (true);
-- Profile: only authenticated users can write
CREATE POLICY "profile_auth_write" ON profile FOR ALL USING (auth.role() = 'authenticated');

-- Blogs: anyone can read published
CREATE POLICY "blogs_public_read" ON blogs FOR SELECT USING (is_published = true);
-- Blogs: authenticated users can read all and write
CREATE POLICY "blogs_auth_all" ON blogs FOR ALL USING (auth.role() = 'authenticated');

-- Projects: anyone can read published
CREATE POLICY "projects_public_read" ON projects FOR SELECT USING (is_published = true);
CREATE POLICY "projects_auth_all" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Publications: anyone can read published
CREATE POLICY "publications_public_read" ON publications FOR SELECT USING (is_published = true);
CREATE POLICY "publications_auth_all" ON publications FOR ALL USING (auth.role() = 'authenticated');

-- Storage buckets (run separately in Supabase dashboard or via API)
-- Create two buckets: "images" and "files" with public access
