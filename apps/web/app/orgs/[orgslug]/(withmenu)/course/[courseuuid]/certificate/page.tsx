'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiff } from '@components/Contexts/LiffContext'
import { getMyCertificate, type CertificateRecord } from '@services/courses/assessments'

interface PageProps {
  params: Promise<{ courseuuid: string; orgslug: string }>
}

export default function CertificatePage({ params }: PageProps) {
  const router = useRouter()
  const { profile } = useLiff()
  const userId = profile?.userId ?? ''

  const [courseuuid, setCourseuuid] = useState('')
  const [orgslug, setOrgslug] = useState('')
  const [cert, setCert] = useState<CertificateRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ courseuuid, orgslug }) => {
      setCourseuuid(courseuuid)
      setOrgslug(orgslug)
    })
  }, [params])

  useEffect(() => {
    if (!userId || !courseuuid) return
    getMyCertificate(courseuuid, userId).then((c) => {
      setCert(c)
      setLoading(false)
    })
  }, [userId, courseuuid])

  const courseUrl = `/orgs/${orgslug}/course/${courseuuid}`

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">ยังไม่มีใบประกาศ</h2>
        <p className="text-gray-500 mb-6">ทำแบบทดสอบหลังเรียนให้ผ่านก่อนเพื่อรับใบประกาศ</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => router.push(`${courseUrl}/posttest`)}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            ทำแบบทดสอบหลังเรียน
          </button>
          <button
            onClick={() => router.push(courseUrl)}
            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors"
          >
            กลับไปคอร์ส
          </button>
        </div>
      </div>
    )
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Certificate header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">ใบประกาศนียบัตร</h1>
          <p className="text-gray-500 text-sm">Certificate of Completion</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-6" />

        {/* Recipient info */}
        <div className="text-center space-y-2 mb-6">
          <p className="text-gray-500 text-sm">มอบให้แก่</p>
          <p className="text-xl font-bold text-gray-800">
            {profile?.displayName || 'ผู้เรียน'}
          </p>
          <p className="text-gray-500 text-sm mt-3">ได้ผ่านการเรียนและทดสอบหลักสูตรเรียบร้อยแล้ว</p>
        </div>

        {/* Issued date */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-xs">ออกใบประกาศเมื่อ</p>
          <p className="text-gray-600 font-medium">{issuedDate}</p>
          <p className="text-gray-400 text-xs mt-1">รหัสใบประกาศ: {cert.id.slice(0, 12).toUpperCase()}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-6" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
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
