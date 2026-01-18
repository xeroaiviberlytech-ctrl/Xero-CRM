import { createTRPCRouter, protectedTenantProcedure } from "../server"
import { z } from "zod"

export const filtersRouter = createTRPCRouter({
  /**
   * Get available lead filters
   */
  getLeadFilters: protectedTenantProcedure.query(async ({ ctx }) => {
    const leads = await ctx.prisma.lead.findMany({
      where: {
        tenantId: ctx.tenant.id,
        assignedToId: ctx.prismaUser.id,
      },
      select: {
        temperature: true,
        status: true,
        rating: true,
      },
    })

    // Extract unique values
    const temperatures = Array.from(new Set(leads.map((l) => l.temperature)))
    const statuses = Array.from(new Set(leads.map((l) => l.status)))
    const ratings = Array.from(new Set(leads.map((l) => l.rating))).sort((a, b) => a - b)

    return {
      temperatures: temperatures.filter((t) => t !== null) as string[],
      statuses: statuses.filter((s) => s !== null) as string[],
      ratings: ratings.filter((r) => r !== null) as number[],
    }
  }),

  /**
   * Get available deal filters
   */
  getDealFilters: protectedTenantProcedure.query(async ({ ctx }) => {
    const deals = await ctx.prisma.deal.findMany({
      where: {
        tenantId: ctx.tenant.id,
        ownerId: ctx.prismaUser.id,
      },
      select: {
        stage: true,
        probability: true,
      },
    })

    // Extract unique values
    const stages = Array.from(new Set(deals.map((d) => d.stage)))
    const probabilityRanges = [
      { label: "0-25%", min: 0, max: 25 },
      { label: "26-50%", min: 26, max: 50 },
      { label: "51-75%", min: 51, max: 75 },
      { label: "76-100%", min: 76, max: 100 },
    ]

    return {
      stages: stages.filter((s) => s !== null) as string[],
      probabilityRanges,
    }
  }),

  /**
   * Get available task filters
   */
  getTaskFilters: protectedTenantProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany({
      where: {
        tenantId: ctx.tenant.id,
        assignedToId: ctx.prismaUser.id,
      },
      select: {
        status: true,
        priority: true,
        category: true,
      },
    })

    // Extract unique values
    const statuses = Array.from(new Set(tasks.map((t) => t.status)))
    const priorities = Array.from(new Set(tasks.map((t) => t.priority)))
    const categories = Array.from(new Set(tasks.map((t) => t.category).filter((c) => c !== null)))

    return {
      statuses: statuses.filter((s) => s !== null) as string[],
      priorities: priorities.filter((p) => p !== null) as string[],
      categories: categories as string[],
    }
  }),

  /**
   * Get available campaign filters
   */
  getCampaignFilters: protectedTenantProcedure.query(async ({ ctx }) => {
    const campaigns = await ctx.prisma.campaign.findMany({
      where: {
        tenantId: ctx.tenant.id,
        createdById: ctx.prismaUser.id,
      },
      select: {
        status: true,
        type: true,
      },
    })

    // Extract unique values
    const statuses = Array.from(new Set(campaigns.map((c) => c.status)))
    const types = Array.from(new Set(campaigns.map((c) => c.type)))

    return {
      statuses: statuses.filter((s) => s !== null) as string[],
      types: types.filter((t) => t !== null) as string[],
    }
  }),

  /**
   * Apply multiple filters to leads
   */
  applyLeadFilters: protectedTenantProcedure
    .input(
      z.object({
        temperature: z.array(z.enum(["hot", "warm", "cold"])).optional(),
        status: z.array(z.enum(["new", "contacted", "qualified", "converted", "lost"])).optional(),
        rating: z.array(z.number().int().min(0).max(5)).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        assignedToId: ctx.prismaUser.id,
      }

      if (input.temperature && input.temperature.length > 0) {
        where.temperature = { in: input.temperature }
      }

      if (input.status && input.status.length > 0) {
        where.status = { in: input.status }
      }

      if (input.rating && input.rating.length > 0) {
        where.rating = { in: input.rating }
      }

      if (input.minValue !== undefined || input.maxValue !== undefined) {
        where.dealValue = {}
        if (input.minValue !== undefined) {
          where.dealValue.gte = input.minValue
        }
        if (input.maxValue !== undefined) {
          where.dealValue.lte = input.maxValue
        }
      }

      const leads = await ctx.prisma.lead.findMany({
        where,
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

      return leads
    }),

  /**
   * Apply multiple filters to deals
   */
  applyDealFilters: protectedTenantProcedure
    .input(
      z.object({
        stage: z
          .array(z.enum(["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]))
          .optional(),
        minProbability: z.number().int().min(0).max(100).optional(),
        maxProbability: z.number().int().min(0).max(100).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        ownerId: ctx.prismaUser.id,
      }

      if (input.stage && input.stage.length > 0) {
        where.stage = { in: input.stage }
      }

      if (input.minProbability !== undefined || input.maxProbability !== undefined) {
        where.probability = {}
        if (input.minProbability !== undefined) {
          where.probability.gte = input.minProbability
        }
        if (input.maxProbability !== undefined) {
          where.probability.lte = input.maxProbability
        }
      }

      if (input.minValue !== undefined || input.maxValue !== undefined) {
        where.value = {}
        if (input.minValue !== undefined) {
          where.value.gte = input.minValue
        }
        if (input.maxValue !== undefined) {
          where.value.lte = input.maxValue
        }
      }

      const deals = await ctx.prisma.deal.findMany({
        where,
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
            },
          },
        },
      })

      return deals
    }),
})

