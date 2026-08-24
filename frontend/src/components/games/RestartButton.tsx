interface RestartButtonProps {
  onRestart: () => void;
}

export default function RestartButton({ onRestart }: RestartButtonProps) {
  return (
    <button type="button" className="restart-button" onClick={onRestart}>
      Play again
    </button>
  );
}