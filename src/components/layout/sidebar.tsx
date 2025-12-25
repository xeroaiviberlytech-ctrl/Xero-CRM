"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
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
    <div className="group h-screen fixed left-0 top-0 glass-silver border-r border-white/30 dark:border-slate-700/30 flex flex-col z-50 transition-all duration-300 ease-in-out w-20 hover:w-64">
      <div className="p-4">
        {/* Logo Section */}
        <div className="flex items-center transition-all duration-300 justify-center group-hover:space-x-3 group-hover:justify-start">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <div className="flex flex-col overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-300">
            <span className="text-xl font-bold text-foreground whitespace-nowrap">Xero</span>
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">CRM</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group/item",
                "justify-center p-3 group-hover:space-x-3 group-hover:justify-start",
                isActive
                  ? "bg-white/60 dark:bg-slate-800/60 text-primary shadow-md backdrop-blur-md"
                  : "text-foreground hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-primary"
              )}
              title={item.name}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-300 whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/20 dark:border-slate-700/20 px-2 pb-4">
        <div className="text-xs text-muted-foreground transition-all duration-300 text-center group-hover:text-left group-hover:px-3 py-2">
          <p className="overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-300 whitespace-nowrap">
            © 2024 Xero CRM
          </p>
        </div>
      </div>
    </div>
  )
}
