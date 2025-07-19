import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getResendConfig, getSiteConfig } from "@/lib/config"

export const runtime = "edge"

const resendConfig = getResendConfig()
const siteConfig = getSiteConfig()

const resend = new Resend(resendConfig.apiKey)

export async function POST(request: NextRequest) {
  try {
    const { candidateName, candidateEmail, reportHtml, reportData } = await request.json()

    if (!resendConfig.apiKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Send email to hiring manager
    const emailResult = await resend.emails.send({
      from: resendConfig.fromEmail,
      to: resendConfig.toEmail,
      subject: `Technical Exam Results - ${candidateName}`,
      html: `
        <h2>Technical Exam Results</h2>
        <p><strong>Candidate:</strong> ${candidateName}</p>
        <p><strong>Email:</strong> ${candidateEmail}</p>
        <p><strong>Score:</strong> ${reportData.percentage.toFixed(1)}% (${reportData.totalScore}/${reportData.maxScore})</p>
        
        <h3>Detailed Report:</h3>
        ${reportHtml}
        
        <p>View full report: <a href="${siteConfig.url}/report-viewer">Report Viewer</a></p>
      `,
    })

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Report sent successfully",
      emailId: emailResult.data?.id,
    })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
