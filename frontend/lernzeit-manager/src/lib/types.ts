export type Module = {
  id: number | string;
  name: string;
  target_hours: number;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: 'reminder' | 'warning' | 'info';
  read: boolean;
  createdAt?: string;
};

export type NotificationSettings = {
  id: number;
  userId?: number;
  reminders_enabled: boolean;
  inactivity_alerts_enabled: boolean;
};
