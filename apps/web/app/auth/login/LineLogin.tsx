'use client'

import { useEffect, useState } from 'react'

export default function LineLoginClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initAndLogin = async () => {
      try {
        const liff = (await import('@line/liff')).default
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''

        if (!liffId) {
          setError('LIFF ID ไม่ถูกตั้งค่า กรุณาติดต่อผู้ดูแลระบบ')
          setLoading(false)
          return
        }

        await liff.init({ liffId })

        if (!liff.isLoggedIn()) {
          // Redirect to LINE login immediately
          liff.login()
          return
        }

        // Already logged in — redirect to home
        window.location.href = '/'
      } catch (err: any) {
        console.error('LIFF init error:', err)
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ LINE กรุณาเปิดผ่าน LINE แอปพลิเคชัน')
        setLoading(false)
      }
    }

    initAndLogin()
  }, [])

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
        ) : (
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
              กำลังเชื่อมต่อ LINE...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
