interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  color?: string;
}

export function GaugeChart({ value, max = 100, label, size = 180, color = '#0ea5e9' }: GaugeChartProps) {
  const pct = Math.min(value / max, 1);
  const radius = size / 2 - 12;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20}>
          <path
            d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={12}
            strokeLinecap="round"
          />
          <path
            d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-bold">{value.toFixed(0)}%</span>
          {label && <span className="text-xs text-muted">{label}</span>}
        </div>
      </div>
    </div>
  );
}
