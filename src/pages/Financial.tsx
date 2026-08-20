import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { KpiCard } from '../components/KpiCard';
import { AreaChart } from '../components/charts/AreaChart';
import { BarChart } from '../components/charts/BarChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { Waterfall } from '../components/charts/Waterfall';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getTimeSeries } from '../services/mockData';
import type { Filters } from '../types/analytics';

interface FinancialProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

const waterfallData = [
  { name: 'Revenue', value: 1284500 },
  { name: 'COGS', value: -412000 },
  { name: 'Gross Profit', value: 872500, running: true },
  { name: 'OpEx', value: -182300 },
  { name: 'EBITDA', value: 690200, running: true },
  { name: 'Tax', value: -138040 },
  { name: 'Net Income', value: 552160, running: true },
];

export function Financial({ filters, onFiltersChange }: FinancialProps) {
  const kpis = useMemo(() => getKpis().slice(0, 4), []);
  const ts = useMemo(() => getTimeSeries(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Analytics" subtitle="P&L, cash flow, and financial health metrics." />
      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="P&L Waterfall" subtitle="Income statement" className="lg:col-span-2">
          <Waterfall data={waterfallData} />
        </ChartCard>
        <ChartCard title="Profit Margin" subtitle="Operating health">
          <GaugeChart value={62} label="margin" color="#10b981" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue vs Expenses" subtitle="Monthly">
          <AreaChart data={ts} xKey="date" series={[{ key: 'revenue', name: 'Revenue', color: '#0ea5e9' }, { key: 'expenses', name: 'Expenses', color: '#ef4444' }]} />
        </ChartCard>
        <ChartCard title="Net Profit" subtitle="Monthly">
          <BarChart data={ts} xKey="date" series={[{ key: 'profit', name: 'Profit', color: '#10b981' }]} />
        </ChartCard>
      </div>
    </div>
  );
}
