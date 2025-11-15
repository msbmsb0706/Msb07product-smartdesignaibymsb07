"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AIProcessingDisplayProps {
  status: "idle" | "uploading" | "processing" | "completed" | "error"
  progress: number
  message: string
  format?: string
}

const processingStages = [
  { name: "Validating", duration: 1 },
  { name: "Uploading", duration: 2 },
  { name: "AI Analysis", duration: 2.5 },
  { name: "Format Conversion", duration: 2.5 },
  { name: "Optimization", duration: 2 },
  { name: "Finalizing", duration: 1 },
]

export function AIProcessingDisplay({
  status,
  progress,
  message,
  format = "PCB Layout",
}: AIProcessingDisplayProps) {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    if (status === "processing" || status === "uploading") {
      const stageIndex = Math.floor((progress / 100) * processingStages.length)
      setCurrentStage(Math.min(stageIndex, processingStages.length - 1))
    }
  }, [progress, status])

  if (status === "idle") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">Upload an image to start AI processing</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">Conversion Error</p>
        <p className="text-red-600/80 dark:text-red-400/80 text-sm">{message}</p>
      </div>
    )
  }

  if (status === "completed") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-green-600 dark:text-green-400 font-medium mb-2">Conversion Complete!</p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            {status === "uploading" ? "Uploading" : "Processing"}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="w-full h-2" />

      {/* Processing Stages */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Processing Stages</p>
        <div className="grid grid-cols-2 gap-2">
          {processingStages.map((stage, index) => {
            const isActive = index === currentStage
            const isCompleted = index < currentStage
            const progressInStage = isActive
              ? ((progress - (index / processingStages.length) * 100) / (stage.duration / 11)) * 100
              : isCompleted
                ? 100
                : 0

            return (
              <div
                key={index}
                className={`p-2 rounded-lg border transition-all ${
                  isCompleted || isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : isActive ? (
                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-border/50" />
                  )}
                  <span className="text-xs font-medium">{stage.name}</span>
                </div>
                {isActive && (
                  <div className="h-1 bg-border/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(progressInStage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <p className="text-xs font-semibold text-foreground">AI Insights</p>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>✓ Analyzing image structure and components</div>
          <div>✓ Applying AI optimization algorithms</div>
          <div>✓ Converting to {format} format</div>
        </div>
      </div>
    </div>
  )
}
