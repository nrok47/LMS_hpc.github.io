'use client'

import { useEffect } from 'react'
import { useLiff } from '@components/Contexts/LiffContext'

export default function LineLoginClient() {
  const { liff, isLoggedIn, error: liffError } = useLiff()

  // Auto-redirect home once LIFF confirms the user is logged in
  useEffect(() => {
    if (liff && isLoggedIn) {
      window.location.href = '/'
    }
  }, [liff, isLoggedIn])

  const handleLogin = () => {
    if (liff) liff.login()
  }

  const isInitializing = !liff && !liffError
  const error = liffError ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE กรุณาเปิดผ่าน LINE แอปพลิเคชัน' : null

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9f0',
        padding: '24px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
          ศูนย์อนามัยที่ 10 อุบลราชธานี
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
          ระบบเรียนรู้ออนไลน์เพื่อส่งเสริมสุขภาพ
        </p>

        {error ? (
          <div
            style={{
              backgroundColor: '#fff3f3',
              border: '1px solid #ffcccc',
              borderRadius: '8px',
              padding: '16px',
              color: '#cc0000',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        ) : isInitializing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #06C755',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ color: '#06C755', fontWeight: 600, fontSize: '15px' }}>
              กำลังเตรียมระบบ...
            </p>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#06C755',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.04 2 11c0 3.19 1.74 6.01 4.4 7.77-.12.44-.79 2.81-.81 2.94-.03.19.07.38.24.47.1.05.2.08.31.08.14 0 .28-.05.39-.14l3.45-2.3c.67.1 1.36.15 2.02.15 5.52 0 10-4.04 10-9s-4.48-9-10-9z"/>
            </svg>
            เข้าสู่ระบบด้วย LINE
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        button:hover {
          opacity: 0.9;
        }
        button:active {
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}
