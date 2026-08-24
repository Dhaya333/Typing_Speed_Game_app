import { describe, it, expect, mock } from "bun:test";
import { LeaderboardService } from "@/services/leaderboard.service";

mock.module("@/repositories/gameResult.repository", () => {
  return {
    GameResultRepository: class {
      findLeaderboard = mock(async (limit: number) =>
        [
          { username: "Alex", bestTimeMs: 8420 },
          { username: "John", bestTimeMs: 9150 },
          { username: "Sarah", bestTimeMs: 9870 },
        ].slice(0, limit),
      );
    },
  };
});

describe("LeaderboardService", () => {
  it("returns entries ordered ascending with correct rank", async () => {
    const leaderboardService = new LeaderboardService({} as any);
    const leaderboard = await leaderboardService.getLeaderboard(10);

    expect(leaderboard).toHaveLength(3);
    expect(leaderboard[0]).toEqual({ rank: 1, username: "Alex", bestTimeMs: 8420 });
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[2].rank).toBe(3);
    expect(leaderboard.map((e) => e.bestTimeMs)).toEqual([8420, 9150, 9870]);
  });

  it("respects the limit argument", async () => {
    const leaderboardService = new LeaderboardService({} as any);
    const leaderboard = await leaderboardService.getLeaderboard(1);
    expect(leaderboard).toHaveLength(1);
  });
});