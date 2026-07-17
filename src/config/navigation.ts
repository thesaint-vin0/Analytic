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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Dashboard' },
  { id: 'realtime', label: 'Real-time', icon: Activity, group: 'Dashboard' },
  { id: 'sales', label: 'Sales', icon: TrendingUp, group: 'Analytics' },
  { id: 'financial', label: 'Financial', icon: Wallet, group: 'Analytics' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, group: 'Analytics' },
  { id: 'inventory', label: 'Inventory', icon: Package, group: 'Analytics' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'Analytics' },
  { id: 'ai', label: 'AI Insights', icon: Bot, group: 'Analytics' },
  { id: 'data', label: 'Data Explorer', icon: Table2, group: 'Data' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Data' },
  { id: 'integrations', label: 'Integrations', icon: Plug, group: 'Data' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'System' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System' },
];
