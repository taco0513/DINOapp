'use client';

import Link from 'next/link';
// Removed framer-motion to reduce bundle size - using CSS animations instead

export default function IOSHeroSection() {
  return (
    <section className='relative overflow-hidden pt-safe min-h-screen flex items-center'>
      {/* Subtle gradient overlay - iOS style */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent animate-fade-in' />
      </div>

      <div className='container mx-auto px-4 py-20'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* iOS-style large title with animation */}
          <h1 className='ios-large-title mb-2 text-black animate-slide-up'>
            DINO
          </h1>

          {/* iOS-style subtitle with staggered animation */}
          <p className='text-title-2 text-gray-600 mb-6 font-normal animate-slide-up' style={{ animationDelay: '0.2s' }}>
            Digital Nomad Visa Tracker
          </p>

          {/* iOS-style body text with staggered animation */}
          <p className='text-body text-secondary mb-10 max-w-2xl mx-auto animate-slide-up' style={{ animationDelay: '0.4s' }}>
            비자 규정을 자동으로 추적하고 여행 기록을 관리하는 가장 스마트한 방법
          </p>

          {/* iOS-style CTA Buttons with hover animations */}
          <div className='flex flex-col sm:flex-row gap-3 justify-center animate-slide-up' style={{ animationDelay: '0.6s' }}>
            <Link href='/auth/signin' className='ios-button inline-block hover:scale-[1.02] active:scale-[0.98] transition-transform'>
              시작하기
            </Link>
            <Link href='/demo' className='ios-button ios-button-secondary inline-block hover:scale-[1.02] active:scale-[0.98] transition-transform'>
              데모 체험
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator with CSS animation */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in' style={{ animationDelay: '1s' }}>
        <div className='w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center animate-bounce'>
          <div className='w-1 h-3 bg-gray-400 rounded-full mt-2' />
        </div>
      </div>
    </section>
  );
}
