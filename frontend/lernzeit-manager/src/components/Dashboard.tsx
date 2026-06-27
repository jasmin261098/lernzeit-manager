import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Trash2,
  Plus,
  BookOpen,
  AlertCircle,
  X,
  Save,
  LogOut,
  ChevronRight,
  Award,
  Timer,
} from 'lucide-react';
import { supabase, type Goal, type StudySession } from '../lib/supabase';
import { useAuth } from '../lib/auth';

function formatTime(totalSeconds: number) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState('Aktiv');

  const fetchData = useCallback(async () => {
    const [{ data: goalsData }, { data: sessionsData }] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('study_sessions').select('*').eq('user_id', user!.id).order('started_at', { ascending: false }),
    ]);
    setGoals(goalsData || []);
    setSessions(sessionsData || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const handleStart = () => {
    setTimerRunning(true);
    setTimerStart(new Date());
  };

  const handlePause = async () => {
    setTimerRunning(false);
    if (timerStart && seconds > 0) {
      await supabase.from('study_sessions').insert({
        duration_seconds: seconds,
        started_at: timerStart.toISOString(),
      });
      setTimerStart(null);
      setSeconds(0);
      fetchData();
    }
  };

  const handleReset = () => {
    setTimerRunning(false);
    setSeconds(0);
    setTimerStart(null);
  };

  const handleAddGoal = async () => {
    if (!formTitle.trim()) return;
    await supabase.from('goals').insert({
      title: formTitle,
      deadline: formDeadline || null,
      status: formStatus,
      progress: 0,
    });
    setFormTitle('');
    setFormDeadline('');
    setFormStatus('Aktiv');
    setShowAddModal(false);
    fetchData();
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !formTitle.trim()) return;
    await supabase
      .from('goals')
      .update({ title: formTitle, deadline: formDeadline || null, status: formStatus })
      .eq('id', editingGoal.id);
    setEditingGoal(null);
    setFormTitle('');
    setFormDeadline('');
    setFormStatus('Aktiv');
    fetchData();
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    fetchData();
  };

  const handleProgressChange = async (goal: Goal, newProgress: number) => {
    await supabase.from('goals').update({ progress: newProgress }).eq('id', goal.id);
    fetchData();
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDeadline(goal.deadline || '');
    setFormStatus(goal.status);
  };

  const openAdd = () => {
    setShowAddModal(true);
    setFormTitle('');
    setFormDeadline('');
    setFormStatus('Aktiv');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingGoal(null);
    setFormTitle('');
    setFormDeadline('');
    setFormStatus('Aktiv');
  };

  const totalStudySeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
  const completedGoals = goals.filter((g) => g.progress >= 100).length;
  const urgentGoals = goals.filter((g) => g.status === 'Dringend').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'Dringend':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Abgeschlossen':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  const progressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 75) return 'bg-sky-500';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-rose-500';
  };

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Willkommen zurück! Zeit, deine Ziele anzugehen.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
            <Award className="w-3.5 h-3.5" />
            Studi_2026
          </span>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Ausloggen</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gesamte Lernzeit</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatDuration(totalStudySeconds)}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">+{formatDuration(sessions.length > 0 ? sessions[0].duration_seconds : 0)} letzte Session</p>
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dringende Ziele</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{urgentGoals}</p>
                <p className="text-xs text-rose-500 mt-1 font-medium">{urgentGoals > 0 ? 'Aktion erforderlich' : 'Alles im Plan'}</p>
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
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{goal.title}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {goal.deadline || 'Keine Frist'}
                            </span>
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

                      <div className="mt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${progressColor(goal.progress)}`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-9 text-right">{goal.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={goal.progress}
                          onChange={(e) => handleProgressChange(goal, parseInt(e.target.value))}
                          className="w-full mt-1 h-1 opacity-0 hover:opacity-100 transition-opacity cursor-pointer accent-slate-900"
                        />
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
                          <p className="text-sm font-medium text-slate-900">{formatDuration(session.duration_seconds)}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(session.started_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
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
                    disabled={seconds === 0}
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

      {/* Modal */}
      {(showAddModal || editingGoal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="z.B. Statistik - Hausarbeit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frist</label>
                <input
                  type="text"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  placeholder="z.B. In 2 Wochen"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="Aktiv">Aktiv</option>
                  <option value="Dringend">Dringend</option>
                  <option value="Abgeschlossen">Abgeschlossen</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                disabled={!formTitle.trim()}
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
