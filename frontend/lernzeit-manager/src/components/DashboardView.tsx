import { Clock, TrendingUp, AlertTriangle, BookOpen, Target, CalendarDays, Timer } from 'lucide-react';
import { type Module } from '../lib/supabase';

interface DashboardViewProps {
  modules: Module[];
}

export default function DashboardView({ modules }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Zentrales Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Fortschritts- und Aktivitätsmetriken im Überblick.</p>
      </div>

      {/* Module quick view */}
      {modules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Deine aktiven Module</h3>
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <BookOpen className="w-3 h-3" />
                {m.name}
                <span className="text-slate-400">· {m.target_hours}h/Wo.</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lernzeit diese Woche</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">15.2 Std.</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Soll-Vorgabe erfüllt</p>
            </div>
            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-sky-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Globale Zielerreichung</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">66.6%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '66%' }} /></div>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inaktivitäts-Warnung</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">0 Tage</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Status: Höchste Aktivität</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h5 className="font-bold text-slate-900 mb-3">Mustererkennung & Lernkurve</h5>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-sm">
          Höchste Produktivität statistisch ermittelt zwischen 19:00 und 22:00 Uhr
        </div>
      </div>
    </div>
  );
}
