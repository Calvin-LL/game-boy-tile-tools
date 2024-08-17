export function toHexString(n: number, withPrefix = false): string {
  const result = n.toString(16).padStart(2, "0");
  return withPrefix ? `0x${result}` : result;
}
