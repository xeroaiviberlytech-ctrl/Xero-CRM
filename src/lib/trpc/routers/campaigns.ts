import { createTRPCRouter, protectedTenantProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const campaignsRouter = createTRPCRouter({
  /**
   * Get all campaigns with optional filters
   */
  list: protectedTenantProcedure
    .input(
      z
        .object({
          status: z.enum(["all", "draft", "active", "paused", "completed"]).optional().default("all"),
          type: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
      }

      // Regular users only see their created campaigns, admins/owners see all
      if (ctx.membership.role === "USER") {
        where.createdById = ctx.prismaUser.id
      }

      if (input.status && input.status !== "all") {
        where.status = input.status
      }

      if (input.type) {
        where.type = input.type
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ]
      }

      const campaigns = await ctx.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return campaigns
    }),

  /**
   * Get single campaign by ID
   */
  getById: protectedTenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        })
      }

      // Check if user has access to this campaign
      if (campaign.createdById !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this campaign",
        })
      }

      return campaign
    }),

  /**
   * Create new campaign
   */
  create: protectedTenantProcedure
    .input(
      z.object({
        name: z.string().min(1, "Campaign name is required"),
        description: z.string().optional().nullable(),
        type: z.string().min(1, "Campaign type is required"), // email, social, sms, etc.
        status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
        startDate: z.coerce.date().optional().nullable(),
        endDate: z.coerce.date().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate date range if both dates are provided
      if (input.startDate && input.endDate && input.startDate > input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date",
        })
      }

      const campaign = await ctx.prisma.campaign.create({
        data: {
          ...input,
          tenantId: ctx.tenant.id, // Guaranteed to exist by middleware
          createdById: ctx.prismaUser.id,
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
        },
        include: {
          createdBy: {
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
          type: "campaign_created",
          title: `Campaign created: ${campaign.name}`,
          description: `New campaign ${campaign.name} was created`,
          userId: ctx.prismaUser.id,
          tenantId: ctx.tenant.id, // Guaranteed to exist by middleware
        },
      })

      return campaign
    }),

  /**
   * Update campaign
   */
  update: protectedTenantProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        type: z.string().optional(),
        status: z.enum(["draft", "active", "paused", "completed"]).optional(),
        startDate: z.coerce.date().optional().nullable(),
        endDate: z.coerce.date().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if campaign exists and user has access
      const existingCampaign = await ctx.prisma.campaign.findUnique({
        where: { id },
      })

      if (!existingCampaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        })
      }

      if (existingCampaign.createdById !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this campaign",
        })
      }

      // Validate date range if both dates are provided
      const startDate = updateData.startDate ?? existingCampaign.startDate
      const endDate = updateData.endDate ?? existingCampaign.endDate
      if (startDate && endDate && startDate > endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Start date must be before end date",
        })
      }

      const campaign = await ctx.prisma.campaign.update({
        where: {
          id,
          tenantId: ctx.tenant.id,
        },
        data: updateData,
        include: {
          createdBy: {
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
          type: "campaign_updated",
          title: `Campaign updated: ${campaign.name}`,
          description: `Campaign ${campaign.name} was updated`,
          userId: ctx.prismaUser.id,
          tenantId: ctx.tenant.id,
        },
      })

      return campaign
    }),

  /**
   * Delete campaign
   */
  delete: protectedTenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        })
      }

      if (campaign.createdById !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this campaign",
        })
      }

      await ctx.prisma.campaign.delete({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
      })

      return { success: true }
    }),

  /**
   * Update campaign status
   */
  updateStatus: protectedTenantProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["draft", "active", "paused", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        })
      }

      if (campaign.createdById !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this campaign",
        })
      }

      const updatedCampaign = await ctx.prisma.campaign.update({
        where: {
          id: input.id,
          tenantId: ctx.tenant.id,
        },
        data: { status: input.status },
        include: {
          createdBy: {
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
          type: "campaign_status_changed",
          title: `Campaign status changed to ${input.status}`,
          description: `Campaign ${campaign.name} status was changed to ${input.status}`,
          userId: ctx.prismaUser.id,
          tenantId: ctx.tenant.id,
        },
      })

      return updatedCampaign
    }),

  /**
   * Update campaign metrics
   */
  updateMetrics: protectedTenantProcedure
    .input(
      z.object({
        id: z.string(),
        sent: z.number().int().min(0).optional(),
        opened: z.number().int().min(0).optional(),
        clicked: z.number().int().min(0).optional(),
        converted: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...metrics } = input

      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        })
      }

      if (campaign.createdById !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this campaign",
        })
      }

      // Build update data with only provided metrics
      const updateData: any = {}
      if (metrics.sent !== undefined) updateData.sent = metrics.sent
      if (metrics.opened !== undefined) updateData.opened = metrics.opened
      if (metrics.clicked !== undefined) updateData.clicked = metrics.clicked
      if (metrics.converted !== undefined) updateData.converted = metrics.converted

      return ctx.prisma.campaign.update({
        where: {
          id,
          tenantId: ctx.tenant.id,
        },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    }),

  /**
   * Get campaign statistics
   */
  getStats: protectedTenantProcedure.query(async ({ ctx }) => {
    const campaigns = await ctx.prisma.campaign.findMany({
      where: {
        tenantId: ctx.tenant.id,
        createdById: ctx.prismaUser.id,
      },
      select: {
        sent: true,
        opened: true,
        clicked: true,
        converted: true,
      },
    })

    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0)
    const totalConverted = campaigns.reduce((sum, c) => sum + c.converted, 0)

    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    const avgConversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalOpened,
      totalClicked,
      totalConverted,
      avgOpenRate: Number(avgOpenRate.toFixed(1)),
      avgClickRate: Number(avgClickRate.toFixed(1)),
      avgConversionRate: Number(avgConversionRate.toFixed(1)),
    }
  }),

  /**
   * Get campaign performance trends over time
   */
  getPerformance: protectedTenantProcedure
    .input(
      z
        .object({
          period: z.enum(["week", "month", "quarter"]).optional().default("month"),
          campaignId: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // This would typically aggregate data over time periods
      // For now, return basic structure - can be enhanced with actual time-series data
      const where: any = {
        tenantId: ctx.tenant.id,
        createdById: ctx.prismaUser.id,
      }

      if (input.campaignId) {
        where.id = input.campaignId
      }

      const campaigns = await ctx.prisma.campaign.findMany({
        where,
        select: {
          id: true,
          name: true,
          sent: true,
          opened: true,
          clicked: true,
          converted: true,
          createdAt: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: "desc" },
      })

      // Group by period (simplified - can be enhanced)
      return campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        sent: campaign.sent,
        opened: campaign.opened,
        clicked: campaign.clicked,
        converted: campaign.converted,
        openRate: campaign.sent > 0 ? Number(((campaign.opened / campaign.sent) * 100).toFixed(1)) : 0,
        clickRate: campaign.opened > 0 ? Number(((campaign.clicked / campaign.opened) * 100).toFixed(1)) : 0,
        conversionRate: campaign.clicked > 0 ? Number(((campaign.converted / campaign.clicked) * 100).toFixed(1)) : 0,
        date: campaign.startDate || campaign.createdAt,
      }))
    }),
})

