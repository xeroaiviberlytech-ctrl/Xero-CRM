"use client"

import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
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
  
  const userInitials = user?.email
    ?.split("@")[0]
    ?.substring(0, 2)
    ?.toUpperCase() || "U"
  
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User"

  return (
    <header className="sticky top-0 z-40 glass-silver border-b border-white/30 dark:border-slate-700/30 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-6 ml-20 transition-all duration-300">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search leads, deals, contacts..."
            className="w-full pl-10 pr-4 py-2 bg-white/40 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/30 focus:bg-white/60 dark:focus:bg-slate-800/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 ml-6">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/40 dark:hover:bg-slate-800/40"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          <div className="h-8 w-px bg-white/30 dark:bg-slate-700/30"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  {userInitials}
                </div>
              </div>
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

