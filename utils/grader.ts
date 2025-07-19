import { getWorkerUrl } from "@/lib/config"
import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"

export interface GradingResult {
  score: number
  feedback: string
  details: Record<string, any>
  strengths?: string[]
  improvements?: string[]
}

export async function gradeExam(examData: ExamData, userBio: UserBio, questions: Question[]): Promise<GradingResult> {
  try {
    const workerUrl = getWorkerUrl()

    // For now, we'll use a fallback since the Worker isn't deployed yet
    // This will be replaced with the actual Worker call once it's set up
    console.log("AI grading would call:", workerUrl)

    // Temporary fallback until Worker is deployed
    return getFallbackGrading(examData, questions)

    /* 
    // This will be enabled once the Worker is deployed:
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        exam_data: examData, 
        user_bio: userBio, 
        questions 
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`)
    }
    
    return await response.json()
    */
  } catch (error) {
    console.error("Grok grading failed:", error)
    return getFallbackGrading(examData, questions)
  }
}

export function getFallbackGrading(examData: ExamData, questions: Question[]): GradingResult {
  let totalQuestions = 0
  let answeredQuestions = 0
  let score = 0

  // Count questions and answers by type
  const sections = ["multipleChoice", "concepts", "calculations"] as const

  sections.forEach((section) => {
    const sectionQuestions = questions.filter((q) => {
      const normalizedType = q.type.toLowerCase().replace(/\s+/g, "")
      return (
        (section === "multipleChoice" && normalizedType === "multiplechoice") ||
        (section === "concepts" && normalizedType === "openended") ||
        (section === "calculations" && normalizedType === "calculation")
      )
    })

    totalQuestions += sectionQuestions.length

    sectionQuestions.forEach((question) => {
      const answer = examData[section]?.[question.ID]
      if (answer && answer.trim()) {
        answeredQuestions++
        // Simple scoring: 10 points per answered question
        score += 10
      }
    })
  })

  // Cap score at 100
  score = Math.min(score, 100)

  const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  return {
    score,
    feedback: `Fallback evaluation completed. Answered ${answeredQuestions} out of ${totalQuestions} questions (${completionRate.toFixed(1)}% completion rate). This is a basic completeness check - full AI evaluation will be available once the grading system is fully deployed.`,
    details: questions.reduce((acc, q) => {
      const section = q.type.toLowerCase().includes("multiple")
        ? "multipleChoice"
        : q.type.toLowerCase().includes("open")
          ? "concepts"
          : "calculations"
      const answer = examData[section]?.[q.ID]
      return {
        ...acc,
        [q.ID]: {
          answered: !!(answer && answer.trim()),
          response: answer || "No answer provided",
        },
      }
    }, {}),
    strengths: answeredQuestions > 0 ? ["Completed the assessment", "Provided responses"] : [],
    improvements: answeredQuestions < totalQuestions ? ["Complete all questions", "Provide more detailed answers"] : [],
  }
}
