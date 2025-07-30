'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Camera,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
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
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

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
    }
  }, [session]);

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
      profile.bio,
      profile.location,
      profile.nationality,
      profile.travelPreferences.travelStyle,
      profile.travelPreferences.groupSize,
      profile.visaInfo.passportCountry,
      profile.visaInfo.passportExpiry,
    ];
    
    const filledFields = fields.filter(field => field && field.length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // 완성도에 따른 보상 레벨
  const getRewardLevel = () => {
    if (completionPercentage >= 100) return { level: '🏆', message: '프로필 마스터!', color: 'gold' };
    if (completionPercentage >= 80) return { level: '🥈', message: '거의 다 완성!', color: 'silver' };
    if (completionPercentage >= 60) return { level: '🥉', message: '좋은 시작!', color: 'bronze' };
    if (completionPercentage >= 40) return { level: '⭐', message: '계속 진행해보세요!', color: 'blue' };
    return { level: '🌱', message: '프로필을 시작해보세요!', color: 'green' };
  };

  const reward = getRewardLevel();

  // 입력 핸들러
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfile],
          [child]: value,
        },
      }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
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
          <div className='text-5xl mb-5'>👤</div>
          <h3 className='text-lg font-bold mb-2'>로그인이 필요합니다</h3>
          <p className='text-sm text-secondary mb-8'>
            프로필을 관리하려면 먼저 로그인해주세요.
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
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Link href='/settings' className='btn btn-ghost btn-sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              설정으로 돌아가기
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className='btn btn-primary btn-sm'
              >
                프로필 수정
              </button>
            ) : (
              <div className='flex gap-2'>
                <button
                  onClick={() => setIsEditing(false)}
                  className='btn btn-ghost btn-sm'
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className='btn btn-primary btn-sm flex items-center gap-2'
                >
                  <Save className='h-4 w-4' />
                  {isLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>

        <PageHeader
          title='👤 프로필'
          description='개인 정보와 여행 선호도를 관리하세요'
        />

        {/* 프로필 완성도 섹션 */}
        <div className='card p-6 mb-8' style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
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

          {/* 섹션별 완성 뱃지 */}
          <div className='flex gap-2 mb-4'>
            {profile.name && profile.email && (
              <span className='text-xs bg-white/20 px-2 py-1 rounded-full'>
                ✅ 기본정보
              </span>
            )}
            {profile.bio && profile.location && profile.nationality && (
              <span className='text-xs bg-white/20 px-2 py-1 rounded-full'>
                ✅ 개인정보
              </span>
            )}
            {profile.travelPreferences.travelStyle && profile.travelPreferences.groupSize && (
              <span className='text-xs bg-white/20 px-2 py-1 rounded-full'>
                ✅ 여행스타일
              </span>
            )}
            {profile.visaInfo.passportCountry && profile.visaInfo.passportExpiry && (
              <span className='text-xs bg-white/20 px-2 py-1 rounded-full'>
                ✅ 비자정보
              </span>
            )}
          </div>
          
          <div className='mb-4'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium'>{completionPercentage}% 완성</span>
              <button
                onClick={() => setShowRewards(!showRewards)}
                className='text-xs underline opacity-75 hover:opacity-100'
              >
                보상 보기
              </button>
            </div>
            <div className='w-full bg-white/20 rounded-full h-3'>
              <div 
                className='h-3 rounded-full transition-all duration-500'
                style={{
                  width: `${completionPercentage}%`,
                  background: completionPercentage >= 100 ? '#ffd700' : 
                            completionPercentage >= 80 ? '#c0c0c0' :
                            completionPercentage >= 60 ? '#cd7f32' :
                            '#4299e1'
                }}
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
              
              {/* 아직 입력하지 않은 항목 */}
              {completionPercentage < 100 && (
                <div className='mt-4 pt-3 border-t border-white/20'>
                  <p className='text-xs font-bold mb-2'>📝 아직 입력하지 않은 항목:</p>
                  <div className='text-xs space-y-1'>
                    {!profile.name && <div>• 이름</div>}
                    {!profile.bio && <div>• 자기소개</div>}
                    {!profile.location && <div>• 거주지</div>}
                    {!profile.nationality && <div>• 국적</div>}
                    {!profile.visaInfo.passportCountry && <div>• 여권 발급국</div>}
                    {!profile.visaInfo.passportExpiry && <div>• 여권 만료일</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 빠른 팁 */}
          {completionPercentage < 100 && (
            <div className='mt-4 flex items-start gap-2'>
              <span className='text-yellow-300'>💡</span>
              <p className='text-sm'>
                {!profile.name && "이름을 추가하면 개인화된 인사를 받을 수 있어요!"}
                {profile.name && !profile.bio && "자기소개를 추가하면 다른 여행자들과 연결될 수 있어요!"}
                {profile.name && profile.bio && !profile.location && "거주지를 추가하면 주변 여행 정보를 받을 수 있어요!"}
                {profile.name && profile.bio && profile.location && !profile.visaInfo.passportExpiry && "여권 만료일을 등록하면 갱신 알림을 받을 수 있어요!"}
                {profile.name && profile.bio && profile.location && profile.visaInfo.passportExpiry && !profile.nationality && "국적 정보를 추가하면 비자 요구사항을 자동으로 확인할 수 있어요!"}
                {profile.name && profile.bio && profile.location && profile.visaInfo.passportExpiry && profile.nationality && !profile.visaInfo.passportCountry && "여권 발급국을 추가하면 정확한 비자 정보를 확인할 수 있어요!"}
              </p>
            </div>
          )}
        </div>

        {/* 저장 메시지 */}
        {saveMessage && (
          <div
            className={`alert ${saveMessage.includes('실패') ? 'alert-error' : 'alert-success'} mb-6`}
          >
            {saveMessage}
          </div>
        )}

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* 프로필 카드 */}
          <div className='lg:col-span-1'>
            <div className='card p-6 text-center relative'>
              {/* 완성도 뱃지 */}
              {completionPercentage >= 100 && (
                <div className='absolute top-4 right-4 text-2xl' title='프로필 완성!'>
                  {reward.level}
                </div>
              )}
              
              <div className='relative inline-block mb-4'>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={profile.name || 'User'}
                    className='w-24 h-24 rounded-full border-4 border-surface'
                  />
                ) : (
                  <div className='w-24 h-24 rounded-full bg-surface border-4 border-border flex items-center justify-center'>
                    <User className='h-12 w-12 text-secondary' />
                  </div>
                )}
                {isEditing && (
                  <button className='absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full'>
                    <Camera className='h-4 w-4' />
                  </button>
                )}
              </div>

              <h2 className='text-xl font-bold mb-2'>
                {profile.name || 'Unknown User'}
              </h2>
              <p className='text-sm text-secondary mb-4'>{profile.email}</p>

              {profile.bio && (
                <p className='text-sm border-t pt-4'>{profile.bio}</p>
              )}

              <div className='mt-6 space-y-2 text-sm'>
                {profile.location && (
                  <div className='flex items-center justify-center gap-2 text-secondary'>
                    <MapPin className='h-4 w-4' />
                    {profile.location}
                  </div>
                )}
                {profile.nationality && (
                  <div className='flex items-center justify-center gap-2 text-secondary'>
                    <Globe className='h-4 w-4' />
                    {profile.nationality}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className='lg:col-span-2 space-y-6'>
            {/* 기본 정보 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <User className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-semibold'>기본 정보</h3>
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    이름
                    {!profile.name && <span className='text-orange-500 text-xs'>⚠️ 필수</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                      placeholder='이름을 입력하세요'
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-md ${profile.name ? 'bg-surface' : 'bg-orange-50 border border-orange-200'}`}>
                      {profile.name || '입력 필요'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    이메일
                  </label>
                  <p className='px-3 py-2 bg-surface rounded-md text-secondary'>
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    거주지
                    {!profile.location && <span className='text-orange-500 text-xs'>⚠️ 중요</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                      placeholder='예: 서울, 대한민국'
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-md ${profile.location ? 'bg-surface' : 'bg-orange-50 border border-orange-200'}`}>
                      {profile.location || '입력 필요'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    국적
                    {!profile.nationality && <span className='text-orange-500 text-xs'>⚠️ 중요</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.nationality}
                      onChange={e =>
                        handleInputChange('nationality', e.target.value)
                      }
                      placeholder='예: 대한민국'
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-md ${profile.nationality ? 'bg-surface' : 'bg-orange-50 border border-orange-200'}`}>
                      {profile.nationality || '입력 필요'}
                    </p>
                  )}
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    자기소개
                    {!profile.bio && <span className='text-blue-600 text-xs'>💬 추천</span>}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      placeholder='자신을 간단히 소개해보세요. 여행 스타일이나 관심사를 적어보세요!'
                      rows={3}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <div className={`px-3 py-2 rounded-md min-h-[80px] ${profile.bio ? 'bg-surface' : 'bg-blue-50 border border-blue-200'}`}>
                      {profile.bio || (
                        <span className='text-blue-600 text-sm'>
                          🌟 자기소개를 추가하면 다른 디지털 노마드들과 연결될 수 있어요!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 여행 선호도 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <Globe className='h-5 w-5 text-primary' />
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    >
                      <option value='budget'>예산 여행</option>
                      <option value='comfort'>편안한 여행</option>
                      <option value='luxury'>럭셔리 여행</option>
                    </select>
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.travelPreferences.travelStyle === 'budget'
                        ? '예산 여행'
                        : profile.travelPreferences.travelStyle === 'comfort'
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    >
                      <option value='solo'>혼자 여행</option>
                      <option value='couple'>커플 여행</option>
                      <option value='group'>그룹 여행</option>
                    </select>
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
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

            {/* 비자 정보 */}
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <Calendar className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-semibold'>비자 정보</h3>
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    여권 발급국
                    {!profile.visaInfo.passportCountry && <span className='text-orange-500 text-xs'>⚠️ 중요</span>}
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-md ${profile.visaInfo.passportCountry ? 'bg-surface' : 'bg-orange-50 border border-orange-200'}`}>
                      {profile.visaInfo.passportCountry || '입력 필요'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2 flex items-center gap-2'>
                    여권 만료일
                    {!profile.visaInfo.passportExpiry && <span className='text-orange-500 text-xs'>⚠️ 중요</span>}
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-md ${profile.visaInfo.passportExpiry ? 'bg-surface' : 'bg-orange-50 border border-orange-200'}`}>
                      {profile.visaInfo.passportExpiry ? (
                        <>
                          {profile.visaInfo.passportExpiry}
                          {(() => {
                            const expiry = new Date(profile.visaInfo.passportExpiry);
                            const today = new Date();
                            const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysUntilExpiry < 180) {
                              return <span className='text-red-500 text-xs ml-2'>⚠️ {daysUntilExpiry}일 남음</span>;
                            }
                            return null;
                          })()}
                        </>
                      ) : '입력 필요'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
