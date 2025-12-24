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
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Leads", icon: Users, href: "/leads" },
    { name: "Pipeline", icon: Kanban, href: "/pipeline" },
    { name: "Marketing", icon: Mail, href: "/marketing" },
    { name: "Tasks", icon: CheckSquare, href: "/tasks" },
    { name: "Analytics", icon: BarChart3, href: "/analytics" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass-silver border-r border-white/30 dark:border-slate-700/30 p-4 flex flex-col z-50">
      {/* Logo Section */}
      <div className="flex items-center space-x-3 p-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">X</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground">Xero</span>
          <span className="text-xs text-muted-foreground font-medium">CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-white/60 dark:bg-slate-800/60 text-primary shadow-md backdrop-blur-md"
                  : "text-foreground hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/20 dark:border-slate-700/20">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p>© 2024 Xero CRM</p>
        </div>
      </div>
    </div>
  )
}

