import { createTRPCRouter, protectedTenantProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { Role } from "@prisma/client"

export const activitiesRouter = createTRPCRouter({
  /**
   * Get activity feed with pagination
   */
  list: protectedTenantProcedure
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
      const isAdminOrOwner = ctx.membership.role === Role.OWNER || ctx.membership.role === Role.ADMIN
      const where: any = {
        tenantId: ctx.tenant.id,
      }

      // Filter by user (admins see all, regular users see only their own)
      if (input.userId) {
        if (isAdminOrOwner || input.userId === ctx.prismaUser.id) {
          where.userId = input.userId
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view your own activities",
          })
        }
      } else if (!isAdminOrOwner) {
        // Regular users only see their activities
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

        if (!isAdminOrOwner && lead.assignedToId !== ctx.prismaUser.id) {
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

      // Add tenant isolation
      where.tenantId = ctx.tenant.id

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
  getByUser: protectedTenantProcedure
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
          tenantId: ctx.tenant.id,
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
  getByLead: protectedTenantProcedure
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
          tenantId: ctx.tenant.id,
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
  getByDeal: protectedTenantProcedure
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
          tenantId: ctx.tenant.id,
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
  create: protectedTenantProcedure
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
          tenantId: ctx.tenant.id,
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

