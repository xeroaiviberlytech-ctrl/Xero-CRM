import { createTRPCRouter, publicProcedure } from "../server"
import { z } from "zod"
import { usersRouter } from "./users"
import { leadsRouter } from "./leads"

export const appRouter = createTRPCRouter({
  // Health check endpoint
  hello: publicProcedure
    .input(
      z.object({ text: z.string().optional() }).default({ text: undefined })
    )
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text || "World"}`,
        timestamp: new Date().toISOString(),
      }
    }),

  // Feature routers
  users: usersRouter,
  leads: leadsRouter,
})

export type AppRouter = typeof appRouter
