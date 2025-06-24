import logger from "./logger.js";

import { homoglyphMap } from "./homoglyphs";

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

export async function getFinalUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow", // This will follow redirects automatically
      signal: controller.signal, // Pass the abort signal to fetch
    });
    clearTimeout(timeoutId); // Clear the timeout if fetch completes
    return response.url; // This will be the final URL after redirects
  } catch (error) {
    clearTimeout(timeoutId); // Clear the timeout if fetch fails
    // Log the error with more specific information if it's a timeout
    if (error instanceof Error && error.name === "AbortError") {
      logger.warn(`Timeout fetching URL: ${url}`, error);
    } else {
      logger.warn(`Error fetching URL: ${url}`, error);
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function getLanguage(profile: string): Promise<string> {
  if (typeof profile !== "string" || profile === null) {
    logger.warn(
      "[GETLANGUAGE] getLanguage called with invalid profile data, defaulting to 'eng'.",
      profile,
    );
    return "eng"; // Default or throw an error
  }

  const profileText = profile.trim();

  if (profileText.length === 0) {
    return "eng";
  }

  const lande = (await import("lande")).default;
  let langsProbabilityMap = lande(profileText);

  // Sort by probability in descending order
  langsProbabilityMap.sort(
    (a: [string, number], b: [string, number]) => b[1] - a[1],
  );

  // Return the language code with the highest probability
  return langsProbabilityMap[0][0];
}
