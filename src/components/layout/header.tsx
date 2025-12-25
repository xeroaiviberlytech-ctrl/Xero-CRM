"use client"

import { useState } from "react"
import { Bell, Search, User, LogOut, RefreshCw, Download, Filter } from "lucide-react"
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
  
  // Dialog states
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)

  // Fetch recent activities for notification count
  const { data: recentActivities } = trpc.analytics.getRecentActivities.useQuery(
    { limit: 10 },
    { staleTime: 30000 }
  )

  // Calculate notification count (activities from last 24 hours)
  const notificationCount = recentActivities
    ? recentActivities.filter((activity) => {
        const activityDate = new Date(activity.createdAt)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return activityDate > oneDayAgo
      }).length
    : 0
  
  const userInitials = user?.email
    ?.split("@")[0]
    ?.substring(0, 2)
    ?.toUpperCase() || "SC"
  
  const userName = user?.user_metadata?.name || "Sarah Chen"
  const userRole = user?.user_metadata?.role || "sales"

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
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center text-[10px] font-semibold text-white shadow-lg border-2 border-background">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
                {/* Pulse dot indicator when there are unread notifications */}
                {notificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-silver border-white/30 dark:border-slate-700/30 w-80">
              <DropdownMenuLabel className="text-foreground">
                Notifications {notificationCount > 0 && `(${notificationCount})`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/20" />
              <div className="max-h-96 overflow-y-auto">
                {recentActivities && recentActivities.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {recentActivities.slice(0, 5).map((activity) => {
                      const activityDate = new Date(activity.createdAt)
                      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                      const isRecent = activityDate > oneDayAgo
                      
                      return (
                        <div
                          key={activity.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            isRecent
                              ? "bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20"
                              : "bg-white/20 dark:bg-slate-800/20 hover:bg-white/40 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {activity.user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{activity.title}</p>
                              {activity.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {activity.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                            </div>
                            {isRecent && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No new notifications</p>
                    <p className="text-xs mt-1">You're all caught up!</p>
                  </div>
                )}
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
            <DropdownMenuContent align="end" className="glass-silver border-white/30 dark:border-slate-700/30">
              <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/20" />
              <DropdownMenuItem 
                className="text-foreground cursor-pointer"
                onClick={() => router.push("/settings")}
              >
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

      {/* Dialogs */}
      <AddLeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />
      <AddDealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} />
      <AddTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <AddCampaignDialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen} />
    </header>
  )
}

