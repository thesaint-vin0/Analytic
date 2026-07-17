import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from './useChartTheme';
import { formatValue } from '../../utils/format';

interface AreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  compact?: boolean;
}

export function AreaChart({ data, xKey, series, height = 280, compact = false }: AreaChartProps) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 8, right: 8, left: compact ? 0 : -16, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatValue(Number(v), 'number')} />
        <Tooltip
          contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: t.text, fontWeight: 600 }}
        />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} />
        ))}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
