/**
 * Normalizes an input string into a deterministic, URL-safe slug.
 * Example: "Modern Wireless Headphones!!!" -> "modern-wireless-headphones"
 */
export function slugify(input: string): string {
  if (!input) return "";

  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word, non-space, non-hyphen
    .replace(/[\s_-]+/g, "-") // collapse whitespace and underscores into single hyphens
    .replace(/^-+|-+$/g, ""); // strip leading and trailing hyphens
}

/**
 * Validates if a string is already in valid slug format.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
