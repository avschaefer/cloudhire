import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, attachments } = await request.json()

    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY environment variable is not set")
      return NextResponse.json({ success: false, error: "RESEND_API_KEY not configured" }, { status: 500 })
    }

    // For Resend without verified domain, use onboarding@resend.dev as sender
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

    console.log("Sending email with Resend:")
    console.log("From:", fromEmail)
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Attachments:", attachments?.length || 0)

    // Prepare email data
    const emailData: any = {
      from: fromEmail,
      to: [to],
      subject,
      html: htmlContent,
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "utf-8"),
      }))
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Resend error: ${error.message || JSON.stringify(error)}`,
        },
        { status: 400 },
      )
    }

    console.log("Email sent successfully with ID:", data?.id)

    return NextResponse.json({
      success: true,
      message: "Assessment report emailed successfully",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    )
  }
}
