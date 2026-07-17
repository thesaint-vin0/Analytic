import { NAV_ITEMS } from '../../config/navigation';
import { clsx } from '../../utils/clsx';
import { BarChart3, X } from 'lucide-react';

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  const groups = Array.from(new Set(NAV_ITEMS.map((n) => n.group)));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed lg:static z-40 h-full w-64 shrink-0 surface border-r border-border flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Pulse</p>
              <p className="text-[10px] text-muted -mt-0.5">Analytics Platform</p>
            </div>
          </div>
          <button className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{group}</p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                    >
                      <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="surface-2 rounded-xl p-3">
            <p className="text-xs font-semibold mb-1">Plan: Enterprise</p>
            <p className="text-[11px] text-muted">Unlimited dashboards & integrations.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
