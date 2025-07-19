import type { ExamResult } from "@/utils/grader"
import { getSiteConfig } from "@/lib/config"

export interface EmailReportData {
  candidateName: string
  candidateEmail: string
  examResult: ExamResult
  completionTime: string
  sessionId: string
}

export function generateHTMLReport(data: EmailReportData): string {
  const siteConfig = getSiteConfig()

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Technical Exam Report - ${data.candidateName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score-summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .question-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .score-good { color: #2e7d32; font-weight: bold; }
        .score-fair { color: #f57c00; font-weight: bold; }
        .score-poor { color: #d32f2f; font-weight: bold; }
        .category { background: #f5f5f5; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; }
        .feedback { background: #f9f9f9; padding: 10px; border-left: 4px solid #2196f3; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Technical Exam Report</h1>
        <p><strong>Candidate:</strong> ${data.candidateName}</p>
        <p><strong>Email:</strong> ${data.candidateEmail}</p>
        <p><strong>Completion Time:</strong> ${data.completionTime}</p>
        <p><strong>Session ID:</strong> ${data.sessionId}</p>
      </div>

      <div class="score-summary">
        <h2>Overall Performance</h2>
        <p><strong>Total Score:</strong> ${data.examResult.totalScore} / ${data.examResult.maxScore}</p>
        <p><strong>Percentage:</strong> ${data.examResult.percentage.toFixed(1)}%</p>
        <p><strong>Grade:</strong> ${getGradeLetter(data.examResult.percentage)}</p>
      </div>

      <div class="feedback">
        <h3>Overall Feedback</h3>
        <p>${data.examResult.overallFeedback}</p>
      </div>

      <h2>Question-by-Question Results</h2>
      ${data.examResult.results
        .map(
          (result) => `
        <div class="question-result">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3>Question ${result.questionId}</h3>
            <div>
              <span class="category">${result.category}</span>
              <span class="${getScoreClass(result.score, result.maxScore)}" style="margin-left: 10px;">
                ${result.score} / ${result.maxScore}
              </span>
            </div>
          </div>
          <div class="feedback">
            <strong>Feedback:</strong> ${result.feedback}
          </div>
        </div>
      `,
        )
        .join("")}

      <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3>Next Steps</h3>
        <p>This report has been automatically generated and sent to the hiring team.</p>
        <p>For questions about this assessment, please contact the hiring team.</p>
        <p><a href="${siteConfig.url}/report-viewer?session=${data.sessionId}">View Interactive Report</a></p>
      </div>
    </body>
    </html>
  `
}

function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return "A (Excellent)"
  if (percentage >= 80) return "B (Good)"
  if (percentage >= 70) return "C (Satisfactory)"
  if (percentage >= 60) return "D (Needs Improvement)"
  return "F (Unsatisfactory)"
}

function getScoreClass(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "score-good"
  if (percentage >= 60) return "score-fair"
  return "score-poor"
}

export async function sendExamReport(data: EmailReportData): Promise<boolean> {
  try {
    const reportHtml = generateHTMLReport(data)

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        reportHtml,
        reportData: data.examResult,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Failed to send email:", error)
      return false
    }

    const result = await response.json()
    console.log("Email sent successfully:", result)
    return true
  } catch (error) {
    console.error("Error sending exam report:", error)
    return false
  }
}

// Export the downloadHTMLReport function that was missing
export function downloadHTMLReport(data: EmailReportData): void {
  const htmlContent = generateHTMLReport(data)
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `exam-report-${data.candidateName.replace(/\s+/g, "-")}-${Date.now()}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
