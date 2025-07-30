'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function IOSHeroSection() {
  return (
    <section className='relative overflow-hidden pt-safe min-h-screen flex items-center'>
      {/* Subtle gradient overlay - iOS style */}
      <div className='absolute inset-0 -z-10'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className='absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent'
        />
      </div>

      <div className='container mx-auto px-4 py-20'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* iOS-style large title with animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='ios-large-title mb-2 text-black'
          >
            DINO
          </motion.h1>

          {/* iOS-style subtitle with staggered animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='text-title-2 text-gray-600 mb-6 font-normal'
          >
            Digital Nomad Visa Tracker
          </motion.p>

          {/* iOS-style body text with staggered animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className='text-body text-secondary mb-10 max-w-2xl mx-auto'
          >
            비자 규정을 자동으로 추적하고 여행 기록을 관리하는 가장 스마트한
            방법
          </motion.p>

          {/* iOS-style CTA Buttons with hover and tap animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className='flex flex-col sm:flex-row gap-3 justify-center'
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href='/auth/signin' className='ios-button inline-block'>
                시작하기
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href='/demo'
                className='ios-button ios-button-secondary inline-block'
              >
                데모 체험
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className='absolute bottom-8 left-1/2 transform -translate-x-1/2'
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className='w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center'
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className='w-1 h-3 bg-gray-400 rounded-full mt-2'
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
