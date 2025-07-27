'use client'

import { useState } from 'react'
import { getCurrentLocale, setLocale, getSupportedLocales, type Locale } from '@/lib/i18n'

interface LanguageSelectorProps {
  className?: string
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const currentLocale = getCurrentLocale()
  const supportedLocales = getSupportedLocales()
  
  const currentLanguage = supportedLocales.find(lang => lang.code === currentLocale)

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 p-2 border-2 border-gray-800 bg-white hover:bg-gray-50 transition-colors ${className}`}
        style={{
          border: '2px solid #333',
          backgroundColor: 'white',
          cursor: 'pointer',
          padding: '8px 12px',
          fontSize: '14px'
        }}
      >
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div 
            className="absolute right-0 mt-2 bg-white border-2 border-gray-800 z-50"
            style={{
              border: '2px solid #333',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            {supportedLocales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  currentLocale === locale.code ? 'bg-gray-100' : ''
                }`}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <span>{locale.flag}</span>
                <span>{locale.name}</span>
                {currentLocale === locale.code && (
                  <span style={{ marginLeft: 'auto', color: '#666' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}