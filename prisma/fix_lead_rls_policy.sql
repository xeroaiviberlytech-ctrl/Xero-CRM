-- Fix RLS Policy for Lead table
-- This ensures authenticated users can only create leads assigned to themselves
-- 
-- IMPORTANT: Since you're using Prisma (which may use service role), RLS policies 
-- are primarily for additional security layers. Your tRPC endpoints already handle 
-- authorization. This fixes the security scanner warning.

BEGIN;

-- Drop the existing permissive INSERT policy (with WITH CHECK (true))
DROP POLICY IF EXISTS "Users can create leads" ON public."Lead";

-- Create a more restrictive INSERT policy
-- The WITH CHECK ensures that:
-- 1. User must be authenticated (TO authenticated)
-- 2. assignedToId must be NULL (will be set to current user in app) OR
-- 3. assignedToId must match the authenticated user's User record
CREATE POLICY "Users can create leads" ON public."Lead"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow creating leads where assignedToId is NULL (app will set it)
    -- OR where assignedToId matches a User with the same supabaseUserId as auth.uid()
    "assignedToId" IS NULL 
    OR EXISTS (
      SELECT 1 
      FROM public."User" 
      WHERE id = "assignedToId"
      AND "supabaseUserId" = auth.uid()::text
    )
  );

-- Also ensure proper SELECT policy (users can only see their own leads or if admin)
DROP POLICY IF EXISTS "Users can view own leads" ON public."Lead";

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

-- UPDATE policy - users can only update their own leads or if admin
DROP POLICY IF EXISTS "Users can update own leads" ON public."Lead";

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
    -- Only allow updating assignedToId to current user or if admin
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

-- DELETE policy - users can only delete their own leads or if admin
DROP POLICY IF EXISTS "Users can delete own leads" ON public."Lead";

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

-- Verify policies were created
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
