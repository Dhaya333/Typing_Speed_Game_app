import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMutation } from "@apollo/client";
import { SUBMIT_GAME_RESULT_MUTATION } from "@/graphql/mutations";
import { useAuth } from "@/hooks/useAuth";
import { useLocalBestScore } from "@/hooks/useLocalBestScore";
import { generateRandomSequence, SEQUENCE_LENGTH } from "@/utils/randomAlphabet";
import type { GameStatus } from "@/types";

const PENALTY_MS = 500;

export function useTypingGame() {
  const { user } = useAuth();
  const { bestTimeMs, submitScore } = useLocalBestScore();
  const [submitGameResult] = useMutation(SUBMIT_GAME_RESULT_MUTATION);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [sequence, setSequence] = useState<string[]>(() => generateRandomSequence());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isBestScore, setIsBestScore] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the hidden input focused before/during gameplay so keystrokes are always captured
  useEffect(() => {
    if (status === "playing" || status === "idle") {
      inputRef.current?.focus();
    }
  }, [status]);

  // Timer loop — runs only while playing
  useEffect(() => {
    if (status !== "playing") return;

    function tick() {
      if (startTimeRef.current !== null) {
        setElapsedMs(performance.now() - startTimeRef.current);
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [status]);

  const finishGame = useCallback(
    async (finalElapsedMs: number, finalPenaltyMs: number, finalWrongAttempts: number) => {
      const totalTimeMs = Math.round(finalElapsedMs + finalPenaltyMs);
      const beatBest = submitScore(totalTimeMs);
      setIsBestScore(beatBest);
      setStatus("finished");

      if (user) {
        try {
          await submitGameResult({
            variables: {
              input: {
                totalTimeMs,
                correctChars: SEQUENCE_LENGTH,
                wrongAttempts: finalWrongAttempts,
                penaltyMs: Math.round(finalPenaltyMs),
              },
            },
          });
        } catch {
          // Non-fatal: the local best score is already saved. A failed backend
          // submission shouldn't block the player from seeing their result.
        }
      }
    },
    [submitGameResult, submitScore, user],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (status === "finished") return;

      // Ignore modifier/navigation/function keys — only single printable characters count
      if (e.key.length !== 1) return;

      if (status === "idle") {
        startTimeRef.current = performance.now();
        setStatus("playing");
      }

      const expected = sequence[currentIndex];
      if (e.key.toLowerCase() === expected) {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= SEQUENCE_LENGTH) {
          const finalElapsed =
            startTimeRef.current !== null ? performance.now() - startTimeRef.current : elapsedMs;
          setCurrentIndex(nextIndex);
          setElapsedMs(finalElapsed);
          void finishGame(finalElapsed, penaltyMs, wrongAttempts);
        } else {
          setCurrentIndex(nextIndex);
        }
      } else {
        setPenaltyMs((prev) => prev + PENALTY_MS);
        setWrongAttempts((prev) => prev + 1);
      }
    },
    [status, sequence, currentIndex, elapsedMs, penaltyMs, wrongAttempts, finishGame],
  );

  const restart = useCallback(() => {
    setSequence(generateRandomSequence());
    setCurrentIndex(0);
    setElapsedMs(0);
    setPenaltyMs(0);
    setWrongAttempts(0);
    setIsBestScore(false);
    startTimeRef.current = null;
    setStatus("idle");
  }, []);

  return {
    status,
    currentChar: sequence[currentIndex] ?? "",
    currentIndex,
    totalChars: SEQUENCE_LENGTH,
    elapsedMs,
    penaltyMs,
    wrongAttempts,
    isBestScore,
    bestTimeMs,
    inputRef,
    handleKeyDown,
    restart,
  };
}