"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Mail, Users, Target, Calendar } from "lucide-react"

const campaignStats = [
  {
    title: "Total Campaigns",
    value: "4",
    icon: Target,
  },
  {
    title: "Total Sent",
    value: "28.7k",
    icon: Mail,
  },
  {
    title: "Avg Open Rate",
    value: "68.8%",
    icon: Users,
  },
  {
    title: "Total Conversions",
    value: "1784",
    icon: TrendingUp,
  },
]

const campaigns = [
  {
    id: 1,
    name: "Spring Product Launch",
    status: "Active",
    type: "Email",
    dateRange: "2024-01-01 - 2024-03-31",
    sent: 12500,
    openRate: 50.0,
    clickRate: 30.0,
    conversionRate: 20.0,
    budgetUsed: 18750,
    budgetTotal: 25000,
  },
  {
    id: 2,
    name: "LinkedIn Lead Generation",
    status: "Active",
    type: "Social",
    dateRange: "2024-01-15 - 2024-02-28",
    sent: 8000,
    openRate: 70.0,
    clickRate: 42.9,
    conversionRate: 23.3,
    budgetUsed: 12000,
    budgetTotal: 15000,
  },
  {
    id: 3,
    name: "Customer Retention Program",
    status: "Completed",
    type: "Email",
    dateRange: "2023-12-01 - 2024-01-31",
    sent: 5000,
    openRate: 75.0,
    clickRate: 33.3,
    conversionRate: 50.0,
    budgetUsed: 9500,
    budgetTotal: 10000,
  },
  {
    id: 4,
    name: "Trade Show Follow-up",
    status: "Active",
    type: "Multi-channel",
    dateRange: "2024-01-20 - 2024-02-20",
    sent: 3200,
    openRate: 80.0,
    clickRate: 37.5,
    conversionRate: 23.3,
    budgetUsed: 15600,
    budgetTotal: 20000,
  },
]

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your marketing campaigns</p>
        </div>
        <Button className="glass-strong border-white/30 dark:border-slate-700/30">
          Create Campaign
        </Button>
      </div>

      {/* Campaign KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {campaignStats.map((stat) => (
          <Card key={stat.title} className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-3xl font-semibold text-foreground">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Campaign Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Campaign performance chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Campaigns</h2>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                      <Badge className={campaign.status === "Active" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className="bg-white/40 dark:bg-slate-800/40">
                        {campaign.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{campaign.dateRange}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sent</p>
                    <p className="text-sm font-semibold text-foreground">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Open Rate</p>
                    <p className="text-sm font-semibold text-foreground">{campaign.openRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Click Rate</p>
                    <p className="text-sm font-semibold text-foreground">{campaign.clickRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                    <p className="text-sm font-semibold text-foreground">{campaign.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Budget Usage</p>
                    <p className="text-sm text-muted-foreground">
                      ${campaign.budgetUsed.toLocaleString()} / ${campaign.budgetTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full bg-white/20 dark:bg-slate-800/20 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.budgetUsed / campaign.budgetTotal) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

