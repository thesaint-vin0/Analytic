import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from './AuthContext';

import {
  createOrganization as createOrganizationService,
  getUserOrganizations,
  type Organization,
  type OrganizationRole,
} from '../services/organizations';

interface OrganizationWithRole {
  organization: Organization;
  role: OrganizationRole;
}

interface OrganizationContextValue {
  organizations: OrganizationWithRole[];
  currentOrganization: OrganizationWithRole | null;
  loading: boolean;
  error: string | null;

  selectOrganization: (organizationId: string) => void;

  createOrganization: (
    name: string,
    slug: string,
  ) => Promise<Organization | null>;

  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext =
  createContext<OrganizationContextValue | undefined>(
    undefined,
  );

const STORAGE_KEY = 'pulse_current_organization';

export function OrganizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<
    OrganizationWithRole[]
  >([]);

  const [currentOrganization, setCurrentOrganization] =
    useState<OrganizationWithRole | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await getUserOrganizations(user.id);

      setOrganizations(results);

      const savedId = localStorage.getItem(STORAGE_KEY);

      const savedOrganization = results.find(
        (item) => item.organization.id === savedId,
      );

      if (savedOrganization) {
        setCurrentOrganization(savedOrganization);
      } else if (results.length > 0) {
        setCurrentOrganization(results[0]);

        localStorage.setItem(
          STORAGE_KEY,
          results[0].organization.id,
        );
      } else {
        setCurrentOrganization(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error(
        'Failed to load organizations:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load organizations',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  const selectOrganization = useCallback(
    (organizationId: string) => {
      const selected = organizations.find(
        (item) =>
          item.organization.id === organizationId,
      );

      if (!selected) return;

      setCurrentOrganization(selected);

      localStorage.setItem(
        STORAGE_KEY,
        selected.organization.id,
      );
    },
    [organizations],
  );

  const createOrganization = useCallback(
    async (name: string, slug: string) => {
      try {
        setError(null);

        const organization =
          await createOrganizationService(
            name,
            slug,
          );

        await refreshOrganizations();

        localStorage.setItem(
          STORAGE_KEY,
          organization.id,
        );

        return organization;
      } catch (err) {
        console.error(
          'Failed to create organization:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create organization',
        );

        return null;
      }
    },
    [refreshOrganizations],
  );

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        loading,
        error,
        selectOrganization,
        createOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(
    OrganizationContext,
  );

  if (!context) {
    throw new Error(
      'useOrganization must be used within OrganizationProvider',
    );
  }

  return context;
}