import { createTRPCRouter, publicProcedure, protectedProcedure } from "../server"
import { z } from "zod"

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  // Example protected route
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    // User is guaranteed to exist in protectedProcedure
    return {
      id: ctx.user.id,
      email: ctx.user.email,
    }
  }),
})

export type AppRouter = typeof appRouter
