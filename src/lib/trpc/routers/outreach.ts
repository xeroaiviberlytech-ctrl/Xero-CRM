import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const outreachRouter = createTRPCRouter({
  /**
   * Get outreach history for a lead
   */
  getByLead: protectedProcedure
    .input(z.object({ leadId: z.string() }))
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
          message: "You don't have access to this lead",
        })
      }

      const history = await ctx.prisma.outreachHistory.findMany({
        where: { leadId: input.leadId },
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
      })

      return history
    }),

  /**
   * Create outreach history entry
   */
  create: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        contactId: z.string().optional().nullable(),
        type: z.enum(["call", "email", "meeting", "message", "other"]),
        outcome: z.enum(["positive", "negative", "followup", "neutral"]).optional().nullable(),
        notes: z.string().optional().nullable(),
        contactDate: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
          message: "You don't have permission to add outreach history",
        })
      }

      const outreach = await ctx.prisma.outreachHistory.create({
        data: {
          leadId: input.leadId,
          contactId: input.contactId || undefined,
          userId: ctx.prismaUser.id,
          type: input.type,
          outcome: input.outcome || undefined,
          notes: input.notes || undefined,
          contactDate: input.contactDate || new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return outreach
    }),

  /**
   * Update outreach history entry
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["call", "email", "meeting", "message", "other"]).optional(),
        outcome: z.enum(["positive", "negative", "followup", "neutral"]).optional().nullable(),
        notes: z.string().optional().nullable(),
        contactDate: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const outreach = await ctx.prisma.outreachHistory.findUnique({
        where: { id },
        include: { lead: true },
      })

      if (!outreach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Outreach history entry not found",
        })
      }

      // Only the user who created it or admin can update
      if (outreach.userId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this entry",
        })
      }

      const updated = await ctx.prisma.outreachHistory.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return updated
    }),

  /**
   * Delete outreach history entry
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const outreach = await ctx.prisma.outreachHistory.findUnique({
        where: { id: input.id },
      })

      if (!outreach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Outreach history entry not found",
        })
      }

      // Only the user who created it or admin can delete
      if (outreach.userId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this entry",
        })
      }

      await ctx.prisma.outreachHistory.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
