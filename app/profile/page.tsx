'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PageIcons } from '@/components/common/PageHeader';
import {
  StandardPageLayout,
  // StandardCard,
  // StatsCard,
} from '@/components/layout/StandardPageLayout';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';
import {
  User,
  // Mail,
  Calendar,
  // MapPin,
  Globe,
  Camera,
  Save,
  // ArrowLeft,
  Phone,
  Shield,
  Lock,
  Download,
  Trash2,
  Bell,
  Eye,
  // EyeOff,
  AlertCircle,
  CheckCircle,
  // Upload,
  X,
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  nationality: string;
  dateOfBirth: string;
  travelPreferences: {
    favoriteCountries: string[];
    travelStyle: 'budget' | 'comfort' | 'luxury';
    groupSize: 'solo' | 'couple' | 'group';
  };
  visaInfo: {
    passportCountry: string;
    passportExpiry: string;
    preferredLanguage: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  notifications: {
    tripReminders: boolean;
    visaAlerts: boolean;
    promotions: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    nationality: '',
    dateOfBirth: '',
    travelPreferences: {
      favoriteCountries: [],
      travelStyle: 'comfort',
      groupSize: 'solo',
    },
    visaInfo: {
      passportCountry: '',
      passportExpiry: '',
      preferredLanguage: 'ko',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    privacy: {
      profileVisibility: 'friends',
      showEmail: false,
      showPhone: false,
    },
    notifications: {
      tripReminders: true,
      visaAlerts: true,
      promotions: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'travel' | 'account' | 'privacy'
  >('profile');
  const [_showPassword, _setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [travelStats, setTravelStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    daysAbroad: 0,
    nextTrip: null as any,
  });

  // 프로필 로드
  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));

      // 로컬스토리지에서 추가 프로필 정보 로드
      const savedProfile = localStorage.getItem('dino-user-profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }

      // 아바타 URL 로드
      const savedAvatar = localStorage.getItem('dino-user-avatar');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }

      // 여행 통계 로드
      loadTravelStats();
    }
  }, [session]);

  // 여행 통계 로드
  const loadTravelStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setTravelStats(data);
      }
    } catch (error) {
      console.error('Failed to load travel stats:', error);
    }
  };

  // 프로필 저장
  const saveProfile = async () => {
    setIsLoading(true);
    try {
      // 로컬스토리지에 저장
      localStorage.setItem('dino-user-profile', JSON.stringify(profile));

      setSaveMessage('프로필이 저장되었습니다.');
      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('프로필 저장에 실패했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 완성도 계산
  const calculateCompletion = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.bio,
      profile.location,
      profile.nationality,
      profile.dateOfBirth,
      profile.travelPreferences.travelStyle,
      profile.travelPreferences.groupSize,
      profile.visaInfo.passportCountry,
      profile.visaInfo.passportExpiry,
      profile.emergencyContact.name,
      profile.emergencyContact.phone,
    ];

    const filledFields = fields.filter(
      field => field && field.length > 0
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // 완성도에 따른 보상 레벨
  const getRewardLevel = () => {
    if (completionPercentage >= 100)
      return { level: '🏆', message: '프로필 마스터!', color: 'gold' };
    if (completionPercentage >= 80)
      return { level: '🥈', message: '거의 다 완성!', color: 'silver' };
    if (completionPercentage >= 60)
      return { level: '🥉', message: '좋은 시작!', color: 'bronze' };
    if (completionPercentage >= 40)
      return { level: '⭐', message: '계속 진행해보세요!', color: 'blue' };
    return { level: '🌱', message: '프로필을 시작해보세요!', color: 'green' };
  };

  const reward = getRewardLevel();

  // 입력 핸들러
  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setProfile(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setProfile(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof UserProfile] as Record<string, any>),
          [keys[1]]: value,
        },
      }));
    } else if (keys.length === 3) {
      setProfile(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as keyof UserProfile] as Record<string, any>),
          [keys[1]]: {
            ...(prev[keys[0] as keyof UserProfile] as any)[keys[1]],
            [keys[2]]: value,
          },
        },
      }));
    }
  };

  // 아바타 업로드
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem('dino-user-avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 데이터 내보내기
  const exportData = () => {
    const dataToExport = {
      profile,
      travelStats,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dino-profile-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSaveMessage('프로필 데이터를 다운로드했습니다.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정 삭제 동의') {
      return;
    }

    setIsLoading(true);
    try {
      // 실제로는 API 호출
      localStorage.removeItem('dino-user-profile');
      localStorage.removeItem('dino-user-avatar');
      setSaveMessage('계정이 삭제되었습니다. 로그아웃됩니다...');
      setTimeout(() => {
        window.location.href = '/api/auth/signout';
      }, 2000);
    } catch (error) {
      setSaveMessage('계정 삭제에 실패했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
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
        <div className='bg-white rounded-lg shadow-md p-16 text-center max-w-md'>
          <div className='text-5xl mb-5'>👤</div>
          <h3 className='text-lg font-bold mb-2'>로그인이 필요합니다</h3>
          <p className='text-sm text-muted-foreground mb-8'>
            프로필을 관리하려면 먼저 로그인해주세요.
          </p>
          <Link
            href='/auth/signin'
            className='bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <StandardPageLayout
      title='프로필 관리'
      description='개인 정보와 여행 선호도를 관리하세요'
      icon={PageIcons.Profile}
      breadcrumbs={[
        { label: '대시보드', href: '/dashboard' },
        { label: '프로필' },
      ]}
      headerActions={
        <div className='flex items-center gap-2'>
          {!isEditing ? (
            <>
              <button
                onClick={exportData}
                className='px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                내보내기
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                프로필 수정
              </button>
            </>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                disabled={isLoading}
              >
                취소
              </button>
              <button
                onClick={saveProfile}
                disabled={isLoading}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2'
              >
                <Save className='h-4 w-4' />
                {isLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          )}
        </div>
      }
    >
      {/* 프로필 완성도 섹션 */}
      <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-xl font-bold mb-2'>프로필 완성도</h3>
            <p className='text-sm opacity-90'>
              프로필을 완성하면 더 정확한 맞춤 추천을 받을 수 있어요!
            </p>
          </div>
          <div className='text-center'>
            <div className='text-4xl mb-1'>{reward.level}</div>
            <p className='text-xs'>{reward.message}</p>
          </div>
        </div>

        <div className='mb-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium'>
              {completionPercentage}% 완성
            </span>
            <button
              onClick={() => setShowRewards(!showRewards)}
              className='text-xs underline opacity-75 hover:opacity-100'
            >
              보상 보기
            </button>
          </div>
          <div className='w-full bg-white/20 rounded-full h-3'>
            <div
              className='h-3 rounded-full transition-all duration-500 bg-white'
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* 보상 시스템 설명 */}
        {showRewards && (
          <div className='mt-4 p-4 bg-white/10 rounded-lg'>
            <h4 className='font-bold mb-3'>🎁 프로필 완성 보상</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-3'>
                <span>🌱 0-39%</span>
                <span>기본 기능 사용</span>
              </div>
              <div className='flex items-center gap-3'>
                <span>⭐ 40-59%</span>
                <span>개인화된 여행 추천</span>
              </div>
              <div className='flex items-center gap-3'>
                <span>🥉 60-79%</span>
                <span>고급 통계 및 인사이트</span>
              </div>
              <div className='flex items-center gap-3'>
                <span>🥈 80-99%</span>
                <span>AI 여행 어시스턴트 활성화</span>
              </div>
              <div className='flex items-center gap-3'>
                <span>🏆 100%</span>
                <span>프리미엄 기능 모두 해제!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 저장 메시지 */}
      {saveMessage && (
        <div
          className={`rounded-lg p-4 mb-6 flex items-center gap-2 ${
            saveMessage.includes('실패')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {saveMessage.includes('실패') ? (
            <AlertCircle className='h-5 w-5' />
          ) : (
            <CheckCircle className='h-5 w-5' />
          )}
          {saveMessage}
        </div>
      )}

      <div className='grid lg:grid-cols-4 gap-8'>
        {/* 프로필 카드 */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg shadow-md p-6 text-center relative'>
            {/* 완성도 뱃지 */}
            {completionPercentage >= 100 && (
              <div
                className='absolute top-4 right-4 text-2xl'
                title='프로필 완성!'
              >
                {reward.level}
              </div>
            )}

            <div className='relative inline-block mb-4'>
              {avatarUrl || session.user?.image ? (
                <img
                  src={avatarUrl || session.user.image!}
                  alt={profile.name || 'User'}
                  className='w-24 h-24 rounded-full border-4 border-border object-cover'
                />
              ) : (
                <div className='w-24 h-24 rounded-full bg-muted border-4 border-border flex items-center justify-center'>
                  <User className='h-12 w-12 text-muted-foreground' />
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors'
                  >
                    <Camera className='h-4 w-4' />
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={() => {
                        setAvatarUrl('');
                        localStorage.removeItem('dino-user-avatar');
                      }}
                      className='absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  )}
                </>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleAvatarUpload}
                className='hidden'
              />
            </div>

            <h2 className='text-xl font-bold mb-2'>
              {profile.name || 'Unknown User'}
            </h2>
            <p className='text-sm text-muted-foreground mb-4'>
              {profile.email}
            </p>

            {/* 여행 통계 */}
            <div className='border-t pt-4 space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>총 여행</span>
                <span className='font-medium'>{travelStats.totalTrips}회</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>방문 국가</span>
                <span className='font-medium'>
                  {travelStats.countriesVisited}개국
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>해외 체류</span>
                <span className='font-medium'>{travelStats.daysAbroad}일</span>
              </div>
              {travelStats.nextTrip && (
                <div className='mt-4 p-3 bg-blue-50 rounded-md'>
                  <p className='text-xs text-blue-600 mb-1'>다음 여행</p>
                  <p className='text-sm font-medium'>
                    {travelStats.nextTrip.country}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {travelStats.nextTrip.date}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 상세 정보 탭 */}
        <div className='lg:col-span-3'>
          {/* 탭 네비게이션 */}
          <div className='bg-white rounded-lg shadow-md mb-6'>
            <div className='flex border-b'>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                기본 정보
              </button>
              <button
                onClick={() => setActiveTab('travel')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'travel'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                여행 정보
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                계정 설정
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'privacy'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                개인정보
              </button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className='space-y-6'>
            {/* 기본 정보 탭 */}
            {activeTab === 'profile' && (
              <>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <User className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>개인 정보</h3>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        이름
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.name}
                          onChange={e =>
                            handleInputChange('name', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='이름을 입력하세요'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.name || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        전화번호
                      </label>
                      {isEditing ? (
                        <input
                          type='tel'
                          value={profile.phone}
                          onChange={e =>
                            handleInputChange('phone', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='예: 010-1234-5678'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.phone || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        생년월일
                      </label>
                      {isEditing ? (
                        <input
                          type='date'
                          value={profile.dateOfBirth}
                          onChange={e =>
                            handleInputChange('dateOfBirth', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.dateOfBirth || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        거주지
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.location}
                          onChange={e =>
                            handleInputChange('location', e.target.value)
                          }
                          placeholder='예: 서울, 대한민국'
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.location || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        국적
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.nationality}
                          onChange={e =>
                            handleInputChange('nationality', e.target.value)
                          }
                          placeholder='예: 대한민국'
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.nationality || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium mb-2'>
                        자기소개
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profile.bio}
                          onChange={e =>
                            handleInputChange('bio', e.target.value)
                          }
                          placeholder='자신을 간단히 소개해보세요. 여행 스타일이나 관심사를 적어보세요!'
                          rows={3}
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <div className='px-3 py-2 bg-muted rounded-md min-h-[80px]'>
                          {profile.bio || '입력 필요'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 비상 연락처 */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Phone className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>비상 연락처</h3>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        이름
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.emergencyContact.name}
                          onChange={e =>
                            handleInputChange(
                              'emergencyContact.name',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='비상 연락처 이름'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.emergencyContact.name || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        관계
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.emergencyContact.relationship}
                          onChange={e =>
                            handleInputChange(
                              'emergencyContact.relationship',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='예: 부모님, 배우자'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.emergencyContact.relationship || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        전화번호
                      </label>
                      {isEditing ? (
                        <input
                          type='tel'
                          value={profile.emergencyContact.phone}
                          onChange={e =>
                            handleInputChange(
                              'emergencyContact.phone',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='예: 010-1234-5678'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.emergencyContact.phone || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        이메일
                      </label>
                      {isEditing ? (
                        <input
                          type='email'
                          value={profile.emergencyContact.email}
                          onChange={e =>
                            handleInputChange(
                              'emergencyContact.email',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                          placeholder='예: emergency@example.com'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.emergencyContact.email || '입력 필요'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 여행 정보 탭 */}
            {activeTab === 'travel' && (
              <>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Globe className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>여행 선호도</h3>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        여행 스타일
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.travelPreferences.travelStyle}
                          onChange={e =>
                            handleInputChange(
                              'travelPreferences.travelStyle',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value='budget'>예산 여행</option>
                          <option value='comfort'>편안한 여행</option>
                          <option value='luxury'>럭셔리 여행</option>
                        </select>
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.travelPreferences.travelStyle === 'budget'
                            ? '예산 여행'
                            : profile.travelPreferences.travelStyle ===
                                'comfort'
                              ? '편안한 여행'
                              : '럭셔리 여행'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        동반 유형
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.travelPreferences.groupSize}
                          onChange={e =>
                            handleInputChange(
                              'travelPreferences.groupSize',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value='solo'>혼자 여행</option>
                          <option value='couple'>커플 여행</option>
                          <option value='group'>그룹 여행</option>
                        </select>
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.travelPreferences.groupSize === 'solo'
                            ? '혼자 여행'
                            : profile.travelPreferences.groupSize === 'couple'
                              ? '커플 여행'
                              : '그룹 여행'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Calendar className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>비자 정보</h3>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        여권 발급국
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={profile.visaInfo.passportCountry}
                          onChange={e =>
                            handleInputChange(
                              'visaInfo.passportCountry',
                              e.target.value
                            )
                          }
                          placeholder='예: 대한민국'
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.visaInfo.passportCountry || '입력 필요'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        여권 만료일
                      </label>
                      {isEditing ? (
                        <input
                          type='date'
                          value={profile.visaInfo.passportExpiry}
                          onChange={e =>
                            handleInputChange(
                              'visaInfo.passportExpiry',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        />
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.visaInfo.passportExpiry ? (
                            <>
                              {profile.visaInfo.passportExpiry}
                              {(() => {
                                const expiry = new Date(
                                  profile.visaInfo.passportExpiry
                                );
                                const today = new Date();
                                const daysUntilExpiry = Math.ceil(
                                  (expiry.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                if (daysUntilExpiry < 180) {
                                  return (
                                    <span className='text-red-500 text-xs ml-2'>
                                      ⚠️ {daysUntilExpiry}일 남음
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          ) : (
                            '입력 필요'
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        선호 언어
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.visaInfo.preferredLanguage}
                          onChange={e =>
                            handleInputChange(
                              'visaInfo.preferredLanguage',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value='ko'>한국어</option>
                          <option value='en'>English</option>
                          <option value='ja'>日本語</option>
                          <option value='zh'>中文</option>
                          <option value='es'>Español</option>
                          <option value='fr'>Français</option>
                        </select>
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.visaInfo.preferredLanguage === 'ko'
                            ? '한국어'
                            : profile.visaInfo.preferredLanguage === 'en'
                              ? 'English'
                              : profile.visaInfo.preferredLanguage === 'ja'
                                ? '日本語'
                                : profile.visaInfo.preferredLanguage === 'zh'
                                  ? '中文'
                                  : profile.visaInfo.preferredLanguage === 'es'
                                    ? 'Español'
                                    : 'Français'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 계정 설정 탭 */}
            {activeTab === 'account' && (
              <>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Lock className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>보안 설정</h3>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium mb-2'>비밀번호 변경</h4>
                      <p className='text-sm text-muted-foreground mb-3'>
                        Google 계정으로 로그인하셨습니다. Google 계정 설정에서
                        비밀번호를 변경하세요.
                      </p>
                      <a
                        href='https://myaccount.google.com/security'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-700 text-sm'
                      >
                        Google 계정 보안 설정으로 이동 →
                      </a>
                    </div>

                    <div className='border-t pt-4'>
                      <h4 className='font-medium mb-2'>2단계 인증</h4>
                      <p className='text-sm text-muted-foreground mb-3'>
                        계정 보안을 강화하려면 2단계 인증을 활성화하세요.
                      </p>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-5 w-5 text-green-600' />
                        <span className='text-sm text-green-600'>
                          Google 2단계 인증 사용 중
                        </span>
                      </div>
                    </div>

                    <div className='border-t pt-4'>
                      <h4 className='font-medium mb-2'>연결된 기기</h4>
                      <p className='text-sm text-muted-foreground mb-3'>
                        현재 로그인된 기기: 1개
                      </p>
                      <button className='text-blue-600 hover:text-blue-700 text-sm'>
                        모든 기기에서 로그아웃 →
                      </button>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Bell className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>알림 설정</h3>
                  </div>

                  <div className='space-y-4'>
                    <label className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>여행 리마인더</span>
                      {isEditing ? (
                        <input
                          type='checkbox'
                          checked={profile.notifications.tripReminders}
                          onChange={e =>
                            handleInputChange(
                              'notifications.tripReminders',
                              e.target.checked
                            )
                          }
                          className='w-5 h-5 text-primary border-border rounded focus:ring-ring'
                        />
                      ) : (
                        <span
                          className={`text-sm ${profile.notifications.tripReminders ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {profile.notifications.tripReminders
                            ? '활성'
                            : '비활성'}
                        </span>
                      )}
                    </label>

                    <label className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        비자 만료 알림
                      </span>
                      {isEditing ? (
                        <input
                          type='checkbox'
                          checked={profile.notifications.visaAlerts}
                          onChange={e =>
                            handleInputChange(
                              'notifications.visaAlerts',
                              e.target.checked
                            )
                          }
                          className='w-5 h-5 text-primary border-border rounded focus:ring-ring'
                        />
                      ) : (
                        <span
                          className={`text-sm ${profile.notifications.visaAlerts ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {profile.notifications.visaAlerts ? '활성' : '비활성'}
                        </span>
                      )}
                    </label>

                    <label className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        프로모션 및 뉴스레터
                      </span>
                      {isEditing ? (
                        <input
                          type='checkbox'
                          checked={profile.notifications.promotions}
                          onChange={e =>
                            handleInputChange(
                              'notifications.promotions',
                              e.target.checked
                            )
                          }
                          className='w-5 h-5 text-primary border-border rounded focus:ring-ring'
                        />
                      ) : (
                        <span
                          className={`text-sm ${profile.notifications.promotions ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {profile.notifications.promotions ? '활성' : '비활성'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* 개인정보 탭 */}
            {activeTab === 'privacy' && (
              <>
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Eye className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>프라이버시 설정</h3>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        프로필 공개 범위
                      </label>
                      {isEditing ? (
                        <select
                          value={profile.privacy.profileVisibility}
                          onChange={e =>
                            handleInputChange(
                              'privacy.profileVisibility',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring'
                        >
                          <option value='public'>모든 사용자</option>
                          <option value='friends'>친구만</option>
                          <option value='private'>비공개</option>
                        </select>
                      ) : (
                        <p className='px-3 py-2 bg-muted rounded-md'>
                          {profile.privacy.profileVisibility === 'public'
                            ? '모든 사용자'
                            : profile.privacy.profileVisibility === 'friends'
                              ? '친구만'
                              : '비공개'}
                        </p>
                      )}
                    </div>

                    <label className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>이메일 공개</span>
                      {isEditing ? (
                        <input
                          type='checkbox'
                          checked={profile.privacy.showEmail}
                          onChange={e =>
                            handleInputChange(
                              'privacy.showEmail',
                              e.target.checked
                            )
                          }
                          className='w-5 h-5 text-primary border-border rounded focus:ring-ring'
                        />
                      ) : (
                        <span
                          className={`text-sm ${profile.privacy.showEmail ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {profile.privacy.showEmail ? '공개' : '비공개'}
                        </span>
                      )}
                    </label>

                    <label className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>전화번호 공개</span>
                      {isEditing ? (
                        <input
                          type='checkbox'
                          checked={profile.privacy.showPhone}
                          onChange={e =>
                            handleInputChange(
                              'privacy.showPhone',
                              e.target.checked
                            )
                          }
                          className='w-5 h-5 text-primary border-border rounded focus:ring-ring'
                        />
                      ) : (
                        <span
                          className={`text-sm ${profile.privacy.showPhone ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {profile.privacy.showPhone ? '공개' : '비공개'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Trash2 className='h-5 w-5 text-red-600' />
                    <h3 className='text-lg font-semibold'>데이터 관리</h3>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium mb-2'>데이터 내보내기</h4>
                      <p className='text-sm text-muted-foreground mb-3'>
                        모든 프로필 데이터를 JSON 형식으로 다운로드합니다.
                      </p>
                      <button
                        onClick={exportData}
                        className='px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2'
                      >
                        <Download className='h-4 w-4' />
                        데이터 내보내기
                      </button>
                    </div>

                    <div className='border-t pt-4'>
                      <h4 className='font-medium mb-2 text-red-600'>
                        계정 삭제
                      </h4>
                      <p className='text-sm text-muted-foreground mb-3'>
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할
                        수 없습니다.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
                        >
                          계정 삭제
                        </button>
                      ) : (
                        <div className='space-y-3'>
                          <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                            <p className='text-sm text-red-700 mb-2'>
                              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴
                              수 없습니다.
                            </p>
                            <p className='text-sm text-red-700'>
                              계속하려면 아래 입력란에{' '}
                              <strong>"계정 삭제 동의"</strong>를 입력하세요.
                            </p>
                          </div>
                          <input
                            type='text'
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder='계정 삭제 동의'
                            className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive'
                          />
                          <div className='flex gap-2'>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirmText('');
                              }}
                              className='px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors'
                            >
                              취소
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={
                                deleteConfirmText !== '계정 삭제 동의' ||
                                isLoading
                              }
                              className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              {isLoading ? '삭제 중...' : '영구 삭제'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
}
