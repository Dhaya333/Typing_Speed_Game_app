import type { GraphQLContext } from "@/context";
import { LeaderboardService } from "@/services/leaderboard.service";

export const leaderboardResolvers = {
  Query: {
    leaderboard: async (_parent: unknown, args: { limit?: number }, context: GraphQLContext) => {
      const leaderboardService = new LeaderboardService(context.prisma);
      return leaderboardService.getLeaderboard(args.limit ?? 10);
    },
  },
};