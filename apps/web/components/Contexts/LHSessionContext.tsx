'use client'
import PageLoading from '@components/Objects/Loaders/PageLoading';
import { useSession, UseSessionReturn } from '@components/Contexts/AuthContext';
import { useLiff } from '@components/Contexts/LiffContext';
import React, { useContext, createContext, useMemo } from 'react'

export const SessionContext = createContext<UseSessionReturn | null>(null)

function LHSessionProvider({ children }: { children: React.ReactNode }) {
    const session = useSession();
    const { liff, isLoggedIn, profile, error: liffError } = useLiff();

    const combinedSession = useMemo((): UseSessionReturn => {
        // Backend session takes priority
        if (session.status === 'authenticated') return session;

        // Show loading while LIFF is still initializing (prevents flash of "not logged in")
        if (!liff && !liffError && session.status !== 'loading') {
            return { ...session, status: 'loading' };
        }

        // LIFF initialized and user is logged in — create a synthetic session
        if (liff && isLoggedIn && profile) {
            return {
                status: 'authenticated',
                data: {
                    user: {
                        id: profile.userId,
                        username: profile.displayName,
                        email: `${profile.userId}@line.me`,
                        avatar: profile.pictureUrl,
                    },
                    roles: [],
                    tokens: {},
                },
                update: session.update,
            } as any;
        }

        return session;
    }, [session, liff, isLoggedIn, profile, liffError]);

    return (
        <SessionContext.Provider value={combinedSession}>
            {children}
        </SessionContext.Provider>
    )
}

export function SessionGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    const session = useContext(SessionContext)

    if (session && session.status === 'loading') {
        return fallback ? <>{fallback}</> : <PageLoading />
    }

    return <>{children}</>
}

export function useLHSession() {
    return useContext(SessionContext)
}

export default LHSessionProvider
