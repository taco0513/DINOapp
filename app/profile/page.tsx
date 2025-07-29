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
            <div className='card p-6 text-center'>
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
                  <label className='block text-sm font-medium mb-2'>이름</label>
                  {isEditing ? (
                    <input
                      type='text'
                      value={profile.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.name || '-'}
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.location || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>국적</label>
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
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.nationality || '-'}
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
                      onChange={e => handleInputChange('bio', e.target.value)}
                      placeholder='자신을 간단히 소개해보세요'
                      rows={3}
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md min-h-[80px]'>
                      {profile.bio || '-'}
                    </p>
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.visaInfo.passportCountry || '-'}
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
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                    />
                  ) : (
                    <p className='px-3 py-2 bg-surface rounded-md'>
                      {profile.visaInfo.passportExpiry || '-'}
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
