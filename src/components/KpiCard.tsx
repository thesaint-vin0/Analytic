import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import type { KpiMetric } from '../types/analytics';
import { formatValue, formatFull } from '../utils/format';
import { clsx } from '../utils/clsx';

interface KpiCardProps {
  metric: KpiMetric;
  index: number;
}

export function KpiCard({ metric, index }: KpiCardProps) {
  const [display, setDisplay] = useState(0);
  const positive = metric.change >= 0;
  const Icon = (Icons as Record<string, Icons.LucideIcon>)[metric.icon] || Icons.Circle;

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(metric.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [metric.value]);

  const sparkData = metric.sparkline.map((v, i) => ({ i, v }));

  return (
    <div
      className="surface rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${metric.color}1a`, color: metric.color }}
          >
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs text-muted">{metric.label}</p>
            <p className="text-lg font-bold tracking-tight">{formatValue(display, metric.unit)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
            )}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(metric.change).toFixed(1)}%
          </span>
          <span className="text-[10px] text-muted">vs {formatFull(metric.previousValue, metric.unit)}</span>
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Area type="monotone" dataKey="v" stroke={metric.color} strokeWidth={1.5} fill={`url(#spark-${metric.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
