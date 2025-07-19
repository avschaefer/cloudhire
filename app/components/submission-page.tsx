"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { ExamData, UserBio } from "../page"

interface SubmissionPageProps {
  userBio: UserBio | null
  examData: ExamData | null
  onStartNew: () => void
}

export default function SubmissionPage({ userBio, examData, onStartNew }: SubmissionPageProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getCompletionStats = () => {
    const mcCompleted = Object.keys(examData?.multipleChoice || {}).length
    const conceptsCompleted = Object.values(examData?.concepts || {}).filter((v) => v.trim().length > 0).length
    const calculationsCompleted = Object.values(examData?.calculations || {}).filter((v) => v.trim().length > 0).length

    return {
      multipleChoice: mcCompleted,
      concepts: conceptsCompleted,
      calculations: calculationsCompleted,
      total: mcCompleted + conceptsCompleted + calculationsCompleted,
    }
  }

  const stats = getCompletionStats()

  return (
    <div className="max-w-2xl mx-auto p-6 pt-8">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <CardTitle className="mt-4">Submission Successful!</CardTitle>
          <CardDescription>Thank you for completing the assessment.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Your responses have been recorded. We will review your submission and get back to you soon.
          </p>
          <Button onClick={onStartNew}>Start New Assessment</Button>
        </CardContent>
      </Card>
    </div>
  )
}
