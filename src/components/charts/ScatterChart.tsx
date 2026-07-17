import { CartesianGrid, Scatter, ScatterChart as RScatterChart, Tooltip, XAxis, YAxis, ZAxis, ResponsiveContainer } from 'recharts';
import { useChartTheme } from './useChartTheme';

interface ScatterChartProps {
  data: { x: number; y: number; z: number; name: string }[];
  height?: number;
}

export function ScatterChart({ data, height = 280 }: ScatterChartProps) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
        <XAxis type="number" dataKey="x" name="Efficiency" stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis type="number" dataKey="y" name="Revenue" stroke={t.axis} fontSize={11} tickLine={false} axisLine={false} />
        <ZAxis type="number" dataKey="z" range={[60, 400]} />
        <Tooltip
          contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Scatter data={data} fill="#0ea5e9" fillOpacity={0.6} />
      </RScatterChart>
    </ResponsiveContainer>
  );
}
