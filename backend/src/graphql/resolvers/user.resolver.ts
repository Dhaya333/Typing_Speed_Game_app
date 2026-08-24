import { GraphQLError } from "graphql";
import type { GraphQLContext } from "@/context";
import { AuthService } from "@/services/auth.service";
import { registerSchema, loginSchema } from "@/validation/auth.schema";

export const userResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.userId) return null;
      const authService = new AuthService(context.prisma);
      return authService.getUserById(context.userId);
    },
  },
  Mutation: {
    register: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const input = registerSchema.parse(args.input);
      const authService = new AuthService(context.prisma);
      return authService.register(input);
    },
    login: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const input = loginSchema.parse(args.input);
      const authService = new AuthService(context.prisma);
      return authService.login(input);
    },
  },
};

/** Throws if the request is unauthenticated; otherwise returns the current userId. */
export function requireAuth(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}