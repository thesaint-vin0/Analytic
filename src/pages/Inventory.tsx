import { useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ChartCard } from '../components/ChartCard';
import { KpiCard } from '../components/KpiCard';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { FilterBar } from '../components/FilterBar';
import { getKpis, getCategoryData } from '../services/mockData';
import type { Filters } from '../types/analytics';

interface InventoryProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

const stockData = [
  { name: 'Electronics', stock: 4200, reorder: 800 },
  { name: 'Apparel', stock: 7800, reorder: 1500 },
  { name: 'Home', stock: 3200, reorder: 600 },
  { name: 'Beauty', stock: 5400, reorder: 900 },
  { name: 'Sports', stock: 2100, reorder: 700 },
  { name: 'Books', stock: 6100, reorder: 1000 },
];

const warehouseData = [
  { name: 'Warehouse A', value: 42, color: '#0ea5e9' },
  { name: 'Warehouse B', value: 31, color: '#10b981' },
  { name: 'Warehouse C', value: 18, color: '#f59e0b' },
  { name: 'Warehouse D', value: 9, color: '#8b5cf6' },
];

export function Inventory({ filters, onFiltersChange }: InventoryProps) {
  const kpis = useMemo(() => getKpis().slice(0, 4), []);
  const cats = useMemo(() => getCategoryData(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Analytics" subtitle="Stock levels, reorder points, and warehouse distribution." />
      <FilterBar filters={filters} onChange={onFiltersChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} metric={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Stock vs Reorder Point" subtitle="By category" className="lg:col-span-2">
          <BarChart data={stockData} xKey="name" series={[{ key: 'stock', name: 'Stock', color: '#0ea5e9' }, { key: 'reorder', name: 'Reorder', color: '#ef4444' }]} />
        </ChartCard>
        <ChartCard title="Warehouse Distribution" subtitle="Capacity share">
          <DonutChart data={warehouseData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Capacity Utilization" subtitle="Current load">
          <GaugeChart value={74} label="utilized" color="#f59e0b" />
        </ChartCard>
        <ChartCard title="Category Value" subtitle="Inventory value" className="lg:col-span-2">
          <BarChart data={cats} xKey="name" series={[{ key: 'value', name: 'Value', color: '#14b8a6' }]} layout="vertical" />
        </ChartCard>
      </div>
    </div>
  );
}
