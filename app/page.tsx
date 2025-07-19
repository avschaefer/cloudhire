"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import WelcomePage from "./components/welcome-page"
import BioPage from "./components/bio-page"
import ExamPage from "./components/exam-page"
import SubmissionPage from "./components/submission-page"
import ProgressTracker from "./components/progress-tracker"
import { fetchAndParseQuestionsCsv, getInitialExamData, type Question } from "./utils/csv-parser"
import { gradeExam, getFallbackGrading, type GradingResult } from "@/utils/grader"
import { generateEnhancedHTMLReport } from "./utils/enhanced-report-generator"
import { sendReportEmail } from "./utils/email-service"

export type Stage = "welcome" | "bio" | "exam" | "submission"

export interface UserBio {
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  experience: string
  education: string
  linkedIn?: string
  resume?: File
  transcript?: File
}

export interface ExamData {
  multipleChoice: { [key: string]: string }
  concepts: { [key: string]: string }
  calculations: { [key: string]: string }
}

export interface AppState {
  currentStage: Stage
  userBio: UserBio
  examData: ExamData
  examStartTime?: Date
  examEndTime?: Date
  totalTimeSpent: number
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentStage: "welcome",
    userBio: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      education: "",
      linkedIn: "",
      resume: undefined,
      transcript: undefined,
    },
    examData: {
      multipleChoice: {},
      concepts: {},
      calculations: {},
    },
    totalTimeSpent: 0,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const fetchedQuestions = await fetchAndParseQuestionsCsv()
        setQuestions(fetchedQuestions)
        setIsLoadingQuestions(false)

        const savedState = localStorage.getItem("examAppState")
        if (savedState) {
          const parsed = JSON.parse(savedState)
          setAppState({
            ...parsed,
            examStartTime: parsed.examStartTime ? new Date(parsed.examStartTime) : undefined,
            examEndTime: parsed.examEndTime ? new Date(parsed.examEndTime) : undefined,
          })
        } else {
          setAppState((prev) => ({
            ...prev,
            examData: getInitialExamData(fetchedQuestions),
          }))
        }
      } catch (error) {
        console.error("Failed to load questions or app state:", error)
        setQuestionError("Failed to load exam questions. Please try again later.")
        setIsLoadingQuestions(false)
      }
    }

    loadAppState()
  }, [])

  useEffect(() => {
    if (!isLoadingQuestions) {
      localStorage.setItem("examAppState", JSON.stringify(appState))
    }
  }, [appState, isLoadingQuestions])

  const updateStage = (stage: Stage) => {
    setAppState((prev) => ({ ...prev, currentStage: stage }))
  }

  const updateUserBio = (bio: UserBio) => {
    setAppState((prev) => ({ ...prev, userBio: bio }))
  }

  const updateExamData = (examData: ExamData) => {
    setAppState((prev) => ({ ...prev, examData }))
  }

  const completeExam = async (finalExamData: ExamData, timeSpent: number) => {
    const examEndTime = new Date()
    setAppState((prev) => ({
      ...prev,
      currentStage: "submission",
      examData: finalExamData,
      examEndTime,
      totalTimeSpent: timeSpent,
    }))

    setTimeout(async () => {
      const submissionId = `EXAM_${Date.now()}`
      const reportData = {
        candidate: appState.userBio,
        examData: finalExamData,
        examStartTime: appState.examStartTime,
        examEndTime,
        totalTimeSpent: timeSpent,
        submissionId,
        submittedAt: new Date(),
        questions,
      }

      console.log("Starting AI grading with xAI Grok...")

      // Use modular grading system with Grok
      let gradingResult: GradingResult | null = await gradeExam(finalExamData, appState.userBio, questions)

      if (!gradingResult) {
        console.log("Grok grading failed, using fallback grading")
        gradingResult = getFallbackGrading(finalExamData, questions)
      }

      const enhancedReportData = {
        ...reportData,
        gradingResult,
      }

      const htmlReport = generateEnhancedHTMLReport(enhancedReportData)

      // Send email with report data for D1 storage
      const emailSent = await sendReportEmail(
        htmlReport,
        `${appState.userBio.firstName} ${appState.userBio.lastName}`,
        appState.userBio.position,
        {
          submissionId,
          candidateName: `${appState.userBio.firstName} ${appState.userBio.lastName}`,
          position: appState.userBio.position,
          examData: finalExamData,
          gradingResult,
          submittedAt: new Date(),
        },
      )

      if (emailSent) {
        console.log("AI-graded report successfully emailed to hiring manager")
      } else {
        console.error("Failed to email AI-graded report")
      }

      localStorage.setItem("latestExamReport", JSON.stringify(enhancedReportData))
    }, 1000)
  }

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading exam questions...</p>
        </div>
      </div>
    )
  }

  if (questionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Exam</h2>
          <p className="text-gray-700 mb-6">{questionError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressTracker currentStage={appState.currentStage} />
      <main>
        {appState.currentStage === "welcome" && <WelcomePage onNext={() => updateStage("bio")} />}

        {appState.currentStage === "bio" && (
          <BioPage userBio={appState.userBio} onUpdateBio={updateUserBio} onNext={() => updateStage("exam")} />
        )}

        {appState.currentStage === "exam" && (
          <ExamPage
            initialExamData={appState.examData}
            userBio={appState.userBio}
            onComplete={completeExam}
            examStartTime={appState.examStartTime}
            questions={questions}
          />
        )}

        {appState.currentStage === "submission" && (
          <SubmissionPage
            userBio={appState.userBio}
            examData={appState.examData}
            examStartTime={appState.examStartTime}
            examEndTime={appState.examEndTime}
            totalTimeSpent={appState.totalTimeSpent}
          />
        )}
      </main>
    </div>
  )
}
