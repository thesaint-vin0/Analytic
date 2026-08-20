import {
  Line,
  LineChart as RLineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from './useChartTheme';
import { formatValue } from '../../utils/format';

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
}

export function LineChart({ data, xKey, series, height = 280 }: LineChartProps) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatValue(Number(v), 'number')} />
        <Tooltip
          contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: t.text, fontWeight: 600 }}
        />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}
