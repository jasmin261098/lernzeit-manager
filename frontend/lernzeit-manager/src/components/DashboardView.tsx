import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Trophy, Target } from 'lucide-react';
import { api } from '../lib/api';
import { type Goal, type LearningPlan } from '../lib/database';

interface GoalProgress {
  goalId: number;
  title: string;
  targetHours: number;
  loggedHours: number;
  percent: number;
}

interface DashboardData {
  totalHours: number;
  progress: GoalProgress[];
}

function progressColor(pct: number) {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-sky-500';
  if (pct >= 50) return 'bg-amber-500';
  if (pct >= 25) return 'bg-orange-500';
  return 'bg-rose-500';
}

function formatHalfHours(hours: number) {
  const rounded = Math.round(hours * 2) / 2;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<DashboardData>('/dashboard'),
      api.get<Goal[]>('/goals'),
      api.get<LearningPlan[]>('/plans'),
    ])
      .then(([dashboardData, goalData, planData]) => {
        setData(dashboardData);
        setGoals(goalData);
        setPlans(planData);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const doneCount = goals.filter((g) => g.status === 'done').length;
  const donePlanCount = plans.filter((plan) => plan.endDate && new Date(plan.endDate) < new Date()).length;
  const planProgressPercent = plans.length > 0
    ? Math.round((donePlanCount / plans.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Zentrales Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Fortschritts- und Aktivitätsmetriken im Überblick.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gesamte Lernzeit</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data?.totalHours ?? 0} Std.</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Alle abgeschlossenen Sessions</p>
            </div>
            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Globale Zielerreichung</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{planProgressPercent}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${planProgressPercent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {plans.length > 0 ? `${donePlanCount} von ${plans.length} Lernplänen abgeschlossen` : 'Keine Lernpläne vorhanden'}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ziele abgeschlossen</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{doneCount} / {goals.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {doneCount > 0 ? `${doneCount} Ziel${doneCount > 1 ? 'e' : ''} erreicht` : 'Noch keins erreicht'}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Per-goal progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-900">Fortschritt je Lernziel</h3>
        </div>

        {data && data.progress.length > 0 ? (
          <div className="space-y-4">
            {data.progress.map((g) => (
              <div key={g.goalId}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[60%]">{g.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                    <span>{formatHalfHours(g.loggedHours)}h / {formatHalfHours(g.targetHours)}h</span>
                    <span className="font-bold text-slate-700">{g.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${progressColor(g.percent)}`}
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-sm">
            Noch keine Lernziele vorhanden. Erstelle ein Ziel und starte eine Session.
          </div>
        )}
      </div>
    </div>
  );
}
