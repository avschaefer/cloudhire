import { getXaiConfig, getAiWorkerConfig } from "@/lib/config"

export interface Question {
  ID: number
  Question: string
  Type: string
  Category: string
  Difficulty: string
  Points: number
}

export interface Answer {
  questionId: number
  answer: string
  timeSpent: number
}

export interface GradingResult {
  questionId: number
  score: number
  maxScore: number
  feedback: string
  category: string
}

export interface ExamResult {
  totalScore: number
  maxScore: number
  percentage: number
  results: GradingResult[]
  overallFeedback: string
}

// Fallback grading function for when AI Worker is not available
function fallbackGrading(questions: Question[], answers: Answer[]): ExamResult {
  const results: GradingResult[] = answers.map((answer) => {
    const question = questions.find((q) => q.ID === answer.questionId)
    if (!question) {
      return {
        questionId: answer.questionId,
        score: 0,
        maxScore: 10,
        feedback: "Question not found",
        category: "Unknown",
      }
    }

    // Simple scoring based on answer length and basic keywords
    let score = 0
    const maxScore = question.Points || 10

    if (answer.answer.trim().length > 10) {
      score = Math.min(maxScore * 0.7, maxScore) // Give 70% for substantial answers
    }

    return {
      questionId: answer.questionId,
      score,
      maxScore,
      feedback: `Basic evaluation: ${score > 0 ? "Good effort" : "Please provide more detail"}`,
      category: question.Category || "General",
    }
  })

  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const maxScore = results.reduce((sum, result) => sum + result.maxScore, 0)
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return {
    totalScore,
    maxScore,
    percentage,
    results,
    overallFeedback: `Exam completed with ${percentage.toFixed(1)}% score. AI grading is currently unavailable, using basic evaluation.`,
  }
}

export async function gradeExam(questions: Question[], answers: Answer[]): Promise<ExamResult> {
  const aiWorkerConfig = getAiWorkerConfig()
  const xaiConfig = getXaiConfig()

  // If no AI configuration is available, use fallback
  if (!xaiConfig.apiKey) {
    console.warn("XAI API key not configured, using fallback grading")
    return fallbackGrading(questions, answers)
  }

  try {
    // Try to use AI Worker first
    const response = await fetch(aiWorkerConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questions,
        answers,
        apiKey: xaiConfig.apiKey,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      return result as ExamResult
    } else {
      console.warn("AI Worker unavailable, using fallback grading")
      return fallbackGrading(questions, answers)
    }
  } catch (error) {
    console.error("Error calling AI Worker:", error)
    console.warn("Falling back to basic grading")
    return fallbackGrading(questions, answers)
  }
}
