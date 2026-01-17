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
          status: z.enum(["all", "hot", "warm", "cold"]).optional().default("all"),
          search: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        assignedToId: ctx.prismaUser.id, // Only show leads assigned to current user
      }

      if (input.status && input.status !== "all") {
        where.status = input.status
      }

      if (input.search) {
        where.OR = [
          { company: { contains: input.search, mode: "insensitive" } },
          { contactName: { contains: input.search, mode: "insensitive" } },
          { contactEmail: { contains: input.search, mode: "insensitive" } },
        ]
      }

      try {
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
      } catch (error: any) {
        // Handle missing columns gracefully
        if (error.message?.includes("does not exist") || error.message?.includes("conversionProbability") || error.message?.includes("source")) {
          console.error("Database schema mismatch - missing columns:", error.message)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database schema is out of sync. Please run the SQL in prisma/add_missing_lead_columns.sql to add missing columns (conversionProbability, source, industry).",
          })
        }
        throw error
      }
    }),

  /**
   * Get single lead by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Try to fetch with all relations, but handle gracefully if some don't exist yet
      let lead;
      try {
        lead = await ctx.prisma.lead.findUnique({
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
            contacts: {
              orderBy: [
                { isPrimary: "desc" },
                { createdAt: "asc" },
              ],
            },
            outreachHistory: {
              orderBy: { contactDate: "desc" },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                contact: {
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
      } catch (error: any) {
        // If Contact table or related tables don't exist yet (migration not run), fetch without them
        if (
          error.message?.includes("Contact") || 
          error.message?.includes("contacts") || 
          error.message?.includes("outreachHistory") ||
          error.message?.includes("does not exist")
        ) {
          lead = await ctx.prisma.lead.findUnique({
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
          // Add empty arrays for contacts and outreachHistory
          if (lead) {
            (lead as any).contacts = []
            ;(lead as any).outreachHistory = []
          }
        } else {
          throw error
        }
      }

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
          rating: z.number().int().min(0).max(5).default(0),
        status: z.enum(["hot", "warm", "cold"]).default("warm"),
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
        rating: z.number().int().min(0).max(5).optional(),
        status: z.enum(["hot", "warm", "cold"]).optional(),
        notes: z.string().optional().nullable(),
        assignedToId: z.string().optional().nullable(),
        source: z.string().optional().nullable(),
        industry: z.string().optional().nullable(),
        conversionProbability: z.number().int().min(0).max(100).optional().nullable(),
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

      // Update lead status to hot (converted to deal)
      await ctx.prisma.lead.update({
        where: { id: input.leadId },
        data: { status: "hot" },
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

