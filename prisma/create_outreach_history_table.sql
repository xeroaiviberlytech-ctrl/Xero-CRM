-- Create OutreachHistory table if it doesn't exist
-- Run this SQL in Supabase SQL Editor

-- Check if OutreachHistory table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'OutreachHistory'
);

-- If the above returns false, run the CREATE TABLE statement below:

CREATE TABLE IF NOT EXISTS "OutreachHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "contactId" TEXT,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,
    "contactDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachHistory_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "OutreachHistory_leadId_idx" ON "OutreachHistory"("leadId");
CREATE INDEX IF NOT EXISTS "OutreachHistory_userId_idx" ON "OutreachHistory"("userId");
CREATE INDEX IF NOT EXISTS "OutreachHistory_contactId_idx" ON "OutreachHistory"("contactId");
CREATE INDEX IF NOT EXISTS "OutreachHistory_contactDate_idx" ON "OutreachHistory"("contactDate");

-- Add foreign key constraints
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Lead') THEN
        ALTER TABLE "OutreachHistory" 
        ADD CONSTRAINT "OutreachHistory_leadId_fkey" 
        FOREIGN KEY ("leadId") 
        REFERENCES "Lead"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        ALTER TABLE "OutreachHistory" 
        ADD CONSTRAINT "OutreachHistory_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Contact') THEN
        ALTER TABLE "OutreachHistory" 
        ADD CONSTRAINT "OutreachHistory_contactId_fkey" 
        FOREIGN KEY ("contactId") 
        REFERENCES "Contact"("id") 
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
AND table_name = 'OutreachHistory'
ORDER BY ordinal_position;
