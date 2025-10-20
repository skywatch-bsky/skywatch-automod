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
