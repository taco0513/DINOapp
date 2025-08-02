/**
 * DINO v2.0 - Visa Alert System Component
 * Automatic alerts and notifications for visa deadlines
 */

'use client';

import { useState, useMemo } from 'react';
import { VisaAlert, VisaApplication } from '@/types/visa-application';

interface VisaAlertSystemProps {
  alerts: VisaAlert[];
  applications: VisaApplication[];
  onMarkAsRead?: (alertId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export function VisaAlertSystem({ 
  alerts, 
  applications, 
  onMarkAsRead,
  onDismissAlert 
}: VisaAlertSystemProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    if (filter === 'unread') {
      filtered = alerts.filter(alert => !alert.isRead);
    } else if (filter === 'urgent') {
      filtered = alerts.filter(alert => alert.priority === 'urgent' || alert.priority === 'high');
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.alertDate).getTime() - new Date(b.alertDate).getTime();
    });
  }, [alerts, filter]);

  // Get alert icon and styling
  const getAlertInfo = (alert: VisaAlert) => {
    // const baseStyle = "p-4 rounded-xl border-l-4 ";
    
    switch (alert.type) {
      case 'deadline':
        return {
          icon: '⏰',
          color: alert.priority === 'urgent' ? 'bg-red-50 border-l-red-500 border-red-200' :
                 alert.priority === 'high' ? 'bg-orange-50 border-l-orange-500 border-orange-200' :
                 'bg-yellow-50 border-l-yellow-500 border-yellow-200',
          textColor: alert.priority === 'urgent' ? 'text-red-700' :
                     alert.priority === 'high' ? 'text-orange-700' :
                     'text-yellow-700'
        };
      case 'document':
        return {
          icon: '📋',
          color: 'bg-blue-50 border-l-blue-500 border-blue-200',
          textColor: 'text-blue-700'
        };
      case 'processing':
        return {
          icon: '⏳',
          color: 'bg-indigo-50 border-l-indigo-500 border-indigo-200',
          textColor: 'text-indigo-700'
        };
      case 'expiry':
        return {
          icon: '📅',
          color: 'bg-purple-50 border-l-purple-500 border-purple-200',
          textColor: 'text-purple-700'
        };
      default:
        return {
          icon: '🔔',
          color: 'bg-gray-50 border-l-gray-500 border-gray-200',
          textColor: 'text-gray-700'
        };
    }
  };

  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}일 전`;
    } else if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '내일';
    } else {
      return `${diffDays}일 후`;
    }
  };

  // Get application details for an alert
  const getApplicationForAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return null;
    
    return applications.find(app => app.id === alert.applicationId);
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const urgentCount = alerts.filter(alert => 
    (alert.priority === 'urgent' || alert.priority === 'high') && !alert.isRead
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">알림 센터</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">비자 관련 중요한 알림을 확인하세요</p>
        </div>
      </div>

      {/* Alert Summary */}
      {urgentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-semibold text-red-800">
                긴급 알림 {urgentCount}개
              </div>
              <div className="text-sm text-red-600">
                즉시 확인이 필요한 중요한 알림이 있습니다
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {([
          { key: 'unread', label: '읽지 않음', count: unreadCount },
          { key: 'urgent', label: '긴급', count: urgentCount },
          { key: 'all', label: '전체', count: alerts.length }
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? '새로운 알림이 없습니다' :
               filter === 'urgent' ? '긴급 알림이 없습니다' :
               '알림이 없습니다'}
            </h3>
            <p className="text-gray-600">
              비자 신청을 추가하면 자동으로 알림을 받을 수 있습니다
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const alertInfo = getAlertInfo(alert);
            const application = getApplicationForAlert(alert.id);
            
            return (
              <div
                key={alert.id}
                className={`${alertInfo.color} border transition-all duration-200 ${
                  !alert.isRead ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Alert Icon */}
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{alertInfo.icon}</span>
                    </div>
                    
                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${alertInfo.textColor} mb-1`}>
                            {alert.title}
                          </h3>
                          <p className="text-sm text-gray-700 mb-2">
                            {alert.message}
                          </p>
                          
                          {/* Application Info */}
                          {application && (
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <span>📍 {application.countryName}</span>
                              <span>•</span>
                              <span>
                                {application.applicationType === 'tourist' ? '관광비자' : '비자'}
                              </span>
                            </div>
                          )}
                          
                          {/* Time and Priority */}
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(new Date(alert.alertDate))}
                            </span>
                            
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              alert.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {alert.priority === 'urgent' ? '긴급' :
                               alert.priority === 'high' ? '높음' :
                               alert.priority === 'medium' ? '보통' : '낮음'}
                            </span>
                            
                            {!alert.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!alert.isRead && onMarkAsRead && (
                      <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        읽음
                      </button>
                    )}
                    {onDismissAlert && (
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      {filteredAlerts.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              filteredAlerts.forEach(alert => {
                if (!alert.isRead && onMarkAsRead) {
                  onMarkAsRead(alert.id);
                }
              });
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            모든 알림 읽음으로 표시
          </button>
        </div>
      )}
    </div>
  );
}