export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PASS_THRESHOLD = 70

export async function POST(
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

  let body: { answers: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { answers } = body

  try {
    const assessment = await prisma.assessment.findFirst({
      where: { courseId, type: type as 'PRE_TEST' | 'POST_TEST' },
      include: { questions: true },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Score: count correct answers
    let correct = 0
    for (const question of assessment.questions) {
      const selected = answers[question.id]
      if (!selected) continue
      const options = question.options as Array<{ text: string; isCorrect: boolean }>
      const correctOption = options.find((o) => o.isCorrect)
      if (correctOption && selected === correctOption.text) {
        correct++
      }
    }

    const total = assessment.questions.length
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = scorePercent >= PASS_THRESHOLD

    // Upsert Score (keeps latest attempt)
    await prisma.score.upsert({
      where: { userId_assessmentId: { userId, assessmentId: assessment.id } },
      update: { score: scorePercent, passed, updatedAt: new Date() },
      create: { userId, assessmentId: assessment.id, score: scorePercent, passed },
    })

    // Auto-issue certificate when POST_TEST passed
    let certificateIssued = false
    if (type === 'POST_TEST' && passed) {
      const existing = await prisma.certificate.findFirst({
        where: { userId, courseId },
      })
      if (!existing) {
        await prisma.certificate.create({
          data: { userId, courseId },
        })
        certificateIssued = true
      }
    }

    return NextResponse.json({ score: scorePercent, passed, correct, total, certificateIssued })
  } catch (error) {
    console.error('[POST submit]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
