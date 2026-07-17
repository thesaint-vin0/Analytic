import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from './useChartTheme';
import { formatValue } from '../../utils/format';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({ data, xKey, series, height = 280, layout = 'horizontal' }: BarChartProps) {
  const t = useChartTheme();
  const isVertical = layout === 'vertical';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} layout={layout} margin={{ top: 8, right: 8, left: isVertical ? 40 : -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={isVertical} horizontal={!isVertical} />
        {isVertical ? (
          <>
            <XAxis type="number" stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatValue(Number(v), 'number')} />
            <YAxis type="category" dataKey={xKey} stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatValue(Number(v), 'number')} />
          </>
        )}
        <Tooltip
          contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: t.text, fontWeight: 600 }}
          cursor={{ fill: t.grid, opacity: 0.3 }}
        />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Bar>
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
