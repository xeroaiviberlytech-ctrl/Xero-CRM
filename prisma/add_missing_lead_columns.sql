-- Add missing columns to Lead table
-- Run this SQL directly in your database (e.g., via Supabase SQL Editor or psql)

-- This will add all missing columns that are defined in your Prisma schema
-- but don't exist in your database yet

BEGIN;

-- Add conversionProbability column if it doesn't exist
ALTER TABLE "Lead" 
ADD COLUMN IF NOT EXISTS "conversionProbability" INTEGER DEFAULT 0;

-- Add source column if it doesn't exist
ALTER TABLE "Lead" 
ADD COLUMN IF NOT EXISTS "source" TEXT;

-- Add industry column if it doesn't exist (should already exist, but safe to check)
ALTER TABLE "Lead" 
ADD COLUMN IF NOT EXISTS "industry" TEXT;

COMMIT;

-- Verify all columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'Lead'
  AND column_name IN ('conversionProbability', 'source', 'industry')
ORDER BY column_name;
