import { Resend } from "resend"
import { getEmailConfig } from "@/lib/config"

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY not configured")
  return new Resend(apiKey)
}

export function getFromEmail() {
  return getEmailConfig().fromEmail
}

export function prepareEmailData(to: string, subject: string, htmlContent: string, attachments?: any[]) {
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
