/*
# Create notification_settings table for user preferences

1. New Tables
- `notification_settings`: User notification preferences
  - `id` (uuid, primary key)
  - `reminders_enabled` (boolean, default true)
  - `inactivity_alerts_enabled` (boolean, default true)
  - `user_id` (uuid, not null, default auth.uid())
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on notification_settings.
- Owner-scoped CRUD policies.
*/

CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminders_enabled boolean NOT NULL DEFAULT true,
  inactivity_alerts_enabled boolean NOT NULL DEFAULT true,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON notification_settings;
CREATE POLICY "select_own_settings" ON notification_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON notification_settings;
CREATE POLICY "insert_own_settings" ON notification_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON notification_settings;
CREATE POLICY "update_own_settings" ON notification_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settings" ON notification_settings;
CREATE POLICY "delete_own_settings" ON notification_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
