"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ExamReport from "./exam-report"

// This component is for development/testing purposes to view the generated report
export default function ExamReportViewer() {
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    const savedReport = localStorage.getItem("latestExamReport")
    if (savedReport) {
      const parsed = JSON.parse(savedReport)
      setReportData({
        ...parsed,
        examStartTime: parsed.examStartTime ? new Date(parsed.examStartTime) : undefined,
        examEndTime: parsed.examEndTime ? new Date(parsed.examEndTime) : undefined,
        submittedAt: new Date(parsed.submittedAt),
      })
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleEmailReport = () => {
    // In a real application, this would trigger an email to the hiring manager
    alert("In a production environment, this report would be automatically emailed to the hiring manager.")
  }

  if (!reportData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">No Report Available</h2>
            <p className="text-gray-600">Complete an assessment to generate a report.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Print/Email Controls - Hidden when printing */}
      <div className="max-w-6xl mx-auto p-6 print:hidden">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handlePrint} variant="outline">
              Print Report
            </Button>
            <Button onClick={handleEmailReport} className="bg-blue-600 hover:bg-blue-700">
              Email to Hiring Manager
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <ExamReport reportData={reportData} />
    </div>
  )
}
