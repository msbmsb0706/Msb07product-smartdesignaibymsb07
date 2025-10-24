"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, StickyNote, LinkIcon, ImageIcon, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Note {
  id: string
  title: string
  content: string
  image_url?: string
  link_url?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const [user, setUser] = useState<any>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    link_url: "",
    tags: "",
  })
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
      loadNotes(user.id)
    }
    checkUser()
  }, [router])

  const loadNotes = async (userId: string) => {
    try {
      // Mock notes data since we don't have a notes table yet
      const mockNotes: Note[] = [
        {
          id: "1",
          title: "PCB Design Ideas",
          content: "Remember to add proper ground planes and consider signal integrity for high-speed traces.",
          image_url: "/pcb-design-sketch.jpg",
          link_url: "https://example.com/pcb-guidelines",
          tags: ["PCB", "Electronics", "Design"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "3D Printing Materials",
          content: "PLA for prototypes, PETG for functional parts, TPU for flexible components.",
          tags: ["3D Printing", "Materials"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setNotes(mockNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNote = async () => {
    try {
      const noteData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        id: editingNote?.id || Date.now().toString(),
        created_at: editingNote?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (editingNote) {
        setNotes((prev) => prev.map((note) => (note.id === editingNote.id ? (noteData as Note) : note)))
      } else {
        setNotes((prev) => [noteData as Note, ...prev])
      }

      setIsDialogOpen(false)
      setEditingNote(null)
      setFormData({ title: "", content: "", image_url: "", link_url: "", tags: "" })
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      image_url: note.image_url || "",
      link_url: note.link_url || "",
      tags: note.tags.join(", "),
    })
    setIsDialogOpen(true)
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
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
              <span className="text-xl font-bold">My Notes</span>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
                <DialogDescription>
                  Save your design ideas, links, and inspiration for future reference.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note content..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL (optional)</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Link URL (optional)</label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                    placeholder="https://example.com/reference"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="PCB, Electronics, Design"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote} disabled={!formData.title.trim()}>
                    {editingNote ? "Update" : "Save"} Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <StickyNote className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">Start saving your design ideas and inspiration</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {note.image_url && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <ImageIcon
                        src={note.image_url || "/placeholder.svg"}
                        alt={note.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>

                  {note.link_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                      <a
                        href={note.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        {note.link_url}
                      </a>
                    </div>
                  )}

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
