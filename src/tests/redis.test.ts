import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addPostAndCheckThreshold } from "../redis.js";
import type { TrackedLabelConfig } from "../types.js";

// Mock ioredis
vi.mock("ioredis", () => {
  const mockPipeline = {
    zadd: vi.fn().mockReturnThis(),
    zremrangebyscore: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    zcard: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  };

  const MockRedis = vi.fn(() => ({
    pipeline: vi.fn(() => mockPipeline),
    connect: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue("PONG"),
    on: vi.fn(),
  }));

  return {
    default: MockRedis,
    __mockPipeline: mockPipeline,
  };
});

// Import after mocking
import Redis from "ioredis";

// Get the mock pipeline for assertions
const ioredisModule = await import("ioredis");
const mockPipeline = (ioredisModule as any).__mockPipeline;

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../config.js", () => ({
  REDIS_URL: "redis://localhost:6379",
}));

describe("redis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("addPostAndCheckThreshold", () => {
    const mockDid = "did:plc:test123";
    const mockAtURI = "at://did:plc:test123/app.bsky.feed.post/abc123";
    const mockConfig: TrackedLabelConfig = {
      label: "spam",
      threshold: 5,
      accountLabel: "repeat-spammer",
      accountComment: "Account has posted spam multiple times",
    };

    it("should add post and return count", async () => {
      // Mock successful pipeline execution for a 3-command pipeline (no window)
      mockPipeline.exec.mockResolvedValue([
        [null, 1], // zadd
        [null, 1], // expire
        [null, 3], // zcard - count is 3
      ]);

      const count = await addPostAndCheckThreshold(
        mockDid,
        mockAtURI,
        mockConfig,
      );

      expect(count).toBe(3);
      expect(mockPipeline.zadd).toHaveBeenCalledWith(
        `post-labels:${mockDid}:${mockConfig.accountLabel}`,
        expect.any(Number),
        mockAtURI,
      );
      expect(mockPipeline.expire).toHaveBeenCalledWith(
        `post-labels:${mockDid}:${mockConfig.accountLabel}`,
        30 * 24 * 60 * 60,
      );
      expect(mockPipeline.zcard).toHaveBeenCalledWith(
        `post-labels:${mockDid}:${mockConfig.accountLabel}`,
      );
    });

    it("should remove old posts when windowDays is specified", async () => {
      const configWithWindow: TrackedLabelConfig = {
        ...mockConfig,
        windowDays: 30,
      };

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      mockPipeline.exec.mockResolvedValue([
        [null, 1], // zadd
        [null, 2], // zremrangebyscore - removed 2 old posts
        [null, 1], // expire
        [null, 5], // zcard - count is 5
      ]);

      const count = await addPostAndCheckThreshold(
        mockDid,
        mockAtURI,
        configWithWindow,
      );

      expect(count).toBe(5);
      const cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
      expect(mockPipeline.zremrangebyscore).toHaveBeenCalledWith(
        `post-labels:${mockDid}:${configWithWindow.accountLabel}`,
        "-inf",
        cutoffTime,
      );
    });

    it("should not call zremrangebyscore when windowDays is not specified", async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 1], // zadd
        [null, 1], // expire
        [null, 2], // zcard
      ]);

      await addPostAndCheckThreshold(mockDid, mockAtURI, mockConfig);

      expect(mockPipeline.zadd).toHaveBeenCalledTimes(1);
      expect(mockPipeline.expire).toHaveBeenCalledTimes(1);
      expect(mockPipeline.zcard).toHaveBeenCalledTimes(1);
      // zremrangebyscore should not be called when windowDays is not set
      expect(mockPipeline.zremrangebyscore).not.toHaveBeenCalled();
    });

    it("should throw error if pipeline execution returns null", async () => {
      mockPipeline.exec.mockResolvedValue(null);

      await expect(
        addPostAndCheckThreshold(mockDid, mockAtURI, mockConfig),
      ).rejects.toThrow("Pipeline execution returned null");
    });

    it("should throw error if ZCARD result is missing", async () => {
      // Empty results array
      mockPipeline.exec.mockResolvedValue([]);

      await expect(
        addPostAndCheckThreshold(mockDid, mockAtURI, mockConfig),
      ).rejects.toThrow("ZCARD result not found in pipeline");
    });

    it("should throw error if ZCARD operation fails", async () => {
      const redisError = new Error("Redis connection lost");
      mockPipeline.exec.mockResolvedValue([
        [null, 1], // zadd
        [null, 0], // zremrangebyscore
        [null, 1], // expire
        [redisError, null], // zcard - error
      ]);

      await expect(
        addPostAndCheckThreshold(mockDid, mockAtURI, mockConfig),
      ).rejects.toThrow("Redis connection lost");
    });

    it("should use correct Redis key format", async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 1],
        [null, 0],
        [null, 1],
        [null, 1],
      ]);

      await addPostAndCheckThreshold(mockDid, mockAtURI, mockConfig);

      const expectedKey = `post-labels:${mockDid}:${mockConfig.accountLabel}`;
      expect(mockPipeline.zadd).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
        mockAtURI,
      );
      expect(mockPipeline.expire).toHaveBeenCalledWith(
        expectedKey,
        expect.any(Number),
      );
      expect(mockPipeline.zcard).toHaveBeenCalledWith(expectedKey);
    });

    it("should return 0 when no posts exist", async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 1], // zadd
        [null, 0], // zremrangebyscore
        [null, 1], // expire
        [null, 0], // zcard - count is 0 (shouldn't happen but edge case)
      ]);

      const count = await addPostAndCheckThreshold(
        mockDid,
        mockAtURI,
        mockConfig,
      );

      expect(count).toBe(0);
    });

    it("should handle exactly threshold count", async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 1],
        [null, 0],
        [null, 1],
        [null, 5], // exactly at threshold
      ]);

      const count = await addPostAndCheckThreshold(
        mockDid,
        mockAtURI,
        mockConfig,
      );

      expect(count).toBe(5);
      expect(count).toBe(mockConfig.threshold);
    });

    it("should handle above threshold count", async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 1],
        [null, 0],
        [null, 1],
        [null, 10], // above threshold
      ]);

      const count = await addPostAndCheckThreshold(
        mockDid,
        mockAtURI,
        mockConfig,
      );

      expect(count).toBe(10);
      expect(count).toBeGreaterThan(mockConfig.threshold);
    });
  });
});
