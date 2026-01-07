# `accountModeration.ts`

This module provides a suite of functions for performing moderation actions specifically targeted at user accounts (as opposed to individual posts). These actions include applying labels, adding private comments for moderators, reporting the account, and removing labels.

All functions in this module are asynchronous and ensure that the agent is logged in (`await isLoggedIn`) before proceeding. They also wrap their core API calls in the `limit` function to respect rate limits.

## Key Functions

### `createAccountLabel(did: string, label: string, comment: string)`

-   **Purpose**: Applies a moderation label to a user's account.
-   **De-duplication**: Before applying a label, it performs two checks to prevent duplicates:
    1.  `tryClaimAccountLabel(did, label)`: Atomically claims the label in Redis to prevent race conditions between multiple bot instances or threads.
    2.  `checkAccountLabels(did, label)`: Checks the Ozone API to see if the label has already been applied.
-   **Action**: If the label is not a duplicate, it calls `agent.tools.ozone.moderation.emitEvent` with a `modEventLabel` event, adding the `label` to the `createLabelVals` array.
-   **Metrics**: Increments `labelsAppliedCounter` on success or `labelsCachedCounter` if skipped.

### `createAccountComment(did: string, comment: string, atURI: string)`

-   **Purpose**: Adds a private comment to a user's moderation record. This is visible to other moderators but not to the user.
-   **De-duplication**: Uses `tryClaimAccountComment` in Redis to prevent duplicate comments for the same event.
-   **Action**: Calls `emitEvent` with a `modEventComment` event.

### `createAccountReport(did: string, comment: string)`

-   **Purpose**: Creates a formal report against a user's account.
-   **Action**: Calls `emitEvent` with a `modEventReport` event. The `reportType` is set to `com.atproto.moderation.defs#reasonOther`.

### `negateAccountLabel(did: string, label: string, comment: string)`

-   **Purpose**: Removes a previously applied label from an account. This is used when the criteria for a label are no longer met.
-   **Check**: It first calls `checkAccountLabels` to ensure the label actually exists on the account before attempting to remove it.
-   **Action**: Calls `emitEvent` with a `modEventLabel` event, but this time adds the `label` to the `negateLabelVals` array.
-   **Cache Invalidation**: After successfully negating the label, it calls `deleteAccountLabelClaim` to remove the claim from the Redis cache, allowing the label to be re-applied in the future if necessary.
-   **Metrics**: Increments `unlabelsRemovedCounter`.

### `checkAccountLabels(did: string, label: string): Promise<boolean>`

-   **Purpose**: Checks if a specific label already exists on an account.
-   **Action**: Calls `agent.tools.ozone.moderation.getRepo` to fetch the account's current moderation status and checks if the `labels` array contains the specified `label`.
-   **Returns**: `true` if the label exists, `false` otherwise.

### `getAllAccountLabels(did: string): Promise<string[]>`

-   **Purpose**: Retrieves all labels currently applied to an account.
-   **Action**: Calls `agent.tools.ozone.moderation.getRepo` and maps the response to return an array of label strings.
-   **Returns**: An array of strings, where each string is a label value. Returns an empty array on failure.
-   **Note**: Callers cannot distinguish between "account has no labels" and "API call failed" since both return an empty array.

## Dependencies

-   **`./redis.js`**: For de-duplication and caching logic (`tryClaim...`, `deleteAccountLabelClaim`).
-   **`./agent.js`**: Provides the authenticated `agent` for all API calls.
-   **`./config.js`**: Provides the `MOD_DID` for proxying requests.
-   **`./limits.js`**: Provides the `limit` function for rate limiting.
-   **`./logger.js`**: For logging.
-   **`./metrics.js`**: For incrementing Prometheus counters.
