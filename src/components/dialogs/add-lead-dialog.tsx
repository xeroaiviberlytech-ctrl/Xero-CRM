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

interface AddLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
  const [formData, setFormData] = useState({
    company: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    temperature: "warm" as "hot" | "warm" | "cold",
    dealValue: "",
    rating: "0",
    status: "new" as "new" | "contacted" | "qualified" | "converted" | "lost",
    notes: "",
  })

  const utils = trpc.useUtils()
  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate()
      toast.success("Lead created successfully")
      onOpenChange(false)
      // Reset form
      setFormData({
        company: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        temperature: "warm",
        dealValue: "",
        rating: "0",
        status: "new",
        notes: "",
      })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create lead")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createLead.mutate({
      company: formData.company,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail || null,
      contactPhone: formData.contactPhone || null,
      temperature: formData.temperature,
      dealValue: formData.dealValue ? parseFloat(formData.dealValue) : null,
      rating: parseInt(formData.rating),
      status: formData.status,
      notes: formData.notes || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead to track in your CRM system.
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
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                required
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Select
                value={formData.temperature}
                onValueChange={(value: "hot" | "warm" | "cold") =>
                  setFormData({ ...formData, temperature: value })
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
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal Value (₹)</Label>
              <Input
                id="dealValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.dealValue}
                onChange={(e) =>
                  setFormData({ ...formData, dealValue: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) =>
                  setFormData({ ...formData, rating: value })
                }
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(
                value: "new" | "contacted" | "qualified" | "converted" | "lost"
              ) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={createLead.isPending}
              className="glass-strong border-white/30 dark:border-slate-700/30"
            >
              {createLead.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}






