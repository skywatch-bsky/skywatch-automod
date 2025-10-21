import { homoglyphMap } from "./homoglyphs.js";

/**
 * Normalizes a string by converting it to lowercase, replacing homoglyphs,
 * and stripping diacritics. This is useful for sanitizing user input
 * before performing checks for forbidden words.
 *
 * The process is as follows:
 * 1. Convert the entire string to lowercase.
 * 2. Replace characters that are visually similar to ASCII letters (homoglyphs)
 *    with their ASCII counterparts based on the `homoglyphMap`.
 * 3. Apply NFD (Normalization Form D) Unicode normalization to decompose
 *    characters into their base characters and combining marks.
 * 4. Remove all Unicode combining diacritical marks.
 * 5. Apply NFKC (Normalization Form KC) Unicode normalization for a final
 *    cleanup, which handles compatibility characters.
 *
 * @param text The input string to normalize.
 * @returns The normalized string.
 */
export function normalizeUnicode(text: string): string {
  // Convert to lowercase to match the homoglyph map keys
  const lowercased = text.toLowerCase();

  // Replace characters using the homoglyph map.
  // This is done before NFD so that pre-composed characters are caught.
  let replaced = "";
  for (const char of lowercased) {
    replaced += homoglyphMap[char] || char;
  }

  // First decompose the characters (NFD), then remove diacritics.
  const withoutDiacritics = replaced
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Final NFKC normalization to handle any remaining special characters.
  return withoutDiacritics.normalize("NFKC");
}
