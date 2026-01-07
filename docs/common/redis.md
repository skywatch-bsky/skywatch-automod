# `redis.ts`

This module manages the application's connection to Redis and provides functions for caching and tracking moderation-related data. It plays a crucial role in preventing duplicate moderation actions and in implementing time-windowed rules (like account thresholds).

**Note:** There is a file with the same name at `src/automod/redis.ts`. This file appears to be a duplicate or an older version. The one in `src/common/` seems to be the one that is actually used.

## Redis Client Setup

-   A single `redisClient` is created using the `REDIS_URL` from the configuration.
-   Event listeners are attached to the client to log connection status (`connect`, `ready`), errors (`error`), and reconnections (`reconnecting`).

## Connection Management

### `connectRedis(): Promise<void>`

-   Asynchronously connects the `redisClient` to the Redis server.
-   Called once at application startup in `main.ts`.

### `disconnectRedis(): Promise<void>`

-   Gracefully quits the Redis connection.
-   Called during the application's shutdown sequence in `main.ts`.

## Caching and Claiming Functions

These functions are used to ensure that a specific moderation action (like labeling a post or commenting on an account) is only performed once. They work by setting a key in Redis with an `NX` (Not Exists) flag, which is an atomic operation.

### `tryClaimPostLabel(atURI: string, label: string): Promise<boolean>`

-   **Purpose**: To prevent applying the same label to the same post multiple times.
-   **Key**: `post-label:<atURI>:<label>`
-   **Logic**: Attempts to set the key. If successful (the key didn't already exist), it returns `true`. Otherwise, it returns `false`.
-   **TTL**: The key is set to expire in 7 days.
-   **Error Handling**: If the Redis command fails, it logs a warning and returns `true` to "fail open," allowing the moderation action to proceed.

### `tryClaimAccountLabel(did: string, label: string): Promise<boolean>`

-   **Purpose**: To prevent applying the same label to the same account multiple times.
-   **Key**: `account-label:<did>:<label>`
-   **Logic**: Same as `tryClaimPostLabel`.
-   **TTL**: 7 days.

### `tryClaimAccountComment(did: string, atURI: string): Promise<boolean>`

-   **Purpose**: To prevent adding the same comment to an account's moderation record multiple times.
-   **Key**: `account-comment:<did>:<atURI>`
-   **Logic**: Same as the label claiming functions.
-   **TTL**: 7 days.

### `deleteAccountLabelClaim(did: string, label: string): Promise<void>`

-   **Purpose**: To explicitly remove an account label claim from the cache. This is used when a label is negated (removed) from an account, allowing it to be potentially re-applied later.
-   **Key**: `account-label:<did>:<label>`
-   **Logic**: Deletes the specified key from Redis.

## Time Window Helpers

Internal helper functions for converting window configurations to Redis-compatible values:

### `windowToMicroseconds(window: number, unit: WindowUnit): number`

-   **Purpose**: Converts a window duration and unit into microseconds for sorted set scoring.
-   **Units**: `minutes`, `hours`, `days`

### `windowToSeconds(window: number, unit: WindowUnit): number`

-   **Purpose**: Converts a window duration and unit into seconds for TTL calculations.

## Account Threshold Tracking

These functions provide the mechanism for the `accountThreshold.ts` module to count how many times an account has had its posts labeled within a rolling time window.

### `trackPostLabelForAccount(did: string, label: string, timestamp: number, window: number, windowUnit: WindowUnit): Promise<void>`

-   **Purpose**: To record that a post by a specific user received a certain label at a specific time.
-   **Key**: `account-post-labels:<did>:<label>:<window><windowUnit>` (e.g., `account-post-labels:did:plc:xyz:spam:7days`)
-   **Logic**:
    1.  It uses a Redis Sorted Set (`ZADD`).
    2.  The `score` of each member in the set is the `timestamp` of the labeling event (in microseconds).
    3.  The `value` is also the timestamp (it just needs to be unique).
    4.  Before adding the new entry, it removes any old entries that are outside the rolling window period (`ZREMRANGEBYSCORE`).
    5.  It sets a TTL on the key (window duration + 1 hour buffer) to ensure it eventually expires if the user stops receiving labels.

### `getPostLabelCountInWindow(did: string, labels: string[], window: number, windowUnit: WindowUnit, currentTime: number): Promise<number>`

-   **Purpose**: To count how many labels (matching the `labels` array) an account has received within the rolling window.
-   **Logic**:
    1.  It iterates through the provided `labels`.
    2.  For each label, it constructs the appropriate key.
    3.  It uses `ZCOUNT` on the sorted set to count the number of entries whose score (timestamp) is within the desired window.
    4.  It sums the counts for all labels and returns the total.

## Starter Pack Threshold Tracking

These functions provide the mechanism for the `starterPackThreshold.ts` module to count how many starter packs an account has created within a rolling time window.

### `trackStarterPackForAccount(did: string, starterPackUri: string, timestamp: number, window: number, windowUnit: WindowUnit): Promise<void>`

-   **Purpose**: To record that a user created a starter pack at a specific time.
-   **Key**: `starterpack:threshold:<did>:<window><windowUnit>` (e.g., `starterpack:threshold:did:plc:xyz:7days`)
-   **Logic**:
    1.  It uses a Redis Sorted Set (`ZADD`).
    2.  The `score` of each member in the set is the `timestamp` of the creation event (in microseconds).
    3.  The `value` is the starter pack URI (unique per creation).
    4.  Before adding the new entry, it removes any old entries that are outside the rolling window period (`ZREMRANGEBYSCORE`).
    5.  It sets a TTL on the key (window duration + 1 hour buffer) to ensure it eventually expires.

### `getStarterPackCountInWindow(did: string, window: number, windowUnit: WindowUnit, currentTime: number): Promise<number>`

-   **Purpose**: To count how many starter packs an account has created within the rolling window.
-   **Logic**:
    1.  It constructs the key for the account's starter pack tracking set.
    2.  It uses `ZCOUNT` on the sorted set to count the number of entries whose score (timestamp) is within the desired window.
    3.  Returns the count.
