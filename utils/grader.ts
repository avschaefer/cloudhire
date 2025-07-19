import { getAiWorkerUrl } from "@/lib/config"

export interface GradingResult {
  score: number
  feedback: string
  breakdown: {
    multipleChoice: { correct: number; total: number }
    concepts: { score: number; feedback: string }
    calculations: { score: number; feedback: string }
  }
}

export async function gradeExam(examData: any, userBio: any, questions: any[]): Promise<GradingResult | null> {
  try {
    const workerUrl = getAiWorkerUrl()

    if (!workerUrl || workerUrl.includes("youraccount")) {
      console.log("AI Worker URL not configured, using fallback grading")
      return getFallbackGrading(examData, questions)
    }

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examData,
        userBio,
        questions,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI grading failed: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("AI grading error:", error)
    return getFallbackGrading(examData, questions)
  }
}

export function getFallbackGrading(examData: any, questions: any[]): GradingResult {
  let totalScore = 0
  let maxScore = 0
  let mcCorrect = 0
  let mcTotal = 0

  questions.forEach((question) => {
    maxScore += question.points || 10

    if (question.type.toLowerCase().includes("multiple")) {
      mcTotal++
      const userAnswer = examData.multipleChoice[question.ID]
      if (userAnswer && question.answer && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()) {
        mcCorrect++
        totalScore += question.points || 10
      }
    } else {
      // For open-ended questions, give partial credit if answered
      const answer = examData.concepts[question.ID] || examData.calculations[question.ID]
      if (answer && answer.trim().length > 10) {
        totalScore += Math.floor((question.points || 10) * 0.7) // 70% for attempting
      }
    }
  })

  const finalScore = Math.round((totalScore / maxScore) * 100)

  return {
    score: finalScore,
    feedback: `Exam completed with ${finalScore}% score. Multiple choice: ${mcCorrect}/${mcTotal} correct. Open-ended questions were given partial credit for substantial answers.`,
    breakdown: {
      multipleChoice: { correct: mcCorrect, total: mcTotal },
      concepts: { score: 70, feedback: "Partial credit given for attempted answers" },
      calculations: { score: 70, feedback: "Partial credit given for attempted answers" },
    },
  }
}
