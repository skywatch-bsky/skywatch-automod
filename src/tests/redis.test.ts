// Import the mocked redis first to get a reference to the mock client
import { createClient } from "redis";
import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger.js";
// Import the modules to be tested
import {
  connectRedis,
  disconnectRedis,
  getPostLabelCountInWindow,
  getStarterPackCountInWindow,
  trackPostLabelForAccount,
  trackStarterPackForAccount,
  tryClaimAccountLabel,
  tryClaimPostLabel,
} from "../redis.js";

// Mock the 'redis' module in a way that avoids hoisting issues.
// The mock implementation is self-contained.
vi.mock("redis", () => {
  const mockClient = {
    on: vi.fn(),
    connect: vi.fn(),
    quit: vi.fn(),
    exists: vi.fn(),
    set: vi.fn(),
    zAdd: vi.fn(),
    zRemRangeByScore: vi.fn(),
    zCount: vi.fn(),
    expire: vi.fn(),
  };
  return {
    createClient: vi.fn(() => mockClient),
  };
});

const mockRedisClient = createClient();

// Suppress logger output during tests
vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Redis Cache Logic", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Connection", () => {
    it("should call redisClient.connect on connectRedis", async () => {
      await connectRedis();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it("should call redisClient.quit on disconnectRedis", async () => {
      await disconnectRedis();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe("tryClaimPostLabel", () => {
    it("should return true and set key if key does not exist", async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue("OK");
      const result = await tryClaimPostLabel("at://uri", "test-label");
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "post-label:at://uri:test-label",
        "1",
        { NX: true, EX: 60 * 60 * 24 * 7 },
      );
    });

    it("should return false if key already exists", async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue(null);
      const result = await tryClaimPostLabel("at://uri", "test-label");
      expect(result).toBe(false);
    });

    it("should return true and log warning on Redis error", async () => {
      const redisError = new Error("Redis down");
      vi.mocked(mockRedisClient.set).mockRejectedValue(redisError);
      const result = await tryClaimPostLabel("at://uri", "test-label");
      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        { err: redisError, atURI: "at://uri", label: "test-label" },
        "Error claiming post label in Redis, allowing through",
      );
    });
  });

  describe("tryClaimAccountLabel", () => {
    it("should return true and set key if key does not exist", async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue("OK");
      const result = await tryClaimAccountLabel("did:plc:123", "test-label");
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "account-label:did:plc:123:test-label",
        "1",
        { NX: true, EX: 60 * 60 * 24 * 7 },
      );
    });

    it("should return false if key already exists", async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue(null);
      const result = await tryClaimAccountLabel("did:plc:123", "test-label");
      expect(result).toBe(false);
    });
  });

  describe("trackPostLabelForAccount", () => {
    it("should track post label with correct timestamp and TTL", async () => {
      vi.mocked(mockRedisClient.zRemRangeByScore).mockResolvedValue(0);
      vi.mocked(mockRedisClient.zAdd).mockResolvedValue(1);
      vi.mocked(mockRedisClient.expire).mockResolvedValue(true);

      const timestamp = 1640000000000000; // microseconds
      const window = 5;
      const windowUnit = "days" as const;

      await trackPostLabelForAccount(
        "did:plc:123",
        "test-label",
        timestamp,
        window,
        windowUnit,
      );

      const expectedKey = "account-post-labels:did:plc:123:test-label:5days";
      const windowStartTime = timestamp - window * 24 * 60 * 60 * 1000000;

      expect(mockRedisClient.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        "-inf",
        windowStartTime,
      );
      expect(mockRedisClient.zAdd).toHaveBeenCalledWith(expectedKey, {
        score: timestamp,
        value: timestamp.toString(),
      });
      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        expectedKey,
        window * 24 * 60 * 60 + 60 * 60,
      );
    });

    it("should throw error on Redis failure", async () => {
      const redisError = new Error("Redis down");
      vi.mocked(mockRedisClient.zRemRangeByScore).mockRejectedValue(redisError);

      await expect(
        trackPostLabelForAccount(
          "did:plc:123",
          "test-label",
          1640000000000000,
          5,
          "days",
        ),
      ).rejects.toThrow("Redis down");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("trackStarterPackForAccount", () => {
    it("should track starter pack with correct timestamp and TTL", async () => {
      vi.mocked(mockRedisClient.zRemRangeByScore).mockResolvedValue(0);
      vi.mocked(mockRedisClient.zAdd).mockResolvedValue(1);
      vi.mocked(mockRedisClient.expire).mockResolvedValue(true);

      const timestamp = 1640000000000000;
      const window = 24;
      const windowUnit = "hours" as const;

      await trackStarterPackForAccount(
        "did:plc:123",
        "at://did:plc:123/app.bsky.graph.starterpack/abc",
        timestamp,
        window,
        windowUnit,
      );

      const expectedKey = "starterpack:threshold:did:plc:123:24hours";
      const windowStartTime = timestamp - window * 60 * 60 * 1000000;

      expect(mockRedisClient.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        "-inf",
        windowStartTime,
      );
      expect(mockRedisClient.zAdd).toHaveBeenCalledWith(expectedKey, {
        score: timestamp,
        value: "at://did:plc:123/app.bsky.graph.starterpack/abc",
      });
      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        expectedKey,
        window * 60 * 60 + 60 * 60,
      );
    });

    it("should throw error on Redis failure", async () => {
      const redisError = new Error("Redis down");
      vi.mocked(mockRedisClient.zRemRangeByScore).mockRejectedValue(redisError);

      await expect(
        trackStarterPackForAccount(
          "did:plc:123",
          "at://did:plc:123/app.bsky.graph.starterpack/abc",
          1640000000000000,
          24,
          "hours",
        ),
      ).rejects.toThrow("Redis down");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getStarterPackCountInWindow", () => {
    it("should count starter packs in window", async () => {
      vi.mocked(mockRedisClient.zCount).mockResolvedValue(3);

      const currentTime = 1640000000000000;
      const window = 24;
      const windowUnit = "hours" as const;
      const count = await getStarterPackCountInWindow(
        "did:plc:123",
        window,
        windowUnit,
        currentTime,
      );

      expect(count).toBe(3);
      const windowStartTime = currentTime - window * 60 * 60 * 1000000;
      expect(mockRedisClient.zCount).toHaveBeenCalledWith(
        "starterpack:threshold:did:plc:123:24hours",
        windowStartTime,
        "+inf",
      );
    });

    it("should throw error on Redis failure", async () => {
      const redisError = new Error("Redis down");
      vi.mocked(mockRedisClient.zCount).mockRejectedValue(redisError);

      await expect(
        getStarterPackCountInWindow("did:plc:123", 24, "hours", 1640000000000000),
      ).rejects.toThrow("Redis down");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getPostLabelCountInWindow", () => {
    it("should count posts for single label", async () => {
      vi.mocked(mockRedisClient.zCount).mockResolvedValue(3);

      const currentTime = 1640000000000000;
      const window = 5;
      const windowUnit = "days" as const;
      const count = await getPostLabelCountInWindow(
        "did:plc:123",
        ["test-label"],
        window,
        windowUnit,
        currentTime,
      );

      expect(count).toBe(3);
      const windowStartTime = currentTime - window * 24 * 60 * 60 * 1000000;
      expect(mockRedisClient.zCount).toHaveBeenCalledWith(
        "account-post-labels:did:plc:123:test-label:5days",
        windowStartTime,
        "+inf",
      );
    });

    it("should sum counts for multiple labels (OR logic)", async () => {
      vi.mocked(mockRedisClient.zCount)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      const currentTime = 1640000000000000;
      const window = 5;
      const windowUnit = "days" as const;
      const count = await getPostLabelCountInWindow(
        "did:plc:123",
        ["label-1", "label-2", "label-3"],
        window,
        windowUnit,
        currentTime,
      );

      expect(count).toBe(6);
      expect(mockRedisClient.zCount).toHaveBeenCalledTimes(3);
    });

    it("should return 0 when no posts in window", async () => {
      vi.mocked(mockRedisClient.zCount).mockResolvedValue(0);

      const count = await getPostLabelCountInWindow(
        "did:plc:123",
        ["test-label"],
        5,
        "days",
        1640000000000000,
      );

      expect(count).toBe(0);
    });

    it("should throw error on Redis failure", async () => {
      const redisError = new Error("Redis down");
      vi.mocked(mockRedisClient.zCount).mockRejectedValue(redisError);

      await expect(
        getPostLabelCountInWindow(
          "did:plc:123",
          ["test-label"],
          5,
          "days",
          1640000000000000,
        ),
      ).rejects.toThrow("Redis down");

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
