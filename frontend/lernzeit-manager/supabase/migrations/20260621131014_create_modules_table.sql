/*
# Create modules table for dynamic subject management

1. New Tables
- `modules`: User-defined study modules/subjects
  - `id` (uuid, primary key)
  - `name` (text, not null) - e.g. "Statistik", "Kryptographie"
  - `target_hours` (integer, default 0) - weekly target hours
  - `start_month` (integer, not null) - which month the module starts (1-6)
  - `end_month` (integer, not null) - which month the module ends (1-6)
  - `color` (text, default 'sky') - for UI theming
  - `user_id` (uuid, not null, default auth.uid())
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on modules table.
- Owner-scoped CRUD policies.
*/

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_hours integer NOT NULL DEFAULT 0,
  start_month integer NOT NULL,
  end_month integer NOT NULL,
  color text NOT NULL DEFAULT 'sky',
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_modules" ON modules;
CREATE POLICY "select_own_modules" ON modules FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_modules" ON modules;
CREATE POLICY "insert_own_modules" ON modules FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_modules" ON modules;
CREATE POLICY "update_own_modules" ON modules FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_modules" ON modules;
CREATE POLICY "delete_own_modules" ON modules FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
