import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smart-design-logo-Np0i85MkesGF6ZWslK73rENRHmbtIl.png"
                alt="Smart Design AI"
                className="w-8 h-8"
              />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              You&apos;ve successfully signed up for Smart Design by MSB07. Please check your email to confirm your
              account before signing in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
