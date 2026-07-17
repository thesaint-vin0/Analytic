import { useEffect, useRef, useState } from 'react';
import { Activity, Users, ShoppingCart, DollarSign, Wifi } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { AreaChart } from '../components/charts/AreaChart';
import { LineChart } from '../components/charts/LineChart';
import { Badge } from '../components/ui/Badge';

interface LivePoint {
  [key: string]: unknown;
  t: string;
  revenue: number;
  users: number;
  orders: number;
}

const MAX_POINTS = 20;

export function Realtime() {
  const [data, setData] = useState<LivePoint[]>(() =>
    Array.from({ length: MAX_POINTS }, (_, i) => ({
      t: `${i}`,
      revenue: 12000 + Math.random() * 4000,
      users: 480 + Math.random() * 120,
      orders: 32 + Math.random() * 18,
    })),
  );
  const [connected] = useState(true);
  const [events, setEvents] = useState<{ id: number; text: string; time: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const point: LivePoint = {
        t: now.toLocaleTimeString('en-US', { hour12: false }),
        revenue: 12000 + Math.random() * 4000,
        users: 480 + Math.random() * 120,
        orders: 32 + Math.random() * 18,
      };
      setData((prev) => [...prev.slice(1), point]);

      if (Math.random() > 0.6) {
        idRef.current += 1;
        const messages = [
          'New order placed',
          'User signed up',
          'Payment received',
          'Cart abandoned',
          'Subscription renewed',
          'High-value transaction',
        ];
        setEvents((prev) =>
          [{ id: idRef.current, text: messages[Math.floor(Math.random() * messages.length)], time: point.t }, ...prev].slice(0, 8),
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-time Analytics"
        subtitle="Live data stream with auto-refresh."
        action={
          <Badge tone={connected ? 'success' : 'error'}>
            <Wifi size={12} className="mr-1" /> {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Live Revenue', value: `$${latest.revenue.toFixed(0)}`, icon: DollarSign, color: '#10b981' },
          { label: 'Active Users', value: latest.users.toFixed(0), icon: Users, color: '#8b5cf6' },
          { label: 'Orders/min', value: latest.orders.toFixed(0), icon: ShoppingCart, color: '#f59e0b' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="surface rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${k.color}1a`, color: k.color }}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-muted flex items-center gap-1">
                  <Activity size={11} className="text-primary animate-pulse" /> {k.label}
                </p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Live Revenue Stream" subtitle="Updating every 2s" className="lg:col-span-2">
          <AreaChart data={data} xKey="t" series={[{ key: 'revenue', name: 'Revenue', color: '#10b981' }]} height={260} compact />
        </ChartCard>
        <ChartCard title="Live Events" subtitle="Recent activity">
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {events.length === 0 && <p className="text-xs text-muted text-center py-8">Waiting for events...</p>}
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-2 surface-2 rounded-lg p-2 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="text-xs flex-1">{e.text}</span>
                <span className="text-[10px] text-muted">{e.time}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Live Users & Orders" subtitle="Real-time metrics">
        <LineChart data={data} xKey="t" series={[{ key: 'users', name: 'Users', color: '#8b5cf6' }, { key: 'orders', name: 'Orders', color: '#f59e0b' }]} height={260} />
      </ChartCard>
    </div>
  );
}
