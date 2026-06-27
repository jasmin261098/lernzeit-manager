/*
# Add user_id ownership to existing tables

1. Modified Tables
- `goals`: added `user_id` column with default auth.uid()
- `study_sessions`: added `user_id` column with default auth.uid()
- `planning_phases`: added `user_id` column with default auth.uid()

2. Security
- Updated all RLS policies to restrict to authenticated users only
- Each user can only access their own rows via auth.uid() checks
*/

-- Add user_id to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to study_sessions
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to planning_phases
ALTER TABLE planning_phases ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update goals policies to authenticated-only with ownership
DROP POLICY IF EXISTS "anon_select_goals" ON goals;
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;

CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Update study_sessions policies
DROP POLICY IF EXISTS "anon_select_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_insert_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_update_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_delete_sessions" ON study_sessions;

CREATE POLICY "select_own_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_sessions" ON study_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Update planning_phases policies
DROP POLICY IF EXISTS "anon_select_phases" ON planning_phases;
DROP POLICY IF EXISTS "anon_insert_phases" ON planning_phases;
DROP POLICY IF EXISTS "anon_update_phases" ON planning_phases;
DROP POLICY IF EXISTS "anon_delete_phases" ON planning_phases;

CREATE POLICY "select_own_phases" ON planning_phases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_phases" ON planning_phases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_phases" ON planning_phases FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_phases" ON planning_phases FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
