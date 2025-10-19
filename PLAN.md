# Plan: Redis-Based Post Label Tracking for Account Labeling

## Overview
Implement a system to track labeled posts in Redis and automatically label accounts when they accumulate a threshold number of posts with specific labels.

## Architecture

### Data Structure
**Redis Key Pattern:** `post-labels:{did}:{label}`
- **Value Type:** Sorted Set (ZADD)
- **Score:** Timestamp (for chronological ordering)
- **Member:** atURI of the labeled post
- **Expiration:** A sliding 30-day TTL will be set on the key with each write to ensure data from inactive users is automatically purged.

**Example:**
```
post-labels:did:plc:abc123:spam -> {
  "at://did:plc:abc123/app.bsky.feed.post/xyz1": 1729234567000,
  "at://did:plc:abc123/app.bsky.feed.post/xyz2": 1729234568000,
  ...
}
```

**Why Sorted Sets?**
- Prevents duplicate atURI entries
- Allows time-based expiry of members within the set (e.g., posts older than `windowDays`)
- Enables efficient counting with ZCARD
- Supports range queries if needed later

### Configuration
Trackable labels will be defined in an external `tracked-labels.json` file, which will be loaded and validated at startup.

**`tracked-labels.json` structure:**
```json
[
  {
    "label": "spam",
    "threshold": 5,
    "accountLabel": "repeat-spammer",
    "accountComment": "Account has posted spam content multiple times.",
    "windowDays": 30,
    "reportAcct": true,
    "commentAcct": false
  }
]
```

**`TrackedLabelConfig` interface in `src/types.ts`:**
```typescript
interface TrackedLabelConfig {
  label: string;
  threshold: number;
  accountLabel: string;
  accountComment: string;
  windowDays?: number;
  reportAcct?: boolean;
  commentAcct?: boolean;
}
```

## Implementation Steps

### Step 1: Redis Client Setup
**Files to create/modify:**
- `src/redis.ts` (new)
- `src/config.ts` (add Redis URL)
- `package.json` (add `ioredis` dependency)

**Tasks:**
1. Install `ioredis`: `npm install ioredis`
2. Install types: `npm install -D @types/ioredis`
3. Create Redis client with connection handling and graceful error/reconnection logic.
4. Create a centralized helper function `addPostAndCheckThreshold` to encapsulate Redis logic (ZADD, ZREMRANGEBYSCORE, ZCARD, EXPIRE).
5. Export the client and helper functions.

**Testing:**
- Unit tests for Redis client initialization and error handling.
- Test graceful degradation (continue without Redis if connection fails).
- Unit tests for `addPostAndCheckThreshold` helper.

**Code structure:**
```typescript
// src/redis.ts
import Redis from "ioredis";
import { logger } from "./logger.js";
import { REDIS_URL } from "./config.js";
import { TrackedLabelConfig } from "./types.js";

export const redis = new Redis(REDIS_URL, { /* ... options ... */ });

export async function addPostAndCheckThreshold(
  did: string, atURI: string, config: TrackedLabelConfig
): Promise<number> {
  const key = `post-labels:${did}:${config.label}`;
  const now = Date.now();
  const pipeline = redis.pipeline();

  // Add the new post
  pipeline.zadd(key, now, atURI);

  // If a window is specified, remove posts older than the window
  if (config.windowDays) {
    const cutoffTime = now - (config.windowDays * 24 * 60 * 60 * 1000);
    pipeline.zremrangebyscore(key, '-inf', cutoffTime);
  }

  // Set a sliding TTL on the key itself for cleanup
  pipeline.expire(key, 30 * 24 * 60 * 60); // 30 days

  // Get the current count
  pipeline.zcard(key);

  const [, , , [, count]] = await pipeline.exec();
  return count as number;
}
```

---

### Step 2: Tracked Labels Configuration
**Files to create/modify:**
- `tracked-labels.json` (new)
- `tracked-labels.example.json` (new)
- `src/config.ts` (modify)
- `src/types.ts` (modify)

**Tasks:**
1. Define `TrackedLabelConfig` interface in `src/types.ts`.
2. Create `tracked-labels.example.json` with innocuous examples.
3. Create `tracked-labels.json` for production configuration.
4. In `src/config.ts`, add logic to load, validate, and export `tracked-labels.json` on startup. The app should fail to start if validation fails.

**Testing:**
- Unit tests for configuration loading and validation.
- Test edge cases (0, negative thresholds) and missing required fields.

---

### Step 3: Post Label Tracking Logic
**Files to create/modify:**
- `src/rules/posts/trackPostLabel.ts` (new)
- `src/rules/posts/tests/trackPostLabel.test.ts` (new)

**Tasks:**
1. Implement `trackPostLabel(did, atURI, label)` function.
2. It will find the relevant config for the `label`.
3. Call the `addPostAndCheckThreshold` helper from `src/redis.ts`.
4. If the returned count meets the threshold, call `triggerAccountLabel`.
5. Handle Redis errors gracefully (log but don't crash).

**Testing:**
- Mock the `redis.ts` helper and `triggerAccountLabel`.
- Test that the correct config is found.
- Test threshold triggering (exactly at threshold, above threshold).
- Test below threshold (no account label trigger).
- Test that Redis errors are caught and logged.

**Code structure:**
```typescript
// src/rules/posts/trackPostLabel.ts
import { addPostAndCheckThreshold } from '../../redis.js';
import { TRACKED_LABELS } from '../../config.js';

export async function trackPostLabel(
  did: string,
  atURI: string,
  label: string,
): Promise<void> {
  const config = TRACKED_LABELS.find(c => c.label === label);
  if (!config) return; // Label not tracked

  try {
    const count = await addPostAndCheckThreshold(did, atURI, config);

    if (count >= config.threshold) {
      await triggerAccountLabel(did, config, count);
    }
  } catch (error) {
    // Log and continue
  }
}
```

---

### Step 4: Account Labeling Trigger
**Files to create/modify:**
- `src/rules/posts/triggerAccountLabel.ts` (new)
- `src/rules/posts/tests/triggerAccountLabel.test.ts` (new)

**Tasks:**
1. Implement `triggerAccountLabel(did, config, count)` function.
2. Check if account already has the target label to prevent duplicates.
3. If not, return an "action object" describing the label, report, and comment actions required.
4. The comment should use the current (label application) time.

**Testing:**
- Test that an action object is returned when the account is not already labeled.
- Test that `null` or an empty object is returned if the account is already labeled.
- Test that the `reportAcct` and `commentAcct` flags are correctly reflected in the returned object.

**Code structure:**
```typescript
// src/rules/posts/triggerAccountLabel.ts
export async function triggerAccountLabel(
  did: string,
  config: TrackedLabelConfig,
  count: number,
): Promise<ModerationAction | null> {
  // 1. Check existing labels on the account
  const existingLabels = await checkAccountLabels(did);
  if (existingLabels.includes(config.accountLabel)) {
    logger.debug({ did, label: config.accountLabel }, "Account already labeled");
    return null;
  }

  // 2. Return action object for the agent to execute
  const now = new Date().toISOString();
  const comment = `${now}: ${config.accountComment} (based on ${count} posts).`;

  return {
    action: 'label',
    subject: did,
    label: config.accountLabel,
    comment: comment,
    report: config.reportAcct,
    // ... other action fields
  };
}
```

---

### Step 5: Integration with checkPosts
**Files to modify:**
- `src/rules/posts/checkPosts.ts`
- `src/rules/posts/tests/checkPosts.test.ts`

**Tasks:**
1. Import `trackPostLabel` function.
2. After a post is labeled, asynchronously call `trackPostLabel`.
3. Ensure this call is non-blocking (`await` is not required if we don't need its result immediately).
4. Handle any action objects returned from the tracking logic and add them to the moderation results.

**Testing:**
- Update existing tests to mock `trackPostLabel`.
- Test that `trackPostLabel` is called when a post is labeled.
- Test that any returned moderation actions are correctly processed.

---

### Step 6: Configuration and Environment
**Files to modify:**
- `src/config.ts`
- `.env.example`
- `README.md` (documentation)

**Tasks:**
1. Add `REDIS_URL` to config with default `redis://localhost:6379`.
2. Update `.env.example` with Redis configuration.
3. Document the feature, Redis setup, and new `tracked-labels.json` file in `README.md`.

**Testing:**
- Test with missing Redis URL (should use default).
- Test with custom Redis URL from env.

---

### Step 7: Monitoring and Observability
**Files to create/modify:**
- `src/metrics.ts` (add Redis metrics)

**Tasks:**
1. Add Redis connection status to metrics endpoint.
2. Track number of posts tracked.
3. Track number of account-labeling triggers.
4. Track Redis operation errors.

**Testing:**
- Test that the metrics endpoint includes Redis stats.
- Test that counters increment correctly.

---

### Step 8: Integration Tests
**Files to create:**
- `src/rules/posts/tests/integration/postLabelTracking.integration.test.ts`

**Tasks:**
1. Create end-to-end tests using `testcontainers` to spin up a real Redis instance.
2. Test the full flow: post labeled → tracked → threshold → account labeled.
3. Test window expiry and key TTL.

**Testing approach:**
- **Strongly recommend `testcontainers`** for a real Redis instance to ensure tests are accurate.
- Test happy path: 5 spam posts → account labeled.
- Test edge cases: exactly at threshold, threshold + 1.
- Test cleanup: old posts expire from window, and keys expire after TTL.

---

## Error Handling Strategy
1.  **Redis Connection Failure:** Log error, continue processing posts normally, and attempt reconnection with exponential backoff. The app should not crash.
2.  **Redis Operation Failure:** Log error with context (did, label, operation). Do not retry automatically. Continue processing other posts.
3.  **Configuration Errors:** Validate `tracked-labels.json` on startup. Log detailed errors and exit the process if the configuration is invalid.

## Open Questions
1. Should we support time-based windows (last 30 days) or absolute counts?
   - **Decision:** Support both. Absolute count is the default, and `windowDays` is an optional override.
2. Should thresholds be per-label or support combinations (3 spam + 2 scam)?
   - **Decision:** Start with per-label for simplicity. Combinations can be added later if needed.
3. Should we deduplicate account labels or allow relabeling?
   - **Decision:** Deduplicate by checking for existing labels before applying a new one.
4. How to handle Redis downtime?
   - **Decision:** Log errors and continue processing without tracking. The system will automatically resume tracking upon reconnection.

## Next Steps
Once plan is approved:
1. Implement steps sequentially with tests.
2. Deploy to staging environment.
3. Monitor performance and accuracy.
4. Iterate on thresholds based on data.
