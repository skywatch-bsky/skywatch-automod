import { createClient } from "redis";
import { REDIS_URL } from "./config.js";
import { logger } from "./logger.js";

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err: Error) => {
  logger.error({ err }, "Redis client error");
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("ready", () => {
  logger.info("Redis client ready");
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis client reconnecting");
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, "Failed to connect to Redis");
    throw err;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.quit();
    logger.info("Redis client disconnected");
  } catch (err) {
    logger.error({ err }, "Error disconnecting Redis");
  }
}

function getPostLabelCacheKey(atURI: string, label: string): string {
  return `post-label:${atURI}:${label}`;
}

function getAccountLabelCacheKey(did: string, label: string): string {
  return `account-label:${did}:${label}`;
}

export async function tryClaimPostLabel(
  atURI: string,
  label: string,
): Promise<boolean> {
  try {
    const key = getPostLabelCacheKey(atURI, label);
    const result = await redisClient.set(key, "1", {
      NX: true,
      EX: 60 * 60 * 24 * 7,
    });
    return result === "OK";
  } catch (err) {
    logger.warn(
      { err, atURI, label },
      "Error claiming post label in Redis, allowing through",
    );
    return true;
  }
}

export async function tryClaimAccountLabel(
  did: string,
  label: string,
): Promise<boolean> {
  try {
    const key = getAccountLabelCacheKey(did, label);
    const result = await redisClient.set(key, "1", {
      NX: true,
      EX: 60 * 60 * 24 * 7,
    });
    return result === "OK";
  } catch (err) {
    logger.warn(
      { err, did, label },
      "Error claiming account label in Redis, allowing through",
    );
    return true;
  }
}

export async function tryClaimAccountComment(
  did: string,
  atURI: string,
): Promise<boolean> {
  try {
    const key = `account-comment:${did}:${atURI}`;
    const result = await redisClient.set(key, "1", {
      NX: true,
      EX: 60 * 60 * 24 * 7,
    });
    return result === "OK";
  } catch (err) {
    logger.warn(
      { err, did, atURI },
      "Error claiming account comment in Redis, allowing through",
    );
    return true;
  }
}

function getPostLabelTrackingKey(
  did: string,
  label: string,
  windowDays: number,
): string {
  return `account-post-labels:${did}:${label}:${windowDays}`;
}

export async function trackPostLabelForAccount(
  did: string,
  label: string,
  timestamp: number,
  windowDays: number,
): Promise<void> {
  try {
    const key = getPostLabelTrackingKey(did, label, windowDays);
    const windowStartTime = timestamp - windowDays * 24 * 60 * 60 * 1000000;

    await redisClient.zRemRangeByScore(key, "-inf", windowStartTime);

    await redisClient.zAdd(key, {
      score: timestamp,
      value: timestamp.toString(),
    });

    const ttlSeconds = (windowDays + 1) * 24 * 60 * 60;
    await redisClient.expire(key, ttlSeconds);

    logger.debug(
      { did, label, timestamp, windowDays },
      "Tracked post label for account",
    );
  } catch (err) {
    logger.error(
      { err, did, label, timestamp, windowDays },
      "Error tracking post label in Redis",
    );
    throw err;
  }
}

export async function getPostLabelCountInWindow(
  did: string,
  labels: string[],
  windowDays: number,
  currentTime: number,
): Promise<number> {
  try {
    const windowStartTime = currentTime - windowDays * 24 * 60 * 60 * 1000000;
    let totalCount = 0;

    for (const label of labels) {
      const key = getPostLabelTrackingKey(did, label, windowDays);
      const count = await redisClient.zCount(key, windowStartTime, "+inf");
      totalCount += count;
    }

    logger.debug(
      { did, labels, windowDays, totalCount },
      "Retrieved post label count in window",
    );

    return totalCount;
  } catch (err) {
    logger.error(
      { err, did, labels, windowDays },
      "Error getting post label count from Redis",
    );
    throw err;
  }
}
