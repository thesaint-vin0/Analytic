import type {
  KpiMetric,
  TimeSeriesPoint,
  CategoryDatum,
  TableRow,
  RadarDatum,
  ScatterDatum,
  FunnelStage,
  HeatmapCell,
  GeoRegion,
  Notification,
} from '../types/analytics';

const PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

function sparkline(base: number, points = 12): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v += rand(-base * 0.08, base * 0.08);
    out.push(Math.max(0, Math.round(v)));
  }
  return out;
}

export function getKpis(): KpiMetric[] {
  return [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 1284500,
      previousValue: 1124300,
      unit: 'currency',
      change: 14.3,
      icon: 'DollarSign',
      color: '#10b981',
      sparkline: sparkline(128000),
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: 482300,
      previousValue: 510200,
      unit: 'currency',
      change: -5.5,
      icon: 'TrendingDown',
      color: '#ef4444',
      sparkline: sparkline(48000),
    },
    {
      id: 'profit',
      label: 'Net Profit',
      value: 802200,
      previousValue: 614100,
      unit: 'currency',
      change: 30.6,
      icon: 'TrendingUp',
      color: '#0ea5e9',
      sparkline: sparkline(80000),
    },
    {
      id: 'users',
      label: 'Active Users',
      value: 48230,
      previousValue: 41200,
      unit: 'number',
      change: 17.1,
      icon: 'Users',
      color: '#8b5cf6',
      sparkline: sparkline(4800),
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: 18420,
      previousValue: 16100,
      unit: 'number',
      change: 14.4,
      icon: 'ShoppingCart',
      color: '#f59e0b',
      sparkline: sparkline(1800),
    },
    {
      id: 'traffic',
      label: 'Traffic',
      value: 312400,
      previousValue: 289000,
      unit: 'number',
      change: 8.1,
      icon: 'Activity',
      color: '#14b8a6',
      sparkline: sparkline(31000),
    },
    {
      id: 'conversions',
      label: 'Conversion Rate',
      value: 4.82,
      previousValue: 4.1,
      unit: 'percent',
      change: 17.6,
      icon: 'Target',
      color: '#ec4899',
      sparkline: sparkline(5),
    },
    {
      id: 'retention',
      label: 'Retention Rate',
      value: 78.4,
      previousValue: 72.1,
      unit: 'percent',
      change: 8.7,
      icon: 'Heart',
      color: '#f97316',
      sparkline: sparkline(78),
    },
  ];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getTimeSeries(): TimeSeriesPoint[] {
  return months.map((date, i) => {
    const base = 100000 + i * 8000;
    const revenue = Math.round(base + rand(-15000, 25000));
    const expenses = Math.round(base * 0.4 + rand(-8000, 8000));
    return {
      date,
      revenue,
      expenses,
      profit: revenue - expenses,
      users: Math.round(3000 + i * 400 + rand(-500, 800)),
      orders: Math.round(1200 + i * 90 + rand(-200, 300)),
      sessions: Math.round(8000 + i * 600 + rand(-1000, 1500)),
      visitors: Math.round(6000 + i * 500 + rand(-800, 1200)),
    };
  });
}

export function getCategoryData(): CategoryDatum[] {
  const names = ['Electronics', 'Apparel', 'Home', 'Beauty', 'Sports', 'Books'];
  return names.map((name, i) => ({
    name,
    value: randInt(15000, 95000),
    color: PALETTE[i % PALETTE.length],
  }));
}

export function getRegionData(): CategoryDatum[] {
  const names = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
  return names.map((name, i) => ({
    name,
    value: randInt(20000, 280000),
    color: PALETTE[i % PALETTE.length],
  }));
}

const statuses: TableRow['status'][] = ['active', 'pending', 'inactive', 'churned'];
const categories = ['Electronics', 'Apparel', 'Home', 'Beauty', 'Sports', 'Books'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew', 'Reese', 'Cameron', 'Skylar', 'Jamie', 'Dakota', 'Sage', 'Harper', 'Rowan', 'Emerson', 'Finley', 'Parker'];
const lastNames = ['Smith', 'Johnson', 'Lee', 'Garcia', 'Brown', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King'];

export function getTableData(count = 47): TableRow[] {
  return Array.from({ length: count }, (_, i) => {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[randInt(0, lastNames.length - 1)]}`;
    return {
      id: `row-${i + 1}`,
      name,
      category: categories[randInt(0, categories.length - 1)],
      region: regions[randInt(0, regions.length - 1)],
      status: statuses[randInt(0, statuses.length - 1)],
      revenue: randInt(1000, 95000),
      orders: randInt(1, 240),
      growth: Math.round(rand(-25, 45) * 10) / 10,
      lastActive: new Date(Date.now() - randInt(0, 30) * 86400000).toISOString().split('T')[0],
    };
  });
}

export function getRadarData(): RadarDatum[] {
  return [
    { metric: 'Acquisition', current: 82, target: 90 },
    { metric: 'Engagement', current: 71, target: 85 },
    { metric: 'Retention', current: 78, target: 80 },
    { metric: 'Revenue', current: 88, target: 92 },
    { metric: 'Support', current: 65, target: 78 },
    { metric: 'Satisfaction', current: 74, target: 85 },
  ];
}

export function getScatterData(): ScatterDatum[] {
  return Array.from({ length: 30 }, (_, i) => ({
    x: Math.round(rand(10, 100)),
    y: Math.round(rand(10, 100)),
    z: Math.round(rand(100, 1000)),
    name: `Segment ${i + 1}`,
  }));
}

export function getFunnelData(): FunnelStage[] {
  return [
    { stage: 'Visits', value: 120000 },
    { stage: 'Sign Ups', value: 48000 },
    { stage: 'Trials', value: 22000 },
    { stage: 'Purchases', value: 9800 },
    { stage: 'Renewals', value: 6200 },
  ];
}

export function getHeatmapData(): HeatmapCell[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells: HeatmapCell[] = [];
  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      const peak = hour >= 9 && hour <= 21;
      cells.push({
        day,
        hour,
        value: Math.round(rand(0, peak ? 100 : 35)),
      });
    }
  }
  return cells;
}

export function getGeoData(): GeoRegion[] {
  return [
    { region: 'North America', users: 18420, revenue: 540000, share: 42 },
    { region: 'Europe', users: 12300, revenue: 380000, share: 30 },
    { region: 'Asia Pacific', users: 9800, revenue: 210000, share: 16 },
    { region: 'Latin America', users: 4200, revenue: 89000, share: 7 },
    { region: 'Middle East', users: 2100, revenue: 45000, share: 3 },
    { region: 'Africa', users: 1430, revenue: 21000, share: 2 },
  ];
}

export function getNotifications(): Notification[] {
  return [
    { id: 'n1', title: 'Revenue milestone reached', message: 'Monthly revenue exceeded $1.2M target.', type: 'success', time: '2m ago', read: false },
    { id: 'n2', title: 'Anomaly detected', message: 'Unusual spike in traffic from APAC region.', type: 'warning', time: '18m ago', read: false },
    { id: 'n3', title: 'Conversion drop', message: 'Checkout conversion down 3.2% in last hour.', type: 'error', time: '1h ago', read: false },
    { id: 'n4', title: 'Report ready', message: 'Q3 financial report is available for download.', type: 'info', time: '3h ago', read: true },
    { id: 'n5', title: 'New integration', message: 'Google Sheets connector configured successfully.', type: 'info', time: '5h ago', read: true },
  ];
}

export function getAiInsights(): { title: string; detail: string; type: 'trend' | 'forecast' | 'anomaly' | 'recommendation' }[] {
  return [
    { title: 'Upward revenue trend', detail: 'Revenue is trending +14.3% vs last period, driven primarily by Electronics and APAC region.', type: 'trend' },
    { title: '30-day forecast', detail: 'Predicted revenue for next 30 days: $1.42M (confidence 87%). Seasonality suggests a mid-month dip.', type: 'forecast' },
    { title: 'Anomaly: traffic spike', detail: 'APAC traffic spiked 3.2x above baseline at 14:00 UTC. Investigate campaign attribution.', type: 'anomaly' },
    { title: 'Recommendation', detail: 'Reallocate 15% of marketing budget from Beauty to Electronics for projected +8% ROI lift.', type: 'recommendation' },
  ];
}
