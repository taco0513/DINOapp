/**
 * DINO v2.0 - Visa Assistant Client Component
 * Client-side wrapper for visa assistant functionality
 */

'use client';

import { useState } from 'react';
import { VisaAssistantDashboard } from './VisaAssistantDashboard';
// import type { VisaApplication, VisaAlert } from '@prisma/client';

interface VisaAssistantClientProps {
  initialApplications: unknown[];
  initialAlerts: unknown[];
}

export function VisaAssistantClient({ 
  initialApplications, 
  initialAlerts 
}: VisaAssistantClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [alerts, setAlerts] = useState(initialAlerts);

  const handleUpdateApplication = async (application: unknown) => {
    try {
      const response = await fetch(`/api/visa-applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const updated = await response.json();
      setApplications(apps => 
        apps.map(app => app.id === updated.id ? updated : app)
      );
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/visa-applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(apps => apps.filter(app => app.id !== id));
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleMarkAlertAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/visa-alerts/${id}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      setAlerts(alerts => 
        alerts.map(alert => 
          alert.id === id ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/visa-alerts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }

      setAlerts(alerts => alerts.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  return (
    <VisaAssistantDashboard
      applications={applications}
      alerts={alerts}
      onUpdateApplication={handleUpdateApplication}
      onDeleteApplication={handleDeleteApplication}
      onMarkAlertAsRead={handleMarkAlertAsRead}
      onDismissAlert={handleDismissAlert}
    />
  );
}