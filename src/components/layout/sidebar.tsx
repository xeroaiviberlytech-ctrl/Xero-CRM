"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Kanban,
  Mail,
  CheckSquare,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Pipeline", icon: Kanban, href: "/pipeline" },
  { name: "Marketing", icon: Mail, href: "/marketing" },
  { name: "Tasks", icon: CheckSquare, href: "/tasks" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Settings", icon: Settings, href: "/settings" },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-screen fixed left-0 top-0 glass-silver border-r border-white/30 dark:border-slate-700/30 flex flex-col z-50 w-16">
      <div className="p-4">
        {/* Logo Section - Icon Only */}
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">X</span>
          </div>
        </div>
      </div>

      {/* Navigation - Icons Only */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                title={item.name}
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-200 p-3",
                  isActive
                    ? "bg-white/60 dark:bg-slate-800/60 text-primary shadow-md backdrop-blur-md"
                    : "text-foreground hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="glass-silver border-white/30 dark:border-slate-700/30 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                </div>
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
