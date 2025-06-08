import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  BarChart3,
  Settings,
  Utensils,
  Car,
  Bolt,
  Ticket,
  HeartPulse,
  ShoppingCart,
  Home,
  BookOpen,
  Smile,
  Gift,
  Plane,
  HelpCircle,
  Tags
} from 'lucide-react';

export const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  // { href: '/settings', label: 'Settings', icon: Settings }, // Future page
];

export interface CategoryIconMap {
  [key: string]: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconMap = {
  Food: Utensils,
  Transport: Car,
  Utilities: Bolt,
  Entertainment: Ticket,
  Health: HeartPulse,
  Shopping: ShoppingCart,
  Housing: Home,
  Education: BookOpen,
  'Personal Care': Smile,
  'Gifts & Donations': Gift,
  Travel: Plane,
  Other: HelpCircle,
  Uncategorized: Tags,
};

export const APP_NAME = "PennyWise";
