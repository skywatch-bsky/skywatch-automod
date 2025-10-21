import { logger } from "../logger.js";

export async function getFinalUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000); // 15-second timeout

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (compatible; SkyWatch/1.0; +https://github.com/skywatch-bsky/skywatch-automod)",
  };

  try {
    // Try HEAD request first (faster, less bandwidth)
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeoutId);
    return response.url;
  } catch {
    clearTimeout(timeoutId);

    // Some services block HEAD requests, try GET as fallback
    const getController = new AbortController();
    const getTimeoutId = setTimeout(() => {
      getController.abort();
    }, 15000);

    try {
      logger.debug(
        { process: "UTILS", url, method: "HEAD" },
        "HEAD request failed, trying GET",
      );

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: getController.signal,
        headers,
      });
      clearTimeout(getTimeoutId);
      return response.url;
    } catch (error) {
      clearTimeout(getTimeoutId);

      // Properly serialize error information
      const errorInfo =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              cause: error.cause,
            }
          : { error: String(error) };

      if (error instanceof Error && error.name === "AbortError") {
        logger.warn(
          { process: "UTILS", url, ...errorInfo },
          "Timeout resolving URL",
        );
      } else {
        logger.warn(
          { process: "UTILS", url, ...errorInfo },
          "Failed to resolve URL",
        );
      }
      throw error;
    }
  }
}
