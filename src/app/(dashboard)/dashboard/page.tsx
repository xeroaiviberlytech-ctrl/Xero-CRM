"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Users,
  IndianRupee,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
} from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { formatDistanceToNow } from "date-fns"
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { MemoizedChart } from "@/components/charts/memoized-chart"

interface ActivityItem {
  id: string
  user: string
  userInitials: string
  action: string
  time: string
}

// Format currency in Indian format
function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`
  }
  return `₹${value.toFixed(0)}`
}

// Get user initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardPage() {
  // Fetch dashboard data with staleTime for better caching
  const { data: dashboardStats, isLoading: statsLoading } = trpc.analytics.getDashboardStats.useQuery(
    undefined,
    { staleTime: 30000 } // Cache for 30 seconds
  )
  const { data: recentActivities, isLoading: activitiesLoading } = trpc.analytics.getRecentActivities.useQuery(
    { limit: 5 },
    { staleTime: 10000 } // Cache for 10 seconds
  )
  const { data: revenueTrend } = trpc.analytics.getRevenueTrend.useQuery(
    undefined,
    { staleTime: 60000 } // Cache for 1 minute
  )
  const { data: pipelineDistribution } = trpc.analytics.getPipelineDistribution.useQuery(
    undefined,
    { staleTime: 60000 } // Cache for 1 minute
  )

  // Format stats from API data - memoized to prevent recalculation
  const stats = useMemo(() => {
    if (!dashboardStats) return []
    return [
      {
        title: "Total Revenue",
        value: dashboardStats.totalRevenue.formatted,
        change: dashboardStats.totalRevenue.change,
        icon: IndianRupee,
        trend: dashboardStats.totalRevenue.trend as "up" | "down",
        bgIcon: IndianRupee,
      },
      {
        title: "Active Leads",
        value: dashboardStats.activeLeads.value.toLocaleString(),
        change: dashboardStats.activeLeads.change,
        icon: Users,
        trend: dashboardStats.activeLeads.trend as "up" | "down",
        bgIcon: Users,
      },
      {
        title: "Conversion Rate",
        value: `${dashboardStats.conversionRate.value}%`,
        change: dashboardStats.conversionRate.change,
        icon: Target,
        trend: dashboardStats.conversionRate.trend as "up" | "down",
        bgIcon: Target,
      },
      {
        title: "Active Campaigns",
        value: dashboardStats.activeCampaigns.value.toString(),
        change: dashboardStats.activeCampaigns.change,
        icon: BarChart,
        trend: dashboardStats.activeCampaigns.trend as "up" | "down",
        bgIcon: BarChart,
      },
    ]
  }, [dashboardStats])

  // Format activities from API data - memoized
  const formattedActivities: ActivityItem[] = useMemo(() => {
    if (!recentActivities) return []
    return recentActivities.map((activity) => ({
      id: activity.id,
      user: activity.user.name || activity.user.email,
      userInitials: getInitials(activity.user.name),
      action: activity.title,
      time: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
    }))
  }, [recentActivities])

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your CRM overview</p>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.length > 0 ? (
          stats.map((stat) => {
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
          })
        ) : (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            No data available
          </div>
        )}
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
            {revenueTrend && revenueTrend.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-foreground">Target</span>
                  </div>
                </div>
                <MemoizedChart height={250}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      className="text-muted-foreground"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Revenue"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </MemoizedChart>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineDistribution && pipelineDistribution.length > 0 ? (
              <MemoizedChart height={250}>
                <PieChart>
                  <Pie
                    data={pipelineDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pipelineDistribution.map((entry: any, index: number) => {
                      const colors = [
                        '#3b82f6', // blue
                        '#8b5cf6', // purple
                        '#ec4899', // pink
                        '#f59e0b', // amber
                        '#10b981', // green
                        '#ef4444', // red
                      ]
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </MemoizedChart>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pipeline data available</p>
                </div>
              </div>
            )}
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
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : formattedActivities.length > 0 ? (
            <div className="space-y-4">
              {formattedActivities.map((activity) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

