export const runtime = "edge"

import { Resend } from "resend"
import { getResendConfig } from "@/lib/config"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { to, subject, htmlContent, reportData } = await request.json()
    const config = getResendConfig()

    if (!config.apiKey) {
      return Response.json({ success: false, error: "Resend API key not configured" }, { status: 500 })
    }

    const emailResult = await resend.emails.send({
      from: config.fromEmail,
      to: to,
      subject: subject,
      html: htmlContent,
    })

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error)
      return Response.json({ success: false, error: emailResult.error.message }, { status: 500 })
    }

    // Store report data in D1 database (when available)
    if (reportData) {
      try {
        // This will be enabled when D1 is configured
        // await storeReportInD1(reportData)
        console.log("Report data would be stored in D1:", reportData.submissionId)
      } catch (dbError) {
        console.warn("Failed to store in D1, continuing with email:", dbError)
      }
    }

    return Response.json({
      success: true,
      emailId: emailResult.data?.id,
      message: "Email sent successfully",
    })
  } catch (error) {
    console.error("Email API error:", error)
    return Response.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
