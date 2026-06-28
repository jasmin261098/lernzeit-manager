import { useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, Square, Clock, BookOpen, Plus, X, Check,
} from 'lucide-react';
import { type Module } from '../lib/supabase';

function fmt(totalSeconds: number) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function todayDE() {
  return new Date().toLocaleDateString('de-DE');
}

interface HistoryEntry {
  id: string;
  date: string;
  duration: string;
  topic: string;
}

interface TimerViewProps {
  modules: Module[];
}

export default function TimerView({ modules }: TimerViewProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: '1', date: '18.06.2026', duration: '01:30:00', topic: 'Kryptographie & Verschlüsselung' },
    { id: '2', date: '19.06.2026', duration: '00:45:12', topic: 'Statistik - Regressionsanalyse' },
  ]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) interval = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [timerRunning]);

  const currentTopic = useCallback(() => {
    if (showCustomInput && customTopic.trim()) return customTopic.trim();
    const mod = modules.find((m) => m.id === selectedModuleId);
    return mod?.name || customTopic.trim() || 'Allgemeines Lernen';
  }, [showCustomInput, customTopic, selectedModuleId, modules]);

  const stopTimerAndSave = useCallback(() => {
    setTimerRunning(false);
    if (seconds > 0) {
      setHistory((prev) => [
        { id: String(Date.now()), date: todayDE(), duration: fmt(seconds), topic: currentTopic() },
        ...prev,
      ]);
      setSeconds(0);
    }
  }, [seconds, currentTopic]);

  const activeModules = modules.filter((m) => m.start_month <= 6 && m.end_month >= 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Fokus-Raum & Zeiterfassung</h2>
        <p className="text-sm text-slate-500 mt-0.5">Erfasse deine exakten Sitzungen per Stoppuhr.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 text-white text-center">
            <div className="mb-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Aktuelles Modul</label>

              {!showCustomInput ? (
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomInput(true);
                      setSelectedModuleId('');
                    } else {
                      setSelectedModuleId(e.target.value);
                    }
                  }}
                  className="w-full max-w-[260px] mx-auto px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                >
                  <option value="">-- Modul wählen --</option>
                  {activeModules.length === 0 && <option value="" disabled>Keine Module angelegt</option>}
                  {activeModules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                  <option value="__custom__">+ Eigenes Modul eingeben...</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 max-w-[260px] mx-auto">
                  <input
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Modulname eingeben..."
                    autoFocus
                    className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                  />
                  <button
                    onClick={() => { setShowCustomInput(false); setCustomTopic(''); }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Zurück zur Auswahl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!showCustomInput && selectedModuleId && (
                <p className="text-xs text-slate-500">
                  {modules.find((m) => m.id === selectedModuleId)?.target_hours || 0}h/Woche Ziel
                </p>
              )}
            </div>

            <div className="text-5xl font-mono font-bold tracking-tight my-6 tabular-nums">{fmt(seconds)}</div>

            <div className="flex items-center justify-center gap-3">
              {!timerRunning ? (
                <button
                  onClick={() => setTimerRunning(true)}
                  disabled={!showCustomInput && !selectedModuleId && activeModules.length > 0}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />Start
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Pause className="w-5 h-5" />Pause
                </button>
              )}
              <button
                onClick={stopTimerAndSave}
                disabled={seconds === 0}
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
                Aufnahme läuft · {currentTopic()}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h5 className="font-bold text-slate-900 mb-4">Gespeicherte Lernzeiten</h5>
            <div className="divide-y divide-slate-100">
              {history.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{h.topic}</p>
                      <p className="text-xs text-slate-500">{h.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">{h.duration}</span>
                </div>
              ))}
              {history.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Noch keine Sessions gespeichert.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
