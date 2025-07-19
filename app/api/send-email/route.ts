export const runtime = "edge"

import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getResendConfig } from "@/lib/config"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { htmlReport, candidateName, position, reportData } = await request.json()

    const config = getResendConfig()

    if (!config.apiKey) {
      return NextResponse.json({ success: false, error: "Resend API key not configured" }, { status: 500 })
    }

    const emailData = {
      from: config.fromEmail,
      to: [config.toEmail],
      subject: `Technical Assessment Report - ${candidateName} (${position})`,
      html: htmlReport,
    }

    const result = await resend.emails.send(emailData)

    if (result.error) {
      console.error("Resend error:", result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }

    console.log("Email sent successfully:", result.data?.id)

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message: "Report sent successfully",
    })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
