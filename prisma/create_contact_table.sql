-- Create Contact table if it doesn't exist
-- Run this SQL in Supabase SQL Editor

-- Check if Contact table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'Contact'
);

-- If the above returns false, run the CREATE TABLE statement below:

CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Contact_leadId_idx" ON "Contact"("leadId");

-- Add foreign key constraint if Lead table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Lead') THEN
        ALTER TABLE "Contact" 
        ADD CONSTRAINT "Contact_leadId_fkey" 
        FOREIGN KEY ("leadId") 
        REFERENCES "Lead"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
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
AND table_name = 'Contact'
ORDER BY ordinal_position;
