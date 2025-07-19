export const runtime = "edge"

import { type NextRequest, NextResponse } from "next/server"
import { sendReportEmail, sendCandidateConfirmation } from "@/app/utils/email-service"
import type { CandidateInfo, ExamSession } from "@/app/utils/email-service"
import type { ExamResult } from "@/utils/grader"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidate, session, result, type } = body

    if (!candidate || !session || !result) {
      return NextResponse.json({ error: "Missing required fields: candidate, session, result" }, { status: 400 })
    }

    let emailResult

    if (type === "candidate-confirmation") {
      emailResult = await sendCandidateConfirmation(
        candidate as CandidateInfo,
        {
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        } as ExamSession,
      )
    } else {
      // Default to sending report email
      emailResult = await sendReportEmail(
        candidate as CandidateInfo,
        {
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        } as ExamSession,
        result as ExamResult,
      )
    }

    if (emailResult.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: emailResult.error || "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
