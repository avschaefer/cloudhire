import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"

// Configuration functions to avoid hardcoding values
export function getAiGradingPrompt(examData: ExamData, userBio: UserBio, questions: Question[]) {
  return `
    Evaluate this technical hiring exam for position: ${userBio.position || "Unknown"}.
    
    Candidate: ${userBio.firstName || ""} ${userBio.lastName || ""}
    Experience: ${userBio.experience || "Not specified"}
    Education: ${userBio.education || "Not specified"}
    
    Questions and Answers:
    ${JSON.stringify({ questions, answers: examData }, null, 2)}
    
    Please provide a JSON response with:
    - score: integer (0-100) representing overall performance
    - feedback: string with detailed overall assessment
    - details: object with per-question analysis and scores
    - strengths: array of identified strengths
    - improvements: array of areas for improvement
    
    Be objective, technical, and provide insights valuable for hiring decisions.
    Focus on technical competency, problem-solving approach, and depth of understanding.
  `
}

export function getWorkerUrl(): string {
  return process.env.AI_GRADER_WORKER_URL || "https://ai-grader-worker.youraccount.workers.dev/"
}

export function getSiteUrl(): string {
  return process.env.SITE_URL || "https://cloudhire.app"
}

export function getHiringManagerEmail(): string {
  return process.env.RESEND_TO_EMAIL || "hiring@company.com"
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
}

export function getGrokModel(): string {
  return process.env.GROK_MODEL || "grok-3"
}

export function getGrokTemperature(): number {
  return Number.parseFloat(process.env.GROK_TEMPERATURE || "0.7")
}
