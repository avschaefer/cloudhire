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
  createdAt?: Date
}

export async function saveReportToD1(reportData: ReportData): Promise<void> {
  try {
    // This will be enabled once D1 is configured
    console.log("D1 save would store:", reportData.submissionId)

    /* 
    // Enable this after D1 binding is configured:
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const { env } = getRequestContext()
    
    const stmt = env.DB.prepare(`
      INSERT INTO exam_reports 
      (submission_id, candidate_name, candidate_email, position, exam_data, grading_result, email_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      reportData.submissionId,
      reportData.candidateName,
      reportData.candidateEmail,
      reportData.position,
      JSON.stringify(reportData.examData),
      JSON.stringify(reportData.gradingResult),
      reportData.emailId,
      new Date().toISOString()
    )
    
    await stmt.run()
    */
  } catch (error) {
    console.error("D1 save error:", error)
  }
}

export async function getReportById(id: string): Promise<ReportData | null> {
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
        submissionId: result.submission_id as string,
        candidateName: result.candidate_name as string,
        candidateEmail: result.candidate_email as string,
        position: result.position as string,
        examData: JSON.parse(result.exam_data as string),
        gradingResult: result.grading_result ? JSON.parse(result.grading_result as string) : null,
        emailId: result.email_id as string,
        createdAt: new Date(result.created_at as string)
      }
    }
    */
  } catch (error) {
    console.error("D1 get error:", error)
  }
  return null
}
