import { createTRPCRouter, protectedTenantProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const usersRouter = createTRPCRouter({
  /**
   * Update user info (admin/owner only)
   */
  update: protectedTenantProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only owner or admin can update users
      if (ctx.membership.role !== "OWNER" && ctx.membership.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can update users",
        })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          email: input.email,
          name: input.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          updatedAt: true,
        },
      })

      return updatedUser
    }),
  /**
   * Get current user profile with membership info
   */
  getCurrent: protectedTenantProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.prismaUser.id,
      email: ctx.prismaUser.email,
      name: ctx.prismaUser.name,
      avatar: ctx.prismaUser.avatar,
      role: ctx.prismaUser.role,
      createdAt: ctx.prismaUser.createdAt,
      updatedAt: ctx.prismaUser.updatedAt,
      membership: {
        role: ctx.membership.role,
        status: ctx.membership.status,
        tenantId: ctx.tenant.id,
        tenantName: ctx.tenant.name,
      },
    }
  }),

  /**
   * Update user profile (users cannot change their own role)
   */
  updateProfile: protectedTenantProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatar: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.prismaUser.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.avatar !== undefined && { avatar: input.avatar }),
          // Note: Role changes are not allowed here - use updateRole endpoint (admin only)
        },
      })

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      }
    }),

  /**
   * List all users (admin only)
   */
  list: protectedTenantProcedure.query(async ({ ctx }) => {
    if (ctx.prismaUser.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all users",
      })
    }

    const users = await ctx.prisma.user.findMany({
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
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return users
  }),

  /**
   * Get user by ID (for admin or own profile)
   */
  getById: protectedTenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Users can only view their own profile unless they're admin
      if (ctx.prismaUser.id !== input.id && ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own profile",
        })
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      return user
    }),
})

