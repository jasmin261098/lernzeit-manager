import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, BellRing, Check, Trash2, AlertTriangle, Clock,
  Settings, X, ToggleLeft, ToggleRight, Plus, Save,
} from 'lucide-react';
import { api } from '../lib/api';
import { type Reminder, type StudySession } from '../lib/database';

const SETTINGS_KEY = 'notification_settings';

interface NotifSettings {
  reminders_enabled: boolean;
  inactivity_alerts_enabled: boolean;
}

function loadSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { reminders_enabled: true, inactivity_alerts_enabled: true };
}

function saveSettings(s: NotifSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const READ_KEY = 'notification_read_ids';

function loadReadIds(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function persistReadIds(ids: Set<number>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

const INACTIVITY_DAYS = 3;
const INACTIVITY_ID = -1; // synthetic local-only notification id

export default function NotificationBell() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [inactiveAlert, setInactiveAlert] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(loadReadIds);
  const [settings, setSettings] = useState<NotifSettings>(loadSettings);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const data = await api.get<Reminder[]>('/reminders');
      setReminders(data);
    } catch { /* bell is non-critical, fail silently */ }
  }, []);

  // Check inactivity: fetch sessions and compare most recent startTime
  const checkInactivity = useCallback(async () => {
    if (!settings.inactivity_alerts_enabled) {
      setInactiveAlert(false);
      return;
    }
    try {
      const sessions = await api.get<StudySession[]>('/sessions');
      const completed = sessions.filter((s) => s.duration !== null);
      if (completed.length === 0) {
        setInactiveAlert(false);
        return;
      }
      const latest = completed.reduce((a, b) =>
        new Date(a.startTime) > new Date(b.startTime) ? a : b
      );
      const daysSince = (Date.now() - new Date(latest.startTime).getTime()) / 86_400_000;
      setInactiveAlert(daysSince >= INACTIVITY_DAYS);
    } catch {
      setInactiveAlert(false);
    }
  }, [settings.inactivity_alerts_enabled]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);
  useEffect(() => { checkInactivity(); }, [checkInactivity]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = (id: number) => {
    const next = new Set(readIds).add(id);
    setReadIds(next);
    persistReadIds(next);
  };

  const markAllRead = () => {
    const next = new Set(reminders.map((r) => r.id));
    if (inactiveAlert) next.add(INACTIVITY_ID);
    setReadIds(next);
    persistReadIds(next);
  };

  const deleteReminder = async (id: number) => {
    try {
      await api.delete(`/reminders/${id}`);
    } catch { /* ignore */ }
    setReminders((prev) => prev.filter((r) => r.id !== id));
    const next = new Set(readIds);
    next.delete(id);
    setReadIds(next);
    persistReadIds(next);
  };

  const updateSetting = (key: keyof NotifSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const createReminder = async () => {
    if (!newMessage.trim() || !newScheduledAt) return;
    setCreating(true);
    try {
      await api.post('/reminders', { message: newMessage.trim(), scheduledAt: new Date(newScheduledAt).toISOString() });
      setNewMessage('');
      setNewScheduledAt('');
      setShowCreate(false);
      fetchReminders();
    } catch { /* ignore */ } finally {
      setCreating(false);
    }
  };

  const visibleReminders = settings.reminders_enabled ? reminders : [];

  const inactivityUnread = inactiveAlert && !readIds.has(INACTIVITY_ID);
  const unreadCount = visibleReminders.filter((r) => !readIds.has(r.id)).length
    + (inactivityUnread ? 1 : 0);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setShowSettings(false); setShowCreate(false); }}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              {showSettings ? 'Einstellungen' : showCreate ? 'Neue Erinnerung' : 'Erinnerungen'}
            </h4>
            <div className="flex items-center gap-1">
              {!showSettings && !showCreate && unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-sky-600 hover:text-sky-700 font-medium mr-1">
                  Alle gelesen
                </button>
              )}
              {!showSettings && !showCreate && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Erinnerung erstellen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  if (showCreate) { setShowCreate(false); return; }
                  setShowSettings(!showSettings);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title={showSettings || showCreate ? 'Zurück' : 'Einstellungen'}
              >
                {showSettings || showCreate ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showCreate ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nachricht</label>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="z.B. Statistik Kapitel 3 wiederholen"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Zeitpunkt</label>
                <input
                  type="datetime-local"
                  value={newScheduledAt}
                  onChange={(e) => setNewScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                onClick={createReminder}
                disabled={!newMessage.trim() || !newScheduledAt || creating}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save className="w-4 h-4" />Speichern</>}
              </button>
            </div>
          ) : showSettings ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Erinnerungen anzeigen</p>
                  <p className="text-xs text-slate-500">Geplante Reminder einblenden</p>
                </div>
                <button
                  onClick={() => updateSetting('reminders_enabled', !settings.reminders_enabled)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {settings.reminders_enabled
                    ? <ToggleRight className="w-8 h-8 text-sky-600" />
                    : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Inaktivitäts-Warnung</p>
                  <p className="text-xs text-slate-500">Nach mehr als {INACTIVITY_DAYS} Tagen Pause</p>
                </div>
                <button
                  onClick={() => updateSetting('inactivity_alerts_enabled', !settings.inactivity_alerts_enabled)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {settings.inactivity_alerts_enabled
                    ? <ToggleRight className="w-8 h-8 text-sky-600" />
                    : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Inactivity alert */}
              {inactiveAlert && (
                <div className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${readIds.has(INACTIVITY_ID) ? 'opacity-60' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-amber-600 bg-amber-50">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">Keine Lernaktivität seit {INACTIVITY_DAYS}+ Tagen</p>
                    <p className="text-xs text-slate-500 mt-0.5">Starte jetzt eine neue Lerneinheit!</p>
                  </div>
                  {!readIds.has(INACTIVITY_ID) && (
                    <button onClick={() => markRead(INACTIVITY_ID)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Als gelesen">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {visibleReminders.length === 0 && !inactiveAlert ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Keine Erinnerungen</div>
              ) : (
                visibleReminders.map((r) => {
                  const isRead = readIds.has(r.id);
                  const scheduled = new Date(r.scheduledAt);
                  const isPast = scheduled < new Date();
                  const Icon = isPast ? AlertTriangle : Clock;
                  const color = isPast ? 'text-amber-600 bg-amber-50' : 'text-sky-600 bg-sky-50';
                  return (
                    <div
                      key={r.id}
                      className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${isRead ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 line-clamp-2">{r.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {scheduled.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!isRead && (
                          <button onClick={() => markRead(r.id)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Als gelesen">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteReminder(r.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Löschen">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
