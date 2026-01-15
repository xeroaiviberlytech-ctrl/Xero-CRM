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
    <div className="h-screen fixed left-0 top-0 glass-silver border-r border-white/30 dark:border-slate-700/30 flex flex-col z-30 w-16">
      <div className="p-4">
        {/* Logo Section - Icon Only */}
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 relative flex items-center justify-center">
            <img src="/images/logo.png" alt="Xero CRM" className="w-full h-full object-contain" />
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
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-200 p-3 relative",
                  isActive
                    ? "bg-white/60 dark:bg-slate-800/60 text-primary shadow-md backdrop-blur-md"
                    : "text-foreground hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute right-1 top-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                )}
              </Link>
              {/* Creative Tooltip with arrow - appears on hover, positioned to avoid overlap */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-[100] delay-100">
                <div className="relative flex items-center">
                  {/* Arrow pointing left - creative design */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-white/95 dark:border-r-slate-800/95 drop-shadow-sm"></div>
                  </div>
                  {/* Tooltip content with gradient effect */}
                  <div className="relative glass-strong border-white/50 dark:border-slate-700/50 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl whitespace-nowrap">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl pointer-events-none"></div>
                    <p className="text-sm font-semibold text-foreground relative z-10">{item.name}</p>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
