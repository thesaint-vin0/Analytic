import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { KpiCard } from '../components/KpiCard';
import { AreaChart } from '../components/charts/AreaChart';
import { FunnelChart } from '../components/charts/FunnelChart';
import { DonutChart } from '../components/charts/DonutChart';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getTimeSeries, getFunnelData, getCategoryData } from '../services/mockData';
import type { Filters } from '../types/analytics';

interface MarketingProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

const channelData = [
  { name: 'Organic', value: 42, color: '#10b981' },
  { name: 'Paid', value: 28, color: '#0ea5e9' },
  { name: 'Social', value: 18, color: '#8b5cf6' },
  { name: 'Referral', value: 12, color: '#f59e0b' },
];

export function Marketing({ filters, onFiltersChange }: MarketingProps) {
  const kpis = useMemo(() => getKpis().slice(4, 8), []);
  const ts = useMemo(() => getTimeSeries(), []);
  const funnel = useMemo(() => getFunnelData(), []);
  const cats = useMemo(() => getCategoryData(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing Analytics" subtitle="Campaign performance, channels, and conversion." />
      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Traffic & Sessions" subtitle="Monthly" className="lg:col-span-2">
          <AreaChart data={ts} xKey="date" series={[{ key: 'visitors', name: 'Visitors', color: '#8b5cf6' }, { key: 'sessions', name: 'Sessions', color: '#14b8a6' }]} />
        </ChartCard>
        <ChartCard title="Channel Mix" subtitle="Acquisition source">
          <DonutChart data={channelData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Conversion Funnel" subtitle="Visitor to renewal">
          <FunnelChart data={funnel} />
        </ChartCard>
        <ChartCard title="Campaign by Category" subtitle="Revenue share">
          <DonutChart data={cats} />
        </ChartCard>
      </div>
    </div>
  );
}
