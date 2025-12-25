"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

export default function AnalyticsPage() {
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
            <div className="text-4xl font-bold text-foreground mb-2">142</div>
            <p className="text-sm text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Average Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mb-2">₹4.9L</div>
            <p className="text-sm text-muted-foreground">Per deal</p>
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
            {[
              "Sales Overview",
              "Team Performance",
              "Lead Sources",
              "Revenue",
            ].map((report) => (
              <Card
                key={report}
                className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-foreground">{report}</h3>
                  <p className="text-xs text-muted-foreground mt-2">View report →</p>
                </CardContent>
              </Card>
            ))}
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
            <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm">Team performance chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

