import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { type StudySession } from '../lib/supabase';

function fmtSeconds(totalSeconds: number) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function fmtMinutes(minutes: number | null) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TimerView() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [topic, setTopic] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<(StudySession & { goal?: { title: string } | null })[]>([]);
  const [error, setError] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.get<(StudySession & { goal?: { title: string } | null })[]>('/sessions');
      setSessions(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) interval = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning]);

  // Warn user before closing tab/window while a session is active
  useEffect(() => {
    if (activeSessionId === null) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [activeSessionId]);

  const handleStart = async () => {
    if (!topic.trim()) return;
    setError('');
    try {
      const session = await api.post<{ id: number }>('/sessions/start', { topic: topic.trim() });
      setActiveSessionId(session.id);
      setTimerRunning(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handlePause = () => {
    setTimerRunning(false);
  };

  const handleResume = () => {
    setTimerRunning(true);
  };

  const handleStop = async () => {
    setTimerRunning(false);
    if (!activeSessionId) return;
    setError('');
    try {
      await api.patch(`/sessions/${activeSessionId}/stop`);
      setActiveSessionId(null);
      setSeconds(0);
      setTopic('');
      fetchSessions();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const canStart = topic.trim().length > 0 && !timerRunning && activeSessionId === null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Fokus-Raum & Zeiterfassung</h2>
        <p className="text-sm text-slate-500 mt-0.5">Erfasse deine exakten Sitzungen per Stoppuhr.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timer card */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 text-white text-center">
            <div className="mb-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Thema / Modul
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canStart && handleStart()}
                placeholder="z.B. Statistik – Regression"
                disabled={timerRunning || activeSessionId !== null}
                className="w-full max-w-[260px] mx-auto block px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="text-5xl font-mono font-bold tracking-tight my-6 tabular-nums">
              {fmtSeconds(seconds)}
            </div>

            <div className="flex items-center justify-center gap-3">
              {activeSessionId === null ? (
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />Start
                </button>
              ) : timerRunning ? (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Pause className="w-5 h-5" />Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-5 h-5" />Weiter
                </button>
              )}

              <button
                onClick={handleStop}
                disabled={activeSessionId === null}
                className="inline-flex items-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
              >
                <Square className="w-4 h-4" />Stopp & Sichern
              </button>
            </div>

            {timerRunning && (
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Aufnahme läuft · {topic}
              </div>
            )}

            {!timerRunning && activeSessionId !== null && (
              <p className="mt-4 text-xs text-amber-400">Session pausiert – tippe Weiter oder Stopp & Sichern</p>
            )}
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h5 className="font-bold text-slate-900 mb-4">Gespeicherte Lernzeiten</h5>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.filter((s) => s.duration !== null).map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.topic ?? '—'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(s.startTime).toLocaleDateString('de-DE', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                          {s.goal?.title && <span className="ml-1 text-slate-400">· {s.goal.title}</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded shrink-0">
                      {fmtMinutes(s.duration)}
                    </span>
                  </div>
                ))}
                {sessions.filter((s) => s.duration !== null).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Noch keine Sessions gespeichert.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
