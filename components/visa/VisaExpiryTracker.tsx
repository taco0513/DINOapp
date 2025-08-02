/**
 * DINO v2.0 - Visa Expiry Tracker Component
 * Track and monitor visa expiration dates with automatic alerts
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Visa } from '@prisma/client';

interface VisaExpiryTrackerProps {
  visas: Visa[];
  onRenewVisa?: (visa: Visa) => void;
  onUpdateVisa?: (visa: Visa) => void;
}

type FilterStatus = 'all' | 'active' | 'expiring' | 'expired';

export function VisaExpiryTracker({ 
  visas, 
  onRenewVisa,
  onUpdateVisa 
}: VisaExpiryTrackerProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date | string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get visa status based on expiry
  const getVisaStatus = useCallback((visa: Visa) => {
    const daysUntilExpiry = getDaysUntilExpiry(visa.expiryDate);
    
    if (daysUntilExpiry < 0) {
      return { 
        status: 'expired', 
        color: 'bg-red-100 text-red-700 border-red-200',
        bgColor: 'bg-red-50',
        label: '만료됨',
        priority: 1
      };
    } else if (daysUntilExpiry <= 30) {
      return { 
        status: 'expiring_soon', 
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        bgColor: 'bg-orange-50',
        label: '만료 임박',
        priority: 2
      };
    } else if (daysUntilExpiry <= 90) {
      return { 
        status: 'expiring', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        bgColor: 'bg-yellow-50',
        label: '갱신 권장',
        priority: 3
      };
    } else {
      return { 
        status: 'active', 
        color: 'bg-green-100 text-green-700 border-green-200',
        bgColor: 'bg-green-50',
        label: '유효',
        priority: 4
      };
    }
  }, []);

  // Filter visas
  const filteredVisas = useMemo(() => {
    let filtered = [...visas];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visa => {
        const status = getVisaStatus(visa).status;
        if (filterStatus === 'active') return status === 'active';
        if (filterStatus === 'expiring') return status === 'expiring' || status === 'expiring_soon';
        if (filterStatus === 'expired') return status === 'expired';
        return true;
      });
    }
    
    // Sort by priority (expired first, then expiring soon)
    return filtered.sort((a, b) => {
      const aPriority = getVisaStatus(a).priority;
      const bPriority = getVisaStatus(b).priority;
      return aPriority - bPriority;
    });
  }, [visas, filterStatus, getVisaStatus]);

  // Calculate statistics
  const stats = {
    total: visas.length,
    active: visas.filter(v => getVisaStatus(v).status === 'active').length,
    expiring: visas.filter(v => {
      const status = getVisaStatus(v).status;
      return status === 'expiring' || status === 'expiring_soon';
    }).length,
    expired: visas.filter(v => getVisaStatus(v).status === 'expired').length
  };

  // Get country flag emoji
  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'CN': '🇨🇳', 'IN': '🇮🇳', 'RU': '🇷🇺', 'US': '🇺🇸', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'NZ': '🇳🇿', 'JP': '🇯🇵', 'KR': '🇰🇷', 'VN': '🇻🇳',
      'TH': '🇹🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'ID': '🇮🇩', 'PH': '🇵🇭',
      'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'PE': '🇵🇪'
    };
    return flags[countryCode] || '🌍';
  };

  // Format remaining time
  const formatRemainingTime = (days: number) => {
    if (days < 0) {
      const absDays = Math.abs(days);
      if (absDays === 1) return '1일 전 만료';
      if (absDays < 30) return `${absDays}일 전 만료`;
      if (absDays < 365) return `${Math.floor(absDays / 30)}개월 전 만료`;
      return `${Math.floor(absDays / 365)}년 전 만료`;
    } else if (days === 0) {
      return '오늘 만료';
    } else if (days === 1) {
      return '내일 만료';
    } else if (days < 30) {
      return `${days}일 남음`;
    } else if (days < 365) {
      return `${Math.floor(days / 30)}개월 남음`;
    } else {
      return `${Math.floor(days / 365)}년 남음`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">비자 만료 추적기</h2>
        <p className="text-gray-600">비자 만료일을 추적하고 갱신 시기를 놓치지 마세요</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 비자</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">유효</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">갱신 필요</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">만료</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-lg">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'active', 'expiring', 'expired'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? '전체' :
             status === 'active' ? '유효' :
             status === 'expiring' ? '갱신 필요' : '만료'}
            <span className="ml-1 text-xs">
              ({status === 'all' ? stats.total :
                status === 'active' ? stats.active :
                status === 'expiring' ? stats.expiring : stats.expired})
            </span>
          </button>
        ))}
      </div>

      {/* Visa List */}
      <div className="space-y-4">
        {filteredVisas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'all' ? '등록된 비자가 없습니다' : 
               `${filterStatus === 'active' ? '유효한' :
                  filterStatus === 'expiring' ? '갱신이 필요한' : '만료된'} 비자가 없습니다`}
            </h3>
            <p className="text-gray-600">비자를 추가하여 만료일을 관리하세요</p>
          </div>
        ) : (
          filteredVisas.map((visa) => {
            const statusInfo = getVisaStatus(visa);
            const daysUntilExpiry = getDaysUntilExpiry(visa.expiryDate);
            const isExpanded = selectedVisa === visa.id;
            
            return (
              <div
                key={visa.id}
                className={`rounded-xl p-6 border-l-4 ${statusInfo.bgColor} ${
                  statusInfo.status === 'expired' ? 'border-l-red-500' :
                  statusInfo.status === 'expiring_soon' ? 'border-l-orange-500' :
                  statusInfo.status === 'expiring' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Country and Visa Type */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getCountryFlag(visa.country)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {visa.countryName} {visa.visaType === 'tourist' ? '관광' : visa.visaType} 비자
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{visa.entries === 'multiple' ? '복수 입국' : '단수 입국'}</span>
                          <span>•</span>
                          <span>최대 {visa.maxStayDays}일 체류</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Expiry */}
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className={`text-sm font-medium ${
                        statusInfo.status === 'expired' ? 'text-red-700' :
                        statusInfo.status === 'expiring_soon' ? 'text-orange-700' :
                        statusInfo.status === 'expiring' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {formatRemainingTime(daysUntilExpiry)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 text-sm text-gray-600">
                      <span>발급일: {new Date(visa.issueDate).toLocaleDateString('ko-KR')}</span>
                      <span className="mx-2">•</span>
                      <span>만료일: {new Date(visa.expiryDate).toLocaleDateString('ko-KR')}</span>
                    </div>

                    {/* Urgent Warning */}
                    {(statusInfo.status === 'expired' || statusInfo.status === 'expiring_soon') && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        statusInfo.status === 'expired' ? 'bg-red-100 border border-red-200' :
                        'bg-orange-100 border border-orange-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {statusInfo.status === 'expired' ? '🚫' : '⚠️'}
                          </span>
                          <div className="text-sm">
                            <div className={`font-medium ${
                              statusInfo.status === 'expired' ? 'text-red-800' : 'text-orange-800'
                            }`}>
                              {statusInfo.status === 'expired' 
                                ? '비자가 만료되었습니다'
                                : `비자 만료가 ${daysUntilExpiry}일 남았습니다`}
                            </div>
                            <div className={statusInfo.status === 'expired' ? 'text-red-600' : 'text-orange-600'}>
                              {statusInfo.status === 'expired' 
                                ? '즉시 갱신이 필요합니다'
                                : '갱신 절차를 시작하세요'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand/Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedVisa(isExpanded ? null : visa.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Additional Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">상세 정보</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">비자 상태</span>
                            <span className="font-medium">{visa.status === 'active' ? '활성' : visa.status}</span>
                          </div>
                          {visa.documentUrl && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">비자 문서</span>
                              <a href={visa.documentUrl} className="text-blue-600 hover:text-blue-700">
                                보기 →
                              </a>
                            </div>
                          )}
                          {visa.notes && (
                            <div className="pt-2 border-t">
                              <span className="text-gray-600 block mb-1">메모</span>
                              <span className="text-gray-900">{visa.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">작업</h4>
                        <div className="space-y-2">
                          {(statusInfo.status === 'expired' || statusInfo.status === 'expiring_soon' || statusInfo.status === 'expiring') && (
                            <button
                              onClick={() => onRenewVisa?.(visa)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              비자 갱신하기
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateVisa?.(visa)}
                            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            정보 수정
                          </button>
                          <button
                            className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            비자 삭제
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

      {/* Add Visa Button */}
      <div className="text-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          + 새 비자 추가
        </button>
      </div>
    </div>
  );
}