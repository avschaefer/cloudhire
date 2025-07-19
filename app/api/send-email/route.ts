import { type NextRequest, NextResponse } from "next/server"
import { getResendClient, prepareEmailData, getHiringManagerEmail } from "@/utils/email-utils"
import { saveReportToD1, type ReportData } from "@/lib/d1"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, attachments, reportData } = await request.json()

    // Use hiring manager email if no specific recipient provided
    const recipient = to || getHiringManagerEmail()

    const resend = getResendClient()
    const emailData = prepareEmailData(recipient, subject, htmlContent, attachments)

    console.log("Sending email with Resend:", {
      from: emailData.from,
      to: recipient,
      subject,
      attachments: attachments?.length || 0,
    })

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json(
        { success: false, error: `Resend error: ${error.message || JSON.stringify(error)}` },
        { status: 400 },
      )
    }

    console.log("Email sent successfully with ID:", data?.id)

    // Store report in D1 if report data provided
    if (reportData) {
      const reportWithEmailId: ReportData = {
        ...reportData,
        emailId: data?.id,
      }
      await saveReportToD1(reportWithEmailId)
    }

    return NextResponse.json({
      success: true,
      message: "Assessment report emailed successfully",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
