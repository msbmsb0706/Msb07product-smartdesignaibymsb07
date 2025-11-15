"use client"

import type React from "react"
import { signUpAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Check, X } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"

interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push("At least 8 characters")
  }

  if (/[a-z]/.test(password)) {
    score += 20
  } else {
    feedback.push("One lowercase letter")
  }

  if (/[A-Z]/.test(password)) {
    score += 20
  } else {
    feedback.push("One uppercase letter")
  }

  if (/\d/.test(password)) {
    score += 20
  } else {
    feedback.push("One number")
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20
  } else {
    feedback.push("One special character")
  }

  return {
    score,
    feedback,
    isValid: score >= 80,
  }
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = checkPasswordStrength(password)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!passwordStrength.isValid) {
      setError("Password does not meet security requirements")
      setIsLoading(false)
      return
    }

    try {
      const result = await signUpAction(email, password, displayName)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign up"
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score < 40) return "bg-red-500"
    if (score < 60) return "bg-orange-500"
    if (score < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (score: number) => {
    if (score < 40) return "Weak"
    if (score < 60) return "Fair"
    if (score < 80) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">SD</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join Smart Design by MSB07</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName" className="font-medium">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength.score} className="flex-1 h-2" />
                      <Badge variant={passwordStrength.isValid ? "default" : "secondary"} className="text-xs">
                        {getStrengthText(passwordStrength.score)}
                      </Badge>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">Password must include:</p>
                        {passwordStrength.feedback.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-muted-foreground">
                            <X className="w-3 h-3 text-red-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="font-medium">
                  Repeat Password
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    disabled={isLoading}
                    className="border-slate-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    disabled={isLoading}
                  >
                    {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {repeatPassword && password !== repeatPassword && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <X className="w-3 h-3" />
                    <span>Passwords do not match</span>
                  </div>
                )}
                {repeatPassword && password === repeatPassword && password && (
                  <div className="flex items-center gap-2 text-xs text-green-500">
                    <Check className="w-3 h-3" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                disabled={isLoading || !passwordStrength.isValid}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
