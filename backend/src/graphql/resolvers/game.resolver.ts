import type { GraphQLContext } from "@/context";
import { GameService } from "@/services/game.service";
import { submitGameResultSchema } from "@/validation/game.schema";
import { requireAuth } from "@/graphql/resolvers/user.resolver";

export const gameResolvers = {
  Query: {
    myGameHistory: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const gameService = new GameService(context.prisma);
      return gameService.getHistory(userId);
    },
    myBestScore: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const gameService = new GameService(context.prisma);
      return gameService.getBestScore(userId);
    },
  },
  Mutation: {
    submitGameResult: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const input = submitGameResultSchema.parse(args.input);
      const gameService = new GameService(context.prisma);
      return gameService.submitResult(userId, input);
    },
  },
};