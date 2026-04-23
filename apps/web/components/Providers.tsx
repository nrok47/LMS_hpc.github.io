'use client'
import React from 'react'
import '../lib/i18n'
import { SessionProvider } from '@components/Contexts/AuthContext'
import LHSessionProvider from '@components/Contexts/LHSessionContext'
import I18nProvider from '@components/Contexts/I18nContext'
import { LiffProvider } from '@components/Contexts/LiffContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider>
      <SessionProvider refetchInterval={600000}>
        <LHSessionProvider>
          <I18nProvider>{children}</I18nProvider>
        </LHSessionProvider>
      </SessionProvider>
    </LiffProvider>
  )
}
