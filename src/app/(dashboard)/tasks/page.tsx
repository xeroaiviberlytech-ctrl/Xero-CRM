"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: number
  title: string
  description: string
  assignee: string
  dueDate: string
  priority: "High" | "Medium" | "Low"
  status: "To Do" | "In Progress" | "Completed"
  completed: boolean
  category: string
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Follow up with Acme Corp",
    description: "Send proposal and schedule demo",
    assignee: "Sarah Chen",
    dueDate: "2024-01-20",
    priority: "High",
    status: "In Progress",
    completed: false,
    category: "Sales",
  },
  {
    id: 2,
    title: "Prepare Q1 sales report",
    description: "Compile data and create presentation",
    assignee: "Mike Johnson",
    dueDate: "2024-01-22",
    priority: "High",
    status: "To Do",
    completed: false,
    category: "Reporting",
  },
  {
    id: 3,
    title: "Update CRM data",
    description: "Clean and verify lead information",
    assignee: "Emma Davis",
    dueDate: "2024-01-18",
    priority: "Medium",
    status: "In Progress",
    completed: false,
    category: "Admin",
  },
  {
    id: 4,
    title: "Review contract with Global Solutions",
    description: "Legal review and approval needed",
    assignee: "Alex Kumar",
    dueDate: "2024-01-25",
    priority: "High",
    status: "To Do",
    completed: false,
    category: "Legal",
  },
  {
    id: 5,
    title: "Schedule team meeting",
    description: "Weekly sync with sales team",
    assignee: "Lisa Wang",
    dueDate: "2024-01-19",
    priority: "Low",
    status: "Completed",
    completed: true,
    category: "Meeting",
  },
  {
    id: 6,
    title: "Send invoice to TechStart",
    description: "Q1 services invoice",
    assignee: "Sarah Chen",
    dueDate: "2024-01-21",
    priority: "Medium",
    status: "To Do",
    completed: false,
    category: "Finance",
  },
]

const statusColumns = ["To Do", "In Progress", "Completed"] as const

const priorityColors = {
  High: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
  Medium: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Low: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
}

const statusColors = {
  "To Do": "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Completed": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: typeof statusColumns[number]) => {
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status, completed: status === "Completed" }
          : task
      ))
      toast.success(`Task moved to ${status}`)
      setDraggedTask(null)
    }
  }

  const getTasksByStatus = (status: typeof statusColumns[number]) => {
    return tasks.filter(task => task.status === status)
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-silver border-white/30 dark:border-slate-700/30">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
            <h3 className="text-3xl font-semibold text-foreground">{tasks.length}</h3>
          </CardContent>
        </Card>
        {statusColumns.map((status) => (
          <Card key={status} className="glass-silver border-white/30 dark:border-slate-700/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{status}</p>
              <h3 className="text-3xl font-semibold text-foreground">
                {getTasksByStatus(status).length}
              </h3>
            </CardContent>
          </Card>
        ))}
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
                <Badge className={statusColors[status]}>
                  {getTasksByStatus(status).length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(status).map((task) => (
                <Card
                  key={task.id}
                  className="glass-subtle border-white/30 dark:border-slate-700/30 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className={`font-medium text-sm text-foreground mb-1 ${
                        task.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-white/40 dark:bg-slate-800/40 border-white/40 dark:border-slate-700/40 text-xs">
                        {task.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
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

