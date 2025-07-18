import ReportViewer from "../components/report-viewer"

export default function ReportViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Assessment Report Viewer</h1>
          <p className="text-gray-600">View and manage generated assessment reports</p>
        </div>
      </div>
      <ReportViewer />
    </div>
  )
}
