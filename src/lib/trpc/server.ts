import { initTRPC, TRPCError } from "@trpc/server"
import { ZodError } from "zod"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma/client"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Get Supabase user from server
  let user = null
  try {
    const supabase = await createClient()
    if (supabase && typeof supabase.auth?.getUser === "function") {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      user = supabaseUser
    }
  } catch (error) {
    // Supabase not configured or auth failed - continue without user
    // This is expected during development if Supabase is not set up yet
  }

  return {
    ...opts,
    user,
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
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type narrowing - user is guaranteed to exist
    },
  })
})
