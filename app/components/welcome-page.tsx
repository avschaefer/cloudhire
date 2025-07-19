"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { fetchAndParseQuestionsCsv, type Question } from "../utils/csv-parser"

interface WelcomePageProps {
  onNext: () => void
}

export default function WelcomePage({ onNext }: WelcomePageProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQuestions = async () => {
      const fetchedQuestions = await fetchAndParseQuestionsCsv()
      setQuestions(fetchedQuestions)
      setIsLoading(false)
    }
    loadQuestions()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading assessment details...</p>
        </div>
      </div>
    )
  }

  const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q.type === "calculations")
  const totalQuestions = questions.length

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical Assessment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Welcome to our comprehensive technical evaluation. This assessment will help us understand your engineering
          knowledge and problem-solving abilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Assessment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">30 minutes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-semibold">{totalQuestions} questions</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Question Types:</span>
              <span className="font-semibold">Mixed format</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Auto-save:</span>
              <span className="font-semibold text-green-600">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Assessment Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {mcQuestions.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Multiple Choice</p>
                    <p className="text-sm text-gray-500">
                      {mcQuestions.length} questions - Technical knowledge & theory
                    </p>
                  </div>
                </div>
              )}
              {conceptQuestions.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Concepts</p>
                    <p className="text-sm text-gray-500">
                      {conceptQuestions.length} questions - Explain engineering principles
                    </p>
                  </div>
                </div>
              )}
              {calculationQuestions.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Calculations</p>
                    <p className="text-sm text-gray-500">
                      {calculationQuestions.length} questions - Numerical problem solving
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Once you begin the assessment, you cannot go back to previous sections. Make sure
          you have a stable internet connection and a quiet environment before starting.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Ready to Begin?</h3>
            <p className="text-gray-600 mb-6">
              The next step will collect your personal information, followed by the technical assessment. Please ensure
              you have enough time to complete the entire process.
            </p>
            <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Start Assessment Process
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
