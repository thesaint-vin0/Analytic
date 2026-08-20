import { useEffect, useState, useCallback } from 'react';
import { Bell, Menu, Moon, Search, Sun, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase, type NotificationRow } from '../../services/supabase';
import { ROLE_LABELS } from '../../services/rbac';
import { clsx } from '../../utils/clsx';

interface TopbarProps {
  onOpenSidebar: () => void;
  onNavigate: (id: string) => void;
}

export function Topbar({ onOpenSidebar, onNavigate }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const unread = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications((data as NotificationRow[]) ?? []);
  }, [profile]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    fetchNotifications();
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1">
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onOpenSidebar}>
          <Menu size={20} />
        </button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search metrics, reports, integrations..."
            className="w-full pl-9 pr-3 py-2 text-sm surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 surface rounded-xl shadow-xl border border-border z-40 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <p className="text-sm font-semibold">Notifications</p>
                  {unread > 0 && (
                    <button className="text-xs text-primary" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="p-6 text-center text-xs text-muted">No notifications yet.</p>
                  )}
                  {notifications.map((n) => (
                    <div key={n.id} className={clsx('p-3 border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition', !n.read && 'bg-sky-50/50 dark:bg-sky-900/10')}>
                      <div className="flex items-start gap-2">
                        <span className={clsx('mt-1.5 w-2 h-2 rounded-full shrink-0', n.read ? 'bg-slate-300' : 'bg-primary')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{n.title}</p>
                          <p className="text-[11px] text-muted line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted mt-1">{formatTime(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => onNavigate('notifications')} className="w-full p-2.5 text-xs text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 border-t border-border">
                  View all
                </button>
              </div>
            </>
          )}
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight max-w-[120px] truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-muted">{ROLE_LABELS[profile?.role ?? 'viewer']}</p>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>
          <div className="absolute right-0 mt-1 w-48 surface rounded-xl shadow-xl border border-border z-40 hidden group-hover:block py-1">
            <button onClick={() => onNavigate('settings')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
              Settings
            </button>
            <button onClick={() => onNavigate('users')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
              User Management
            </button>
            <div className="border-t border-border my-1" />
            <button onClick={signOut} className="w-full text-left px-3 py-2 text-xs text-error hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
