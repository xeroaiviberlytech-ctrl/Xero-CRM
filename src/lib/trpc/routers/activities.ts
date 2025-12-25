import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const activitiesRouter = createTRPCRouter({
  /**
   * Get activity feed with pagination
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional().default(20),
          cursor: z.string().optional(), // For pagination
          leadId: z.string().optional(),
          dealId: z.string().optional(),
          userId: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      // Filter by user (default to current user unless admin)
      if (input.userId) {
        if (ctx.prismaUser.role === "admin" || input.userId === ctx.prismaUser.id) {
          where.userId = input.userId
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view your own activities",
          })
        }
      } else {
        where.userId = ctx.prismaUser.id
      }

      // Filter by lead if provided
      if (input.leadId) {
        // Verify user has access to this lead
        const lead = await ctx.prisma.lead.findUnique({
          where: { id: input.leadId },
        })

        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          })
        }

        if (lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this lead's activities",
          })
        }

        where.leadId = input.leadId
      }

      // Filter by deal if provided
      if (input.dealId) {
        // Verify user has access to this deal
        const deal = await ctx.prisma.deal.findUnique({
          where: { id: input.dealId },
        })

        if (!deal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Deal not found",
          })
        }

        if (deal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this deal's activities",
          })
        }

        where.dealId = input.dealId
      }

      const activities = await ctx.prisma.activity.findMany({
        where,
        take: input.limit + 1, // Take one extra to check if there's more
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              company: true,
              contactName: true,
            },
          },
          deal: {
            select: {
              id: true,
              company: true,
              value: true,
            },
          },
        },
      })

      let nextCursor: string | undefined = undefined
      if (activities.length > input.limit) {
        const nextItem = activities.pop()
        nextCursor = nextItem?.id
      }

      return {
        activities,
        nextCursor,
      }
    }),

  /**
   * Get activities for specific user
   */
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().int().min(1).max(100).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Users can only view their own activities unless admin
      if (input.userId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own activities",
        })
      }

      const activities = await ctx.prisma.activity.findMany({
        where: {
          userId: input.userId,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              company: true,
            },
          },
          deal: {
            select: {
              id: true,
              company: true,
              value: true,
            },
          },
        },
      })

      return activities
    }),

  /**
   * Get activities for specific lead
   */
  getByLead: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        limit: z.number().int().min(1).max(100).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has access to this lead
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.leadId },
      })

      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        })
      }

      if (lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this lead's activities",
        })
      }

      const activities = await ctx.prisma.activity.findMany({
        where: {
          leadId: input.leadId,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              company: true,
            },
          },
        },
      })

      return activities
    }),

  /**
   * Get activities for specific deal
   */
  getByDeal: protectedProcedure
    .input(
      z.object({
        dealId: z.string(),
        limit: z.number().int().min(1).max(100).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has access to this deal
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.dealId },
      })

      if (!deal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal not found",
        })
      }

      if (deal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deal's activities",
        })
      }

      const activities = await ctx.prisma.activity.findMany({
        where: {
          dealId: input.dealId,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          deal: {
            select: {
              id: true,
              company: true,
              value: true,
            },
          },
        },
      })

      return activities
    }),

  /**
   * Create activity log entry
   */
  create: protectedProcedure
    .input(
      z.object({
        type: z.string().min(1, "Activity type is required"),
        title: z.string().min(1, "Activity title is required"),
        description: z.string().optional().nullable(),
        leadId: z.string().optional().nullable(),
        dealId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify access to lead if provided
      if (input.leadId) {
        const lead = await ctx.prisma.lead.findUnique({
          where: { id: input.leadId },
        })

        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          })
        }

        if (lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this lead",
          })
        }
      }

      // Verify access to deal if provided
      if (input.dealId) {
        const deal = await ctx.prisma.deal.findUnique({
          where: { id: input.dealId },
        })

        if (!deal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Deal not found",
          })
        }

        if (deal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this deal",
          })
        }
      }

      const activity = await ctx.prisma.activity.create({
        data: {
          type: input.type,
          title: input.title,
          description: input.description,
          userId: ctx.prismaUser.id,
          leadId: input.leadId || undefined,
          dealId: input.dealId || undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              company: true,
            },
          },
          deal: {
            select: {
              id: true,
              company: true,
              value: true,
            },
          },
        },
      })

      return activity
    }),
})

