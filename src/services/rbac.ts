import type { Role } from '../services/supabase';

export type Permission =
  | 'view_dashboard'
  | 'view_realtime'
  | 'view_sales'
  | 'view_financial'
  | 'view_marketing'
  | 'view_inventory'
  | 'view_customers'
  | 'view_ai'
  | 'view_data_explorer'
  | 'view_reports'
  | 'manage_integrations'
  | 'view_notifications'
  | 'edit_settings'
  | 'manage_users'
  | 'view_audit_logs';

const ALL_PERMISSIONS: Permission[] = [
  'view_dashboard',
  'view_realtime',
  'view_sales',
  'view_financial',
  'view_marketing',
  'view_inventory',
  'view_customers',
  'view_ai',
  'view_data_explorer',
  'view_reports',
  'manage_integrations',
  'view_notifications',
  'edit_settings',
  'manage_users',
  'view_audit_logs',
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: [
    'view_dashboard',
    'view_realtime',
    'view_sales',
    'view_financial',
    'view_marketing',
    'view_inventory',
    'view_customers',
    'view_ai',
    'view_data_explorer',
    'view_reports',
    'manage_integrations',
    'view_notifications',
    'edit_settings',
    'manage_users',
  ],
  manager: [
    'view_dashboard',
    'view_realtime',
    'view_sales',
    'view_marketing',
    'view_inventory',
    'view_customers',
    'view_ai',
    'view_data_explorer',
    'view_reports',
    'view_notifications',
    'edit_settings',
  ],
  analyst: [
    'view_dashboard',
    'view_realtime',
    'view_sales',
    'view_financial',
    'view_marketing',
    'view_inventory',
    'view_customers',
    'view_ai',
    'view_data_explorer',
    'view_reports',
    'view_notifications',
    'edit_settings',
  ],
  viewer: [
    'view_dashboard',
    'view_sales',
    'view_inventory',
    'view_customers',
    'view_reports',
    'view_notifications',
    'edit_settings',
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: 'Full access including user management and audit logs.',
  admin: 'Full dashboard access including user management.',
  manager: 'Manage operations, sales, marketing, and inventory.',
  analyst: 'View and analyze all analytics data and reports.',
  viewer: 'Read-only access to core dashboards and reports.',
};

export const ALL_ROLES: Role[] = ['super_admin', 'admin', 'manager', 'analyst', 'viewer'];

export const PAGE_PERMISSIONS: Record<string, Permission> = {
  overview: 'view_dashboard',
  realtime: 'view_realtime',
  sales: 'view_sales',
  financial: 'view_financial',
  marketing: 'view_marketing',
  inventory: 'view_inventory',
  customers: 'view_customers',
  ai: 'view_ai',
  data: 'view_data_explorer',
  reports: 'view_reports',
  integrations: 'manage_integrations',
  notifications: 'view_notifications',
  settings: 'edit_settings',
  users: 'manage_users',
};
