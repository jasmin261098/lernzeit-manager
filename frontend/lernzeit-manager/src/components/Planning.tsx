import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  X,
  Save,
  Trash2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { supabase, type PlanningPhase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  'Abgeschlossen': {
    label: 'Abgeschlossen',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  'In Arbeit': {
    label: 'In Arbeit',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Clock,
  },
  'Geplant': {
    label: 'Geplant',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: Circle,
  },
};

export default function Planning() {
  const { user } = useAuth();
  const [phases, setPhases] = useState<PlanningPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<PlanningPhase | null>(null);
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState('Geplant');

  const fetchPhases = useCallback(async () => {
    const { data } = await supabase.from('planning_phases').select('*').eq('user_id', user!.id).order('sort_order', { ascending: true });
    setPhases(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    const maxOrder = phases.length > 0 ? Math.max(...phases.map((p) => p.sort_order)) : 0;
    await supabase.from('planning_phases').insert({
      name: formName,
      status: formStatus,
      sort_order: maxOrder + 1,
    });
    closeModal();
    fetchPhases();
  };

  const handleUpdate = async () => {
    if (!editingPhase || !formName.trim()) return;
    await supabase.from('planning_phases').update({ name: formName, status: formStatus }).eq('id', editingPhase.id);
    closeModal();
    fetchPhases();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('planning_phases').delete().eq('id', id);
    fetchPhases();
  };

  const openAdd = () => {
    setEditingPhase(null);
    setFormName('');
    setFormStatus('Geplant');
    setShowModal(true);
  };

  const openEdit = (phase: PlanningPhase) => {
    setEditingPhase(phase);
    setFormName(phase.name);
    setFormStatus(phase.status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPhase(null);
    setFormName('');
    setFormStatus('Geplant');
  };

  const completedCount = phases.filter((p) => p.status === 'Abgeschlossen').length;
  const inProgressCount = phases.filter((p) => p.status === 'In Arbeit').length;
  const progressPercent = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Grobplanung (6 Monate)</h2>
          <p className="text-sm text-slate-500 mt-0.5">Strukturiere deine langfristigen Lernphasen.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Phase hinzufügen
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-900">Gesamtfortschritt</span>
              <span className="text-sm font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="font-bold text-slate-900">{completedCount}</p>
              <p className="text-xs text-slate-500">Abgeschlossen</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900">{inProgressCount}</p>
              <p className="text-xs text-slate-500">In Arbeit</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900">{phases.length}</p>
              <p className="text-xs text-slate-500">Gesamt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {phases.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Noch keine Planungsphasen vorhanden.</p>
            <button onClick={openAdd} className="text-sky-600 text-sm font-medium mt-2 hover:underline">
              Erstelle deine erste Phase
            </button>
          </div>
        ) : (
          phases.map((phase, index) => {
            const config = statusConfig[phase.status] || statusConfig['Geplant'];
            const Icon = config.icon;
            const isLast = index === phases.length - 1;

            return (
              <div key={phase.id} className="relative">
                {!isLast && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200 -mb-3" />
                )}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
                      <Icon className={`w-5 h-5 ${config.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-400">Monat {phase.sort_order}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{phase.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(phase)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Bearbeiten"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(phase.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingPhase ? 'Phase bearbeiten' : 'Neue Phase'}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="z.B. Monat 3: Praxisprojekte"
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
                  <option value="Geplant">Geplant</option>
                  <option value="In Arbeit">In Arbeit</option>
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
                onClick={editingPhase ? handleUpdate : handleAdd}
                disabled={!formName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editingPhase ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
