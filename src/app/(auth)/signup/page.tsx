"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("🔍 Signup Debug Info:")
      console.log("Supabase URL configured:", !!supabaseUrl)
      console.log("Supabase Key configured:", !!supabaseKey)
      console.log("Supabase client available:", !!supabase)

      if (!supabase) {
        const errorMsg = !supabaseUrl || !supabaseKey
          ? "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file and restart the dev server."
          : "Supabase client failed to initialize. Please check your environment variables."
        console.error(errorMsg)
        throw new Error(errorMsg)
      }

      console.log("Attempting to sign up...")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        throw error
      }

      console.log("Signup successful:", data)
      toast.success("Account created! Please check your email to verify your account.")
      router.push("/login")
    } catch (error: any) {
      console.error("Signup failed:", error)
      console.error("Error type:", typeof error)
      console.error("Error message:", error?.message)
      console.error("Error stack:", error?.stack)

      const errorMessage = error?.message || error?.toString() || "Failed to create account"

      // Provide more helpful error messages
      if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
        toast.error(
          "Network error. Please verify:\n" +
          "1. Your Supabase URL is correct\n" +
          "2. Your Supabase project is active\n" +
          "3. Your internet connection is working\n" +
          "Check browser console for details."
        )
      } else if (errorMessage.includes("already registered") || errorMessage.includes("already been registered")) {
        toast.error("This email is already registered. Please sign in instead.")
      } else if (errorMessage.includes("not configured")) {
        toast.error(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-silver border-white/30 dark:border-slate-700/30 w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img src="/images/logo.png" alt="Xero CRM" className="w-full h-full object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign up to get started with Xero CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full glass-strong border-white/30 dark:border-slate-700/30"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

