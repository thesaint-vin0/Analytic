import { useMemo } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { AreaChart } from '../components/charts/AreaChart';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { RadarChart } from '../components/charts/RadarChart';
import { FunnelChart } from '../components/charts/FunnelChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { Heatmap } from '../components/charts/Heatmap';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getTimeSeries, getCategoryData, getRegionData, getRadarData, getFunnelData, getHeatmapData, getGeoData, getAiInsights } from '../services/mockData';
import type { Filters } from '../types/analytics';
import { downloadFile, toCsv } from '../utils/format';

interface OverviewProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

export function Overview({ filters, onFiltersChange }: OverviewProps) {
  const kpis = useMemo(() => getKpis(), []);
  const ts = useMemo(() => getTimeSeries(), []);
  const cats = useMemo(() => getCategoryData(), []);
  const regions = useMemo(() => getRegionData(), []);
  const radar = useMemo(() => getRadarData(), []);
  const funnel = useMemo(() => getFunnelData(), []);
  const heat = useMemo(() => getHeatmapData(), []);
  const geo = useMemo(() => getGeoData(), []);
  const insights = useMemo(() => getAiInsights(), []);

  const exportKpis = () => downloadFile('kpis.csv', toCsv(kpis.map((k) => ({ label: k.label, value: k.value, change: k.change }))), 'text/csv');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted mt-1">Real-time business performance across all metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportKpis}>
            <Download size={14} /> Export
          </Button>
          <Button size="sm">
            <Sparkles size={14} /> AI Summary
          </Button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Revenue vs Expenses" subtitle="Monthly trend" className="lg:col-span-2">
          <AreaChart
            data={ts}
            xKey="date"
            series={[
              { key: 'revenue', name: 'Revenue', color: '#0ea5e9' },
              { key: 'expenses', name: 'Expenses', color: '#ef4444' },
              { key: 'profit', name: 'Profit', color: '#10b981' },
            ]}
          />
        </ChartCard>
        <ChartCard title="Traffic Sources" subtitle="By region">
          <DonutChart data={regions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Orders by Month" subtitle="Units sold">
          <BarChart data={ts} xKey="date" series={[{ key: 'orders', name: 'Orders', color: '#f59e0b' }]} />
        </ChartCard>
        <ChartCard title="Performance Radar" subtitle="Current vs target">
          <RadarChart data={radar} />
        </ChartCard>
        <ChartCard title="Conversion Funnel" subtitle="Visitor journey">
          <FunnelChart data={funnel} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Category Distribution" subtitle="Revenue share">
          <DonutChart data={cats} />
        </ChartCard>
        <ChartCard title="Activity Heatmap" subtitle="Engagement by day & hour" className="lg:col-span-2">
          <Heatmap data={heat} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Goal Completion" subtitle="Quarterly target">
          <GaugeChart value={78} label="of target" />
        </ChartCard>
        <ChartCard title="Regional Performance" subtitle="Users & revenue" className="lg:col-span-2">
          <div className="space-y-3">
            {geo.map((g) => (
              <div key={g.region} className="flex items-center gap-3">
                <div className="w-32 text-sm shrink-0">{g.region}</div>
                <div className="flex-1 h-6 surface-2 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg flex items-center justify-end pr-2" style={{ width: `${g.share}%` }}>
                    <span className="text-[10px] text-white font-semibold">{g.share}%</span>
                  </div>
                </div>
                <div className="w-24 text-right text-xs text-muted">{g.users.toLocaleString()} users</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="AI Insights" subtitle="Automated analysis & recommendations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, i) => (
            <div key={i} className="surface-2 rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{ins.title}</p>
                  <Badge tone={ins.type === 'anomaly' ? 'error' : ins.type === 'forecast' ? 'info' : ins.type === 'recommendation' ? 'warning' : 'success'}>
                    {ins.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted leading-relaxed">{ins.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
