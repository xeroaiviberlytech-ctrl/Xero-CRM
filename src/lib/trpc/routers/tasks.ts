import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const tasksRouter = createTRPCRouter({
  /**
   * Get all tasks with optional filters
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["all", "todo", "in-progress", "completed"]).optional().default("all"),
          priority: z.enum(["all", "low", "medium", "high"]).optional().default("all"),
          search: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        assignedToId: ctx.prismaUser.id, // Only show tasks assigned to current user
      }

      if (input.status && input.status !== "all") {
        where.status = input.status
      }

      if (input.priority && input.priority !== "all") {
        where.priority = input.priority
      }

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
          { category: { contains: input.search, mode: "insensitive" } },
        ]
      }

      const tasks = await ctx.prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return tasks
    }),

  /**
   * Get tasks grouped by status (for Kanban board)
   */
  getByStatus: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany({
      where: {
        assignedToId: ctx.prismaUser.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Group tasks by status
    const grouped: Record<string, typeof tasks> = {}
    const statuses = ["todo", "in-progress", "completed"]

    statuses.forEach((status) => {
      grouped[status] = tasks.filter((task) => task.status === status)
    })

    return grouped
  }),

  /**
   * Get task statistics (total, by status counts)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany({
      where: {
        assignedToId: ctx.prismaUser.id,
      },
      select: {
        status: true,
      },
    })

    const statuses = ["todo", "in-progress", "completed"]
    const stats: Record<
      string,
      {
        count: number
      }
    > = {}

    statuses.forEach((status) => {
      stats[status] = {
        count: tasks.filter((task) => task.status === status).length,
      }
    })

    return {
      total: tasks.length,
      todo: stats.todo.count,
      inProgress: stats["in-progress"].count,
      completed: stats.completed.count,
    }
  }),

  /**
   * Get single task by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      // Check if user has access to this task
      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this task",
        })
      }

      return task
    }),

  /**
   * Create new task
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Task title is required"),
        description: z.string().optional().nullable(),
        status: z.enum(["todo", "in-progress", "completed"]).default("todo"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        category: z.string().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        assignedToId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If assignedToId is provided, verify user exists
      const assignedToId = input.assignedToId || ctx.prismaUser.id

      if (input.assignedToId) {
        const assignedUser = await ctx.prisma.user.findUnique({
          where: { id: input.assignedToId },
        })

        if (!assignedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assigned user not found",
          })
        }
      }

      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          assignedToId,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "task_created",
          title: `Task created: ${task.title}`,
          description: `New task ${task.title} was created`,
          userId: ctx.prismaUser.id,
        },
      })

      return task
    }),

  /**
   * Update task
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        status: z.enum(["todo", "in-progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        category: z.string().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        assignedToId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if task exists and user has access
      const existingTask = await ctx.prisma.task.findUnique({
        where: { id },
      })

      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      if (existingTask.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this task",
        })
      }

      // Build update data object, filtering out null values
      const cleanUpdateData: {
        title?: string
        description?: string | null
        status?: "todo" | "in-progress" | "completed"
        priority?: "low" | "medium" | "high"
        category?: string | null
        dueDate?: Date | null
        assignedToId?: string
      } = {}

      if (updateData.title !== undefined) cleanUpdateData.title = updateData.title
      if (updateData.description !== undefined) cleanUpdateData.description = updateData.description
      if (updateData.status !== undefined) cleanUpdateData.status = updateData.status
      if (updateData.priority !== undefined) cleanUpdateData.priority = updateData.priority
      if (updateData.category !== undefined) cleanUpdateData.category = updateData.category
      if (updateData.dueDate !== undefined) cleanUpdateData.dueDate = updateData.dueDate
      if (updateData.assignedToId !== undefined && updateData.assignedToId !== null) {
        cleanUpdateData.assignedToId = updateData.assignedToId
      }

      // If reassigning, verify new assignee exists
      if (cleanUpdateData.assignedToId) {
        const newAssignee = await ctx.prisma.user.findUnique({
          where: { id: cleanUpdateData.assignedToId },
        })

        if (!newAssignee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assigned user not found",
          })
        }
      }

      const task = await ctx.prisma.task.update({
        where: { id },
        data: cleanUpdateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "task_updated",
          title: `Task updated: ${task.title}`,
          description: `Task ${task.title} was updated`,
          userId: ctx.prismaUser.id,
        },
      })

      return task
    }),

  /**
   * Delete task
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this task",
        })
      }

      await ctx.prisma.task.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Update task status (for drag & drop in Kanban)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["todo", "in-progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this task",
        })
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create activity log for status change
      await ctx.prisma.activity.create({
        data: {
          type: "task_status_changed",
          title: `Task moved to ${input.status}`,
          description: `Task ${task.title} was moved to ${input.status} status`,
          userId: ctx.prismaUser.id,
        },
      })

      return updatedTask
    }),

  /**
   * Update task priority
   */
  updatePriority: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this task",
        })
      }

      return ctx.prisma.task.update({
        where: { id: input.id },
        data: { priority: input.priority },
      })
    }),

  /**
   * Toggle task completion
   */
  toggleComplete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this task",
        })
      }

      const newStatus = task.status === "completed" ? "todo" : "completed"

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: { status: newStatus },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "task_completed",
          title: `Task ${newStatus === "completed" ? "completed" : "reopened"}: ${task.title}`,
          description: `Task ${task.title} was ${newStatus === "completed" ? "marked as completed" : "reopened"}`,
          userId: ctx.prismaUser.id,
        },
      })

      return updatedTask
    }),

  /**
   * Assign task to user
   */
  assign: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assignedToId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      })

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        })
      }

      // Only current assignee or admin can reassign
      if (task.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to reassign this task",
        })
      }

      // Verify new assignee exists
      const newAssignee = await ctx.prisma.user.findUnique({
        where: { id: input.assignedToId },
      })

      if (!newAssignee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assigned user not found",
        })
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: { assignedToId: input.assignedToId },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "task_reassigned",
          title: `Task reassigned`,
          description: `Task ${task.title} was reassigned to ${newAssignee.name}`,
          userId: ctx.prismaUser.id,
        },
      })

      return updatedTask
    }),
})

