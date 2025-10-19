import { logger } from "../logger.js";

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
      logger.warn({ process: "UTILS", url, error }, "Timeout fetching URL");
    } else {
      logger.warn({ process: "UTILS", url, error }, "Error fetching URL");
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}
