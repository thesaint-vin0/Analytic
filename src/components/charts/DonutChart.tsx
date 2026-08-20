import { Cell, Pie, PieChart as RPieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from './useChartTheme';

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

const PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function DonutChart({ data, height = 280, innerRadius = 60, showLegend = true }: DonutChartProps) {
  const t = useChartTheme();
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width="100%" height={height} minWidth={160}>
        <RPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={Math.min(height / 2.6, 100)}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 12, fontSize: 12 }}
          />
        </RPieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start text-xs">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
              <span className="text-muted">{d.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
