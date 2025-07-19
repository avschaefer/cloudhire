import { GoogleGenerativeAI } from "@google/generative-ai"
import { getAiGradingPrompt, getGeminiModelConfig } from "@/lib/config"
import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"

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

export async function gradeExamWithGemini(
  examData: ExamData,
  userBio: UserBio,
  questions: Question[],
): Promise<GradingResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error("NEXT_PUBLIC_GEMINI_API_KEY not configured")
      return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelConfig = getGeminiModelConfig()
    const model = genAI.getGenerativeModel(modelConfig)

    const prompt = getAiGradingPrompt(examData, userBio, questions)
    console.log("Sending prompt to Gemini AI...")

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    console.log("Gemini AI response received:", responseText.substring(0, 200) + "...")

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response")
      return null
    }

    const gradingResult = JSON.parse(jsonMatch[0]) as GradingResult
    console.log("Gemini grading completed successfully")
    return gradingResult
  } catch (error) {
    console.error("Gemini grading failed:", error)
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

// Future: Replace this function with Grok integration
export async function gradeExamWithGrok(
  examData: ExamData,
  userBio: UserBio,
  questions: Question[],
): Promise<GradingResult | null> {
  // Placeholder for future Grok integration
  // This would make a fetch request to a Python Worker running xAI's API
  console.log("Grok integration not yet implemented")
  return null
}
