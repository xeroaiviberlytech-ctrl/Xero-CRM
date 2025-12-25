import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ""

// Validate URL format - check for placeholder values
const hasPlaceholder = supabaseUrl.includes("xxxxx") || 
  supabaseUrl.includes("your-project") ||
  supabaseUrl.includes("[YOUR-PROJECT-REF]")

const isValidUrl = supabaseUrl && 
  supabaseUrl.startsWith("https://") && 
  supabaseUrl.includes(".supabase.co") &&
  !hasPlaceholder

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey.length > 50 && 
  supabaseAnonKey.startsWith("eyJ") &&
  !supabaseAnonKey.includes("your-actual-key") &&
  !supabaseAnonKey.includes("your-supabase-anon-key")

// Only create client if env vars are available and valid (for build-time safety)
// Use createBrowserClient from @supabase/ssr to ensure cookies are properly synced
export const supabase = isValidUrl && isValidKey
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (null as any) // Type assertion for build-time safety

// Log configuration status in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!supabase) {
    console.warn("⚠️ Supabase client not initialized!")
    console.warn("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? `Set (${supabaseUrl.substring(0, 50)}...)` : "Missing")
    console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "Missing")
    console.warn("URL valid:", isValidUrl)
    console.warn("Key valid:", isValidKey)
    if (hasPlaceholder) {
      console.warn("❌ URL contains placeholder. Please replace with your actual Supabase project URL!")
    }
    if (supabaseAnonKey.includes("your-actual-key") || supabaseAnonKey.includes("your-supabase-anon-key")) {
      console.warn("❌ Key contains placeholder. Please replace with your actual Supabase anon key!")
    }
    console.warn("Please check your .env.local file and restart the dev server.")
    console.warn("See SUPABASE_SETUP.md for detailed setup instructions.")
  } else {
    console.log("✅ Supabase client initialized successfully")
  }
}
