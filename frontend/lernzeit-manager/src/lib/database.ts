// Backend-aligned types. Field names match what the Express API returns.

export type Goal = {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  targetHours: number;
  status: 'open' | 'in_progress' | 'done';
  userId: number;
  createdAt: string;
};

export type StudySession = {
  id: number;
  goalId: number | null;
  topic: string | null;
  duration: number | null; // minutes; null while session is in progress
  startTime: string;
  userId: number;
};

export type LearningPlan = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  userId: number;
  createdAt: string;
};

export type MonthlyPlan = {
  id: number;
  learningPlanId: number;
  month: number;
  year: number;
  plannedHours: number;
  notes: string | null;
  createdAt: string;
};

export type Reminder = {
  id: number;
  message: string;
  scheduledAt: string;
  userId: number;
  createdAt: string;
};
