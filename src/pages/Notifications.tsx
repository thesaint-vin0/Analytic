import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, Loader2, XCircle, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { supabase, type NotificationRow } from '../services/supabase';
import { clsx } from '../utils/clsx';

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
};

export function Notifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetch = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setItems((data as NotificationRow[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const shown = filter === 'unread' ? items.filter((n) => !n.read) : items;

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAll = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const remove = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Real-time alerts and in-app notifications."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
              {filter === 'all' ? 'Show Unread' : 'Show All'}
            </Button>
            <Button size="sm" onClick={markAll}>Mark All Read</Button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="surface rounded-2xl p-12 text-center">
          <Bell size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs text-muted mt-1">Notifications will appear here when system events occur.</p>
        </div>
      ) : (
        <div className="surface rounded-2xl overflow-hidden divide-y divide-border">
          {shown.map((n) => {
            const Icon = iconMap[n.type];
            return (
              <div key={n.id} className={clsx('flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition', !n.read && 'bg-sky-50/40 dark:bg-sky-900/10')}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${colorMap[n.type]}1a`, color: colorMap[n.type] }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <Badge tone="primary">New</Badge>}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted mt-1">{formatTime(n.created_at)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-primary px-2 py-1 rounded hover:bg-sky-50 dark:hover:bg-sky-900/20">Mark read</button>
                  )}
                  <button onClick={() => remove(n.id)} className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <p className="p-8 text-center text-muted text-sm">No unread notifications.</p>}
        </div>
      )}
    </div>
  );
}
