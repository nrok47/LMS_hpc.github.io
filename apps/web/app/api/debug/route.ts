export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  const info: Record<string, any> = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ set (' + process.env.DATABASE_URL.slice(0, 30) + '...)' : '❌ NOT SET',
    DIRECT_URL: process.env.DIRECT_URL ? '✅ set' : '❌ NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const count = await prisma.assessment.count()
    info.prisma = '✅ connected'
    info.assessment_count = count
  } catch (e: any) {
    info.prisma = '❌ ERROR: ' + e.message
  }

  return NextResponse.json(info)
}
