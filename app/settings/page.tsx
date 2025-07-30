'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';
import {
  getCurrentLocale,
  setLocale,
  getSupportedLocales,
  type Locale,
} from '@/lib/i18n';
import { COUNTRIES, type CountryInfo } from '@/data/countries';
import {
  TIMEZONES,
  TIMEZONE_REGIONS,
  getUserTimezone,
  type TimezoneInfo,
} from '@/data/timezones';
import {
  CURRENCIES,
  getPopularCurrencies,
  type CurrencyInfo,
} from '@/data/currencies';
import {
  User,
  Globe,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Mail,
  CheckCircle,
  Info,
  Clock,
  DollarSign,
  Passport,
  Settings,
  Lock,
  Eye,
  AlertTriangle,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';

interface UserSettings {
  // Account Settings
  language: Locale;
  theme: 'light' | 'dark' | 'system';

  // Travel Preferences
  timezone: string;
  passportCountry: string;
  currency: string;
  units: 'metric' | 'imperial';

  // Notification Settings
  notifications: {
    email: boolean;
    push: boolean;
    visaReminders: boolean;
    tripReminders: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  };

  // Privacy & Data
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
    analytics: boolean;
    locationTracking: boolean;
  };

  // Integration
  integration: {
    gmailConnected: boolean;
    lastSync?: string;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    // Account Settings
    language: 'ko',
    theme: 'system',

    // Travel Preferences
    timezone: getUserTimezone(),
    passportCountry: 'KR',
    currency: 'USD',
    units: 'metric',

    // Notification Settings
    notifications: {
      email: true,
      push: false,
      visaReminders: true,
      tripReminders: true,
      weeklyDigest: true,
      marketingEmails: false,
    },

    // Privacy & Data
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      locationTracking: false,
    },

    // Integration
    integration: {
      gmailConnected: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 설정 로드
  useEffect(() => {
    if (session) {
      // 현재 언어 설정 로드
      setSettings(prev => ({
        ...prev,
        language: getCurrentLocale(),
      }));

      // 로컬스토리지에서 기타 설정 로드
      const savedSettings = localStorage.getItem('dino-user-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    }
  }, [session]);

  // 설정 저장
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // 로컬스토리지에 저장
      localStorage.setItem(
        'dino-user-settings',
        JSON.stringify(updatedSettings)
      );

      // 언어 변경 시 즉시 적용
      if (newSettings.language && newSettings.language !== settings.language) {
        setLocale(newSettings.language);
        return; // 페이지가 리로드되므로 메시지 표시 불필요
      }

      setSaveMessage('설정이 저장되었습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('설정 저장에 실패했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 내보내기
  const exportData = async () => {
    try {
      // 여행 데이터 가져오기
      const response = await fetch('/api/trips');
      const data = await response.json();

      if (data.success) {
        const exportData = {
          trips: data.data,
          settings: settings,
          exportDate: new Date().toISOString(),
          version: '1.0',
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dino-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSaveMessage('데이터가 내보내기 되었습니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage('데이터 내보내기에 실패했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (status === 'loading') {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <HydrationSafeLoading fallback='Loading...' />
      </main>
    );
  }

  if (!session) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='card p-16 text-center max-w-md'>
          <div className='text-5xl mb-5'>⚙️</div>
          <h3 className='text-lg font-bold mb-2'>로그인이 필요합니다</h3>
          <p className='text-sm text-secondary mb-8'>
            설정을 관리하려면 먼저 로그인해주세요.
          </p>
          <Link href='/auth/signin' className='btn btn-primary'>
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <PageHeader
          title='설정'
          description='앱 설정과 개인정보를 관리하세요'
          icon={PageIcons.Settings}
          breadcrumbs={[
            { label: '대시보드', href: '/dashboard' },
            { label: '설정' },
          ]}
        />

        {/* 저장 메시지 */}
        {saveMessage && (
          <div
            className={`alert ${saveMessage.includes('실패') ? 'alert-error' : 'alert-success'} mb-6`}
          >
            {saveMessage}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className='mb-8'>
          <div className='border-b border-border'>
            <nav className='flex space-x-8 overflow-x-auto'>
              {[
                { id: 'account', name: '계정 설정', icon: User },
                { id: 'travel', name: '여행 선호도', icon: Globe },
                { id: 'notifications', name: '알림', icon: Bell },
                { id: 'privacy', name: '개인정보', icon: Shield },
                { id: 'data', name: '데이터 관리', icon: Download },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary hover:text-primary'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className='max-w-4xl'>
          {/* 계정 설정 탭 */}
          {activeTab === 'account' && (
            <div className='space-y-8'>
              {/* 언어 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Globe className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>언어 설정</h3>
                    <p className='text-sm text-secondary'>
                      앱에서 사용할 언어를 선택하세요
                    </p>
                  </div>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  {getSupportedLocales().map(locale => (
                    <button
                      key={locale.code}
                      onClick={() => saveSettings({ language: locale.code })}
                      disabled={isLoading}
                      className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                        settings.language === locale.code
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-surface'
                      }`}
                    >
                      <span className='text-2xl'>{locale.flag}</span>
                      <div className='text-left'>
                        <div className='font-medium'>{locale.name}</div>
                        <div className='text-sm text-secondary'>
                          {locale.code.toUpperCase()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 테마 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Monitor className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>테마 설정</h3>
                    <p className='text-sm text-secondary'>
                      앱의 외관을 선택하세요
                    </p>
                  </div>
                </div>

                <div className='grid md:grid-cols-3 gap-4'>
                  {[
                    { key: 'light', name: '라이트', icon: Sun },
                    { key: 'dark', name: '다크', icon: Moon },
                    { key: 'system', name: '시스템', icon: Monitor },
                  ].map(({ key, name, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => saveSettings({ theme: key as any })}
                      disabled={isLoading}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        settings.theme === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-surface'
                      }`}
                    >
                      <Icon className='h-6 w-6' />
                      <span className='font-medium'>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 여행 선호도 탭 */}
          {activeTab === 'travel' && (
            <div className='space-y-8'>
              {/* 시간대 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Clock className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>시간대 설정</h3>
                    <p className='text-sm text-secondary'>
                      여행 일정에 사용할 기본 시간대를 선택하세요
                    </p>
                  </div>
                </div>

                {/* 시간대 검색 */}
                <div className='relative mb-6'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary' />
                  <input
                    type='text'
                    placeholder='시간대 검색...'
                    value={timezoneSearch}
                    onChange={e => setTimezoneSearch(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                {/* 현재 시간대 */}
                <div className='bg-blue-50 rounded-lg p-4 mb-6'>
                  <div className='flex items-center gap-3'>
                    <Clock className='h-5 w-5 text-blue-600' />
                    <div>
                      <p className='font-medium text-blue-800'>현재 시간대</p>
                      <p className='text-sm text-blue-600'>
                        {settings.timezone} •{' '}
                        {new Date().toLocaleString('ko-KR', {
                          timeZone: settings.timezone,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 시간대 목록 */}
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {TIMEZONE_REGIONS.map(region => {
                    const regionTimezones = TIMEZONES.filter(
                      tz =>
                        tz.region === region &&
                        (timezoneSearch === '' ||
                          tz.label
                            .toLowerCase()
                            .includes(timezoneSearch.toLowerCase()) ||
                          tz.value
                            .toLowerCase()
                            .includes(timezoneSearch.toLowerCase()))
                    );

                    if (regionTimezones.length === 0) return null;

                    return (
                      <div key={region}>
                        <h4 className='font-medium text-sm text-secondary mb-2'>
                          {region}
                        </h4>
                        <div className='grid gap-2'>
                          {regionTimezones.map(timezone => (
                            <button
                              key={timezone.value}
                              onClick={() =>
                                saveSettings({ timezone: timezone.value })
                              }
                              disabled={isLoading}
                              className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                                settings.timezone === timezone.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:bg-surface'
                              }`}
                            >
                              <div className='text-left'>
                                <div className='font-medium'>
                                  {timezone.label}
                                </div>
                                <div className='text-sm text-secondary'>
                                  {timezone.value}
                                </div>
                              </div>
                              <div className='text-sm font-mono'>
                                {timezone.offset}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 여권 국가 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Passport className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>여권 발급 국가</h3>
                    <p className='text-sm text-secondary'>
                      비자 요구사항 확인을 위한 여권 발급 국가를 선택하세요
                    </p>
                  </div>
                </div>

                {/* 국가 검색 */}
                <div className='relative mb-6'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary' />
                  <input
                    type='text'
                    placeholder='국가 검색...'
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                {/* 국가 목록 */}
                <div className='grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto'>
                  {COUNTRIES.filter(
                    country =>
                      countrySearch === '' ||
                      country.name
                        .toLowerCase()
                        .includes(countrySearch.toLowerCase())
                  ).map(country => (
                    <button
                      key={country.code}
                      onClick={() =>
                        saveSettings({ passportCountry: country.code })
                      }
                      disabled={isLoading}
                      className={`p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                        settings.passportCountry === country.code
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-surface'
                      }`}
                    >
                      <span className='text-xl'>{country.flag}</span>
                      <div className='text-left'>
                        <div className='font-medium'>{country.name}</div>
                        <div className='text-sm text-secondary'>
                          {country.code}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 통화 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <DollarSign className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>기본 통화</h3>
                    <p className='text-sm text-secondary'>
                      여행 경비 및 가격 표시에 사용할 기본 통화를 선택하세요
                    </p>
                  </div>
                </div>

                {/* 인기 통화 */}
                <div className='mb-6'>
                  <h4 className='font-medium text-sm text-secondary mb-3'>
                    인기 통화
                  </h4>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                    {getPopularCurrencies().map(currency => (
                      <button
                        key={currency.code}
                        onClick={() =>
                          saveSettings({ currency: currency.code })
                        }
                        disabled={isLoading}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          settings.currency === currency.code
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-surface'
                        }`}
                      >
                        <span className='text-lg font-bold'>
                          {currency.symbol}
                        </span>
                        <div className='text-center'>
                          <div className='font-medium text-sm'>
                            {currency.code}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 모든 통화 */}
                <div>
                  <h4 className='font-medium text-sm text-secondary mb-3'>
                    모든 통화
                  </h4>
                  <div className='grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto'>
                    {CURRENCIES.map(currency => (
                      <button
                        key={currency.code}
                        onClick={() =>
                          saveSettings({ currency: currency.code })
                        }
                        disabled={isLoading}
                        className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                          settings.currency === currency.code
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-surface'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <span className='font-bold text-lg'>
                            {currency.symbol}
                          </span>
                          <div className='text-left'>
                            <div className='font-medium'>{currency.code}</div>
                            <div className='text-sm text-secondary'>
                              {currency.name}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 단위 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Settings className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>단위 설정</h3>
                    <p className='text-sm text-secondary'>
                      거리, 온도 등에 사용할 단위 체계를 선택하세요
                    </p>
                  </div>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  {[
                    {
                      key: 'metric',
                      name: '미터법',
                      description: 'km, °C, kg 등',
                      examples: '거리: km • 온도: °C • 무게: kg',
                    },
                    {
                      key: 'imperial',
                      name: '야드파운드법',
                      description: 'miles, °F, lbs 등',
                      examples: '거리: miles • 온도: °F • 무게: lbs',
                    },
                  ].map(({ key, name, description, examples }) => (
                    <button
                      key={key}
                      onClick={() => saveSettings({ units: key as any })}
                      disabled={isLoading}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        settings.units === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-surface'
                      }`}
                    >
                      <div className='font-medium mb-1'>{name}</div>
                      <div className='text-sm text-secondary mb-2'>
                        {description}
                      </div>
                      <div className='text-xs text-secondary'>{examples}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 알림 설정 탭 */}
          {activeTab === 'notifications' && (
            <div className='space-y-8'>
              {/* 이메일 알림 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Mail className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>이메일 알림</h3>
                    <p className='text-sm text-secondary'>
                      이메일로 받을 알림을 설정하세요
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  {[
                    {
                      key: 'email',
                      name: '기본 이메일 알림',
                      description: '중요한 시스템 알림을 이메일로 받습니다',
                    },
                    {
                      key: 'visaReminders',
                      name: '비자 알림',
                      description: '비자 만료, 체류 제한 등 중요한 알림',
                    },
                    {
                      key: 'tripReminders',
                      name: '여행 일정 알림',
                      description: '출발 전 체크리스트, 일정 변경 등',
                    },
                    {
                      key: 'weeklyDigest',
                      name: '주간 요약',
                      description: '매주 여행 통계와 추천 정보',
                    },
                    {
                      key: 'marketingEmails',
                      name: '마케팅 이메일',
                      description: '새로운 기능, 프로모션 등의 소식',
                    },
                  ].map(({ key, name, description }) => (
                    <div
                      key={key}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div>
                        <div className='font-medium'>{name}</div>
                        <div className='text-sm text-secondary'>
                          {description}
                        </div>
                      </div>
                      <label className='switch'>
                        <input
                          type='checkbox'
                          checked={
                            settings.notifications[
                              key as keyof typeof settings.notifications
                            ]
                          }
                          onChange={e =>
                            saveSettings({
                              notifications: {
                                ...settings.notifications,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          disabled={isLoading}
                        />
                        <span className='slider'></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 브라우저 알림 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Bell className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>브라우저 알림</h3>
                    <p className='text-sm text-secondary'>
                      실시간 브라우저 푸시 알림 설정
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>푸시 알림</div>
                      <div className='text-sm text-secondary'>
                        브라우저 푸시 알림을 활성화합니다
                      </div>
                    </div>
                    <label className='switch'>
                      <input
                        type='checkbox'
                        checked={settings.notifications.push}
                        onChange={async e => {
                          if (e.target.checked && 'Notification' in window) {
                            const permission =
                              await Notification.requestPermission();
                            if (permission === 'granted') {
                              saveSettings({
                                notifications: {
                                  ...settings.notifications,
                                  push: true,
                                },
                              });
                            }
                          } else {
                            saveSettings({
                              notifications: {
                                ...settings.notifications,
                                push: false,
                              },
                            });
                          }
                        }}
                        disabled={isLoading}
                      />
                      <span className='slider'></span>
                    </label>
                  </div>

                  {!('Notification' in window) && (
                    <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                      <div className='flex items-center gap-2'>
                        <AlertTriangle className='h-5 w-5 text-orange-600' />
                        <p className='text-sm text-orange-800'>
                          이 브라우저는 푸시 알림을 지원하지 않습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 개인정보 설정 탭 */}
          {activeTab === 'privacy' && (
            <div className='space-y-8'>
              {/* 계정 보안 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Lock className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>계정 보안</h3>
                    <p className='text-sm text-secondary'>
                      계정 보안 설정을 관리하세요
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>2단계 인증</div>
                      <div className='text-sm text-secondary'>
                        Google 계정의 2단계 인증 사용 (권장)
                      </div>
                    </div>
                    <span className='text-sm text-green-600 font-medium'>
                      활성화됨
                    </span>
                  </div>

                  <Link
                    href='/profile/security'
                    className='block p-4 border rounded-lg hover:bg-surface transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium'>비밀번호 변경</div>
                        <div className='text-sm text-secondary'>
                          Google 계정에서 비밀번호를 변경하세요
                        </div>
                      </div>
                      <ChevronDown className='h-4 w-4 transform -rotate-90' />
                    </div>
                  </Link>
                </div>
              </div>

              {/* 개인정보 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Eye className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>개인정보 설정</h3>
                    <p className='text-sm text-secondary'>
                      개인정보 공개 및 수집 설정을 관리하세요
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>프로필 공개 설정</div>
                      <div className='text-sm text-secondary'>
                        다른 사용자에게 프로필 정보 공개 여부
                      </div>
                    </div>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={e =>
                        saveSettings({
                          privacy: {
                            ...settings.privacy,
                            profileVisibility: e.target.value as
                              | 'public'
                              | 'private',
                          },
                        })
                      }
                      disabled={isLoading}
                      className='px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    >
                      <option value='private'>비공개</option>
                      <option value='public'>공개</option>
                    </select>
                  </div>

                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>서비스 개선 데이터 공유</div>
                      <div className='text-sm text-secondary'>
                        익명화된 사용 패턴 데이터를 서비스 개선에 활용
                      </div>
                    </div>
                    <label className='switch'>
                      <input
                        type='checkbox'
                        checked={settings.privacy.dataSharing}
                        onChange={e =>
                          saveSettings({
                            privacy: {
                              ...settings.privacy,
                              dataSharing: e.target.checked,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                      <span className='slider'></span>
                    </label>
                  </div>

                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>사용 분석</div>
                      <div className='text-sm text-secondary'>
                        앱 사용 패턴 분석을 통한 개인화 서비스
                      </div>
                    </div>
                    <label className='switch'>
                      <input
                        type='checkbox'
                        checked={settings.privacy.analytics}
                        onChange={e =>
                          saveSettings({
                            privacy: {
                              ...settings.privacy,
                              analytics: e.target.checked,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                      <span className='slider'></span>
                    </label>
                  </div>

                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <div className='font-medium'>위치 추적</div>
                      <div className='text-sm text-secondary'>
                        여행 통계 및 위치 기반 추천을 위한 위치 정보 수집
                      </div>
                    </div>
                    <label className='switch'>
                      <input
                        type='checkbox'
                        checked={settings.privacy.locationTracking}
                        onChange={e =>
                          saveSettings({
                            privacy: {
                              ...settings.privacy,
                              locationTracking: e.target.checked,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Gmail 연동 설정 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Mail className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>Gmail 연동</h3>
                    <p className='text-sm text-secondary'>
                      Gmail에서 자동으로 여행 정보를 가져옵니다
                    </p>
                  </div>
                </div>

                {/* 연동 상태 */}
                <div
                  className={`p-4 rounded-lg mb-6 ${settings.integration.gmailConnected ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}
                >
                  <div className='flex items-center gap-3'>
                    {settings.integration.gmailConnected ? (
                      <>
                        <CheckCircle className='h-5 w-5 text-green-600' />
                        <div>
                          <p className='font-medium text-green-800'>
                            Gmail이 연동되었습니다
                          </p>
                          <p className='text-sm text-green-600'>
                            마지막 동기화:{' '}
                            {settings.integration.lastSync || '방금 전'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info className='h-5 w-5 text-orange-600' />
                        <div>
                          <p className='font-medium text-orange-800'>
                            Gmail 연동이 필요합니다
                          </p>
                          <p className='text-sm text-orange-600'>
                            연동하면 자동으로 여행 정보를 추출할 수 있습니다
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 연동 버튼 */}
                <div className='flex gap-3'>
                  {settings.integration.gmailConnected ? (
                    <>
                      <button
                        onClick={() =>
                          saveSettings({
                            integration: {
                              ...settings.integration,
                              lastSync: new Date().toLocaleString('ko-KR'),
                            },
                          })
                        }
                        disabled={isLoading}
                        className='flex-1 btn btn-primary'
                      >
                        <Mail className='h-4 w-4 mr-2' />
                        지금 동기화하기
                      </button>
                      <button
                        onClick={() =>
                          saveSettings({
                            integration: {
                              gmailConnected: false,
                              lastSync: undefined,
                            },
                          })
                        }
                        disabled={isLoading}
                        className='btn btn-ghost text-red-600 border-red-200 hover:bg-red-50'
                      >
                        연동 해제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        // Gmail 연동 상태 확인 및 연결 테스트
                        try {
                          const response = await fetch('/api/gmail/check');
                          const data = await response.json();

                          if (data.connected) {
                            // 이미 연결됨 - 상태 업데이트
                            saveSettings({
                              integration: {
                                gmailConnected: true,
                                lastSync: new Date().toLocaleString('ko-KR'),
                              },
                            });
                          } else {
                            // 재인증 필요 - Google OAuth로 리다이렉트
                            window.location.href =
                              '/api/auth/signin?callbackUrl=' +
                              encodeURIComponent(window.location.href);
                          }
                        } catch (error) {
                          console.error('Gmail 연동 확인 실패:', error);
                          // 오류 시 재인증 시도
                          window.location.href =
                            '/api/auth/signin?callbackUrl=' +
                            encodeURIComponent(window.location.href);
                        }
                      }}
                      disabled={isLoading}
                      className='w-full btn btn-primary flex items-center justify-center gap-2'
                    >
                      <Mail className='h-5 w-5' />
                      Gmail 연동하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 데이터 관리 탭 */}
          {activeTab === 'data' && (
            <div className='space-y-8'>
              {/* 데이터 백업 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <Download className='h-5 w-5 text-primary' />
                  <div>
                    <h3 className='text-lg font-semibold'>데이터 백업</h3>
                    <p className='text-sm text-secondary'>
                      여행 데이터를 안전하게 백업하고 복원하세요
                    </p>
                  </div>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <button
                    onClick={exportData}
                    disabled={isLoading}
                    className='p-4 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-3'
                  >
                    <Download className='h-5 w-5' />
                    <div className='text-left'>
                      <div className='font-medium'>데이터 내보내기</div>
                      <div className='text-sm opacity-80'>
                        모든 여행 데이터를 JSON으로 다운로드
                      </div>
                    </div>
                  </button>

                  <button
                    disabled
                    className='p-4 border border-border text-secondary rounded-lg opacity-50 flex items-center gap-3'
                  >
                    <Upload className='h-5 w-5' />
                    <div className='text-left'>
                      <div className='font-medium'>데이터 가져오기</div>
                      <div className='text-sm'>
                        백업 파일에서 데이터 복원 (준비중)
                      </div>
                    </div>
                  </button>
                </div>

                {/* 자동 백업 설정 */}
                <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                  <div className='flex items-center gap-3 mb-2'>
                    <Shield className='h-5 w-5 text-blue-600' />
                    <h4 className='font-medium text-blue-800'>자동 백업</h4>
                  </div>
                  <p className='text-sm text-blue-600 mb-3'>
                    데이터는 Google 계정에 자동으로 동기화됩니다. 추가 백업이
                    필요한 경우 위 버튼을 사용하세요.
                  </p>
                  <div className='text-xs text-blue-500'>
                    마지막 동기화: {new Date().toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              {/* 계정 삭제 */}
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <AlertTriangle className='h-5 w-5 text-red-500' />
                  <div>
                    <h3 className='text-lg font-semibold text-red-700'>
                      계정 삭제
                    </h3>
                    <p className='text-sm text-red-600'>
                      계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다
                    </p>
                  </div>
                </div>

                {/* 삭제 경고 */}
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                  <h4 className='font-medium text-red-800 mb-2'>
                    삭제되는 데이터:
                  </h4>
                  <ul className='text-sm text-red-700 space-y-1'>
                    <li>• 모든 여행 기록 및 일정</li>
                    <li>• 비자 정보 및 여권 데이터</li>
                    <li>• 개인 설정 및 선호도</li>
                    <li>• Gmail 연동 정보</li>
                    <li>• 계정 및 프로필 정보</li>
                  </ul>
                </div>

                {/* 삭제 확인 */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    계정 삭제하기
                  </button>
                ) : (
                  <div className='space-y-4'>
                    <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <p className='font-medium text-red-800 mb-2'>
                        정말로 계정을 삭제하시겠습니까?
                      </p>
                      <p className='text-sm text-red-600'>
                        이 작업은 되돌릴 수 없습니다. 계속하려면 아래에
                        "DELETE"를 입력하세요.
                      </p>
                    </div>
                    <input
                      type='text'
                      placeholder='DELETE 입력'
                      className='w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                    />
                    <div className='flex gap-3'>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className='flex-1 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors'
                      >
                        취소
                      </button>
                      <button
                        disabled
                        className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg opacity-50 cursor-not-allowed'
                      >
                        영구 삭제 (준비중)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
