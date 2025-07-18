import { CheckCircle, Clock, FileText, User, Trophy } from "lucide-react"
import type { Stage } from "../page"

interface ProgressTrackerProps {
  currentStage: Stage
}

export default function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  const stages = [
    { id: "welcome", label: "Welcome", icon: Clock },
    { id: "bio", label: "Information", icon: User },
    { id: "exam", label: "Assessment", icon: FileText },
    { id: "submission", label: "Complete", icon: Trophy },
  ]

  const getCurrentStageIndex = () => {
    return stages.findIndex((stage) => stage.id === currentStage)
  }

  const currentIndex = getCurrentStageIndex()

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isLast = index === stages.length - 1

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Circle and Label */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium whitespace-nowrap ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>

                {/* Connector Line - Only show if not the last item */}
                {!isLast && (
                  <div className="flex-shrink-0 mx-4 w-16 sm:w-20 md:w-24">
                    <div className={`h-0.5 transition-all ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Current Stage Description */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {currentStage === "welcome" && "Welcome to the Technical Assessment"}
            {currentStage === "bio" && "Please provide your information to continue"}
            {currentStage === "exam" && "Complete the technical assessment"}
            {currentStage === "submission" && "Assessment completed successfully"}
          </p>
        </div>
      </div>
    </div>
  )
}
