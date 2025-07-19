"use client"

import { cn } from "@/lib/utils"
import type { Stage } from "../page"

interface ProgressTrackerProps {
  currentStage: Stage
}

const stages: { id: Stage; name: string }[] = [
  { id: "welcome", name: "Welcome" },
  { id: "bio", name: "Your Info" },
  { id: "exam", name: "Assessment" },
  { id: "submission", name: "Complete" },
]

export default function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  const currentStageIndex = stages.findIndex((s) => s.id === currentStage)

  return (
    <div className="w-full p-4 bg-white shadow-md">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                index <= currentStageIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500",
              )}
            >
              {index < currentStageIndex ? "✓" : index + 1}
            </div>
            <span className={cn("ml-2 font-semibold", index <= currentStageIndex ? "text-blue-600" : "text-gray-500")}>
              {stage.name}
            </span>
            {index < stages.length - 1 && (
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div
                  className={cn("h-1 bg-blue-600", index < currentStageIndex ? "w-full" : "w-0")}
                  style={{ transition: "width 0.5s" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
