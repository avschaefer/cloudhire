import { getHiringManagerEmail } from "@/lib/config"

export async function sendReportEmail(htmlReport: string, candidateName: string, position: string): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: getHiringManagerEmail(),
        subject: `Technical Assessment Report - ${candidateName} (${position})`,
        htmlContent: htmlReport,
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Report email sent successfully:", result.emailId)
      return true
    } else {
      console.error("Failed to send report email:", result.error)
      return false
    }
  } catch (error) {
    console.error("Error sending report email:", error)
    return false
  }
}

export function downloadHTMLReport(htmlContent: string, filename = "exam-report.html") {
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
