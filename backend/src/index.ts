import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { createContext } from "@/context";
import { env } from "@/config/env";

const yoga = createYoga({
  schema,
  context: createContext,
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
  graphiql: env.NODE_ENV !== "production",
});

const server = Bun.serve({
  port: env.PORT,
  fetch: yoga.fetch,
});

console.log(`GraphQL server ready at http://localhost:${server.port}/graphql`);