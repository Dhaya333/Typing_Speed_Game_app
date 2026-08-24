interface ResultScreenProps {
  totalTimeMs: number;
  bestTimeMs: number | null;
  isBestScore: boolean;
  wrongAttempts: number;
}

export default function ResultScreen({ totalTimeMs, bestTimeMs, isBestScore, wrongAttempts }: ResultScreenProps) {
  return (
    <div className="result-screen">
      <h2 className={isBestScore ? "result-success" : "result-failure"}>
        {isBestScore ? "Success! New best score 🎉" : "Try again"}
      </h2>
      <p>Your time: {(totalTimeMs / 1000).toFixed(2)}s</p>
      <p>Best time: {bestTimeMs !== null ? `${(bestTimeMs / 1000).toFixed(2)}s` : "—"}</p>
      <p>Wrong attempts: {wrongAttempts}</p>
    </div>
  );
}