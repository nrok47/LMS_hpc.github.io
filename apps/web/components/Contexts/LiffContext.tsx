'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface LiffContextType {
  liff: any | null
  profile: any | null
  isLoggedIn: boolean
  error: string | null
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  profile: null,
  isLoggedIn: false,
  error: null,
})

export const useLiff = () => useContext(LiffContext)

export const LiffProvider = ({ children }: { children: React.ReactNode }) => {
  const [liffObject, setLiffObject] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initLiff = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const liff = (await import('@line/liff')).default
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''
        
        if (!liffId) {
          console.warn('NEXT_PUBLIC_LIFF_ID is not set')
        }

        await liff.init({ liffId })
        setLiffObject(liff)

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile()
          setProfile(userProfile)
        } else {
          // Optional: Auto-login if needed
          // liff.login()
        }
      } catch (err: any) {
        console.error('LIFF init error:', err)
        setError(err.message)
      }
    }

    initLiff()
  }, [])

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        profile,
        isLoggedIn: liffObject?.isLoggedIn() || false,
        error,
      }}
    >
      {children}
    </LiffContext.Provider>
  )
}
