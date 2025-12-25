"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/react"

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
  // Fetch analytics data
  const { data: dealsClosed, isLoading: dealsLoading } = trpc.analytics.getDealsClosed.useQuery({ period: "quarter" })
  const { data: avgDealSize, isLoading: avgSizeLoading } = trpc.analytics.getAverageDealSize.useQuery()
  const { data: teamPerformance, isLoading: teamLoading } = trpc.analytics.getTeamPerformance.useQuery()
  const { data: leadSources, isLoading: sourcesLoading } = trpc.analytics.getLeadSources.useQuery()
  const { data: revenueTrend } = trpc.analytics.getRevenueTrend.useQuery()
  const { data: pipelineDistribution } = trpc.analytics.getPipelineDistribution.useQuery()
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Data insights and reporting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="glass-subtle">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="glass-strong border-white/30 dark:border-slate-700/30">
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
            <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm">Sales chart will be displayed here</p>
              </div>
            </div>
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
              <div className="space-y-4">
                {teamPerformance.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-white/20 dark:bg-slate-800/20 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{member.userName || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{member.dealsClosed || 0} deals closed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(member.totalRevenue || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  )
}

