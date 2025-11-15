"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIProcessingDisplay } from "@/components/ai-processing-display"
import { Upload, ArrowLeft, ImageIcon, Sparkles, CheckCircle, AlertCircle, Cpu, Palette, Download } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface UploadState {
  status: "idle" | "uploading" | "processing" | "completed" | "error"
  progress: number
  message: string
  designId?: string
  downloadUrl?: string
}

type OutputFormat = "PCB Layout" | "3D Printable File (.STL)" | "Fabric Pattern (.OBJ)"

const formatOptions = {
  "PCB Layout": {
    label: "PCB Layout",
    icon: Cpu,
    description: "Convert to circuit board design using Flux.ai",
    color: "blue",
  },
  "3D Printable File (.STL)": {
    label: "3D Printable File (.STL)",
    icon: Sparkles,
    description: "Generate 3D model using Alpha3D for 3D printing",
    color: "green",
  },
  "Fabric Pattern (.OBJ)": {
    label: "Fabric Pattern (.OBJ)",
    icon: Palette,
    description: "Create textile design using Hyper3D",
    color: "purple",
  },
}

export default function UploadPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("PCB Layout")
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
        message: `Invalid file type: ${file.type}. Please select an image file (JPG, PNG, WebP, GIF, BMP).`,
      })
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadState({
        status: "error",
        progress: 0,
        message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit. Please compress your image and try again.`,
      })
      return
    }

    setSelectedFile(file)
    setUploadState({ status: "idle", progress: 0, message: "" })

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setPreviewUrl(imageData)
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

  const handleUpload = async () => {
    if (!selectedFile || !user || !title.trim()) return

    setUploadState({
      status: "uploading",
      progress: 10,
      message: "Validating file...",
    })

    try {
      const supabase = createClient()
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("outputFormat", outputFormat)
      formData.append("prompt", aiPrompt.trim() || `Convert to ${outputFormat}`)

      setUploadState({
        status: "uploading",
        progress: 30,
        message: "Uploading file...",
      })

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}: Conversion failed`)
      }

      const result = await response.json()

      setUploadState({
        status: "processing",
        progress: 60,
        message: `Processing with ${outputFormat}...`,
      })

      setUploadState({
        status: "processing",
        progress: 85,
        message: "Optimizing output...",
      })

      // Save to database
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          ai_prompt: aiPrompt.trim() || null,
          original_image_url: previewUrl,
          processed_image_url: result.downloadUrl,
          status: "completed",
          conversion_type: outputFormat,
        })
        .select()
        .single()

      if (designError) throw designError

      setUploadState({
        status: "completed",
        progress: 100,
        message: result.message || `${outputFormat} generated successfully!`,
        designId: design.id,
        downloadUrl: result.downloadUrl,
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadState({
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Failed to upload and process your design. Please try again.",
      })
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setTitle("")
    setDescription("")
    setAiPrompt("")
    setUploadState({ status: "idle", progress: 0, message: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
              <CardDescription>Your {outputFormat.toLowerCase()} is ready for download.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <a href={uploadState.downloadUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download {outputFormat}
                </a>
              </Button>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/history">View History</Link>
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
                <CardTitle>Upload Your Design</CardTitle>
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload design file"
                />

                <div className="space-y-3">
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                    <SelectTrigger id="output-format">
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
              </CardContent>
            </Card>

            {/* Enhanced AI processing display component */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Processing
                </CardTitle>
                <CardDescription>Your image will be converted using advanced AI algorithms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AIProcessingDisplay
                  status={uploadState.status}
                  progress={uploadState.progress}
                  message={uploadState.message}
                  format={outputFormat}
                />

                {selectedFile && uploadState.status === "idle" && !uploadState.message && (
                  <Button onClick={handleUpload} className="w-full" disabled={!title.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Convert with AI
                  </Button>
                )}

                {uploadState.status === "error" && (
                  <Button onClick={resetUpload} variant="outline" className="w-full">
                    Try Again
                  </Button>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-sm">AI Conversion Features:</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                    <div>• Smart format detection</div>
                    <div>• Context-aware processing</div>
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
