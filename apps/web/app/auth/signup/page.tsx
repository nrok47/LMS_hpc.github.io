'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect all signup attempts to the LINE LIFF login page
export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')
  }, [router])

  return null
}
