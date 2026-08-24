interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((current / total) * 100));
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      <span className="progress-label">
        {current} / {total}
      </span>
    </div>
  );
}