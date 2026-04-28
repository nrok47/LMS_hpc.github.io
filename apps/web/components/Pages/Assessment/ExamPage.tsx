'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@components/Contexts/LiffContext'
import {
  getAssessment,
  submitAssessment,
  getMyScore,
  type Assessment,
  type AssessmentType,
  type SubmitResult,
} from '@services/courses/assessments'

type State =
  | 'loading'
  | 'no_exam'
  | 'already_passed'
  | 'intro'
  | 'in_progress'
  | 'submitting'
  | 'result'

interface ExamPageProps {
  courseId: string
  courseName: string
  type: AssessmentType
  orgslug: string
}

export default function ExamPage({ courseId, courseName, type, orgslug }: ExamPageProps) {
  const router = useRouter()
  const { profile } = useLiff()
  const userId = profile?.userId ?? ''

  const [state, setState] = useState<State>('loading')
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SubmitResult | null>(null)

  const isPreTest = type === 'PRE_TEST'
  const label = isPreTest ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'
  const courseUrl = `/orgs/${orgslug}/course/${courseId}`

  useEffect(() => {
    if (!userId) return
    async function init() {
      const [exam, score] = await Promise.all([
        getAssessment(courseId, type),
        getMyScore(courseId, type, userId),
      ])
      if (!exam || exam.questions.length === 0) {
        setState('no_exam')
        return
      }
      setAssessment(exam)
      if (score?.passed) {
        setState('already_passed')
        return
      }
      setState('intro')
    }
    init()
  }, [courseId, type, userId])

  const handleStart = () => {
    setCurrentIndex(0)
    setAnswers({})
    setState('in_progress')
  }

  const handleSelect = (questionId: string, optionText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }))
  }

  const handleNext = () => {
    if (!assessment) return
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleSubmit = async () => {
    if (!userId || !assessment) return
    setState('submitting')
    const res = await submitAssessment(courseId, type, answers, userId)
    if (res) {
      setResult(res)
      setState('result')
    } else {
      setState('in_progress')
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state === 'loading' || state === 'submitting') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">{state === 'submitting' ? 'กำลังตรวจคำตอบ...' : 'กำลังโหลด...'}</p>
        </div>
      </div>
    )
  }

  // ── No exam ────────────────────────────────────────────────────────────────
  if (state === 'no_exam') {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">ยังไม่มี{label}สำหรับคอร์สนี้</p>
        <button onClick={() => router.push(courseUrl)} className="btn-primary">
          กลับไปคอร์ส
        </button>
      </div>
    )
  }

  // ── Already passed ─────────────────────────────────────────────────────────
  if (state === 'already_passed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">คุณผ่าน{label}แล้ว</h2>
        <p className="text-gray-500 mb-6">ไม่จำเป็นต้องทำซ้ำ</p>
        {isPreTest ? (
          <button onClick={() => router.push(courseUrl)} className="btn-primary">
            ไปยังเนื้อหาคอร์ส
          </button>
        ) : (
          <button onClick={() => router.push(`${courseUrl}/certificate`)} className="btn-success">
            ดูใบประกาศ
          </button>
        )}
      </div>
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (state === 'intro' && assessment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">{isPreTest ? '📋' : '📝'}</div>
          <h1 className="text-xl font-bold mb-1">{label}</h1>
          <p className="text-gray-500 text-sm mb-1">{courseName}</p>
          <p className="text-gray-400 text-sm mb-6">
            {assessment.questions.length} ข้อ • ผ่าน 70% ขึ้นไป
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStart}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              เริ่มทำแบบทดสอบ
            </button>
            {isPreTest && (
              <button
                onClick={() => router.push(courseUrl)}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
              >
                ข้ามไปยังเนื้อหาคอร์ส
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── In progress ────────────────────────────────────────────────────────────
  if (state === 'in_progress' && assessment) {
    const question = assessment.questions[currentIndex]
    const totalQ = assessment.questions.length
    const answered = Object.keys(answers).length
    const isLast = currentIndex === totalQ - 1
    const canSubmit = answered === totalQ

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>ข้อ {currentIndex + 1} / {totalQ}</span>
            <span>ตอบแล้ว {answered}/{totalQ}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <p className="font-semibold text-gray-800 mb-4 leading-relaxed">{question.text}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => {
              const selected = answers[question.id] === opt.text
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(question.id, opt.text)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← ก่อนหน้า
          </button>
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-40 transition-colors"
            >
              ส่งคำตอบ ({answered}/{totalQ})
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              ถัดไป →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (state === 'result' && result) {
    const { score, passed, correct, total } = result
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">{passed ? '🎉' : '📚'}</div>
          <h2 className="text-xl font-bold mb-1">
            {passed ? 'ผ่านแล้ว!' : 'ยังไม่ผ่าน'}
          </h2>
          <p className="text-gray-500 text-sm mb-4">{label} — {courseName}</p>

          {/* Score circle */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold mb-4 ${
            passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {score}%
          </div>
          <p className="text-gray-400 text-sm mb-6">
            ตอบถูก {correct} จาก {total} ข้อ • เกณฑ์ผ่าน 70%
          </p>

          <div className="flex flex-col gap-3">
            {passed && !isPreTest && (
              <button
                onClick={() => router.push(`${courseUrl}/certificate`)}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                🏆 ดูใบประกาศ
              </button>
            )}
            {passed && isPreTest && (
              <button
                onClick={() => router.push(courseUrl)}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                ไปยังเนื้อหาคอร์ส →
              </button>
            )}
            {!passed && (
              <button
                onClick={handleStart}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                ทำใหม่อีกครั้ง
              </button>
            )}
            <button
              onClick={() => router.push(courseUrl)}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
            >
              กลับไปคอร์ส
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
