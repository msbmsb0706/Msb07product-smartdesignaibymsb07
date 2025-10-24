"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Send,
  User,
  Zap,
  Settings,
  HelpCircle,
  FileImage,
  Cpu,
  Palette,
  Wrench,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  toolResults?: any[]
  usage?: any
}

interface AIAssistantProps {
  imageData?: string
  outputFormat?: string
}

const quickActions = [
  { icon: FileImage, label: "Analyze Design", prompt: "Analyze my current design and provide insights" },
  { icon: Cpu, label: "PCB Tips", prompt: "Give me tips for optimizing PCB layout" },
  { icon: Palette, label: "Color Advice", prompt: "Suggest color schemes for fabric patterns" },
  { icon: Wrench, label: "Troubleshoot", prompt: "Help me troubleshoot conversion issues" },
  { icon: Lightbulb, label: "Optimize", prompt: "How can I optimize my design for better results?" },
  { icon: TrendingUp, label: "Best Practices", prompt: "What are the best practices for my current format?" },
]

export function AIAssistant({ imageData, outputFormat }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your advanced AI design assistant. I can help you with:\n\n🔧 **Design Analysis** - Analyze PCB layouts, 3D models, and fabric patterns\n🔄 **Format Conversion** - Guide you through conversion processes\n🛠️ **Troubleshooting** - Solve common design issues\n💡 **Optimization** - Improve your designs for better results\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          imageData,
          outputFormat,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response || "I'm sorry, I couldn't process your request right now.",
        timestamp: new Date(),
        toolResults: data.toolResults,
        usage: data.usage,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI Assistant error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I'm experiencing some technical difficulties. Please try again later. If the problem persists, check your internet connection or refresh the page.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        type: "assistant",
        content: "Chat cleared! How can I help you with your design project?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Design Assistant
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Advanced
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Context Info */}
        {(imageData || outputFormat) && (
          <div className="flex gap-2 mt-2">
            {imageData && (
              <Badge variant="outline" className="text-xs">
                <FileImage className="h-3 w-3 mr-1" />
                Image Loaded
              </Badge>
            )}
            {outputFormat && (
              <Badge variant="outline" className="text-xs">
                Format: {outputFormat}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="justify-start text-xs h-8"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Chat Messages */}
        <ScrollArea className="h-80 w-full rounded-md border border-border/50 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-primary" : "bg-accent"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                    {/* Tool Results Display */}
                    {message.toolResults && message.toolResults.length > 0 && isAdvancedMode && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <div className="text-xs opacity-70 mb-1">Tool Results:</div>
                        {message.toolResults.map((result, index) => (
                          <div key={index} className="text-xs bg-background/20 rounded p-2 mb-1">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Usage Info */}
                    {message.usage && isAdvancedMode && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <div className="text-xs opacity-70">
                          Tokens: {message.usage.totalTokens} | Time:{" "}
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    )}

                    {!isAdvancedMode && (
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="bg-muted text-muted-foreground rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about design analysis, conversion tips, troubleshooting..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="bg-background/50"
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !inputMessage.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
            {isLoading ? "Processing..." : "Ready"}
          </div>
          <div>{messages.length - 1} messages</div>
        </div>
      </CardContent>
    </Card>
  )
}
