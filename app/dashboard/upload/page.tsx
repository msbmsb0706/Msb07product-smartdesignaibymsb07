"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ArrowLeft, ImageIcon, Sparkles, CheckCircle, AlertCircle, Cpu, Palette, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UploadState {
  status: "idle" | "uploading" | "processing" | "completed" | "error"
  progress: number
  message: string
  designId?: string
}

type OutputFormat = "pcb" | "stl" | "fabric"

const formatOptions = {
  pcb: { label: "PCB Layout", icon: Cpu, description: "Convert to circuit board design using Flux.ai", color: "blue" },
  stl: {
    label: "3D Printable File (.STL)",
    icon: Sparkles,
    description: "Generate 3D model using Alpha3D",
    color: "green",
  },
  fabric: {
    label: "Fabric Pattern (.OBJ)",
    icon: Palette,
    description: "Create textile design using Hyper3D",
    color: "purple",
  },
}

const mockFluxAI = async (imageData: string, prompt: string) => {
  // Simulate Flux.ai PCB layout generation
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    success: true,
    result_url: `/placeholder.svg?height=400&width=600&query=PCB layout design`,
    analysis: "Detected electronic components and traces. Generated optimized PCB layout with proper routing.",
  }
}

const mockAlpha3D = async (imageData: string, prompt: string) => {
  // Simulate Alpha3D 3D model generation
  await new Promise((resolve) => setTimeout(resolve, 2500))
  return {
    success: true,
    result_url: `/placeholder.svg?height=400&width=600&query=3D printable model`,
    analysis: "Analyzed image depth and structure. Generated printable 3D model with proper support structures.",
  }
}

const mockHyper3D = async (imageData: string, prompt: string) => {
  // Simulate Hyper3D fabric pattern generation
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    success: true,
    result_url: `/placeholder.svg?height=400&width=600&query=fabric pattern design`,
    analysis: "Extracted pattern elements and textures. Created seamless fabric design with proper repeat.",
  }
}

const performOCR = async (imageData: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    text: "Sample OCR text extracted from image",
    confidence: 0.95,
    elements: ["Text element 1", "Text element 2", "Diagram labels"],
  }
}

export default function UploadPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("pcb")
  const [ocrResults, setOcrResults] = useState<any>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    message: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    }
    checkUser()
  }, [router])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "File not supported. Please select a valid image file (JPG, PNG, WebP, SVG).",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "File size must be less than 10MB. Please compress your image and try again.",
      })
      return
    }

    setSelectedFile(file)
    setUploadState({ status: "idle", progress: 0, message: "" })

    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      setPreviewUrl(imageData)

      try {
        setUploadState({ status: "processing", progress: 10, message: "Analyzing image content..." })
        const ocr = await performOCR(imageData)
        setOcrResults(ocr)
        setUploadState({ status: "idle", progress: 0, message: "" })
      } catch (error) {
        console.error("OCR analysis failed:", error)
      }
    }
    reader.readAsDataURL(file)

    // Auto-generate title from filename
    if (!title) {
      const fileName = file.name.split(".")[0]
      setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const simulateAIProcessing = async (designId: string, format: OutputFormat, imageData: string, prompt: string) => {
    const formatConfig = formatOptions[format]

    try {
      setUploadState({
        status: "processing",
        progress: 20,
        message: `Connecting to ${format === "pcb" ? "Flux.ai" : format === "stl" ? "Alpha3D" : "Hyper3D"} API...`,
        designId,
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUploadState({
        status: "processing",
        progress: 40,
        message: "Analyzing image structure and content...",
        designId,
      })

      let result
      switch (format) {
        case "pcb":
          result = await mockFluxAI(imageData, prompt)
          break
        case "stl":
          result = await mockAlpha3D(imageData, prompt)
          break
        case "fabric":
          result = await mockHyper3D(imageData, prompt)
          break
      }

      setUploadState({
        status: "processing",
        progress: 80,
        message: `Generating ${formatConfig.label.toLowerCase()}...`,
        designId,
      })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update design in database
      const supabase = createClient()
      await supabase
        .from("designs")
        .update({
          status: "completed",
          processed_image_url: result.result_url,
          ai_prompt: `${prompt} | Format: ${formatConfig.label} | Analysis: ${result.analysis}`,
        })
        .eq("id", designId)

      setUploadState({
        status: "completed",
        progress: 100,
        message: `${formatConfig.label} generated successfully!`,
        designId,
      })
    } catch (error) {
      console.error("AI processing error:", error)
      setUploadState({
        status: "error",
        progress: 0,
        message: "AI conversion failed. Please try a different image or format.",
        designId,
      })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) return

    setUploadState({
      status: "uploading",
      progress: 10,
      message: "Uploading your image...",
    })

    try {
      const supabase = createClient()

      // Create design record
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          ai_prompt: aiPrompt.trim() || null,
          original_image_url: previewUrl,
          status: "processing",
        })
        .select()
        .single()

      if (designError) throw designError

      // Start AI processing
      await simulateAIProcessing(
        design.id,
        outputFormat,
        previewUrl!,
        aiPrompt.trim() || `Convert to ${formatOptions[outputFormat].label}`,
      )
    } catch (error) {
      console.error("Upload error:", error)
      setUploadState({
        status: "error",
        progress: 0,
        message: "Failed to upload and process your design. Please try again.",
      })
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setTitle("")
    setDescription("")
    setAiPrompt("")
    setOcrResults(null)
    setUploadState({ status: "idle", progress: 0, message: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <img src="/images/smart-design-logo.png" alt="Smart Design AI" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold">Upload & Transform</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {uploadState.status === "completed" ? (
          // Success State
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">AI Conversion Complete!</CardTitle>
              <CardDescription>
                Your {formatOptions[outputFormat].label.toLowerCase()} is ready for download.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href={`/dashboard/history`}>View & Download</Link>
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Convert Another
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Design or External Image</CardTitle>
                <CardDescription>Upload an image to transform it with AI-powered conversion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    selectedFile
                      ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                <div className="space-y-3">
                  <Label>Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formatOptions).map(([key, option]) => {
                        const Icon = option.icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{formatOptions[outputFormat].description}</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Design Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your design"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your design project (optional)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="aiPrompt">AI Enhancement Instructions</Label>
                    <Textarea
                      id="aiPrompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={`Tell the AI how to optimize your ${formatOptions[outputFormat].label.toLowerCase()}`}
                      rows={3}
                    />
                  </div>
                </div>

                {ocrResults && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Image Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs">
                        <strong>Detected Text:</strong> {ocrResults.text}
                      </div>
                      <div className="text-xs">
                        <strong>Confidence:</strong> {(ocrResults.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs">
                        <strong>Elements:</strong> {ocrResults.elements.join(", ")}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Processing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Processing
                </CardTitle>
                <CardDescription>Your image will be converted using advanced AI algorithms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uploadState.status === "idle" && !uploadState.message && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Upload an image to start AI processing</p>
                  </div>
                )}

                {uploadState.status === "error" && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 text-sm">{uploadState.message}</p>
                    <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={resetUpload}>
                      Try Again
                    </Button>
                  </div>
                )}

                {(uploadState.status === "uploading" || uploadState.status === "processing") && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        {uploadState.status === "uploading" ? "Uploading" : "Processing"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{uploadState.message}</p>
                    </div>
                    <Progress value={uploadState.progress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">{uploadState.progress}% complete</p>
                  </div>
                )}

                {selectedFile && uploadState.status === "idle" && !uploadState.message && (
                  <Button onClick={handleUpload} className="w-full" disabled={!title.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Convert with AI
                  </Button>
                )}

                {/* Processing Features */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm">AI Conversion Features:</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                    <div>• Smart format detection</div>
                    <div>• Context-aware processing</div>
                    <div>• OCR text analysis</div>
                    <div>• Intelligent optimization</div>
                    <div>• Error handling & validation</div>
                    <div>• Multi-format export</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
