/**
 * DINO v2.0 - Profile Client Component
 * Client-side profile management
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import type { User, Passport, Visa } from '@prisma/client';

interface ProfileClientProps {
  user: User & {
    passports: Passport[];
    visas: Visa[];
    trips: { id: string; country: string }[];
  };
  stats: {
    totalTrips: number;
    countriesVisited: number;
    activeVisas: number;
    passports: number;
  };
}

export function ProfileClient({ user, stats }: ProfileClientProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', name: '계정 정보', icon: '👤' },
    { id: 'travel', name: '여행 설정', icon: '✈️' },
    { id: 'passports', name: '여권 관리', icon: '📔' },
    { id: 'notifications', name: '알림 설정', icon: '🔔' },
    { id: 'privacy', name: '개인정보', icon: '🔒' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || '사용자'}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {session?.user?.name || '사용자'}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTrips}</div>
                <div className="text-xs text-gray-600">총 여행</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.countriesVisited}</div>
                <div className="text-xs text-gray-600">방문 국가</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.activeVisas}</div>
                <div className="text-xs text-gray-600">활성 비자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.passports}</div>
                <div className="text-xs text-gray-600">여권</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>로그아웃</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'account' && (
              <AccountSettings user={user} />
            )}
            {activeTab === 'travel' && (
              <TravelSettings user={user} />
            )}
            {activeTab === 'passports' && (
              <PassportSettings passports={user.passports} />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Settings Component
function AccountSettings({ user }: { user: unknown }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">계정 정보</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
          <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            placeholder="+82 10-0000-0000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: Save changes
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Travel Settings Component
function TravelSettings({ user }: { user: unknown }) {
  const [preferences, setPreferences] = useState({
    defaultPassport: user.passports[0]?.id || '',
    currency: 'KRW',
    language: 'ko',
    timezone: 'Asia/Seoul',
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">여행 설정</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기본 여권
          </label>
          <select
            value={preferences.defaultPassport}
            onChange={(e) => setPreferences({ ...preferences, defaultPassport: e.target.value })}
            className="form-select"
          >
            {user.passports.map((passport: Passport) => (
              <option key={passport.id} value={passport.id}>
                {passport.countryName} - {passport.passportNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기본 통화
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className="form-select"
          >
            <option value="KRW">🇰🇷 한국 원 (KRW)</option>
            <option value="USD">🇺🇸 미국 달러 (USD)</option>
            <option value="EUR">🇪🇺 유로 (EUR)</option>
            <option value="JPY">🇯🇵 일본 엔 (JPY)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            언어
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="form-select"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
}

// Passport Settings Component
function PassportSettings({ passports }: { passports: Passport[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">여권 관리</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          + 여권 추가
        </button>
      </div>
      
      <div className="space-y-4">
        {passports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">등록된 여권이 없습니다</p>
          </div>
        ) : (
          passports.map((passport) => (
            <div key={passport.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium">{passport.countryName} 여권</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">활성</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    여권번호: {passport.passportNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    만료일: {new Date(passport.expiryDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    visaExpiry: true,
    policyUpdates: true,
    travelAlerts: false,
    newsletter: false,
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h3>
      
      <div className="space-y-4">
        <label className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900">비자 만료 알림</div>
            <div className="text-sm text-gray-600">비자 만료 30일 전 알림을 받습니다</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.visaExpiry}
            onChange={(e) => setNotifications({ ...notifications, visaExpiry: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900">비자 정책 업데이트</div>
            <div className="text-sm text-gray-600">관심 국가의 비자 정책 변경 시 알림</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.policyUpdates}
            onChange={(e) => setNotifications({ ...notifications, policyUpdates: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900">여행 경보</div>
            <div className="text-sm text-gray-600">여행지 안전 정보 및 경보 알림</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.travelAlerts}
            onChange={(e) => setNotifications({ ...notifications, travelAlerts: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900">뉴스레터</div>
            <div className="text-sm text-gray-600">여행 팁과 할인 정보 받기</div>
          </div>
          <input
            type="checkbox"
            checked={notifications.newsletter}
            onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="mt-6 pt-6 border-t">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          알림 설정 저장
        </button>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettings() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">개인정보 설정</h3>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">데이터 내보내기</h4>
          <p className="text-sm text-gray-600 mb-4">
            모든 여행 기록과 개인 정보를 다운로드합니다
          </p>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            데이터 내보내기
          </button>
        </div>

        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="font-medium text-red-900 mb-2">계정 삭제</h4>
          <p className="text-sm text-red-700 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
          </p>
          <button className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-100">
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}