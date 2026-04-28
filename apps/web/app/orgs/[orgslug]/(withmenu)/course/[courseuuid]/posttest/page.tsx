import React from 'react'
import ExamPage from '@components/Pages/Assessment/ExamPage'

const PostTestPage = async (props: any) => {
  const { courseuuid, orgslug } = await props.params
  return (
    <ExamPage
      courseId={courseuuid}
      courseName=""
      type="POST_TEST"
      orgslug={orgslug}
    />
  )
}

export default PostTestPage
