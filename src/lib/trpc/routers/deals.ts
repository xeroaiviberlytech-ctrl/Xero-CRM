import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const dealsRouter = createTRPCRouter({
  /**
   * Get all deals with optional filters
   */
  list: protectedProcedure
    .input(
      z
        .object({
          stage: z
            .enum(["all", "prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"])
            .optional()
            .default("all"),
          search: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        ownerId: ctx.prismaUser.id, // Only show deals owned by current user
      }

      if (input.stage && input.stage !== "all") {
        where.stage = input.stage
      }

      if (input.search) {
        where.OR = [
          { company: { contains: input.search, mode: "insensitive" } },
          { notes: { contains: input.search, mode: "insensitive" } },
        ]
      }

      const deals = await ctx.prisma.deal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
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
        },
      })

      return deals
    }),

  /**
   * Get deals grouped by stage (for Kanban board)
   */
  getByStage: protectedProcedure.query(async ({ ctx }) => {
    const deals = await ctx.prisma.deal.findMany({
      where: {
        ownerId: ctx.prismaUser.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
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
      },
    })

    // Group deals by stage
    const grouped: Record<string, typeof deals> = {}
    const stages = ["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]

    stages.forEach((stage) => {
      grouped[stage] = deals.filter((deal) => deal.stage === stage)
    })

    return grouped
  }),

  /**
   * Get stage statistics (totals and counts)
   */
  getStageStats: protectedProcedure.query(async ({ ctx }) => {
    const deals = await ctx.prisma.deal.findMany({
      where: {
        ownerId: ctx.prismaUser.id,
      },
      select: {
        stage: true,
        value: true,
      },
    })

    const stages = ["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]
    const stats: Record<
      string,
      {
        total: number
        count: number
      }
    > = {}

    stages.forEach((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage)
      stats[stage] = {
        total: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
        count: stageDeals.length,
      }
    })

    return stats
  }),

  /**
   * Get single deal by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      if (!deal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal not found",
        })
      }

      // Check if user has access to this deal
      if (deal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deal",
        })
      }

      return deal
    }),

  /**
   * Create new deal
   */
  create: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1, "Company name is required"),
        value: z.number().positive("Deal value must be positive"),
        stage: z.enum(["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]),
        probability: z.number().int().min(0).max(100).default(0),
        leadId: z.string().optional().nullable(),
        expectedClose: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
        ownerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If leadId is provided, verify it exists and user has access
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

      const deal = await ctx.prisma.deal.create({
        data: {
          ...input,
          ownerId: input.ownerId || ctx.prismaUser.id,
        },
        include: {
          owner: {
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
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "deal_created",
          title: `Deal created: ${deal.company}`,
          description: `New deal ${deal.company} worth ₹${deal.value.toLocaleString()} was created`,
          userId: ctx.prismaUser.id,
          dealId: deal.id,
          leadId: deal.leadId || undefined,
        },
      })

      return deal
    }),

  /**
   * Update deal
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().min(1).optional(),
        value: z.number().positive().optional(),
        stage: z.enum(["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]).optional(),
        probability: z.number().int().min(0).max(100).optional(),
        expectedClose: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
        ownerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if deal exists and user has access
      const existingDeal = await ctx.prisma.deal.findUnique({
        where: { id },
      })

      if (!existingDeal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal not found",
        })
      }

      if (existingDeal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this deal",
        })
      }

      // Build update data object, filtering out null values
      const cleanUpdateData: {
        company?: string
        notes?: string | null
        value?: number
        stage?: "prospecting" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
        probability?: number
        expectedClose?: Date | null
        ownerId?: string
      } = {}

      if (updateData.company !== undefined) cleanUpdateData.company = updateData.company
      if (updateData.notes !== undefined) cleanUpdateData.notes = updateData.notes
      if (updateData.value !== undefined) cleanUpdateData.value = updateData.value
      if (updateData.stage !== undefined) cleanUpdateData.stage = updateData.stage
      if (updateData.probability !== undefined) cleanUpdateData.probability = updateData.probability
      if (updateData.expectedClose !== undefined) cleanUpdateData.expectedClose = updateData.expectedClose
      if (updateData.ownerId !== undefined && updateData.ownerId !== null) {
        cleanUpdateData.ownerId = updateData.ownerId
      }

      const deal = await ctx.prisma.deal.update({
        where: { id },
        data: cleanUpdateData,
        include: {
          owner: {
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
        },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "deal_updated",
          title: `Deal updated: ${deal.company}`,
          description: `Deal ${deal.company} was updated`,
          userId: ctx.prismaUser.id,
          dealId: deal.id,
        },
      })

      return deal
    }),

  /**
   * Delete deal
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to delete this deal",
        })
      }

      await ctx.prisma.deal.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Update deal stage (for drag & drop in Kanban)
   */
  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stage: z.enum(["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to update this deal",
        })
      }

      const updatedDeal = await ctx.prisma.deal.update({
        where: { id: input.id },
        data: { stage: input.stage },
        include: {
          owner: {
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
        },
      })

      // Create activity log for stage change
      await ctx.prisma.activity.create({
        data: {
          type: "deal_stage_changed",
          title: `Deal moved to ${input.stage}`,
          description: `Deal ${deal.company} was moved to ${input.stage} stage`,
          userId: ctx.prismaUser.id,
          dealId: deal.id,
        },
      })

      return updatedDeal
    }),

  /**
   * Update deal probability
   */
  updateProbability: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        probability: z.number().int().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to update this deal",
        })
      }

      return ctx.prisma.deal.update({
        where: { id: input.id },
        data: { probability: input.probability },
      })
    }),

  /**
   * Update deal owner (reassign)
   */
  updateOwner: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ownerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deal = await ctx.prisma.deal.findUnique({
        where: { id: input.id },
      })

      if (!deal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal not found",
        })
      }

      // Only current owner or admin can reassign
      if (deal.ownerId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to reassign this deal",
        })
      }

      // Verify new owner exists
      const newOwner = await ctx.prisma.user.findUnique({
        where: { id: input.ownerId },
      })

      if (!newOwner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "New owner not found",
        })
      }

      const updatedDeal = await ctx.prisma.deal.update({
        where: { id: input.id },
        data: { ownerId: input.ownerId },
        include: {
          owner: {
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
          type: "deal_reassigned",
          title: `Deal reassigned`,
          description: `Deal ${deal.company} was reassigned to ${newOwner.name}`,
          userId: ctx.prismaUser.id,
          dealId: deal.id,
        },
      })

      return updatedDeal
    }),
})

