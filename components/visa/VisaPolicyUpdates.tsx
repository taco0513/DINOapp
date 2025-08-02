/**
 * DINO v2.0 - Visa Policy Updates Component
 * Displays real-time visa policy changes
 */

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { VisaPolicyUpdate } from '@/types/visa-policy';
import { VisaPolicyUpdateService } from '@/lib/visa-policy/updates';
import { countryNames } from '@/lib/constants/countries';

interface VisaPolicyUpdatesProps {
  userCountries?: string[];
  maxItems?: number;
}

export function VisaPolicyUpdates({ 
  userCountries = ['KR'], 
  maxItems = 5 
}: VisaPolicyUpdatesProps) {
  const [updates, setUpdates] = useState<VisaPolicyUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  useEffect(() => {
    const service = VisaPolicyUpdateService.getInstance();
    
    // Load initial updates
    const loadUpdates = async () => {
      try {
        const recentUpdates = await service.getRecentUpdates(userCountries);
        setUpdates(recentUpdates.slice(0, maxItems));
      } catch (error) {
        console.error('Error loading visa policy updates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUpdates();

    // Subscribe to real-time updates
    const handleUpdate = (update: VisaPolicyUpdate) => {
      if (service.isPolicyRelevant(update.newPolicy, userCountries)) {
        setUpdates(prev => [update, ...prev].slice(0, maxItems));
        setHasNewUpdate(true);
        
        // Clear new update indicator after 5 seconds
        setTimeout(() => setHasNewUpdate(false), 5000);
      }
    };

    service.subscribe('user-1', handleUpdate);

    return () => {
      service.unsubscribe('user-1');
    };
  }, [userCountries, maxItems]);

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'VISA_FREE':
        return 'text-green-600 bg-green-50';
      case 'VISA_ON_ARRIVAL':
        return 'text-blue-600 bg-blue-50';
      case 'E_VISA':
        return 'text-purple-600 bg-purple-50';
      case 'VISA_REQUIRED':
        return 'text-orange-600 bg-orange-50';
      case 'BANNED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    switch (type) {
      case 'VISA_FREE':
        return '무비자';
      case 'VISA_ON_ARRIVAL':
        return '도착비자';
      case 'E_VISA':
        return '전자비자';
      case 'VISA_REQUIRED':
        return '비자 필요';
      case 'BANNED':
        return '입국 금지';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">최근 비자 정책 변경사항이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasNewUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 animate-pulse">
          ✨ 새로운 비자 정책 업데이트가 있습니다!
        </div>
      )}
      
      {updates.map((update) => (
        <div
          key={update.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {countryNames[update.newPolicy.fromCountry] || update.newPolicy.fromCountry}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-lg font-medium">
                  {countryNames[update.newPolicy.toCountry] || update.newPolicy.toCountry}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                {update.previousPolicy?.policyType && (
                  <>
                    <span className={`px-2 py-1 rounded-full ${getPolicyTypeColor(update.previousPolicy.policyType)}`}>
                      {getPolicyTypeLabel(update.previousPolicy.policyType)}
                    </span>
                    <span className="text-gray-400">→</span>
                  </>
                )}
                <span className={`px-2 py-1 rounded-full font-medium ${getPolicyTypeColor(update.newPolicy.policyType)}`}>
                  {getPolicyTypeLabel(update.newPolicy.policyType)}
                </span>
              </div>
              
              {update.newPolicy.notes && (
                <p className="mt-2 text-sm text-gray-600">
                  {update.newPolicy.notes}
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  발효일: {format(update.newPolicy.effectiveDate, 'yyyy년 MM월 dd일', { locale: ko })}
                </span>
                {update.verified && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    확인됨
                  </span>
                )}
              </div>
            </div>
            
            {update.changeType === 'NEW' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                신규
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}