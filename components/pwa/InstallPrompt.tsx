'use client'

import { useState, useEffect } from 'react'
import { useInstallPrompt } from '@/lib/pwa/pwa-utils'

export function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Show prompt after 30 seconds if installable
    if (isInstallable) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 30000)
      
      return () => clearTimeout(timer)
    }
    
    // Return empty cleanup for non-installable case
    return () => {}
  }, [isInstallable])

  const handleInstall = async () => {
    setIsInstalling(true)
    const accepted = await promptInstall()
    
    if (accepted) {
      setIsVisible(false)
      // Track install event
      localStorage.setItem('dino-pwa-installed', 'true')
    }
    setIsInstalling(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Don't show again for 7 days
    localStorage.setItem('dino-install-dismissed', new Date().toISOString())
  }

  if (!isVisible || !isInstallable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              DINO를 설치하세요
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              홈 화면에 추가하여 앱처럼 사용하세요. 오프라인에서도 작동합니다!
            </p>
            
            <div className="mt-3 flex items-center space-x-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? '설치 중...' : '설치하기'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}