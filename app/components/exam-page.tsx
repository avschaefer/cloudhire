"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, AlertTriangle, User, Calculator } from "lucide-react"
import type { ExamData, UserBio } from "../page"
import type { Question } from "../utils/csv-parser"

interface TimeSpent {
  multipleChoice: number
  concepts: number
  calculations: number
}

interface ExamPageProps {
  initialExamData: ExamData
  userBio: UserBio
  onComplete: (examData: ExamData, timeSpent: number) => void
  examStartTime?: Date
  questions: Question[] // Pass questions dynamically
}

export default function ExamPage({ initialExamData, userBio, onComplete, examStartTime, questions }: ExamPageProps) {
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [currentSection, setCurrentSection] = useState<"multipleChoice" | "concepts" | "calculations">("multipleChoice")
  const [examData, setExamData] = useState<ExamData>(initialExamData)
  const [timeSpent, setTimeSpent] = useState<TimeSpent>({
    multipleChoice: 0,
    concepts: 0,
    calculations: 0,
  })
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // Debug logs
  useEffect(() => {
    console.log("ExamPage received questions:", questions)
    console.log("Questions by type:", {
      multipleChoice: questions.filter((q) => q.type === "multipleChoice"),
      concepts: questions.filter((q) => q.type === "concepts"),
      calculations: questions.filter((q) => q.type === "calculations"),
    })
  }, [questions])

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Track time spent in current section
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => ({
        ...prev,
        [currentSection]: prev[currentSection] + 1,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSection])

  // Auto-save functionality
  useEffect(() => {
    localStorage.setItem("currentExamData", JSON.stringify(examData))
    localStorage.setItem("currentTimeSpent", JSON.stringify(timeSpent))
    setLastSaved(new Date())
    const autoSave = setInterval(() => {
      localStorage.setItem("currentExamData", JSON.stringify(examData))
      localStorage.setItem("currentTimeSpent", JSON.stringify(timeSpent))
      setLastSaved(new Date())
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSave)
  }, [examData, timeSpent])

  // Auto-select first available section
  useEffect(() => {
    const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
    const conceptQuestions = questions.filter((q) => q.type === "concepts")
    const calculationQuestions = questions.filter((q) => q.type === "calculations")

    if (mcQuestions.length > 0) {
      setCurrentSection("multipleChoice")
    } else if (conceptQuestions.length > 0) {
      setCurrentSection("concepts")
    } else if (calculationQuestions.length > 0) {
      setCurrentSection("calculations")
    }
  }, [questions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSectionChange = (section: "multipleChoice" | "concepts" | "calculations") => {
    setCurrentSection(section)
  }

  const updateExamData = (section: keyof ExamData, questionId: string, value: string) => {
    setExamData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: value,
      },
    }))
  }

  const getCompletionStatus = () => {
    const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
    const conceptQuestions = questions.filter((q) => q.type === "concepts")
    const calculationQuestions = questions.filter((q) => q.type === "calculations")

    const mcCompleted = mcQuestions.filter((q) => examData.multipleChoice[q.ID]?.trim().length > 0).length
    const conceptsCompleted = conceptQuestions.filter((q) => examData.concepts[q.ID]?.trim().length > 0).length

    const calculationsCompleted = calculationQuestions.filter((q) => {
      const hasNumericalAnswer = examData.calculations[`${q.ID}-answer`]?.trim().length > 0
      const hasExplanation = examData.calculations[`${q.ID}-explanation`]?.trim().length > 0
      return hasNumericalAnswer || hasExplanation // Considered complete if either part is answered
    }).length

    return {
      multipleChoice: { completed: mcCompleted, total: mcQuestions.length },
      concepts: { completed: conceptsCompleted, total: conceptQuestions.length },
      calculations: { completed: calculationsCompleted, total: calculationQuestions.length },
      overall: mcCompleted + conceptsCompleted + calculationsCompleted,
      totalOverall: mcQuestions.length + conceptQuestions.length + calculationQuestions.length,
    }
  }

  const handleAutoSubmit = () => {
    const totalTime = Object.values(timeSpent).reduce((sum, time) => sum + time, 0)
    onComplete(examData, totalTime)
  }

  const handleSubmit = () => {
    const totalTime = Object.values(timeSpent).reduce((sum, time) => sum + time, 0)
    localStorage.removeItem("currentExamData")
    localStorage.removeItem("currentTimeSpent")
    onComplete(examData, totalTime)
  }

  const completion = getCompletionStatus()
  const progressPercentage = completion.totalOverall > 0 ? (completion.overall / completion.totalOverall) * 100 : 0

  const getTimeWarningColor = () => {
    if (timeLeft <= 300) return "text-red-600" // 5 minutes
    if (timeLeft <= 600) return "text-orange-600" // 10 minutes
    return "text-gray-600"
  }

  const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q.type === "calculations")

  console.log("Current section questions:", {
    currentSection,
    mcCount: mcQuestions.length,
    conceptCount: conceptQuestions.length,
    calcCount: calculationQuestions.length,
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {userBio.firstName} {userBio.lastName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <Progress value={progressPercentage} className="w-24" />
                <span className="text-sm font-medium">
                  {completion.overall}/{completion.totalOverall}
                </span>
              </div>

              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-semibold leading-7">Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Timer */}
              <div className={`flex items-center gap-2 text-lg font-semibold ${getTimeWarningColor()}`}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "multipleChoice", label: "Multiple Choice", icon: "📝", questions: mcQuestions },
                  { id: "concepts", label: "Concepts", icon: "💡", questions: conceptQuestions },
                  { id: "calculations", label: "Calculations", icon: "🧮", questions: calculationQuestions },
                ].map((section) => {
                  if (section.questions.length === 0) return null

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id as any)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        currentSection === section.id
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{section.label}</span>
                        </div>
                        {completion[section.id as keyof typeof completion].completed ===
                          completion[section.id as keyof typeof completion].total && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {completion[section.id as keyof typeof completion].completed}/
                        {completion[section.id as keyof typeof completion].total} completed
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Time Warnings */}
            {timeLeft <= 600 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {timeLeft <= 300 ? "Only 5 minutes remaining!" : "Less than 10 minutes remaining!"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                {/* Multiple Choice Section */}
                {currentSection === "multipleChoice" && mcQuestions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Multiple Choice</h2>
                      <Badge variant="outline">
                        {completion.multipleChoice.completed}/{completion.multipleChoice.total} completed
                      </Badge>
                    </div>

                    <div className="space-y-8">
                      {mcQuestions.map((q, index) => (
                        <div key={q.ID} className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">Question {index + 1}:</p>
                            <p className="text-lg text-gray-900 leading-relaxed">{q.question}</p>
                          </div>
                          {q.options && q.options.length > 0 ? (
                            <RadioGroup
                              value={examData.multipleChoice[q.ID] || ""}
                              onValueChange={(value) => updateExamData("multipleChoice", q.ID, value)}
                            >
                              {q.options.map((option) => (
                                <div
                                  key={option}
                                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50"
                                >
                                  <RadioGroupItem value={option} id={`${q.ID}-${option}`} />
                                  <Label htmlFor={`${q.ID}-${option}`} className="flex-1 cursor-pointer">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <div className="text-red-500 text-sm">No options available for this question</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concepts Section */}
                {currentSection === "concepts" && conceptQuestions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Concepts</h2>
                      <Badge variant="outline">
                        {completion.concepts.completed}/{completion.concepts.total} completed
                      </Badge>
                    </div>

                    <div className="space-y-8">
                      {conceptQuestions.map((q, index) => (
                        <div key={q.ID} className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Question {index + 1 + mcQuestions.length}:
                            </p>
                            <p className="text-lg text-gray-900 leading-relaxed">{q.question}</p>
                            {q.difficulty && (
                              <Badge variant="outline" className="mt-2">
                                {q.difficulty}
                              </Badge>
                            )}
                          </div>
                          <Textarea
                            value={examData.concepts[q.ID] || ""}
                            onChange={(e) => updateExamData("concepts", q.ID, e.target.value)}
                            placeholder="Type your answer here..."
                            rows={6}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500">{examData.concepts[q.ID]?.length || 0} characters</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculations Section */}
                {currentSection === "calculations" && calculationQuestions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Calculations</h2>
                      <Badge variant="outline">
                        {completion.calculations.completed}/{completion.calculations.total} completed
                      </Badge>
                    </div>

                    <div className="space-y-8">
                      {calculationQuestions.map((q, index) => (
                        <div key={q.ID} className="space-y-6">
                          <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Question {index + 1 + mcQuestions.length + conceptQuestions.length}:
                            </p>
                            <p className="text-lg text-gray-900 leading-relaxed">{q.question}</p>
                            {q.difficulty && (
                              <Badge variant="outline" className="mt-2">
                                {q.difficulty}
                              </Badge>
                            )}
                          </div>

                          {/* Numerical Answer */}
                          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Calculator className="w-4 h-4 text-blue-600" />
                              <Label htmlFor={`${q.ID}-answer`} className="font-medium text-blue-800">
                                Final Numerical Answer
                              </Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                id={`${q.ID}-answer`}
                                type="text"
                                value={examData.calculations[`${q.ID}-answer`] || ""}
                                onChange={(e) => updateExamData("calculations", `${q.ID}-answer`, e.target.value)}
                                placeholder="Enter your answer..."
                                className="text-lg font-mono bg-white"
                              />
                            </div>
                            <p className="text-xs text-blue-600">
                              Enter your final answer with appropriate units (e.g., 500 Watts, 1.0 MPa, etc.)
                            </p>
                          </div>

                          {/* Work Shown / Explanation */}
                          <div className="space-y-3">
                            <Label htmlFor={`${q.ID}-explanation`} className="font-medium text-gray-800">
                              Show Your Work & Explanation
                            </Label>
                            <p className="text-sm text-gray-600">
                              Explain your approach, show calculations, and describe your reasoning. This allows for
                              partial credit even if the final answer is incorrect.
                            </p>
                            <Textarea
                              id={`${q.ID}-explanation`}
                              value={examData.calculations[`${q.ID}-explanation`] || ""}
                              onChange={(e) => updateExamData("calculations", `${q.ID}-explanation`, e.target.value)}
                              placeholder="Show your work here..."
                              rows={12}
                              className="resize-none font-mono text-sm"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {examData.calculations[`${q.ID}-explanation`]?.length || 0} characters
                              </p>
                            </div>
                          </div>

                          {/* Completion Status */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty section message or no questions loaded */}
                {questions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-red-500 font-medium">No questions loaded from CSV file.</p>
                    <p className="text-gray-500 text-sm mt-2">Please check the CSV file format and content.</p>
                  </div>
                )}

                {questions.length > 0 &&
                  ((currentSection === "multipleChoice" && mcQuestions.length === 0) ||
                    (currentSection === "concepts" && conceptQuestions.length === 0) ||
                    (currentSection === "calculations" && calculationQuestions.length === 0)) && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No questions available in this section.</p>
                      <p className="text-gray-400 text-sm mt-2">Try switching to another section.</p>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Submit Section */}
            {questions.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="font-semibold text-gray-900">Ready to submit?</p>
                      <p className="text-sm text-gray-600">
                        You have completed {completion.overall} out of {completion.totalOverall} questions
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowSubmitConfirm(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Submit Assessment?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to submit your assessment? You have completed {completion.overall} out of{" "}
                {completion.totalOverall} questions.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Time remaining: {formatTime(timeLeft)}</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} className="flex-1">
                  Continue Assessment
                </Button>
                <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Submit Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
