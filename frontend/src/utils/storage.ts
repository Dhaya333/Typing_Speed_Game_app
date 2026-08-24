export const AUTH_TOKEN_STORAGE_KEY = "typing_speed_game_auth_token";
export const BEST_SCORE_STORAGE_KEY = "typing_speed_game_best_score_ms";

export function getStoredBestScore(): number | null {
  const raw = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setStoredBestScore(totalTimeMs: number): void {
  localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(totalTimeMs));
}

export function clearStoredBestScore(): void {
  localStorage.removeItem(BEST_SCORE_STORAGE_KEY);
}