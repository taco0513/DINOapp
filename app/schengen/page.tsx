'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SchengenCalculator from '@/components/schengen/SchengenCalculator'
import SchengenChart from '@/components/schengen/SchengenChart'
import FutureTripPlanner from '@/components/schengen/FutureTripPlanner'
import { ApiClient } from '@/lib/api-client'
import type { CountryVisit } from '@/types/global'

export default function SchengenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [hasTrips, setHasTrips] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<CountryVisit[]>([])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin' as any)
      return
    }

    checkTripsExistence()
  }, [session, status, router])

  const checkTripsExistence = async () => {
    setLoading(true)
    try {
      const response = await ApiClient.getTrips()
      if (response.success && response.data) {
        setTrips(response.data)
        setHasTrips(response.data.length > 0)
      } else {
        setHasTrips(false)
      }
    } catch (error) {
      console.error('Error checking trips:', error)
      setHasTrips(false)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return null
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="셰겐 계산기"
        description="90/180일 규칙을 확인하고 규정 준수를 추적하세요"
      />

      {loading ? (
        <div className="text-center py-16">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      ) : hasTrips ? (
        <div className="space-y-8">
          {/* Advanced Schengen Calculator */}
          <SchengenCalculator />
          
          {/* Schengen Usage Chart */}
          <SchengenChart />
          
          {/* Future Trip Planner */}
          <FutureTripPlanner visits={trips} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🇪🇺</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">셰겐 계산기</h3>
            <p className="text-gray-600 mb-6">
              여행 기록을 추가하면 자동으로 셰겐 지역 체류 일수가 계산됩니다
            </p>
            <button 
              onClick={() => router.push('/trips' as any)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              여행 기록 추가하기
            </button>
            
            <div className="mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-blue-900 mb-3">📚 셰겐 90/180일 규칙</h4>
                <div className="space-y-2 text-blue-800 text-sm">
                  <p>• 셰겐 지역 내에서 180일 중 최대 90일까지만 체류할 수 있습니다</p>
                  <p>• 이 규칙은 롤링 방식으로 적용됩니다 (고정된 기간이 아님)</p>
                  <p>• 매일 지난 180일간의 체류 일수를 계산합니다</p>
                  <p>• 비자 없이 입국하는 관광객에게 적용됩니다</p>
                  <p>• 장기 체류 비자나 거주권이 있으면 규칙이 다를 수 있습니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}