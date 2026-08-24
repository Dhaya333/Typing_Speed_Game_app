import { GraphQLError } from "graphql";
import type { PrismaClient, GameResult } from "@prisma/client";
import { GameResultRepository, type CreateGameResultInput } from "@/repositories/gameResult.repository";

export interface SubmitGameResultInput {
  totalTimeMs: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyMs: number;
}

const EXPECTED_CORRECT_CHARS = 20;

export class GameService {
  private readonly gameResultRepository: GameResultRepository;

  constructor(prisma: PrismaClient) {
    this.gameResultRepository = new GameResultRepository(prisma);
  }

  async submitResult(userId: string, input: SubmitGameResultInput): Promise<GameResult> {
    this.assertValidResult(input);

    const data: CreateGameResultInput = { userId, ...input };
    return this.gameResultRepository.create(data);
  }

  async getHistory(userId: string): Promise<GameResult[]> {
    return this.gameResultRepository.findHistoryByUser(userId);
  }

  async getBestScore(userId: string): Promise<GameResult | null> {
    return this.gameResultRepository.findBestByUser(userId);
  }

  private assertValidResult(input: SubmitGameResultInput) {
    if (input.correctChars !== EXPECTED_CORRECT_CHARS) {
      throw new GraphQLError(
        `A completed game must have exactly ${EXPECTED_CORRECT_CHARS} correct characters.`,
        { extensions: { code: "INVALID_GAME_RESULT" } },
      );
    }
    if (input.totalTimeMs <= 0 || input.penaltyMs < 0 || input.wrongAttempts < 0) {
      throw new GraphQLError("Game result values must be non-negative.", {
        extensions: { code: "INVALID_GAME_RESULT" },
      });
    }
    if (input.totalTimeMs < input.penaltyMs) {
      throw new GraphQLError("Total time cannot be less than penalty time.", {
        extensions: { code: "INVALID_GAME_RESULT" },
      });
    }
  }
}