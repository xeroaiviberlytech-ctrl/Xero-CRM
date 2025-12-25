"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Users,
  IndianRupee,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"

interface ActivityItem {
  id: number
  user: string
  userInitials: string
  action: string
  time: string
}

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹24,83,920",
      change: "+12.5%",
      icon: IndianRupee,
      trend: "up" as const,
      bgIcon: IndianRupee,
    },
    {
      title: "Active Leads",
      value: "1,842",
      change: "+8.2%",
      icon: Users,
      trend: "up" as const,
      bgIcon: Users,
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "-2.4%",
      icon: Target,
      trend: "down" as const,
      bgIcon: Target,
    },
    {
      title: "Active Campaigns",
      value: "12",
      change: "+3",
      icon: BarChart,
      trend: "up" as const,
      bgIcon: BarChart,
    },
  ]

  const recentActivities: ActivityItem[] = [
    { id: 1, user: "Sarah Chen", userInitials: "SC", action: "closed deal Acme Corp ₹45,000", time: "2 min ago" },
    { id: 2, user: "Mike Johnson", userInitials: "MJ", action: "added lead TechStart Inc", time: "15 min ago" },
    { id: 3, user: "Emma Davis", userInitials: "ED", action: "updated pipeline 3 deals", time: "1 hour ago" },
    { id: 4, user: "Alex Kumar", userInitials: "AK", action: "completed task Follow-up call", time: "2 hours ago" },
    { id: 5, user: "Lisa Wang", userInitials: "LW", action: "sent proposal Global Solutions ₹32,000", time: "3 hours ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your CRM overview</p>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: 2 minutes ago</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          const trendColor = stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          const BgIcon = stat.bgIcon
          
          return (
            <Card key={stat.title} className="glass-silver border-white/30 dark:border-slate-700/30 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-semibold text-foreground">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                      <span className={`text-sm font-medium ${trendColor}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 opacity-10 dark:opacity-5">
                    <BgIcon className="h-16 w-16 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Revenue vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-foreground">revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-foreground">target</span>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Revenue chart will be displayed here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pipeline chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                  {activity.userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

