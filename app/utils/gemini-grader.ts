import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ExamData, UserBio } from "../page"
import type { Question } from "./csv-parser" // Import Question type

interface GradingResult {
  multipleChoice: {
    [key: string]: { score: number; feedback: string; isCorrect: boolean }
  }
  concepts: {
    [key: string]: { score: number; feedback: string; strengths: string[]; improvements: string[] }
  }
  calculations: {
    [key: string]: {
      score: number
      feedback: string
      numericalScore: number
      explanationScore: number
      correctApproach: boolean
      workShown: boolean
      finalAnswerCorrect: boolean
      partialCreditAwarded: boolean
      detailedFeedback: {
        approach: string
        calculation: string
        presentation: string
      }
    }
  }
  overallSummary: {
    technicalCapability: string
    problemSolvingSkills: string
    communicationSkills: string
    recommendedLevel: "Entry" | "Junior" | "Mid-Level" | "Senior" | "Expert"
    overallScore: number
    keyStrengths: string[]
    areasForImprovement: string[]
    hiringRecommendation: "Strong Hire" | "Hire" | "Maybe" | "No Hire"
    detailedAnalysis: string
  }
}

export async function gradeExamWithGemini(
  examData: ExamData,
  userBio: UserBio,
  questions: Question[], // Pass questions here
): Promise<GradingResult | null> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("NEXT_PUBLIC_GEMINI_API_KEY not found")
      return null
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = createEnhancedGradingPrompt(examData, userBio, questions) // Pass questions to prompt creator

    console.log("Sending exam to Gemini for grading...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("Gemini response received, parsing...")

    // Parse the JSON response from Gemini
    const gradingResult = parseGeminiResponse(text, questions) // Pass questions for validation

    if (!gradingResult) {
      console.error("Failed to parse Gemini response")
      return null
    }

    console.log("Exam graded successfully by Gemini")
    return gradingResult
  } catch (error) {
    console.error("Error grading exam with Gemini:", error)
    return null
  }
}

function createEnhancedGradingPrompt(examData: ExamData, userBio: UserBio, questions: Question[]): string {
  let mcSection = "MULTIPLE CHOICE QUESTIONS:\n"
  let conceptSection = "CONCEPT QUESTIONS:\n"
  let calculationSection = "CALCULATION QUESTIONS (ENHANCED WITH PARTIAL CREDIT):\n"

  questions.forEach((q, index) => {
    const questionNumber = index + 1
    if (q.type === "multipleChoice") {
      mcSection += `${questionNumber}. "${q.question}"\n`
      mcSection += `   Difficulty: ${q.difficulty}\n`
      mcSection += `   Options: ${q.options?.join(", ") || "N/A"}\n`
      mcSection += `   Candidate Answer: "${examData.multipleChoice[q.ID] || "No answer"}"\n`
      mcSection += `   Correct Answer: ${q.correctAnswer}\n\n`
    } else if (q.type === "concepts") {
      conceptSection += `${questionNumber}. "${q.question}"\n`
      conceptSection += `   Difficulty: ${q.difficulty}\n`
      conceptSection += `   Candidate Answer: "${examData.concepts[q.ID] || "No answer provided"}"\n\n`
    } else if (q.type === "calculations") {
      calculationSection += `${questionNumber}. "${q.question}"\n`
      calculationSection += `   Difficulty: ${q.difficulty}\n`
      calculationSection += `   Numerical Answer: "${examData.calculations[`${q.ID}-answer`] || "No numerical answer provided"}"\n`
      calculationSection += `   Work Shown/Explanation: "${examData.calculations[`${q.ID}-explanation`] || "No explanation provided"}"\n`
      calculationSection += `   Expected Answer: ${q.correctAnswer}\n\n`
    }
  })

  return `You are an expert engineering assessment evaluator. Please grade this technical assessment with special focus on the concept and calculation problems. Award partial credit based on approach, work shown, and reasoning even if the final answer is incorrect.

CANDIDATE INFORMATION:
- Name: ${userBio.firstName} ${userBio.lastName}
- Position Applied: ${userBio.position}
- Experience Level: ${userBio.experience}
- Education: ${userBio.education}

EXAM RESPONSES:

${mcSection}
${conceptSection}
${calculationSection}

GRADING INSTRUCTIONS:

1. Multiple Choice: Grade as correct/incorrect (1 or 0 points each)

2. Concept Questions: Grade on scale 0-10 based on:
   - Understanding of core concepts (40%)
   - Clarity of explanation (30%)
   - Technical accuracy (20%)
   - Completeness (10%)

3. Calculation Question (ENHANCED PARTIAL CREDIT SYSTEM):
   - Total possible: 10 points
   - Numerical Answer (4 points): Award full points for correct answer, partial for close approximations
   - Explanation/Work (6 points breakdown):
     * Correct approach/formula identification (2 points)
     * Proper unit conversions and setup (2 points)
     * Clear presentation and logical flow (2 points)
   
   PARTIAL CREDIT GUIDELINES:
   - Award points for correct approach even with calculation errors
   - Give credit for proper unit handling and conversions
   - Recognize good problem-solving structure and presentation
   - Consider the candidate's experience level in evaluation

4. Provide detailed feedback for each component of the calculation

5. Give overall assessment considering all responses and candidate background

Please respond with a JSON object in this exact format:
{
  "multipleChoice": {
    ${questions
      .filter((q) => q.type === "multipleChoice")
      .map((q) => `"${q.ID}": { "score": 0-1, "feedback": "brief feedback", "isCorrect": boolean }`)
      .join(",\n    ")}
  },
  "concepts": {
    ${questions
      .filter((q) => q.type === "concepts")
      .map(
        (q) =>
          `"${q.ID}": { 
      "score": 0-10, 
      "feedback": "detailed feedback on ${q.ID} explanation", 
      "strengths": ["strength1", "strength2"], 
      "improvements": ["improvement1", "improvement2"] 
    }`,
      )
      .join(",\n    ")}
  },
  "calculations": {
    ${questions
      .filter((q) => q.type === "calculations")
      .map(
        (q) =>
          `"${q.ID}": { 
      "score": 0-10,
      "feedback": "overall feedback on ${q.ID} calculation problem",
      "numericalScore": 0-4,
      "explanationScore": 0-6,
      "correctApproach": boolean,
      "workShown": boolean,
      "finalAnswerCorrect": boolean,
      "partialCreditAwarded": boolean,
      "detailedFeedback": {
        "approach": "feedback on problem-solving approach",
        "calculation": "feedback on mathematical execution",
        "presentation": "feedback on clarity and organization"
      }
    }`,
      )
      .join(",\n    ")}
  },
  "overallSummary": {
    "technicalCapability": "assessment of technical knowledge depth",
    "problemSolvingSkills": "assessment of problem-solving approach and methodology",
    "communicationSkills": "assessment of explanation clarity and technical writing",
    "recommendedLevel": "Entry|Junior|Mid-Level|Senior|Expert",
    "overallScore": 0-100,
    "keyStrengths": ["strength1", "strength2", "strength3"],
    "areasForImprovement": ["area1", "area2", "area3"],
    "hiringRecommendation": "Strong Hire|Hire|Maybe|No Hire",
    "detailedAnalysis": "comprehensive 2-3 paragraph analysis focusing on calculation problem-solving skills, conceptual understanding, and overall engineering capability"
  }
}

Be thorough and fair. Award partial credit generously for good engineering thinking and clear explanations, even if final answers are incorrect. Consider the candidate's stated experience level.`
}

function parseGeminiResponse(text: string, questions: Question[]): GradingResult | null {
  try {
    let jsonText = text.trim()

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const parsed = JSON.parse(jsonText)

    // Basic validation of top-level keys
    if (!parsed.multipleChoice || !parsed.concepts || !parsed.calculations || !parsed.overallSummary) {
      throw new Error("Invalid top-level response structure from Gemini")
    }

    // Further validate that all expected question IDs are present in the parsed result
    questions.forEach((q) => {
      if (q.type === "multipleChoice" && !parsed.multipleChoice[q.ID]) {
        console.warn(`Missing grading for MC question ID: ${q.ID}`)
      } else if (q.type === "concepts" && !parsed.concepts[q.ID]) {
        console.warn(`Missing grading for Concept question ID: ${q.ID}`)
      } else if (q.type === "calculations" && !parsed.calculations[q.ID]) {
        console.warn(`Missing grading for Calculation question ID: ${q.ID}`)
      }
    })

    return parsed as GradingResult
  } catch (error) {
    console.error("Failed to parse Gemini response:", error)
    console.log("Raw response:", text)
    return null
  }
}

// Enhanced fallback grading function
export function getFallbackGrading(examData: ExamData, questions: Question[]): GradingResult {
  const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q.type === "calculations")

  const mcGrading: GradingResult["multipleChoice"] = {}
  mcQuestions.forEach((q) => {
    const isCorrect = examData.multipleChoice[q.ID] === q.correctAnswer
    mcGrading[q.ID] = {
      score: isCorrect ? 1 : 0,
      feedback: isCorrect ? "Correct" : `Incorrect. Correct answer was: ${q.correctAnswer}`,
      isCorrect: isCorrect,
    }
  })

  const conceptGrading: GradingResult["concepts"] = {}
  conceptQuestions.forEach((q) => {
    const hasAnswer = examData.concepts[q.ID]?.trim().length > 0
    conceptGrading[q.ID] = {
      score: hasAnswer ? 6 : 0, // Default score for fallback
      feedback: "Automated grading unavailable - requires manual review",
      strengths: hasAnswer ? ["Response provided"] : [],
      improvements: ["Requires detailed evaluation"],
    }
  })

  const calculationGrading: GradingResult["calculations"] = {}
  calculationQuestions.forEach((q) => {
    const numericalAnswer = examData.calculations[`${q.ID}-answer`]
    const explanation = examData.calculations[`${q.ID}-explanation`]

    // Simple check for correct answer (case-insensitive, trimmed)
    const numericalCorrect = numericalAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()

    const numericalScore = numericalCorrect ? 4 : 0
    const explanationScore = explanation?.trim().length > 0 ? 3 : 0 // Basic score for presence of explanation
    const totalScore = numericalScore + explanationScore

    calculationGrading[q.ID] = {
      score: totalScore,
      feedback: "Basic automated grading - AI grading recommended for detailed analysis",
      numericalScore: numericalScore,
      explanationScore: explanationScore,
      correctApproach: numericalCorrect || (explanation?.includes("=") ?? false), // Simple check for approach
      workShown: explanation?.trim().length > 0,
      finalAnswerCorrect: numericalCorrect,
      partialCreditAwarded: explanation?.trim().length > 0 && !numericalCorrect,
      detailedFeedback: {
        approach: explanation?.includes("=") ? "Some approach shown" : "Approach not clear",
        calculation: numericalCorrect ? "Correct final answer" : "Incorrect or missing numerical answer",
        presentation: explanation?.trim().length > 0 ? "Explanation provided" : "No explanation provided",
      },
    }
  })

  const totalCompletedQuestions =
    Object.values(mcGrading).filter((g) => g.isCorrect).length +
    Object.values(conceptGrading).filter((g) => g.score > 0).length +
    Object.values(calculationGrading).filter((g) => g.score > 0).length

  const totalPossibleQuestions = questions.length

  return {
    multipleChoice: mcGrading,
    concepts: conceptGrading,
    calculations: calculationGrading,
    overallSummary: {
      technicalCapability: "Basic assessment completed - detailed AI analysis unavailable",
      problemSolvingSkills: "Requires manual evaluation for calculation methodology",
      communicationSkills: "Requires manual evaluation",
      recommendedLevel: "Junior",
      overallScore: (totalCompletedQuestions / totalPossibleQuestions) * 100,
      keyStrengths: ["Completed assessment", "Provided responses"],
      areasForImprovement: ["Detailed evaluation needed"],
      hiringRecommendation: "Maybe",
      detailedAnalysis:
        "This assessment requires manual review as AI grading was unavailable. The candidate completed the basic requirements but detailed analysis of concept and calculation responses, including partial credit evaluation, is needed for a comprehensive assessment.",
    },
  }
}

export type { GradingResult }
