import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { generateHTMLReport } from "../../utils/email-service"

export const runtime = "edge"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const examResult = await request.json()

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const htmlContent = generateHTMLReport(examResult)
    const { userInfo, totalScore, maxScore } = examResult
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    // Send to hiring manager
    const hiringManagerEmail = process.env.NEXT_PUBLIC_HIRING_MANAGER_EMAIL || "hiring@example.com"

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: [hiringManagerEmail],
      subject: `Technical Exam Results - ${userInfo.name} (${percentage}%)`,
      html: htmlContent,
    })

    // Send confirmation to candidate
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: [userInfo.email],
      subject: "Technical Exam Completed - Thank You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Thank you for completing the technical exam!</h2>
          <p>Dear ${userInfo.name},</p>
          <p>We have received your technical exam submission. Here are the details:</p>
          <ul>
            <li><strong>Position:</strong> ${userInfo.position}</li>
            <li><strong>Completed:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Score:</strong> ${totalScore}/${maxScore} (${percentage}%)</li>
          </ul>
          <p>Our team will review your submission and get back to you soon.</p>
          <p>Best regards,<br>The Hiring Team</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
