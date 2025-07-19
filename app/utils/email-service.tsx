import { Resend } from "resend"
import { getResendFromEmail, getHiringManagerEmail, getSiteUrl } from "@/lib/config"
import type { ExamData, UserBio } from "@/app/page"
import type { Question } from "@/app/utils/csv-parser"
import type { GradingResult } from "@/utils/grader"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailReportData {
  userBio: UserBio
  examData: ExamData
  questions: Question[]
  gradingResult: GradingResult
  submissionId: string
}

export async function sendEmailReport(reportData: EmailReportData) {
  try {
    const { userBio, examData, questions, gradingResult, submissionId } = reportData

    const fromEmail = getResendFromEmail()
    const hiringManagerEmail = getHiringManagerEmail()
    const siteUrl = getSiteUrl()

    // Generate HTML report
    const htmlReport = generateHTMLReport(reportData)

    // Send email with HTML report
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: hiringManagerEmail,
      subject: `Technical Exam Report - ${userBio.firstName} ${userBio.lastName}`,
      html: htmlReport,
      attachments: [
        {
          filename: `exam-report-${submissionId}.html`,
          content: Buffer.from(htmlReport).toString("base64"),
          type: "text/html",
        },
      ],
    })

    return {
      success: true,
      emailId: emailResult.data?.id,
      reportUrl: `${siteUrl}/report?id=${submissionId}`,
    }
  } catch (error) {
    console.error("Failed to send email report:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function generateHTMLReport(reportData: EmailReportData): string {
  const { userBio, examData, questions, gradingResult, submissionId } = reportData

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Technical Exam Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .score { font-size: 24px; font-weight: bold; color: ${gradingResult.score >= 70 ? "#28a745" : gradingResult.score >= 50 ? "#ffc107" : "#dc3545"}; }
        .section { margin-bottom: 30px; }
        .question { background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .answer { background: white; padding: 10px; margin-top: 10px; border-left: 3px solid #007bff; }
        .strengths { color: #28a745; }
        .improvements { color: #dc3545; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Technical Exam Report</h1>
        <p><strong>Candidate:</strong> ${userBio.firstName} ${userBio.lastName}</p>
        <p><strong>Email:</strong> ${userBio.email}</p>
        <p><strong>Position:</strong> ${userBio.position}</p>
        <p><strong>Experience:</strong> ${userBio.experience}</p>
        <p><strong>Education:</strong> ${userBio.education}</p>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Overall Score</h2>
        <div class="score">${gradingResult.score}/100</div>
      </div>

      <div class="section">
        <h2>Overall Feedback</h2>
        <p>${gradingResult.feedback}</p>
      </div>

      ${
        gradingResult.strengths && gradingResult.strengths.length > 0
          ? `
      <div class="section">
        <h2 class="strengths">Strengths</h2>
        <ul>
          ${gradingResult.strengths.map((strength) => `<li>${strength}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

      ${
        gradingResult.improvements && gradingResult.improvements.length > 0
          ? `
      <div class="section">
        <h2 class="improvements">Areas for Improvement</h2>
        <ul>
          ${gradingResult.improvements.map((improvement) => `<li>${improvement}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

      <div class="section">
        <h2>Detailed Question Analysis</h2>
        ${questions
          .map((question, index) => {
            const section = question.type.toLowerCase().includes("multiple")
              ? "multipleChoice"
              : question.type.toLowerCase().includes("open")
                ? "concepts"
                : "calculations"
            const answer = examData[section]?.[question.ID] || "No answer provided"
            const detail = gradingResult.details?.[question.ID]

            return `
            <div class="question">
              <h3>Question ${index + 1}: ${question.type}</h3>
              <p><strong>Question:</strong> ${question.question}</p>
              ${question.options ? `<p><strong>Options:</strong> ${question.options}</p>` : ""}
              <div class="answer">
                <p><strong>Answer:</strong> ${answer}</p>
                ${detail ? `<p><strong>Analysis:</strong> ${typeof detail === "object" ? JSON.stringify(detail) : detail}</p>` : ""}
              </div>
            </div>
          `
          })
          .join("")}
      </div>

      <div class="section">
        <p><em>This report was generated automatically by the Technical Exam System.</em></p>
      </div>
    </body>
    </html>
  `
}

export function downloadHTMLReport(reportData: EmailReportData): void {
  const htmlContent = generateHTMLReport(reportData)
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `exam-report-${reportData.submissionId}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
