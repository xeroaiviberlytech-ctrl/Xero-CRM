import { createTRPCRouter, publicProcedure } from "../server"
import { z } from "zod"
import { usersRouter } from "./users"
import { leadsRouter } from "./leads"
import { dealsRouter } from "./deals"
import { campaignsRouter } from "./campaigns"
import { tasksRouter } from "./tasks"
import { analyticsRouter } from "./analytics"
import { activitiesRouter } from "./activities"
import { searchRouter } from "./search"
import { filtersRouter } from "./filters"
import { contactsRouter } from "./contacts"
import { outreachRouter } from "./outreach"

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
  deals: dealsRouter,
  campaigns: campaignsRouter,
  tasks: tasksRouter,
  analytics: analyticsRouter,
  activities: activitiesRouter,
  search: searchRouter,
  filters: filtersRouter,
  contacts: contactsRouter,
  outreach: outreachRouter,
})

export type AppRouter = typeof appRouter
