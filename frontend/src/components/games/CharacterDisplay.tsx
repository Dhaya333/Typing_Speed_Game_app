interface CharacterDisplayProps {
  char: string;
  wrongAttempts: number;
}

export default function CharacterDisplay({ char, wrongAttempts }: CharacterDisplayProps) {
  return (
    <div className="character-display" data-wrong-attempts={wrongAttempts}>
      <span className="character">{char.toUpperCase()}</span>
    </div>
  );
}