import type { PrismaClient } from "@prisma/client";

export interface CreateGameResultInput {
  userId: string;
  totalTimeMs: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyMs: number;
}

export interface LeaderboardRow {
  username: string;
  bestTimeMs: number;
}

export class GameResultRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: CreateGameResultInput) {
    return this.prisma.gameResult.create({ data });
  }

  findHistoryByUser(userId: string) {
    return this.prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findBestByUser(userId: string) {
    return this.prisma.gameResult.findFirst({
      where: { userId },
      orderBy: { totalTimeMs: "asc" },
    });
  }

  /**
   * Returns the single best (lowest) totalTimeMs per user, ordered ascending.
   * Uses a raw query because Prisma's groupBy doesn't easily join back to username.
   */
  findLeaderboard(limit: number) {
    return this.prisma.$queryRaw<LeaderboardRow[]>`
      SELECT u.username AS "username", MIN(g."totalTimeMs") AS "bestTimeMs"
      FROM "game_results" g
      JOIN "users" u ON u.id = g."userId"
      GROUP BY u.username
      ORDER BY "bestTimeMs" ASC
      LIMIT ${limit}
    `;
  }
}