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
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        avatar: z.string().url().optional().nullable(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.prismaUser.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.avatar !== undefined && { avatar: input.avatar }),
          ...(input.role && { role: input.role }),
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

