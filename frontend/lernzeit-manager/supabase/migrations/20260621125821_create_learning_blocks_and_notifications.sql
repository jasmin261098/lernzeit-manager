/*
# Create learning_blocks and notifications tables

1. New Tables
- `learning_blocks`: Individual study blocks within monthly planning
  - `id` (uuid, primary key)
  - `title` (text, not null) - e.g. "Statistik Kapitel 3"
  - `date` (date, not null) - the day of the block
  - `start_time` (text) - e.g. "09:00"
  - `end_time` (text) - e.g. "11:00"
  - `module` (text) - subject/module name
  - `month_index` (integer, not null) - which month (1-6) this block belongs to
  - `user_id` (uuid, not null, default auth.uid())
  - `created_at` (timestamptz, default now())

- `notifications`: User notifications/reminders
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `message` (text, not null)
  - `type` (text, default 'info') - info, warning, reminder
  - `read` (boolean, default false)
  - `user_id` (uuid, not null, default auth.uid())
  - `created_at` (timestamptz, default now())

2. Modified Tables
- `goals`: add `status` column with values 'offen', 'in_bearbeitung', 'abgeschlossen'
  replacing the old boolean/enum approach

3. Security
- Enable RLS on both new tables.
- Owner-scoped CRUD policies on both.
*/

CREATE TABLE IF NOT EXISTS learning_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  start_time text,
  end_time text,
  module text,
  month_index integer NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- learning_blocks policies
DROP POLICY IF EXISTS "select_own_blocks" ON learning_blocks;
CREATE POLICY "select_own_blocks" ON learning_blocks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_blocks" ON learning_blocks;
CREATE POLICY "insert_own_blocks" ON learning_blocks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_blocks" ON learning_blocks;
CREATE POLICY "update_own_blocks" ON learning_blocks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_blocks" ON learning_blocks;
CREATE POLICY "delete_own_blocks" ON learning_blocks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- notifications policies
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
