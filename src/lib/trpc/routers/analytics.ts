import { createTRPCRouter, protectedTenantProcedure } from "../server"
import { z } from "zod"
import { Role } from "@prisma/client"

export const analyticsRouter = createTRPCRouter({
  /**
   * Get dashboard statistics (KPI cards)
   */
  getDashboardStats: protectedTenantProcedure.query(async ({ ctx }) => {
    // Define date ranges: current period (last 30 days) and previous period (30-60 days ago)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Determine if user should see all data or just their own
    const isAdminOrOwner = ctx.membership.role === Role.OWNER || ctx.membership.role === Role.ADMIN
    
    // Build base filters
    const dealFilter: any = { tenantId: ctx.tenant.id }
    const leadFilter: any = { tenantId: ctx.tenant.id }
    const campaignFilter: any = { tenantId: ctx.tenant.id }
    
    if (!isAdminOrOwner) {
      dealFilter.ownerId = ctx.prismaUser.id
      leadFilter.assignedToId = ctx.prismaUser.id
      campaignFilter.createdById = ctx.prismaUser.id
    }

    // Run all queries in parallel for better performance
    const [
      currentRevenueResult,
      previousRevenueResult,
      activeLeadsCount,
      previousPeriodActiveLeads,
      totalLeads,
      convertedLeads,
      previousTotalLeads,
      previousConvertedLeads,
      activeCampaigns,
      previousActiveCampaigns,
    ] = await Promise.all([
      // Current period revenue - use aggregation for better performance
      ctx.prisma.deal.aggregate({
        where: {
          ...dealFilter,
          stage: "closed-won",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { value: true },
      }),
      // Previous period revenue
      ctx.prisma.deal.aggregate({
        where: {
          ...dealFilter,
          stage: "closed-won",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { value: true },
      }),
      // Active leads count - current
      ctx.prisma.lead.count({
        where: {
          ...leadFilter,
          status: { not: "lost" },
        },
      }),
      // Active leads count - previous period
      ctx.prisma.lead.count({
        where: {
          ...leadFilter,
          status: { not: "lost" },
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // Total leads count
      ctx.prisma.lead.count({
        where: leadFilter,
      }),
      // Converted leads count
      ctx.prisma.lead.count({
        where: {
          ...leadFilter,
          status: "converted",
        },
      }),
      // Previous period total leads
      ctx.prisma.lead.count({
        where: {
          ...leadFilter,
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
      // Previous period converted leads
      ctx.prisma.lead.count({
        where: {
          ...leadFilter,
          status: "converted",
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
      // Active campaigns count
      ctx.prisma.campaign.count({
        where: {
          ...campaignFilter,
          status: "active",
        },
      }),
      // Previous active campaigns count
      ctx.prisma.campaign.count({
        where: {
          ...campaignFilter,
          status: "active",
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
    ])

    // Calculate values from aggregated results
    const totalRevenue = currentRevenueResult._sum.value || 0
    const previousRevenue = previousRevenueResult._sum.value || 0
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0

    const leadsChange = previousPeriodActiveLeads > 0
      ? ((activeLeadsCount - previousPeriodActiveLeads) / previousPeriodActiveLeads) * 100
      : activeLeadsCount > previousPeriodActiveLeads ? 100 : 0

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    const previousConversionRate = previousTotalLeads > 0
      ? (previousConvertedLeads / previousTotalLeads) * 100
      : 0
    const conversionChange = previousConversionRate > 0
      ? conversionRate - previousConversionRate
      : conversionRate > 0 ? conversionRate : 0

    const campaignsChange = activeCampaigns - previousActiveCampaigns

    // Format changes
    const formatChange = (value: number, isPercentage: boolean = true): string => {
      if (isPercentage) {
        const sign = value >= 0 ? "+" : ""
        return `${sign}${value.toFixed(1)}%`
      } else {
        const sign = value >= 0 ? "+" : ""
        return `${sign}${value}`
      }
    }

    const revenueChangeFormatted = formatChange(revenueChange, true)
    const leadsChangeFormatted = formatChange(leadsChange, true)
    const conversionChangeFormatted = formatChange(conversionChange, true)
    const campaignsChangeFormatted = formatChange(campaignsChange, false)

    return {
      totalRevenue: {
        value: totalRevenue,
        formatted: totalRevenue >= 10000000
          ? `₹${(totalRevenue / 10000000).toFixed(1)}Cr`
          : totalRevenue >= 100000
          ? `₹${(totalRevenue / 100000).toFixed(1)}L`
          : totalRevenue >= 1000
          ? `₹${(totalRevenue / 1000).toFixed(1)}k`
          : `₹${totalRevenue.toFixed(0)}`,
        change: revenueChangeFormatted,
        trend: revenueChange >= 0 ? ("up" as const) : ("down" as const),
      },
      activeLeads: {
        value: activeLeadsCount,
        formatted: activeLeadsCount.toLocaleString(),
        change: leadsChangeFormatted,
        trend: leadsChange >= 0 ? ("up" as const) : ("down" as const),
      },
      conversionRate: {
        value: conversionRate,
        formatted: `${conversionRate.toFixed(1)}%`,
        change: conversionChangeFormatted,
        trend: conversionChange >= 0 ? ("up" as const) : ("down" as const),
      },
      activeCampaigns: {
        value: activeCampaigns,
        formatted: activeCampaigns.toString(),
        change: campaignsChangeFormatted,
        trend: campaignsChange >= 0 ? ("up" as const) : ("down" as const),
      },
    }
  }),

  /**
   * Get revenue vs target chart data
   */
  getRevenueTrend: protectedTenantProcedure
    .input(
      z
        .object({
          period: z.enum(["month", "quarter", "year"]).optional().default("month"),
          startDate: z.coerce.date().optional().nullable(),
          endDate: z.coerce.date().optional().nullable(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Determine date range
      let startDate: Date
      let endDate = new Date()

      if (input?.startDate && input?.endDate) {
        // Use provided date range
        startDate = input.startDate
        endDate = input.endDate
      } else {
        // Default to last 6 months
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 6)
      }

      // Get deals grouped by month - optimized query
      const dealFilter: any = {
        tenantId: ctx.tenant.id,
        stage: "closed-won",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }

      // Regular users only see their deals
      if (ctx.membership.role === Role.USER) {
        dealFilter.ownerId = ctx.prismaUser.id
      }

      const deals = await ctx.prisma.deal.findMany({
        where: dealFilter,
        select: {
          value: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      })

      // Group by month (simplified - can be enhanced)
      const monthlyData: Record<string, number> = {}
      deals.forEach((deal) => {
        const month = deal.createdAt.toISOString().substring(0, 7) // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + deal.value
      })

      // Convert to array format for chart
      const revenueData = Object.entries(monthlyData)
        .map(([month, value]) => ({
          month,
          revenue: value,
          target: value * 1.2, // Example: target is 20% higher
        }))
        .slice(-6) // Last 6 months

      return revenueData
    }),

  /**
   * Get pipeline distribution chart data
   */
  getPipelineDistribution: protectedTenantProcedure
    .input(
      z
        .object({
          startDate: z.coerce.date().optional().nullable(),
          endDate: z.coerce.date().optional().nullable(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Use aggregation for better performance - get counts and sums per stage
      const stages = ["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]
      
      // Build where clause with optional date range
      const where: any = {
        tenantId: ctx.tenant.id,
      }

      // Regular users only see their deals
      if (ctx.membership.role === Role.USER) {
        where.ownerId = ctx.prismaUser.id
      }

      if (input?.startDate && input?.endDate) {
        where.createdAt = {
          gte: input.startDate,
          lte: input.endDate,
        }
      }
      
      // Get all deals with minimal data
      const deals = await ctx.prisma.deal.findMany({
        where,
        select: {
          stage: true,
          value: true,
        },
      })

    const totalDeals = deals.length

    // Calculate distribution efficiently
    const distribution = stages.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage)
      const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      return {
        name: stage.charAt(0).toUpperCase() + stage.slice(1).replace("-", " "),
        stage,
        value: totalValue,
        count: stageDeals.length,
        percentage: totalDeals > 0 ? (stageDeals.length / totalDeals) * 100 : 0,
      }
    })

    return distribution
  }),

  /**
   * Get recent activities for dashboard
   */
  getRecentActivities: protectedTenantProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).optional().default(10),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const activities = await ctx.prisma.activity.findMany({
        where: {
          tenantId: ctx.tenant.id,
          userId: ctx.prismaUser.id,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
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

      // Format activities for display
      return activities.map((activity) => {
        const timeAgo = getTimeAgo(activity.createdAt)
        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          user: {
            id: activity.user.id,
            name: activity.user.name,
            email: activity.user.email,
            initials: activity.user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U",
          },
          lead: activity.lead,
          deal: activity.deal,
          time: timeAgo,
          createdAt: activity.createdAt,
        }
      })
    }),

  /**
   * Get deals closed in period
   */
  getDealsClosed: protectedTenantProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "quarter", "year"]).optional().default("quarter"),
        startDate: z.coerce.date().optional().nullable(),
        endDate: z.coerce.date().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      let startDate: Date
      let endDate = new Date()

      if (input.startDate && input.endDate) {
        // Use provided date range
        startDate = input.startDate
        endDate = input.endDate
      } else {
        // Use period-based calculation
        const now = new Date()
        switch (input.period) {
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case "quarter":
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
            break
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        }
      }

      const deals = await ctx.prisma.deal.findMany({
        where: {
          tenantId: ctx.tenant.id,
          ownerId: ctx.prismaUser.id,
          stage: "closed-won",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          company: true,
          value: true,
          createdAt: true,
        },
      })

      return {
        count: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
        deals,
      }
    }),

  /**
   * Get average deal size
   */
  getAverageDealSize: protectedTenantProcedure
    .input(
      z
        .object({
          startDate: z.coerce.date().optional().nullable(),
          endDate: z.coerce.date().optional().nullable(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        ownerId: ctx.prismaUser.id,
        stage: "closed-won",
      }

      if (input?.startDate && input?.endDate) {
        where.createdAt = {
          gte: input.startDate,
          lte: input.endDate,
        }
      }

      const deals = await ctx.prisma.deal.findMany({
        where,
        select: {
          value: true,
        },
      })

    if (deals.length === 0) {
      return {
        average: 0,
        formatted: "₹0",
        count: 0,
      }
    }

    const average = deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length

    return {
      average,
      formatted: `₹${(average / 100000).toFixed(1)}L`,
      count: deals.length,
    }
  }),

  /**
   * Get team performance metrics
   */
  getTeamPerformance: protectedTenantProcedure
    .input(
      z
        .object({
          startDate: z.coerce.date().optional().nullable(),
          endDate: z.coerce.date().optional().nullable(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Get all users (if admin) or just current user
      const users = ctx.prismaUser.role === "admin"
        ? await ctx.prisma.user.findMany({
            where: {
              memberships: {
                some: {
                  tenantId: ctx.tenant.id,
                  status: "active",
                },
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          })
        : [ctx.prismaUser]

      const performance = await Promise.all(
        users.map(async (user) => {
        const dealWhere: any = {
          tenantId: ctx.tenant.id,
          ownerId: user.id,
          stage: "closed-won",
        }

        if (input?.startDate && input?.endDate) {
          dealWhere.createdAt = {
            gte: input.startDate,
            lte: input.endDate,
          }
        }

        const deals = await ctx.prisma.deal.findMany({
          where: dealWhere,
          select: {
            value: true,
          },
        })

        const leads = await ctx.prisma.lead.count({
          where: {
            assignedToId: user.id,
          },
        })

        const convertedLeads = await ctx.prisma.lead.count({
          where: {
            assignedToId: user.id,
            status: "converted",
          },
        })

        return {
          userId: user.id,
          userName: user.name || user.email,
          totalRevenue: deals.reduce((sum, deal) => sum + deal.value, 0),
          dealsClosed: deals.length,
          leadsCount: leads,
          conversionRate: leads > 0 ? (convertedLeads / leads) * 100 : 0,
        }
      })
    )

    return performance
  }),

  /**
   * Get lead sources breakdown
   */
  getLeadSources: protectedTenantProcedure
    .input(
      z
        .object({
          startDate: z.coerce.date().optional().nullable(),
          endDate: z.coerce.date().optional().nullable(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Note: This requires a 'source' field in Lead model
      // For now, we'll return a placeholder structure
      // You can enhance this when you add source tracking to leads

      const where: any = {
        tenantId: ctx.tenant.id,
        assignedToId: ctx.prismaUser.id,
      }

      if (input?.startDate && input?.endDate) {
        where.createdAt = {
          gte: input.startDate,
          lte: input.endDate,
        }
      }

      const leads = await ctx.prisma.lead.findMany({
        where,
        select: {
          id: true,
          // source: true, // Uncomment when source field is added
        },
      })

    // Placeholder - group by source when available
    return {
      sources: [
        { name: "Referral", count: 0, percentage: 0 },
        { name: "LinkedIn", count: 0, percentage: 0 },
        { name: "Cold Outreach", count: 0, percentage: 0 },
        { name: "Website", count: 0, percentage: 0 },
        { name: "Other", count: 0, percentage: 0 },
      ],
      total: leads.length,
    }
  }),

  /**
   * Get campaign performance trends
   */
  getCampaignPerformance: protectedTenantProcedure
    .input(
      z
        .object({
          period: z.enum(["week", "month", "quarter"]).optional().default("month"),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const campaigns = await ctx.prisma.campaign.findMany({
        where: {
          tenantId: ctx.tenant.id,
          createdById: ctx.prismaUser.id,
        },
        select: {
          id: true,
          name: true,
          sent: true,
          opened: true,
          clicked: true,
          converted: true,
          createdAt: true,
          startDate: true,
        },
        orderBy: { createdAt: "desc" },
      })

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

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`
}

