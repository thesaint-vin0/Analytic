import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getNotifications } from '../services/mockData';
import { clsx } from '../utils/clsx';
import type { Notification } from '../types/analytics';

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
  const initial = useMemo(() => getNotifications(), []);
  const [items, setItems] = useState<Notification[]>(initial);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const shown = filter === 'unread' ? items.filter((n) => !n.read) : items;

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

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

      <div className="surface rounded-2xl overflow-hidden divide-y divide-border">
        {shown.length === 0 && <p className="p-8 text-center text-muted text-sm">No notifications.</p>}
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
                <p className="text-[10px] text-muted mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="text-xs text-primary shrink-0">Mark read</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="surface rounded-2xl p-5 flex items-center gap-3">
        <Bell size={20} className="text-primary shrink-0" />
        <p className="text-sm text-muted">Enable push notifications in Settings to receive real-time alerts on your devices.</p>
      </div>
    </div>
  );
}
