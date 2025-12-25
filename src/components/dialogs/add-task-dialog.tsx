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

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as "todo" | "in-progress" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    category: "",
    dueDate: "",
  })

  const utils = trpc.useUtils()
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate()
      utils.tasks.getByStatus.invalidate()
      utils.tasks.getStats.invalidate()
      toast.success("Task created successfully")
      onOpenChange(false)
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        category: "",
        dueDate: "",
      })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const mutationData: {
      title: string
      description?: string | null
      status: "todo" | "in-progress" | "completed"
      priority: "low" | "medium" | "high"
      category?: string | null
      dueDate?: Date | null
    } = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      category: formData.category || null,
    }
    
    // Only include dueDate if a date is provided
    if (formData.dueDate) {
      const dateStr = formData.dueDate
      const [year, month, day] = dateStr.split('-').map(Number)
      mutationData.dueDate = new Date(Date.UTC(year, month - 1, day))
    } else {
      mutationData.dueDate = null
    }
    
    createTask.mutate(mutationData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-silver border-white/30 dark:border-slate-700/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track in your task management system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "todo" | "in-progress" | "completed") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-white/40 dark:bg-slate-800/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="bg-white/40 dark:bg-slate-800/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
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
              disabled={createTask.isPending}
              className="glass-strong border-white/30 dark:border-slate-700/30"
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

