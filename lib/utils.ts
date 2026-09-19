/**
 * Utility for conditionally joining CSS class names without external dependencies.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
