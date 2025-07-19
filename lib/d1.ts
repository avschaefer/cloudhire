// lib/d1.ts - Cloudflare D1 integration for storing exam reports
import type { GradingResult } from "@/utils/grader"

// Note: This will only work in Cloudflare Workers environment
// For local development, these functions will be no-ops

export interface ReportData {
  submissionId: string
  candidateName: string
  position: string
  examData: any
  gradingResult: GradingResult
  submittedAt: Date
}

export async function saveReportToD1(reportData: ReportData) {
  try {
    // This will only work in Cloudflare Workers environment
    if (typeof globalThis !== "undefined" && "getRequestContext" in globalThis) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages")
      const { env } = getRequestContext()

      const stmt = env.DB.prepare(
        "INSERT INTO exam_reports (submission_id, candidate_name, position, data, created_at) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        reportData.submissionId,
        reportData.candidateName,
        reportData.position,
        JSON.stringify(reportData),
        new Date().toISOString(),
      )

      await stmt.run()
      console.log("Report saved to D1 database")
    } else {
      console.log("D1 not available in current environment - skipping database save")
    }
  } catch (error) {
    console.error("Failed to save report to D1:", error)
  }
}

export async function getReportById(id: string) {
  try {
    if (typeof globalThis !== "undefined" && "getRequestContext" in globalThis) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages")
      const { env } = getRequestContext()

      const result = await env.DB.prepare("SELECT data FROM exam_reports WHERE submission_id = ?").bind(id).first()

      return result ? JSON.parse(result.data as string) : null
    }
    return null
  } catch (error) {
    console.error("Failed to get report from D1:", error)
    return null
  }
}

export async function getAllReports() {
  try {
    if (typeof globalThis !== "undefined" && "getRequestContext" in globalThis) {
      const { getRequestContext } = await import("@cloudflare/next-on-pages")
      const { env } = getRequestContext()

      const results = await env.DB.prepare(
        "SELECT submission_id, candidate_name, position, created_at FROM exam_reports ORDER BY created_at DESC",
      ).all()

      return results.results || []
    }
    return []
  } catch (error) {
    console.error("Failed to get reports from D1:", error)
    return []
  }
}
