"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, FileText, Eye } from "lucide-react"
import { downloadHTMLReport } from "../utils/email-service"

export default function ReportViewer() {
  const [reportHTML, setReportHTML] = useState<string>("")
  const [emailData, setEmailData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const savedReport = localStorage.getItem("latestHTMLReport")
    const savedEmailData = localStorage.getItem("reportEmailData")

    if (savedReport) {
      setReportHTML(savedReport)
    }
    if (savedEmailData) {
      setEmailData(JSON.parse(savedEmailData))
    }
  }, [])

  const handleDownloadHTML = () => {
    if (reportHTML) {
      const filename = `assessment-report-${Date.now()}.html`
      downloadHTMLReport(reportHTML, filename)
    }
  }

  const handleEmailTest = () => {
    alert("In production, this would send the report to the hiring manager's email address.")
  }

  const handlePreview = () => {
    if (reportHTML) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(reportHTML)
        newWindow.document.close()
      }
    }
  }

  if (!reportHTML) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Report Available</h2>
            <p className="text-gray-600">Complete an assessment to generate an HTML report.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assessment Report Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Report Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Report Details</h3>
              {emailData && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Generated</Badge>
                    <span className="text-gray-600">HTML report created successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Ready to email: {emailData.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Subject: {emailData.subject}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Eye className="w-4 h-4" />
                  Preview Report
                </Button>
                <Button
                  onClick={handleDownloadHTML}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </Button>
                <Button onClick={handleEmailTest} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              This is a preview of the HTML report that will be emailed to the hiring manager. The actual report
              includes interactive elements and proper styling.
            </p>
            <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: reportHTML.substring(0, 2000) + "..." }} className="text-xs" />
            </div>
            <div className="mt-4 text-center">
              <Button onClick={handlePreview} variant="outline">
                View Full Report in New Window
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
