// D1 database integration for Cloudflare
// This will be enabled after D1 database is set up

export interface ReportData {
  submissionId: string
  candidateName: string
  candidateEmail: string
  position: string
  examData: any
  gradingResult?: any
  emailId?: string
}

export async function saveReportToD1(reportData: ReportData) {
  try {
    // This will be enabled once D1 is configured
    console.log("D1 save would store:", reportData.submissionId)

    /* 
    // Enable this after D1 binding is configured:
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const { env } = getRequestContext()
    
    const stmt = env.DB.prepare(`
      INSERT INTO exam_reports 
      (submission_id, candidate_name, candidate_email, position, exam_data, grading_result, email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      reportData.submissionId,
      reportData.candidateName,
      reportData.candidateEmail,
      reportData.position,
      JSON.stringify(reportData.examData),
      JSON.stringify(reportData.gradingResult),
      reportData.emailId
    )
    
    await stmt.run()
    */
  } catch (error) {
    console.error("D1 save error:", error)
  }
}

export async function getReportById(id: string) {
  try {
    console.log("D1 get would fetch:", id)
    return null

    /* 
    // Enable this after D1 binding is configured:
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const { env } = getRequestContext()
    
    const result = await env.DB.prepare(
      'SELECT * FROM exam_reports WHERE submission_id = ?'
    ).bind(id).first()
    
    if (result) {
      return {
        ...result,
        examData: JSON.parse(result.exam_data as string),
        gradingResult: result.grading_result ? JSON.parse(result.grading_result as string) : null
      }
    }
    */
  } catch (error) {
    console.error("D1 get error:", error)
  }
  return null
}
