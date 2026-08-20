import { supabase } from './supabase';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'analyst'
  | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
}

export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      created_at,
      organizations (
        id,
        name,
        slug,
        logo_url,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => {
      const organization = Array.isArray(row.organizations)
        ? row.organizations[0]
        : row.organizations;

      if (!organization) return null;

      return {
        organization,
        role: row.role as OrganizationRole,
      };
    })
    .filter(
      (
        item,
      ): item is {
        organization: Organization;
        role: OrganizationRole;
      } => item !== null,
    );
}

export async function createOrganization(
  name: string,
  slug: string,
) {
  const { data, error } = await supabase.rpc(
    'create_organization',
    {
      organization_name: name,
      organization_slug: slug,
    },
  );

  if (error) {
    throw error;
  }

  return data as Organization;
}

export async function getOrganizationMembers(
  organizationId: string,
) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrganizationMember[];
}