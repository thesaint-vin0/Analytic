interface WaterfallProps {
  data: { name: string; value: number; running?: boolean }[];
  height?: number;
}

export function Waterfall({ data, height = 300 }: WaterfallProps) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)));
  const scale = (height - 40) / (max * 1.1);

  let cumulative = 0;
  const bars = data.map((d) => {
    if (d.running) {
      cumulative = d.value;
      return { ...d, start: 0, end: d.value, isTotal: true };
    }
    const start = cumulative;
    cumulative += d.value;
    return { ...d, start, end: cumulative, isTotal: false };
  });

  const top = Math.max(...bars.map((b) => Math.max(b.start, b.end)));

  return (
    <div className="flex items-end justify-around gap-2" style={{ height }}>
      {bars.map((b) => {
        const isPositive = b.value >= 0;
        const barHeight = Math.abs(b.value) * scale;
        const bottom = (b.isTotal ? 0 : Math.min(b.start, b.end)) * scale;
        const color = b.isTotal ? '#0ea5e9' : isPositive ? '#10b981' : '#ef4444';
        return (
          <div key={b.name} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            <span className="text-[10px] font-semibold text-muted">
              {b.value >= 0 ? '+' : ''}{(b.value / 1000).toFixed(0)}k
            </span>
            <div className="relative w-full flex justify-center" style={{ height: top * scale }}>
              <div
                className="w-10 rounded-t-md transition-all duration-500 hover:brightness-110 absolute bottom-0"
                style={{ height: barHeight, bottom: bottom, background: color }}
              />
            </div>
            <span className="text-[10px] text-muted text-center truncate w-full">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}
