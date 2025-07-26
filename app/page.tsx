'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (session) {
      // If user is logged in, redirect to dashboard
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  // If user is logged in, show loading while redirecting
  if (session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
          <button
            onClick={async () => {
              try {
                await signOut({ 
                  callbackUrl: `${window.location.origin}/`,
                  redirect: true 
                })
              } catch (error) {
                console.error('Logout error:', error)
                // Fallback: clear session and redirect manually
                window.location.href = '/'
              }
            }}
            className="mt-8 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer text-sm"
          >
            로그아웃
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          DINO
        </h1>
        <p className="text-2xl text-gray-700 mb-4">
          Digital Nomad
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
          복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 
          스마트 여행 관리 플랫폼입니다.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            로그인하여 시작하기
          </Link>
          
          <Link 
            href="/demo"
            className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg transition-all border-2 border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            데모 보기
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">실시간 추적</h3>
            <p className="text-sm text-gray-600">비자 만료일과 체류 기간을 자동으로 계산합니다</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">규정 준수</h3>
            <p className="text-sm text-gray-600">셰겐 90/180일 규칙을 정확하게 계산합니다</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">자동 기록</h3>
            <p className="text-sm text-gray-600">Gmail과 Calendar를 통해 여행을 자동 감지합니다</p>
          </div>
        </div>
      </div>
    </main>
  )
}