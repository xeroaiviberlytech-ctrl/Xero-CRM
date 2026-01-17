-- Create Lead table if it doesn't exist
-- Run this SQL in Supabase SQL Editor

-- First, check if Lead table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'Lead'
);

-- If the above returns false, run the CREATE TABLE statement below:

CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "temperature" TEXT NOT NULL DEFAULT 'warm',
    "rating" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'warm',
    "notes" TEXT,
    "assignedToId" TEXT,
    "source" TEXT,
    "industry" TEXT,
    "conversionProbability" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX IF NOT EXISTS "Lead_temperature_idx" ON "Lead"("temperature");
CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");

-- Add foreign key constraint if User table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        ALTER TABLE "Lead" 
        ADD CONSTRAINT "Lead_assignedToId_fkey" 
        FOREIGN KEY ("assignedToId") 
        REFERENCES "User"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Verify table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'Lead'
ORDER BY ordinal_position;
