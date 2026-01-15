import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"

export const searchRouter = createTRPCRouter({
  /**
   * Global search across leads, deals, and contacts
   */
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().int().min(1).max(50).optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // Search leads
      const leads = await ctx.prisma.lead.findMany({
        where: {
          assignedToId: ctx.prismaUser.id,
          OR: [
            { company: { contains: input.query, mode: "insensitive" } },
            { contactName: { contains: input.query, mode: "insensitive" } },
            { contactEmail: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          company: true,
          contactName: true,
          contactEmail: true,
          temperature: true,
        },
      })

      // Search deals
      const deals = await ctx.prisma.deal.findMany({
        where: {
          ownerId: ctx.prismaUser.id,
          OR: [
            { company: { contains: input.query, mode: "insensitive" } },
            { notes: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          company: true,
          value: true,
          stage: true,
        },
      })

      // Format results
      const results = [
        ...leads.map((lead) => ({
          id: lead.id,
          type: "lead" as const,
          title: lead.company,
          subtitle: lead.contactName,
          description: lead.contactEmail,
          metadata: {
            temperature: lead.temperature,
          },
        })),
        ...deals.map((deal) => ({
          id: deal.id,
          type: "deal" as const,
          title: deal.company,
          subtitle: `Stage: ${deal.stage}`,
          description: `Value: ₹${(deal.value / 1000).toFixed(0)}k`,
          metadata: {
            stage: deal.stage,
            value: deal.value,
          },
        })),
      ]

      return {
        query: input.query,
        results,
        total: results.length,
        leadsCount: leads.length,
        dealsCount: deals.length,
      }
    }),

  /**
   * Search leads only
   */
  leads: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().int().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const leads = await ctx.prisma.lead.findMany({
        where: {
          assignedToId: ctx.prismaUser.id,
          OR: [
            { company: { contains: input.query, mode: "insensitive" } },
            { contactName: { contains: input.query, mode: "insensitive" } },
            { contactEmail: { contains: input.query, mode: "insensitive" } },
            { contactPhone: { contains: input.query, mode: "insensitive" } },
            { notes: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
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
   * Search deals only
   */
  deals: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().int().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const deals = await ctx.prisma.deal.findMany({
        where: {
          ownerId: ctx.prismaUser.id,
          OR: [
            { company: { contains: input.query, mode: "insensitive" } },
            { notes: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
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
   * Search contacts (from leads)
   */
  contacts: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().int().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const leads = await ctx.prisma.lead.findMany({
        where: {
          assignedToId: ctx.prismaUser.id,
          OR: [
            { contactName: { contains: input.query, mode: "insensitive" } },
            { contactEmail: { contains: input.query, mode: "insensitive" } },
            { contactPhone: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        select: {
          id: true,
          company: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          temperature: true,
        },
      })

      // Format as contacts
      return leads.map((lead) => ({
        id: lead.id,
        name: lead.contactName,
        email: lead.contactEmail,
        phone: lead.contactPhone,
        company: lead.company,
        temperature: lead.temperature,
      }))
    }),
})

