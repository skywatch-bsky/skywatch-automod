import { createClient } from "redis";
import { REDIS_URL } from "./config.js";
import { logger } from "./logger.js";
import type { WindowUnit } from "./types.js";

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

export async function deleteAccountLabelClaim(
  did: string,
  label: string,
): Promise<void> {
  try {
    const key = getAccountLabelCacheKey(did, label);
    await redisClient.del(key);
    logger.debug(
      { did, label },
      "Deleted account label claim from Redis cache",
    );
  } catch (err) {
    logger.warn(
      { err, did, label },
      "Error deleting account label claim from Redis",
    );
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

function windowToMicroseconds(window: number, unit: WindowUnit): number {
  const multipliers: Record<WindowUnit, number> = {
    minutes: 60 * 1000000,
    hours: 60 * 60 * 1000000,
    days: 24 * 60 * 60 * 1000000,
  };
  return window * multipliers[unit];
}

function windowToSeconds(window: number, unit: WindowUnit): number {
  const multipliers: Record<WindowUnit, number> = {
    minutes: 60,
    hours: 60 * 60,
    days: 24 * 60 * 60,
  };
  return window * multipliers[unit];
}

function getPostLabelTrackingKey(
  did: string,
  label: string,
  window: number,
  unit: WindowUnit,
): string {
  return `account-post-labels:${did}:${label}:${window.toString()}${unit}`;
}

function getStarterPackTrackingKey(
  did: string,
  window: number,
  unit: WindowUnit,
): string {
  return `starterpack:threshold:${did}:${window.toString()}${unit}`;
}

export async function trackStarterPackForAccount(
  did: string,
  starterPackUri: string,
  timestamp: number,
  window: number,
  windowUnit: WindowUnit,
): Promise<void> {
  try {
    const key = getStarterPackTrackingKey(did, window, windowUnit);
    const windowStartTime = timestamp - windowToMicroseconds(window, windowUnit);

    await redisClient.zRemRangeByScore(key, "-inf", windowStartTime);

    await redisClient.zAdd(key, {
      score: timestamp,
      value: starterPackUri,
    });

    const ttlSeconds = windowToSeconds(window, windowUnit) + 60 * 60;
    await redisClient.expire(key, ttlSeconds);

    logger.debug(
      { did, starterPackUri, timestamp, window, windowUnit },
      "Tracked starter pack for account",
    );
  } catch (err) {
    logger.error(
      { err, did, starterPackUri, timestamp, window, windowUnit },
      "Error tracking starter pack in Redis",
    );
    throw err;
  }
}

export async function getStarterPackCountInWindow(
  did: string,
  window: number,
  windowUnit: WindowUnit,
  currentTime: number,
): Promise<number> {
  try {
    const key = getStarterPackTrackingKey(did, window, windowUnit);
    const windowStartTime = currentTime - windowToMicroseconds(window, windowUnit);
    const count = await redisClient.zCount(key, windowStartTime, "+inf");

    logger.debug(
      { did, window, windowUnit, count },
      "Retrieved starter pack count in window",
    );

    return count;
  } catch (err) {
    logger.error(
      { err, did, window, windowUnit },
      "Error getting starter pack count from Redis",
    );
    throw err;
  }
}

export async function trackPostLabelForAccount(
  did: string,
  label: string,
  timestamp: number,
  window: number,
  windowUnit: WindowUnit,
): Promise<void> {
  try {
    const key = getPostLabelTrackingKey(did, label, window, windowUnit);
    const windowStartTime = timestamp - windowToMicroseconds(window, windowUnit);

    await redisClient.zRemRangeByScore(key, "-inf", windowStartTime);

    await redisClient.zAdd(key, {
      score: timestamp,
      value: timestamp.toString(),
    });

    const ttlSeconds = windowToSeconds(window, windowUnit) + 60 * 60;
    await redisClient.expire(key, ttlSeconds);

    logger.debug(
      { did, label, timestamp, window, windowUnit },
      "Tracked post label for account",
    );
  } catch (err) {
    logger.error(
      { err, did, label, timestamp, window, windowUnit },
      "Error tracking post label in Redis",
    );
    throw err;
  }
}

export async function getPostLabelCountInWindow(
  did: string,
  labels: string[],
  window: number,
  windowUnit: WindowUnit,
  currentTime: number,
): Promise<number> {
  try {
    const windowStartTime = currentTime - windowToMicroseconds(window, windowUnit);
    let totalCount = 0;

    for (const label of labels) {
      const key = getPostLabelTrackingKey(did, label, window, windowUnit);
      const count = await redisClient.zCount(key, windowStartTime, "+inf");
      totalCount += count;
    }

    logger.debug(
      { did, labels, window, windowUnit, totalCount },
      "Retrieved post label count in window",
    );

    return totalCount;
  } catch (err) {
    logger.error(
      { err, did, labels, window, windowUnit },
      "Error getting post label count from Redis",
    );
    throw err;
  }
}
