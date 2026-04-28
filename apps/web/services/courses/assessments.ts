export type AssessmentType = 'PRE_TEST' | 'POST_TEST'

export interface QuestionOption {
  text: string
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
}

export interface Assessment {
  id: string
  type: AssessmentType
  courseId: string
  questions: Question[]
}

export interface SubmitResult {
  score: number
  passed: boolean
  correct: number
  total: number
  certificateIssued: boolean
}

export interface ScoreRecord {
  id: string
  score: number
  passed: boolean
  updatedAt: string
}

export interface CertificateRecord {
  id: string
  userId: string
  courseId: string
  issuedAt: string
  pdfUrl: string | null
}

export async function getAssessment(
  courseId: string,
  type: AssessmentType
): Promise<Assessment | null> {
  const res = await fetch(`/api/assessments/${courseId}/${type}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.assessment ?? null
}

export async function submitAssessment(
  courseId: string,
  type: AssessmentType,
  answers: Record<string, string>,
  userId: string
): Promise<SubmitResult | null> {
  const res = await fetch(`/api/assessments/${courseId}/${type}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-line-uid': userId,
    },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function getMyScore(
  courseId: string,
  type: AssessmentType,
  userId: string
): Promise<ScoreRecord | null> {
  const res = await fetch(`/api/assessments/${courseId}/${type}/score`, {
    headers: { 'x-line-uid': userId },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.score ?? null
}

export async function getMyCertificate(
  courseId: string,
  userId: string
): Promise<CertificateRecord | null> {
  const res = await fetch(`/api/certificates/${courseId}`, {
    headers: { 'x-line-uid': userId },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.certificate ?? null
}
