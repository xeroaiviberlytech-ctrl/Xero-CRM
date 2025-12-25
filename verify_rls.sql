-- Verify RLS is enabled on _prisma_migrations
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class 
WHERE relname = '_prisma_migrations';

-- Expected result:
-- table_name: _prisma_migrations
-- rls_enabled: true
-- rls_forced: false

