import { initTRPC } from "@trpc/server"
import { ZodError } from "zod"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    ...opts,
    // Add your context here (e.g., database, session)
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

