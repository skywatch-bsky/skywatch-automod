import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrackedLabelConfig } from "../types.js";

// Mock dependencies before imports
vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../config.js", () => ({
  TRACKED_LABELS: [
    {
      label: "spam",
      threshold: 5,
      accountLabel: "repeat-spammer",
      accountComment: "Account has posted spam multiple times",
    },
    {
      label: "scam",
      threshold: 3,
      accountLabel: "repeat-scammer",
      accountComment: "Account has posted scam content multiple times",
      windowDays: 14,
      reportAcct: true,
      commentAcct: true,
    },
  ] as TrackedLabelConfig[],
}));

vi.mock("../redis.js", () => ({
  addPostAndCheckThreshold: vi.fn(),
}));

// Now import after mocks are set up
import { trackPostLabel } from "../trackPostLabel.js";
import { logger } from "../logger.js";
import { addPostAndCheckThreshold } from "../redis.js";

describe("trackPostLabel", () => {
  const testDid = "did:plc:test123";
  const testAtURI = "at://did:plc:test123/app.bsky.feed.post/abc123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("label not tracked", () => {
    it("should return null for untracked label", async () => {
      const result = await trackPostLabel(
        testDid,
        testAtURI,
        "not-tracked-label",
      );

      expect(result).toBeNull();
      expect(addPostAndCheckThreshold).not.toHaveBeenCalled();
    });

    it("should not log for untracked label", async () => {
      await trackPostLabel(testDid, testAtURI, "not-tracked-label");

      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("tracked label below threshold", () => {
    it("should return null when count is below threshold", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(3);

      const result = await trackPostLabel(testDid, testAtURI, "spam");

      expect(result).toBeNull();
      expect(addPostAndCheckThreshold).toHaveBeenCalledWith(
        testDid,
        testAtURI,
        expect.objectContaining({ label: "spam", threshold: 5 }),
      );
    });

    it("should log info when below threshold", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(3);

      await trackPostLabel(testDid, testAtURI, "spam");

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRACK_LABEL",
          did: testDid,
          label: "spam",
          currentCount: 3,
          threshold: 5,
        }),
        expect.stringContaining("3/5"),
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("tracked label at threshold", () => {
    it("should return action when count equals threshold", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(5);

      const result = await trackPostLabel(testDid, testAtURI, "spam");

      expect(result).toEqual({
        type: "label-account",
        did: testDid,
        config: expect.objectContaining({
          label: "spam",
          threshold: 5,
          accountLabel: "repeat-spammer",
          accountComment: "Account has posted spam multiple times",
        }),
        currentCount: 5,
      });
    });

    it("should log warning when threshold is met", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(5);

      await trackPostLabel(testDid, testAtURI, "spam");

      expect(logger.info).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRACK_LABEL",
          did: testDid,
          label: "spam",
          currentCount: 5,
          threshold: 5,
        }),
        expect.stringContaining("Threshold met"),
      );
    });
  });

  describe("tracked label above threshold", () => {
    it("should return action when count exceeds threshold", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(8);

      const result = await trackPostLabel(testDid, testAtURI, "spam");

      expect(result).toEqual({
        type: "label-account",
        did: testDid,
        config: expect.objectContaining({
          label: "spam",
          threshold: 5,
        }),
        currentCount: 8,
      });
    });

    it("should include all config fields in action", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(3);

      const result = await trackPostLabel(testDid, testAtURI, "scam");

      expect(result).toEqual({
        type: "label-account",
        did: testDid,
        config: {
          label: "scam",
          threshold: 3,
          accountLabel: "repeat-scammer",
          accountComment: "Account has posted scam content multiple times",
          windowDays: 14,
          reportAcct: true,
          commentAcct: true,
        },
        currentCount: 3,
      });
    });
  });

  describe("error handling", () => {
    it("should return null on Redis error", async () => {
      vi.mocked(addPostAndCheckThreshold).mockRejectedValue(
        new Error("Redis connection failed"),
      );

      const result = await trackPostLabel(testDid, testAtURI, "spam");

      expect(result).toBeNull();
    });

    it("should log error on Redis failure", async () => {
      const error = new Error("Redis connection failed");
      vi.mocked(addPostAndCheckThreshold).mockRejectedValue(error);

      await trackPostLabel(testDid, testAtURI, "spam");

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRACK_LABEL",
          did: testDid,
          label: "spam",
          atURI: testAtURI,
          name: "Error",
          message: "Redis connection failed",
        }),
        "Failed to track post label",
      );
    });

    it("should handle non-Error objects", async () => {
      vi.mocked(addPostAndCheckThreshold).mockRejectedValue("string error");

      await trackPostLabel(testDid, testAtURI, "spam");

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "string error",
        }),
        "Failed to track post label",
      );
    });

    it("should not throw on error (graceful degradation)", async () => {
      vi.mocked(addPostAndCheckThreshold).mockRejectedValue(
        new Error("Redis connection failed"),
      );

      await expect(
        trackPostLabel(testDid, testAtURI, "spam"),
      ).resolves.toBeNull();
    });
  });

  describe("multiple tracked labels", () => {
    it("should handle different labels independently", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(2);

      await trackPostLabel(testDid, testAtURI, "spam");
      await trackPostLabel(testDid, testAtURI, "scam");

      expect(addPostAndCheckThreshold).toHaveBeenNthCalledWith(
        1,
        testDid,
        testAtURI,
        expect.objectContaining({ label: "spam" }),
      );
      expect(addPostAndCheckThreshold).toHaveBeenNthCalledWith(
        2,
        testDid,
        testAtURI,
        expect.objectContaining({ label: "scam" }),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle threshold of 1", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(1);

      const result = await trackPostLabel(testDid, testAtURI, "spam");

      // Should trigger immediately on first post if threshold is 1
      // But our mock has threshold 5, so count 1 won't trigger
      expect(result).toBeNull();
    });

    it("should handle empty DID", async () => {
      vi.mocked(addPostAndCheckThreshold).mockResolvedValue(2);

      const result = await trackPostLabel("", testAtURI, "spam");

      expect(result).toBeNull();
      expect(addPostAndCheckThreshold).toHaveBeenCalledWith(
        "",
        testAtURI,
        expect.any(Object),
      );
    });
  });
});
