"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { gradeExam } from "@/utils/grader"
import { sendReportEmail } from "@/app/utils/email-service"
import { parseCSV } from "@/app/utils/csv-parser"
import type { Question } from "@/app/utils/csv-parser"

export interface UserBio {
  firstName: string
  lastName: string
  email: string
  position: string
  experience: string
  education: string
}

export interface ExamData {
  multipleChoice: Record<number, string>
  concepts: Record<number, string>
  calculations: Record<number, string>
}

export default function ExamPage() {
  const [currentStep, setCurrentStep] = useState<"bio" | "exam" | "submission">("bio")
  const [userBio, setUserBio] = useState<UserBio>({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    experience: "",
    education: "",
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [examData, setExamData] = useState<ExamData>({
    multipleChoice: {},
    concepts: {},
    calculations: {},
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load questions from CSV
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/Questions.csv")
        const csvText = await response.text()
        const parsedQuestions = parseCSV(csvText)
        setQuestions(parsedQuestions)
      } catch (err) {
        console.error("Failed to load questions:", err)
        setError("Failed to load exam questions. Please refresh the page.")
      }
    }
    loadQuestions()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (currentStep === "exam" && timeRemaining > 0 && !submissionComplete) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, timeRemaining, submissionComplete])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userBio.firstName && userBio.lastName && userBio.email && userBio.position) {
      setCurrentStep("exam")
    }
  }

  const handleAnswerChange = (questionId: number, answer: string, type: string) => {
    const section = type.toLowerCase().includes("multiple")
      ? "multipleChoice"
      : type.toLowerCase().includes("open")
        ? "concepts"
        : "calculations"

    setExamData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: answer,
      },
    }))
  }

  const handleSubmitExam = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Grade the exam
      const gradingResult = await gradeExam(examData, userBio, questions)

      // Generate report HTML
      const reportHtml = generateReportHTML(userBio, examData, questions, gradingResult)

      // Send email report
      const emailSent = await sendReportEmail(reportHtml, `${userBio.firstName} ${userBio.lastName}`, userBio.position)

      if (emailSent) {
        setSubmissionComplete(true)
        setCurrentStep("submission")
      } else {
        setError("Failed to send report email. Please contact support.")
      }
    } catch (err) {
      console.error("Submission error:", err)
      setError("Failed to submit exam. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateReportHTML = (bio: UserBio, data: ExamData, qs: Question[], result: any) => {
    return `
      <html>
        <head><title>Exam Report - ${bio.firstName} ${bio.lastName}</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>Technical Exam Report</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2>Candidate Information</h2>
            <p><strong>Name:</strong> ${bio.firstName} ${bio.lastName}</p>
            <p><strong>Email:</strong> ${bio.email}</p>
            <p><strong>Position:</strong> ${bio.position}</p>
            <p><strong>Experience:</strong> ${bio.experience}</p>
            <p><strong>Education:</strong> ${bio.education}</p>
          </div>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2>Results</h2>
            <p><strong>Score:</strong> ${result.score}/100</p>
            <p><strong>Feedback:</strong> ${result.feedback}</p>
          </div>
          <p><em>Report generated on ${new Date().toLocaleString()}</em></p>
        </body>
      </html>
    `
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (currentStep === "bio") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Technical Assessment</CardTitle>
              <CardDescription>Please provide your information to begin the exam</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBioSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userBio.firstName}
                      onChange={(e) => setUserBio((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userBio.lastName}
                      onChange={(e) => setUserBio((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userBio.email}
                    onChange={(e) => setUserBio((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position Applied For</Label>
                  <Input
                    id="position"
                    value={userBio.position}
                    onChange={(e) => setUserBio((prev) => ({ ...prev, position: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={userBio.experience}
                    onChange={(e) => setUserBio((prev) => ({ ...prev, experience: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="education">Education Background</Label>
                  <Textarea
                    id="education"
                    value={userBio.education}
                    onChange={(e) => setUserBio((prev) => ({ ...prev, education: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Start Exam
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "exam") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Technical Assessment</h1>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-red-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Question */}
          {currentQuestion && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion.type} - {currentQuestion.category}
                </CardTitle>
                <CardDescription>
                  Difficulty: {currentQuestion.difficulty} | Points: {currentQuestion.points}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg">{currentQuestion.question}</p>

                  {currentQuestion.type.toLowerCase().includes("multiple") && currentQuestion.options && (
                    <RadioGroup
                      value={examData.multipleChoice[currentQuestion.ID] || ""}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.ID, value, currentQuestion.type)}
                    >
                      {currentQuestion.options.split(",").map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.trim()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`}>{option.trim()}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!currentQuestion.type.toLowerCase().includes("multiple") && (
                    <Textarea
                      placeholder="Enter your answer here..."
                      value={
                        currentQuestion.type.toLowerCase().includes("open")
                          ? examData.concepts[currentQuestion.ID] || ""
                          : examData.calculations[currentQuestion.ID] || ""
                      }
                      onChange={(e) => handleAnswerChange(currentQuestion.ID, e.target.value, currentQuestion.type)}
                      rows={6}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitExam}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}>
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (currentStep === "submission") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Exam Submitted Successfully!</CardTitle>
              <CardDescription>Thank you for completing the technical assessment</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Your exam has been submitted and a detailed report has been sent to the hiring team.
              </p>
              <p className="text-gray-600">
                We will review your responses and get back to you soon with the next steps.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Submission Details:</strong>
                  <br />
                  Candidate: {userBio.firstName} {userBio.lastName}
                  <br />
                  Position: {userBio.position}
                  <br />
                  Submitted: {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
