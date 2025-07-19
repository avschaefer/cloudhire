"use client"

import { useState, useEffect } from "react"
import { WelcomePage } from "./components/welcome-page"
import { BioPage } from "./components/bio-page"
import { ExamPage } from "./components/exam-page"
import { SubmissionPage } from "./components/submission-page"
import { parseCSV } from "./utils/csv-parser"

export interface Question {
  id: number
  question: string
  type: "multiple-choice" | "short-answer" | "essay"
  options?: string[]
  correctAnswer?: string
  points: number
  category: string
}

export interface UserInfo {
  name: string
  email: string
  position: string
  experience: string
  motivation: string
}

export interface Answer {
  questionId: number
  answer: string
  timeSpent: number
}

export interface ExamResult {
  userInfo: UserInfo
  answers: Answer[]
  totalScore: number
  maxScore: number
  completedAt: string
  timeSpent: number
}

type ExamStep = "welcome" | "bio" | "exam" | "submission"

export default function ExamApp() {
  const [currentStep, setCurrentStep] = useState<ExamStep>("welcome")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/Questions.csv")
        const csvText = await response.text()
        const parsedQuestions = parseCSV(csvText)
        setQuestions(parsedQuestions)
      } catch (error) {
        console.error("Error loading questions:", error)
        // Fallback questions if CSV fails to load
        const fallbackQuestions: Question[] = [
          {
            id: 1,
            question: "What is your experience with cloud technologies?",
            type: "essay",
            points: 10,
            category: "Technical",
          },
          {
            id: 2,
            question: "Which programming language do you prefer for backend development?",
            type: "multiple-choice",
            options: ["JavaScript/Node.js", "Python", "Java", "Go", "Other"],
            points: 5,
            category: "Technical",
          },
          {
            id: 3,
            question: "Describe a challenging project you've worked on recently.",
            type: "essay",
            points: 15,
            category: "Experience",
          },
        ]
        setQuestions(fallbackQuestions)
      }
    }

    loadQuestions()
  }, [])

  const handleWelcomeComplete = () => {
    setCurrentStep("bio")
  }

  const handleBioComplete = (info: UserInfo) => {
    setUserInfo(info)
    setCurrentStep("exam")
  }

  const handleExamComplete = async (examAnswers: Answer[], timeSpent: number) => {
    if (!userInfo) return

    setLoading(true)
    setAnswers(examAnswers)

    try {
      // Calculate basic score (this will be enhanced with AI grading)
      const totalScore = examAnswers.reduce((sum, answer) => {
        const question = questions.find((q) => q.id === answer.questionId)
        return sum + (question?.points || 0)
      }, 0)

      const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

      const result: ExamResult = {
        userInfo,
        answers: examAnswers,
        totalScore,
        maxScore,
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
    setUserInfo(null)
    setAnswers([])
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
      {currentStep === "welcome" && <WelcomePage onComplete={handleWelcomeComplete} />}

      {currentStep === "bio" && <BioPage onComplete={handleBioComplete} />}

      {currentStep === "exam" && userInfo && (
        <ExamPage questions={questions} userInfo={userInfo} onComplete={handleExamComplete} />
      )}

      {currentStep === "submission" && examResult && (
        <SubmissionPage examResult={examResult} onBackToWelcome={handleBackToWelcome} />
      )}
    </div>
  )
}
