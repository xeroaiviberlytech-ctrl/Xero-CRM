"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { DateRangeDialog } from "@/components/dialogs/date-range-dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Format currency
function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) {
    return "₹0"
  }
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`
  }
  return `₹${value.toFixed(0)}`
}

export default function AnalyticsPage() {
  const [dateRangeDialogOpen, setDateRangeDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })

  // Fetch analytics data with date range filtering
  const { data: dealsClosed, isLoading: dealsLoading } = trpc.analytics.getDealsClosed.useQuery(
    { 
      period: "quarter",
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )
  const { data: avgDealSize, isLoading: avgSizeLoading } = trpc.analytics.getAverageDealSize.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )
  const { data: teamPerformance, isLoading: teamLoading } = trpc.analytics.getTeamPerformance.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )
  const { data: leadSources, isLoading: sourcesLoading } = trpc.analytics.getLeadSources.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )
  const { data: revenueTrend } = trpc.analytics.getRevenueTrend.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )
  const { data: pipelineDistribution } = trpc.analytics.getPipelineDistribution.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { staleTime: 60000 }
  )

  const utils = trpc.useUtils()

  const handleDateRangeApply = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end })
    if (start && end) {
      toast.success(`Date range set: ${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`)
      // Invalidate all analytics queries to refetch with new date range
      utils.analytics.getDealsClosed.invalidate()
      utils.analytics.getAverageDealSize.invalidate()
      utils.analytics.getTeamPerformance.invalidate()
      utils.analytics.getLeadSources.invalidate()
      utils.analytics.getRevenueTrend.invalidate()
      utils.analytics.getPipelineDistribution.invalidate()
    } else {
      toast.success("Date range cleared")
      // Invalidate to refetch without date range
      utils.analytics.getDealsClosed.invalidate()
      utils.analytics.getAverageDealSize.invalidate()
      utils.analytics.getTeamPerformance.invalidate()
      utils.analytics.getLeadSources.invalidate()
      utils.analytics.getRevenueTrend.invalidate()
      utils.analytics.getPipelineDistribution.invalidate()
    }
  }

  const handleExportPDF = () => {
    // TODO: Implement actual PDF export
    toast.info("PDF export functionality coming soon. This will generate a comprehensive analytics report.")
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Data insights and reporting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="glass-subtle"
            onClick={() => setDateRangeDialogOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange.start && dateRange.end 
              ? `${format(dateRange.start, "MMM dd")} - ${format(dateRange.end, "MMM dd")}`
              : "Date Range"
            }
          </Button>
          <Button 
            className="glass-strong border-white/30 dark:border-slate-700/30"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Deals Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {dealsClosed?.count || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total value: {formatCurrency(dealsClosed?.totalValue || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Average Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgSizeLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {formatCurrency(avgDealSize?.average || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Per deal</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground">Sales Overview</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {revenueTrend ? `${revenueTrend.length} data points` : "No data"}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground">Team Performance</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {teamPerformance ? `${teamPerformance.length} team members` : "No data"}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground">Lead Sources</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {leadSources ? `${leadSources.sources.length} sources` : "No data"}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground">Pipeline</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {pipelineDistribution ? `${pipelineDistribution.length} stages` : "No data"}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTrend && revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={revenueTrend}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    animationDuration={200}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                    animationDuration={1000}
                    animationBegin={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm">No sales data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : teamPerformance && teamPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={teamPerformance}
                  margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="dealsBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis 
                    dataKey="userName" 
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    animationDuration={200}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    dataKey="totalRevenue" 
                    fill="url(#revenueBarGradient)" 
                    name="Total Revenue"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                    animationBegin={0}
                  />
                  <Bar 
                    dataKey="dealsClosed" 
                    fill="url(#dealsBarGradient)" 
                    name="Deals Closed"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                    animationBegin={100}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm">No team performance data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : leadSources && leadSources.sources && leadSources.sources.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadSources.sources}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="count"
                    animationDuration={800}
                    animationBegin={0}
                  >
                    {leadSources.sources.map((entry: any, index: number) => {
                      const colors = [
                        '#3b82f6', // blue
                        '#8b5cf6', // purple
                        '#ec4899', // pink
                        '#f59e0b', // amber
                        '#10b981', // green
                        '#ef4444', // red
                        '#06b6d4', // cyan
                        '#84cc16', // lime
                      ]
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    animationDuration={200}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value, entry: any) => {
                      const data = leadSources.sources.find((d: any) => d.name === value)
                      const percent = data ? ((data.count / leadSources.total) * 100).toFixed(1) : '0'
                      return `${value} (${percent}%)`
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm">No lead source data available</p>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={pipelineDistribution}
                  margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="pipelineValueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="pipelineCountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.6}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Deal Value') {
                        return [formatCurrency(value), name]
                      }
                      return [value, name]
                    }}
                    animationDuration={200}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="value" 
                    fill="url(#pipelineValueGradient)" 
                    name="Deal Value"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                    animationBegin={0}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="count" 
                    fill="url(#pipelineCountGradient)" 
                    name="Deal Count"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                    animationBegin={100}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm">No pipeline data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date Range Dialog */}
      <DateRangeDialog
        open={dateRangeDialogOpen}
        onOpenChange={setDateRangeDialogOpen}
        onApply={handleDateRangeApply}
        initialStartDate={dateRange.start}
        initialEndDate={dateRange.end}
      />
    </div>
  )
}

