"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc/react"
import { toast } from "sonner"

interface AddDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDealDialog({ open, onOpenChange }: AddDealDialogProps) {
  const [formData, setFormData] = useState({
    company: "",
    value: "",
    stage: "prospecting" as
      | "prospecting"
      | "qualified"
      | "proposal"
      | "negotiation"
      | "closed-won"
      | "closed-lost",
    probability: "0",
    expectedClose: "",
    notes: "",
  })

  const utils = trpc.useUtils()
  const createDeal = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate()
      utils.deals.getByStage.invalidate()
      utils.deals.getStageStats.invalidate()
      toast.success("Deal created successfully")
      onOpenChange(false)
      // Reset form
      setFormData({
        company: "",
        value: "",
        stage: "prospecting",
        probability: "0",
        expectedClose: "",
        notes: "",
      })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create deal")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare the mutation data
    const mutationData: {
      company: string
      value: number
      stage: "prospecting" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
      probability: number
      expectedClose?: Date | null
      notes?: string | null
    } = {
      company: formData.company,
      value: parseFloat(formData.value),
      stage: formData.stage,
      probability: parseInt(formData.probability),
      notes: formData.notes || null,
    }
    
    // Only include expectedClose if a date is provided
    if (formData.expectedClose) {
      // Create date at midnight UTC to avoid timezone issues
      const dateStr = formData.expectedClose
      const [year, month, day] = dateStr.split('-').map(Number)
      mutationData.expectedClose = new Date(Date.UTC(year, month - 1, day))
    } else {
      mutationData.expectedClose = null
    }
    
    createDeal.mutate(mutationData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
          <DialogDescription>
            Create a new deal to track in your sales pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                required
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value (₹) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select
                value={formData.stage}
                onValueChange={(
                  value:
                    | "prospecting"
                    | "qualified"
                    | "proposal"
                    | "negotiation"
                    | "closed-won"
                    | "closed-lost"
                ) => setFormData({ ...formData, stage: value })}
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) =>
                  setFormData({ ...formData, probability: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedClose">Expected Close Date</Label>
            <Input
              id="expectedClose"
              type="date"
              value={formData.expectedClose}
              onChange={(e) =>
                setFormData({ ...formData, expectedClose: e.target.value })
              }
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="glass-subtle border-white/30 dark:border-slate-700/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDeal.isPending}
              className="glass-strong border-white/30 dark:border-slate-700/30"
            >
              {createDeal.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

