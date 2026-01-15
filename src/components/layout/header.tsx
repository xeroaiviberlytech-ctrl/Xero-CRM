"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, LogOut, RefreshCw, Download, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddLeadDialog } from "@/components/dialogs/add-lead-dialog"
import { AddDealDialog } from "@/components/dialogs/add-deal-dialog"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"
import { AddCampaignDialog } from "@/components/dialogs/add-campaign-dialog"
import { trpc } from "@/lib/trpc/react"
import { toast } from "sonner"

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const utils = trpc.useUtils()
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])
  
  // Dialog states
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)

  // Fetch current user profile from database
  const { data: currentUser } = trpc.users.getCurrent.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
  })

  // Fetch recent activities for notification count
  const { data: recentActivities } = trpc.analytics.getRecentActivities.useQuery(
    { limit: 20 },
    { staleTime: 30000 }
  )

  // Track cleared notifications in localStorage
  const [clearedNotificationIds, setClearedNotificationIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('clearedNotifications')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    }
    return new Set()
  })

  // Calculate notification count (only fresh activities from last 2 hours, excluding cleared ones)
  const notificationCount = recentActivities
    ? recentActivities.filter((activity) => {
        const activityDate = new Date(activity.createdAt)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours for "fresh"
        return activityDate > twoHoursAgo && !clearedNotificationIds.has(activity.id)
      }).length
    : 0

  // Get fresh notifications (last 2 hours, excluding cleared)
  const freshNotifications = recentActivities
    ? recentActivities
        .filter((activity) => {
          const activityDate = new Date(activity.createdAt)
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
          return activityDate > twoHoursAgo && !clearedNotificationIds.has(activity.id)
        })
        .slice(0, 10) // Show max 10 fresh notifications
    : []

  // Clear all notifications
  const handleClearAll = () => {
    if (freshNotifications.length > 0) {
      const allIds = freshNotifications.map((a) => a.id)
      const newClearedSet = new Set([...clearedNotificationIds, ...allIds])
      setClearedNotificationIds(newClearedSet)
      if (typeof window !== 'undefined') {
        localStorage.setItem('clearedNotifications', JSON.stringify([...newClearedSet]))
      }
      toast.success('All notifications cleared')
    }
  }

  // Clear single notification
  const handleClearNotification = (id: string) => {
    const newClearedSet = new Set([...clearedNotificationIds, id])
    setClearedNotificationIds(newClearedSet)
    if (typeof window !== 'undefined') {
      localStorage.setItem('clearedNotifications', JSON.stringify([...newClearedSet]))
    }
  }
  
  // Get user initials from database name or email
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user?.email
        ?.split("@")[0]
        ?.substring(0, 2)
        ?.toUpperCase() || "SC"
  
  // Use database name first, then fallback to email username
  const userName = currentUser?.name || user?.email?.split("@")[0] || "User"
  const userRole = currentUser?.role || "user"

  // Refresh data handler
  const handleRefresh = () => {
    if (pathname === "/dashboard") {
      utils.leads.list.invalidate()
      utils.deals.list.invalidate()
      utils.tasks.list.invalidate()
      utils.campaigns.list.invalidate()
      toast.success("Data refreshed")
    } else if (pathname === "/pipeline") {
      utils.deals.list.invalidate()
      utils.deals.getByStage.invalidate()
      utils.deals.getStageStats.invalidate()
      toast.success("Pipeline data refreshed")
    } else if (pathname === "/leads") {
      utils.leads.list.invalidate()
      toast.success("Leads refreshed")
    } else if (pathname === "/tasks") {
      utils.tasks.list.invalidate()
      utils.tasks.getByStatus.invalidate()
      utils.tasks.getStats.invalidate()
      toast.success("Tasks refreshed")
    } else if (pathname === "/analytics" || pathname === "/marketing") {
      utils.campaigns.list.invalidate()
      toast.success("Campaigns refreshed")
    }
  }

  // Export handler (placeholder - can be enhanced later)
  const handleExport = () => {
    toast.info("Export functionality coming soon")
  }

  // Filter handler (placeholder - can be enhanced later)
  const handleFilter = () => {
    toast.info("Filter options coming soon")
  }

  // Get context-specific action buttons based on current page
  const getActionButtons = () => {
    if (pathname === "/dashboard") {
      return (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </>
      )
    } else if (pathname === "/pipeline") {
      return (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={() => setDealDialogOpen(true)}
          >
            <span className="mr-2">+</span>
            Add Deal
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </>
      )
    } else if (pathname === "/leads") {
      return (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={() => setLeadDialogOpen(true)}
          >
            <span className="mr-2">+</span>
            Add Lead
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </>
      )
    } else if (pathname === "/tasks") {
      return (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={() => setTaskDialogOpen(true)}
          >
            <span className="mr-2">+</span>
            Add Task
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </>
      )
    } else if (pathname === "/analytics" || pathname === "/marketing") {
      return (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={() => setCampaignDialogOpen(true)}
          >
            <span className="mr-2">+</span>
            New Campaign
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-subtle border-white/30 dark:border-slate-700/30"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </>
      )
    }
    return null
  }

  return (
    <header className="sticky top-0 z-40 glass-silver border-b border-white/30 dark:border-slate-700/30 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-6 transition-all duration-300">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/40 dark:hover:bg-slate-800/40"
              >
                <Bell className="h-5 w-5 text-foreground" />
                {/* Notification Badge - Only show if there are notifications */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center text-[10px] font-semibold text-white shadow-lg border-2 border-background z-10">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="p-0 w-80 rounded-2xl overflow-hidden relative border-0
                data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2
                data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2
                duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: isDark
                  ? '1px solid rgba(148, 163, 184, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: isDark
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                  : '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Top glossy highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-20 pointer-events-none rounded-t-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                }}
              />
              
              {/* Diagonal glossy shine */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 40%, transparent 60%, rgba(0, 0, 0, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)',
                }}
              />
              
              {/* Animated shimmer */}
              <div 
                className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none rounded-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                  width: '200%',
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-3">
                <div className="flex items-center justify-between px-3 py-2.5 mb-2"
                  style={{ 
                    borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(226, 232, 240, 0.5)',
                  }}
                >
                  <DropdownMenuLabel 
                    className="text-sm font-bold p-0"
                    style={{ 
                      color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                    }}
                  >
                    Notifications {notificationCount > 0 && `(${notificationCount})`}
                  </DropdownMenuLabel>
                  {freshNotifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="h-7 px-2 text-xs hover:bg-white/20 dark:hover:bg-slate-800/20"
                      style={{ 
                        color: isDark ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.9)',
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {freshNotifications.length > 0 ? (
                    <div className="space-y-2">
                      {freshNotifications.map((activity) => {
                        return (
                          <div
                            key={activity.id}
                            className="p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md group relative"
                            style={{
                              background: isDark
                                ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'
                                : 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))',
                              border: isDark
                                ? '1px solid rgba(59, 130, 246, 0.3)'
                                : '1px solid rgba(59, 130, 246, 0.2)',
                            }}
                          >
                            {/* Clear button for individual notification */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClearNotification(activity.id)
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20 dark:hover:bg-slate-800/20"
                              style={{ 
                                color: isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.7)',
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            <div className="flex items-start gap-3 pr-6">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md">
                                {activity.user.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-sm font-medium"
                                  style={{ color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)' }}
                                >
                                  {activity.title}
                                </p>
                                {activity.description && (
                                  <p 
                                    className="text-xs mt-1 line-clamp-1"
                                    style={{ color: isDark ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.8)' }}
                                  >
                                    {activity.description}
                                  </p>
                                )}
                                <p 
                                  className="text-xs mt-1"
                                  style={{ color: isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.7)' }}
                                >
                                  {activity.time}
                                </p>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2 shadow-sm"></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <Bell 
                        className="h-8 w-8 mx-auto mb-2 opacity-50" 
                        style={{ color: isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)' }}
                      />
                      <p 
                        className="text-sm"
                        style={{ color: isDark ? 'rgba(241, 245, 249, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}
                      >
                        No new notifications
                      </p>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)' }}
                      >
                        You're all caught up!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
            <DropdownMenuContent 
              align="end" 
              className="p-0 min-w-[200px] rounded-2xl overflow-hidden relative border-0
                data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2
                data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2
                duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: isDark
                  ? '1px solid rgba(148, 163, 184, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: isDark
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                  : '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Top glossy highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-20 pointer-events-none rounded-t-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                }}
              />
              
              {/* Diagonal glossy shine */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 40%, transparent 60%, rgba(0, 0, 0, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)',
                }}
              />
              
              {/* Animated shimmer */}
              <div 
                className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none rounded-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                  width: '200%',
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-3">
                <DropdownMenuLabel 
                  className="px-3 py-2.5 text-sm font-bold mb-2"
                  style={{ 
                    color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                    borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(226, 232, 240, 0.5)',
                  }}
                >
                  My Account
                </DropdownMenuLabel>
                
                <div className="space-y-1 mt-2">
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl px-4 py-3 transition-all duration-300 
                      hover:shadow-md hover:scale-[1.02] 
                      group relative overflow-hidden border-0"
                    style={{ 
                      color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                    }}
                    onClick={() => router.push("/settings")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark 
                        ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1))'
                        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <User 
                      className="mr-3 h-4 w-4 transition-colors relative z-10 group-hover:text-primary" 
                      style={{ color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)' }}
                    />
                    <span className="relative z-10 font-medium group-hover:text-primary transition-colors">Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-xl px-4 py-3 transition-all duration-300 
                      hover:shadow-md hover:scale-[1.02]
                      group relative overflow-hidden border-0"
                    style={{ 
                      color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                    }}
                    onClick={signOut}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark 
                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1))'
                        : 'linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <LogOut 
                      className="mr-3 h-4 w-4 transition-colors relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400" 
                      style={{ color: isDark ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.9)' }}
                    />
                    <span className="relative z-10 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Log out</span>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      <AddLeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />
      <AddDealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} />
      <AddTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <AddCampaignDialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen} />
    </header>
  )
}

