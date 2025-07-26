"use client"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, MessageSquare } from "lucide-react"
import { fetchBehavioralQuestions } from '@/lib/supabaseQueries';
import { submitBehavioralResponse } from '@/lib/supabaseSubmissions';

export type BehavioralAnswers = Record<string, string>

export interface BehavioralPageProps {
  onNext: (answers: BehavioralAnswers) => void;
  userId: number;
}

export default function BehavioralPage({ onNext, userId }: BehavioralPageProps) {
  const [answers, setAnswers] = useState<BehavioralAnswers>({})
  const [questions, setQuestions] = useState<{id: number, question: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await fetchBehavioralQuestions();
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    for (const [idStr, response] of Object.entries(answers)) {
      const questionId = Number(idStr);
      await submitBehavioralResponse({ questionId, userResponse: response, aiResponse: '', userId });
    }
    onNext(answers);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading questions...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
              <HelpCircle className="h-4 w-4" />
              Behavioral Information
            </span>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Situational Questions</h1>
            <p className="text-lg text-gray-600">
              Please provide thoughtful responses (100-400 words per question, max 400 words). There is no time limit for this section.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Your Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((q, idx) => (
                  <div key={q.id.toString()} className="space-y-3">
                    <Label htmlFor={q.id.toString()} className="flex items-start gap-3 text-base">
                      <MessageSquare className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                      <span>{`${idx + 1}. ${q.question}`}</span>
                    </Label>
                    <Textarea
                      id={q.id.toString()}
                      rows={5}
                      placeholder="Your response..."
                      className="resize-y"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => handleChange(q.id.toString(), e.target.value)}
                      maxLength={400}
                    />
                    <p className="text-sm text-gray-500">{answers[q.id]?.length || 0}/400 words</p>
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
