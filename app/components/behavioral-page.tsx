"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, MessageSquare } from "lucide-react"

const QUESTIONS = [
  {
    id: "careerObjectives",
    text: "Discuss your career objectives and what motivates you for this specific role. What aspects of the role excite you the most?",
  },
  {
    id: "technicalSkill",
    text: "What is your most applicable technical skill for this role, and how do you plan to utilize it to contribute effectively?",
  },
  {
    id: "improvementAreas",
    text: "What areas are you looking to improve on? Feel free to discuss one or more, including steps you're taking or planning.",
  },
  {
    id: "ambiguousDecisions",
    text: "Describe a time when you had to make decisions in an ambiguous or uncertain environment. What was the situation, your approach, and the outcome?",
  },
  {
    id: "collaborationStyle",
    text: "Explain how you typically process information and collaborate within a small team setting. Provide an example if possible.",
  },
  {
    id: "taskConversion",
    text: "Explain the process you use to convert high-level objectives into actionable tasks, including any research involved, and why this is important.",
  },
  {
    id: "highStakesEnvironment",
    text: "Are you comfortable working in high-stakes, fast-paced environments? Provide specific examples from your experience to illustrate.",
  },
  {
    id: "setbackResponse",
    text: "Describe a time when you faced a significant setback or failure in a project. How did you respond, what did you learn, and how has it influenced your approach since?",
  },
  {
    id: "conflictResolution",
    text: "Tell us about a situation where you had to resolve a conflict or disagreement within a team. What was your role, how did you handle it, and what was the result?",
  },
  {
    id: "initiativeExample",
    text: "Provide an example of when you took initiative on a task or project without being explicitly asked. What motivated you, what steps did you take, and what impact did it have?",
  },
  {
    id: "adaptingToChange",
    text: "How do you adapt to changes in priorities or unexpected shifts in project direction? Share a specific example from your experience.",
  },
]

export type BehavioralAnswers = Record<string, string>

interface BehavioralPageProps {
  onNext: (answers: BehavioralAnswers) => void
}

export default function BehavioralPage({ onNext }: BehavioralPageProps) {
  const [answers, setAnswers] = useState<BehavioralAnswers>({})

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onNext(answers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
              <HelpCircle className="h-4 w-4" />
              Behavioral Information
            </span>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Situational Questions</h1>
            <p className="text-lg text-gray-600">
              Please provide thoughtful responses. There is no time limit for this section.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <Label htmlFor={q.id} className="flex items-start gap-3 text-base">
                      <MessageSquare className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                      <span>{`${idx + 1}. ${q.text}`}</span>
                    </Label>
                    <Textarea
                      id={q.id}
                      rows={5}
                      placeholder="Your response..."
                      className="resize-y"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                  </div>
                ))}
                <div className="border-t pt-6">
                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Continue to Technical Assessment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
