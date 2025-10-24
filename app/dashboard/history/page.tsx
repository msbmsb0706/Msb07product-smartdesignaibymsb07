"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  MoreVertical,
  FileImage,
  Code,
  Palette,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Design {
  id: string
  title: string
  description: string | null
  original_image_url: string | null
  processed_image_url: string | null
  ai_prompt: string | null
  status: "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [designs, setDesigns] = useState<Design[]>([])
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
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
      loadDesigns(user.id)
    }
    checkUser()
  }, [router])

  const loadDesigns = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setDesigns(data || [])
      setFilteredDesigns(data || [])
    } catch (error) {
      console.error("Error loading designs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDesigns(designs)
    } else {
      const filtered = designs.filter(
        (design) =>
          design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          design.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredDesigns(filtered)
    }
  }, [searchQuery, designs])

  const handleDelete = async (designId: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("designs").delete().eq("id", designId)

      if (error) throw error

      setDesigns((prev) => prev.filter((d) => d.id !== designId))
    } catch (error) {
      console.error("Error deleting design:", error)
    }
  }

  const handleDownload = async (design: Design, format: "png" | "jpg" | "svg" | "pdf") => {
    try {
      // In a real app, this would generate the actual file
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // Set canvas size
      canvas.width = 1920
      canvas.height = 1080

      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#8b5cf6")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add title text
        ctx.fillStyle = "white"
        ctx.font = "bold 72px Arial"
        ctx.textAlign = "center"
        ctx.fillText(design.title, canvas.width / 2, canvas.height / 2)

        // Add subtitle
        ctx.font = "36px Arial"
        ctx.fillText("Smart Design by MSB07", canvas.width / 2, canvas.height / 2 + 100)
      }

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${design.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        },
        `image/${format === "jpg" ? "jpeg" : format}`,
      )
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download design. Please try again.")
    }
  }

  const handleExportCode = (design: Design) => {
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${design.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 800px;
            padding: 2rem;
        }
        h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        p {
            font-size: 1.5rem;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${design.title}</h1>
        <p>Smart Design by MSB07</p>
    </div>
</body>
</html>`

    const blob = new Blob([htmlCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${design.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "secondary"
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
              <span className="text-xl font-bold">Design History</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{designs.length} total designs</span>
            <span>{designs.filter((d) => d.status === "completed").length} completed</span>
          </div>
        </div>

        {/* Designs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No designs found" : "No designs yet"}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Start creating your first AI-powered design"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/dashboard/upload">Create Your First Design</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{design.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {design.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(design.status)}>{design.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Image Preview */}
                  {design.processed_image_url || design.original_image_url ? (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={design.processed_image_url || design.original_image_url || ""}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Eye className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* AI Prompt */}
                  {design.ai_prompt && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                      <strong>AI Prompt:</strong> {design.ai_prompt}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {design.status === "completed" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(design, "png")}>
                              <FileImage className="w-4 h-4 mr-2" />
                              PNG Image
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(design, "jpg")}>
                              <FileImage className="w-4 h-4 mr-2" />
                              JPG Image
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(design, "svg")}>
                              <Palette className="w-4 h-4 mr-2" />
                              SVG Vector
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCode(design)}>
                              <Code className="w-4 h-4 mr-2" />
                              HTML Code
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(design.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
