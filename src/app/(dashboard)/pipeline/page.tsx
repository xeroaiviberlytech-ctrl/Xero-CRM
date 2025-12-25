"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IndianRupee, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface Deal {
  id: number
  title: string
  company: string
  value: number
  stage: string
  owner: string
  closeDate: string
  probability: number
}

const stages = [
  { id: "prospecting", name: "Prospecting", color: "hsl(230, 100%, 58%)" },
  { id: "qualified", name: "Qualified", color: "hsl(223, 30%, 46%)" },
  { id: "proposal", name: "Proposal", color: "hsl(142, 71%, 45%)" },
  { id: "negotiation", name: "Negotiation", color: "hsl(38, 92%, 50%)" },
  { id: "closed-won", name: "Closed Won", color: "hsl(142, 71%, 45%)" },
]

const initialDeals: Deal[] = [
  { id: 1, title: "Enterprise Solution for Acme", company: "Acme Corp", value: 45000, stage: "prospecting", owner: "Sarah Chen", closeDate: "2024-02-15", probability: 20 },
  { id: 2, title: "Cloud Migration Project", company: "TechStart", value: 32000, stage: "qualified", owner: "Mike Johnson", closeDate: "2024-02-20", probability: 40 },
  { id: 3, title: "CRM Implementation", company: "Global Solutions", value: 67000, stage: "proposal", owner: "Emma Davis", closeDate: "2024-02-10", probability: 60 },
  { id: 4, title: "Security Audit Service", company: "Innovate Labs", value: 28000, stage: "negotiation", owner: "Alex Kumar", closeDate: "2024-02-05", probability: 80 },
  { id: 5, title: "Data Analytics Platform", company: "Future Systems", value: 54000, stage: "prospecting", owner: "Lisa Wang", closeDate: "2024-02-25", probability: 20 },
  { id: 6, title: "Website Redesign", company: "Smart Dynamics", value: 18000, stage: "qualified", owner: "Sarah Chen", closeDate: "2024-02-18", probability: 50 },
  { id: 7, title: "Mobile App Development", company: "Digital Ventures", value: 95000, stage: "proposal", owner: "Mike Johnson", closeDate: "2024-02-12", probability: 65 },
  { id: 8, title: "Annual Support Contract", company: "Peak Performance", value: 42000, stage: "closed-won", owner: "Emma Davis", closeDate: "2024-01-30", probability: 100 },
]

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)

  // Memoize deals by stage to avoid recalculating on every render
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {}
    stages.forEach(stage => {
      grouped[stage.id] = deals.filter(deal => deal.stage === stage.id)
    })
    return grouped
  }, [deals])

  // Memoize stage totals
  const stageTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    stages.forEach(stage => {
      totals[stage.id] = dealsByStage[stage.id].reduce((sum, deal) => sum + deal.value, 0)
    })
    return totals
  }, [dealsByStage])

  const handleDragStart = useCallback((deal: Deal) => {
    setDraggedDeal(deal)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((stageId: string) => {
    if (draggedDeal) {
      const stage = stages.find(s => s.id === stageId)
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === draggedDeal.id 
            ? { ...deal, stage: stageId }
            : deal
        )
      )
      toast.success(`Deal moved to ${stage?.name || stageId}`)
      setDraggedDeal(null)
    }
  }, [draggedDeal])

  const getDealsByStage = useCallback((stageId: string) => {
    return dealsByStage[stageId] || []
  }, [dealsByStage])

  const getStageTotal = useCallback((stageId: string) => {
    return stageTotals[stageId] || 0
  }, [stageTotals])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag and drop deals to update stages</p>
        </div>
        <Button className="glass-strong border-white/30 dark:border-slate-700/30">
          Add New Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage) => {
          const total = getStageTotal(stage.id)
          const count = dealsByStage[stage.id]?.length || 0
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
                <p className="text-2xl font-semibold text-foreground">${(total / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground mt-1">{count} deals</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
              {(dealsByStage[stage.id] || []).map((deal) => (
                <Card
                  key={deal.id}
                  className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(deal)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{deal.company}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <IndianRupee className="w-3 h-3 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        ${(deal.value / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{deal.closeDate}</span>
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
                        {deal.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-muted-foreground">{deal.owner}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
