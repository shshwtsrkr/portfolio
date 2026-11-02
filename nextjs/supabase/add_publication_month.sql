-- Run in Supabase SQL Editor: optional publication month (1–12), shown as "Mar" etc. in the home page's Recently list
ALTER TABLE publications ADD COLUMN IF NOT EXISTS publication_month SMALLINT CHECK (publication_month BETWEEN 1 AND 12);
