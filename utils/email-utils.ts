import { Resend } from "resend"
import { getResendConfig } from "@/lib/config"

export interface EmailMetadata {
  to: string
  subject: string
  htmlContent: string
  emailId?: string
  sentAt: Date
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured")
  }
  return new Resend(apiKey)
}

export function prepareEmailData(to: string, subject: string, htmlContent: string, attachments?: any[]) {
  const config = getResendConfig();
  return {
    from: config.fromEmail,
    to: [to],
    subject,
    html: htmlContent,
    attachments: attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "utf-8"),
    })),
  }
}

// Helper function to get the recipient email
export function getRecipientEmail(): string {
  const config = getResendConfig();
  return config.toEmail;
}

// Function for downloading HTML reports (fixes the import error)
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
