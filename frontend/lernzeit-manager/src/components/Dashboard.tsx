import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  X,
  Save,
  LogOut,
  ChevronRight,
  Award,
  Timer,
} from 'lucide-react';
import { api } from '../lib/api';
import { type Goal, type StudySession } from '../lib/supabase';
import { useAuth } from '../lib/auth';

function formatTime(totalSeconds: number) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  done: 'Abgeschlossen',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-sky-100 text-sky-700 border-sky-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTargetHours, setFormTargetHours] = useState('1');
  const [formStatus, setFormStatus] = useState<'open' | 'in_progress' | 'done'>('open');

  const today = () => new Date().toISOString().slice(0, 10);

  const fetchData = useCallback(async () => {
    try {
      const [goalsData, sessionsData] = await Promise.all([
        api.get<Goal[]>('/goals'),
        api.get<StudySession[]>('/sessions'),
      ]);
      setGoals(goalsData);
      setSessions(sessionsData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning]);

  const handleStart = async () => {
    try {
      const session = await api.post<{ id: number }>('/sessions/start', {});
      setActiveSessionId(session.id);
      setTimerRunning(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handlePause = async () => {
    setTimerRunning(false);
    if (activeSessionId) {
      try {
        await api.patch(`/sessions/${activeSessionId}/stop`);
        setActiveSessionId(null);
        setSeconds(0);
        fetchData();
      } catch (e) {
        setError((e as Error).message);
      }
    }
  };

  const handleReset = () => {
    setTimerRunning(false);
    setSeconds(0);
    setActiveSessionId(null);
  };

  const handleAddGoal = async () => {
    if (!formTitle.trim() || !formEndDate) return;
    try {
      await api.post('/goals', {
        title: formTitle,
        targetHours: parseFloat(formTargetHours) || 1,
        startDate: today(),
        endDate: formEndDate,
      });
      closeModal();
      fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !formTitle.trim()) return;
    try {
      await api.put(`/goals/${editingGoal.id}`, {
        title: formTitle,
        endDate: formEndDate || undefined,
        status: formStatus,
      });
      closeModal();
      fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormEndDate(goal.endDate ? goal.endDate.slice(0, 10) : '');
    setFormTargetHours('1');
    setFormStatus(goal.status);
  };

  const openAdd = () => {
    setShowAddModal(true);
    setFormTitle(''); setFormEndDate(''); setFormTargetHours('1'); setFormStatus('open');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingGoal(null);
    setFormTitle(''); setFormEndDate(''); setFormTargetHours('1'); setFormStatus('open');
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const completedGoals = goals.filter((g) => g.status === 'done').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Lade Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Willkommen zurück! Zeit, deine Ziele anzugehen.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
            <Award className="w-3.5 h-3.5" />
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Ausloggen</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gesamte Lernzeit</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatDuration(totalMinutes)}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  {sessions.length > 0 ? `+${formatDuration(sessions[0].duration ?? 0)} letzte Session` : 'Noch keine Sessions'}
                </p>
              </div>
              <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zielerreichung</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{completedGoals} / {goals.length}</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${goals.length ? (completedGoals / goals.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offene Ziele</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{goals.filter((g) => g.status === 'open').length}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{goals.filter((g) => g.status === 'in_progress').length} in Bearbeitung</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-bold text-slate-900">Aktuelle Lernziele</h2>
                </div>
                <button
                  onClick={openAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Neues Ziel
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {goals.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Noch keine Lernziele vorhanden.</p>
                    <button onClick={openAdd} className="text-sky-600 text-sm font-medium mt-2 hover:underline">
                      Erstelle dein erstes Ziel
                    </button>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className={`text-sm font-semibold truncate ${goal.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{goal.title}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[goal.status] ?? STATUS_COLORS.open}`}>
                              {STATUS_LABELS[goal.status] ?? goal.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {goal.endDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(goal.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(goal)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Bearbeiten"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-bold text-slate-900">Letzte Lernsessions</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{formatDuration(session.duration ?? 0)}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(session.startTime).toLocaleDateString('de-DE', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timer Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 text-white sticky top-24">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Fokus-Timer</span>
                </div>

                <div className="text-5xl font-mono font-bold tracking-tight mb-2 tabular-nums">
                  {formatTime(seconds)}
                </div>
                <p className="text-sm text-slate-400 mb-8">
                  {timerRunning ? 'Lernzeit wird erfasst...' : 'Starte deine Lernsitzung'}
                </p>

                <div className="flex items-center justify-center gap-3">
                  {!timerRunning ? (
                    <button
                      onClick={handleStart}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Play className="w-5 h-5" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Pause className="w-5 h-5" />
                      Speichern & Pause
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    disabled={seconds === 0 && !timerRunning}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {timerRunning && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Aufnahme läuft
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingGoal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingGoal ? 'Ziel bearbeiten' : 'Neues Lernziel'}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titel</label>
                <input
                  type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="z.B. Statistik - Hausarbeit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frist</label>
                <input
                  type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              {!editingGoal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zielstunden</label>
                  <input
                    type="number" min="0.5" step="0.5" value={formTargetHours}
                    onChange={(e) => setFormTargetHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}
              {editingGoal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Goal['status'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="open">Offen</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="done">Abgeschlossen</option>
                  </select>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Abbrechen
              </button>
              <button
                onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                disabled={!formTitle.trim() || (!editingGoal && !formEndDate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editingGoal ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
