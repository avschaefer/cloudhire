import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"
import { getWorkerUrl, isServiceBound } from "@/lib/config"

export interface GradingResult {
  overallScore: number
  sectionScores: {
    multipleChoice: number
    concepts: number
    calculations: number
  }
  feedback: string
  strengths: string[]
  improvements: string[]
  questionScores: Array<{
    questionId: string
    score: number
    feedback: string
    partialCredit: boolean
  }>
  recommendation: "HIRE" | "CONSIDER" | "REJECT"
  confidence: number
}

export async function gradeExam(
  examData: ExamData,
  userBio: UserBio,
  questions: Question[],
): Promise<GradingResult | null> {
  try {
    console.log("Starting AI grading with xAI Grok...")

    // Check if we can use service binding (more efficient in Cloudflare)
    if (isServiceBound()) {
      try {
        const { getRequestContext } = await import("@cloudflare/next-on-pages")
        const { env } = getRequestContext()

        if (env.AI_GRADER) {
          console.log("Using service binding for AI grader")
          const response = await env.AI_GRADER.fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam_data: examData,
              user_bio: userBio,
              questions,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            console.log("Grok AI grading completed via service binding")
            return result as GradingResult
          }
        }
      } catch (error) {
        console.log("Service binding not available, falling back to HTTP")
      }
    }

    // Fallback to HTTP request
    const workerUrl = getWorkerUrl()
    console.log("Using HTTP request to AI grader:", workerUrl)

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exam_data: examData,
        user_bio: userBio,
        questions,
      }),
    })

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status} - ${await response.text()}`)
    }

    const result = await response.json()
    console.log("Grok AI grading completed successfully")
    return result as GradingResult
  } catch (error) {
    console.error("Grok grading failed:", error)
    return null
  }
}

export function getFallbackGrading(examData: ExamData, questions: Question[]): GradingResult {
  console.log("Using fallback grading system...")

  const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q.type === "calculations")

  // Simple scoring logic
  let mcScore = 0
  let conceptScore = 0
  let calculationScore = 0

  // Multiple choice scoring
  mcQuestions.forEach((q) => {
    if (examData.multipleChoice[q.ID]?.trim()) {
      mcScore += q.answer && examData.multipleChoice[q.ID] === q.answer ? 100 : 50
    }
  })
  mcScore = mcQuestions.length > 0 ? mcScore / mcQuestions.length : 0

  // Concept scoring (based on answer length and presence)
  conceptQuestions.forEach((q) => {
    const answer = examData.concepts[q.ID]?.trim()
    if (answer) {
      if (answer.length > 200) conceptScore += 90
      else if (answer.length > 100) conceptScore += 75
      else if (answer.length > 50) conceptScore += 60
      else conceptScore += 40
    }
  })
  conceptScore = conceptQuestions.length > 0 ? conceptScore / conceptQuestions.length : 0

  // Calculation scoring
  calculationQuestions.forEach((q) => {
    const numericalAnswer = examData.calculations[`${q.ID}-answer`]?.trim()
    const explanation = examData.calculations[`${q.ID}-explanation`]?.trim()

    let questionScore = 0
    if (numericalAnswer) questionScore += 40
    if (explanation) {
      if (explanation.length > 300) questionScore += 60
      else if (explanation.length > 150) questionScore += 45
      else if (explanation.length > 50) questionScore += 30
      else questionScore += 15
    }
    calculationScore += questionScore
  })
  calculationScore = calculationQuestions.length > 0 ? calculationScore / calculationQuestions.length : 0

  const overallScore = Math.round(
    (mcScore * mcQuestions.length +
      conceptScore * conceptQuestions.length +
      calculationScore * calculationQuestions.length) /
      questions.length,
  )

  const recommendation: "HIRE" | "CONSIDER" | "REJECT" =
    overallScore >= 80 ? "HIRE" : overallScore >= 60 ? "CONSIDER" : "REJECT"

  return {
    overallScore,
    sectionScores: {
      multipleChoice: Math.round(mcScore),
      concepts: Math.round(conceptScore),
      calculations: Math.round(calculationScore),
    },
    feedback: `Fallback evaluation completed. Overall performance: ${overallScore}%. ${
      overallScore >= 80
        ? "Strong technical performance across all sections."
        : overallScore >= 60
          ? "Adequate technical knowledge with room for improvement."
          : "Technical skills need significant development."
    }`,
    strengths: [
      ...(mcScore >= 70 ? ["Good multiple choice performance"] : []),
      ...(conceptScore >= 70 ? ["Strong conceptual understanding"] : []),
      ...(calculationScore >= 70 ? ["Solid problem-solving approach"] : []),
    ],
    improvements: [
      ...(mcScore < 70 ? ["Review fundamental concepts"] : []),
      ...(conceptScore < 70 ? ["Improve explanation clarity"] : []),
      ...(calculationScore < 70 ? ["Practice calculation methodology"] : []),
    ],
    questionScores: questions.map((q) => ({
      questionId: q.ID,
      score: 70, // Default fallback score
      feedback: "Evaluated using fallback system",
      partialCredit: true,
    })),
    recommendation,
    confidence: 60, // Lower confidence for fallback
  }
}
