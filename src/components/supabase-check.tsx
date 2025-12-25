"use client"

import { useEffect, useState } from "react"

export function SupabaseCheck() {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Only check once
    if (checked) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Trim whitespace in case there are accidental spaces
    const url = supabaseUrl?.trim() || ""
    const key = supabaseAnonKey?.trim() || ""

    // Only log to console, don't show toast errors
    if (url && key) {
      console.log("✅ Supabase is properly configured!")
      console.log("NEXT_PUBLIC_SUPABASE_URL:", url.substring(0, 50) + "...")
      console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", key.substring(0, 30) + "...")
    } else {
      console.warn("⚠️ Supabase environment variables not found")
      console.warn("NEXT_PUBLIC_SUPABASE_URL:", url || "Not set")
      console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY:", key ? "Set" : "Not set")
      console.warn("This is OK if you're not using authentication yet.")
    }

    setChecked(true)
  }, [checked])

  return null
}

