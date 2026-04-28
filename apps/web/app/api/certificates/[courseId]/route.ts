export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = req.headers.get('x-line-uid')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await params

  try {
    const certificate = await prisma.certificate.findFirst({
      where: { userId, courseId },
    })

    return NextResponse.json({ certificate: certificate ?? null })
  } catch (error) {
    console.error('[GET certificate]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
