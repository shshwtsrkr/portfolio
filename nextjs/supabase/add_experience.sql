-- Run this in Supabase SQL Editor to add the experience table

CREATE TABLE IF NOT EXISTS experience (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experience_public_read" ON experience FOR SELECT USING (is_published = true);
CREATE POLICY "experience_auth_write" ON experience FOR ALL USING (auth.role() = 'authenticated');

-- Sample data
INSERT INTO experience (role, company, start_date, end_date, is_current, description, display_order) VALUES
(
  'ML Research Engineer',
  'Your Current Company',
  '2024-06-01', NULL, TRUE,
  '- Building scalable vision model training infrastructure
- Designing custom attention mechanisms for medical imaging
- Reduced inference latency by 40% through quantisation and pruning',
  1
),
(
  'Computer Vision Intern',
  'Previous Company',
  '2023-08-01', '2024-05-31', FALSE,
  '- Implemented real-time object detection pipeline using YOLOv8
- Deployed model serving API handling 10k req/day on AWS EC2
- Wrote internal tooling for dataset annotation and quality control',
  2
),
(
  'Research Assistant',
  'Your University',
  '2022-09-01', '2023-07-31', FALSE,
  '- Assisted in reproducing results from CVPR 2022 papers
- Built evaluation harness for semantic segmentation benchmarks',
  3
);
