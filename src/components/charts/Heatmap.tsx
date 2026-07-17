interface HeatmapProps {
  data: { day: string; hour: number; value: number }[];
  height?: number;
}

export function Heatmap({ data, height = 240 }: HeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...data.map((d) => d.value));

  const color = (v: number) => {
    const ratio = v / max;
    const r = 14;
    const g = Math.round(165 + (211 - 165) * (1 - ratio));
    const b = Math.round(233 + (238 - 233) * (1 - ratio));
    return `rgb(${r}, ${g}, ${b}, ${0.15 + ratio * 0.85})`;
  };

  return (
    <div className="overflow-x-auto" style={{ minHeight: height }}>
      <div className="flex flex-col gap-1 min-w-[560px]">
        <div className="flex gap-1 pl-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-muted">{h}</div>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-8 text-[10px] text-muted text-right pr-1">{day}</div>
            {Array.from({ length: 24 }, (_, h) => {
              const cell = data.find((d) => d.day === day && d.hour === h);
              return (
                <div
                  key={h}
                  className="flex-1 h-6 rounded-sm transition hover:ring-2 hover:ring-primary/50"
                  style={{ background: cell ? color(cell.value) : 'transparent' }}
                  title={cell ? `${day} ${h}:00 — ${cell.value}` : ''}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
