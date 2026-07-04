import { LayoutDashboard, Target, CalendarDays, Timer, BookOpen, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../lib/auth';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onChangeView, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ziele', label: 'Lernziele', icon: Target },
    { id: 'planung', label: '6-Monats-Planung', icon: CalendarDays },
    { id: 'timer', label: 'Fokus-Timer', icon: Timer },
  ];

  const initial = user?.email?.charAt(0).toUpperCase() || 'S';
  const displayName = user?.email?.split('@')[0] || 'Studi_2026';

  return (
    /* w-80 sorgt für eine stabile, breitere Sidebar (320px) */
    <aside className="w-80 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-lg font-bold tracking-tight">Lern-Planer</span>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}