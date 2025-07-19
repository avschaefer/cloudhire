export const runtime = "edge"

import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { getResendFromEmail, getHiringManagerEmail } from "@/lib/config"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, attachments } = body

    const fromEmail = getResendFromEmail()
    const hiringManagerEmail = getHiringManagerEmail()

    const data = await resend.emails.send({
      from: fromEmail,
      to: to || hiringManagerEmail,
      subject: subject || "Technical Exam Report",
      html: html || "<p>Technical exam report attached.</p>",
      attachments: attachments || [],
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
