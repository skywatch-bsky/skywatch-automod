# `starterPackThreshold.ts`

This module is responsible for checking if an account has created too many starter packs within a specific time window. When a threshold is met, it can trigger various moderation actions on the account, such as applying a label, adding a comment, or reporting the account. This is useful for detecting follow-farming behaviour and coordinated campaign activity.

## Key Functions

### `checkStarterPackThreshold(did: string, starterPackUri: string, timestamp: number): Promise<void>`

This is the main function of the module. It's called whenever a starter pack is created, and it checks if the creator has exceeded the configured threshold.

**Parameters:**

-   `did`: The DID of the account that created the starter pack.
-   `starterPackUri`: The AT URI of the newly created starter pack.
-   `timestamp`: The timestamp of the creation event.

**Logic:**

1.  **Load Configurations**: It retrieves the cached `STARTER_PACK_THRESHOLD_CONFIGS`.
2.  **Check Allowlist**: For each configuration, it first checks if the account is in the `allowlist`. If so, the check is skipped for that configuration.
3.  **Track the Creation**: It records the new starter pack creation for the account in Redis using `trackStarterPackForAccount`. This function stores the URI with its timestamp in a sorted set.
4.  **Count Recent Creations**: It then uses `getStarterPackCountInWindow` to count how many starter packs the account has created within the defined rolling window (`window` + `windowUnit`).
5.  **Check Threshold**: If the `count` is greater than or equal to the `threshold` defined in the configuration, it proceeds to take action.
6.  **Format Comment**: A detailed comment is generated including the threshold count, window configuration, and the triggering starter pack URI.
7.  **Apply Moderation Actions**:
    -   It logs that the threshold has been met.
    -   It increments the `starterPackThresholdMetCounter` metric.
    -   Based on the booleans `toLabel` (defaults to true), `reportAcct`, and `commentAcct` in the configuration, it will:
        -   Apply a label to the account (`createAccountLabel`).
        -   Report the account (`createAccountReport`).
        -   Add a comment to the account's moderation record (`createAccountComment`).
    -   It also increments the `starterPackLabelsThresholdAppliedCounter` for each action taken.

### `loadStarterPackThresholdConfigs(): StarterPackThresholdConfig[]`

This function returns the cached `STARTER_PACK_THRESHOLD_CONFIGS`. The configurations are loaded and validated once at module initialization to avoid re-reading and re-validating the configuration file on every call.

## Supporting Functions

-   `validateAndLoadConfigs(): StarterPackThresholdConfig[]`: This function is called once when the module is loaded. It iterates through `STARTER_PACK_THRESHOLD_CONFIGS`, validates that each configuration has the required properties (`threshold > 0`, `window > 0`), and then returns the valid configurations.

## Dependencies

-   **`../../rules/starterPackThreshold.js`**: Contains the `STARTER_PACK_THRESHOLD_CONFIGS` array, which defines the rules for when to take action on an account.
-   **`./accountModeration.js`**: Provides the functions (`createAccountLabel`, `createAccountReport`, `createAccountComment`) to perform moderation actions on an account.
-   **`./logger.js`**: Used for logging information, warnings, and errors.
-   **`./metrics.js`**: Provides Prometheus counters for monitoring the behavior of this module.
-   **`./redis.js`**: Provides the functions (`trackStarterPackForAccount`, `getStarterPackCountInWindow`) for interacting with Redis to store and retrieve data about starter pack creations.
-   **`./types.js`**: Defines the `StarterPackThresholdConfig` type.
