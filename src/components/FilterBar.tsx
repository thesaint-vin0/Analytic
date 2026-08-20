import { Calendar, Filter } from 'lucide-react';
import { Select } from './ui/Select';
import type { Filters, DateRange } from '../types/analytics';

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const rangeOptions: { label: string; value: DateRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
];

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Apparel', value: 'apparel' },
  { label: 'Home', value: 'home' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Sports', value: 'sports' },
];

const regionOptions = [
  { label: 'All Regions', value: 'all' },
  { label: 'North America', value: 'na' },
  { label: 'Europe', value: 'eu' },
  { label: 'Asia Pacific', value: 'apac' },
  { label: 'Latin America', value: 'latam' },
];

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Churned', value: 'churned' },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="surface rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted mr-2">
        <Filter size={16} /> Filters
      </div>
      <div className="relative">
        <label className="text-xs text-muted block mb-1">Date Range</label>
        <div className="relative">
          <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            value={filters.range}
            onChange={(e) => onChange({ ...filters, range: e.target.value as DateRange })}
            className="surface-2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {rangeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Select
        label="Category"
        value={filters.category}
        onChange={(v) => onChange({ ...filters, category: v })}
        options={categoryOptions}
      />
      <Select
        label="Region"
        value={filters.region}
        onChange={(v) => onChange({ ...filters, region: v })}
        options={regionOptions}
      />
      <Select
        label="Status"
        value={filters.status}
        onChange={(v) => onChange({ ...filters, status: v })}
        options={statusOptions}
      />
      {filters.range === 'custom' && (
        <div className="flex gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">From</span>
            <input type="date" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">To</span>
            <input type="date" className="surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
          </label>
        </div>
      )}
    </div>
  );
}
