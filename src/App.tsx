import { lazy, Suspense, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import type { Filters } from './types/analytics';

const Overview = lazy(() => import('./pages/Overview').then((m) => ({ default: m.Overview })));
const Realtime = lazy(() => import('./pages/Realtime').then((m) => ({ default: m.Realtime })));
const Sales = lazy(() => import('./pages/Sales').then((m) => ({ default: m.Sales })));
const Financial = lazy(() => import('./pages/Financial').then((m) => ({ default: m.Financial })));
const Marketing = lazy(() => import('./pages/Marketing').then((m) => ({ default: m.Marketing })));
const Inventory = lazy(() => import('./pages/Inventory').then((m) => ({ default: m.Inventory })));
const Customers = lazy(() => import('./pages/Customers').then((m) => ({ default: m.Customers })));
const AiInsights = lazy(() => import('./pages/AiInsights').then((m) => ({ default: m.AiInsights })));
const DataExplorer = lazy(() => import('./pages/DataExplorer').then((m) => ({ default: m.DataExplorer })));
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));
const Integrations = lazy(() => import('./pages/Integrations').then((m) => ({ default: m.Integrations })));
const Notifications = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.Notifications })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const defaultFilters: Filters = {
  range: 'year',
  category: 'all',
  region: 'all',
  status: 'all',
};

function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState('overview');
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  if (!authed) {
    return (
      <ThemeProvider>
        <Login onLogin={() => setAuthed(true)} />
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    const withSuspense = (node: React.ReactNode) => (
      <Suspense fallback={<div className="flex items-center justify-center py-24 text-sm text-muted">Loading...</div>}>{node}</Suspense>
    );
    switch (page) {
      case 'overview':
        return withSuspense(<Overview filters={filters} onFiltersChange={setFilters} />);
      case 'realtime':
        return withSuspense(<Realtime />);
      case 'sales':
        return withSuspense(<Sales filters={filters} onFiltersChange={setFilters} />);
      case 'financial':
        return withSuspense(<Financial filters={filters} onFiltersChange={setFilters} />);
      case 'marketing':
        return withSuspense(<Marketing filters={filters} onFiltersChange={setFilters} />);
      case 'inventory':
        return withSuspense(<Inventory filters={filters} onFiltersChange={setFilters} />);
      case 'customers':
        return withSuspense(<Customers filters={filters} onFiltersChange={setFilters} />);
      case 'ai':
        return withSuspense(<AiInsights />);
      case 'data':
        return withSuspense(<DataExplorer />);
      case 'reports':
        return withSuspense(<Reports />);
      case 'integrations':
        return withSuspense(<Integrations />);
      case 'notifications':
        return withSuspense(<Notifications />);
      case 'settings':
        return withSuspense(<Settings />);
      default:
        return withSuspense(<Overview filters={filters} onFiltersChange={setFilters} />);
    }
  };

  return (
    <ThemeProvider>
      <Layout active={page} onNavigate={setPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
