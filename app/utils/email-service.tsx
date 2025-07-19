import { getEmailConfig } from "@/lib/config"

export async function sendReportEmail(htmlReport: string, candidateName: string, position: string, reportData?: any) {
  try {
    const { hiringManagerEmail } = getEmailConfig()

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: hiringManagerEmail,
        subject: `Technical Assessment Report - ${candidateName} (${position})`,
        htmlContent: htmlReport,
        reportData,
      }),
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error("Failed to send report email:", error)
    return false
  }
}
