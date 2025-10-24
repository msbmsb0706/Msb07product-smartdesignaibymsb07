"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Smart Design AI assistant. I can help you with design ideas, color suggestions, layout advice, and creative inspiration. What would you like to create today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate AI response - in a real app, this would call your AI service
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const aiResponse = generateAIResponse(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("color") || input.includes("colours")) {
      return "Great question about colors! For modern designs, I recommend using a cohesive color palette. Consider these approaches:\n\n• **Monochromatic**: Different shades of the same color for elegance\n• **Complementary**: Colors opposite on the color wheel for contrast\n• **Triadic**: Three evenly spaced colors for vibrancy\n\nFor your Smart Design projects, blues and purples work well for tech/AI themes, while earth tones create warmth and trust."
    }

    if (input.includes("layout") || input.includes("design") || input.includes("composition")) {
      return "Excellent! Layout is crucial for effective design. Here are some key principles:\n\n• **Rule of thirds**: Place important elements along imaginary grid lines\n• **White space**: Give your design room to breathe\n• **Hierarchy**: Use size, color, and position to guide the eye\n• **Alignment**: Keep elements organized and clean\n\nWhat type of design are you working on? I can provide more specific layout suggestions!"
    }

    if (input.includes("logo") || input.includes("branding")) {
      return "Logo and branding are essential for identity! Here's what makes a great logo:\n\n• **Simplicity**: Easy to recognize and remember\n• **Scalability**: Works at any size\n• **Relevance**: Reflects your brand's personality\n• **Timelessness**: Avoids trendy elements that quickly date\n\nFor Smart Design by MSB07, the circuit-pattern logo effectively communicates AI and technology. Would you like suggestions for your own branding?"
    }

    if (input.includes("upload") || input.includes("image") || input.includes("photo")) {
      return "Perfect! Image processing is one of my specialties. Here's how to get the best results:\n\n• **High resolution**: Upload images at least 1080p for best quality\n• **Good lighting**: Well-lit images process better\n• **Clear subject**: Make sure your main subject is clearly visible\n• **File formats**: JPG, PNG, and WebP work best\n\nOnce uploaded, I can help transform your image into professional designs, suggest improvements, or create variations. Ready to upload something?"
    }

    if (input.includes("help") || input.includes("what can you do")) {
      return "I'm here to help with all your design needs! Here's what I can assist with:\n\n🎨 **Design Advice**: Color palettes, layouts, typography\n🖼️ **Image Processing**: Transform and enhance your uploads\n💡 **Creative Ideas**: Brainstorm concepts and themes\n📱 **UI/UX**: Interface design and user experience\n🎯 **Branding**: Logo design and brand identity\n📊 **Templates**: Suggest layouts for different projects\n\nJust ask me anything about design, and I'll provide personalized suggestions!"
    }

    return "That's an interesting question! I'd love to help you with your design project. Could you tell me more about what you're trying to create? For example:\n\n• What type of design are you working on?\n• What's the purpose or goal?\n• Do you have any specific style preferences?\n• Are there any colors or themes you'd like to explore?\n\nThe more details you share, the better I can assist you with personalized design advice!"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
              <span className="text-xl font-bold">AI Design Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Smart Design AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/images/smart-design-logo.png" />
                        <AvatarFallback>
                          <Sparkles className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/images/smart-design-logo.png" />
                      <AvatarFallback>
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about design, colors, layouts, or anything creative..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
