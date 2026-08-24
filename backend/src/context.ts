import { PrismaClient } from "@prisma/client";
import type { YogaInitialContext } from "graphql-yoga";
import { verifyAuthHeader } from "@/middleware/auth.middleware";

export const prisma = new PrismaClient();

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  const authHeader = initialContext.request.headers.get("authorization");
  const userId = verifyAuthHeader(authHeader);

  return {
    ...initialContext,
    prisma,
    userId,
  };
}