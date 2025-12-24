import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Activity,
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$248,392",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
      description: "from last month",
    },
    {
      title: "Active Leads",
      value: "1,842",
      change: "+4.2%",
      icon: Users,
      trend: "up",
      description: "from last month",
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+2.1%",
      icon: Target,
      trend: "up",
      description: "from last month",
    },
    {
      title: "Active Campaigns",
      value: "12",
      change: "+3",
      icon: BarChart,
      trend: "up",
      description: "new this month",
    },
  ]

  const recentActivities = [
    { id: 1, text: "New lead added: Acme Corp", time: "2 hours ago" },
    { id: 2, text: "Deal closed: Tech Solutions Inc ($45k)", time: "4 hours ago" },
    { id: 3, text: "Task completed: Follow up with ABC Company", time: "6 hours ago" },
    { id: 4, text: "Campaign launched: Q1 Product Launch", time: "1 day ago" },
    { id: 5, text: "New deal created: XYZ Corporation ($120k)", time: "1 day ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
                <span className="text-xs text-muted-foreground ml-1">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Revenue chart will be displayed here</p>
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
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.text}
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

