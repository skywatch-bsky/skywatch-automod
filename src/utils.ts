import logger from './logger.js';

/*  Normalize the Unicode characters: this doesn't consistently work yet, there is something about certain bluesky strings that causes it to fail. */
export function normalizeUnicode(text: string): string {
  // First decompose the characters (NFD)
  const decomposed = text.normalize('NFD');

  // Remove diacritics and combining marks
  const withoutDiacritics = decomposed.replace(/[\u0300-\u036f]/g, '');

  // Remove mathematical alphanumeric symbols
  const withoutMath = withoutDiacritics.replace(
    /[\uD835][\uDC00-\uDFFF]/g,
    (char) => {
      // Get the base character from the mathematical symbol
      const code = char.codePointAt(0);
      if (code >= 0x1d400 && code <= 0x1d433)
        // Mathematical bold
        return String.fromCharCode(code - 0x1d400 + 0x41);
      if (code >= 0x1d434 && code <= 0x1d467)
        // Mathematical italic
        return String.fromCharCode(code - 0x1d434 + 0x61);
      if (code >= 0x1d468 && code <= 0x1d49b)
        // Mathematical bold italic
        return String.fromCharCode(code - 0x1d468 + 0x41);
      if (code >= 0x1d49c && code <= 0x1d4cf)
        // Mathematical script
        return String.fromCharCode(code - 0x1d49c + 0x61);
      return char;
    },
  );

  // Final NFKC normalization to handle any remaining special characters
  return withoutMath.normalize('NFKC');
}

export async function getFinalUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { controller.abort(); }, 10000); // 10-second timeout

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow', // This will follow redirects automatically
      signal: controller.signal, // Pass the abort signal to fetch
    });
    clearTimeout(timeoutId); // Clear the timeout if fetch completes
    return response.url; // This will be the final URL after redirects
  } catch (error) {
    clearTimeout(timeoutId); // Clear the timeout if fetch fails
    // Log the error with more specific information if it's a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn(`Timeout fetching URL: ${url}`, error);
    } else {
      logger.warn(`Error fetching URL: ${url}`, error);
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function getLanguage(profile: string): Promise<string> {
  if (!profile) {
    logger.warn(
      '[GETLANGUAGE] getLanguage called with empty profile data, defaulting to \'eng\'.',
      profile,
    );
    return 'eng'; // Default or throw an error
  }

  const profileText = profile.trim();

  if (profileText.length === 0) {
    return 'eng';
  }

  try {
    const lande = (await import('lande')).default;
    const langsProbabilityMap = lande(profileText);

    // Sort by probability in descending order
    langsProbabilityMap.sort(
      (a: [string, number], b: [string, number]) => b[1] - a[1],
    );

    // Return the language code with the highest probability
    return langsProbabilityMap[0][0];
  } catch (error) {
    logger.error('Error detecting language, defaulting to \'eng\':', error);
    return 'eng'; // Fallback to English on error
  }
}
