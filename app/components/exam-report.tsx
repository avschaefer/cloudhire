"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  CheckCircle,
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
  Award,
} from "lucide-react"
import type { ExamData, UserBio } from "../page"

interface ExamReportData {
  candidate: UserBio
  examData: ExamData
  examStartTime?: Date
  examEndTime?: Date
  totalTimeSpent: number
  submissionId: string
  submittedAt: Date
}

interface ExamReportProps {
  reportData: ExamReportData
}

export default function ExamReport({ reportData }: ExamReportProps) {
  const { candidate, examData, examStartTime, examEndTime, totalTimeSpent, submissionId, submittedAt } = reportData

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  const getDetailedAnalysis = () => {
    const mcAnswers = examData.multipleChoice
    const conceptAnswers = examData.concepts
    const calcAnswers = examData.calculations

    // Multiple Choice Analysis
    const mcScore = Object.keys(mcAnswers).length
    const mcTotal = 2
    const mcPercentage = (mcScore / mcTotal) * 100

    // Concepts Analysis
    const conceptsCompleted = Object.values(conceptAnswers).filter((v) => v.trim().length > 0).length
    const conceptWordCounts = Object.values(conceptAnswers).map(
      (answer) =>
        answer
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
    )
    const avgWordCount = conceptWordCounts.reduce((sum, count) => sum + count, 0) / conceptWordCounts.length || 0

    // Calculations Analysis
    const calcCompleted = Object.values(calcAnswers).filter((v) => v.trim().length > 0).length
    const calcTotal = 1
    const calcPercentage = (calcCompleted / calcTotal) * 100

    // Overall Analysis
    const totalCompleted = mcScore + conceptsCompleted + calcCompleted
    const totalQuestions = 5
    const completionRate = (totalCompleted / totalQuestions) * 100

    // Time Analysis
    const timeEfficiency =
      totalTimeSpent <= 20 * 60
        ? "Excellent"
        : totalTimeSpent <= 25 * 60
          ? "Good"
          : totalTimeSpent <= 30 * 60
            ? "Adequate"
            : "Rushed"

    return {
      multipleChoice: { score: mcScore, total: mcTotal, percentage: mcPercentage },
      concepts: { completed: conceptsCompleted, total: 2, avgWordCount, percentage: (conceptsCompleted / 2) * 100 },
      calculations: { completed: calcCompleted, total: calcTotal, percentage: calcPercentage },
      overall: { completed: totalCompleted, total: totalQuestions, completionRate },
      timeAnalysis: { efficiency: timeEfficiency, totalTime: totalTimeSpent },
    }
  }

  const getRecommendation = () => {
    const analysis = getDetailedAnalysis()
    const { completionRate } = analysis.overall
    const { efficiency } = analysis.timeAnalysis

    if (completionRate >= 80 && (efficiency === "Excellent" || efficiency === "Good")) {
      return {
        level: "Strong Candidate",
        color: "text-green-600",
        bgColor: "bg-green-50",
        recommendation: "Highly recommend for next round. Demonstrates strong technical knowledge and time management.",
        nextSteps: "Schedule technical interview with senior engineer.",
      }
    } else if (completionRate >= 60) {
      return {
        level: "Moderate Candidate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        recommendation:
          "Shows potential but may need additional evaluation. Consider experience level and role requirements.",
        nextSteps: "Review answers in detail and consider phone screening.",
      }
    } else {
      return {
        level: "Needs Review",
        color: "text-red-600",
        bgColor: "bg-red-50",
        recommendation: "Low completion rate or significant gaps. May not meet current technical requirements.",
        nextSteps: "Consider if candidate meets minimum qualifications for role.",
      }
    }
  }

  const analysis = getDetailedAnalysis()
  const recommendation = getRecommendation()

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Technical Assessment Report</h1>
            <p className="text-gray-600">Confidential - For Hiring Team Only</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Report ID: {submissionId}</p>
            <p>Generated: {formatDateTime(submittedAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Candidate Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <p className="text-gray-600">{candidate.position}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{candidate.experience} experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{candidate.education}</span>
                </div>
                {candidate.linkedIn && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <a
                      href={candidate.linkedIn}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>

              {/* File Attachments */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Attachments</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{candidate.resume ? "Resume uploaded" : "No resume provided"}</span>
                    {candidate.resume && (
                      <Badge variant="outline" className="text-xs">
                        PDF
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{candidate.transcript ? "Transcript uploaded" : "No transcript provided"}</span>
                    {candidate.transcript && (
                      <Badge variant="outline" className="text-xs">
                        PDF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Assessment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {examStartTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">{examStartTime.toLocaleTimeString()}</span>
                </div>
              )}
              {examEndTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{examEndTime.toLocaleTimeString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">{formatTime(totalTimeSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Efficiency:</span>
                <Badge
                  variant={
                    analysis.timeAnalysis.efficiency === "Excellent"
                      ? "default"
                      : analysis.timeAnalysis.efficiency === "Good"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {analysis.timeAnalysis.efficiency}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assessment Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold">
                      {analysis.overall.completed}/{analysis.overall.total}
                    </span>
                  </div>
                  <Progress value={analysis.overall.completionRate} className="mb-4" />
                  <p className="text-2xl font-bold text-gray-900">{analysis.overall.completionRate.toFixed(0)}%</p>
                </div>
                <div className={`p-4 rounded-lg ${recommendation.bgColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" />
                    <span className={`font-semibold ${recommendation.color}`}>{recommendation.level}</span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Section Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multiple Choice */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Multiple Choice</h4>
                  <Badge variant="outline">
                    {analysis.multipleChoice.score}/{analysis.multipleChoice.total}
                  </Badge>
                </div>
                <Progress value={analysis.multipleChoice.percentage} className="mb-2" />
                <div className="text-sm text-gray-600">
                  <p>
                    Questions answered: {analysis.multipleChoice.score} of {analysis.multipleChoice.total}
                  </p>
                  <p>Focus: Material properties and engineering theory</p>
                </div>
              </div>

              {/* Concepts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Conceptual Questions</h4>
                  <Badge variant="outline">
                    {analysis.concepts.completed}/{analysis.concepts.total}
                  </Badge>
                </div>
                <Progress value={analysis.concepts.percentage} className="mb-2" />
                <div className="text-sm text-gray-600">
                  <p>
                    Questions answered: {analysis.concepts.completed} of {analysis.concepts.total}
                  </p>
                  <p>Average response length: {Math.round(analysis.concepts.avgWordCount)} words</p>
                  <p>Focus: Engineering principles and explanations</p>
                </div>
              </div>

              {/* Calculations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Calculations</h4>
                  <Badge variant="outline">
                    {analysis.calculations.completed}/{analysis.calculations.total}
                  </Badge>
                </div>
                <Progress value={analysis.calculations.percentage} className="mb-2" />
                <div className="text-sm text-gray-600">
                  <p>
                    Questions answered: {analysis.calculations.completed} of {analysis.calculations.total}
                  </p>
                  <p>Focus: Numerical problem solving and stress analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Response Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multiple Choice Responses */}
              <div>
                <h4 className="font-medium mb-3">Multiple Choice Responses</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Q1: Material with highest tensile strength</p>
                    <p className="text-sm">Answer: {examData.multipleChoice["mc-q1"] || "Not answered"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Q2: Young's Modulus 'E' meaning</p>
                    <p className="text-sm">Answer: {examData.multipleChoice["mc-q2"] || "Not answered"}</p>
                  </div>
                </div>
              </div>

              {/* Concept Responses */}
              <div>
                <h4 className="font-medium mb-3">Conceptual Responses</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Q3: Factor of Safety (FOS) explanation</p>
                    <p className="text-sm whitespace-pre-wrap">{examData.concepts["concept-q1"] || "Not answered"}</p>
                    {examData.concepts["concept-q1"] && (
                      <p className="text-xs text-gray-500 mt-2">
                        {examData.concepts["concept-q1"].split(/\s+/).filter((w) => w.length > 0).length} words
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Q4: Fatigue vs Static failure difference</p>
                    <p className="text-sm whitespace-pre-wrap">{examData.concepts["concept-q2"] || "Not answered"}</p>
                    {examData.concepts["concept-q2"] && (
                      <p className="text-xs text-gray-500 mt-2">
                        {examData.concepts["concept-q2"].split(/\s+/).filter((w) => w.length > 0).length} words
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculation Response */}
              <div>
                <h4 className="font-medium mb-3">Calculation Response</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Q5: Stress calculation (Steel beam, 0.5 m², 500 kN)
                  </p>
                  <p className="text-sm">Answer: {examData.calculations["calc-q1"] || "Not answered"} MPa</p>
                  <p className="text-xs text-gray-500 mt-1">Expected answer: 1 MPa (500,000 N ÷ 0.5 m²)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Hiring Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${recommendation.bgColor} mb-4`}>
                <h4 className={`font-semibold mb-2 ${recommendation.color}`}>{recommendation.level}</h4>
                <p className="text-gray-700 mb-3">{recommendation.recommendation}</p>
                <p className="text-sm font-medium text-gray-800">Next Steps: {recommendation.nextSteps}</p>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Assessment Summary:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Completed {analysis.overall.completed} of {analysis.overall.total} questions (
                    {analysis.overall.completionRate.toFixed(0)}%)
                  </li>
                  <li>
                    Time management: {analysis.timeAnalysis.efficiency} ({formatTime(totalTimeSpent)} total)
                  </li>
                  <li>
                    Technical knowledge demonstration:{" "}
                    {analysis.multipleChoice.percentage >= 50 ? "Adequate" : "Needs improvement"}
                  </li>
                  <li>
                    Communication skills: {analysis.concepts.avgWordCount >= 50 ? "Good detail" : "Brief responses"}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
