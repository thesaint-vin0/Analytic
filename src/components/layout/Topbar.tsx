import { useState } from 'react';
import { Bell, Menu, Moon, Search, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications } from '../../services/mockData';
import { clsx } from '../../utils/clsx';

interface TopbarProps {
  onOpenSidebar: () => void;
  onNavigate: (id: string) => void;
}

export function Topbar({ onOpenSidebar, onNavigate }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = getNotifications();
  const unread = notifications.filter((n) => !n.read).length;

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
                  <button className="text-xs text-primary" onClick={() => onNavigate('notifications')}>
                    View all
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className={clsx('p-3 border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition', !n.read && 'bg-sky-50/50 dark:bg-sky-900/10')}>
                      <div className="flex items-start gap-2">
                        <span className={clsx('mt-1.5 w-2 h-2 rounded-full shrink-0', n.read ? 'bg-slate-300' : 'bg-primary')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{n.title}</p>
                          <p className="text-[11px] text-muted line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-tight">Sarah Adams</p>
            <p className="text-[10px] text-muted">Super Admin</p>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>
      </div>
    </header>
  );
}
