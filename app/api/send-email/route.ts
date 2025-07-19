import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getResendApiKey, getResendFromEmail, getResendToEmail } from "@/lib/config"

export const runtime = "edge"

const resend = new Resend(getResendApiKey())

export async function POST(request: NextRequest) {
  try {
    const { htmlReport, candidateName, position, reportData } = await request.json()

    if (!htmlReport || !candidateName || !position) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const fromEmail = getResendFromEmail()
    const toEmail = getResendToEmail()

    if (!fromEmail || !toEmail) {
      return NextResponse.json({ success: false, error: "Email configuration missing" }, { status: 500 })
    }

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Technical Exam Report - ${candidateName} (${position})`,
      html: htmlReport,
    })

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error)
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.data?.id,
    })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
