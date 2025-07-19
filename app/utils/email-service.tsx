import type { ExamResult } from "../page"
import type { DetailedExamResult } from "../../utils/grader"

export async function sendExamResults(examResult: ExamResult | DetailedExamResult): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examResult),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export function generateHTMLReport(examResult: ExamResult | DetailedExamResult): string {
  const { userInfo, answers, totalScore, maxScore, completedAt, timeSpent } = examResult
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  const isDetailed = "gradingResults" in examResult

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Exam Results - ${userInfo.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 24px; font-weight: bold; color: #28a745; }
        .section { margin-bottom: 30px; }
        .question { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .answer { background: white; padding: 10px; border-left: 3px solid #007bff; margin-top: 10px; }
        .feedback { background: #e9ecef; padding: 10px; border-radius: 5px; margin-top: 10px; }
        .strengths { color: #28a745; }
        .improvements { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Technical Exam Results</h1>
        <p><strong>Candidate:</strong> ${userInfo.name}</p>
        <p><strong>Email:</strong> ${userInfo.email}</p>
        <p><strong>Position:</strong> ${userInfo.position}</p>
        <p><strong>Completed:</strong> ${new Date(completedAt).toLocaleString()}</p>
        <p><strong>Time Spent:</strong> ${Math.round(timeSpent / 60)} minutes</p>
        <div class="score">Score: ${totalScore}/${maxScore} (${percentage}%)</div>
      </div>

      <div class="section">
        <h2>Candidate Background</h2>
        <p><strong>Experience:</strong> ${userInfo.experience}</p>
        <p><strong>Motivation:</strong> ${userInfo.motivation}</p>
      </div>

      ${
        isDetailed
          ? `
        <div class="section">
          <h2>Overall Feedback</h2>
          <p>${examResult.overallFeedback}</p>
        </div>

        <div class="section">
          <h2>Detailed Results</h2>
          ${examResult.gradingResults
            .map(
              (result, index) => `
            <div class="question">
              <h3>Question ${result.questionId}</h3>
              <p><strong>Score:</strong> ${result.score}/${result.maxScore}</p>
              <div class="answer">
                <strong>Answer:</strong> ${answers.find((a) => a.questionId === result.questionId)?.answer || "No answer provided"}
              </div>
              <div class="feedback">
                <p><strong>Feedback:</strong> ${result.feedback}</p>
                ${result.strengths.length > 0 ? `<p class="strengths"><strong>Strengths:</strong> ${result.strengths.join(", ")}</p>` : ""}
                ${result.improvements.length > 0 ? `<p class="improvements"><strong>Areas for Improvement:</strong> ${result.improvements.join(", ")}</p>` : ""}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : `
        <div class="section">
          <h2>Answers Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Time Spent</th>
              </tr>
            </thead>
            <tbody>
              ${answers
                .map(
                  (answer, index) => `
                <tr>
                  <td>Question ${answer.questionId}</td>
                  <td>${answer.answer.substring(0, 100)}${answer.answer.length > 100 ? "..." : ""}</td>
                  <td>${Math.round(answer.timeSpent / 60)} min</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
      }

      <div class="section">
        <p><em>This report was generated automatically by the CloudHire technical assessment system.</em></p>
      </div>
    </body>
    </html>
  `
}

export function downloadHTMLReport(examResult: ExamResult | DetailedExamResult): void {
  const htmlContent = generateHTMLReport(examResult)
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `exam-results-${examResult.userInfo.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
