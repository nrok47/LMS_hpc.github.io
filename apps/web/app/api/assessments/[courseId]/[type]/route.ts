export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; type: string }> }
) {
  const { courseId, type } = await params

  if (type !== 'PRE_TEST' && type !== 'POST_TEST') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  try {
    const assessment = await prisma.assessment.findFirst({
      where: { courseId, type: type as 'PRE_TEST' | 'POST_TEST' },
      include: { questions: true },
    })

    if (!assessment) {
      return NextResponse.json({ assessment: null })
    }

    // Strip isCorrect from options before sending to client
    const safeAssessment = {
      ...assessment,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: (q.options as any[]).map(({ text }: { text: string }) => ({ text })),
      })),
    }

    return NextResponse.json({ assessment: safeAssessment })
  } catch (error) {
    console.error('[GET assessment]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
