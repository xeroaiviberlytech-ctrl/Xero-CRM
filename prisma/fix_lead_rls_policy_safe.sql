-- SAFE VERSION: Fix RLS Policy for Lead table
-- This version checks if policies exist before dropping them
-- This ensures authenticated users can only create leads assigned to themselves

-- Step 1: Check current policies (run this first to see what exists)
SELECT 
  pol.polname AS policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END AS command,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'Lead'
ORDER BY pol.polcmd, pol.polname;

-- Step 2: Only run the DROP and CREATE if you've verified the policies above
-- Uncomment the BEGIN/COMMIT block below to execute:

/*
BEGIN;

-- Drop only if exists (safe - won't fail if policy doesn't exist)
DROP POLICY IF EXISTS "Users can create leads" ON public."Lead";
DROP POLICY IF EXISTS "Users can view own leads" ON public."Lead";
DROP POLICY IF EXISTS "Users can update own leads" ON public."Lead";
DROP POLICY IF EXISTS "Users can delete own leads" ON public."Lead";

-- Create the INSERT policy with proper restrictions
CREATE POLICY "Users can create leads" ON public."Lead"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "assignedToId" IS NULL 
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE id = "assignedToId"
      AND "supabaseUserId" = auth.uid()::text
    )
  );

-- SELECT policy
CREATE POLICY "Users can view own leads" ON public."Lead"
  FOR SELECT
  TO authenticated
  USING (
    "assignedToId" IN (
      SELECT id 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- UPDATE policy
CREATE POLICY "Users can update own leads" ON public."Lead"
  FOR UPDATE
  TO authenticated
  USING (
    "assignedToId" IN (
      SELECT id 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    "assignedToId" IS NULL 
    OR "assignedToId" IN (
      SELECT id 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- DELETE policy
CREATE POLICY "Users can delete own leads" ON public."Lead"
  FOR DELETE
  TO authenticated
  USING (
    "assignedToId" IN (
      SELECT id 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE "supabaseUserId" = auth.uid()::text 
      AND role = 'admin'
    )
  );

COMMIT;
*/
