import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"

// Modular configuration functions to avoid hardcoding

export function getWorkerUrl(): string {
  return process.env.AI_GRADER_WORKER_URL || "https://ai-grader-worker.youraccount.workers.dev/"
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://cloudhire.app"
}

export function getDbBinding(): string {
  return "DB" // D1 binding name from wrangler.toml
}

export function getGrokGradingPrompt(examData: ExamData, userBio: UserBio, questions: Question[]) {
  return `
You are an expert technical evaluator for engineering positions. Please evaluate this technical exam submission.

CANDIDATE INFORMATION:
- Name: ${userBio.firstName} ${userBio.lastName}
- Position: ${userBio.position}
- Experience: ${userBio.experience}
- Education: ${userBio.education}

EXAM QUESTIONS AND ANSWERS:
${questions
  .map((q, index) => {
    let answer = ""
    if (q.type === "multipleChoice") {
      answer = examData.multipleChoice[q.ID] || "No answer provided"
    } else if (q.type === "concepts") {
      answer = examData.concepts[q.ID] || "No answer provided"
    } else if (q.type === "calculations") {
      const numericalAnswer = examData.calculations[`${q.ID}-answer`] || "No numerical answer"
      const explanation = examData.calculations[`${q.ID}-explanation`] || "No explanation provided"
      answer = `Numerical Answer: ${numericalAnswer}\nExplanation: ${explanation}`
    }

    return `
Question ${index + 1} (${q.type}, ${q.difficulty || "Unknown"} difficulty):
${q.question}
${q.options ? `Options: ${q.options.join(", ")}` : ""}
${q.answer ? `Correct Answer: ${q.answer}` : ""}

Candidate's Answer:
${answer}
`
  })
  .join("\n---\n")}

Please provide a comprehensive evaluation in the following JSON format:
{
  "overallScore": number (0-100),
  "sectionScores": {
    "multipleChoice": number (0-100),
    "concepts": number (0-100),
    "calculations": number (0-100)
  },
  "feedback": "Overall assessment and recommendations",
  "strengths": ["List of candidate strengths"],
  "improvements": ["Areas for improvement"],
  "questionScores": [
    {
      "questionId": "string",
      "score": number (0-100),
      "feedback": "Specific feedback for this question",
      "partialCredit": boolean
    }
  ],
  "recommendation": "HIRE" | "CONSIDER" | "REJECT",
  "confidence": number (0-100)
}

Focus on technical accuracy, problem-solving approach, and communication clarity. For calculation questions, award partial credit for correct methodology even if the final answer is wrong.
`
}

export function getGrokModelConfig() {
  return {
    model: "grok-3",
    temperature: 0.1,
    max_tokens: 4000,
  }
}

export function getEmailConfig() {
  return {
    fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    hiringManagerEmail: process.env.NEXT_PUBLIC_HIRING_MANAGER_EMAIL || "hiring@cloudhire.app",
  }
}

export function isServiceBound(): boolean {
  // Check if we're in Cloudflare environment with service bindings
  return typeof globalThis !== "undefined" && "getRequestContext" in globalThis
}
