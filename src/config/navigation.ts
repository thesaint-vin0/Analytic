import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Megaphone,
  Package,
  Users,
  Table2,
  FileBarChart,
  Plug,
  Bell,
  Settings,
  Bot,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  permission: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Dashboard', permission: 'view_dashboard' },
  { id: 'realtime', label: 'Real-time', icon: Activity, group: 'Dashboard', permission: 'view_realtime' },
  { id: 'sales', label: 'Sales', icon: TrendingUp, group: 'Analytics', permission: 'view_sales' },
  { id: 'financial', label: 'Financial', icon: Wallet, group: 'Analytics', permission: 'view_financial' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, group: 'Analytics', permission: 'view_marketing' },
  { id: 'inventory', label: 'Inventory', icon: Package, group: 'Analytics', permission: 'view_inventory' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'Analytics', permission: 'view_customers' },
  { id: 'ai', label: 'AI Insights', icon: Bot, group: 'Analytics', permission: 'view_ai' },
  { id: 'data', label: 'Data Explorer', icon: Table2, group: 'Data', permission: 'view_data_explorer' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Data', permission: 'view_reports' },
  { id: 'integrations', label: 'Integrations', icon: Plug, group: 'Data', permission: 'manage_integrations' },
  { id: 'users', label: 'User Management', icon: ShieldCheck, group: 'System', permission: 'manage_users' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'System', permission: 'view_notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System', permission: 'edit_settings' },
];
