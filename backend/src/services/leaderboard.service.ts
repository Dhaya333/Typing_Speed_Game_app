import type { PrismaClient } from "@prisma/client";
import { GameResultRepository } from "@/repositories/gameResult.repository";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  bestTimeMs: number;
}

const DEFAULT_LIMIT = 10;

export class LeaderboardService {
  private readonly gameResultRepository: GameResultRepository;

  constructor(prisma: PrismaClient) {
    this.gameResultRepository = new GameResultRepository(prisma);
  }

  async getLeaderboard(limit: number = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    const rows = await this.gameResultRepository.findLeaderboard(limit);
    return rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      bestTimeMs: Number(row.bestTimeMs),
    }));
  }
}