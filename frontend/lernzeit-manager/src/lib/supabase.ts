import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Goal = {
  id: string;
  title: string;
  deadline: string | null;
  progress: number;
  status: string;
  user_id: string;
  created_at: string;
};

export type StudySession = {
  id: string;
  goal_id: string | null;
  duration_seconds: number;
  started_at: string;
  user_id: string;
  created_at: string;
};

export type PlanningPhase = {
  id: string;
  name: string;
  status: string;
  sort_order: number;
  user_id: string;
  created_at: string;
};

export type LearningBlock = {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  module: string | null;
  month_index: number;
  user_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  user_id: string;
  created_at: string;
};

export type Module = {
  id: string;
  name: string;
  target_hours: number;
  start_month: number;
  end_month: number;
  color: string;
  user_id: string;
  created_at: string;
};

export type NotificationSettings = {
  id: string;
  reminders_enabled: boolean;
  inactivity_alerts_enabled: boolean;
  user_id: string;
  created_at: string;
};
