import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import Redis from "ioredis";
import { addPostAndCheckThresholdWithClient } from "../../redis.js";
import type { TrackedLabelConfig } from "../../types.js";

describe("Post Label Tracking Integration Tests", () => {
  let redisContainer: StartedTestContainer;
  let testRedis: Redis;

  beforeAll(async () => {
    // Start Redis container
    redisContainer = await new GenericContainer("redis:7-alpine")
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start();

    const port = redisContainer.getMappedPort(6379);
    testRedis = new Redis({
      host: "localhost",
      port,
      maxRetriesPerRequest: 1,
    });

    // Verify connection
    await testRedis.ping();
  }, 60000); // 60 second timeout for container startup

  afterAll(async () => {
    await testRedis.quit();
    await redisContainer.stop();
  });

  beforeEach(async () => {
    // Clear all Redis data before each test
    await testRedis.flushall();
  });

  describe("addPostAndCheckThreshold", () => {
    const testDid = "did:plc:integration-test-123";
    const testConfig: TrackedLabelConfig = {
      label: "spam",
      threshold: 3,
      accountLabel: "repeat-spammer",
      accountComment: "Account has posted spam multiple times",
    };

    it("should add post and return count of 1 for first post", async () => {
      const atURI1 = "at://did:plc:test/app.bsky.feed.post/abc1";

      const count = await addPostAndCheckThresholdWithClient(
        testRedis,
        testDid,
        atURI1,
        testConfig,
      );

      expect(count).toBe(1);

      // Verify data in Redis
      const key = `post-labels:${testDid}:spam`;
      const members = await testRedis.zrange(key, 0, -1);
      expect(members).toEqual([atURI1]);
    });

    it("should increment count for multiple posts", async () => {
      const atURI1 = "at://did:plc:test/app.bsky.feed.post/abc1";
      const atURI2 = "at://did:plc:test/app.bsky.feed.post/abc2";
      const atURI3 = "at://did:plc:test/app.bsky.feed.post/abc3";

      const count1 = await addPostAndCheckThresholdWithClient(
        testRedis,
        testDid,
        atURI1,
        testConfig,
      );
      const count2 = await addPostAndCheckThresholdWithClient(
        testRedis,
        testDid,
        atURI2,
        testConfig,
      );
      const count3 = await addPostAndCheckThresholdWithClient(
        testRedis,
        testDid,
        atURI3,
        testConfig,
      );

      expect(count1).toBe(1);
      expect(count2).toBe(2);
      expect(count3).toBe(3);
    });

    it("should not duplicate posts with same atURI", async () => {
      const atURI = "at://did:plc:test/app.bsky.feed.post/abc1";

      const count1 = await addPostAndCheckThresholdWithClient(testRedis, testDid, atURI, testConfig);
      const count2 = await addPostAndCheckThresholdWithClient(testRedis, testDid, atURI, testConfig);

      expect(count1).toBe(1);
      expect(count2).toBe(1);

      const key = `post-labels:${testDid}:spam`;
      const members = await testRedis.zrange(key, 0, -1);
      expect(members).toHaveLength(1);
    });

    it("should set TTL on keys", async () => {
      const atURI = "at://did:plc:test/app.bsky.feed.post/abc1";

      await addPostAndCheckThresholdWithClient(testRedis, testDid, atURI, testConfig);

      const key = `post-labels:${testDid}:spam`;
      const ttl = await testRedis.ttl(key);

      // TTL should be close to 30 days (2592000 seconds)
      expect(ttl).toBeGreaterThan(2591900); // Allow small margin
      expect(ttl).toBeLessThanOrEqual(2592000);
    });

    it("should handle windowDays filtering", async () => {
      const configWithWindow: TrackedLabelConfig = {
        ...testConfig,
        windowDays: 1, // 1 day window
      };

      const now = Date.now();
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
      const key = `post-labels:${testDid}:spam`;

      // Manually add old post
      await testRedis.zadd(
        key,
        twoDaysAgo,
        "at://did:plc:test/app.bsky.feed.post/old",
      );

      // Add new post
      const count = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://did:plc:test/app.bsky.feed.post/new",
        configWithWindow,
      );

      // Should only count the new post (old one was pruned)
      expect(count).toBe(1);

      const members = await testRedis.zrange(key, 0, -1);
      expect(members).toEqual(["at://did:plc:test/app.bsky.feed.post/new"]);
    });

    it("should handle concurrent posts from same account", async () => {
      const posts = Array.from(
        { length: 10 },
        (_, i) => `at://did:plc:test/app.bsky.feed.post/post${i}`,
      );

      // Add all posts concurrently
      const results = await Promise.all(
        posts.map((atURI) => addPostAndCheckThresholdWithClient(testRedis, testDid, atURI, testConfig)),
      );

      // Last result should be 10
      expect(results[results.length - 1]).toBe(10);

      const key = `post-labels:${testDid}:spam`;
      const count = await testRedis.zcard(key);
      expect(count).toBe(10);
    });

    it("should isolate counts by DID", async () => {
      const did1 = "did:plc:user1";
      const did2 = "did:plc:user2";
      const atURI = "at://same/post/uri";

      const count1 = await addPostAndCheckThresholdWithClient(testRedis, did1, atURI, testConfig);
      const count2 = await addPostAndCheckThresholdWithClient(testRedis, did2, atURI, testConfig);

      expect(count1).toBe(1);
      expect(count2).toBe(1);

      const key1 = `post-labels:${did1}:spam`;
      const key2 = `post-labels:${did2}:spam`;

      const members1 = await testRedis.zrange(key1, 0, -1);
      const members2 = await testRedis.zrange(key2, 0, -1);

      expect(members1).toHaveLength(1);
      expect(members2).toHaveLength(1);
    });

    it("should isolate counts by label", async () => {
      const spamConfig = { ...testConfig, label: "spam" };
      const scamConfig = { ...testConfig, label: "scam" };
      const atURI = "at://did:plc:test/app.bsky.feed.post/abc1";

      const spamCount = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        atURI,
        spamConfig,
      );
      const scamCount = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        atURI,
        scamConfig,
      );

      expect(spamCount).toBe(1);
      expect(scamCount).toBe(1);
    });
  });

  describe("threshold triggering", () => {
    it("should detect when threshold is exactly met", async () => {
      const testDid = "did:plc:threshold-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 3,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
      };

      await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://post1",
        config,
      );
      await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://post2",
        config,
      );
      const count3 = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://post3",
        config,
      );

      expect(count3).toBe(3);
      expect(count3).toBeGreaterThanOrEqual(config.threshold);
    });

    it("should detect when threshold is exceeded", async () => {
      const testDid = "did:plc:exceed-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 2,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
      };

      await addPostAndCheckThresholdWithClient(testRedis, testDid, "at://post1", config);
      await addPostAndCheckThresholdWithClient(testRedis, testDid, "at://post2", config);
      const count3 = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://post3",
        config,
      );
      const count4 = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://post4",
        config,
      );

      expect(count3).toBe(3);
      expect(count4).toBe(4);
      expect(count3).toBeGreaterThanOrEqual(config.threshold);
      expect(count4).toBeGreaterThanOrEqual(config.threshold);
    });
  });

  describe("window expiry", () => {
    it("should only count posts within the time window", async () => {
      const testDid = "did:plc:window-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 5,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
        windowDays: 7, // 1 week window
      };

      const key = `post-labels:${testDid}:spam`;
      const now = Date.now();
      const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;
      const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

      // Manually add posts at different times
      await testRedis.zadd(key, tenDaysAgo, "at://old-post-1");
      await testRedis.zadd(key, tenDaysAgo + 1000, "at://old-post-2");
      await testRedis.zadd(key, fiveDaysAgo, "at://recent-post-1");

      // Add new post (should trigger pruning)
      const count = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://new-post",
        config,
      );

      // Should only count posts within 7-day window (recent + new)
      expect(count).toBe(2);

      const members = await testRedis.zrange(key, 0, -1);
      expect(members).toEqual(["at://recent-post-1", "at://new-post"]);
    });

    it("should keep all posts when windowDays is not set", async () => {
      const testDid = "did:plc:no-window-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 5,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
        // No windowDays
      };

      const key = `post-labels:${testDid}:spam`;
      const now = Date.now();
      const longAgo = now - 100 * 24 * 60 * 60 * 1000; // 100 days ago

      // Add old post
      await testRedis.zadd(key, longAgo, "at://very-old-post");

      // Add new post
      const count = await addPostAndCheckThresholdWithClient(testRedis, 
        testDid,
        "at://new-post",
        config,
      );

      // Should count both (no window pruning)
      expect(count).toBe(2);
    });
  });

  describe("TTL behavior", () => {
    it("should refresh TTL on each update", async () => {
      const testDid = "did:plc:ttl-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 5,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
      };

      const key = `post-labels:${testDid}:spam`;

      // Add first post
      await addPostAndCheckThresholdWithClient(testRedis, testDid, "at://post1", config);
      const ttl1 = await testRedis.ttl(key);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Add second post
      await addPostAndCheckThresholdWithClient(testRedis, testDid, "at://post2", config);
      const ttl2 = await testRedis.ttl(key);

      // TTL should be refreshed (approximately the same or slightly higher)
      // Allow for small timing variance
      expect(Math.abs(ttl2 - ttl1)).toBeLessThan(5);
      expect(ttl2).toBeGreaterThan(2591000); // Still close to 30 days
    });
  });

  describe("error handling", () => {
    it("should handle Redis errors gracefully", async () => {
      // Disconnect the test Redis client to simulate failure
      await testRedis.quit();

      const testDid = "did:plc:error-test";
      const config: TrackedLabelConfig = {
        label: "spam",
        threshold: 3,
        accountLabel: "repeat-spammer",
        accountComment: "Test",
      };

      // This should throw because Redis is disconnected
      await expect(
        addPostAndCheckThresholdWithClient(testRedis, testDid, "at://post1", config),
      ).rejects.toThrow();

      // Reconnect for cleanup
      const port = redisContainer.getMappedPort(6379);
      testRedis = new Redis({
        host: "localhost",
        port,
        maxRetriesPerRequest: 1,
      });
    });
  });
});
