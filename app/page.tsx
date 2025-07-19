"use client"

import { useState, useEffect } from "react"
import WelcomePage from "./components/welcome-page"
import BioPage from "./components/bio-page"
import ExamPage from "./components/exam-page"
import SubmissionPage from "./components/submission-page"
import ProgressTracker from "./components/progress-tracker"
import { fetchAndParseQuestionsCsv, type Question } from "./utils/csv-parser"
import type { UserBio, ExamData } from "./utils/types"

const EMPTY_BIO: UserBio = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  education: "",
}

export type Stage = "welcome" | "bio" | "exam" | "submission"

export default function App() {
  const [stage, setStage] = useState<Stage>("welcome")
  const [userBio, setUserBio] = useState<UserBio | null>(null)
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchAndParseQuestionsCsv()
        setQuestions(fetchedQuestions)
      } catch (err) {
        setError("Failed to load exam questions. Please try refreshing the page.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadQuestions()
  }, [])

  const handleBioSubmit = (bio: UserBio) => {
    setUserBio(bio)
    setStage("exam")
  }

  const handleExamComplete = (data: ExamData) => {
    setExamData(data)
    setStage("submission")
  }

  const handleStartNew = () => {
    setUserBio(null)
    setExamData(null)
    setStage("welcome")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  const renderContent = () => {
    switch (stage) {
      case "welcome":
        return <WelcomePage onNext={() => setStage("bio")} />
      case "bio":
        return <BioPage userBio={userBio ?? EMPTY_BIO} onUpdateBio={handleBioSubmit} />
      case "exam":
        return <ExamPage questions={questions} onComplete={handleExamComplete} />
      case "submission":
        return <SubmissionPage userBio={userBio} examData={examData} onStartNew={handleStartNew} />
      default:
        return <WelcomePage onNext={() => setStage("bio")} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressTracker currentStage={stage} />
      <main>{renderContent()}</main>
    </div>
  )
}
