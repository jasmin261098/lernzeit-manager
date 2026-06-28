import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Pencil, X, Save, Target, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { type Goal } from '../lib/supabase';

const statusOptions = [
  { value: 'open',        label: 'Offen',          bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200' },
  { value: 'in_progress', label: 'In Bearbeitung',  bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200' },
  { value: 'done',        label: 'Abgeschlossen',   bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
];

const today = () => new Date().toISOString().slice(0, 10);

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newTargetHours, setNewTargetHours] = useState('1');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const data = await api.get<Goal[]>('/goals');
      setGoals(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = async () => {
    if (!newTitle.trim() || !newEndDate) return;
    try {
      await api.post('/goals', {
        title: newTitle,
        targetHours: parseFloat(newTargetHours) || 1,
        startDate: today(),
        endDate: newEndDate,
      });
      setNewTitle(''); setNewEndDate(''); setNewTargetHours('1'); setShowAdd(false);
      fetchGoals();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteGoal = async (id: number) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/goals/${id}/status`, { status });
      fetchGoals();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setEditTitle(g.title);
    setEditEndDate(g.endDate ? g.endDate.slice(0, 10) : '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/goals/${editingId}`, { title: editTitle, endDate: editEndDate || undefined });
      setEditingId(null);
      fetchGoals();
    } catch (e) {
      setError((e as Error).message);
    }
  };

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
          <h2 className="text-xl font-bold text-slate-900">Lernziele verwalten</h2>
          <p className="text-sm text-slate-500 mt-0.5">Erstellen, bearbeiten, löschen und Status verfolgen.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />Ziel hinzufügen
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Neues Lernziel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Titel</label>
              <input
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="z.B. Statistik Kapitel 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frist</label>
              <input
                type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Zielstunden</label>
              <input
                type="number" min="0.5" step="0.5" value={newTargetHours}
                onChange={(e) => setNewTargetHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addGoal}
              disabled={!newTitle.trim() || !newEndDate}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Speichern
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTitle(''); setNewEndDate(''); setNewTargetHours('1'); }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {goals.map((g) => {
            const st = statusOptions.find((s) => s.value === g.status) || statusOptions[0];
            const isEditing = editingId === g.id;

            return (
              <div key={g.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-40 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button onClick={saveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm font-semibold truncate ${g.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{g.title}</p>
                      {g.endDate && <p className="text-xs text-slate-500 mt-0.5">Frist: {fmtDate(g.endDate)}</p>}
                    </>
                  )}
                </div>

                {!isEditing && (
                  <>
                    <select
                      value={g.status}
                      onChange={(e) => updateStatus(g.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${st.bg} ${st.text} ${st.border}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(g)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Bearbeiten">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteGoal(g.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Löschen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Noch keine Lernziele vorhanden.</p>
              <button onClick={() => setShowAdd(true)} className="text-sky-600 text-sm font-medium mt-2 hover:underline">Erstelle dein erstes Ziel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
