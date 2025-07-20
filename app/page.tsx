"use client"

import { useState } from "react"
import WelcomePage from "./components/welcome-page"
import BioPage from "./components/bio-page"
import ExamPage from "./components/exam-page"
import SubmissionPage from "./components/submission-page"

// Define a minimal Question interface, even if unused for now
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
  education?: string
  phone?: string
  linkedIn?: string
  resume?: string
  transcript?: string
}

export interface ExamData {
  multipleChoice: Record<string, string>
  concepts: Record<string, string>
  calculations: Record<string, string>
}

export interface ExamResult {
  userBio: UserBio
  answers: any[] // Simplified for now
  totalScore: number
  maxScore: number
  completedAt: string
  timeSpent: number
}

type ExamStep = "welcome" | "bio" | "exam" | "submission"

export default function ExamApp() {
  const [currentStep, setCurrentStep] = useState<ExamStep>("welcome")
  const [userBio, setUserBio] = useState<UserBio | null>(null)
  // Initialize with an empty array of questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleWelcomeComplete = () => {
    // No questions to load, just move to the next step
    setCurrentStep("bio")
  }

  const handleBioComplete = (bio: UserBio) => {
    setUserBio(bio)
    setCurrentStep("exam")
  }

  const handleExamComplete = async (examData: ExamData, timeSpent: number) => {
    if (!userBio) return

    setLoading(true)

    try {
      const result: ExamResult = {
        userBio,
        answers: [], // No answers since there are no questions
        totalScore: 0,
        maxScore: 0,
        completedAt: new Date().toISOString(),
        timeSpent,
      }

      setExamResult(result)
      setCurrentStep("submission")
    } catch (error) {
      console.error("Error processing exam:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToWelcome = () => {
    setCurrentStep("welcome")
    setUserBio(null)
    setQuestions([])
    setExamResult(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your exam...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "welcome" && <WelcomePage onNext={handleWelcomeComplete} />}

      {currentStep === "bio" && (
        <BioPage
          onNext={handleBioComplete}
          userBio={userBio || { firstName: "", lastName: "", email: "", position: "", experience: "", motivation: "" }}
        />
      )}

      {currentStep === "exam" && userBio && (
        <ExamPage
          initialExamData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
          userBio={userBio}
          onComplete={handleExamComplete}
          questions={questions} // Pass the empty questions array
        />
      )}

      {currentStep === "submission" && examResult && userBio && (
        <SubmissionPage 
          userBio={userBio}
          examData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
          totalTimeSpent={examResult.timeSpent}
        />
      )}
    </div>
  )
}
