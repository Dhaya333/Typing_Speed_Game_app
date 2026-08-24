import { useTypingGame } from "@/hooks/useTypingGame";
import CharacterDisplay from "@/components/games/CharacterDisplay";
import Timer from "@/components/games/Timer";
import ProgressBar from "@/components/games/ProgressBar";
import ResultScreen from "@/components/games/ResultScreen";
import RestartButton from "@/components/games/RestartButton";

export default function GamePage() {
  const {
    status,
    currentChar,
    currentIndex,
    totalChars,
    elapsedMs,
    penaltyMs,
    wrongAttempts,
    isBestScore,
    bestTimeMs,
    inputRef,
    handleKeyDown,
    restart,
  } = useTypingGame();

  return (
    <div className="game-page">
      <h1>Typing Speed Game</h1>

      {status !== "finished" && (
        <>
          <Timer elapsedMs={elapsedMs} penaltyMs={penaltyMs} />
          <ProgressBar current={currentIndex} total={totalChars} />
          <CharacterDisplay char={currentChar} wrongAttempts={wrongAttempts} />

          {/* Hidden input keeps keyboard focus captured throughout the game */}
          <input
            ref={inputRef}
            className="sr-only-input"
            autoFocus
            onKeyDown={handleKeyDown}
            onBlur={(e) => e.target.focus()}
            aria-label="Typing input"
          />

          {status === "idle" && <p>Press any key to start.</p>}
        </>
      )}

      {status === "finished" && (
        <ResultScreen
          totalTimeMs={elapsedMs + penaltyMs}
          bestTimeMs={bestTimeMs}
          isBestScore={isBestScore}
          wrongAttempts={wrongAttempts}
        />
      )}

      {status === "finished" && <RestartButton onRestart={restart} />}
    </div>
  );
}