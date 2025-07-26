'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: '설정 오류',
          message: '인증 설정에 문제가 있습니다. 관리자에게 문의하세요.',
          action: '다시 시도'
        }
      case 'AccessDenied':
        return {
          title: '접근 거부',
          message: '이 계정으로는 로그인할 수 없습니다.',
          action: '다른 계정으로 시도'
        }
      case 'Verification':
        return {
          title: '인증 오류',
          message: '이메일 인증에 실패했습니다.',
          action: '다시 시도'
        }
      case 'OAuthSignin':
        return {
          title: 'OAuth 로그인 오류',
          message: 'Google 로그인 요청을 시작하는 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth 콜백 오류',
          message: 'Google에서 돌아오는 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'OAuthCreateAccount':
        return {
          title: '계정 생성 오류',
          message: '계정을 생성하는 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'EmailCreateAccount':
        return {
          title: '이메일 계정 생성 오류',
          message: '이메일 계정을 생성하는 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'Callback':
        return {
          title: '콜백 오류',
          message: '인증 콜백 처리 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'OAuthAccountNotLinked':
        return {
          title: '계정 연결 오류',
          message: '이 이메일 주소는 이미 다른 계정과 연결되어 있습니다.',
          action: '다른 이메일로 시도'
        }
      case 'EmailSignin':
        return {
          title: '이메일 로그인 오류',
          message: '이메일 로그인 중 오류가 발생했습니다.',
          action: '다시 시도'
        }
      case 'CredentialsSignin':
        return {
          title: '로그인 실패',
          message: '잘못된 로그인 정보입니다.',
          action: '다시 시도'
        }
      case 'SessionRequired':
        return {
          title: '로그인 필요',
          message: '이 페이지에 접근하려면 로그인이 필요합니다.',
          action: '로그인'
        }
      default:
        return {
          title: '알 수 없는 오류',
          message: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          action: '다시 시도'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600">
            {errorInfo.message}
          </p>
          {error && (
            <p className="text-sm text-gray-400 mt-2">
              오류 코드: {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {errorInfo.action}
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            문제가 계속 발생하면{' '}
            <a href="mailto:support@dinoapp.net" className="text-blue-600 hover:text-blue-800">
              고객지원
            </a>
            에 문의하세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}