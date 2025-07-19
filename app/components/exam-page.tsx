"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
import type { Question } from "../utils/csv-parser"
import type { ExamData } from "../utils/types"

interface ExamPageProps {
  questions: Question[]
  onComplete: (data: ExamData) => void
}

export default function ExamPage({ questions, onComplete }: ExamPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<ExamData>({
    multipleChoice: {},
    concepts: {},
    calculations: {},
  })
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswerChange = (questionId: number, type: Question["type"], value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [questionId]: value,
      },
    }))
  }

  const handleSubmit = () => {
    onComplete(answers)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <div className="flex items-center text-red-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
            <CardDescription>
              {currentQuestion.category} | {currentQuestion.difficulty} | {currentQuestion.points} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "multipleChoice" && currentQuestion.options && (
              <RadioGroup
                onValueChange={(value) => handleAnswerChange(currentQuestion.ID, currentQuestion.type, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${currentQuestion.ID}-o${index}`} />
                    <Label htmlFor={`q${currentQuestion.ID}-o${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {currentQuestion.type === "concepts" && (
              <Textarea
                placeholder="Explain the concept..."
                onChange={(e) => handleAnswerChange(currentQuestion.ID, currentQuestion.type, e.target.value)}
                rows={8}
              />
            )}
            {currentQuestion.type === "calculations" && (
              <Textarea
                placeholder="Show your work and provide the final answer..."
                onChange={(e) => handleAnswerChange(currentQuestion.ID, currentQuestion.type, e.target.value)}
                rows={8}
              />
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        )}
      </div>
    </div>
  )
}
