import React from 'react'
import ExamPage from '@components/Pages/Assessment/ExamPage'

const PreTestPage = async (props: any) => {
  const { courseuuid, orgslug } = await props.params
  return (
    <ExamPage
      courseId={courseuuid}
      courseName=""
      type="PRE_TEST"
      orgslug={orgslug}
    />
  )
}

export default PreTestPage
