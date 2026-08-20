import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RRadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from './useChartTheme';

interface RadarChartProps {
  data: { metric: string; current: number; target: number }[];
  height?: number;
}

export function RadarChart({ data, height = 280 }: RadarChartProps) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RRadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={t.grid} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: t.axis, fontSize: 11 }} />
        <Radar name="Current" dataKey="current" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
        <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
        <Tooltip contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }} />
      </RRadarChart>
    </ResponsiveContainer>
  );
}
