import { useState } from 'react';
import { BookOpen, ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!password.trim()) {
      setError('Bitte gib dein Passwort ein.');
      return;
    }

    if (view === 'register' && password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setLoading(true);

    const { error: err } = view === 'login'
      ? await signIn(trimmedEmail, password)
      : await signUp(trimmedEmail, password);

    if (err) setError(err);
    setLoading(false);
  };

  const switchView = () => {
    setView(view === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-white/10">
            <BookOpen className="w-7 h-7 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lern-Planer</h1>
          <p className="text-sm text-slate-400 mt-1">Strukturiere deinen Studienerfolg</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/20 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-5">
            {view === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="studi@iu-fernstudium.de" required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>{view === 'login' ? 'Einloggen' : 'Registrieren'}</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button onClick={switchView} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              {view === 'login'
                ? <>Noch kein Konto? <span className="font-medium underline">Registrieren</span></>
                : <>Bereits registriert? <span className="font-medium underline">Einloggen</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
