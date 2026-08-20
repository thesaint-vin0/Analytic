import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  OrganizationProvider,
  useOrganization,
} from './context/OrganizationContext';

import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';

import {
  hasPermission,
  PAGE_PERMISSIONS,
  ROLE_LABELS,
} from './services/rbac';

import { seedNotificationsIfEmpty } from './services/notifications';

import type { Filters } from './types/analytics';

const Overview = lazy(() =>
  import('./pages/Overview').then((m) => ({ default: m.Overview }))
);

const Realtime = lazy(() =>
  import('./pages/Realtime').then((m) => ({ default: m.Realtime }))
);

const Sales = lazy(() =>
  import('./pages/Sales').then((m) => ({ default: m.Sales }))
);

const Financial = lazy(() =>
  import('./pages/Financial').then((m) => ({ default: m.Financial }))
);

const Marketing = lazy(() =>
  import('./pages/Marketing').then((m) => ({ default: m.Marketing }))
);

const Inventory = lazy(() =>
  import('./pages/Inventory').then((m) => ({ default: m.Inventory }))
);

const Customers = lazy(() =>
  import('./pages/Customers').then((m) => ({ default: m.Customers }))
);

const AiInsights = lazy(() =>
  import('./pages/AiInsights').then((m) => ({ default: m.AiInsights }))
);

const DataExplorer = lazy(() =>
  import('./pages/DataExplorer').then((m) => ({ default: m.DataExplorer }))
);

const Reports = lazy(() =>
  import('./pages/Reports').then((m) => ({ default: m.Reports }))
);

const Integrations = lazy(() =>
  import('./pages/Integrations').then((m) => ({ default: m.Integrations }))
);

const Notifications = lazy(() =>
  import('./pages/Notifications').then((m) => ({ default: m.Notifications }))
);

const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings }))
);

const UserManagement = lazy(() =>
  import('./pages/UserManagement').then((m) => ({
    default: m.UserManagement,
  }))
);

const defaultFilters: Filters = {
  range: 'year',
  category: 'all',
  region: 'all',
  status: 'all',
};

function Dashboard() {
  const { profile, loading } = useAuth();

  const {
    currentOrganization,
    organizations,
    loading: organizationLoading,
    error: organizationError,
    
  } = useOrganization();

  const [page, setPage] = useState('overview');

  const [filters, setFilters] = useState<Filters>(defaultFilters);

  useEffect(() => {
    if (profile) {
      seedNotificationsIfEmpty(profile.id);
    }
  }, [profile]);

  /*
   * Wait for authentication/profile loading.
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <Loader2
          size={28}
          className="animate-spin text-primary"
        />
      </div>
    );
  }

  /*
   * Wait for organization loading.
   */
  if (organizationLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg">
        <Loader2
          size={28}
          className="animate-spin text-primary mb-3"
        />

        <p className="text-sm text-muted">
          Loading your organization...
        </p>
      </div>
    );
  }

  /*
   * Organization loading failed.
   */
  if (organizationError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Lock
              size={28}
              className="text-error"
            />
          </div>

          <h2 className="text-lg font-semibold mb-2">
            Unable to load organization
          </h2>

          <p className="text-sm text-muted mb-4">
            We could not load the organization associated with your
            account.
          </p>

          <p className="text-xs text-error break-words">
            {organizationError}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Authenticated user has no organization.
   */
  if (!currentOrganization && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock
              size={28}
              className="text-primary"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            No organization found
          </h2>

          <p className="text-sm text-muted mb-6">
            Your account is not currently associated with an
            organization. Please contact your administrator or create
            an organization to continue.
          </p>
        </div>
      </div>
    );
  }

  const withSuspense = (node: React.ReactNode) => (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2
            size={20}
            className="animate-spin text-primary"
          />
        </div>
      }
    >
      {node}
    </Suspense>
  );

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return withSuspense(
          <Overview
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

      case 'realtime':
        return withSuspense(<Realtime />);

      case 'sales':
        return withSuspense(
          <Sales
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

      case 'financial':
        return withSuspense(
          <Financial
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

      case 'marketing':
        return withSuspense(
          <Marketing
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

      case 'inventory':
        return withSuspense(
          <Inventory
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

      case 'customers':
        return withSuspense(
          <Customers
            filters={filters}
            onFiltersChange={setFilters}
          />
        );

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

      case 'users':
        return withSuspense(<UserManagement />);

      default:
        return withSuspense(
          <Overview
            filters={filters}
            onFiltersChange={setFilters}
          />
        );
    }
  };

  const requiredPermission = PAGE_PERMISSIONS[page];

  const canAccess =
    !requiredPermission ||
    hasPermission(
      profile?.role,
      requiredPermission as never
    );

  return (
    <Layout
      active={page}
      onNavigate={setPage}
    >
      {canAccess ? (
        renderPage()
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <Lock
              size={28}
              className="text-error"
            />
          </div>

          <h2 className="text-lg font-semibold mb-1">
            Access Denied
          </h2>

          <p className="text-sm text-muted max-w-sm">
            Your role (
            {ROLE_LABELS[profile?.role ?? 'viewer']}
            ) does not have permission to view this page.
            Contact your administrator to request access.
          </p>
        </div>
      )}
    </Layout>
  );
}

function AppInner() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <Loader2
          size={28}
          className="animate-spin text-primary"
        />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <AppInner />
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}