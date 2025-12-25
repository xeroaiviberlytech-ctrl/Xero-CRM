import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }
  } catch (error) {
    // If Supabase is not configured, allow access (for development)
    console.warn("Auth check failed, allowing access:", error)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
