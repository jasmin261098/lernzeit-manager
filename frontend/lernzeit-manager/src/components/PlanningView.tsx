import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Plus, X, Save, Trash2, Pencil, Clock,
  ChevronRight, CheckCircle2, Circle, AlertCircle, BookOpen,
} from 'lucide-react';
import { supabase, type PlanningPhase, type LearningBlock, type Module } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

const statusCfg: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  'Abgeschlossen': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  'In Arbeit': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: Clock },
  'Geplant': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: Circle },
};

const colorOptions = [
  { value: 'sky', label: 'Blau', bg: 'bg-sky-500' },
  { value: 'emerald', label: 'Grün', bg: 'bg-emerald-500' },
  { value: 'amber', label: 'Orange', bg: 'bg-amber-500' },
  { value: 'rose', label: 'Rot', bg: 'bg-rose-500' },
  { value: 'violet', label: 'Violett', bg: 'bg-violet-500' },
  { value: 'slate', label: 'Grau', bg: 'bg-slate-500' },
];

interface PlanningViewProps {
  modules: Module[];
  onModulesChange: () => void;
}

export default function PlanningView({ modules, onModulesChange }: PlanningViewProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'grob' | 'monat'>('grob');
  const [selectedMonth, setSelectedMonth] = useState(1);

  const [phases, setPhases] = useState<PlanningPhase[]>([]);
  const [blocks, setBlocks] = useState<LearningBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [modName, setModName] = useState('');
  const [modTarget, setModTarget] = useState(0);
  const [modStart, setModStart] = useState(1);
  const [modEnd, setModEnd] = useState(1);
  const [modColor, setModColor] = useState('sky');

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LearningBlock | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formModuleId, setFormModuleId] = useState('');
  const [sendReminder, setSendReminder] = useState(false);

  const fetchPhases = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('planning_phases').select('*').eq('user_id', user.id).order('sort_order', { ascending: true });
    setPhases(data || []);
  }, [user]);

  const fetchBlocks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('learning_blocks').select('*').eq('user_id', user.id).order('date', { ascending: true });
    setBlocks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPhases();
    fetchBlocks();
  }, [fetchPhases, fetchBlocks]);

  const openAddModule = () => {
    setEditingModule(null);
    setModName('');
    setModTarget(0);
    setModStart(1);
    setModEnd(1);
    setModColor('sky');
    setShowModuleForm(true);
  };

  const openEditModule = (m: Module) => {
    setEditingModule(m);
    setModName(m.name);
    setModTarget(m.target_hours);
    setModStart(m.start_month);
    setModEnd(m.end_month);
    setModColor(m.color);
    setShowModuleForm(true);
  };

  const closeModuleForm = () => {
    setShowModuleForm(false);
    setEditingModule(null);
  };

  const saveModule = async () => {
    if (!modName.trim() || !user) return;
    const payload = { name: modName, target_hours: modTarget, start_month: modStart, end_month: modEnd, color: modColor };
    if (editingModule) {
      const { error: err } = await supabase.from('modules').update(payload).eq('id', editingModule.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from('modules').insert(payload);
      if (err) setError(err.message);
    }
    closeModuleForm();
    onModulesChange();
  };

  const deleteModule = async (id: string) => {
    const { error: err } = await supabase.from('modules').delete().eq('id', id);
    if (err) setError(err.message);
    onModulesChange();
  };

  const openAddBlock = () => {
    setEditingBlock(null);
    setFormTitle('');
    setFormDate('');
    setFormStart('');
    setFormEnd('');
    setFormModuleId(modules[0]?.id || '');
    setSendReminder(false);
    setShowBlockForm(true);
  };

  const openEditBlock = (b: LearningBlock) => {
    setEditingBlock(b);
    setFormTitle(b.title);
    setFormDate(b.date);
    setFormStart(b.start_time || '');
    setFormEnd(b.end_time || '');
    setFormModuleId(b.module || '');
    setSendReminder(false);
    setShowBlockForm(true);
  };

  const closeBlockForm = () => {
    setShowBlockForm(false);
    setEditingBlock(null);
  };

  const saveBlock = async () => {
    if (!formTitle.trim() || !formDate || !user) return;
    const payload = {
      title: formTitle,
      date: formDate,
      start_time: formStart || null,
      end_time: formEnd || null,
      module: formModuleId || null,
      month_index: selectedMonth,
    };
    if (editingBlock) {
      const { error: err } = await supabase.from('learning_blocks').update(payload).eq('id', editingBlock.id);
      if (err) setError(err.message);
    } else {
      const { data: inserted, error: err } = await supabase.from('learning_blocks').insert(payload).select().single();
      if (err) setError(err.message);
      // If reminder checkbox is checked, create a notification with selected module name
      if (sendReminder && inserted) {
        const selectedMod = modules.find((m) => m.id === formModuleId);
        const modName = selectedMod?.name || formTitle;
        await supabase.from('notifications').insert({
          title: 'Lernblock-Erinnerung',
          message: `Dein Lernblock '${modName}' beginnt in 15 Minuten!`,
          type: 'reminder',
          read: false,
        });
      }
    }
    closeBlockForm();
    fetchBlocks();
  };

  const deleteBlock = async (id: string) => {
    const { error: err } = await supabase.from('learning_blocks').delete().eq('id', id);
    if (err) setError(err.message);
    fetchBlocks();
  };

  const monthBlocks = blocks.filter((b) => b.month_index === selectedMonth);
  const monthModules = modules.filter((m) => m.start_month <= selectedMonth && m.end_month >= selectedMonth);

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
          <p className="text-sm text-slate-500 mt-0.5">Grobplanung und detaillierte Monatsplanung.</p>
        </div>
        {tab === 'grob' && (
          <button onClick={openAddModule} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />Modul hinzufügen
          </button>
        )}
        {tab === 'monat' && (
          <button onClick={openAddBlock} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />Lernblock hinzufügen
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => { setTab('grob'); setShowBlockForm(false); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'grob' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Grobplanung (6 Monate)
        </button>
        <button onClick={() => { setTab('monat'); setShowModuleForm(false); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === 'monat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Monats-Detailplanung
        </button>
      </div>

      {tab === 'grob' && (
        <div className="space-y-6">
          {/* Module form - only in grob tab */}
          {showModuleForm && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{editingModule ? 'Modul bearbeiten' : 'Neues Modul'}</h3>
                <button onClick={closeModuleForm} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Modulname</label>
                  <input value={modName} onChange={(e) => setModName(e.target.value)} placeholder="z.B. Statistik" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Zielstunden / Woche</label>
                  <input type="number" value={modTarget} onChange={(e) => setModTarget(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start-Monat</label>
                  <select value={modStart} onChange={(e) => setModStart(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                    {[1,2,3,4,5,6].map((m) => <option key={m} value={m}>Monat {m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End-Monat</label>
                  <select value={modEnd} onChange={(e) => setModEnd(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                    {[1,2,3,4,5,6].map((m) => <option key={m} value={m}>Monat {m}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Farbe</label>
                  <div className="flex items-center gap-2">
                    {colorOptions.map((c) => (
                      <button key={c.value} onClick={() => setModColor(c.value)} className={`w-8 h-8 rounded-full ${c.bg} ${modColor === c.value ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`} title={c.label} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={saveModule} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">Speichern</button>
                <button onClick={closeModuleForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Abbrechen</button>
              </div>
            </div>
          )}

          {/* Module list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Deine Module</h4>
              <span className="text-xs text-slate-500">{modules.length} Module</span>
            </div>
            <div className="divide-y divide-slate-100">
              {modules.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Noch keine Module angelegt.</p>
                  <button onClick={openAddModule} className="text-sky-600 text-sm font-medium mt-2 hover:underline">Erstelle dein erstes Modul</button>
                </div>
              ) : (
                modules.map((m) => {
                  const colorOpt = colorOptions.find((c) => c.value === m.color) || colorOptions[0];
                  return (
                    <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${colorOpt.bg}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{m.name}</p>
                          <p className="text-xs text-slate-500">Monat {m.start_month}–{m.end_month} · {m.target_hours}h/Woche</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEditModule(m)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Bearbeiten"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteModule(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Phase timeline */}
          <div className="space-y-3">
            {phases.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Noch keine Planungsphasen vorhanden.</p>
              </div>
            ) : (
              phases.map((phase, index) => {
                const cfg = statusCfg[phase.status] || statusCfg['Geplant'];
                const Icon = cfg.icon;
                const isLast = index === phases.length - 1;
                const phaseModules = modules.filter((m) => m.start_month <= phase.sort_order && m.end_month >= phase.sort_order);
                return (
                  <div key={phase.id} className="relative">
                    {!isLast && <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200 -mb-3" />}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                          <Icon className={`w-5 h-5 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{phase.status}</span>
                            <span className="text-xs text-slate-400">Monat {phase.sort_order}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900">{phase.name}</h3>
                          {phaseModules.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {phaseModules.map((m) => {
                                const c = colorOptions.find((co) => co.value === m.color) || colorOptions[0];
                                return (
                                  <span key={m.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-opacity-10 ${c.bg.replace('bg-', 'bg-opacity-10 text-')}`} style={{ backgroundColor: 'transparent' }}>
                                    {m.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 mt-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === 'monat' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {[1,2,3,4,5,6].map((m) => (
              <button key={m} onClick={() => setSelectedMonth(m)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedMonth === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                Monat {m}
              </button>
            ))}
          </div>

          {/* Block form */}
          {showBlockForm && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{editingBlock ? 'Lernblock bearbeiten' : 'Neuer Lernblock'}</h3>
                <button onClick={closeBlockForm} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Titel</label>
                  <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="z.B. Kapitel 3 wiederholen" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Modul</label>
                  <select value={formModuleId} onChange={(e) => setFormModuleId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                    <option value="">Kein Modul</option>
                    {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Datum</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Von</label>
                    <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Bis</label>
                    <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                </div>
                {!editingBlock && (
                  <div className="sm:col-span-2 space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="reminder"
                        checked={sendReminder}
                        onChange={(e) => setSendReminder(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <label htmlFor="reminder" className="text-sm text-slate-700 cursor-pointer select-none">
                        Erinnerung 15 Minuten vor Beginn senden
                      </label>
                    </div>
                    {sendReminder && (
                      <p className="text-xs text-sky-600 pl-6">
                        Benachrichtigung: "Dein Lernblock '{modules.find(m => m.id === formModuleId)?.name || formTitle}' beginnt in 15 Minuten!"
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={saveBlock} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">Speichern</button>
                <button onClick={closeBlockForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Abbrechen</button>
              </div>
            </div>
          )}

          {/* Active modules for this month */}
          {monthModules.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aktive Module diesen Monat</h4>
              <div className="flex flex-wrap gap-2">
                {monthModules.map((m) => {
                  const c = colorOptions.find((co) => co.value === m.color) || colorOptions[0];
                  return (
                    <span key={m.id} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${c.bg} text-white`}>
                      {m.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blocks list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Lernblöcke — Monat {selectedMonth}</h4>
            </div>
            <div className="divide-y divide-slate-100">
              {monthBlocks.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Noch keine Lernblöcke für diesen Monat.</p>
                  <button onClick={openAddBlock} className="text-sky-600 text-sm font-medium mt-2 hover:underline">Erstelle deinen ersten Block</button>
                </div>
              ) : (
                monthBlocks.map((b) => {
                  const mod = modules.find((m) => m.id === b.module);
                  const modColor = mod ? (colorOptions.find((c) => c.value === mod.color) || colorOptions[0]).bg : 'bg-slate-500';
                  return (
                    <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${modColor}`}>
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{b.title}</p>
                          <p className="text-xs text-slate-500">
                            {mod && <span className="font-medium">{mod.name}</span>}
                            {mod && ' · '}
                            {new Date(b.date).toLocaleDateString('de-DE')}
                            {b.start_time && ` · ${b.start_time}${b.end_time ? `–${b.end_time}` : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEditBlock(b)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Bearbeiten"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteBlock(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
