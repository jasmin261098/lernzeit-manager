import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Plus, X, Save, Trash2, Pencil, Clock,
  ChevronRight, CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { type LearningPlan } from '../lib/supabase';

type PlanWithMonthly = LearningPlan & { monthlyPlans?: unknown[] };

const monthNames = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
];

const CURRENT_YEAR = new Date().getFullYear();

function planStatus(plan: LearningPlan): 'done' | 'active' | 'upcoming' {
  const now = new Date();
  if (plan.endDate && new Date(plan.endDate) < now) return 'done';
  if (plan.startDate && new Date(plan.startDate) <= now) return 'active';
  return 'upcoming';
}

const statusCfg = {
  done:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Abgeschlossen', Icon: CheckCircle2 },
  active:   { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     label: 'In Arbeit',     Icon: Clock },
  upcoming: { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   label: 'Geplant',       Icon: Circle },
};

export default function PlanningView() {
  const [tab, setTab] = useState<'grob' | 'monat'>('grob');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [plans, setPlans] = useState<PlanWithMonthly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LearningPlan | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');

  const fetchPlans = useCallback(async () => {
    try {
      const data = await api.get<PlanWithMonthly[]>('/plans');
      setPlans(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const today = () => new Date().toISOString().slice(0, 10);

  const openAdd = () => {
    setEditingPlan(null);
    setFormTitle('');
    setFormStart(today());
    setFormEnd('');
    setShowForm(true);
  };

  const openEdit = (p: LearningPlan) => {
    setEditingPlan(p);
    setFormTitle(p.title);
    setFormStart(p.startDate ? p.startDate.slice(0, 10) : '');
    setFormEnd(p.endDate ? p.endDate.slice(0, 10) : '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const savePlan = async () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;
    setError('');
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, { title: formTitle, startDate: formStart, endDate: formEnd });
      } else {
        await api.post('/plans', { title: formTitle, startDate: formStart, endDate: formEnd });
      }
      closeForm();
      fetchPlans();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deletePlan = async (id: number) => {
    setError('');
    try {
      await api.delete(`/plans/${id}`);
      fetchPlans();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Plans active during the selected calendar month
  const monthPlans = plans.filter((p) => {
    if (!p.startDate || !p.endDate) return false;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const monthStart = new Date(CURRENT_YEAR, selectedMonth - 1, 1);
    const monthEnd = new Date(CURRENT_YEAR, selectedMonth, 0);
    return start <= monthEnd && end >= monthStart;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lernzeitplanung</h2>
          <p className="text-sm text-slate-500 mt-0.5">Grobplanung und Monatsübersicht deiner Lernpläne.</p>
        </div>
        {tab === 'grob' && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />Plan hinzufügen
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setTab('grob'); setShowForm(false); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'grob' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Lernpläne
        </button>
        <button
          onClick={() => { setTab('monat'); setShowForm(false); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'monat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Monatsübersicht
        </button>
      </div>

      {tab === 'grob' && (
        <div className="space-y-6">
          {/* Plan form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{editingPlan ? 'Plan bearbeiten' : 'Neuer Lernplan'}</h3>
                <button onClick={closeForm} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Titel</label>
                  <input
                    value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="z.B. Semester 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Startdatum</label>
                  <input
                    type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Enddatum</label>
                  <input
                    type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={savePlan}
                  disabled={!formTitle.trim() || !formStart || !formEnd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />Speichern
                </button>
                <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Plan timeline */}
          {plans.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Noch keine Lernpläne vorhanden.</p>
              <button onClick={openAdd} className="text-sky-600 text-sm font-medium mt-2 hover:underline">
                Erstelle deinen ersten Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan, index) => {
                const status = planStatus(plan);
                const cfg = statusCfg[status];
                const { Icon } = cfg;
                const isLast = index === plans.length - 1;
                const startLabel = plan.startDate
                  ? new Date(plan.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';
                const endLabel = plan.endDate
                  ? new Date(plan.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';

                return (
                  <div key={plan.id} className="relative">
                    {!isLast && <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200 -mb-3" />}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                          <Icon className={`w-5 h-5 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900">{plan.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{startLabel} – {endLabel}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(plan)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'monat' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {monthNames.map((name, i) => {
              const m = i + 1;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedMonth === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Aktive Pläne — {monthNames[selectedMonth - 1]} {CURRENT_YEAR}</h4>
            </div>
            <div className="divide-y divide-slate-100">
              {monthPlans.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Keine aktiven Pläne in diesem Monat.</p>
                  <button
                    onClick={() => { setTab('grob'); openAdd(); }}
                    className="text-sky-600 text-sm font-medium mt-2 hover:underline"
                  >
                    Plan anlegen
                  </button>
                </div>
              ) : (
                monthPlans.map((p) => {
                  const status = planStatus(p);
                  const cfg = statusCfg[status];
                  const { Icon } = cfg;
                  return (
                    <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-4 h-4 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                        <p className="text-xs text-slate-500">
                          {p.startDate ? new Date(p.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : '—'}
                          {' – '}
                          {p.endDate ? new Date(p.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
