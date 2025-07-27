'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // First clear cookies via our custom endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        
        // Then sign out from NextAuth
        await signOut({ redirect: false })
        
        // Clear any remaining session storage
        if (typeof window !== 'undefined') {
          window.sessionStorage.clear()
          window.localStorage.clear()
        }
        
        // Force reload to clear any cached state
        window.location.href = '/'
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect anyway
        window.location.href = '/'
      }
    }
    
    performLogout()
  }, [])
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        border: '2px solid #333',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>로그아웃 중...</h2>
        <p style={{ color: '#666' }}>잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}