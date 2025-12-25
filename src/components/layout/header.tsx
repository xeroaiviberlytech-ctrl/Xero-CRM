"use client"

import { Bell, Search, User, LogOut, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  
  const userInitials = user?.email
    ?.split("@")[0]
    ?.substring(0, 2)
    ?.toUpperCase() || "SC"
  
  const userName = user?.user_metadata?.name || "Sarah Chen"
  const userRole = user?.user_metadata?.role || "sales"

  // Get context-specific action buttons based on current page
  const getActionButtons = () => {
    if (pathname === "/dashboard") {
      return (
        <>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </>
      )
    } else if (pathname === "/pipeline") {
      return (
        <>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <span className="mr-2">+</span>
            Add Deal
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Filter
          </Button>
        </>
      )
    } else if (pathname === "/leads") {
      return (
        <>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <span className="mr-2">+</span>
            Add Lead
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Filter
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Export
          </Button>
        </>
      )
    } else if (pathname === "/tasks") {
      return (
        <>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <span className="mr-2">+</span>
            Add Task
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Filter
          </Button>
        </>
      )
    } else if (pathname === "/analytics" || pathname === "/marketing") {
      return (
        <>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            <span className="mr-2">+</span>
            New Campaign
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Export Results
          </Button>
        </>
      )
    }
    return null
  }

  return (
    <header className="sticky top-0 z-40 glass-silver border-b border-white/30 dark:border-slate-700/30 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-6 ml-16 transition-all duration-300">
        {/* Left Side - Action Buttons */}
        <div className="flex items-center gap-2">
          {getActionButtons()}
        </div>

        {/* Center - Search Bar */}
        <div className="relative flex-1 max-w-2xl mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts, leads, or deals..."
            className="w-full pl-10 pr-4 py-2 bg-white/40 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/30 focus:bg-white/60 dark:focus:bg-slate-800/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/40 dark:hover:bg-slate-800/40"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white/40 dark:bg-slate-800/40 flex items-center justify-center text-[10px] font-medium text-foreground">
              2
            </span>
          </Button>

          <div className="h-8 w-px bg-white/30 dark:bg-slate-700/30"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 hover:bg-white/40 dark:hover:bg-slate-800/40 px-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                  {userInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-silver border-white/30 dark:border-slate-700/30">
              <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/20" />
              <DropdownMenuItem className="text-foreground cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-foreground cursor-pointer"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

