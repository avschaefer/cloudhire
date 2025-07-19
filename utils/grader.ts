import { getXaiApiKey, getAiGraderWorkerUrl } from "@/lib/config"

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

// Fallback grading function for when AI services are unavailable
export const getFallbackGrading = (questions: Question[], answers: Answer[]): ExamResult => {
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

    // Simple fallback scoring based on answer length and keywords
    let score = 0
    const maxScore = question.Points || 10

    if (answer.answer && answer.answer.trim().length > 0) {
      // Basic scoring: 50% for having an answer, 50% for length/content
      score = Math.min(maxScore * 0.5, maxScore)

      // Bonus points for longer, more detailed answers
      if (answer.answer.length > 100) {
        score += maxScore * 0.3
      }
      if (answer.answer.length > 200) {
        score += maxScore * 0.2
      }
    }

    return {
      questionId: answer.questionId,
      score: Math.round(score),
      maxScore,
      feedback: score > 0 ? "Answer provided - detailed grading unavailable in fallback mode" : "No answer provided",
      category: question.Category || "General",
    }
  })

  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const maxScore = results.reduce((sum, result) => sum + result.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return {
    totalScore,
    maxScore,
    percentage,
    results,
    overallFeedback: `Exam completed with ${percentage}% score. Detailed AI grading is currently unavailable.`,
  }
}

// Grade exam using AI Worker
export const gradeExam = async (questions: Question[], answers: Answer[]): Promise<ExamResult> => {
  const workerUrl = getAiGraderWorkerUrl()

  if (!workerUrl || workerUrl.includes("youraccount")) {
    console.log("AI Worker not configured, using fallback grading")
    return getFallbackGrading(questions, answers)
  }

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questions,
        answers,
        apiKey: getXaiApiKey(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Worker responded with status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error grading exam with AI Worker:", error)
    console.log("Falling back to basic grading")
    return getFallbackGrading(questions, answers)
  }
}

// Grade a single question (for real-time feedback)
export const gradeSingleQuestion = async (question: Question, answer: Answer): Promise<GradingResult> => {
  const result = await gradeExam([question], [answer])
  return (
    result.results[0] || {
      questionId: answer.questionId,
      score: 0,
      maxScore: question.Points || 10,
      feedback: "Unable to grade question",
      category: question.Category || "General",
    }
  )
}
