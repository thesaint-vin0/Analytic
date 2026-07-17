import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { KpiCard } from '../components/KpiCard';
import { RadarChart } from '../components/charts/RadarChart';
import { ScatterChart } from '../components/charts/ScatterChart';
import { DonutChart } from '../components/charts/DonutChart';
import { LineChart } from '../components/charts/LineChart';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getRadarData, getScatterData, getTimeSeries } from '../services/mockData';
import type { Filters } from '../types/analytics';

interface CustomersProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

const segmentData = [
  { name: 'Enterprise', value: 32, color: '#0ea5e9' },
  { name: 'SMB', value: 41, color: '#10b981' },
  { name: 'Startup', value: 18, color: '#f59e0b' },
  { name: 'Individual', value: 9, color: '#8b5cf6' },
];

export function Customers({ filters, onFiltersChange }: CustomersProps) {
  const kpis = useMemo(() => getKpis().slice(4, 8), []);
  const radar = useMemo(() => getRadarData(), []);
  const scatter = useMemo(() => getScatterData(), []);
  const ts = useMemo(() => getTimeSeries(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Analytics" subtitle="Segments, retention, and customer health." />
      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Customer Health" subtitle="Scorecard vs target">
          <RadarChart data={radar} />
        </ChartCard>
        <ChartCard title="Segment Distribution" subtitle="By plan type">
          <DonutChart data={segmentData} />
        </ChartCard>
        <ChartCard title="Efficiency vs Revenue" subtitle="Segment scatter">
          <ScatterChart data={scatter} />
        </ChartCard>
      </div>

      <ChartCard title="Active Users Trend" subtitle="Monthly">
        <LineChart data={ts} xKey="date" series={[{ key: 'users', name: 'Users', color: '#8b5cf6' }]} />
      </ChartCard>
    </div>
  );
}
