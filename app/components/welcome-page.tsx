"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface WelcomePageProps {
  onNext: () => void
}

export default function WelcomePage({ onNext }: WelcomePageProps) {
  // No question loading for now – everything is static
  const counts = { multipleChoice: 0, concepts: 0, calculations: 0, total: 0 }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Technical Assessment</CardTitle>
          <CardDescription className="text-lg text-gray-600 pt-2">
            Welcome to your technical assessment. Please read the instructions carefully before you begin.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Overview section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Assessment Overview</h3>
            <ul className="grid grid-cols-2 gap-4 text-gray-700">
              <li className="flex flex-col">
                <span className="text-sm">Multiple Choice</span>
                <span className="font-medium">{counts.multipleChoice} questions</span>
              </li>
              <li className="flex flex-col">
                <span className="text-sm">Concept Explanations</span>
                <span className="font-medium">{counts.concepts} questions</span>
              </li>
              <li className="flex flex-col">
                <span className="text-sm">Calculations</span>
                <span className="font-medium">{counts.calculations} questions</span>
              </li>
              <li className="flex flex-col">
                <span className="text-sm">Total</span>
                <span className="font-medium">{counts.total} questions</span>
              </li>
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h3>
            <ul className="space-y-3">
              {[
                "You will have 30 minutes to complete the assessment.",
                "Your progress is saved automatically.",
                "Find a quiet place and ensure a stable internet connection.",
              ].map((text) => (
                <li key={text} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Start button */}
          <div className="text-center pt-2">
            <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg" onClick={onNext}>
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
