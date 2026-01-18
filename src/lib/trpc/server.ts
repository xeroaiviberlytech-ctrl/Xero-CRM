import { initTRPC, TRPCError } from "@trpc/server"
import { ZodError } from "zod"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma/client"
import type { User as PrismaUser } from "@prisma/client"
import { Role } from "@prisma/client"
import { supabaseAdmin } from "./../server/supabaseAdmin"

export function requireRole(ctx: any, allowedRoles: Role[]) {
  if (!ctx.membership) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  if (!allowedRoles.includes(ctx.membership.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    })
  }
}
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
  let membership = null
  let tenant = null

  try {
    const supabase = await createClient()

    if (supabase && typeof supabase.auth?.getUser === "function") {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      supabaseUser = user

      // Sync Supabase user → Prisma user
      if (supabaseUser?.id && supabaseUser?.email) {
        try {
          prismaUser = await getOrCreatePrismaUser(
            supabaseUser.id,
            supabaseUser.email,
            supabaseUser.user_metadata?.name ||
              supabaseUser.user_metadata?.full_name
          )
        } catch (error) {
          console.error("Error syncing Prisma user:", error)
        }
      }

      // ✅ STEP 1 (THIS WAS MISSING)
      if (prismaUser) {
        membership = await prisma.membership.findFirst({
          where: {
            userId: prismaUser.id,
            status: "active",
          },
          include: {
            tenant: true,
          },
        })
        // 👇 NEW: Auto-create tenant + OWNER membership for first-time users
if (!membership) {
  const tenant = await prisma.tenant.create({
    data: {
      name: prismaUser.name
        ? `${prismaUser.name}'s Workspace`
        : "My Workspace",
      slug: crypto.randomUUID(),
    },
  })

  membership = await prisma.membership.create({
    data: {
      userId: prismaUser.id,
      tenantId: tenant.id,
      role: "OWNER",
      status: "active",
    },
    include: {
      tenant: true,
    },
  })
}
        tenant = membership?.tenant ?? null
      }

      return {
        supabase,
        user: supabaseUser,
        prismaUser,
        tenant,
        membership,
        prisma,
        supabaseAdmin,
      }
    }
  } catch (error) {
    console.error("Error creating context:", error)
  }

  return {
    user: null,
    prismaUser: null,
    tenant: null,
    membership: null,
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

// Protected procedure that only requires authentication (no tenant check)
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
      user: ctx.user,
      prismaUser: ctx.prismaUser,
    },
  })
})

// Protected procedure that requires authentication AND active tenant membership
export const protectedTenantProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.prismaUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    })
  }

  // Verify user has an active membership with a tenant
  if (!ctx.membership || ctx.membership.status !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have an active membership. Please contact your administrator.",
    })
  }

  // Ensure tenant exists
  if (!ctx.tenant) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenant associated with your membership. Please contact your administrator.",
    })
  }

  return next({
    ctx: {
      ...ctx,
      prismaUser: ctx.prismaUser,
      tenant: ctx.tenant,
      membership: ctx.membership,
    },
  })
})
