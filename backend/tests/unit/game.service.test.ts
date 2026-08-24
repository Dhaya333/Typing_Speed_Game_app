import { describe, it, expect, beforeEach, mock } from "bun:test";
import { GameService } from "@/services/game.service";

mock.module("@/repositories/gameResult.repository", () => {
  return {
    GameResultRepository: class {
      private results: any[] = [];

      create = mock(async (data: any) => {
        const result = { id: crypto.randomUUID(), createdAt: new Date(), ...data };
        this.results.push(result);
        return result;
      });
      findHistoryByUser = mock(async (userId: string) =>
        this.results.filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
      );
      findBestByUser = mock(async (userId: string) =>
        this.results.filter((r) => r.userId === userId).sort((a, b) => a.totalTimeMs - b.totalTimeMs)[0] ?? null,
      );
    },
  };
});

describe("GameService", () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService({} as any);
  });

  it("saves a valid completed game result", async () => {
    const result = await gameService.submitResult("user-1", {
      totalTimeMs: 8420,
      correctChars: 20,
      wrongAttempts: 1,
      penaltyMs: 500,
    });
    expect(result.totalTimeMs).toBe(8420);
  });

  it("rejects a result with fewer than 20 correct characters", async () => {
    await expect(
      gameService.submitResult("user-1", {
        totalTimeMs: 8420,
        correctChars: 15,
        wrongAttempts: 1,
        penaltyMs: 500,
      }),
    ).rejects.toThrow();
  });

  it("rejects negative values", async () => {
    await expect(
      gameService.submitResult("user-1", {
        totalTimeMs: 8420,
        correctChars: 20,
        wrongAttempts: -1,
        penaltyMs: 500,
      }),
    ).rejects.toThrow();
  });

  it("computes the best (lowest) score across multiple results", async () => {
    await gameService.submitResult("user-1", { totalTimeMs: 9000, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 });
    await gameService.submitResult("user-1", { totalTimeMs: 8000, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 });
    await gameService.submitResult("user-1", { totalTimeMs: 9500, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 });

    const best = await gameService.getBestScore("user-1");
    expect(best?.totalTimeMs).toBe(8000);
  });
});