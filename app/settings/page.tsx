'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';
import {
  getCurrentLocale,
  setLocale,
  getSupportedLocales,
  type Locale,
} from '@/lib/i18n';
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
} from 'lucide-react';

interface UserSettings {
  language: Locale;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    visaReminders: boolean;
    tripReminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
  };
  integration: {
    gmailConnected: boolean;
    lastSync?: string;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    language: 'ko',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      visaReminders: true,
      tripReminders: true,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
    },
    integration: {
      gmailConnected: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
          title='⚙️ 설정'
          description='앱 설정과 개인정보를 관리하세요'
        />

        {/* 저장 메시지 */}
        {saveMessage && (
          <div
            className={`alert ${saveMessage.includes('실패') ? 'alert-error' : 'alert-success'} mb-6`}
          >
            {saveMessage}
          </div>
        )}

        <div className='grid lg:grid-cols-4 gap-8'>
          {/* 사이드바 메뉴 */}
          <div className='lg:col-span-1'>
            <div className='card p-6'>
              <nav className='space-y-2'>
                <div className='text-sm font-medium text-secondary mb-4'>
                  설정 메뉴
                </div>
                <div className='space-y-1'>
                  <button className='w-full flex items-center gap-3 p-3 text-left rounded-md bg-primary/10 text-primary'>
                    <User className='h-4 w-4' />
                    계정 설정
                  </button>
                  <Link
                    href='/profile'
                    className='w-full flex items-center gap-3 p-3 text-left rounded-md hover:bg-surface transition-colors'
                  >
                    <User className='h-4 w-4' />
                    프로필 관리
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* 메인 설정 영역 */}
          <div className='lg:col-span-3 space-y-8'>
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

            {/* 알림 설정 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <Bell className='h-5 w-5 text-primary' />
                <div>
                  <h3 className='text-lg font-semibold'>알림 설정</h3>
                  <p className='text-sm text-secondary'>
                    받고 싶은 알림을 선택하세요
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                {[
                  {
                    key: 'email',
                    name: '이메일 알림',
                    description: '중요한 정보를 이메일로 받습니다',
                  },
                  {
                    key: 'push',
                    name: '푸시 알림',
                    description: '브라우저 푸시 알림을 받습니다',
                  },
                  {
                    key: 'visaReminders',
                    name: '비자 알림',
                    description: '비자 만료 및 체류 제한 알림',
                  },
                  {
                    key: 'tripReminders',
                    name: '여행 알림',
                    description: '여행 일정 관련 알림',
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
              <div className={`p-4 rounded-lg mb-6 ${settings.integration.gmailConnected ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <div className='flex items-center gap-3'>
                  {settings.integration.gmailConnected ? (
                    <>
                      <CheckCircle className='h-5 w-5 text-green-600' />
                      <div>
                        <p className='font-medium text-green-800'>Gmail이 연동되었습니다</p>
                        <p className='text-sm text-green-600'>
                          마지막 동기화: {settings.integration.lastSync || '방금 전'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className='h-5 w-5 text-orange-600' />
                      <div>
                        <p className='font-medium text-orange-800'>Gmail 연동이 필요합니다</p>
                        <p className='text-sm text-orange-600'>
                          연동하면 자동으로 여행 정보를 추출할 수 있습니다
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gmail 연동의 이점 */}
              <div className='bg-surface rounded-lg p-6 mb-6'>
                <h4 className='font-semibold mb-4 flex items-center gap-2'>
                  <span className='text-xl'>✨</span>
                  Gmail 연동의 이점
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <span className='text-green-600 mt-0.5'>✓</span>
                    <div>
                      <p className='font-medium'>자동 여행 정보 추출</p>
                      <p className='text-sm text-secondary'>항공권, 호텔 예약 이메일에서 자동으로 일정을 추출합니다</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <span className='text-green-600 mt-0.5'>✓</span>
                    <div>
                      <p className='font-medium'>실시간 업데이트</p>
                      <p className='text-sm text-secondary'>항공편 변경, 호텔 확인 등 업데이트를 실시간으로 반영합니다</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <span className='text-green-600 mt-0.5'>✓</span>
                    <div>
                      <p className='font-medium'>비자 정보 알림</p>
                      <p className='text-sm text-secondary'>비자 승인, 여권 갱신 알림 등을 자동으로 감지합니다</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <span className='text-green-600 mt-0.5'>✓</span>
                    <div>
                      <p className='font-medium'>스마트 분류</p>
                      <p className='text-sm text-secondary'>여행 관련 이메일을 자동으로 분류하고 정리합니다</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연동 방법 안내 */}
              <div className='bg-blue-50 rounded-lg p-6 mb-6'>
                <h4 className='font-semibold mb-4 flex items-center gap-2'>
                  <span className='text-xl'>📋</span>
                  간단한 연동 방법
                </h4>
                <ol className='space-y-3'>
                  <li className='flex items-start gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>1</span>
                    <div>
                      <p className='font-medium'>아래 "Gmail 연동하기" 버튼을 클릭합니다</p>
                      <p className='text-sm text-secondary'>Google 로그인 페이지로 이동합니다</p>
                    </div>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>2</span>
                    <div>
                      <p className='font-medium'>Google 계정으로 로그인합니다</p>
                      <p className='text-sm text-secondary'>평소 사용하는 Gmail 계정을 선택하세요</p>
                    </div>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>3</span>
                    <div>
                      <p className='font-medium'>DINO에 권한을 부여합니다</p>
                      <p className='text-sm text-secondary'>여행 관련 이메일만 읽기 권한을 요청합니다</p>
                    </div>
                  </li>
                  <li className='flex items-start gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>4</span>
                    <div>
                      <p className='font-medium'>완료! 자동으로 동기화가 시작됩니다</p>
                      <p className='text-sm text-secondary'>몇 분 안에 여행 정보가 나타납니다</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* 개인정보 보호 안내 */}
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <Shield className='h-5 w-5 text-gray-600 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-gray-800 mb-1'>🔒 개인정보는 안전합니다</p>
                    <p className='text-gray-600'>
                      • 여행 관련 이메일만 접근합니다<br />
                      • 이메일 내용은 서버에 저장되지 않습니다<br />
                      • 언제든지 연동을 해제할 수 있습니다<br />
                      • OAuth 2.0 보안 프로토콜을 사용합니다
                    </p>
                  </div>
                </div>
              </div>

              {/* 연동 버튼 */}
              <div className='flex gap-3'>
                {settings.integration.gmailConnected ? (
                  <>
                    <button
                      onClick={() => saveSettings({
                        integration: {
                          ...settings.integration,
                          lastSync: new Date().toLocaleString('ko-KR')
                        }
                      })}
                      disabled={isLoading}
                      className='flex-1 btn btn-primary'
                    >
                      <Mail className='h-4 w-4 mr-2' />
                      지금 동기화하기
                    </button>
                    <button
                      onClick={() => saveSettings({
                        integration: {
                          gmailConnected: false,
                          lastSync: undefined
                        }
                      })}
                      disabled={isLoading}
                      className='btn btn-ghost text-red-600 border-red-200 hover:bg-red-50'
                    >
                      연동 해제
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      // Gmail OAuth 플로우 시작
                      // 실제로는 OAuth 인증 URL로 리다이렉트
                      saveSettings({
                        integration: {
                          gmailConnected: true,
                          lastSync: new Date().toLocaleString('ko-KR')
                        }
                      });
                    }}
                    disabled={isLoading}
                    className='w-full btn btn-primary flex items-center justify-center gap-2'
                  >
                    <Mail className='h-5 w-5' />
                    Gmail 연동하기
                  </button>
                )}
              </div>

              {/* FAQ */}
              <div className='mt-6 pt-6 border-t'>
                <details className='text-sm'>
                  <summary className='cursor-pointer font-medium text-secondary hover:text-primary'>
                    자주 묻는 질문 (FAQ)
                  </summary>
                  <div className='mt-4 space-y-4 text-secondary'>
                    <div>
                      <p className='font-medium text-primary'>Q: 어떤 이메일을 읽나요?</p>
                      <p>A: 항공사, 호텔, 렌터카 등 여행 관련 발신자의 이메일만 읽습니다.</p>
                    </div>
                    <div>
                      <p className='font-medium text-primary'>Q: 개인 이메일도 읽나요?</p>
                      <p>A: 아니요, 여행 예약 확인 이메일만 필터링하여 읽습니다.</p>
                    </div>
                    <div>
                      <p className='font-medium text-primary'>Q: 연동을 해제하면 어떻게 되나요?</p>
                      <p>A: 더 이상 새 이메일을 읽지 않지만, 이미 추출된 여행 정보는 유지됩니다.</p>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* 개인정보 설정 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <Shield className='h-5 w-5 text-primary' />
                <div>
                  <h3 className='text-lg font-semibold'>개인정보 설정</h3>
                  <p className='text-sm text-secondary'>
                    개인정보 보호 설정을 관리하세요
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
                    <div className='font-medium'>데이터 공유</div>
                    <div className='text-sm text-secondary'>
                      서비스 개선을 위한 익명 데이터 공유
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
              </div>
            </div>

            {/* 데이터 관리 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <Download className='h-5 w-5 text-primary' />
                <div>
                  <h3 className='text-lg font-semibold'>데이터 관리</h3>
                  <p className='text-sm text-secondary'>
                    데이터를 백업하거나 계정을 관리하세요
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

              {/* 위험 영역 */}
              <div className='mt-8 pt-6 border-t border-border'>
                <div className='text-sm font-medium text-red-600 mb-4'>
                  위험 영역
                </div>
                <button
                  disabled
                  className='p-4 border border-red-200 text-red-600 rounded-lg opacity-50 flex items-center gap-3'
                >
                  <Trash2 className='h-5 w-5' />
                  <div className='text-left'>
                    <div className='font-medium'>계정 삭제</div>
                    <div className='text-sm opacity-80'>
                      모든 데이터가 영구적으로 삭제됩니다 (준비중)
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
