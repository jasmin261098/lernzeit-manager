import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import GoalsView from './components/GoalsView';
import PlanningView from './components/PlanningView';
import TimerView from './components/TimerView';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

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
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'ziele' && <GoalsView />}
        {currentView === 'planung' && <PlanningView />}
        {currentView === 'timer' && <TimerView />}
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
