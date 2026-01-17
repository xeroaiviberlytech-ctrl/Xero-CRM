-- Add conversionProbability column to Lead table
-- Run this SQL directly in your database (e.g., via Supabase SQL Editor or psql)

ALTER TABLE "Lead" 
ADD COLUMN IF NOT EXISTS "conversionProbability" INTEGER DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Lead' AND column_name = 'conversionProbability';
