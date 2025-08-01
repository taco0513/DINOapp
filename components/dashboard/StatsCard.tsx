import { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: string;
  onClick?: () => void;
}

export const StatsCard = React.memo<StatsCardProps>(({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color = 'primary',
  onClick 
}) => {
  return (
    <div 
      className={`card ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold mb-2">{value}</div>
          <div className="text-sm text-secondary">{title}</div>
          {description && (
            <div className="text-xs text-secondary mt-1">{description}</div>
          )}
        </div>
        <div className={`p-3 bg-${color}/10 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';