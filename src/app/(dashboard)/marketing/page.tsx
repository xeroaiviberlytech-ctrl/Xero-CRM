"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Mail, Users, Target, Calendar, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { AddCampaignDialog } from "@/components/dialogs/add-campaign-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function MarketingPage() {
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  
  // Fetch campaigns and stats with caching
  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaigns.list.useQuery(
    {},
    { staleTime: 30000 }
  )
  const { data: campaignStats, isLoading: statsLoading } = trpc.campaigns.getStats.useQuery(
    undefined,
    { staleTime: 30000 }
  )
  const { data: campaignPerformance } = trpc.analytics.getCampaignPerformance.useQuery(
    {},
    { staleTime: 60000 }
  )
  const { data: selectedCampaign } = trpc.campaigns.getById.useQuery(
    { id: selectedCampaignId! },
    { enabled: !!selectedCampaignId, staleTime: 30000 }
  )

  // Format campaign stats for display - memoized
  const stats = useMemo(() => {
    if (!campaignStats) return []
    return [
      {
        title: "Total Campaigns",
        value: campaignStats.totalCampaigns.toString(),
        icon: Target,
      },
      {
        title: "Total Sent",
        value: campaignStats.totalSent >= 1000 
          ? `${(campaignStats.totalSent / 1000).toFixed(1)}k`
          : campaignStats.totalSent.toString(),
        icon: Mail,
      },
      {
        title: "Avg Open Rate",
        value: `${campaignStats.avgOpenRate.toFixed(1)}%`,
        icon: Users,
      },
      {
        title: "Total Conversions",
        value: campaignStats.totalConverted.toLocaleString(),
        icon: TrendingUp,
      },
    ]
  }, [campaignStats])

  // Calculate rates for campaigns
  const calculateOpenRate = (sent: number, opened: number): number => {
    if (sent === 0) return 0
    return (opened / sent) * 100
  }

  const calculateClickRate = (opened: number, clicked: number): number => {
    if (opened === 0) return 0
    return (clicked / opened) * 100
  }

  const calculateConversionRate = (clicked: number, converted: number): number => {
    if (clicked === 0) return 0
    return (converted / clicked) * 100
  }

  // Format date range
  const formatDateRange = (startDate: Date | string | null, endDate: Date | string | null): string => {
    if (!startDate || !endDate) return "No dates set"
    const start = startDate instanceof Date ? startDate : new Date(startDate)
    const end = endDate instanceof Date ? endDate : new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid dates"
    return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your marketing campaigns</p>
        </div>
        <Button 
          className="glass-strong border-white/30 dark:border-slate-700/30"
          onClick={() => setCampaignDialogOpen(true)}
        >
          Create Campaign
        </Button>
      </div>

      {/* Campaign KPIs */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardContent className="p-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="glass-silver border-white/30 dark:border-slate-700/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground">{stat.value}</h3>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Performance Chart */}
      <Card className="glass-silver border-white/30 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Campaign Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaignPerformance && campaignPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={campaignPerformance.slice(0, 10)}
                margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="openRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="clickRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="conversionRateGradient" x1="0" y1="0" x2="0" y2="1">
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
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  stroke="currentColor"
                  opacity={0.6}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
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
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  animationDuration={200}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  dataKey="openRate" 
                  fill="url(#openRateGradient)" 
                  name="Open Rate (%)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                />
                <Bar 
                  dataKey="clickRate" 
                  fill="url(#clickRateGradient)" 
                  name="Click Rate (%)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                  animationBegin={100}
                />
                <Bar 
                  dataKey="conversionRate" 
                  fill="url(#conversionRateGradient)" 
                  name="Conversion Rate (%)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1400}
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground bg-white/20 dark:bg-slate-800/20 rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No campaign performance data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Campaigns</h2>
        {campaignsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const openRate = calculateOpenRate(campaign.sent, campaign.opened)
              const clickRate = calculateClickRate(campaign.opened, campaign.clicked)
              const conversionRate = calculateConversionRate(campaign.clicked, campaign.converted)
              
              return (
                <Card key={campaign.id} className="glass-silver border-white/30 dark:border-slate-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                          <Badge className={
                            campaign.status === "active" 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" 
                              : campaign.status === "completed"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                          }>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="bg-white/40 dark:bg-slate-800/40">
                            {campaign.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateRange(campaign.startDate, campaign.endDate)}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass-subtle border-white/30 dark:border-slate-700/30"
                        onClick={() => setSelectedCampaignId(campaign.id)}
                      >
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
                        <p className="text-sm font-semibold text-foreground">{openRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Click Rate</p>
                        <p className="text-sm font-semibold text-foreground">{clickRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                        <p className="text-sm font-semibold text-foreground">{conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No campaigns found
          </div>
        )}
      </div>

      {/* Create Campaign Dialog */}
      <AddCampaignDialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen} />

      {/* View Campaign Details Dialog */}
      <Dialog open={!!selectedCampaignId} onOpenChange={(open) => !open && setSelectedCampaignId(null)}>
        <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? selectedCampaign.name : "Campaign Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign ? "Campaign details and performance metrics" : "Loading campaign information..."}
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign ? (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={
                    selectedCampaign.status === "active" 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" 
                      : selectedCampaign.status === "completed"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                  }>
                    {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/40 dark:bg-slate-800/40">
                    {selectedCampaign.type}
                  </Badge>
                </div>
                
                {selectedCampaign.description && (
                  <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedCampaign.startDate ? format(new Date(selectedCampaign.startDate), "MMM dd, yyyy") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedCampaign.endDate ? format(new Date(selectedCampaign.endDate), "MMM dd, yyyy") : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/20 dark:border-slate-700/20">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sent</p>
                    <p className="text-lg font-semibold text-foreground">{selectedCampaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Opened</p>
                    <p className="text-lg font-semibold text-foreground">{selectedCampaign.opened.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {calculateOpenRate(selectedCampaign.sent, selectedCampaign.opened).toFixed(1)}% rate
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Clicked</p>
                    <p className="text-lg font-semibold text-foreground">{selectedCampaign.clicked.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {calculateClickRate(selectedCampaign.opened, selectedCampaign.clicked).toFixed(1)}% rate
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Converted</p>
                    <p className="text-lg font-semibold text-foreground">{selectedCampaign.converted.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {calculateConversionRate(selectedCampaign.clicked, selectedCampaign.converted).toFixed(1)}% rate
                    </p>
                  </div>
                </div>
              </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

