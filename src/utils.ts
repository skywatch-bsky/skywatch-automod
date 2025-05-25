/*  Normalize the Unicode characters: this doesn't consistently work yet, there is something about certain bluesky strings that causes it to fail. */
export function normalizeUnicode(text: string): string {
  // First decompose the characters (NFD)
  const decomposed = text.normalize("NFD");

  // Remove diacritics and combining marks
  const withoutDiacritics = decomposed.replace(/[\u0300-\u036f]/g, "");

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
  return withoutMath.normalize("NFKC");
}

export async function getFinalUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow", // This will follow redirects automatically
    });

    return response.url; // This will be the final URL after redirects
  } catch (error) {
    console.error("Error fetching URL:", error);
    throw error;
  }
}
