export const MAX_NAME_LENGTH = 20;

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH;
}
