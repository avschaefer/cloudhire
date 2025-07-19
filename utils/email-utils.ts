import { Resend } from "resend"
import { getEmailConfig } from "@/lib/config"

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured")
  }
  return new Resend(apiKey)
}

export function getFromEmail(): string {
  return getEmailConfig().fromEmail
}

export function getHiringManagerEmail(): string {
  return getEmailConfig().hiringManagerEmail
}

export function prepareEmailData(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{
    filename: string
    content: string
  }>,
) {
  return {
    from: getFromEmail(),
    to: [to],
    subject,
    html: htmlContent,
    attachments: attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "utf-8"),
    })),
  }
}

export function generateEmailSubject(candidateName: string, position: string): string {
  return `Technical Assessment Results - ${candidateName} (${position})`
}

export function generateEmailPreview(overallScore: number, recommendation: string): string {
  return `Assessment completed with ${overallScore}% overall score. Recommendation: ${recommendation}`
}
