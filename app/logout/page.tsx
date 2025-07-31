'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    // Use force logout endpoint that clears all cookies server-side
    window.location.href = '/api/force-logout';
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          border: '2px solid #333',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ marginBottom: '20px', color: '#333' }}>로그아웃 중...</h2>
        <p style={{ color: '#666' }}>잠시만 기다려주세요.</p>
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #333',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
