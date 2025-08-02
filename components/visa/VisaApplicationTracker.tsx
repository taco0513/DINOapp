/**
 * DINO v2.0 - Visa Application Tracker Component
 * Track visa applications with deadlines and document checklists
 */

'use client';

import { useState, useMemo } from 'react';
import { 
  VisaApplication, 
  ApplicationStatus 
  // ApplicationType,
  // DocumentStatus 
} from '@/types/visa-application';

interface VisaApplicationTrackerProps {
  applications: VisaApplication[];
  onUpdateApplication?: (application: VisaApplication) => void;
  onDeleteApplication?: (id: string) => void;
}

export function VisaApplicationTracker({ 
  applications, 
  onUpdateApplication: _onUpdateApplication,
  onDeleteApplication: _onDeleteApplication 
}: VisaApplicationTrackerProps) {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);

  // Get status color and icon
  const getStatusInfo = (status: ApplicationStatus) => {
    const statusMap = {
      planning: { color: 'bg-gray-100 text-gray-700', icon: '📝', label: '계획 중' },
      preparing: { color: 'bg-yellow-100 text-yellow-700', icon: '📋', label: '준비 중' },
      submitted: { color: 'bg-blue-100 text-blue-700', icon: '📤', label: '제출 완료' },
      processing: { color: 'bg-indigo-100 text-indigo-700', icon: '⏳', label: '심사 중' },
      approved: { color: 'bg-green-100 text-green-700', icon: '✅', label: '승인됨' },
      rejected: { color: 'bg-red-100 text-red-700', icon: '❌', label: '거절됨' },
      expired: { color: 'bg-gray-100 text-gray-500', icon: '⏰', label: '만료됨' },
      cancelled: { color: 'bg-gray-100 text-gray-500', icon: '🚫', label: '취소됨' },
    };
    return statusMap[status];
  };

  // Get urgency level based on deadlines
  const getUrgencyLevel = (app: VisaApplication) => {
    if (!app.applicationDeadline) return 'normal';
    
    const now = new Date();
    const deadline = new Date(app.applicationDeadline);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 3) return 'urgent';
    if (daysUntilDeadline <= 7) return 'high';
    if (daysUntilDeadline <= 14) return 'medium';
    return 'normal';
  };

  // Calculate document completion percentage
  const getDocumentProgress = (app: VisaApplication) => {
    const total = app.documents.length;
    if (total === 0) return 0;
    
    const completed = app.documents.filter(doc => 
      doc.status === 'ready' || doc.status === 'submitted'
    ).length;
    
    return Math.round((completed / total) * 100);
  };

  const urgencyColors = {
    urgent: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    normal: 'border-l-gray-300 bg-white',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">비자 신청 관리</h2>
          <p className="text-gray-600 mt-1">진행 중인 비자 신청을 추적하고 관리하세요</p>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + 새 신청 추가
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'planning', 'preparing', 'submitted', 'processing', 'approved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? '전체' : getStatusInfo(status as ApplicationStatus).label}
            <span className="ml-1 text-xs">
              ({status === 'all' ? applications.length : applications.filter(app => app.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? '비자 신청이 없습니다' : `${getStatusInfo(filter as ApplicationStatus).label} 상태의 신청이 없습니다`}
            </h3>
            <p className="text-gray-600">새로운 비자 신청을 추가해보세요</p>
          </div>
        ) : (
          filteredApplications.map((app) => {
            const statusInfo = getStatusInfo(app.status);
            const urgency = getUrgencyLevel(app);
            const documentProgress = getDocumentProgress(app);
            
            return (
              <div
                key={app.id}
                className={`border-l-4 rounded-r-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${urgencyColors[urgency]}`}
                onClick={() => setSelectedApplication(app.id === selectedApplication ? null : app.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Country and Type */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{app.countryCode === 'CN' ? '🇨🇳' : app.countryCode === 'IN' ? '🇮🇳' : app.countryCode === 'RU' ? '🇷🇺' : '🌍'}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.countryName} {app.applicationType === 'tourist' ? '관광비자' : '비자'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          예정 출발일: {new Date(app.plannedTravelDate).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>

                    {/* Status and Progress */}
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <span className="mr-1">{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                      
                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>서류 준비</span>
                          <span>{documentProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${documentProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    {app.applicationDeadline && urgency !== 'normal' && (
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                        urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                        urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span>⚠️</span>
                        <span>
                          신청 마감까지 {Math.ceil((new Date(app.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse */}
                  <button className="text-gray-400 hover:text-gray-600">
                    {selectedApplication === app.id ? '▼' : '▶'}
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedApplication === app.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Documents Checklist */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">📋 필요 서류</h4>
                        <div className="space-y-2">
                          {app.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                doc.status === 'ready' ? 'bg-green-500 border-green-500' :
                                doc.status === 'preparing' ? 'bg-yellow-500 border-yellow-500' :
                                doc.status === 'submitted' ? 'bg-blue-500 border-blue-500' :
                                'border-gray-300'
                              }`}>
                                {(doc.status === 'ready' || doc.status === 'submitted') && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {doc.name}
                                  {doc.isRequired && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                <div className="text-xs text-gray-600">{doc.description}</div>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded ${
                                doc.status === 'ready' ? 'bg-green-100 text-green-700' :
                                doc.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                                doc.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {doc.status === 'ready' ? '준비완료' :
                                 doc.status === 'preparing' ? '준비중' :
                                 doc.status === 'submitted' ? '제출완료' :
                                 '미준비'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline and Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">📅 일정 및 상세정보</h4>
                        <div className="space-y-3">
                          {app.applicationDeadline && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">신청 마감일</span>
                              <span className="font-medium text-red-600">
                                {new Date(app.applicationDeadline).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                          )}
                          
                          {app.processingTime && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">처리 기간</span>
                              <span className="font-medium">{app.processingTime}일</span>
                            </div>
                          )}
                          
                          {app.applicationFee && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">수수료</span>
                              <span className="font-medium">${app.applicationFee}</span>
                            </div>
                          )}
                          
                          {app.consulate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">신청처</span>
                              <span className="font-medium">{app.consulate}</span>
                            </div>
                          )}
                          
                          {app.notes && (
                            <div className="text-sm">
                              <span className="text-gray-600 block mb-1">메모</span>
                              <span className="text-gray-900">{app.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex space-x-2">
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            수정
                          </button>
                          <button className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}