-- View all tables in your database
-- Run these SQL queries in Supabase SQL Editor

-- 1. List all tables in the public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. View detailed information about all tables
SELECT 
  table_name,
  table_type,
  is_insertable_into,
  is_updatable
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. View all columns in a specific table (replace 'Lead' with your table name)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'Lead'
ORDER BY ordinal_position;

-- 4. View all columns for all tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 5. Quick view of row counts for all tables (approximate)
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
