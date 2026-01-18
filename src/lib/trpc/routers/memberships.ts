import { z } from "zod"
import { createTRPCRouter, protectedTenantProcedure, protectedProcedure } from "../server"
import { Role } from "@prisma/client"
import { TRPCError } from "@trpc/server"

export const membershipsRouter = createTRPCRouter({
  // List all memberships in the current tenant
  list: protectedTenantProcedure.query(async ({ ctx }) => {
    const { prisma, membership } = ctx

    if (!membership) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No active membership found",
      })
    }

    const memberships = await prisma.membership.findMany({
      where: {
        tenantId: membership.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return memberships
  }),

  // Invite a user to the tenant (Owner/Admin only)
  invite: protectedTenantProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.nativeEnum(Role).default(Role.USER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, membership, prismaUser } = ctx

      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active membership found",
        })
      }

      // Only OWNER and ADMIN can invite users
      if (!([Role.OWNER, Role.ADMIN] as Role[]).includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can invite users",
        })
      }

      // Check if user exists
      let invitedUser = await prisma.user.findUnique({
        where: { email: input.email },
      })

      // If user doesn't exist, create a placeholder (they'll complete signup later)
      if (!invitedUser) {
        invitedUser = await prisma.user.create({
          data: {
            email: input.email,
            name: input.email.split("@")[0], // Use email prefix as temporary name
          },
        })
      }

      // Check if membership already exists
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_tenantId: {
            userId: invitedUser.id,
            tenantId: membership.tenantId,
          },
        },
      })

      if (existingMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this tenant",
        })
      }

      // Create the membership with pending status
      const newMembership = await prisma.membership.create({
        data: {
          userId: invitedUser.id,
          tenantId: membership.tenantId,
          role: input.role,
          status: "pending",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "system",
          title: "User invited",
          description: `${prismaUser.name || prismaUser.email} invited ${input.email} to the team as ${input.role}`,
          userId: prismaUser.id,
          tenantId: membership.tenantId,
        },
      })

      // TODO: Send invitation email
      // In a production app, you would send an email here with an invitation link

      return newMembership
    }),

  // Update membership status (Owner/Admin only)
  updateStatus: protectedTenantProcedure
    .input(
      z.object({
        membershipId: z.string(),
        status: z.enum(["pending", "active", "suspended"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, membership, prismaUser } = ctx

      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active membership found",
        })
      }

      // Only OWNER and ADMIN can update membership status
      if (!([Role.OWNER, Role.ADMIN] as Role[]).includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can update membership status",
        })
      }

      const targetMembership = await prisma.membership.findUnique({
        where: { id: input.membershipId },
        include: {
          user: true,
        },
      })

      if (!targetMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership not found",
        })
      }

      // Verify it's in the same tenant
      if (targetMembership.tenantId !== membership.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify membership from another tenant",
        })
      }

      // Prevent suspending yourself
      if (targetMembership.userId === prismaUser.id && input.status === "suspended") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot suspend your own membership",
        })
      }

      const updated = await prisma.membership.update({
        where: { id: input.membershipId },
        data: { status: input.status },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "system",
          title: "Membership status updated",
          description: `${prismaUser.name || prismaUser.email} changed ${targetMembership.user.name || targetMembership.user.email}'s status to ${input.status}`,
          userId: prismaUser.id,
          tenantId: membership.tenantId,
        },
      })

      return updated
    }),

  // Update membership role (Owner/Admin only)
  updateRole: protectedTenantProcedure
    .input(
      z.object({
        membershipId: z.string(),
        role: z.nativeEnum(Role),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, membership, prismaUser } = ctx

      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active membership found",
        })
      }

      // Only OWNER and ADMIN can update roles
      if (!([Role.OWNER, Role.ADMIN] as Role[]).includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can update roles",
        })
      }

      const targetMembership = await prisma.membership.findUnique({
        where: { id: input.membershipId },
        include: {
          user: true,
        },
      })

      if (!targetMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership not found",
        })
      }

      // Verify it's in the same tenant
      if (targetMembership.tenantId !== membership.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify membership from another tenant",
        })
      }

      // Prevent removing your own OWNER role
      if (
        targetMembership.userId === prismaUser.id &&
        targetMembership.role === Role.OWNER &&
        input.role !== Role.OWNER
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove your own owner role",
        })
      }

      // Only OWNER can assign OWNER role
      if (input.role === Role.OWNER && membership.role !== Role.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can assign the owner role",
        })
      }

      const updated = await prisma.membership.update({
        where: { id: input.membershipId },
        data: { role: input.role },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "system",
          title: "Role updated",
          description: `${prismaUser.name || prismaUser.email} changed ${targetMembership.user.name || targetMembership.user.email}'s role to ${input.role}`,
          userId: prismaUser.id,
          tenantId: membership.tenantId,
        },
      })

      return updated
    }),

  // Remove a member from the tenant (Owner/Admin only)
  remove: protectedTenantProcedure
    .input(
      z.object({
        membershipId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, membership, prismaUser } = ctx

      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No active membership found",
        })
      }

      // Only OWNER and ADMIN can remove members
      if (!([Role.OWNER, Role.ADMIN] as Role[]).includes(membership.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners and admins can remove members",
        })
      }

      const targetMembership = await prisma.membership.findUnique({
        where: { id: input.membershipId },
        include: {
          user: true,
        },
      })

      if (!targetMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership not found",
        })
      }

      // Verify it's in the same tenant
      if (targetMembership.tenantId !== membership.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove membership from another tenant",
        })
      }

      // Prevent removing yourself
      if (targetMembership.userId === prismaUser.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove your own membership. Transfer ownership first.",
        })
      }

      // Prevent removing the last OWNER
      if (targetMembership.role === Role.OWNER) {
        const ownerCount = await prisma.membership.count({
          where: {
            tenantId: membership.tenantId,
            role: Role.OWNER,
          },
        })

        if (ownerCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove the last owner. Transfer ownership first.",
          })
        }
      }

      await prisma.membership.delete({
        where: { id: input.membershipId },
      })

      // Check if user has any other memberships
      const remainingMemberships = await prisma.membership.count({
        where: { userId: targetMembership.userId },
      })
      if (remainingMemberships === 0) {
        // Fetch the user to get supabaseUserId
        const userToDelete = await prisma.user.findUnique({
          where: { id: targetMembership.userId },
          select: { supabaseUserId: true },
        })
        if (userToDelete?.supabaseUserId) {
          // Delete from Supabase Auth
          await ctx.supabaseAdmin.auth.admin.deleteUser(userToDelete.supabaseUserId)
        }
        await prisma.user.delete({ where: { id: targetMembership.userId } })
      }

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "system",
          title: "Member removed",
          description: `${prismaUser.name || prismaUser.email} removed ${targetMembership.user.name || targetMembership.user.email} from the team`,
          userId: prismaUser.id,
          tenantId: membership.tenantId,
        },
      })

      return { success: true }
    }),

  // Accept a pending invitation
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        membershipId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, prismaUser } = ctx

      const membership = await prisma.membership.findUnique({
        where: { id: input.membershipId },
      })

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        })
      }

      // Verify this invitation is for the current user
      if (membership.userId !== prismaUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invitation is not for you",
        })
      }

      if (membership.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has already been processed",
        })
      }

      const updated = await prisma.membership.update({
        where: { id: input.membershipId },
        data: { status: "active" },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "system",
          title: "Invitation accepted",
          description: `${prismaUser.name || prismaUser.email} joined the team`,
          userId: prismaUser.id,
          tenantId: membership.tenantId,
        },
      })

      return updated
    }),

  // Get pending invitations for the current user

  myInvitations: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, prismaUser } = ctx

    const invitations = await prisma.membership.findMany({
      where: {
        userId: prismaUser.id,
        status: "pending",
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return invitations
  }),

  createUser: protectedTenantProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().min(1),
        password: z.string().min(8),
        role: z.nativeEnum(Role).default(Role.USER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only OWNER can create users
      if (ctx.membership?.role !== Role.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can create users",
        })
      }

      const { data, error } = await ctx.supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      })

      if (error || !data.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error?.message ?? "Failed to create user",
        })
      }

      const prismaUser = await ctx.prisma.user.upsert({
        where: { id: data.user.id },
        update: { name: input.username },
        create: {
          id: data.user.id,
          email: input.email,
          name: input.username,
        },
      })

      await ctx.prisma.membership.create({
        data: {
          userId: prismaUser.id,
          tenantId: ctx.tenant.id,
          role: input.role,
        },
      })

      return { success: true }
    })
})
