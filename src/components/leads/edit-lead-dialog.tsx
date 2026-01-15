"use client"

import { useState, useEffect } from "react"
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

interface EditLeadDialogProps {
  leadId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLeadDialog({
  leadId,
  open,
  onOpenChange,
}: EditLeadDialogProps) {
  const { data: lead } = trpc.leads.getById.useQuery(
    { id: leadId! },
    { enabled: !!leadId && open }
  )

  const [formData, setFormData] = useState({
    company: "",
    status: "warm" as "hot" | "warm" | "cold",
    source: "",
    industry: "",
    conversionProbability: "0",
    notes: "",
  })

  // Update form when lead data loads
  useEffect(() => {
    if (lead) {
      setFormData({
        company: lead.company,
        status: (lead.status as "hot" | "warm" | "cold") || "warm",
        source: lead.source || "",
        industry: lead.industry || "",
        conversionProbability: (lead.conversionProbability || 0).toString(),
        notes: lead.notes || "",
      })
    }
  }, [lead])

  const utils = trpc.useUtils()
  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate()
      utils.leads.getById.invalidate({ id: leadId! })
      toast.success("Lead updated successfully")
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadId) return

    updateLead.mutate({
      id: leadId,
      company: formData.company,
      status: formData.status,
      notes: formData.notes || null,
      source: formData.source || null,
      industry: formData.industry || null,
      conversionProbability: formData.conversionProbability
        ? parseInt(formData.conversionProbability)
        : null,
    })
  }

  if (!leadId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update lead information and details.
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "hot" | "warm" | "cold") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="Referral, Website, etc."
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionProbability">
                Conversion Probability (%)
              </Label>
              <Input
                id="conversionProbability"
                type="number"
                min="0"
                max="100"
                value={formData.conversionProbability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conversionProbability: e.target.value,
                  })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
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
              disabled={updateLead.isPending}
              className="glass-strong border-white/30 dark:border-slate-700/30"
            >
              {updateLead.isPending ? "Updating..." : "Update Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
