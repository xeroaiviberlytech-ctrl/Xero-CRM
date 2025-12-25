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
import { Calendar } from "lucide-react"

interface DateRangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (startDate: Date | null, endDate: Date | null) => void
  initialStartDate?: Date | null
  initialEndDate?: Date | null
}

export function DateRangeDialog({ 
  open, 
  onOpenChange, 
  onApply,
  initialStartDate,
  initialEndDate 
}: DateRangeDialogProps) {
  const [startDate, setStartDate] = useState(
    initialStartDate ? new Date(initialStartDate).toISOString().split('T')[0] : ""
  )
  const [endDate, setEndDate] = useState(
    initialEndDate ? new Date(initialEndDate).toISOString().split('T')[0] : ""
  )

  // Reset form when dialog opens/closes or initial dates change
  useEffect(() => {
    if (open) {
      setStartDate(initialStartDate ? new Date(initialStartDate).toISOString().split('T')[0] : "")
      setEndDate(initialEndDate ? new Date(initialEndDate).toISOString().split('T')[0] : "")
    }
  }, [open, initialStartDate, initialEndDate])

  const handleApply = () => {
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    if (start && end && start > end) {
      alert("Start date must be before end date")
      return
    }
    
    onApply(start, end)
    onOpenChange(false)
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    onApply(null, null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>
            Choose a date range for filtering analytics data
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/40 dark:bg-slate-800/40"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="glass-subtle border-white/30 dark:border-slate-700/30"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="glass-strong border-white/30 dark:border-slate-700/30"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

