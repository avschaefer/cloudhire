"use client"

import { useState } from "react"
import WelcomePage from "./components/welcome-page"
import BioPage from "./components/bio-page"
import BehavioralPage from "./components/behavioral-page"
import ExamPage from "./components/exam-page"
import SubmissionPage from "./components/submission-page"
import type { BehavioralAnswers } from "./components/behavioral-page"

export interface Question {
  ID: string
  question: string
  type: "multipleChoice" | "concepts" | "calculations"
  options?: string[]
  difficulty?: string
}

export interface UserBio {
  firstName: string
  lastName: string
  email: string
  position: string
  experience: string
  motivation: string
  educationalDegree: string
  resume?: File
  transcript?: File
  projects?: File
}

export interface ExamData {
  multipleChoice: Record<string, string>
  concepts: Record<string, string>
  calculations: Record<string, string>
}

export interface ExamResult {
  userBio: UserBio
  behavioralAnswers: BehavioralAnswers
  answers: any[]
  totalScore: number
  maxScore: number
  completedAt: string
  timeSpent: number
}

type Step = "welcome" | "bio" | "behavioral" | "exam" | "submission"

const initialBio: UserBio = {
  firstName: "",
  lastName: "",
  email: "",
  position: "",
  experience: "",
  motivation: "",
  educationalDegree: "",
}

export default function ExamApp() {
  const [step, setStep] = useState<Step>("welcome")
  const [userBio, setUserBio] = useState<UserBio | null>(null)
  const [behavioralAnswers, setBehavioralAnswers] = useState<BehavioralAnswers>({})
  const [questions] = useState<Question[]>([])
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleBioNext = (bio: UserBio) => {
    setUserBio(bio)
    setStep("behavioral")
  }

  const handleBehavioralNext = (answers: BehavioralAnswers) => {
    setBehavioralAnswers(answers)
    setStep("exam")
  }

  const handleExamComplete = async (_exam: ExamData, timeSpent: number) => {
    if (!userBio) return

    setLoading(true)
    try {
      const result: ExamResult = {
        userBio,
        behavioralAnswers,
        answers: [],
        totalScore: 0,
        maxScore: 0,
        completedAt: new Date().toISOString(),
        timeSpent,
      }
      setExamResult(result)
      setStep("submission")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-lg">Processing results…</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomePage onNext={() => setStep("bio")} />
      case "bio":
        return <BioPage onNext={handleBioNext} userBio={userBio ?? initialBio} />
      case "behavioral":
        return <BehavioralPage onNext={handleBehavioralNext} />
      case "exam":
        if (userBio) {
          return (
            <ExamPage
              initialExamData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
              userBio={userBio}
              questions={questions}
              onComplete={handleExamComplete}
            />
          )
        }
        return null
      case "submission":
        if (examResult) {
          return (
            <SubmissionPage
              userBio={examResult.userBio}
              examData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
              totalTimeSpent={examResult.timeSpent}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  return <div className="min-h-screen bg-gray-50">{renderStep()}</div>
}
