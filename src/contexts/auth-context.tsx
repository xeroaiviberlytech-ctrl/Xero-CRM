"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Skip if supabase client is not available
    if (!supabase) {
      console.warn("Supabase client not available - skipping auth initialization")
      setLoading(false)
      return
    }

    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session } }: { data: { session: any } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((error: any) => {
        console.error("Error getting session:", error)
        setLoading(false)
      })

    // Listen for auth changes with error handling
    let subscription: any = null
    try {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
        // Only refresh on SIGNED_IN or SIGNED_OUT events, not on every change
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          // Use a small delay to batch updates
          setTimeout(() => router.refresh(), 100)
        }
      })
      subscription = sub
    } catch (error: any) {
      console.error("Error setting up auth listener:", error)
      setLoading(false)
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          // Ignore unsubscribe errors
        }
      }
    }
  }, [router])

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error: any) {
        console.error("Error signing out:", error)
      }
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

