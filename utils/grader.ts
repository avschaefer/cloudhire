import type { Answer, Question, UserInfo } from "../app/page"

export interface GradingResult {
  questionId: number
  score: number
  maxScore: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface DetailedExamResult {
  userInfo: UserInfo
  answers: Answer[]
  gradingResults: GradingResult[]
  totalScore: number
  maxScore: number
  overallFeedback: string
  completedAt: string
  timeSpent: number
}

export async function gradeExam(
  answers: Answer[],
  questions: Question[],
  userInfo: UserInfo,
): Promise<DetailedExamResult> {
  try {
    // Try to use AI Worker if available
    const aiWorkerUrl = process.env.AI_GRADER_WORKER_URL

    if (aiWorkerUrl) {
      const response = await fetch(aiWorkerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          questions,
          userInfo,
        }),
      })

      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.warn("AI grading failed, using fallback:", error)
  }

  // Fallback grading logic
  return fallbackGrading(answers, questions, userInfo)
}

function fallbackGrading(answers: Answer[], questions: Question[], userInfo: UserInfo): DetailedExamResult {
  const gradingResults: GradingResult[] = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) {
      return {
        questionId: answer.questionId,
        score: 0,
        maxScore: 0,
        feedback: "Question not found",
        strengths: [],
        improvements: [],
      }
    }

    // Basic scoring logic
    let score = 0
    let feedback = ""
    const strengths: string[] = []
    const improvements: string[] = []

    if (question.type === "multiple-choice" && question.correctAnswer) {
      score = answer.answer === question.correctAnswer ? question.points : 0
      feedback = score > 0 ? "Correct answer!" : "Incorrect answer."
    } else {
      // For essay questions, give partial credit based on length and effort
      const wordCount = answer.answer.split(/\s+/).length
      if (wordCount >= 50) {
        score = Math.round(question.points * 0.8) // 80% for substantial answers
        strengths.push("Provided a detailed response")
      } else if (wordCount >= 20) {
        score = Math.round(question.points * 0.6) // 60% for moderate answers
        strengths.push("Provided a reasonable response")
      } else {
        score = Math.round(question.points * 0.3) // 30% for minimal answers
        improvements.push("Could provide more detail in the response")
      }

      feedback = `Response shows ${wordCount >= 50 ? "good" : wordCount >= 20 ? "adequate" : "limited"} detail.`
    }

    return {
      questionId: answer.questionId,
      score,
      maxScore: question.points,
      feedback,
      strengths,
      improvements,
    }
  })

  const totalScore = gradingResults.reduce((sum, result) => sum + result.score, 0)
  const maxScore = gradingResults.reduce((sum, result) => sum + result.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  let overallFeedback = `You scored ${totalScore} out of ${maxScore} points (${percentage}%). `

  if (percentage >= 80) {
    overallFeedback += "Excellent work! You demonstrated strong knowledge and skills."
  } else if (percentage >= 60) {
    overallFeedback += "Good effort! There are some areas where you can continue to grow."
  } else {
    overallFeedback += "Thank you for your responses. Consider focusing on the improvement areas noted."
  }

  return {
    userInfo,
    answers,
    gradingResults,
    totalScore,
    maxScore,
    overallFeedback,
    completedAt: new Date().toISOString(),
    timeSpent: answers.reduce((sum, answer) => sum + answer.timeSpent, 0),
  }
}
