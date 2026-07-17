# Pulse — Universal Analytics Dashboard Platform

A premium, modular, production-ready analytics dashboard that can be integrated into any application or business. Built with React, TypeScript, and Recharts, featuring 10+ chart types, real-time data, AI insights, role-based access, and a beautiful glassmorphism design with dark/light mode.

## Features

- **Main Dashboard** — Revenue, Expenses, Profit, Users, Orders, Traffic, Conversions, Retention KPIs with animated counters and sparklines
- **10+ Chart Types** — Area, Line, Bar, Donut, Radar, Scatter, Funnel, Gauge, Heatmap, Waterfall
- **6 Analytics Modules** — Sales, Financial, Marketing, Inventory, Customers, AI Insights
- **Real-time Analytics** — Live data stream with auto-refresh, live KPIs, live event feed
- **Data Explorer** — Searchable, sortable, paginated data table with column visibility, row selection, bulk actions, CSV/JSON export, print
- **Reports** — Generate, schedule, download, and share reports (daily/weekly/monthly/quarterly/yearly)
- **Integrations** — Connect Supabase, PostgreSQL, MySQL, MongoDB, Firebase, REST/GraphQL APIs, CSV/Excel/Google Sheets, Webhooks
- **Notifications** — Real-time, in-app notification center with read/unread states
- **Settings** — Profile, appearance (theme/language/timezone), notification preferences, security (2FA, session timeout), API keys
- **Authentication** — Login screen with remember me, forgot password, show/hide password
- **Design** — Apple-quality aesthetic, glassmorphism, smooth animations, responsive, dark/light mode
- **Performance** — Code splitting, lazy loading, Suspense, memoization, manual chunks for recharts & icons

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts) |
| Build | Vite with manual chunk splitting |

## Architecture

```
src/
├── components/
│   ├── charts/          # Reusable chart components (Area, Bar, Line, Donut, Radar, Scatter, Funnel, Gauge, Heatmap, Waterfall)
│   ├── layout/          # Sidebar, Topbar, Layout shell
│   └── ui/              # Primitives (Card, Button, Badge, Select, Modal)
├── config/              # Navigation config
├── context/             # Theme context (dark/light)
├── pages/               # Feature pages (Overview, Sales, Financial, Marketing, Inventory, Customers, AiInsights, Realtime, DataExplorer, Reports, Integrations, Notifications, Settings, Login)
├── services/            # Data services (mock data — replace with real API calls)
├── types/               # TypeScript types
└── utils/               # Utilities (clsx, format, download, csv)
```

### Feature-Based Architecture

Each page is a self-contained feature module. Charts are reusable components that accept generic data props, making them pluggable to any data source. The `services/mockData.ts` file simulates a backend — swap it with real API calls (Supabase, REST, GraphQL) without touching components.

## Installation

```bash
npm install
npm run dev
```

The app runs on the Vite dev server (already started in this environment).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |

## Connecting a Real Data Source

The dashboard is data-source agnostic. All data flows through the `services/` layer. To connect a real backend:

### REST API

```ts
// src/services/apiClient.ts
export async function fetchKpis(): Promise<KpiMetric[]> {
  const res = await fetch('/api/kpis');
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}
```

Then replace `getKpis()` calls in pages with `fetchKpis()`.

### Supabase

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export async function getRevenue() {
  const { data, error } = await supabase.from('revenue').select('*');
  if (error) throw error;
  return data;
}
```

### GraphQL

```ts
const query = `query { kpis { id label value change } }`;
const res = await fetch('/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
```

### CSV / Excel Import

Use the Integrations page UI, or programmatically parse with a library like `papaparse` (CSV) or `xlsx` (Excel), then feed the parsed rows into chart components.

## Adding a New Chart

1. Create `src/components/charts/MyChart.tsx`
2. Accept `data` and config props
3. Use `useChartTheme()` for theme-aware colors
4. Wrap in `<ChartCard>` when used on a page

## Creating a New Dashboard Page

1. Create `src/pages/MyPage.tsx`
2. Add navigation entry in `src/config/navigation.ts`
3. Add a case in `App.tsx`'s `renderPage()` switch
4. Use lazy loading for code splitting

## Environment Variables

See `.env.example` for all supported variables. The frontend reads `VITE_`-prefixed vars.

## Deployment

### Vercel (Frontend)

```bash
npm run build
# Deploy dist/ to Vercel
```

### Docker

```bash
docker build -t pulse-analytics .
docker run -p 8080:80 pulse-analytics
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page | Check browser console for errors; ensure fonts load |
| Charts not rendering | Verify data shape matches chart component props |
| Dark mode not persisting | Theme is stored in localStorage under `theme` key |
| Large bundle | recharts & icons are lazy-loaded; only loaded when needed |

## License

MIT
