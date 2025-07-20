import EmailSetupGuide from "../components/email-setup-guide"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Setup Guide</h1>
          <p className="text-gray-600">Configure email service and AI grading</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        {/* XAI API Setup */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">🤖 xAI Grok Setup</h2>
            <p className="text-blue-700 mb-4">
              Configure xAI Grok API for intelligent exam grading with detailed feedback on concept and calculation
              problems.
            </p>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Required Environment Variable:</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                XAI_API_KEY=your_xai_api_key_here
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  Get your API key from{" "}
                  <a
                    href="https://console.x.ai/"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    xAI Console
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>AI grades concept explanations and calculation work</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Provides detailed feedback and capability assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Generates hiring recommendations based on performance</span>
              </div>
            </div>
          </div>
        </div>

        <EmailSetupGuide />
      </div>
    </div>
  )
}
