"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IndianRupee, 
  Calendar, 
  User, 
  Loader2, 
  TrendingUp, 
  Clock,
  Target,
  ArrowRight,
  Plus
} from "lucide-react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { AddDealDialog } from "@/components/dialogs/add-deal-dialog"

const stages = [
  { id: "prospecting", name: "Prospecting", color: "rgb(37, 99, 235)", colorDark: "hsl(230, 100%, 58%)", bgColor: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" },
  { id: "qualified", name: "Qualified", color: "rgb(79, 70, 229)", colorDark: "hsl(223, 30%, 46%)", bgColor: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.3)" },
  { id: "proposal", name: "Proposal", color: "rgb(22, 163, 74)", colorDark: "hsl(142, 71%, 45%)", bgColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)" },
  { id: "negotiation", name: "Negotiation", color: "rgb(217, 119, 6)", colorDark: "hsl(38, 92%, 50%)", bgColor: "rgba(251, 191, 36, 0.1)", borderColor: "rgba(251, 191, 36, 0.3)" },
  { id: "closed-won", name: "Closed Won", color: "rgb(22, 163, 74)", colorDark: "hsl(142, 71%, 45%)", bgColor: "rgba(34, 197, 94, 0.15)", borderColor: "rgba(34, 197, 94, 0.4)" },
]

export default function PipelinePage() {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDark(isDarkMode)
    }
    
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    
    return () => observer.disconnect()
  }, [])
  
  // Fetch deals grouped by stage - optimized with caching
  const { data: dealsByStageData, isLoading } = trpc.deals.getByStage.useQuery(
    undefined,
    { staleTime: 30000 }
  )
  const { data: stageStats } = trpc.deals.getStageStats.useQuery(
    undefined,
    { staleTime: 30000 }
  )
  const utils = trpc.useUtils()
  
  // Mutation to update deal stage
  const updateStageMutation = trpc.deals.updateStage.useMutation({
    onSuccess: () => {
      utils.deals.getByStage.invalidate()
      utils.deals.getStageStats.invalidate()
      toast.success("Deal stage updated")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update deal stage")
    },
  })

  // Transform API data to match component structure
  const dealsByStage = useMemo(() => {
    if (!dealsByStageData) return {}
    return dealsByStageData
  }, [dealsByStageData])

  // Get stage totals from stats
  const stageTotals = useMemo(() => {
    if (!stageStats) return {}
    const totals: Record<string, number> = {}
    stages.forEach(stage => {
      const stat = stageStats[stage.id as keyof typeof stageStats]
      totals[stage.id] = stat?.total || 0
    })
    return totals
  }, [stageStats])

  const handleDragStart = useCallback((dealId: string) => {
    setDraggedDealId(dealId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDraggedOverStage(stageId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDraggedOverStage(null)
  }, [])

  const handleDrop = useCallback((stageId: string) => {
    if (draggedDealId) {
      updateStageMutation.mutate({
        id: draggedDealId,
        stage: stageId as "prospecting" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost",
      })
      setDraggedDealId(null)
      setDraggedOverStage(null)
    }
  }, [draggedDealId, updateStageMutation])

  const getDealsByStage = useCallback((stageId: string) => {
    return dealsByStage[stageId as keyof typeof dealsByStage] || []
  }, [dealsByStage])

  const getStageTotal = useCallback((stageId: string) => {
    return stageTotals[stageId] || 0
  }, [stageTotals])

  const getStageCount = useCallback((stageId: string) => {
    if (!stageStats) return 0
    const stat = stageStats[stageId as keyof typeof stageStats]
    return stat?.count || 0
  }, [stageStats])

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value.toFixed(0)}`
  }

  // Calculate total pipeline value
  const totalPipelineValue = useMemo(() => {
    return Object.values(stageTotals).reduce((sum, total) => sum + total, 0)
  }, [stageTotals])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Sales Pipeline</h1>
          <p className="text-muted-foreground text-sm">Manage and track your deals through each stage</p>
        </div>
        <Button 
          className="glass-strong border-white/30 dark:border-slate-700/30 hover:scale-105 transition-transform"
          onClick={() => setDealDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Deal
        </Button>
      </div>

      {/* Pipeline Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-strong border-white/30 dark:border-slate-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Pipeline</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-strong border-white/30 dark:border-slate-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Deals</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(stageStats || {}).reduce((sum, stat) => sum + (stat?.count || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-strong border-white/30 dark:border-slate-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Won Deals</p>
                <p className="text-2xl font-bold text-foreground">
                  {stageStats?.["closed-won"]?.count || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 dark:bg-green-500/20">
                <IndianRupee className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-strong border-white/30 dark:border-slate-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(stageStats || {}).reduce((sum, stat) => sum + (stat?.count || 0), 0) > 0
                    ? Math.round(((stageStats?.["closed-won"]?.count || 0) / Object.values(stageStats || {}).reduce((sum, stat) => sum + (stat?.count || 0), 0)) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <Card key={stage.id} className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardContent className="p-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const total = getStageTotal(stage.id)
            const count = getStageCount(stage.id)
            return (
              <Card 
                key={stage.id} 
                className="glass-strong border-white/30 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-sm text-foreground">{stage.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{formatCurrency(total)}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/40 dark:bg-slate-800/40 text-xs"
                    >
                      {count} {count === 1 ? 'deal' : 'deals'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
        {stages.map((stage) => {
          const deals = getDealsByStage(stage.id)
          const isDraggedOver = draggedOverStage === stage.id
          
          return (
            <div
              key={stage.id}
              className="flex flex-col"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header */}
              <div 
                className="glass-strong border-white/30 dark:border-slate-700/30 p-4 rounded-xl mb-3 transition-all duration-300"
                style={{
                  border: isDraggedOver ? `2px solid ${stage.color}` : undefined,
                  backgroundColor: isDraggedOver ? stage.bgColor : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-semibold text-sm text-foreground">{stage.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-white/50 dark:bg-slate-800/50 font-semibold"
                  >
                    {deals.length}
                  </Badge>
                </div>
                {isDraggedOver && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    <span>Drop here</span>
                  </div>
                )}
              </div>

              {/* Deals */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No deals in this stage</p>
                  </div>
                ) : (
                  deals.map((deal: any) => {
                    const isDragging = draggedDealId === deal.id
                    return (
                      <Card
                        key={deal.id}
                        className={`glass-subtle border-white/30 dark:border-slate-700/30 cursor-move hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                          isDragging ? 'opacity-50 scale-95' : ''
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(deal.id)}
                        style={{
                          borderColor: isDragging ? stage.borderColor : undefined,
                        }}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Company Name */}
                          <div>
                            <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                              {deal.company}
                            </h4>
                            {deal.lead?.company && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                From: {deal.lead.company}
                              </p>
                            )}
                          </div>

                          {/* Deal Value */}
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 dark:bg-primary/10">
                            <span className="font-bold text-base text-foreground">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>

                          {/* Date and Probability */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">
                                {deal.expectedClose 
                                  ? format(new Date(deal.expectedClose), "MMM dd, yyyy")
                                  : "No date"}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs font-semibold px-2 py-0.5"
                              style={{
                                borderColor: stage.borderColor,
                                backgroundColor: stage.bgColor,
                                color: isDark ? stage.colorDark : stage.color,
                              }}
                            >
                              {deal.probability}%
                            </Badge>
                          </div>

                          {/* Owner */}
                          <div className="flex items-center gap-2 pt-2 border-t border-white/20 dark:border-slate-700/20">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                              {deal.owner.name 
                                ? deal.owner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                : deal.owner.email?.substring(0, 2).toUpperCase() || "U"}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1 flex-1">
                              {deal.owner.name || deal.owner.email || "Unassigned"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Deal Dialog */}
      <AddDealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} />
    </div>
  )
}
