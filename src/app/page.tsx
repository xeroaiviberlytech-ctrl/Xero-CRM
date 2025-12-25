import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/login")
    }
  } catch (error) {
    // If Supabase is not configured, redirect to login
    redirect("/login")
  }
}
