import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"

export const analyticsRouter = createTRPCRouter({
  /**
   * Get dashboard statistics (KPI cards)
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Get total revenue from closed deals
    const closedDeals = await ctx.prisma.deal.findMany({
      where: {
        ownerId: ctx.prismaUser.id,
        stage: "closed-won",
      },
      select: {
        value: true,
        createdAt: true,
      },
    })

    const totalRevenue = closedDeals.reduce((sum, deal) => sum + deal.value, 0)

    // Get active leads count
    const activeLeads = await ctx.prisma.lead.findMany({
      where: {
        assignedToId: ctx.prismaUser.id,
        status: {
          not: "lost",
        },
      },
      select: {
        id: true,
      },
    })

    // Calculate conversion rate
    const totalLeads = await ctx.prisma.lead.count({
      where: {
        assignedToId: ctx.prismaUser.id,
      },
    })

    const convertedLeads = await ctx.prisma.lead.count({
      where: {
        assignedToId: ctx.prismaUser.id,
        status: "converted",
      },
    })

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Get active campaigns count
    const activeCampaigns = await ctx.prisma.campaign.count({
      where: {
        createdById: ctx.prismaUser.id,
        status: "active",
      },
    })

    // Calculate percentage changes (simplified - can be enhanced with date ranges)
    // For now, we'll return static values - can be enhanced later with actual comparisons
    const revenueChange = "+12.5%" // TODO: Calculate from previous period
    const leadsChange = "+8.2%" // TODO: Calculate from previous period
    const conversionChange = "-2.4%" // TODO: Calculate from previous period
    const campaignsChange = "+3" // TODO: Calculate from previous period

    return {
      totalRevenue: {
        value: totalRevenue,
        formatted: `₹${(totalRevenue / 100000).toFixed(1)}L`,
        change: revenueChange,
        trend: "up" as const,
      },
      activeLeads: {
        value: activeLeads.length,
        formatted: activeLeads.length.toLocaleString(),
        change: leadsChange,
        trend: "up" as const,
      },
      conversionRate: {
        value: conversionRate,
        formatted: `${conversionRate.toFixed(1)}%`,
        change: conversionChange,
        trend: conversionRate > 20 ? ("up" as const) : ("down" as const),
      },
      activeCampaigns: {
        value: activeCampaigns,
        formatted: activeCampaigns.toString(),
        change: campaignsChange,
        trend: "up" as const,
      },
    }
  }),

  /**
   * Get revenue vs target chart data
   */
  getRevenueTrend: protectedProcedure
    .input(
      z
        .object({
          period: z.enum(["month", "quarter", "year"]).optional().default("month"),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Get deals grouped by month
      const deals = await ctx.prisma.deal.findMany({
        where: {
          ownerId: ctx.prismaUser.id,
          stage: "closed-won",
        },
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
  getPipelineDistribution: protectedProcedure.query(async ({ ctx }) => {
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
    const distribution = stages.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage)
      const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      return {
        stage,
        value: totalValue,
        count: stageDeals.length,
        percentage: deals.length > 0 ? (stageDeals.length / deals.length) * 100 : 0,
      }
    })

    return distribution
  }),

  /**
   * Get recent activities for dashboard
   */
  getRecentActivities: protectedProcedure
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
  getDealsClosed: protectedProcedure
    .input(
      z.object({
        period: z.enum(["week", "month", "quarter", "year"]).optional().default("quarter"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date()
      let startDate: Date

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

      const deals = await ctx.prisma.deal.findMany({
        where: {
          ownerId: ctx.prismaUser.id,
          stage: "closed-won",
          createdAt: {
            gte: startDate,
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
  getAverageDealSize: protectedProcedure.query(async ({ ctx }) => {
    const deals = await ctx.prisma.deal.findMany({
      where: {
        ownerId: ctx.prismaUser.id,
        stage: "closed-won",
      },
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
  getTeamPerformance: protectedProcedure.query(async ({ ctx }) => {
    // Get all users (if admin) or just current user
    const users = ctx.prismaUser.role === "admin"
      ? await ctx.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [ctx.prismaUser]

    const performance = await Promise.all(
      users.map(async (user) => {
        const deals = await ctx.prisma.deal.findMany({
          where: {
            ownerId: user.id,
            stage: "closed-won",
          },
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
  getLeadSources: protectedProcedure.query(async ({ ctx }) => {
    // Note: This requires a 'source' field in Lead model
    // For now, we'll return a placeholder structure
    // You can enhance this when you add source tracking to leads

    const leads = await ctx.prisma.lead.findMany({
      where: {
        assignedToId: ctx.prismaUser.id,
      },
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
  getCampaignPerformance: protectedProcedure
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

