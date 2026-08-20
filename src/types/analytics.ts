export interface KpiMetric {
  [key: string]: unknown;
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: 'currency' | 'number' | 'percent';
  change: number;
  icon: string;
  color: string;
  sparkline: number[];
}

export interface TimeSeriesPoint {
  [key: string]: unknown;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  users: number;
  orders: number;
  sessions: number;
  visitors: number;
}

export interface CategoryDatum {
  [key: string]: unknown;
  name: string;
  value: number;
  color?: string;
}

export interface TableRow {
  [key: string]: unknown;
  id: string;
  name: string;
  category: string;
  region: string;
  status: 'active' | 'pending' | 'inactive' | 'churned';
  revenue: number;
  orders: number;
  growth: number;
  lastActive: string;
}

export interface RadarDatum {
  [key: string]: unknown;
  metric: string;
  current: number;
  target: number;
}

export interface ScatterDatum {
  [key: string]: unknown;
  x: number;
  y: number;
  z: number;
  name: string;
}

export interface FunnelStage {
  [key: string]: unknown;
  stage: string;
  value: number;
}

export interface HeatmapCell {
  [key: string]: unknown;
  day: string;
  hour: number;
  value: number;
}

export interface GeoRegion {
  [key: string]: unknown;
  region: string;
  users: number;
  revenue: number;
  share: number;
}

export interface Notification {
  [key: string]: unknown;
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  time: string;
  read: boolean;
}

export type DateRange =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export interface Filters {
  range: DateRange;
  category: string;
  region: string;
  status: string;
}
