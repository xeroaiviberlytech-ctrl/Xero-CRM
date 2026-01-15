import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const contactsRouter = createTRPCRouter({
  /**
   * Get all contacts for a lead
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

      const contacts = await ctx.prisma.contact.findMany({
        where: { leadId: input.leadId },
        orderBy: [
          { isPrimary: "desc" },
          { createdAt: "asc" },
        ],
      })

      return contacts
    }),

  /**
   * Create new contact for a lead
   */
  create: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        name: z.string().min(1, "Contact name is required"),
        designation: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        isPrimary: z.boolean().default(false),
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
          message: "You don't have permission to add contacts to this lead",
        })
      }

      // If setting as primary, unset other primary contacts
      if (input.isPrimary) {
        await ctx.prisma.contact.updateMany({
          where: { leadId: input.leadId, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      const contact = await ctx.prisma.contact.create({
        data: {
          ...input,
          leadId: input.leadId,
        },
      })

      return contact
    }),

  /**
   * Update contact
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        designation: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        isPrimary: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Get contact to verify access
      const contact = await ctx.prisma.contact.findUnique({
        where: { id },
        include: { lead: true },
      })

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        })
      }

      if (contact.lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this contact",
        })
      }

      // If setting as primary, unset other primary contacts
      if (updateData.isPrimary) {
        await ctx.prisma.contact.updateMany({
          where: { leadId: contact.leadId, isPrimary: true, id: { not: id } },
          data: { isPrimary: false },
        })
      }

      const updatedContact = await ctx.prisma.contact.update({
        where: { id },
        data: updateData,
      })

      return updatedContact
    }),

  /**
   * Delete contact
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.findUnique({
        where: { id: input.id },
        include: { lead: true },
      })

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        })
      }

      if (contact.lead.assignedToId !== ctx.prismaUser.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this contact",
        })
      }

      await ctx.prisma.contact.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
