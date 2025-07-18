import type { ExamData, UserBio } from "../page"

interface ReportData {
  candidate: UserBio
  examData: ExamData
  examStartTime?: Date
  examEndTime?: Date
  totalTimeSpent: number
  submissionId: string
  submittedAt: Date
}

interface QuestionAnalysis {
  id: string
  question: string
  candidateAnswer: string
  isCorrect: boolean
  correctAnswer?: string
  section: string
  difficulty: number
  options?: string[]
}

export function generateHTMLReport(reportData: ReportData): string {
  const { candidate, examData, examStartTime, examEndTime, totalTimeSpent, submissionId, submittedAt } = reportData

  // Analyze exam performance
  const analysis = analyzeExamPerformance(examData)
  const questions = getQuestionAnalysis(examData)

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Technical Assessment Report - ${candidate.firstName} ${candidate.lastName}</title>
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
    </style>
</head>
<body class="bg-gray-50 text-gray-800">
    <div class="max-w-4xl mx-auto p-8">
        <!-- Header -->
        <header class="flex justify-between items-center mb-8 border-b pb-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Technical Assessment Report</h1>
                <p class="text-gray-500">Candidate: ${candidate.firstName} ${candidate.lastName}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Date: ${formatDate(submittedAt)}</p>
                <p class="text-sm text-gray-500">Report ID: ${submissionId}</p>
            </div>
        </header>

        <!-- Overall Performance -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 text-center">Overall Exam Performance</h2>
            <div class="flex flex-col sm:flex-row justify-around items-center mt-4 space-y-8 sm:space-y-0 sm:space-x-8">
                
                <!-- Completion Rate -->
                <div class="text-center">
                    <div class="relative w-32 h-32">
                        ${generateCircularProgress(analysis.completionRate, "text-blue-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-3xl font-bold text-blue-500">${Math.round(analysis.completionRate)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Completion Rate</p>
                    <p class="text-sm text-gray-500">${analysis.totalCompleted}/5 Questions</p>
                </div>

                <!-- Time Efficiency -->
                <div class="text-center">
                    <div class="relative w-32 h-32">
                        ${generateCircularProgress(analysis.timeEfficiencyScore, "text-green-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-3xl font-bold text-green-500">${Math.round(analysis.timeEfficiencyScore)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Time Efficiency</p>
                    <p class="text-sm text-gray-500">${formatTime(totalTimeSpent)} Total</p>
                </div>

                <!-- Overall Score -->
                <div class="text-center">
                    <div class="relative w-32 h-32">
                        ${generateCircularProgress(analysis.overallScore, "text-purple-500")}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-3xl font-bold text-purple-500">${Math.round(analysis.overallScore)}%</span>
                        </div>
                    </div>
                    <p class="font-semibold text-gray-700 mt-2">Overall Score</p>
                    <p class="text-sm text-gray-500">${analysis.recommendation.level}</p>
                </div>
            </div>
        </div>

        <!-- Candidate Information -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Candidate Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Name:</strong> ${candidate.firstName} ${candidate.lastName}</div>
                <div><strong>Email:</strong> ${candidate.email}</div>
                <div><strong>Phone:</strong> ${candidate.phone}</div>
                <div><strong>Position:</strong> ${candidate.position}</div>
                <div><strong>Experience:</strong> ${candidate.experience}</div>
                <div><strong>Education:</strong> ${candidate.education}</div>
                ${candidate.linkedIn ? `<div><strong>LinkedIn:</strong> <a href="${candidate.linkedIn}" class="text-blue-600 hover:underline" target="_blank">Profile</a></div>` : ""}
                <div><strong>Resume:</strong> ${candidate.resume ? "Uploaded" : "Not provided"}</div>
                <div><strong>Transcript:</strong> ${candidate.transcript ? "Uploaded" : "Not provided"}</div>
            </div>
        </div>

        <!-- Hiring Recommendation -->
        <div class="card p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Hiring Recommendation</h2>
            <div class="bg-${analysis.recommendation.bgColor} border-l-4 border-${analysis.recommendation.borderColor} p-6 rounded-r-lg">
                <div class="flex items-center mb-4">
                    <div class="w-3 h-3 bg-${analysis.recommendation.dotColor} rounded-full mr-3"></div>
                    <h3 class="text-xl font-bold text-${analysis.recommendation.textColor}">${analysis.recommendation.level}</h3>
                </div>
                <p class="text-gray-700 mb-4">${analysis.recommendation.summary}</p>
                <div class="bg-white bg-opacity-50 p-4 rounded-lg">
                    <p class="font-semibold text-gray-800 mb-2">Next Steps:</p>
                    <p class="text-gray-700">${analysis.recommendation.nextSteps}</p>
                </div>
            </div>
        </div>

        <!-- Detailed Answer Review -->
        <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Detailed Answer Review</h2>
            <div class="space-y-6">
                ${questions
                  .map(
                    (q, index) => `
                <div class="card p-6 answer-card">
                    <div class="mb-3">
                        <div class="flex items-center mb-2">
                            <h3 class="text-xl font-bold text-gray-800 mr-3">Question ${index + 1}</h3>
                            <span class="text-sm font-medium text-gray-500">(${q.section.charAt(0).toUpperCase() + q.section.slice(1)})</span>
                        </div>
                        <p class="text-lg font-semibold text-gray-800">${q.question}</p>
                        ${q.options ? `<p class="text-sm text-gray-600 mt-2">Options: ${q.options.join(", ")}</p>` : ""}
                    </div>
                    
                    <div class="bg-${getAnswerColor(q)}-50 border-${getAnswerColor(q)}-200 p-4 rounded-md mb-3">
                        <p class="text-sm font-medium text-${getAnswerColor(q)}-700">Candidate's Answer:</p>
                        <p class="text-${getAnswerColor(q)}-900">${q.candidateAnswer || "No answer provided"}</p>
                    </div>
                    
                    ${
                      q.correctAnswer
                        ? `
                    <div class="bg-green-50 border border-green-200 p-4 rounded-md">
                        <p class="text-sm font-medium text-green-700">Expected Answer:</p>
                        <p class="text-green-900">${q.correctAnswer}</p>
                    </div>
                    `
                        : ""
                    }
                </div>
                `,
                  )
                  .join("")}
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center text-sm text-gray-500 border-t pt-6 mt-8">
            <p>This report was automatically generated on ${formatDate(submittedAt)} at ${submittedAt.toLocaleTimeString()}</p>
            <p class="mt-1">Report ID: ${submissionId} | Confidential - For Internal Use Only</p>
        </footer>
    </div>
</body>
</html>`
}

function getAnswerColor(question: QuestionAnalysis): string {
  if (question.section === "concepts") return "blue" // Subjective questions
  if (!question.candidateAnswer) return "gray" // No answer
  return question.isCorrect ? "green" : "red" // Correct/incorrect
}

function analyzeExamPerformance(examData: ExamData) {
  const mcCompleted = Object.keys(examData.multipleChoice).length
  const conceptsCompleted = Object.values(examData.concepts).filter((v) => v.trim().length > 0).length
  const calculationsCompleted = Object.values(examData.calculations).filter((v) => v.trim().length > 0).length
  const totalCompleted = mcCompleted + conceptsCompleted + calculationsCompleted
  const completionRate = (totalCompleted / 5) * 100

  // Time efficiency calculation (assuming 30 minutes total)
  const timeEfficiency = completionRate >= 80 ? "Excellent" : completionRate >= 60 ? "Good" : "Needs Improvement"
  const timeEfficiencyScore = completionRate >= 80 ? 90 : completionRate >= 60 ? 70 : 40

  const overallScore = (completionRate + timeEfficiencyScore) / 2

  let recommendation
  if (overallScore >= 75) {
    recommendation = {
      level: "Strong Candidate",
      summary:
        "Demonstrates strong technical knowledge and problem-solving abilities. Highly recommended for next round.",
      nextSteps: "Schedule technical interview with senior engineer.",
      bgColor: "green-50",
      borderColor: "green-500",
      textColor: "green-800",
      dotColor: "green-500",
    }
  } else if (overallScore >= 50) {
    recommendation = {
      level: "Moderate Candidate",
      summary: "Shows potential but may need additional evaluation. Consider experience level and role requirements.",
      nextSteps: "Review answers in detail and consider phone screening.",
      bgColor: "yellow-50",
      borderColor: "yellow-500",
      textColor: "yellow-800",
      dotColor: "yellow-500",
    }
  } else {
    recommendation = {
      level: "Needs Review",
      summary: "Low completion rate or significant gaps. May not meet current technical requirements.",
      nextSteps: "Consider if candidate meets minimum qualifications for role.",
      bgColor: "red-50",
      borderColor: "red-500",
      textColor: "red-800",
      dotColor: "red-500",
    }
  }

  return {
    totalCompleted,
    completionRate,
    timeEfficiency,
    timeEfficiencyScore,
    overallScore,
    recommendation,
    sections: {
      multipleChoice: { completed: mcCompleted, total: 2, percentage: (mcCompleted / 2) * 100 },
      concepts: { completed: conceptsCompleted, total: 2, percentage: (conceptsCompleted / 2) * 100 },
      calculations: { completed: calculationsCompleted, total: 1, percentage: (calculationsCompleted / 1) * 100 },
    },
  }
}

function getQuestionAnalysis(examData: ExamData): QuestionAnalysis[] {
  const questions: QuestionAnalysis[] = []

  // Multiple Choice Questions
  questions.push({
    id: "mc-q1",
    question: "Which of the following materials has the highest tensile strength?",
    candidateAnswer: examData.multipleChoice["mc-q1"] || "",
    isCorrect: examData.multipleChoice["mc-q1"] === "Carbon Fiber",
    correctAnswer: "Carbon Fiber",
    section: "multipleChoice",
    difficulty: 1,
    options: ["Structural Steel", "Titanium Alloy", "Carbon Fiber", "Aluminum 6061"],
  })

  questions.push({
    id: "mc-q2",
    question: "What does the 'E' in Young's Modulus (E) represent?",
    candidateAnswer: examData.multipleChoice["mc-q2"] || "",
    isCorrect: examData.multipleChoice["mc-q2"] === "Elasticity",
    correctAnswer: "Elasticity",
    section: "multipleChoice",
    difficulty: 1,
    options: ["Elasticity", "Elongation", "Energy", "Entropy"],
  })

  // Concept Questions
  questions.push({
    id: "concept-q1",
    question: "Explain the concept of Factor of Safety (FOS) in mechanical design and why it is important.",
    candidateAnswer: examData.concepts["concept-q1"] || "",
    isCorrect: false, // Subjective, requires manual review
    section: "concepts",
    difficulty: 2,
  })

  questions.push({
    id: "concept-q2",
    question: "What is the primary difference between fatigue and static failure in a material?",
    candidateAnswer: examData.concepts["concept-q2"] || "",
    isCorrect: false, // Subjective, requires manual review
    section: "concepts",
    difficulty: 2,
  })

  // Calculation Question
  questions.push({
    id: "calc-q1",
    question:
      "A steel beam with a cross-sectional area of 0.5 m² is subjected to a tensile force of 500 kN. Calculate the stress in the beam in megapascals (MPa).",
    candidateAnswer: examData.calculations["calc-q1"] || "",
    isCorrect: examData.calculations["calc-q1"] === "1" || examData.calculations["calc-q1"] === "1.0",
    correctAnswer: "1.0 MPa (Stress = Force/Area = 500,000 N / 0.5 m² = 1,000,000 Pa = 1.0 MPa)",
    section: "calculations",
    difficulty: 2,
  })

  return questions
}
