"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, User, Mail, Phone, Briefcase, Calendar, GraduationCap, Link, FileText } from "lucide-react"
import type { ExamData, UserBio } from "../page"
import { Badge } from "@/components/ui/badge"
import { generateReport } from '@/lib/reportGenerator';

interface SubmissionPageProps {
  userBio: UserBio
  examData: ExamData
  examStartTime?: Date
  examEndTime?: Date
  totalTimeSpent: number
}

export default function SubmissionPage({
  userBio,
  examData,
  examStartTime,
  examEndTime,
  totalTimeSpent,
}: SubmissionPageProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getCompletionStats = () => {
    const mcCompleted = Object.keys(examData.multipleChoice).length
    const conceptsCompleted = Object.values(examData.concepts).filter((v) => v.trim().length > 0).length
    const calculationsCompleted = Object.values(examData.calculations).filter((v) => v.trim().length > 0).length

    return {
      multipleChoice: mcCompleted,
      concepts: conceptsCompleted,
      calculations: calculationsCompleted,
      total: mcCompleted + conceptsCompleted + calculationsCompleted,
    }
  }

  const stats = getCompletionStats()

  const handleNewAssessment = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleGenerateReport = async () => {
    if (userBio.id) {
      await generateReport(userBio.id, 'hiring@company.com'); // Replace with actual email
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Completed!</h1>
        <p className="text-lg text-gray-600">
          Thank you for completing the technical assessment. Your responses have been submitted successfully.
        </p>
      </div>

      <div className="mb-8">
        {/* Candidate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {userBio.firstName} {userBio.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Full Name</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{userBio.email}</p>
                  <p className="text-sm text-gray-500">Email Address</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{userBio.phone}</p>
                  <p className="text-sm text-gray-500">Phone Number</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{userBio.position}</p>
                  <p className="text-sm text-gray-500">Position Applied For</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" /> {/* Using Clock for experience */}
                <div>
                  <p className="font-medium">{userBio.experience}</p>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-gray-500" /> {/* New icon for education */}
                <div>
                  <p className="font-medium">{userBio.education}</p>
                  <p className="text-sm text-gray-500">Highest Education</p>
                </div>
              </div>
              {userBio.linkedIn && (
                <div className="flex items-center gap-3">
                  <Link className="w-4 h-4 text-gray-500" /> {/* New icon for LinkedIn */}
                  <div>
                    <p className="font-medium">
                      <a
                        href={userBio.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">Social Profile</p>
                  </div>
                </div>
              )}
            </div>

            {/* File Attachments */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Attachments</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{userBio.resume ? "Resume uploaded" : "No resume provided"}</span>
                  {userBio.resume && (
                    <Badge variant="outline" className="text-xs">
                      PDF
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{userBio.transcript ? "Transcript uploaded" : "No transcript provided"}</span>
                  {userBio.transcript && (
                    <Badge variant="outline" className="text-xs">
                      PDF
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Summary */}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Review Process</p>
                <p className="text-sm text-gray-600">
                  Our technical team will review your assessment within 2-3 business days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Follow-up Communication</p>
                <p className="text-sm text-gray-600">
                  We'll contact you at {userBio.email} with the results and next steps.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Interview Process</p>
                <p className="text-sm text-gray-600">
                  Qualified candidates will be invited for an in-person or virtual interview.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t text-center">
            <p className="text-sm text-gray-600 mb-4">
              Thank you for your interest in joining our team. We appreciate the time you've invested in this
              assessment.
            </p>
            <Button onClick={handleNewAssessment} variant="outline">
              Start New Assessment
            </Button>
            <Button onClick={handleGenerateReport} className="mt-4">
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
