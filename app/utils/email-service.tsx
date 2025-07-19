import { Resend } from "resend"
import { getResendApiKey, getResendFromEmail } from "@/lib/config"
import type { ExamResult } from "@/utils/grader"

const resend = new Resend(getResendApiKey())

export interface CandidateInfo {
  name: string
  email: string
  position: string
  company?: string
}

export interface ExamSession {
  sessionId: string
  startTime: Date
  endTime: Date
  duration: number // in minutes
}

// Generate HTML report
export const generateHTMLReport = (candidate: CandidateInfo, session: ExamSession, result: ExamResult): string => {
  const siteUrl = "https://example.com" // Placeholder for getSiteUrl()

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Technical Exam Report - ${candidate.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .score-summary { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .question-result { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .score { font-weight: bold; color: #1976d2; }
        .feedback { margin-top: 10px; font-style: italic; }
        .category { background: #f5f5f5; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Technical Exam Report</h1>
        <p><strong>Candidate:</strong> ${candidate.name}</p>
        <p><strong>Email:</strong> ${candidate.email}</p>
        <p><strong>Position:</strong> ${candidate.position}</p>
        ${candidate.company ? `<p><strong>Company:</strong> ${candidate.company}</p>` : ""}
        <p><strong>Session ID:</strong> ${session.sessionId}</p>
        <p><strong>Date:</strong> ${session.startTime.toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${session.duration} minutes</p>
      </div>

      <div class="score-summary">
        <h2>Overall Score</h2>
        <p class="score">Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)</p>
        <p>${result.overallFeedback}</p>
      </div>

      <h2>Question-by-Question Results</h2>
      ${result.results
        .map(
          (questionResult) => `
        <div class="question-result">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Question ${questionResult.questionId}</h3>
            <span class="category">${questionResult.category}</span>
          </div>
          <p class="score">Score: ${questionResult.score}/${questionResult.maxScore}</p>
          <div class="feedback">${questionResult.feedback}</div>
        </div>
      `,
        )
        .join("")}

      <div class="footer">
        <p>This report was generated automatically by the CloudHire Technical Exam System.</p>
        <p>For questions about this report, please contact your hiring manager.</p>
        <p>Report generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
}

// Download HTML report (for client-side use)
export function downloadHTMLReport(htmlContent: string, filename: string): void {
  if (typeof window === "undefined") return

  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Send report email
export async function sendReportEmail(
  htmlReport: string,
  candidateName: string,
  position: string,
  reportData?: any,
): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        htmlReport,
        candidateName,
        position,
        reportData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API failed: ${response.status}`)
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

// Send confirmation email to candidate
export const sendCandidateConfirmation = async (
  candidate: CandidateInfo,
  session: ExamSession,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const fromEmail = getResendFromEmail()

    if (!getResendApiKey()) {
      throw new Error("Resend API key not configured")
    }

    const emailData = {
      from: fromEmail,
      to: [candidate.email],
      subject: "Technical Exam Completed - Thank You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for completing the technical exam!</h2>
          <p>Dear ${candidate.name},</p>
          <p>Thank you for taking the time to complete our technical exam for the <strong>${candidate.position}</strong> position.</p>
          <p><strong>Exam Details:</strong></p>
          <ul>
            <li>Session ID: ${session.sessionId}</li>
            <li>Completed on: ${session.startTime.toLocaleDateString()}</li>
            <li>Duration: ${session.duration} minutes</li>
          </ul>
          <p>Your responses have been submitted successfully and are being reviewed by our team. We will be in touch with you soon regarding the next steps in the hiring process.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The Hiring Team</p>
        </div>
      `,
    }

    const response = await resend.emails.send(emailData)

    if (response.error) {
      throw new Error(response.error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending candidate confirmation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
