import { useCallback, useState } from "react";
import { getStoredBestScore, setStoredBestScore } from "@/utils/storage";

export function useLocalBestScore() {
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(() => getStoredBestScore());

  /** Returns true if this run beat (or set) the best score, and persists it if so. */
  const submitScore = useCallback(
    (totalTimeMs: number): boolean => {
      if (bestTimeMs === null || totalTimeMs < bestTimeMs) {
        setStoredBestScore(totalTimeMs);
        setBestTimeMs(totalTimeMs);
        return true;
      }
      return false;
    },
    [bestTimeMs],
  );

  return { bestTimeMs, submitScore };
}