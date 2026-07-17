import { useState } from 'react';
import { BarChart3, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('sarah@company.com');
  const [password, setPassword] = useState('password');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };

  return (
    <div className="min-h-screen flex bg-bg">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-700">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <span className="text-lg font-bold">Pulse Analytics</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-3">Universal analytics for every business.</h1>
            <p className="text-white/80 text-lg">Connect any data source, visualize in real-time, and make decisions with confidence.</p>
          </div>
          <div className="flex gap-6 text-sm text-white/70">
            <span>14+ Chart Types</span>
            <span>Real-time</span>
            <span>AI Insights</span>
            <span>Role-based Access</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <BarChart3 size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold">Pulse Analytics</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to your dashboard</p>

          <form onSubmit={submit} className="space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Email</span>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Password</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-9 py-2.5 text-sm surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button type="button" onClick={() => setShow((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                <span className="text-muted">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:underline">Forgot password?</button>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            Don't have an account? <button className="text-primary hover:underline font-medium">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}
