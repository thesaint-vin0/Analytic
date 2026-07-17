import { useChartTheme } from './useChartTheme';
import { formatValue } from '../../utils/format';

interface FunnelChartProps {
  data: { stage: string; value: number }[];
  height?: number;
}

export function FunnelChart({ data, height = 280 }: FunnelChartProps) {
  const t = useChartTheme();
  const max = Math.max(...data.map((d) => d.value));
  const colors = ['#0ea5e9', '#0284c7', '#0d9488', '#10b981', '#22c55e'];

  return (
    <div className="flex flex-col gap-2 justify-center py-2" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const width = (d.value / max) * 100;
        const conv = i === 0 ? 100 : (d.value / data[i - 1].value) * 100;
        return (
          <div key={d.stage} className="flex items-center gap-3 group">
            <div className="w-20 text-xs text-muted text-right shrink-0">{d.stage}</div>
            <div className="flex-1 relative">
              <div
                className="h-9 rounded-lg flex items-center justify-end pr-3 transition-all duration-500 group-hover:brightness-110"
                style={{ width: `${width}%`, background: colors[i % colors.length], minWidth: '60px' }}
              >
                <span className="text-xs font-semibold text-white">{formatValue(d.value, 'number')}</span>
              </div>
            </div>
            <div className="w-12 text-xs shrink-0" style={{ color: t.axis }}>
              {i > 0 && `${conv.toFixed(0)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
