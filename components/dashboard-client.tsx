"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Upload,
  FileImage,
  Cpu,
  Layers3,
  Shirt,
  Download,
  LogOut,
  History,
  StickyNote,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Share2,
  Eye,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import Link from "next/link"

interface DashboardClientProps {
  user: any
  profile: any
}

type OutputFormat = "PCB Layout" | "3D Printable File (.STL)" | "Fabric Pattern (.OBJ)"

export function DashboardClient({ user, profile }: DashboardClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat | "">("")
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [conversionResult, setConversionResult] = useState<{
    status: "success" | "error"
    message: string
    downloadUrl?: string
    analysisDetails?: string
  } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setConversionResult(null)
      setShowAnalysis(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleShare = async () => {
    if (!conversionResult?.downloadUrl) return

    try {
      await navigator.share({
        title: `Smart Design AI - ${outputFormat} Conversion`,
        text: `Check out my ${outputFormat} conversion created with Smart Design AI!`,
        url: window.location.href,
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleConversion = async () => {
    if (!selectedFile || !outputFormat) return

    setIsConverting(true)
    setConversionProgress(0)
    setConversionResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("outputFormat", outputFormat)

      const progressInterval = setInterval(() => {
        setConversionProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15 + 5
        })
      }, 800)

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setConversionProgress(100)

      const result = await response.json()

      if (result.success) {
        setConversionResult({
          status: "success",
          message: result.message,
          downloadUrl: result.downloadUrl,
          analysisDetails: result.analysisDetails,
        })
      } else {
        setConversionResult({
          status: "error",
          message: result.error || "Conversion failed. Please try a different image or check your internet connection.",
        })
      }
    } catch (error) {
      console.error("Conversion error:", error)
      setConversionResult({
        status: "error",
        message:
          "Network error. Please check your internet connection and try again. If the problem persists, try using a different image format.",
      })
    } finally {
      setIsConverting(false)
    }
  }

  const getFormatIcon = (format: OutputFormat) => {
    switch (format) {
      case "PCB Layout":
        return <Cpu className="h-5 w-5" />
      case "3D Printable File (.STL)":
        return <Layers3 className="h-5 w-5" />
      case "Fabric Pattern (.OBJ)":
        return <Shirt className="h-5 w-5" />
      default:
        return null
    }
  }

  const getFormatDescription = (format: OutputFormat) => {
    switch (format) {
      case "PCB Layout":
        return "PCB Layout Converter - Transforms circuit sketches into professional PCB layouts with optimized trace routing."
      case "3D Printable File (.STL)":
        return "3D Model Generator - Converts 2D designs into printable 3D models with proper mesh topology."
      case "Fabric Pattern (.OBJ)":
        return "Fabric Pattern Creator - Transforms designs into textile patterns with texture mapping."
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">Smart Design AI</span>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/history">
                <History className="h-4 w-4 mr-2" />
                My Designs
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/notes">
                <StickyNote className="h-4 w-4 mr-2" />
                Notes
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {profile?.display_name || "Designer"}!
            </h1>
            <p className="text-muted-foreground">
              Upload your design and convert it to the format you need with AI-powered precision.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  {selectedFile ? (
                    <div className="space-y-3">
                      <FileImage className="h-10 w-10 mx-auto text-primary" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {isDragActive ? "Drop your image here" : "Upload Your Design"}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Output Format</label>
                  <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Choose output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PCB Layout">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          PCB Layout
                        </div>
                      </SelectItem>
                      <SelectItem value="3D Printable File (.STL)">
                        <div className="flex items-center gap-2">
                          <Layers3 className="h-4 w-4" />
                          3D Printable File (.STL)
                        </div>
                      </SelectItem>
                      <SelectItem value="Fabric Pattern (.OBJ)">
                        <div className="flex items-center gap-2">
                          <Shirt className="h-4 w-4" />
                          Fabric Pattern (.OBJ)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Convert Button */}
                <Button
                  onClick={handleConversion}
                  disabled={!selectedFile || !outputFormat || isConverting}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Converting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Convert with AI
                    </div>
                  )}
                </Button>

                {/* Progress Bar */}
                {isConverting && (
                  <div className="space-y-2">
                    <Progress value={conversionProgress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      {Math.round(conversionProgress)}% complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>File Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Original Image</label>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                    </div>
                  </div>
                )}

                {/* Format Info */}
                {outputFormat && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getFormatIcon(outputFormat)}
                      <span className="font-medium text-foreground text-sm">{outputFormat}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{getFormatDescription(outputFormat)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results & Download Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Results & Download
                  {conversionResult?.status === "success" && (
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conversion Result */}
                {conversionResult && (
                  <div className="space-y-4">
                    <div
                      className={`p-3 rounded-lg border ${
                        conversionResult.status === "success"
                          ? "bg-green-500/10 border-green-500/20 text-green-500"
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {conversionResult.status === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="font-medium text-sm">
                          {conversionResult.status === "success" ? "Conversion Successful" : "Conversion Failed"}
                        </span>
                      </div>
                      <p className="text-xs">{conversionResult.message}</p>
                    </div>

                    {conversionResult.analysisDetails && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAnalysis(!showAnalysis)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showAnalysis ? "Hide" : "Show"} AI Analysis
                        </Button>
                        {showAnalysis && (
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                              {conversionResult.analysisDetails}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {conversionResult.status === "success" && conversionResult.downloadUrl && (
                      <Button className="w-full" size="lg" asChild>
                        <a href={conversionResult.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download {outputFormat}
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
