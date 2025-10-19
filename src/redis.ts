import Redis from "ioredis";
import { logger } from "./logger.js";
import { REDIS_URL } from "./config.js";
import { TrackedLabelConfig } from "./types.js";

/**
 * Redis client for tracking post labels and triggering account-level actions
 * based on threshold configurations.
 *
 * Connection Strategy:
 * - Exponential backoff retry with max 3 retries per request
 * - Non-blocking initialization (errors logged but don't crash the app)
 * - Graceful degradation if Redis is unavailable
 */
export const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    if (times > 10) {
      logger.error(
        { process: "REDIS", times },
        "Max Redis connection retries exceeded",
      );
      return null; // Stop retrying
    }
    const delay = Math.min(times * 100, 3000); // Exponential backoff, max 3s
    logger.warn(
      { process: "REDIS", times, delay },
      "Retrying Redis connection",
    );
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't connect immediately
  enableReadyCheck: true,
});

// Connection event handlers
redis.on("connect", () => {
  logger.info({ process: "REDIS" }, "Redis connection established");
});

redis.on("ready", () => {
  logger.info({ process: "REDIS" }, "Redis client ready");
});

redis.on("error", (error) => {
  const errorInfo =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
        }
      : { error: String(error) };

  logger.error({ process: "REDIS", ...errorInfo }, "Redis error");
});

redis.on("close", () => {
  logger.warn({ process: "REDIS" }, "Redis connection closed");
});

redis.on("reconnecting", () => {
  logger.info({ process: "REDIS" }, "Redis reconnecting");
});

/**
 * Check if Redis is connected and ready
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Internal helper that performs the post tracking logic with a custom Redis client.
 * Used by addPostAndCheckThreshold and for testing purposes.
 *
 * @param client - Redis client to use
 * @param did - The DID of the account
 * @param atURI - The AT URI of the labeled post
 * @param config - The tracked label configuration
 * @returns The current count of tracked posts for this did/label combination
 * @throws Error if Redis operations fail
 */
export async function addPostAndCheckThresholdWithClient(
  client: Redis,
  did: string,
  atURI: string,
  config: TrackedLabelConfig,
): Promise<number> {
  const key = `post-labels:${did}:${config.label}`;
  const now = Date.now();
  const pipeline = client.pipeline();

  // Add the new post (timestamp as score, atURI as member)
  pipeline.zadd(key, now, atURI);

  // If a window is specified, remove posts older than the window
  if (config.windowDays) {
    const cutoffTime = now - config.windowDays * 24 * 60 * 60 * 1000;
    pipeline.zremrangebyscore(key, "-inf", cutoffTime);
  }

  // Set a sliding 30-day TTL on the key itself for cleanup
  const ttlSeconds = 30 * 24 * 60 * 60; // 30 days
  pipeline.expire(key, ttlSeconds);

  // Get the current count
  pipeline.zcard(key);

  // Execute pipeline
  const results = await pipeline.exec();

  if (!results) {
    throw new Error("Pipeline execution returned null");
  }

  // Extract the count from the last command (ZCARD is always the last command)
  const zcardResult = results[results.length - 1];
  if (!zcardResult) {
    throw new Error("ZCARD result not found in pipeline");
  }

  const [error, count] = zcardResult;
  if (error) {
    throw error;
  }

  return count as number;
}

/**
 * Add a post to the tracked label set and check if threshold is met.
 *
 * This function uses a Redis pipeline to atomically:
 * 1. Add the post's atURI to a sorted set (keyed by did and label)
 * 2. Remove posts older than the configured window (if windowDays is set)
 * 3. Set a sliding 30-day TTL on the key for automatic cleanup
 * 4. Get the current count of posts in the set
 *
 * Redis Key Pattern: `post-labels:{did}:{label}`
 * Sorted Set Score: Timestamp (for chronological ordering and window filtering)
 * Sorted Set Member: atURI of the labeled post
 *
 * @param did - The DID of the account
 * @param atURI - The AT URI of the labeled post
 * @param config - The tracked label configuration
 * @returns The current count of tracked posts for this did/label combination
 * @throws Error if Redis operations fail
 */
export async function addPostAndCheckThreshold(
  did: string,
  atURI: string,
  config: TrackedLabelConfig,
): Promise<number> {
  return addPostAndCheckThresholdWithClient(redis, did, atURI, config);
}

/**
 * Connect to Redis on startup
 */
export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info({ process: "REDIS" }, "Redis connected successfully");
  } catch (error) {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : { error: String(error) };

    logger.error(
      { process: "REDIS", ...errorInfo },
      "Failed to connect to Redis - continuing without tracking",
    );
  }
}
