export function IsNumericFileName(fileName: string): boolean {
  return /^\d+$/.test(fileName);
}
