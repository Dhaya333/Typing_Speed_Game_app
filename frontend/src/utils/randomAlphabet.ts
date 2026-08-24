const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export const SEQUENCE_LENGTH = 20;

export function generateRandomSequence(length: number = SEQUENCE_LENGTH): string[] {
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    sequence.push(ALPHABET[randomIndex]);
  }
  return sequence;
}