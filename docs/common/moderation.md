# `moderation.ts`

This module provides functions for performing moderation actions on individual posts (records). It is the counterpart to `accountModeration.ts`, which handles account-level actions.

All functions in this module ensure the agent is logged in (`await isLoggedIn`) and wrap their API calls in the `limit` function to manage concurrency and rate limiting.

## Key Functions

### `createPostLabel(uri: string, cid: string, label: string, comment: string, duration: number | undefined, did?: string, time?: number)`

-   **Purpose**: Applies a moderation label to a specific post.
-   **Parameters**:
    -   `uri`, `cid`: The strong reference to the post.
    -   `label`: The label value to apply (e.g., "spam").
    -   `comment`: The private moderation comment.
    -   `duration`: An optional duration in hours for temporary labels.
    -   `did`, `time`: Optional author DID and event time, passed through to trigger an account threshold check.
-   **De-duplication**:
    1.  `tryClaimPostLabel(uri, label)`: Atomically claims the label for the post in Redis to prevent race conditions.
    2.  `checkRecordLabels(uri, label)`: Checks the Ozone API to see if the label already exists on the post.
-   **Action**: If the label is not a duplicate, it calls `agent.tools.ozone.moderation.emitEvent` with a `modEventLabel` event.
-   **Threshold Check**: After successfully applying a label, if the author's `did` and the event `time` were provided, it **dynamically imports and calls `checkAccountThreshold`**. This is a crucial step that connects post-level moderation to account-level moderation, escalating actions against repeat offenders. The dynamic import is used to break a circular dependency between the `moderation` and `accountThreshold` modules.
-   **Metrics**: Increments `labelsAppliedCounter` on success or `labelsCachedCounter` if skipped.

### `createPostReport(uri: string, cid: string, comment: string)`

-   **Purpose**: Creates a formal report against a specific post.
-   **Action**: Calls `emitEvent` with a `modEventReport` event. The `reportType` is hardcoded to `com.atproto.moderation.defs#reasonOther`.

### `checkRecordLabels(uri: string, label: string): Promise<boolean>`

-   **Purpose**: Checks if a specific label already exists on a post.
-   **Action**: Calls `agent.tools.ozone.moderation.getRecord` to fetch the post's current moderation status.
-   **Returns**: `true` if the label exists, `false` otherwise. It relies on the helper `doesLabelExist` to parse the response.

## Helper Functions

### `doesLabelExist(labels: { val: string }[] | undefined, labelVal: string): boolean`

-   A simple, private utility function that safely checks if a `labels` array from an API response contains a specific `labelVal`.

## Dependencies

-   **`../automod/redis.js`**: Provides `tryClaimPostLabel` for de-duplication.
-   **`./agent.js`**: Provides the authenticated `agent` for all API calls.
-   **`./config.js`**: Provides the `MOD_DID` for proxying requests.
-   **`./limits.js`**: Provides the `limit` function for rate limiting.
-   **`./logger.js`**: For logging.
-   **`./metrics.js`**: For incrementing Prometheus counters.
-   **`../automod/accountThreshold.js`**: Dynamically imported to trigger account threshold checks.
