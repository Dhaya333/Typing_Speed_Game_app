export interface User {
  id: string;
  username: string;
  email: string;
}

export interface GameResult {
  id: string;
  totalTimeMs: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyMs: number;
  createdAt: string;
}

export type GameStatus = "idle" | "playing" | "finished";