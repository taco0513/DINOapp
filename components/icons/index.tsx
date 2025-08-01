'use client'

import { ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronRight,
  ChevronDown,
  Clock,
  Globe,
  HelpCircle,
  Home,
  Mail,
  MapPin,
  Plane,
  Settings,
  Shield,
  Smartphone,
  TrendingUp,
  User,
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  Menu,
  FileText,
  BarChart,
  Monitor,
  Cpu,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Lock,
  MessageSquare,
  Star,
  Trash2,
  Edit2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Save,
  Copy,
  ExternalLink,
  type LucideIcon } from 'lucide-react'
// TODO: Remove unused logger import
import { ReactNode } from 'react'

// Type for icon names
export type IconName = 
  // Navigation
  | 'arrow-left' | 'arrow-right' | 'chevron-right' | 'chevron-down' | 'menu' | 'external-link'
  // Actions
  | 'plus' | 'edit' | 'trash' | 'save' | 'copy' | 'download' | 'upload' | 'refresh' | 'search' | 'filter'
  // Status
  | 'check' | 'x' | 'check-circle' | 'x-circle' | 'alert-circle' | 'alert-triangle' | 'info' | 'loader'
  // Features
  | 'home' | 'plane' | 'calendar' | 'mail' | 'map-pin' | 'globe' | 'settings' | 'user' | 'bell'
  | 'shield' | 'smartphone' | 'trending-up' | 'clock' | 'help-circle' | 'file-text' | 'bar-chart'
  | 'monitor' | 'cpu' | 'zap' | 'lock' | 'message-square' | 'star'
  // App-specific (emoji fallbacks)
  | 'schengen' | 'visa' | 'tips' | 'robot' | 'world' | 'celebrate' | 'dino'

// Icon mapping
const iconMap: Record<IconName, LucideIcon | string> = {
  // Navigation
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'menu': Menu,
  'external-link': ExternalLink,
  
  // Actions
  'plus': Plus,
  'edit': Edit2,
  'trash': Trash2,
  'save': Save,
  'copy': Copy,
  'download': Download,
  'upload': Upload,
  'refresh': RefreshCw,
  'search': Search,
  'filter': Filter,
  
  // Status
  'check': Check,
  'x': X,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'info': Info,
  'loader': Loader2,
  
  // Features
  'home': Home,
  'plane': Plane,
  'calendar': Calendar,
  'mail': Mail,
  'map-pin': MapPin,
  'globe': Globe,
  'settings': Settings,
  'user': User,
  'bell': Bell,
  'shield': Shield,
  'smartphone': Smartphone,
  'trending-up': TrendingUp,
  'clock': Clock,
  'help-circle': HelpCircle,
  'file-text': FileText,
  'bar-chart': BarChart,
  'monitor': Monitor,
  'cpu': Cpu,
  'zap': Zap,
  'lock': Lock,
  'message-square': MessageSquare,
  'star': Star,
  
  // App-specific (emoji fallbacks for now, can be replaced with custom SVGs later)
  'schengen': '🇪🇺',
  'visa': '📋',
  'tips': '💡',
  'robot': '🤖',
  'world': '🌍',
  'celebrate': '🎉',
  'dino': '🦕'
}

// Icon component props
export interface IconProps {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: string
  strokeWidth?: number
}

// Size mapping
const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
}

// Unified Icon component
export function Icon({ 
  name, 
  size = 'md', 
  className = '', 
  color,
  strokeWidth = 2 
}: IconProps) {
  const icon = iconMap[name]
  
  if (!icon) {
    // Icon not found - fail silently in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Icon not found:', name);
    }
    return null
  }
  
  // Handle emoji icons
  if (typeof icon === 'string') {
    const sizeClass = size === 'xs' ? 'text-sm' : 
                     size === 'sm' ? 'text-base' : 
                     size === 'md' ? 'text-lg' : 
                     size === 'lg' ? 'text-xl' : 
                     'text-2xl'
                     
    return (
      <span 
        className={`inline-flex items-center justify-center ${sizeClass} ${className}`}
        style={{ color }}
      >
        {icon}
      </span>
    )
  }
  
  // Handle Lucide icons
  const LucideIcon = icon
  return (
    <LucideIcon 
      className={`${sizeMap[size]} ${className}`}
      style={{ color }}
      strokeWidth={strokeWidth}
    />
  )
}

// Icon with background wrapper (for page headers, cards, etc.)
export interface IconWrapperProps {
  icon: IconName | ReactNode
  backgroundColor?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const wrapperSizeMap = {
  sm: { wrapper: '1.5rem', icon: 'sm' as const },
  md: { wrapper: '2rem', icon: 'md' as const },
  lg: { wrapper: '3rem', icon: 'lg' as const }
}

export function IconWrapper({ 
  icon, 
  backgroundColor = 'var(--color-primary-light)',
  size = 'md',
  className = ''
}: IconWrapperProps) {
  const { wrapper, icon: iconSize } = wrapperSizeMap[size]
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ 
        width: wrapper, 
        height: wrapper, 
        backgroundColor,
        borderRadius: 'var(--radius)',
      }}
    >
      {typeof icon === 'string' ? (
        <Icon name={icon as IconName} size={iconSize} />
      ) : (
        icon
      )}
    </div>
  )
}

// Page icon presets with consistent styling
export const PageIconPresets = {
  Dashboard: <IconWrapper icon="home" backgroundColor="hsl(217 91% 95%)" />,
  Trips: <IconWrapper icon="plane" backgroundColor="hsl(142 76% 95%)" />,
  Schengen: <IconWrapper icon="schengen" backgroundColor="hsl(270 91% 95%)" />,
  Calendar: <IconWrapper icon="calendar" backgroundColor="hsl(38 92% 95%)" />,
  Gmail: <IconWrapper icon="mail" backgroundColor="hsl(0 84% 95%)" />,
  Analytics: <IconWrapper icon="bar-chart" backgroundColor="hsl(240 91% 95%)" />,
  Monitoring: <IconWrapper icon="monitor" backgroundColor="hsl(48 92% 95%)" />,
  AI: <IconWrapper icon="robot" backgroundColor="hsl(270 91% 95%)" />,
  Settings: <IconWrapper icon="settings" backgroundColor="var(--color-background)" />,
  Profile: <IconWrapper icon="user" backgroundColor="hsl(330 84% 95%)" />,
  Bell: <IconWrapper icon="bell" backgroundColor="hsl(48 92% 95%)" />,
  Globe: <IconWrapper icon="globe" backgroundColor="hsl(180 84% 95%)" />,
  Shield: <IconWrapper icon="shield" backgroundColor="hsl(120 84% 95%)" />,
  AlertTriangle: <IconWrapper icon="alert-triangle" backgroundColor="hsl(24 84% 95%)" />,
  MapPin: <IconWrapper icon="map-pin" backgroundColor="hsl(0 84% 95%)" />,
}

// Export icon names for type safety
export const iconNames = Object.keys(iconMap) as IconName[]

// Helper to check if a string is a valid icon name
export function isValidIconName(name: string): name is IconName {
  return iconNames.includes(name as IconName)
}