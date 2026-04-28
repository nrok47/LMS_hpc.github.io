export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; type: string }> }
) {
  const userId = req.headers.get('x-line-uid')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId, type } = await params
  if (type !== 'PRE_TEST' && type !== 'POST_TEST') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  try {
    const assessment = await prisma.assessment.findFirst({
      where: { courseId, type: type as 'PRE_TEST' | 'POST_TEST' },
    })

    if (!assessment) {
      return NextResponse.json({ score: null })
    }

    const score = await prisma.score.findUnique({
      where: { userId_assessmentId: { userId, assessmentId: assessment.id } },
    })

    return NextResponse.json({ score: score ?? null })
  } catch (error) {
    console.error('[GET score]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
