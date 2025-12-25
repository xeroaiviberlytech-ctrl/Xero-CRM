import { createTRPCRouter, protectedProcedure } from "../server"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const usersRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.prismaUser.id,
      email: ctx.prismaUser.email,
      name: ctx.prismaUser.name,
      avatar: ctx.prismaUser.avatar,
      role: ctx.prismaUser.role,
      createdAt: ctx.prismaUser.createdAt,
      updatedAt: ctx.prismaUser.updatedAt,
    }
  }),

  /**
   * Update user profile (users cannot change their own role)
   */
  updateProfile: protectedProcedure
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
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.prismaUser.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all users",
      })
    }

    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return users
  }),

  /**
   * Update user role (admin only)
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can change roles
      if (ctx.prismaUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can change user roles",
        })
      }

      // Prevent admins from removing their own admin role
      if (input.userId === ctx.prismaUser.id && input.role === "user") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove your own admin role",
        })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      })

      return updatedUser
    }),

  /**
   * Get user by ID (for admin or own profile)
   */
  getById: protectedProcedure
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

