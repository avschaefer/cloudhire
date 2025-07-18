import type { ExamData, UserBio } from "../page"
import type { GradingResult } from "./gemini-grader"
import type { Question } from "./csv-parser"

interface EnhancedReportData {
  candidate: UserBio
  examData: ExamData
  gradingResult: GradingResult
  examStartTime?: Date
  examEndTime?: Date
  totalTimeSpent: number
  submissionId: string
  submittedAt: Date
  questions: Question[] // Pass questions here
}

export function generateEnhancedHTMLReport(reportData: EnhancedReportData): string {
  const {
    candidate,
    examData,
    gradingResult,
    examStartTime,
    examEndTime,
    totalTimeSpent,
    submissionId,
    submittedAt,
    questions,
  } = reportData

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Calculate overall metrics
  const mcQuestions = questions.filter((q) => q.type === "multipleChoice")
  const conceptQuestions = questions.filter((q) => q.type === "concepts")
  const calculationQuestions = questions.filter((q) => q.type === "calculations")

  const totalMcScore = mcQuestions.reduce((sum, q) => sum + (gradingResult.multipleChoice[q.ID]?.score || 0), 0)
  const mcScorePercentage = (totalMcScore / mcQuestions.length) * 100

  const totalConceptScore = conceptQuestions.reduce((sum, q) => sum + (gradingResult.concepts[q.ID]?.score || 0), 0)
  const conceptScorePercentage = (totalConceptScore / (conceptQuestions.length * 10)) * 100

  const totalCalcScore = calculationQuestions.reduce(
    (sum, q) => sum + (gradingResult.calculations[q.ID]?.score || 0),
    0,
  )
  const calcScorePercentage = (totalCalcScore / (calculationQuestions.length * 10)) * 100

  // Generate circular progress SVG
  const generateCircularProgress = (percentage: number, color: string) => {
    const circumference = 2 * Math.PI * 15.9155
    const strokeDasharray = `${(percentage / 100) * circumference}, ${circumference}`

    return `<svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
      <path class="text-gray-200" stroke="currentColor" strokeWidth="3" fill="none" 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      <path class="${color}" stroke="currentColor" strokeWidth="3" 
            strokeDasharray="${strokeDasharray}" fill="none" 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>`
  }

  const getRecommendationColors = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Hire":
        return { bg: "green-50", border: "green-500", text: "green-800", dot: "green-500" }
      case "Hire":
        return { bg: "blue-50", border: "blue-500", text: "blue-800", dot: "blue-500" }
      case "Maybe":
        return { bg: "yellow-50", border: "yellow-500", text: "yellow-800", dot: "yellow-500" }
      case "No Hire":
        return { bg: "red-50", border: "red-500", text: "red-800", dot: "red-500" }
      default:
        return { bg: "gray-50", border: "gray-500", text: "gray-800", dot: "gray-500" }
    }
  }

  const colors = getRecommendationColors(gradingResult.overallSummary.hiringRecommendation)

  let questionIndexCounter = 0 // To keep track of global question number

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI-Graded Technical Assessment Report - ${candidate.firstName} ${candidate.lastName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Inter', sans-serif; 
            -webkit-font-smoothing: antialiased; 
        }
        @media print { 
            * { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }
            .no-print { display: none !important; }
        }
        .answer-card { 
            page-break-inside: avoid; 
        }
        .card {
            background-color: white;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .calculation-work {
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 0.375rem;
            padding: 1rem;
            white-space: pre-wrap;
            font-size: 0.875rem;
            line-height: 1.5;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">
    <div class="max-w-5xl mx-auto p-8">
        <!-- Header -->
        <header class="flex justify-between items-center mb-8 border-b pb-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">AI-Graded Technical Assessment Report</h1>
                <p class="text-gray-500">Candidate: ${candidate.firstName} ${candidate.lastName}</p>
                <p class="text-sm text-blue-600 font-medium">🤖 Graded by Google Gemini AI with Partial Credit System</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Date: ${formatDate(submittedAt)}</p>
                <p class="text-sm text-gray-500">Report ID: ${submissionId}</p>
            </div>
        </header>

        <!-- AI Summary Banner -->
        <div class="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h2 class="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                🧠 AI Assessment Summary
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="font-semibold text-blue-800 mb-2">Overall Recommendation</h3>
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-4 h-4 bg-${colors.dot} rounded-full"></div>
                        <span class="text-xl font-bold text-${colors.text}">${gradingResult.overallSummary.hiringRecommendation}</span>
                        <span class="text-lg font-semibold text-gray-600">(${gradingResult.overallSummary.overallScore}%)</span>
                    </div>
                    <p class="text-sm text-blue-700 mb-2"><strong>Recommended Level:</strong> ${gradingResult.overallSummary.recommendedLevel}</p>
                </div>
                <div>
                    <h3 class="font-semibold text-blue-800 mb-2">Key Capabilities</h3>
                    <div class="text-sm text-blue-700 space-y-1">
                        <p><strong>Technical:</strong> ${gradingResult.overallSummary.technicalCapability}</p>
                        <p><strong>Problem Solving:</strong> ${gradingResult.overallSummary.problemSolvingSkills}</p>
                        <p><strong>Communication:</strong> ${gradingResult.overallSummary.communicationSkills}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Performance Breakdown</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                <!-- Multiple Choice -->
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto">
                        ${generateCircularProgress(mcScorePercentage, "text-blue-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold text-blue-500">${Math.round(mcScorePercentage)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Multiple Choice</p>
                    <p class="text-xs text-gray-500">Basic Knowledge</p>
                </div>

                <!-- Concepts (Focus Area) -->
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto">
                        ${generateCircularProgress(conceptScorePercentage, "text-purple-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold text-purple-500">${Math.round(conceptScorePercentage)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Concepts</p>
                    <p class="text-xs text-purple-600 font-medium">🎯 Focus Area</p>
                </div>

                <!-- Calculations (Focus Area) -->
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto">
                        ${generateCircularProgress(calcScorePercentage, "text-green-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold text-green-500">${Math.round(calcScorePercentage)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Calculations</p>
                    <p class="text-xs text-green-600 font-medium">🎯 Focus Area + Partial Credit</p>
                </div>

                <!-- Overall -->
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto">
                        ${generateCircularProgress(gradingResult.overallSummary.overallScore, "text-indigo-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold text-indigo-500">${Math.round(gradingResult.overallSummary.overallScore)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Overall Score</p>
                    <p class="text-xs text-gray-500">Weighted Average</p>
                </div>
            </div>
        </div>

        <!-- Candidate Information -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Candidate Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Name:</strong> ${candidate.firstName} ${candidate.lastName}</div>
                <div><strong>Email:</strong> ${candidate.email}</div>
                <div><strong>Phone:</strong> ${candidate.phone}</div>
                <div><strong>Position:</strong> ${candidate.position}</div>
                <div><strong>Experience:</strong> ${candidate.experience}</div>
                <div><strong>Education:</strong> ${candidate.education}</div>
                ${candidate.linkedIn ? `<div><strong>LinkedIn:</strong> <a href="${candidate.linkedIn}" class="text-blue-600 hover:underline" target="_blank">Profile</a></div>` : ""}
                <div><strong>Assessment Time:</strong> ${formatTime(totalTimeSpent)}</div>
                <div><strong>Resume:</strong> ${candidate.resume ? "Uploaded" : "Not provided"}</div>
                <div><strong>Transcript:</strong> ${candidate.transcript ? "Uploaded" : "Not provided"}</div>
            </div>
        </div>

        <!-- AI Analysis -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">🤖 AI Analysis & Insights</h2>
            
            <!-- Detailed Analysis -->
            <div class="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 class="font-semibold text-gray-800 mb-3">Comprehensive Assessment</h3>
                <p class="text-gray-700 leading-relaxed">${gradingResult.overallSummary.detailedAnalysis}</p>
            </div>

            <!-- Strengths and Improvements -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-800 mb-3 flex items-center">
                        ✅ Key Strengths
                    </h3>
                    <ul class="space-y-2">
                        ${gradingResult.overallSummary.keyStrengths
                          .map((strength) => `<li class="text-green-700 text-sm">• ${strength}</li>`)
                          .join("")}
                    </ul>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-orange-800 mb-3 flex items-center">
                        📈 Areas for Improvement
                    </h3>
                    <ul class="space-y-2">
                        ${gradingResult.overallSummary.areasForImprovement
                          .map((area) => `<li class="text-orange-700 text-sm">• ${area}</li>`)
                          .join("")}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Detailed Question Analysis -->
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">📝 Detailed Question Analysis</h2>
            
            <!-- Multiple Choice Questions -->
            <div class="card p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Multiple Choice Questions</h3>
                
                <div class="space-y-4">
                    ${mcQuestions
                      .map((q) => {
                        questionIndexCounter++
                        const grading = gradingResult.multipleChoice[q.ID]
                        return `
                        <div class="border-l-4 border-${grading.isCorrect ? "green" : "red"}-400 pl-4">
                            <h4 class="font-semibold">Q${questionIndexCounter}: ${q.question}</h4>
                            <p class="text-sm text-gray-600 mb-2">Candidate Answer: ${examData.multipleChoice[q.ID] || "No answer"}</p>
                            <p class="text-sm ${grading.isCorrect ? "text-green-600" : "text-red-600"}">${grading.feedback}</p>
                            <span class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${grading.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">
                                ${grading.score}/1 points
                            </span>
                        </div>
                        `
                      })
                      .join("")}
                </div>
            </div>

            <!-- Concept Questions (Focus Area) -->
            <div class="card p-6 border-purple-200 bg-purple-50">
                <h3 class="text-xl font-bold text-purple-800 mb-4">🎯 Concept Questions (Focus Area)</h3>
                
                <div class="space-y-6">
                    ${conceptQuestions
                      .map((q) => {
                        questionIndexCounter++
                        const grading = gradingResult.concepts[q.ID]
                        return `
                        <div class="bg-white p-4 rounded-lg border">
                            <h4 class="font-semibold mb-2">Q${questionIndexCounter}: ${q.question}</h4>
                            <div class="bg-gray-50 p-3 rounded mb-3">
                                <p class="text-sm text-gray-700 italic">"${examData.concepts[q.ID] || "No answer provided"}"</p>
                            </div>
                            <div class="mb-3">
                                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                                    ${grading.score}/10 points
                                </span>
                            </div>
                            <p class="text-sm text-gray-700 mb-3">${grading.feedback}</p>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h5 class="font-medium text-green-700 text-sm mb-1">Strengths:</h5>
                                    <ul class="text-xs text-green-600">
                                        ${grading.strengths.map((s) => `<li>• ${s}</li>`).join("")}
                                    </ul>
                                </div>
                                <div>
                                    <h5 class="font-medium text-orange-700 text-sm mb-1">Improvements:</h5>
                                    <ul class="text-xs text-orange-600">
                                        ${grading.improvements.map((i) => `<li>• ${i}</li>`).join("")}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        `
                      })
                      .join("")}
                </div>
            </div>

            <!-- Calculation Question (Focus Area) -->
            <div class="card p-6 border-green-200 bg-green-50">
                <h3 class="text-xl font-bold text-green-800 mb-4">🎯 Calculation Question (Focus Area)</h3>
                
                <div class="space-y-6">
                    ${calculationQuestions
                      .map((q) => {
                        questionIndexCounter++
                        const grading = gradingResult.calculations[q.ID]
                        return `
                        <div class="bg-white p-4 rounded-lg border">
                            <h4 class="font-semibold mb-2">Q${questionIndexCounter}: ${q.question}</h4>
                            <p class="text-sm text-gray-600 mb-3">Expected: ${q.correctAnswer} MPa</p>
                            <div class="bg-gray-50 p-3 rounded mb-3">
                                <p class="text-sm text-gray-700">Candidate Numerical Answer: <strong>${examData.calculations[`${q.ID}-answer`] || "No answer"} MPa</strong></p>
                                <p class="text-sm text-gray-700 mt-2">Candidate Work Shown & Explanation:</p>
                                <div class="calculation-work">${examData.calculations[`${q.ID}-explanation`] || "No explanation provided"}</div>
                            </div>
                            <div class="mb-3">
                                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                                    ${grading.score}/10 points
                                </span>
                            </div>
                            <p class="text-sm text-gray-700 mb-3">${grading.feedback}</p>
                            <div class="grid grid-cols-3 gap-4 text-xs">
                                <div class="text-center">
                                    <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${grading.correctApproach ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}">
                                        ${grading.correctApproach ? "✓" : "✗"}
                                    </div>
                                    <p class="font-medium">Approach</p>
                                </div>
                                <div class="text-center">
                                    <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${grading.workShown ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}">
                                        ${grading.workShown ? "✓" : "✗"}
                                    </div>
                                    <p class="font-medium">Work Shown</p>
                                </div>
                                <div class="text-center">
                                    <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${grading.finalAnswerCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}">
                                        ${grading.finalAnswerCorrect ? "✓" : "✗"}
                                    </div>
                                    <p class="font-medium">Final Answer</p>
                                </div>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg mt-4">
                                <h5 class="font-medium text-gray-800 mb-2">Detailed AI Feedback:</h5>
                                <p class="text-sm text-gray-700"><strong>Approach:</strong> ${grading.detailedFeedback.approach}</p>
                                <p class="text-sm text-gray-700"><strong>Calculation:</strong> ${grading.detailedFeedback.calculation}</p>
                                <p class="text-sm text-gray-700"><strong>Presentation:</strong> ${grading.detailedFeedback.presentation}</p>
                            </div>
                        </div>
                        `
                      })
                      .join("")}
                </div>
            </div>
        </div>

        <!-- Final Recommendation -->
        <div class="card p-6 mt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 Final Hiring Recommendation</h2>
            <div class="bg-${colors.bg} border-l-4 border-${colors.border} p-6 rounded-r-lg">
                <div class="flex items-center mb-4">
                    <div class="w-3 h-3 bg-${colors.dot} rounded-full mr-3"></div>
                    <h3 class="text-xl font-bold text-${colors.text}">${gradingResult.overallSummary.hiringRecommendation}</h3>
                    <span class="ml-3 text-lg font-semibold text-gray-600">(${gradingResult.overallSummary.overallScore}% Overall)</span>
                </div>
                <p class="text-gray-700 mb-4">Based on AI analysis with enhanced partial credit system for calculation problems, conceptual understanding evaluation, and overall assessment performance.</p>
                <div class="bg-white bg-opacity-50 p-4 rounded-lg">
                    <p class="font-semibold text-gray-800 mb-2">Recommended Level: ${gradingResult.overallSummary.recommendedLevel}</p>
                    <p class="text-gray-700">This assessment was automatically graded using Google Gemini AI with focus on problem-solving methodology and partial credit for engineering work shown.</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center text-sm text-gray-500 border-t pt-6 mt-8">
            <p>🤖 This report was automatically generated and graded by Google Gemini AI with enhanced partial credit system on ${formatDate(submittedAt)} at ${submittedAt.toLocaleTimeString()}</p>
            <p class="mt-1">Report ID: ${submissionId} | Confidential - For Internal Use Only</p>
        </footer>
    </div>
</body>
</html>`
}
