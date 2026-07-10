import { useState, useEffect, useRef } from 'react';
import {
  Bell, BellRing, Check, Trash2, AlertTriangle, Clock, BookOpen,
  Settings, X, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { type Notification, type NotificationSettings } from '../lib/types';
import { useAuth } from '../lib/auth';

const typeIcons: Record<string, typeof AlertTriangle> = {
  reminder: Clock,
  warning: AlertTriangle,
  info: BookOpen,
};

const typeColors: Record<string, string> = {
  reminder: 'text-sky-600 bg-sky-50',
  warning: 'text-amber-600 bg-amber-50',
  info: 'text-slate-600 bg-slate-50',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const data = await api.get<NotificationSettings | null>('/notification-settings');
      if (data) {
        setSettings(data);
      } else {
        const created = await api.post<NotificationSettings>('/notification-settings', {});
        if (created) setSettings(created);
      }
    } catch {
      setSettings(null);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchSettings();
    seedDemoNotifications();
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

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

  const seedDemoNotifications = async () => {
    if (!user) return;
    try {
      const existing = await api.get<Notification[]>('/notifications');
      if (!existing || existing.length === 0) {
        await api.post<Notification[]>('/notifications', [
          {
            title: 'Lernblock-Erinnerung',
            message: "Dein Lernblock 'Statistik' beginnt in 15 Minuten!",
            type: 'reminder',
            read: false,
          },
          {
            title: 'Inaktivitäts-Warnung',
            message: 'Du hast diese Woche dein Lernziel noch nicht gestartet.',
            type: 'warning',
            read: false,
          },
          {
            title: 'Wochenziel erreicht',
            message: 'Herzlichen Glückwunsch! Du hast deine wöchentliche Lernzeit erreicht.',
            type: 'info',
            read: true,
          },
        ]);
        fetchNotifications();
      }
    } catch {
      // ignore seed failures when API is not yet available
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings || !user) return;
    try {
      const updated = await api.patch<NotificationSettings>(`/notification-settings/${settings.id}`, { [key]: value });
      if (updated) {
        setSettings(updated);
        await syncDemoNotifications(updated);
        fetchNotifications();
      }
    } catch {
      // ignore setting update errors
    }
  };

  const syncDemoNotifications = async (currentSettings: NotificationSettings) => {
    if (!user) return;
    try {
      await api.delete('/notifications?types=reminder,warning');

      const inserts: Array<Omit<Notification, 'id'>> = [];
      if (currentSettings.reminders_enabled) {
        inserts.push({
          title: 'Lernblock-Erinnerung',
          message: "Dein Lernblock 'Statistik' beginnt in 15 Minuten!",
          type: 'reminder',
          read: false,
        });
      }
      if (currentSettings.inactivity_alerts_enabled) {
        inserts.push({
          title: 'Inaktivitäts-Warnung',
          message: 'Du hast diese Woche dein Lernziel noch nicht gestartet.',
          type: 'warning',
          read: false,
        });
      }
      if (inserts.length > 0) {
        await api.post<Notification[]>('/notifications', inserts);
      }
    } catch {
      // ignore sync failures
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}`, { read: true });
      fetchNotifications();
    } catch {
      // ignore mark-read failures
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await api.patch('/notifications/mark-all-read', {});
      fetchNotifications();
    } catch {
      // ignore mark-all-read failures
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch {
      // ignore delete failures
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (n.read) return false;
    if (n.type === 'reminder' && !settings?.reminders_enabled) return false;
    if (n.type === 'warning' && !settings?.inactivity_alerts_enabled) return false;
    return true;
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setShowSettings(false); }}
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
        /* left-0 klappt das Fenster jetzt nach rechts über das Dashboard auf, w-80 gibt massig Platz */
        <div className="absolute left-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              {showSettings ? 'Einstellungen' : 'Benachrichtigungen'}
            </h4>
            <div className="flex items-center gap-1">
              {!showSettings && unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Alle als gelesen
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title={showSettings ? 'Zurück' : 'Einstellungen'}
              >
                {showSettings ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Lernzeit-Erinnerungen</p>
                  <p className="text-xs text-slate-500">Erinnerung 15 Min. vor Lernblöcken</p>
                </div>
                <button
                  onClick={() => updateSetting('reminders_enabled', !settings?.reminders_enabled)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {settings?.reminders_enabled ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Inaktivitäts-Warnung</p>
                  <p className="text-xs text-slate-500">Nach mehr als 3 Tagen Pause</p>
                </div>
                <button
                  onClick={() => updateSetting('inactivity_alerts_enabled', !settings?.inactivity_alerts_enabled)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {settings?.inactivity_alerts_enabled ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  {settings?.reminders_enabled ? 'Erinnerungen aktiv' : 'Erinnerungen deaktiviert'}
                  {' · '}
                  {settings?.inactivity_alerts_enabled ? 'Inaktivitätswarnungen aktiv' : 'Inaktivitätswarnungen deaktiviert'}
                </p>
              </div>
            </div>
          ) : (
            /* Notifications list */
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Keine neuen Mitteilungen</div>
              ) : (
                filteredNotifications.map((n) => {
                  const Icon = typeIcons[n.type] || BookOpen;
                  const color = typeColors[n.type] || typeColors.info;
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Als gelesen">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Löschen">
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