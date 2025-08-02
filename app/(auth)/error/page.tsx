'use client';

/**
 * DINO v2.0 - Authentication Error Page
 * Clean error handling for authentication failures
 */

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: '서버 설정 오류가 발생했습니다.',
  AccessDenied: '액세스가 거부되었습니다.',
  Verification: '인증 링크가 만료되었거나 이미 사용되었습니다.',
  Default: '로그인 중 오류가 발생했습니다.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-4">😞</div>
          
          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            로그인 오류
          </h1>
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              다시 로그인하기
            </Link>
            
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                디버그 정보: {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}