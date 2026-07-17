import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { KpiCard } from '../components/KpiCard';
import { AreaChart } from '../components/charts/AreaChart';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { LineChart } from '../components/charts/LineChart';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getTimeSeries, getCategoryData } from '../services/mockData';
import type { Filters } from '../types/analytics';

interface SalesProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

export function Sales({ filters, onFiltersChange }: SalesProps) {
  const kpis = useMemo(() => getKpis().slice(0, 4), []);
  const ts = useMemo(() => getTimeSeries(), []);
  const cats = useMemo(() => getCategoryData(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Analytics" subtitle="Track revenue, orders, and product performance." />
      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Revenue & Profit" subtitle="Monthly" className="lg:col-span-2">
          <AreaChart data={ts} xKey="date" series={[{ key: 'revenue', name: 'Revenue', color: '#0ea5e9' }, { key: 'profit', name: 'Profit', color: '#10b981' }]} />
        </ChartCard>
        <ChartCard title="Sales by Category" subtitle="Share">
          <DonutChart data={cats} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Orders Trend" subtitle="Monthly units">
          <BarChart data={ts} xKey="date" series={[{ key: 'orders', name: 'Orders', color: '#f59e0b' }]} />
        </ChartCard>
        <ChartCard title="Visitors & Sessions" subtitle="Traffic">
          <LineChart data={ts} xKey="date" series={[{ key: 'visitors', name: 'Visitors', color: '#8b5cf6' }, { key: 'sessions', name: 'Sessions', color: '#14b8a6' }]} />
        </ChartCard>
      </div>
    </div>
  );
}
