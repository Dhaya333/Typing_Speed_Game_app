interface TimerProps {
  elapsedMs: number;
  penaltyMs: number;
}

export default function Timer({ elapsedMs, penaltyMs }: TimerProps) {
  const totalSeconds = ((elapsedMs + penaltyMs) / 1000).toFixed(2);
  return (
    <div className="timer">
      <span>{totalSeconds}s</span>
      {penaltyMs > 0 && <span className="penalty-badge">+{(penaltyMs / 1000).toFixed(1)}s penalty</span>}
    </div>
  );
}