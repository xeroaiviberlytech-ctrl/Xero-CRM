"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IndianRupee, Calendar, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"
import { AddDealDialog } from "@/components/dialogs/add-deal-dialog"

const stages = [
  { id: "prospecting", name: "Prospecting", color: "hsl(230, 100%, 58%)" },
  { id: "qualified", name: "Qualified", color: "hsl(223, 30%, 46%)" },
  { id: "proposal", name: "Proposal", color: "hsl(142, 71%, 45%)" },
  { id: "negotiation", name: "Negotiation", color: "hsl(38, 92%, 50%)" },
  { id: "closed-won", name: "Closed Won", color: "hsl(142, 71%, 45%)" },
]

export default function PipelinePage() {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((stageId: string) => {
    if (draggedDealId) {
      updateStageMutation.mutate({
        id: draggedDealId,
        stage: stageId as "prospecting" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost",
      })
      setDraggedDealId(null)
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
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag and drop deals to update stages</p>
        </div>
        <Button 
          className="glass-strong border-white/30 dark:border-slate-700/30"
          onClick={() => setDealDialogOpen(true)}
        >
          Add New Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => (
            <Card key={stage.id} className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardContent className="p-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => {
            const total = getStageTotal(stage.id)
            const count = getStageCount(stage.id)
            return (
              <Card key={stage.id} className="glass-silver border-white/30 dark:border-slate-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-medium text-sm text-foreground">{stage.name}</h3>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{count} deals</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-300px)]">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            {/* Stage Header */}
            <div className="glass-silver border-white/30 dark:border-slate-700/30 p-3 rounded-xl mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium text-sm text-foreground">{stage.name}</span>
                </div>
                <Badge variant="secondary" className="bg-white/40 dark:bg-slate-800/40">
                  {getDealsByStage(stage.id).length}
                </Badge>
              </div>
            </div>

            {/* Deals */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (getDealsByStage(stage.id) || []).map((deal: any) => (
                <Card
                  key={deal.id}
                  className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(deal.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {deal.company}
                      </h4>
                      <p className="text-xs text-muted-foreground">{deal.lead?.company || "No lead"}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <IndianRupee className="w-3 h-3 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{deal.expectedClose ? format(new Date(deal.expectedClose), "MMM dd, yyyy") : "No date"}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-white/40 dark:bg-slate-800/40 border-white/40 dark:border-slate-700/40 text-xs"
                      >
                        {deal.probability}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                        {deal.owner.name ? deal.owner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : "U"}
                      </div>
                      <span className="text-xs text-muted-foreground">{deal.owner.name || deal.owner.email}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Dialog */}
      <AddDealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} />
    </div>
  )
}
