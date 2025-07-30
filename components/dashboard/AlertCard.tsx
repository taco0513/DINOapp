import React from 'react';
import { useRouter } from 'next/navigation';

interface AlertCardProps {
  type: 'warning' | 'error' | 'info';
  message: string;
  action: string;
  link: string;
}

export const AlertCard = React.memo<AlertCardProps>(({ type, message, action, link }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(link);
  };

  return (
    <div 
      className={`alert ${
        type === 'warning' ? 'alert-warning' : 
        type === 'error' ? 'alert-error' : 
        'alert-info'
      } flex items-center justify-between`}
      role="alert"
    >
      <div>
        <strong>{message}</strong>
      </div>
      <button
        onClick={handleClick}
        className="btn btn-sm btn-ghost"
        aria-label={action}
      >
        {action} →
      </button>
    </div>
  );
});

AlertCard.displayName = 'AlertCard';