-- Run in Supabase SQL Editor: configurable empty-state messages per section
ALTER TABLE profile ADD COLUMN IF NOT EXISTS empty_messages JSONB DEFAULT '{}';
