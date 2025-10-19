import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFinalUrl } from "./getFinalUrl.js";

// Mock the logger
vi.mock("../logger.js", () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("getFinalUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe("successful HEAD requests", () => {
    it("should return the final URL after redirect", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/final",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/redirect");

      expect(result).toBe("https://example.com/final");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/redirect",
        expect.objectContaining({
          method: "HEAD",
          redirect: "follow",
        }),
      );
    });

    it("should return the same URL if no redirect", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/page",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/page");

      expect(result).toBe("https://example.com/page");
    });

    it("should include proper user agent header", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/final",
      });
      vi.stubGlobal("fetch", mockFetch);

      await getFinalUrl("https://example.com/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/test",
        expect.objectContaining({
          headers: {
            "User-Agent": expect.stringContaining("SkyWatch"),
          },
        }),
      );
    });
  });

  describe("HEAD request failures with GET fallback", () => {
    it("should fallback to GET when HEAD fails", async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error("HEAD not allowed"))
        .mockResolvedValueOnce({
          url: "https://example.com/final",
        });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/test");

      expect(result).toBe("https://example.com/final");
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://example.com/test",
        expect.objectContaining({ method: "HEAD" }),
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://example.com/test",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should handle network errors on HEAD with GET success", async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          url: "https://example.com/final",
        });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/test");

      expect(result).toBe("https://example.com/final");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("timeout handling", () => {
    it("should configure abort signal with timeout for HEAD request", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/final",
      });
      vi.stubGlobal("fetch", mockFetch);

      await getFinalUrl("https://example.com/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/test",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it("should handle AbortError from timeout", async () => {
      const mockFetch = vi.fn().mockRejectedValue(
        Object.assign(new Error("The operation was aborted"), {
          name: "AbortError",
        }),
      );
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://slow.example.com")).rejects.toThrow(
        "The operation was aborted",
      );
    });
  });

  describe("complete failure scenarios", () => {
    it("should throw error when both HEAD and GET fail", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://example.com/test")).rejects.toThrow(
        "Network error",
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should throw AbortError on timeout", async () => {
      const mockFetch = vi.fn().mockImplementation(() => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        return Promise.reject(error);
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://example.com/test")).rejects.toThrow();
    });

    it("should handle non-Error exceptions", async () => {
      const mockFetch = vi.fn().mockRejectedValue("string error");
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://example.com/test")).rejects.toBe(
        "string error",
      );
    });
  });

  describe("URL redirect chains", () => {
    it("should handle multiple redirects", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/final-destination",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://t.co/shortlink");

      expect(result).toBe("https://example.com/final-destination");
    });

    it("should preserve query parameters in final URL", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/page?param=value&other=test",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/redirect");

      expect(result).toBe("https://example.com/page?param=value&other=test");
    });

    it("should handle fragment identifiers", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/page#section",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/redirect");

      expect(result).toBe("https://example.com/page#section");
    });
  });

  describe("edge cases", () => {
    it("should handle URLs with special characters", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://example.com/page?query=hello%20world",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl(
        "https://example.com/page?query=hello%20world",
      );

      expect(result).toBe("https://example.com/page?query=hello%20world");
    });

    it("should handle internationalized domain names", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        url: "https://xn--example-r63b.com/",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await getFinalUrl("https://example.com/redirect");

      expect(result).toBe("https://xn--example-r63b.com/");
    });
  });

  describe("error serialization", () => {
    it("should properly serialize Error objects", async () => {
      const error = new Error("Test error");
      error.cause = "underlying cause";

      const mockFetch = vi.fn().mockRejectedValue(error);
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://example.com/test")).rejects.toThrow(
        "Test error",
      );
    });

    it("should handle errors without cause", async () => {
      const error = new Error("Simple error");
      const mockFetch = vi.fn().mockRejectedValue(error);
      vi.stubGlobal("fetch", mockFetch);

      await expect(getFinalUrl("https://example.com/test")).rejects.toThrow(
        "Simple error",
      );
    });
  });
});
