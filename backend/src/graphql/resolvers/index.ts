import { userResolvers } from "@/graphql/resolvers/user.resolver";
import { gameResolvers } from "@/graphql/resolvers/game.resolver";
import { leaderboardResolvers } from "@/graphql/resolvers/leaderboard.resolver";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...gameResolvers.Query,
    ...leaderboardResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...gameResolvers.Mutation,
    ...leaderboardResolvers.Mutation,
  },
};