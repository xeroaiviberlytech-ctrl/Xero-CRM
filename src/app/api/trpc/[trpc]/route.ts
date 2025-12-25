import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/lib/trpc/routers/_app"
import { createTRPCContext } from "@/lib/trpc/server"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return createTRPCContext({
        headers: req.headers,
      })
    },
  })

export { handler as GET, handler as POST }

