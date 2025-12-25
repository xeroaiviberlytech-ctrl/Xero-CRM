import { initTRPC, TRPCError } from "@trpc/server"
import { ZodError } from "zod"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma/client"
import type { User as PrismaUser } from "@prisma/client"

/**
 * Get or create Prisma User from Supabase auth user
 * This syncs Supabase authentication with our Prisma User model
 */
async function getOrCreatePrismaUser(supabaseUserId: string, email: string, name?: string): Promise<PrismaUser> {
  // Try to find existing user
  let prismaUser = await prisma.user.findUnique({
    where: { supabaseUserId },
  })

  // If not found, try by email
  if (!prismaUser) {
    prismaUser = await prisma.user.findUnique({
      where: { email },
    })
  }

  // If still not found, create new user
  if (!prismaUser) {
    prismaUser = await prisma.user.create({
      data: {
        supabaseUserId,
        email,
        name: name || email.split("@")[0],
        role: "user",
      },
    })
  } else if (!prismaUser.supabaseUserId) {
    // If user exists but doesn't have supabaseUserId, update it
    prismaUser = await prisma.user.update({
      where: { id: prismaUser.id },
      data: { supabaseUserId },
    })
  }

  return prismaUser
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Get Supabase user from server
  let supabaseUser = null
  let prismaUser: PrismaUser | null = null

  try {
    const supabase = await createClient()
    if (supabase && typeof supabase.auth?.getUser === "function") {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      supabaseUser = user

      // If we have a Supabase user, sync with Prisma User
      if (supabaseUser?.id && supabaseUser?.email) {
        try {
          prismaUser = await getOrCreatePrismaUser(
            supabaseUser.id,
            supabaseUser.email,
            supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name
          )
        } catch (error) {
          console.error("Error syncing Prisma user:", error)
          // Continue without prismaUser if sync fails
        }
      }
    }
  } catch (error) {
    // Supabase not configured or auth failed - continue without user
    // This is expected during development if Supabase is not set up yet
    console.warn("Supabase auth check failed:", error)
  }

  return {
    ...opts,
    user: supabaseUser,
    prismaUser, // Add Prisma user to context
    prisma,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.prismaUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Supabase user - guaranteed to exist
      prismaUser: ctx.prismaUser, // Prisma user - guaranteed to exist
    },
  })
})
