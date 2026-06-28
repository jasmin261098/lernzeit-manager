/*
# Create Study Planner Schema

1. New Tables
- `goals`: Learning goals with title, deadline, progress, and status
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `deadline` (text)
  - `progress` (integer, default 0)
  - `status` (text, default 'Aktiv')
  - `created_at` (timestamptz, default now())
- `study_sessions`: Recorded study sessions with duration
  - `id` (uuid, primary key)
  - `goal_id` (uuid, references goals)
  - `duration_seconds` (integer, not null)
  - `started_at` (timestamptz, default now())
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD since this is a single-tenant demo app.
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  deadline text,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Aktiv',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  duration_seconds integer NOT NULL,
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_sessions" ON study_sessions;
CREATE POLICY "anon_select_sessions" ON study_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON study_sessions;
CREATE POLICY "anon_insert_sessions" ON study_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON study_sessions;
CREATE POLICY "anon_update_sessions" ON study_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON study_sessions;
CREATE POLICY "anon_delete_sessions" ON study_sessions FOR DELETE
  TO anon, authenticated USING (true);
