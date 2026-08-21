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
  import('./pages/Overview').then((m) => ({
    default: m.Overview,
  }))
);

const Realtime = lazy(() =>
  import('./pages/Realtime').then((m) => ({
    default: m.Realtime,
  }))
);

const Sales = lazy(() =>
  import('./pages/Sales').then((m) => ({
    default: m.Sales,
  }))
);

const Financial = lazy(() =>
  import('./pages/Financial').then((m) => ({
    default: m.Financial,
  }))
);

const Marketing = lazy(() =>
  import('./pages/Marketing').then((m) => ({
    default: m.Marketing,
  }))
);

const Inventory = lazy(() =>
  import('./pages/Inventory').then((m) => ({
    default: m.Inventory,
  }))
);

const Customers = lazy(() =>
  import('./pages/Customers').then((m) => ({
    default: m.Customers,
  }))
);

const AiInsights = lazy(() =>
  import('./pages/AiInsights').then((m) => ({
    default: m.AiInsights,
  }))
);

const DataExplorer = lazy(() =>
  import('./pages/DataExplorer').then((m) => ({
    default: m.DataExplorer,
  }))
);

const Reports = lazy(() =>
  import('./pages/Reports').then((m) => ({
    default: m.Reports,
  }))
);

const Integrations = lazy(() =>
  import('./pages/Integrations').then((m) => ({
    default: m.Integrations,
  }))
);

const Notifications = lazy(() =>
  import('./pages/Notifications').then((m) => ({
    default: m.Notifications,
  }))
);

const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({
    default: m.Settings,
  }))
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
  const { profile, user, loading } = useAuth();

  const {
    currentOrganization,
    organizations,
    loading: organizationLoading,
    error: organizationError,
    createOrganization,
    refreshOrganizations,
  } = useOrganization();

  const [page, setPage] = useState('overview');

  const [filters, setFilters] =
    useState<Filters>(defaultFilters);

  const [creatingOrganization, setCreatingOrganization] =
    useState(false);

  const [organizationSetupError, setOrganizationSetupError] =
    useState<string | null>(null);

  /*
   * Seed notifications after the authenticated
   * user's profile has loaded.
   */
  useEffect(() => {
    if (profile) {
      void seedNotificationsIfEmpty(profile.id);
    }
  }, [profile]);

  /*
   * Automatically create an organization when the
   * authenticated user does not belong to one.
   */
  useEffect(() => {
    if (
      loading ||
      organizationLoading ||
      !user ||
      organizations.length > 0 ||
      currentOrganization ||
      creatingOrganization
    ) {
      return;
    }

    let cancelled = false;

    const setupOrganization = async () => {
      setCreatingOrganization(true);
      setOrganizationSetupError(null);

      try {
        /*
         * Get the user's name from the profile,
         * metadata, or email.
         */
        const fullName =
          profile?.full_name?.trim() ||
          user.user_metadata?.full_name?.trim() ||
          user.email?.split('@')[0] ||
          'My Organization';

        const organizationName =
          `${fullName}'s Organization`;

        /*
         * Create a URL-safe unique slug.
         */
        const baseSlug = fullName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 40);

        const organizationSlug =
          `${baseSlug || 'organization'}-${user.id.slice(0, 8)}`;

        const organization =
          await createOrganization(
            organizationName,
            organizationSlug
          );

        if (!organization) {
          throw new Error(
            'Unable to create your organization.'
          );
        }

        /*
         * Reload organizations so the newly created
         * organization becomes currentOrganization.
         */
        if (!cancelled) {
          await refreshOrganizations();
        }
      } catch (error) {
        console.error(
          'Automatic organization setup failed:',
          error
        );

        if (!cancelled) {
          setOrganizationSetupError(
            error instanceof Error
              ? error.message
              : 'Unable to create your organization.'
          );
        }
      } finally {
        if (!cancelled) {
          setCreatingOrganization(false);
        }
      }
    };

    void setupOrganization();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    organizationLoading,
    user,
    profile,
    organizations.length,
    currentOrganization,
    creatingOrganization,
    createOrganization,
    refreshOrganizations,
  ]);

  /*
   * Authentication/profile loading.
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
   * Organization loading.
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
   * Creating first organization.
   */
  if (creatingOrganization) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg">
        <Loader2
          size={28}
          className="animate-spin text-primary mb-3"
        />

        <h2 className="text-lg font-semibold mb-2">
          Setting up your organization
        </h2>

        <p className="text-sm text-muted">
          Preparing your Pulse Analytics workspace...
        </p>
      </div>
    );
  }

  /*
   * Organization setup/loading error.
   */
  if (organizationError || organizationSetupError) {
    const errorMessage =
      organizationSetupError || organizationError;

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
            Unable to set up organization
          </h2>

          <p className="text-sm text-muted mb-4">
            We could not prepare the organization
            associated with your account.
          </p>

          <p className="text-xs text-error break-words">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  /*
   * This should only be temporary while organization
   * creation/refresh is completing.
   */
  if (
    !currentOrganization &&
    organizations.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg">
        <Loader2
          size={28}
          className="animate-spin text-primary mb-3"
        />

        <p className="text-sm text-muted">
          Finalizing your workspace...
        </p>
      </div>
    );
  }

  /*
   * Suspense wrapper for lazy-loaded pages.
   */
  const withSuspense = (
    node: React.ReactNode
  ) => (
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

  /*
   * Render active dashboard page.
   */
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
        return withSuspense(
          <Realtime />
        );

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
        return withSuspense(
          <AiInsights />
        );

      case 'data':
        return withSuspense(
          <DataExplorer />
        );

      case 'reports':
        return withSuspense(
          <Reports />
        );

      case 'integrations':
        return withSuspense(
          <Integrations />
        );

      case 'notifications':
        return withSuspense(
          <Notifications />
        );

      case 'settings':
        return withSuspense(
          <Settings />
        );

      case 'users':
        return withSuspense(
          <UserManagement />
        );

      default:
        return withSuspense(
          <Overview
            filters={filters}
            onFiltersChange={setFilters}
          />
        );
    }
  };

  /*
   * IMPORTANT:
   *
   * Use the organization membership role first.
   *
   * Example:
   * currentOrganization.role = "owner"
   *
   * This prevents the profile role "viewer" from
   * incorrectly overriding the organization role.
   */
  const requiredPermission =
    PAGE_PERMISSIONS[page];

  const effectiveRole =
    currentOrganization?.role ??
    profile?.role ??
    'viewer';

  const canAccess =
    !requiredPermission ||
    hasPermission(
      effectiveRole as never,
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
            {ROLE_LABELS[
              effectiveRole as keyof typeof ROLE_LABELS
            ] ?? effectiveRole}
            ) does not have permission to view this page.
            Contact your administrator to request access.
          </p>
        </div>
      )}
    </Layout>
  );
}

function AppInner() {
  const {
    session,
    loading,
  } = useAuth();

  /*
   * Wait for Supabase authentication state.
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
   * No authenticated session -> Login.
   */
  if (!session) {
    return <Login />;
  }

  /*
   * Authenticated -> Dashboard.
   */
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