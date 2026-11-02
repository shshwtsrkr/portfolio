-- Run in Supabase SQL Editor: certifications (shown as a card on the home page and in "Recently")

CREATE TABLE IF NOT EXISTS certifications (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  issuer VARCHAR(200) NOT NULL,
  issued_date DATE NOT NULL,
  expires_date DATE,
  credential_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_public_read" ON certifications FOR SELECT USING (is_published = true);
CREATE POLICY "certifications_auth_write" ON certifications FOR ALL USING (auth.role() = 'authenticated');
