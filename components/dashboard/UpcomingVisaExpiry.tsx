/**
 * DINO v2.0 - Upcoming Visa Expiry Component
 * Display visa expiry alerts and notifications
 */

import Link from 'next/link';
import type { Visa } from '@prisma/client';
import { getCountryByCode } from '@/data/countries';

interface UpcomingVisaExpiryProps {
  readonly visaRecords: Visa[];
}

export function UpcomingVisaExpiry({ visaRecords }: UpcomingVisaExpiryProps) {
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (days: number) => {
    if (days <= 0) return 'red';
    if (days <= 30) return 'orange';
    if (days <= 90) return 'yellow';
    return 'green';
  };

  if (visaRecords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          비자 만료 알림 📋
        </h2>
        <div className="text-center py-6">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-gray-600">
            등록된 비자가 없습니다.
          </p>
          <Link
            href="/visa"
            className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            비자 관리하기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          비자 만료 알림 📋
        </h2>
      </div>

      <div className="space-y-3">
        {visaRecords.map((visa) => {
          const country = getCountryByCode(visa.country);
          const daysUntilExpiry = getDaysUntilExpiry(visa.expiryDate);
          const expiryColor = getExpiryColor(daysUntilExpiry);
          
          const colorClasses = {
            green: 'bg-green-50 text-green-800 border-green-200',
            yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            orange: 'bg-orange-50 text-orange-800 border-orange-200',
            red: 'bg-red-50 text-red-800 border-red-200',
          };

          return (
            <div
              key={visa.id}
              className={`p-3 rounded-lg border ${colorClasses[expiryColor]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {country?.name || visa.country}
                  </div>
                  <div className="text-sm">
                    {visa.visaType}
                  </div>
                </div>
                <div className="text-right">
                  {daysUntilExpiry > 0 ? (
                    <>
                      <div className="font-bold">
                        {daysUntilExpiry}일
                      </div>
                      <div className="text-xs">
                        남음
                      </div>
                    </>
                  ) : (
                    <div className="font-bold">
                      만료됨!
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs mt-2 opacity-75">
                만료일: {new Date(visa.expiryDate).toLocaleDateString('ko-KR')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/visa"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          모든 비자 관리 →
        </Link>
      </div>
    </div>
  );
}