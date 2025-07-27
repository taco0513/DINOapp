'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all cookies client-side first
        if (typeof window !== 'undefined') {
          // Clear session storage
          window.sessionStorage.clear()
          window.localStorage.clear()
          
          // Clear all cookies
          document.cookie.split(";").forEach(function(c) { 
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            if (name.includes('next-auth') || name.includes('session')) {
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname + ';';
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname + ';';
              // For subdomains
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app;';
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.dinoapp.net;';
            }
          });
        }
        
        // Call our custom logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-cache'
        })
        
        // Sign out from NextAuth without redirect
        await signOut({ 
          redirect: false,
          callbackUrl: '/'
        })
        
        // Force hard reload to home page
        setTimeout(() => {
          window.location.replace('/')
        }, 100)
        
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect anyway
        window.location.replace('/')
      }
    }
    
    // Execute logout immediately
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
        <div style={{ marginTop: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #333',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}