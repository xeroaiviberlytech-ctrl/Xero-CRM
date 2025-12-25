"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured. Please check your .env.local file and restart the dev server.")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        throw error
      }

      if (data?.session) {
        toast.success("Logged in successfully!")
        // Wait a moment for cookies to be set, then redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 200)
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      const errorMessage = error.message || error.toString() || "Failed to login"
      
      // Provide more helpful error messages
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast.error("Network error. Please check your Supabase URL and internet connection.")
      } else if (errorMessage.includes("Invalid login credentials")) {
        toast.error("Invalid email or password")
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to your Xero CRM account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                className="bg-white/40 dark:bg-slate-800/40 text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full glass-strong border-white/30 dark:border-slate-700/30"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

