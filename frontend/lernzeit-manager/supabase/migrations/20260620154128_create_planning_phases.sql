/*
# Create Planning Phases Table

1. New Tables
- `planning_phases`: 6-month study planning phases
  - `id` (uuid, primary key)
  - `name` (text, not null) - phase title like "Monat 1: Grundlagen"
  - `status` (text, default 'Geplant') - Abgeschlossen, In Arbeit, Geplant
  - `sort_order` (integer, not null) - display order 1-6
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on planning_phases.
- Allow anon + authenticated CRUD for single-tenant demo app.
*/

CREATE TABLE IF NOT EXISTS planning_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Geplant',
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planning_phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_phases" ON planning_phases;
CREATE POLICY "anon_select_phases" ON planning_phases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_phases" ON planning_phases;
CREATE POLICY "anon_insert_phases" ON planning_phases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_phases" ON planning_phases;
CREATE POLICY "anon_update_phases" ON planning_phases FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_phases" ON planning_phases;
CREATE POLICY "anon_delete_phases" ON planning_phases FOR DELETE
  TO anon, authenticated USING (true);
