-- Run in Supabase SQL Editor: configurable section divider labels (// Blogs etc)
ALTER TABLE profile ADD COLUMN IF NOT EXISTS section_labels JSONB DEFAULT '{}';
