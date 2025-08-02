/**
 * DINO v2.0 - Authentication Error Page
 * Handle authentication errors gracefully
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('알 수 없는 오류가 발생했습니다.');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const error = searchParams.get('error');

  useEffect(() => {
    switch (error) {
      case 'Configuration':
        setErrorMessage('서버 설정 오류');
        setErrorDetails('NextAuth.js 설정에 문제가 있습니다. 관리자에게 문의하세요.');
        break;
      case 'AccessDenied':
        setErrorMessage('접근 거부');
        setErrorDetails('로그인 권한이 없거나 접근이 거부되었습니다.');
        break;
      case 'Verification':
        setErrorMessage('인증 실패');
        setErrorDetails('이메일 인증 또는 토큰 검증에 실패했습니다.');
        break;
      case 'Default':
        setErrorMessage('인증 오류');
        setErrorDetails('로그인 과정에서 오류가 발생했습니다.');
        break;
      case 'Signin':
        setErrorMessage('로그인 실패');
        setErrorDetails('로그인 제공자에 연결할 수 없습니다.');
        break;
      case 'OAuthSignin':
        setErrorMessage('OAuth 로그인 오류');
        setErrorDetails('OAuth 제공자와의 연결에 실패했습니다.');
        break;
      case 'OAuthCallback':
        setErrorMessage('OAuth 콜백 오류');
        setErrorDetails('OAuth 인증 후 콜백 처리에 실패했습니다.');
        break;
      case 'OAuthCreateAccount':
        setErrorMessage('계정 생성 실패');
        setErrorDetails('OAuth 계정 생성 중 오류가 발생했습니다.');
        break;
      case 'EmailCreateAccount':
        setErrorMessage('이메일 계정 오류');
        setErrorDetails('이메일 계정 생성에 실패했습니다.');
        break;
      case 'Callback':
        setErrorMessage('콜백 오류');
        setErrorDetails('인증 콜백 처리 중 오류가 발생했습니다.');
        break;
      case 'OAuthAccountNotLinked':
        setErrorMessage('계정 연결 오류');
        setErrorDetails('이미 다른 제공자로 가입된 이메일입니다. 해당 제공자로 로그인해주세요.');
        break;
      case 'EmailSignin':
        setErrorMessage('이메일 로그인 실패');
        setErrorDetails('이메일 로그인 링크를 보낼 수 없습니다.');
        break;
      case 'CredentialsSignin':
        setErrorMessage('자격 증명 오류');
        setErrorDetails('제공된 자격 증명이 올바르지 않습니다.');
        break;
      case 'SessionRequired':
        setErrorMessage('세션 필요');
        setErrorDetails('이 페이지에 접근하려면 로그인이 필요합니다.');
        break;
      default:
        if (error) {
          setErrorMessage(`인증 오류: ${error}`);
          setErrorDetails('예상치 못한 오류가 발생했습니다.');
        }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-4xl">🦕</span>
            <div>
              <span className="text-2xl font-bold text-gray-900">DINO</span>
              <span className="text-sm text-gray-500 font-medium ml-2">v2.0</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {errorMessage}
            </h2>
            {errorDetails && (
              <p className="text-sm text-gray-600 mb-6">
                {errorDetails}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              다시 로그인하기
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* Technical Details */}
          {error && (
            <div className="mt-6 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">
                <strong>오류 코드:</strong> {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}