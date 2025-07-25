'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import NotificationList from '@/components/notifications/NotificationList'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import type { NotificationPreferences } from '@/types/notification'

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin' as any)
      return
    }
  }, [session, status, router])

  const handleSaveSettings = async (preferences: NotificationPreferences) => {
    // In a real app, this would save to the database
    console.log('Saving notification preferences:', preferences)
    
    // For demo, we'll just save to localStorage
    localStorage.setItem(`notification-prefs-${session?.user?.email}`, JSON.stringify(preferences))
  }

  if (status === 'loading' || !session) {
    return null
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="알림 센터"
        description="알림을 확인하고 설정을 관리하세요"
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          알림 목록
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          알림 설정
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'list' ? (
          <NotificationList userId={session.user?.email || ''} />
        ) : (
          <NotificationSettings 
            userId={session.user?.email || ''}
            onSave={handleSaveSettings}
          />
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">💡 알림 도움말</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>비자 만료 알림</strong>: 설정한 일수 전에 미리 알려드립니다</p>
          <p>• <strong>셰겐 경고</strong>: 90/180일 규칙 위반 위험이 있을 때 경고합니다</p>
          <p>• <strong>여행 알림</strong>: 예정된 여행 일정을 미리 알려드립니다</p>
          <p>• <strong>방해 금지 시간</strong>: 설정한 시간대에는 푸시 알림이 전송되지 않습니다</p>
        </div>
      </div>
    </Container>
  )
}