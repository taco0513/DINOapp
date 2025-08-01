import { ReactNode } from 'react';
// Page icon names
export type PageIconName = 

  | 'Dashboard'
  | 'Trips'
  | 'Schengen'
  | 'Calendar'
  | 'Gmail'
  | 'Analytics'
  | 'Monitoring'
  | 'AI'
  | 'Settings'
  | 'Profile'
  | 'Bell'
  | 'Globe'
  | 'Shield'
  | 'AlertTriangle'
  | 'MapPin';

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Page header props
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode | PageIconName;
  showBackButton?: boolean;
  action?: ReactNode;
  className?: string;
  showHelp?: boolean;
  onHelpClick?: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

// Standard page layout props
export interface StandardPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: PageIconName;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: ReactNode;
  className?: string;
}

// Standard card props
export interface StandardCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  titleIcon?: string;
  action?: ReactNode;
}

// Stats card props
export interface StatsCardProps {
  value: string | number;
  label: string;
  color?: 'blue' | 'green' | 'purple' | 'emerald' | 'red' | 'yellow' | 'orange';
  className?: string;
  icon?: ReactNode;
}

// Empty state props
export interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// Loading card props
export interface LoadingCardProps {
  rows?: number;
  children?: ReactNode;
  className?: string;
}