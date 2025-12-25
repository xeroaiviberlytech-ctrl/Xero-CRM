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

interface AddCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCampaignDialog({
  open,
  onOpenChange,
}: AddCampaignDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    status: "draft" as "draft" | "active" | "paused" | "completed",
    startDate: "",
    endDate: "",
  })

  const utils = trpc.useUtils()
  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      utils.campaigns.list.invalidate()
      toast.success("Campaign created successfully")
      onOpenChange(false)
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "",
        status: "draft",
        startDate: "",
        endDate: "",
      })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create campaign")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const mutationData: {
      name: string
      description?: string | null
      type: string
      status: "draft" | "active" | "paused" | "completed"
      startDate?: Date | null
      endDate?: Date | null
    } = {
      name: formData.name,
      description: formData.description || null,
      type: formData.type,
      status: formData.status,
    }
    
    // Only include dates if provided
    if (formData.startDate) {
      const dateStr = formData.startDate
      const [year, month, day] = dateStr.split('-').map(Number)
      mutationData.startDate = new Date(Date.UTC(year, month - 1, day))
    } else {
      mutationData.startDate = null
    }
    
    if (formData.endDate) {
      const dateStr = formData.endDate
      const [year, month, day] = dateStr.split('-').map(Number)
      mutationData.endDate = new Date(Date.UTC(year, month - 1, day))
    } else {
      mutationData.endDate = null
    }
    
    createCampaign.mutate(mutationData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
          <DialogDescription>
            Create a new marketing campaign to track performance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "draft" | "active" | "paused" | "completed"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
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
              disabled={createCampaign.isPending}
              className="glass-strong border-white/30 dark:border-slate-700/30"
            >
              {createCampaign.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

