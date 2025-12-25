import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const leadsRouter = createTRPCRouter({
  /**
   * Get all leads with optional filters
   */
  list: protectedProcedure
    .input(
      z
        .object({
          temperature: z.enum(["all", "hot", "warm", "cold"]).optional().default("all"),
          search: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        assignedToId: ctx.prismaUser.id, // Only show leads assigned to current user
      }

      if (input.temperature && input.temperature !== "all") {
        where.temperature = input.temperature
      }

      if (input.search) {
        where.OR = [
          { company: { contains: input.search, mode: "insensitive" } },
          { contactName: { contains: input.search, mode: "insensitive" } },
          { contactEmail: { contains: input.search, mode: "insensitive" } },
        ]
      }

      const leads = await ctx.prisma.lead.findMany({
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

      return leads
    }),

  /**
   * Get single lead by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.id },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          deals: {
            select: {
              id: true,
              company: true,
              value: true,
              stage: true,
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

      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        })
      }

      // Check if user has access to this lead
      if (lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this lead",
        })
      }

      return lead
    }),

  /**
   * Create new lead
   */
  create: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1, "Company name is required"),
        contactName: z.string().min(1, "Contact name is required"),
        contactEmail: z.string().email().optional().nullable(),
        contactPhone: z.string().optional().nullable(),
        temperature: z.enum(["hot", "warm", "cold"]).default("warm"),
        dealValue: z.number().positive().optional().nullable(),
        rating: z.number().int().min(0).max(5).default(0),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).default("new"),
        notes: z.string().optional().nullable(),
        assignedToId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.lead.create({
        data: {
          ...input,
          assignedToId: input.assignedToId || ctx.prismaUser.id,
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
          type: "lead_created",
          title: `Lead created: ${lead.company}`,
          description: `New lead ${lead.company} was created`,
          userId: ctx.prismaUser.id,
          leadId: lead.id,
        },
      })

      return lead
    }),

  /**
   * Update lead
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().min(1).optional(),
        contactName: z.string().min(1).optional(),
        contactEmail: z.string().email().optional().nullable(),
        contactPhone: z.string().optional().nullable(),
        temperature: z.enum(["hot", "warm", "cold"]).optional(),
        dealValue: z.number().positive().optional().nullable(),
        rating: z.number().int().min(0).max(5).optional(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
        notes: z.string().optional().nullable(),
        assignedToId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if lead exists and user has access
      const existingLead = await ctx.prisma.lead.findUnique({
        where: { id },
      })

      if (!existingLead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        })
      }

      if (existingLead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this lead",
        })
      }

      const lead = await ctx.prisma.lead.update({
        where: { id },
        data: updateData,
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
          type: "lead_updated",
          title: `Lead updated: ${lead.company}`,
          description: `Lead ${lead.company} was updated`,
          userId: ctx.prismaUser.id,
          leadId: lead.id,
        },
      })

      return lead
    }),

  /**
   * Delete lead
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to delete this lead",
        })
      }

      await ctx.prisma.lead.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Update lead temperature
   */
  updateTemperature: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        temperature: z.enum(["hot", "warm", "cold"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to update this lead",
        })
      }

      return ctx.prisma.lead.update({
        where: { id: input.id },
        data: { temperature: input.temperature },
      })
    }),

  /**
   * Update lead rating
   */
  updateRating: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().int().min(0).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.lead.findUnique({
        where: { id: input.id },
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
          message: "You don't have permission to update this lead",
        })
      }

      return ctx.prisma.lead.update({
        where: { id: input.id },
        data: { rating: input.rating },
      })
    }),

  /**
   * Convert lead to deal
   */
  convertToDeal: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        value: z.number().positive(),
        stage: z.enum(["prospecting", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]),
        probability: z.number().int().min(0).max(100).default(0),
        expectedClose: z.coerce.date().optional().nullable(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
          message: "You don't have permission to convert this lead",
        })
      }

      // Create deal from lead
      const deal = await ctx.prisma.deal.create({
        data: {
          company: lead.company,
          value: input.value,
          stage: input.stage,
          probability: input.probability,
          ownerId: ctx.prismaUser.id,
          leadId: lead.id,
          expectedClose: input.expectedClose,
          notes: input.notes,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: true,
        },
      })

      // Update lead status to converted
      await ctx.prisma.lead.update({
        where: { id: input.leadId },
        data: { status: "converted" },
      })

      // Create activity log
      await ctx.prisma.activity.create({
        data: {
          type: "deal_created",
          title: `Deal created from lead: ${deal.company}`,
          description: `Lead ${lead.company} was converted to a deal worth ₹${input.value.toLocaleString()}`,
          userId: ctx.prismaUser.id,
          leadId: lead.id,
          dealId: deal.id,
        },
      })

      return deal
    }),
})

