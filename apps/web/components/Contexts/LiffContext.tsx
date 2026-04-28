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
        
        // Import supabase client
        const { supabase } = await import('../../lib/supabase')

        if (!liffId) {
          console.warn('NEXT_PUBLIC_LIFF_ID is not set')
        }

        await liff.init({ liffId })
        setLiffObject(liff)

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile()
          setProfile(userProfile)

          // Sync to Supabase User table (best-effort — ignore RLS/auth errors)
          if (supabase) {
            const { error: upsertError } = await supabase.from('User').upsert({
              id: userProfile.userId,
              displayName: userProfile.displayName,
              photoUrl: userProfile.pictureUrl,
              updatedAt: new Date().toISOString(),
            })
            if (upsertError) {
              console.warn('Supabase user sync skipped:', upsertError.message)
            }
          }
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
