"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, User, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/react"
import { format } from "date-fns"

// Map API status to UI status
const statusMap = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
} as const

const statusColumns = ["To Do", "In Progress", "Completed"] as const

// Map UI status to API status
const apiStatusMap: Record<string, "todo" | "in-progress" | "completed"> = {
  "To Do": "todo",
  "In Progress": "in-progress",
  "Completed": "completed",
}

const priorityColors = {
  high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
  medium: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  low: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
}

const statusColors = {
  "To Do": "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Completed": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
}

export default function TasksPage() {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch tasks grouped by status
  const { data: tasksByStatusData, isLoading } = trpc.tasks.getByStatus.useQuery()
  const { data: taskStats } = trpc.tasks.getStats.useQuery()
  const utils = trpc.useUtils()

  // Mutation to update task status
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.tasks.getByStatus.invalidate()
      utils.tasks.getStats.invalidate()
      toast.success("Task status updated")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task status")
    },
  })

  // Mutation to toggle task completion
  const toggleCompleteMutation = trpc.tasks.toggleComplete.useMutation({
    onSuccess: () => {
      utils.tasks.getByStatus.invalidate()
      utils.tasks.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task")
    },
  })

  // Transform API data to match UI structure
  const tasksByStatus = useMemo(() => {
    if (!tasksByStatusData) return {}
    
    const grouped: Record<string, any[]> = {}
    statusColumns.forEach((uiStatus) => {
      const apiStatus = apiStatusMap[uiStatus]
      grouped[uiStatus] = tasksByStatusData[apiStatus] || []
    })
    return grouped
  }, [tasksByStatusData])

  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTaskId(taskId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((uiStatus: typeof statusColumns[number]) => {
    if (draggedTaskId) {
      const apiStatus = apiStatusMap[uiStatus]
      updateStatusMutation.mutate({
        id: draggedTaskId,
        status: apiStatus,
      })
      setDraggedTaskId(null)
    }
  }, [draggedTaskId, updateStatusMutation])

  const getTasksByStatus = useCallback((status: typeof statusColumns[number]) => {
    return tasksByStatus[status] || []
  }, [tasksByStatus])

  const handleToggleComplete = useCallback((taskId: string, currentStatus: string) => {
    toggleCompleteMutation.mutate({ id: taskId })
  }, [toggleCompleteMutation])

  // Format priority for display
  const formatPriority = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  // Get user initials
  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Drag and drop tasks to update status</p>
        </div>
        <Button className="glass-strong border-white/30 dark:border-slate-700/30">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-silver border-white/30 dark:border-slate-700/30">
              <CardContent className="p-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
              <h3 className="text-3xl font-semibold text-foreground">{taskStats?.total || 0}</h3>
            </CardContent>
          </Card>
          <Card className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">To Do</p>
              <h3 className="text-3xl font-semibold text-foreground">{taskStats?.todo || 0}</h3>
            </CardContent>
          </Card>
          <Card className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <h3 className="text-3xl font-semibold text-foreground">{taskStats?.inProgress || 0}</h3>
            </CardContent>
          </Card>
          <Card className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <h3 className="text-3xl font-semibold text-foreground">{taskStats?.completed || 0}</h3>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/40 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            All
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            To Do
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            In Progress
          </Button>
          <Button variant="outline" size="sm" className="glass-subtle border-white/30 dark:border-slate-700/30">
            Completed
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((status) => (
          <div
            key={status}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
          >
            <div className="glass-silver border-white/30 dark:border-slate-700/30 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{status}</h3>
                <Badge variant="secondary" className="bg-white/40 dark:bg-slate-800/40">
                  {tasksByStatus[status]?.length || 0}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (getTasksByStatus(status) || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              ) : (
                (getTasksByStatus(status) || []).map((task: any) => {
                  const isCompleted = task.status === "completed"
                  return (
                    <Card
                      key={task.id}
                      className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleComplete(task.id, task.status)}
                            className="mt-0.5 w-4 h-4 rounded border-white/30 dark:border-slate-700/30"
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm text-foreground mb-1 ${
                              isCompleted ? 'line-through opacity-60' : ''
                            }`}>
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{task.description || "No description"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}>
                            {formatPriority(task.priority)}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline" className="bg-white/40 dark:bg-slate-800/40 border-white/40 dark:border-slate-700/40 text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "No date"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {task.assignedTo?.name || task.assignedTo?.email || "Unassigned"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

