import { useState, useEffect, useCallback } from 'react';
import { Bell, Key, Lock, Moon, Palette, Shield, Sun, User, Clock, Loader2, Check, Copy, Plus, Trash2, Smartphone, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { ROLE_LABELS } from '../services/rbac';
import { getUserSettings, updateSessionTimeout, enableTwoFactor, disableTwoFactor } from '../services/userSettings';
import { listApiKeys, createApiKey, revokeApiKey, type ApiKey, type CreatedApiKey } from '../services/apiKeys';
import { generateSecret, generateTotp, generateBackupCodes, generateOtpAuthUri, getQrDataUrl } from '../utils/totp';
import { clsx } from '../utils/clsx';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security' | 'api';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
];

const TIMEOUT_OPTIONS = [
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '1 hour', value: '60' },
  { label: '2 hours', value: '120' },
  { label: '4 hours', value: '240' },
  { label: '8 hours', value: '480' },
  { label: 'Never', value: '0' },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, refreshProfile, sessionTimeoutMinutes } = useAuth();
  const { updateSessionTimeout: updateCtxTimeout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [timezone, setTimezone] = useState('utc');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: false, inApp: true, weekly: true });

  // Security state
  const [pwOpen, setPwOpen] = useState(false);
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [twoFaSecret, setTwoFaSecret] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState<string[]>([]);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const [timeoutValue, setTimeoutValue] = useState(String(sessionTimeoutMinutes));
  const [timeoutSaving, setTimeoutSaving] = useState(false);
  const [timeoutSaved, setTimeoutSaved] = useState(false);

  // API keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  // Load user settings
  const loadSecuritySettings = useCallback(async () => {
    if (!profile) return;
    const settings = await getUserSettings(profile.id);
    if (settings) {
      setTwoFaEnabled(settings.two_factor_enabled);
      setTimeoutValue(String(settings.session_timeout_minutes));
    }
  }, [profile]);

  const loadApiKeys = useCallback(async () => {
    if (!profile) return;
    setApiLoading(true);
    const keys = await listApiKeys(profile.id);
    setApiKeys(keys);
    setApiLoading(false);
  }, [profile]);

  useEffect(() => {
    loadSecuritySettings();
    loadApiKeys();
  }, [loadSecuritySettings, loadApiKeys]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
    setSaving(false);
    if (error) { console.error(error); return; }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Change Password ──
  const changePassword = async () => {
    setPwError(null);
    if (pwNew.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    setPwLoading(false);
    if (error) { setPwError(error.message); return; }
    setPwSuccess(true);
    setPwNew(''); setPwConfirm('');
    setTimeout(() => { setPwSuccess(false); setPwOpen(false); }, 2000);
  };

  // ── 2FA Setup ──
  const startTwoFaSetup = () => {
    const secret = generateSecret();
    setTwoFaSecret(secret);
    setTwoFaCode('');
    setTwoFaError(null);
    setTwoFaStep('setup');
    setTwoFaOpen(true);
  };

  const verifyTwoFa = async () => {
    setTwoFaError(null);
    if (!profile) return;
    const expected = await generateTotp(twoFaSecret);
    if (twoFaCode.trim() !== expected) {
      setTwoFaError('Invalid code. Please try again.');
      return;
    }
    const codes = generateBackupCodes();
    setTwoFaLoading(true);
    const ok = await enableTwoFactor(profile.id, twoFaSecret, codes);
    setTwoFaLoading(false);
    if (!ok) { setTwoFaError('Failed to enable 2FA. Please try again.'); return; }
    setTwoFaBackupCodes(codes);
    setTwoFaEnabled(true);
    setTwoFaStep('backup');
  };

  const turnOffTwoFa = async () => {
    if (!profile) return;
    setTwoFaLoading(true);
    const ok = await disableTwoFactor(profile.id);
    setTwoFaLoading(false);
    if (ok) {
      setTwoFaEnabled(false);
      setTwoFaOpen(false);
    }
  };

  // ── Session Timeout ──
  const saveTimeout = async () => {
    if (!profile) return;
    setTimeoutSaving(true);
    const minutes = parseInt(timeoutValue);
    const ok = await updateSessionTimeout(profile.id, minutes);
    setTimeoutSaving(false);
    if (ok) {
      updateCtxTimeout(minutes);
      setTimeoutSaved(true);
      setTimeout(() => setTimeoutSaved(false), 2500);
    }
  };

  // ── API Keys ──
  const generateKey = async () => {
    if (!profile || !newKeyName) return;
    const key = await createApiKey(profile.id, newKeyName);
    if (key) {
      setCreatedKey(key);
      setNewKeyName('');
      setNewKeyOpen(false);
      loadApiKeys();
    }
  };

  const revokeKey = async (id: string) => {
    const ok = await revokeApiKey(id);
    if (ok) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setRevokeId(null);
    }
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
          {/* ── Profile ── */}
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
                <Input label="Full Name" value={fullName} onChange={setFullName} />
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Email</span>
                  <input value={profile?.email ?? ''} disabled className="surface-2 border border-border rounded-lg px-3 py-2 text-sm opacity-60" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Role</span>
                  <input value={ROLE_LABELS[profile?.role ?? 'viewer']} disabled className="surface-2 border border-border rounded-lg px-3 py-2 text-sm opacity-60" />
                </label>
                <Select label="Timezone" value={timezone} onChange={setTimezone} options={[{ label: 'UTC', value: 'utc' }, { label: 'EST', value: 'est' }, { label: 'PST', value: 'pst' }, { label: 'CET', value: 'cet' }]} />
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

          {/* ── Appearance ── */}
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
                        <button key={opt.id} onClick={() => setTheme(opt.id as 'light' | 'dark')} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition', theme === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300')}>
                          <Icon size={18} /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Select label="Language" value="en" onChange={() => {}} options={[{ label: 'English', value: 'en' }, { label: 'Espanol', value: 'es' }, { label: 'Francais', value: 'fr' }, { label: 'Deutsch', value: 'de' }]} />
              </div>
            </Card>
          )}

          {/* ── Notifications ── */}
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
                    <button onClick={() => setNotif((p) => ({ ...p, [n.key]: !p[n.key] }))} className={clsx('relative w-11 h-6 rounded-full transition', notif[n.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600')}>
                      <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', notif[n.key] ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <div className="space-y-4">
              {/* Change Password */}
              <Card>
                <h3 className="text-sm font-semibold mb-4">Security</h3>
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs text-muted">Update your account password</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setPwOpen(true); setPwError(null); setPwSuccess(false); }}>Update</Button>
                </div>

                {/* 2FA */}
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg mt-3">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className={twoFaEnabled ? 'text-emerald-500' : 'text-muted'} />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted">{twoFaEnabled ? 'Enabled — TOTP authenticator app' : 'Add an extra layer of security with TOTP'}</p>
                    </div>
                  </div>
                  {twoFaEnabled ? (
                    <div className="flex gap-2">
                      <Badge tone="success">Active</Badge>
                      <Button variant="outline" size="sm" onClick={() => { setTwoFaOpen(true); setTwoFaStep('backup'); }}>Manage</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={startTwoFaSetup}>Enable</Button>
                  )}
                </div>

                {/* Session Timeout */}
                <div className="flex items-center justify-between p-3 surface-2 rounded-lg mt-3">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted" />
                    <div>
                      <p className="text-sm font-medium">Session Timeout</p>
                      <p className="text-xs text-muted">Auto-logout after inactivity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {timeoutSaved && <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Saved</span>}
                    <Select value={timeoutValue} onChange={setTimeoutValue} options={TIMEOUT_OPTIONS} />
                    <Button size="sm" variant="outline" onClick={saveTimeout} disabled={timeoutSaving}>
                      {timeoutSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── API Keys ── */}
          {tab === 'api' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">API Keys</h3>
                  <p className="text-xs text-muted mt-0.5">Generate keys to access the Pulse API programmatically.</p>
                </div>
                <Button size="sm" onClick={() => setNewKeyOpen(true)}><Plus size={14} /> Generate Key</Button>
              </div>

              {apiLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-primary" /></div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key size={28} className="mx-auto text-muted mb-2" />
                  <p className="text-sm text-muted">No API keys yet. Generate one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-3 surface-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-primary flex items-center justify-center">
                          <Key size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{k.name}</p>
                          <code className="text-xs text-muted">{k.key_prefix}</code>
                          <p className="text-[10px] text-muted mt-0.5">Created {formatTime(k.created_at)}{k.last_used ? ` · Last used ${formatTime(k.last_used)}` : ''}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setRevokeId(k.id)}><Trash2 size={14} /> Revoke</Button>
                    </div>
                  ))}
                </div>
              )}

              {createdKey && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Save your API key now</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">This key will only be shown once. Copy it now and store it securely.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono border border-amber-200 dark:border-amber-800 break-all">{createdKey.key}</code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdKey.key)}>
                      {keyCopied ? <Check size={14} /> : <Copy size={14} />}
                      {keyCopied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button size="sm" onClick={() => setCreatedKey(null)}>I've saved it</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          {pwSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check size={16} /> Password updated successfully!
            </div>
          )}
          {pwError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {pwError}
            </div>
          )}
          <Input label="New Password" type={showPw ? 'text' : 'password'} value={pwNew} onChange={setPwNew} placeholder="At least 6 characters" />
          <Input label="Confirm New Password" type={showPw ? 'text' : 'password'} value={pwConfirm} onChange={setPwConfirm} placeholder="Re-enter new password" />
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
            Show passwords
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={changePassword} disabled={pwLoading || !pwNew || !pwConfirm}>
              {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {pwLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── 2FA Setup Modal ── */}
      <Modal open={twoFaOpen} onClose={() => setTwoFaOpen(false)} title={twoFaEnabled ? 'Manage Two-Factor Authentication' : 'Enable Two-Factor Authentication'}>
        {twoFaStep === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.) or enter the secret manually.</p>
              <div className="inline-block p-3 bg-white rounded-xl border border-border">
                <img src={getQrDataUrl(generateOtpAuthUri(twoFaSecret, profile?.email ?? ''))} alt="QR Code" className="w-48 h-48" />
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted mb-1">Or enter this code manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-1.5 surface-2 rounded-lg text-xs font-mono break-all">{twoFaSecret}</code>
                  <button onClick={() => copyToClipboard(twoFaSecret)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    {keyCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <Input label="Enter the 6-digit code from your app" value={twoFaCode} onChange={(v) => setTwoFaCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
            {twoFaError && <p className="text-xs text-red-600 dark:text-red-400">{twoFaError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setTwoFaOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={verifyTwoFa} disabled={twoFaCode.length !== 6 || twoFaLoading}>
                {twoFaLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {twoFaStep === 'backup' && (
          <div className="space-y-4">
            {twoFaEnabled ? (
              <>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Two-factor authentication is enabled.</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-2">Your backup codes (save these — each can be used once):</p>
                  <div className="grid grid-cols-2 gap-2 p-3 surface-2 rounded-lg">
                    {(twoFaBackupCodes.length ? twoFaBackupCodes : generateBackupCodes()).map((code, i) => (
                      <code key={i} className="text-xs font-mono text-center py-1">{code}</code>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="danger" size="sm" onClick={turnOffTwoFa} disabled={twoFaLoading}>
                    {twoFaLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Disable 2FA
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTwoFaOpen(false)}>Done</Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </Modal>

      {/* ── New API Key Modal ── */}
      <Modal open={newKeyOpen} onClose={() => setNewKeyOpen(false)} title="Generate New API Key">
        <div className="space-y-4">
          <Input label="Key Name" value={newKeyName} onChange={setNewKeyName} placeholder="e.g. Production, Development" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNewKeyOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={generateKey} disabled={!newKeyName}><Key size={14} /> Generate</Button>
          </div>
        </div>
      </Modal>

      {/* ── Revoke Key Modal ── */}
      <Modal open={!!revokeId} onClose={() => setRevokeId(null)} title="Revoke API Key">
        <div className="space-y-4">
          <p className="text-sm">Are you sure you want to revoke this API key? Any applications using this key will immediately lose access. This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRevokeId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => revokeId && revokeKey(revokeId)}>Revoke Key</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
