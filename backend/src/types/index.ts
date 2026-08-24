export type { GraphQLContext } from "@/context";
export type { User, GameResult } from "@prisma/client";

export interface PaginationArgs {
  limit?: number;
  offset?: number;
}