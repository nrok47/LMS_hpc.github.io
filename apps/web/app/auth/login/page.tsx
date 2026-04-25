import { Metadata } from 'next'
import LineLoginClient from './LineLogin'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ — ศูนย์อนามัยที่ 10',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LineLoginClient />
}
