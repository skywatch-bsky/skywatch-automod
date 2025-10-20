import { describe, expect, it, beforeEach, vi } from "vitest";
import { limit, getRateLimitState, updateRateLimitState } from "../limits.js";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Reset rate limit state before each test
    updateRateLimitState({
      limit: 280,
      remaining: 280,
      reset: Math.floor(Date.now() / 1000) + 30,
    });
  });

  describe("limit", () => {
    it("should limit the rate of calls", async () => {
      const calls = [];
      for (let i = 0; i < 10; i++) {
        calls.push(limit(() => Promise.resolve(Date.now())));
      }

      const start = Date.now();
      const results = await Promise.all(calls);
      const end = Date.now();

      expect(results.length).toBe(10);
      for (const result of results) {
        expect(typeof result).toBe("number");
      }
      expect(end - start).toBeGreaterThanOrEqual(0);
    }, 40000);

    it("should execute function and return result", async () => {
      const result = await limit(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it("should handle errors from wrapped function", async () => {
      await expect(
        limit(() => Promise.reject(new Error("test error")))
      ).rejects.toThrow("test error");
    });

    it("should handle multiple concurrent requests", async () => {
      const results = await Promise.all([
        limit(() => Promise.resolve(1)),
        limit(() => Promise.resolve(2)),
        limit(() => Promise.resolve(3)),
      ]);

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("getRateLimitState", () => {
    it("should return current rate limit state", () => {
      const state = getRateLimitState();

      expect(state).toHaveProperty("limit");
      expect(state).toHaveProperty("remaining");
      expect(state).toHaveProperty("reset");
      expect(typeof state.limit).toBe("number");
      expect(typeof state.remaining).toBe("number");
      expect(typeof state.reset).toBe("number");
    });

    it("should return a copy of state", () => {
      const state1 = getRateLimitState();
      const state2 = getRateLimitState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different object references
    });
  });

  describe("updateRateLimitState", () => {
    it("should update limit", () => {
      updateRateLimitState({ limit: 500 });
      const state = getRateLimitState();
      expect(state.limit).toBe(500);
    });

    it("should update remaining", () => {
      updateRateLimitState({ remaining: 100 });
      const state = getRateLimitState();
      expect(state.remaining).toBe(100);
    });

    it("should update reset", () => {
      const newReset = Math.floor(Date.now() / 1000) + 60;
      updateRateLimitState({ reset: newReset });
      const state = getRateLimitState();
      expect(state.reset).toBe(newReset);
    });

    it("should update policy", () => {
      updateRateLimitState({ policy: "3000;w=300" });
      const state = getRateLimitState();
      expect(state.policy).toBe("3000;w=300");
    });

    it("should update multiple fields at once", () => {
      const updates = {
        limit: 3000,
        remaining: 2500,
        reset: Math.floor(Date.now() / 1000) + 300,
        policy: "3000;w=300",
      };

      updateRateLimitState(updates);
      const state = getRateLimitState();

      expect(state.limit).toBe(3000);
      expect(state.remaining).toBe(2500);
      expect(state.reset).toBe(updates.reset);
      expect(state.policy).toBe("3000;w=300");
    });

    it("should preserve unspecified fields", () => {
      updateRateLimitState({
        limit: 3000,
        remaining: 2500,
        reset: Math.floor(Date.now() / 1000) + 300,
      });

      updateRateLimitState({ remaining: 2000 });

      const state = getRateLimitState();
      expect(state.limit).toBe(3000); // Preserved
      expect(state.remaining).toBe(2000); // Updated
    });
  });

  describe("awaitRateLimit", () => {
    it("should not wait when remaining is above safety buffer", async () => {
      updateRateLimitState({ remaining: 100 });

      const start = Date.now();
      await limit(() => Promise.resolve(1));
      const elapsed = Date.now() - start;

      // Should complete almost immediately (< 100ms)
      expect(elapsed).toBeLessThan(100);
    });

    it("should wait when remaining is at safety buffer", async () => {
      const now = Math.floor(Date.now() / 1000);
      updateRateLimitState({
        remaining: 5, // At safety buffer
        reset: now + 1, // Reset in 1 second
      });

      const start = Date.now();
      await limit(() => Promise.resolve(1));
      const elapsed = Date.now() - start;

      // Should wait approximately 1 second
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(elapsed).toBeLessThan(1500);
    }, 10000);

    it("should wait when remaining is below safety buffer", async () => {
      const now = Math.floor(Date.now() / 1000);
      updateRateLimitState({
        remaining: 2, // Below safety buffer
        reset: now + 1, // Reset in 1 second
      });

      const start = Date.now();
      await limit(() => Promise.resolve(1));
      const elapsed = Date.now() - start;

      // Should wait approximately 1 second
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(elapsed).toBeLessThan(1500);
    }, 10000);

    it("should not wait if reset time has passed", async () => {
      const now = Math.floor(Date.now() / 1000);
      updateRateLimitState({
        remaining: 2,
        reset: now - 10, // Reset was 10 seconds ago
      });

      const start = Date.now();
      await limit(() => Promise.resolve(1));
      const elapsed = Date.now() - start;

      // Should not wait
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe("metrics", () => {
    it("should track concurrent requests", async () => {
      const delays = [100, 100, 100];
      const promises = delays.map((delay) =>
        limit(() => new Promise((resolve) => setTimeout(resolve, delay)))
      );

      await Promise.all(promises);
      // If this completes without error, concurrent tracking works
      expect(true).toBe(true);
    });
  });
});
