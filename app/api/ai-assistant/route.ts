import { generateText, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

const designAnalysisTool = tool({
  description: "Analyze design files and provide insights about PCB layouts, 3D models, or fabric patterns",
  inputSchema: z.object({
    imageData: z.string().optional(),
    outputFormat: z.string().optional(),
    analysisType: z.enum(["pcb", "3d", "fabric", "general"]),
  }),
  execute: async ({ imageData, outputFormat, analysisType }) => {
    // Simulate design analysis
    const insights = {
      pcb: {
        components: ["Resistors", "Capacitors", "ICs", "Connectors"],
        layers: 4,
        complexity: "Medium",
        recommendations: ["Optimize trace routing", "Add ground planes", "Consider component placement"],
      },
      "3d": {
        printability: "Good",
        supportNeeded: true,
        estimatedTime: "2.5 hours",
        recommendations: ["Add support structures", "Check overhangs", "Optimize infill"],
      },
      fabric: {
        pattern: "Geometric",
        complexity: "High",
        colors: 4,
        recommendations: ["Use high-contrast colors", "Consider fabric stretch", "Test print quality"],
      },
      general: {
        quality: "High",
        format: outputFormat || "Unknown",
        recommendations: ["Good design structure", "Consider optimization opportunities"],
      },
    }

    return insights[analysisType] || insights.general
  },
})

const conversionTool = tool({
  description: "Provide guidance on converting between different design formats",
  inputSchema: z.object({
    fromFormat: z.string(),
    toFormat: z.string(),
    complexity: z.enum(["simple", "medium", "complex"]).optional(),
  }),
  execute: async ({ fromFormat, toFormat, complexity = "medium" }) => {
    const conversionGuide = {
      steps: [
        `Prepare ${fromFormat} file for conversion`,
        `Apply format-specific preprocessing`,
        `Execute conversion algorithm`,
        `Post-process ${toFormat} output`,
        "Validate conversion quality",
      ],
      estimatedTime: complexity === "simple" ? "30 seconds" : complexity === "medium" ? "2 minutes" : "5 minutes",
      successRate: complexity === "simple" ? "98%" : complexity === "medium" ? "95%" : "90%",
      tips: ["Ensure high-resolution input", "Check file format compatibility", "Review output quality settings"],
    }

    return conversionGuide
  },
})

const troubleshootingTool = tool({
  description: "Help troubleshoot common design conversion issues",
  inputSchema: z.object({
    issue: z.string(),
    errorType: z.enum(["conversion", "quality", "format", "performance"]).optional(),
  }),
  execute: async ({ issue, errorType = "conversion" }) => {
    const solutions = {
      conversion: [
        "Check input file format compatibility",
        "Verify file is not corrupted",
        "Try reducing image complexity",
        "Ensure sufficient system resources",
      ],
      quality: [
        "Increase input resolution",
        "Adjust conversion parameters",
        "Use higher quality settings",
        "Check source image quality",
      ],
      format: [
        "Verify supported output formats",
        "Check file extension accuracy",
        "Ensure proper format specifications",
        "Try alternative format options",
      ],
      performance: [
        "Reduce image size if too large",
        "Close unnecessary applications",
        "Check available memory",
        "Try processing in smaller batches",
      ],
    }

    return {
      issue,
      solutions: solutions[errorType],
      additionalHelp: "If issues persist, try refreshing the page or contact support",
    }
  },
})

export async function POST(req: Request) {
  try {
    const { message, imageData, outputFormat } = await req.json()

    const result = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert AI assistant for Smart Design AI, specializing in:
          - PCB layout design and analysis
          - 3D printing and modeling
          - Fabric pattern design
          - Image format conversion
          - Design optimization and troubleshooting
          
          You have access to tools for design analysis, conversion guidance, and troubleshooting.
          Always provide helpful, accurate, and actionable advice.
          
          Current context:
          - Image data available: ${imageData ? "Yes" : "No"}
          - Output format: ${outputFormat || "Not specified"}
          
          Be conversational, helpful, and technical when appropriate.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      tools: {
        designAnalysis: designAnalysisTool,
        conversionGuidance: conversionTool,
        troubleshooting: troubleshootingTool,
      },
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    return Response.json({
      response: result.text,
      toolResults: result.toolResults,
      usage: result.usage,
    })
  } catch (error) {
    console.error("AI Assistant API error:", error)
    return Response.json(
      {
        response: "I'm experiencing technical difficulties. Please try again in a moment.",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
