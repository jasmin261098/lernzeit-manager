import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase, type Module } from './lib/supabase';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import GoalsView from './components/GoalsView';
import PlanningView from './components/PlanningView';
import TimerView from './components/TimerView';

export type AppModule = Module;

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [modules, setModules] = useState<Module[]>([]);

  const fetchModules = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setModules(data || []);
  }, [user]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={() => {}} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={signOut} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {currentView === 'dashboard' && <DashboardView modules={modules} />}
        {currentView === 'ziele' && <GoalsView modules={modules} />}
        {currentView === 'planung' && <PlanningView modules={modules} onModulesChange={fetchModules} />}
        {currentView === 'timer' && <TimerView modules={modules} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
