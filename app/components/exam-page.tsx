"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, AlertTriangle, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Add types before interface
type ExamData = { multipleChoice: Record<string, string>; concepts: Record<string, string>; calculations: Record<string, string> };

type UserBio = { firstName: string; lastName: string; email: string; position: string; experience: string; motivation: string; educationalDegree: string };

type Question = { ID: string; question: string; type: 'multipleChoice' | 'concepts' | 'calculations' };

interface TimeSpent {
  multipleChoice: number
  concepts: number
  calculations: number
}

interface ExamPageProps {
  initialExamData: ExamData
  userBio: UserBio
  onComplete: (examData: ExamData, timeSpent: number) => void
  questions: Question[]
  userId: string
}

export default function ExamPage({ initialExamData, userBio, onComplete, questions }: ExamPageProps) {
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<"multipleChoice" | "concepts" | "calculations">("multipleChoice")
  const [examData, setExamData] = useState<ExamData>(initialExamData)
  const [timeSpent, setTimeSpent] = useState<TimeSpent>({
    multipleChoice: 0,
    concepts: 0,
    calculations: 0,
  })
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

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
      setTimeSpent((prev: TimeSpent) => ({
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
    const mcQuestions = questions.filter((q) => q && q.type === "multipleChoice")
    const conceptQuestions = questions.filter((q) => q && q.type === "concepts")
    const calculationQuestions = questions.filter((q) => q && q.type === "calculations")

    const mcCompleted = mcQuestions.filter((q) => examData.multipleChoice[q.ID]?.trim().length > 0).length
    const conceptsCompleted = conceptQuestions.filter((q) => examData.concepts[q.ID]?.trim().length > 0).length

    const calculationsCompleted = calculationQuestions.filter((q) => {
      const hasNumericalAnswer = examData.calculations[`${q.ID}-answer`]?.trim().length > 0
      const hasExplanation = examData.calculations[`${q.ID}-explanation`]?.trim().length > 0
      return hasNumericalAnswer || hasExplanation
    }).length

    return {
      multipleChoice: { completed: mcCompleted, total: mcQuestions.length },
      concepts: { completed: conceptsCompleted, total: conceptQuestions.length },
      calculations: { completed: calculationsCompleted, total: calculationQuestions.length },
      overall: mcCompleted + conceptsCompleted + calculationsCompleted,
      totalOverall: mcQuestions.length + conceptQuestions.length + calculationQuestions.length,
    } as {
      multipleChoice: { completed: number; total: number };
      concepts: { completed: number; total: number };
      calculations: { completed: number; total: number };
      overall: number;
      totalOverall: number;
    };
  };

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

  const mcQuestions = questions.filter((q) => q && q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q && q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q && q.type === "calculations")

  const nonBehavioralQuestions = questions.filter(q => q); // Filter out any undefined questions
  const currentQuestion = nonBehavioralQuestions[currentQuestionIndex];
  const isAnswered = currentQuestion ? !!examData[currentQuestion.type]?.[currentQuestion.ID] : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
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
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <Progress value={progressPercentage} className="w-24" />
                <span className="text-sm font-medium">
                  {completion.overall}/{completion.totalOverall}
                </span>
              </div>

              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-semibold leading-7">Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}

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
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "multipleChoice", label: "Multiple Choice", questions: mcQuestions },
                  { id: "concepts", label: "Concepts", questions: conceptQuestions },
                  { id: "calculations", label: "Calculations", questions: calculationQuestions },
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
                        {completion[section.id as 'multipleChoice' | 'concepts' | 'calculations'].completed ===
                          completion[section.id as 'multipleChoice' | 'concepts' | 'calculations'].total && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {completion[section.id as 'multipleChoice' | 'concepts' | 'calculations'].completed}/
                        {completion[section.id as 'multipleChoice' | 'concepts' | 'calculations'].total} completed
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {timeLeft <= 600 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {timeLeft <= 300 ? "Only 5 minutes remaining!" : "Less than 10 minutes remaining!"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="lg:col-span-3">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardContent className="p-8">
                {questions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-medium">No questions available in this assessment.</p>
                    <p className="text-gray-500 text-sm mt-2">You can proceed to submit.</p>
                  </div>
                )}

                {currentQuestion && (
                  <div>
                    <h2 className="text-xl font-bold">{currentQuestion.question}</h2>
                    {currentQuestion.type === 'calculations' ? (
                      <>
                        <Label>Final Answer</Label>
                        <Input value={examData.calculations[`${currentQuestion.ID}-answer`] || ''} onChange={(e) => updateExamData('calculations', `${currentQuestion.ID}-answer`, e.target.value)} />
                        <Label>Show your work (optional)</Label>
                        <Textarea value={examData.calculations[`${currentQuestion.ID}-explanation`] || ''} onChange={(e) => updateExamData('calculations', `${currentQuestion.ID}-explanation`, e.target.value)} />
                      </>
                    ) : currentQuestion.type === 'concepts' ? (
                      <>
                        <Label>Answer</Label>
                        <Textarea value={examData.concepts[currentQuestion.ID] || ''} onChange={(e) => updateExamData('concepts', currentQuestion.ID, e.target.value)} />
                      </>
                    ) : (
                      <>
                        <Label>Answer</Label>
                        <Input value={examData.multipleChoice[currentQuestion.ID] || ''} onChange={(e) => updateExamData('multipleChoice', currentQuestion.ID, e.target.value)} />
                      </>
                    )}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <Button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(i => i - 1)}>Previous</Button>
                  <Button disabled={currentQuestionIndex === nonBehavioralQuestions.length - 1} onClick={() => setCurrentQuestionIndex(i => i + 1)}>Next</Button>
                </div>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </div>

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
