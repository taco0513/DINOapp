'use client';

import { useServiceWorkerUpdate } from '@/lib/pwa/pwa-utils';

export function UpdatePrompt() {
  const { updateAvailable, updateApp, isUpdating } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className='fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5'>
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 text-white'>
        <div className='flex items-center space-x-3'>
          <div className='flex-shrink-0'>
            <svg
              className='w-6 h-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </div>

          <div className='flex-1'>
            <h3 className='text-sm font-semibold'>
              새로운 업데이트가 있습니다
            </h3>
            <p className='mt-1 text-sm text-white/90'>
              최신 기능과 개선사항을 사용하려면 업데이트하세요.
            </p>
          </div>
        </div>

        <div className='mt-3 flex items-center justify-end space-x-3'>
          <button
            onClick={updateApp}
            disabled={isUpdating}
            className='inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isUpdating ? '업데이트 중...' : '지금 업데이트'}
          </button>
        </div>
      </div>
    </div>
  );
}
