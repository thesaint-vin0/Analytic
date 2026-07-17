import { useState } from 'react';
import { Bell, Globe, Key, Lock, Moon, Palette, Shield, Sun, User, Clock, Loader2, Check } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { ROLE_LABELS } from '../services/rbac';
import { clsx } from '../utils/clsx';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security' | 'api';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [timezone, setTimezone] = useState('utc');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: false, inApp: true, weekly: true });
  const [twoFa, setTwoFa] = useState(false);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
    setSaving(false);
    if (error) {
      console.error(error);
      return;
    }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your profile, preferences, and security." />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="surface rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
                    tab === t.id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                  )}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <Card>
              <h3 className="text-sm font-semibold mb-4">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold">
                  {fullName?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <Badge tone="primary">{ROLE_LABELS[profile?.role ?? 'viewer']}</Badge>
                  <p className="text-xs text-muted mt-1">Role assigned by admin</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Full Name</span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Email</span>
                  <input value={profile?.email ?? ''} disabled className="surface-2 border border-border rounded-lg px-3 py-2 text-sm opacity-60" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Role</span>
                  <input value={ROLE_LABELS[profile?.role ?? 'viewer']} disabled className="surface-2 border border-border rounded-lg px-3 py-2 text-sm opacity-60" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Timezone</span>
                  <Select value={timezone} onChange={setTimezone} options={[{ label: 'UTC', value: 'utc' }, { label: 'EST', value: 'est' }, { label: 'PST', value: 'pst' }, { label: 'CET', value: 'cet' }]} />
                </label>
              </div>
              <div className="flex justify-end items-center gap-3 mt-6">
                {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={14} /> Saved</span>}
                <Button size="sm" onClick={saveProfile} disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {tab === 'appearance' && (
            <Card>
              <h3 className="text-sm font-semibold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted mb-2">Theme</p>
                  <div className="flex gap-3">
                    {[{ id: 'light', label: 'Light', icon: Sun }, { id: 'dark', label: 'Dark', icon: Moon }].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTheme(opt.id as 'light' | 'dark')}
                          className={clsx(
                            'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition',
                            theme === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300',
                          )}
                        >
                          <Icon size={18} /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="flex flex-col gap-1 max-w-xs">
                  <span className="text-xs text-muted flex items-center gap-1"><Globe size={12} /> Language</span>
                  <Select value="en" onChange={() => {}} options={[{ label: 'English', value: 'en' }, { label: 'Espanol', value: 'es' }, { label: 'Francais', value: 'fr' }, { label: 'Deutsch', value: 'de' }]} />
                </label>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <h3 className="text-sm font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {([
                  { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'inApp', label: 'In-app Notifications', desc: 'Show alerts in the app' },
                  { key: 'weekly', label: 'Weekly Summary', desc: 'Digest of key metrics' },
                ] as const).map((n) => (
                  <label key={n.key} className="flex items-center justify-between p-3 surface-2 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotif((p) => ({ ...p, [n.key]: !p[n.key] }))}
                      className={clsx('relative w-11 h-6 rounded-full transition', notif[n.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600')}
                    >
                      <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', notif[n.key] ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <h3 className="text-sm font-semibold mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted">Update your account password</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className={twoFa ? 'text-emerald-500' : 'text-muted'} />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted">{twoFa ? 'Enabled' : 'Add an extra layer of security'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFa((p) => !p)}
                    className={clsx('relative w-11 h-6 rounded-full transition', twoFa ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')}
                  >
                    <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', twoFa ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted" />
                    <div>
                      <p className="text-sm font-medium">Session Timeout</p>
                      <p className="text-xs text-muted">Auto-logout after inactivity</p>
                    </div>
                  </div>
                  <Select value="30" onChange={() => {}} options={[{ label: '15 min', value: '15' }, { label: '30 min', value: '30' }, { label: '1 hour', value: '60' }]} />
                </div>
              </div>
            </Card>
          )}

          {tab === 'api' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">API Keys</h3>
                <Button size="sm"><Key size={14} /> Generate New Key</Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Production', key: 'pk_live_••••••••••••4f2a', created: 'Jan 12, 2025' },
                  { name: 'Development', key: 'pk_test_••••••••••••9a1b', created: 'Mar 03, 2025' },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between p-3 surface-2 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{k.name}</p>
                      <code className="text-xs text-muted">{k.key}</code>
                      <p className="text-[10px] text-muted mt-0.5">Created {k.created}</p>
                    </div>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
