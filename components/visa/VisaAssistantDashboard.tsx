/**
 * DINO v2.0 - Visa Assistant Dashboard
 * Unified dashboard for visa application management and alerts
 */

'use client';

import { useState } from 'react';
import { VisaApplication, VisaAlert } from '@/types/visa-application';
import { VisaApplicationTracker } from './VisaApplicationTracker';
import { VisaAlertSystem } from './VisaAlertSystem';

interface VisaAssistantDashboardProps {
  applications: VisaApplication[];
  alerts: VisaAlert[];
  onUpdateApplication?: (application: VisaApplication) => void;
  onDeleteApplication?: (id: string) => void;
  onMarkAlertAsRead?: (alertId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

type DashboardView = 'overview' | 'applications' | 'alerts' | 'calendar';

export function VisaAssistantDashboard({
  applications,
  alerts,
  onUpdateApplication,
  onDeleteApplication,
  onMarkAlertAsRead,
  onDismissAlert
}: VisaAssistantDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(app => 
      ['planning', 'preparing', 'submitted', 'processing'].includes(app.status)
    ).length,
    upcomingDeadlines: applications.filter(app => {
      if (!app.applicationDeadline) return false;
      const now = new Date();
      const deadline = new Date(app.applicationDeadline);
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 14 && daysUntil >= 0;
    }).length,
    unreadAlerts: alerts.filter(alert => !alert.isRead).length,
    urgentAlerts: alerts.filter(alert => 
      (alert.priority === 'urgent' || alert.priority === 'high') && !alert.isRead
    ).length
  };

  // Get next urgent action
  const getNextUrgentAction = () => {
    const urgentDeadlines = applications
      .filter(app => {
        if (!app.applicationDeadline) return false;
        const now = new Date();
        const deadline = new Date(app.applicationDeadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil >= 0;
      })
      .sort((a, b) => {
        const aDeadline = new Date(a.applicationDeadline!).getTime();
        const bDeadline = new Date(b.applicationDeadline!).getTime();
        return aDeadline - bDeadline;
      });

    if (urgentDeadlines.length > 0) {
      const app = urgentDeadlines[0];
      const daysUntil = Math.ceil((new Date(app.applicationDeadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return {
        type: 'deadline',
        message: `${app.countryName} 비자 신청 마감까지 ${daysUntil}일`,
        action: '서류 완료하기',
        urgency: daysUntil <= 3 ? 'urgent' : 'high'
      };
    }

    const incompleteDocuments = applications.find(app => 
      app.status === 'preparing' && 
      app.documents.some(doc => doc.status === 'missing' && doc.isRequired)
    );

    if (incompleteDocuments) {
      const missingCount = incompleteDocuments.documents.filter(doc => doc.status === 'missing' && doc.isRequired).length;
      return {
        type: 'document',
        message: `${incompleteDocuments.countryName} 비자 필수 서류 ${missingCount}개 미완료`,
        action: '서류 준비하기',
        urgency: 'medium'
      };
    }

    return null;
  };

  const nextAction = getNextUrgentAction();

  const tabs = [
    { key: 'overview', label: '개요', icon: '📊' },
    { key: 'applications', label: '신청 관리', icon: '📋' },
    { key: 'alerts', label: '알림', icon: '🔔', badge: stats.unreadAlerts },
    { key: 'calendar', label: '일정', icon: '📅' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">비자 도우미</h1>
        <p className="text-gray-600">비자 신청을 체계적으로 관리하고 놓치지 않도록 도와드립니다</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as DashboardView)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeView === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 신청</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.activeApplications}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">임박 마감</p>
                  <p className="text-3xl font-bold text-red-600">{stats.upcomingDeadlines}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">새 알림</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.unreadAlerts}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔔</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Action Card */}
          {nextAction && (
            <div className={`rounded-2xl p-6 border-l-4 ${
              nextAction.urgency === 'urgent' ? 'bg-red-50 border-l-red-500' :
              nextAction.urgency === 'high' ? 'bg-orange-50 border-l-orange-500' :
              'bg-yellow-50 border-l-yellow-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold mb-1 ${
                    nextAction.urgency === 'urgent' ? 'text-red-800' :
                    nextAction.urgency === 'high' ? 'text-orange-800' :
                    'text-yellow-800'
                  }`}>
                    다음 할 일
                  </h3>
                  <p className="text-gray-700 mb-2">{nextAction.message}</p>
                  <button 
                    onClick={() => setActiveView('applications')}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      nextAction.urgency === 'urgent' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      nextAction.urgency === 'high' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                      'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {nextAction.action} →
                  </button>
                </div>
                <div className="text-4xl">
                  {nextAction.type === 'deadline' ? '⏰' : '📋'}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Preview */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 신청</h3>
                <button 
                  onClick={() => setActiveView('applications')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  전체보기 →
                </button>
              </div>
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <span className="text-xl">
                      {app.countryCode === 'CN' ? '🇨🇳' : 
                       app.countryCode === 'IN' ? '🇮🇳' : 
                       app.countryCode === 'RU' ? '🇷🇺' : 
                       app.countryCode === 'JP' ? '🇯🇵' : '🌍'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {app.countryName} {app.applicationType === 'tourist' ? '관광비자' : '비자'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(app.plannedTravelDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status === 'approved' ? '승인' :
                       app.status === 'processing' ? '심사중' :
                       app.status === 'preparing' ? '준비중' :
                       app.status === 'planning' ? '계획중' : app.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 알림</h3>
                <button 
                  onClick={() => setActiveView('alerts')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  전체보기 →
                </button>
              </div>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <span className="text-lg">
                      {alert.type === 'deadline' ? '⏰' :
                       alert.type === 'document' ? '📋' :
                       alert.type === 'processing' ? '⏳' :
                       alert.type === 'expiry' ? '📅' : '🔔'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {alert.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {alert.message}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'applications' && (
        <VisaApplicationTracker 
          applications={applications}
          onUpdateApplication={onUpdateApplication}
          onDeleteApplication={onDeleteApplication}
        />
      )}

      {activeView === 'alerts' && (
        <VisaAlertSystem 
          alerts={alerts}
          applications={applications}
          onMarkAsRead={onMarkAlertAsRead}
          onDismissAlert={onDismissAlert}
        />
      )}

      {activeView === 'calendar' && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">달력 뷰 개발 예정</h3>
          <p className="text-gray-600">비자 신청 일정을 캘린더 형태로 볼 수 있는 기능을 준비 중입니다</p>
        </div>
      )}
    </div>
  );
}