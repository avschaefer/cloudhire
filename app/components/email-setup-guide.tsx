"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Mail, Copy, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function EmailSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const setupSteps = [
    {
      title: "Create Resend Account",
      description: "Sign up for a free Resend account",
      action: "Visit resend.com and create an account with your email",
      link: "https://resend.com/signup",
      code: null,
    },
    {
      title: "Get API Key",
      description: "Generate your API key from the Resend dashboard",
      action: "Go to API Keys section and create a new key",
      link: "https://resend.com/api-keys",
      code: null,
    },
    {
      title: "Add Environment Variables",
      description: "Add these to your .env.local file",
      action: "Use the SAME email address you used to sign up for Resend",
      link: null,
      code: `RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=your-resend-account@email.com`,
    },
    {
      title: "Install Resend Package",
      description: "Add the Resend SDK to your project",
      action: "Run this command in your project directory",
      link: null,
      code: "npm install resend",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Service Setup Guide</h1>
        <p className="text-lg text-gray-600">
          Configure Resend for automated assessment report delivery. For accounts without verified domains, emails can
          only be sent to your Resend account email.
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Without a verified domain, Resend can only send emails to the email address you
          used to create your Resend account. Make sure to set <code>RESEND_TO_EMAIL</code> to your
          Resend account email address.
        </AlertDescription>
      </Alert>

      {/* Why Resend */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Resend Configuration for Personal Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">3,000 free emails/month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Works without domain verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Simple API integration</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Can only send to account email</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Uses onboarding@resend.dev sender</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Perfect for testing/development</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Can upgrade to custom domain later</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-6">
        {setupSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                {step.title}
                {step.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(step.link, "_blank")}
                    className="ml-auto"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <p className="text-sm text-gray-700 mb-4">{step.action}</p>

              {step.code && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(step.code!, index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    {copiedStep === index ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <pre className="whitespace-pre-wrap pr-12">{step.code}</pre>
                </div>
              )}

              {index === 2 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Replace <code>your-resend-account@email.com</code> with the exact email address you used to sign up
                    for Resend. This is the only email address that can receive emails without domain verification.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testing */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Testing Your Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              After completing the setup, complete a test assessment to verify that reports are being generated and
              emailed correctly. The email will be sent to your Resend account email address.
            </AlertDescription>
          </Alert>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Quick Test Checklist:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• RESEND_API_KEY is set correctly</li>
              <li>• RESEND_TO_EMAIL matches your Resend account email</li>
              <li>• Resend package is installed</li>
              <li>• API key has proper permissions</li>
              <li>• Check spam folder if email doesn't arrive</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Domain Verification Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upgrading to Custom Domain (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            To send emails to any address and use a professional sender address, you can verify a custom domain:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Send to any email address</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Use custom sender address (e.g., noreply@yourcompany.com)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Better email deliverability</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Professional branding</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => window.open("https://resend.com/domains", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn About Domain Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
