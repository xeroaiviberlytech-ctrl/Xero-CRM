"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Mail, Users, Target } from "lucide-react"

const campaignStats = [
  {
    title: "Total Sent",
    value: "12,458",
    change: "+8.2%",
    icon: Mail,
  },
  {
    title: "Open Rate",
    value: "68.4%",
    change: "+5.1%",
    icon: Target,
  },
  {
    title: "Click Rate",
    value: "12.3%",
    change: "+2.4%",
    icon: Users,
  },
  {
    title: "Conversions",
    value: "342",
    change: "+15.7%",
    icon: TrendingUp,
  },
]

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketing</h1>
          <p className="text-muted-foreground mt-1">Manage your campaigns and track performance</p>
        </div>
        <Button className="glass-strong border-white/30 dark:border-slate-700/30">
          Create Campaign
        </Button>
      </div>

      {/* Campaign KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {campaignStats.map((stat) => (
          <Card key={stat.title} className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Campaign Performance (Last 4 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Campaign performance chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Q1 Product Launch", status: "Active", sent: "5,234", opens: "3,589" },
              { name: "Spring Sale", status: "Active", sent: "4,128", opens: "2,856" },
              { name: "Newsletter #42", status: "Active", sent: "3,096", opens: "2,123" },
            ].map((campaign, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/20 dark:bg-slate-800/20 rounded-xl hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.sent} sent • {campaign.opens} opens
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                    {campaign.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

