import { getEmailConfig } from "@/lib/config"
import type { ReportData } from "@/lib/d1"

interface EmailData {
  to: string
  subject: string
  htmlContent: string
  attachments?: Array<{
    filename: string
    content: string
    type: string
  }>
  reportData?: ReportData
}

export async function sendReportEmail(
  htmlReport: string,
  candidateName: string,
  position: string,
  reportData?: ReportData,
): Promise<boolean> {
  try {
    const { hiringManagerEmail } = getEmailConfig()

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: hiringManagerEmail,
        subject: `Technical Assessment Results - ${candidateName} (${position})`,
        htmlContent: htmlReport,
        reportData, // Include for D1 storage
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Email API error:", result.error)
      return false
    }

    console.log("Email sent successfully:", result.emailId)
    return true
  } catch (error) {
    console.error("Failed to send report email:", error)
    return false
  }
}

export function downloadHTMLReport(htmlContent: string, filename: string) {
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

// PDF conversion utility (requires additional setup)
export async function convertHTMLToPDF(htmlContent: string): Promise<Blob | null> {
  try {
    // This would require a service like Puppeteer, jsPDF, or a cloud service
    console.log("PDF conversion would happen here")

    // Example implementation with a cloud service:
    const response = await fetch("/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: htmlContent }),
    })

    if (response.ok) {
      return await response.blob()
    }

    return null
  } catch (error) {
    console.error("Failed to convert HTML to PDF:", error)
    return null
  }
}
