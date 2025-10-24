import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Sparkles,
  Download,
  History,
  Settings,
  LogOut,
  FileImage,
  Cpu,
  Palette,
  StickyNote,
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get recent designs
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/smart-design-logo.png" alt="Smart Design AI" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">Smart Design by MSB07</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.display_name || data.user.email}</span>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to your AI Design Studio</h1>
          <p className="text-muted-foreground">
            Transform your images into PCB layouts, 3D printable files, and fabric patterns with advanced AI.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Upload Your Design or External Image</CardTitle>
            <CardDescription className="text-lg">
              Transform any image into professional formats with AI-powered conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <FileImage className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold">Drop your design here</p>
                  <p className="text-muted-foreground">or click to browse files</p>
                  <p className="text-sm text-muted-foreground mt-2">Supports JPG, PNG, WebP, SVG • Max 10MB</p>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/dashboard/upload">
                    <Upload className="w-5 h-5 mr-2" />
                    Select Image
                  </Link>
                </Button>
              </div>
            </div>

            {/* Output Format Selection */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">PCB Layout</CardTitle>
                  <CardDescription className="text-sm">Convert to circuit board design</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-green-500 transition-colors cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">3D Printable (.STL)</CardTitle>
                  <CardDescription className="text-sm">Generate 3D model file</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Fabric Pattern (.OBJ)</CardTitle>
                  <CardDescription className="text-sm">Create textile design</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Convert Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                asChild
              >
                <Link href="/dashboard/upload">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Convert with AI
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Upload & Transform</CardTitle>
              <CardDescription className="text-sm">Upload images for AI processing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm" asChild>
                <Link href="/dashboard/upload">Start Creating</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <CardDescription className="text-sm">Chat with design AI</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" size="sm" variant="outline" asChild>
                <Link href="/dashboard/assistant">Open Assistant</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Design History</CardTitle>
              <CardDescription className="text-sm">View past projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" size="sm" variant="outline" asChild>
                <Link href="/dashboard/history">View History</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">My Notes</CardTitle>
              <CardDescription className="text-sm">Save design ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" size="sm" variant="outline" asChild>
                <Link href="/dashboard/notes">View Notes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* File Preview & Download Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                File Preview
              </CardTitle>
              <CardDescription>Preview your converted designs before download</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Upload a file to see preview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download File
              </CardTitle>
              <CardDescription>Download your processed designs in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  STL File
                </Button>
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  PCB Layout
                </Button>
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  OBJ File
                </Button>
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  PNG Image
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">Process a design to enable downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Designs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Designs</h2>
            <Button variant="outline" asChild>
              <Link href="/dashboard/history">View All</Link>
            </Button>
          </div>

          {designs && designs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card key={design.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{design.title}</CardTitle>
                      <Badge variant={design.status === "completed" ? "default" : "secondary"}>{design.status}</Badge>
                    </div>
                    <CardDescription>{design.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(design.created_at).toLocaleDateString()}
                      </span>
                      {design.status === "completed" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/history">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first AI-powered design project</p>
                <Button asChild>
                  <Link href="/dashboard/upload">Create Your First Design</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
