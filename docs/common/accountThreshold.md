# `accountThreshold.ts`

This module is responsible for checking if an account has crossed a certain threshold of labeled posts within a specific time window. When a threshold is met, it can trigger various moderation actions on the account, such as applying a label, adding a comment, or reporting the account.

**Note:** There is a file with the same name at `src/automod/accountThreshold.ts`. This file appears to be a duplicate or an older version. The one in `src/common/` seems to be the one that is actually used.

## Key Functions

### `checkAccountThreshold(did: string, uri: string, postLabel: string, timestamp: number): Promise<void>`

This is the main function of the module. It's called whenever a post is labeled, and it checks if the author of the post has accumulated enough labels to trigger an account-level action.

**Parameters:**

-   `did`: The DID of the account to check.
-   `uri`: The AT URI of the post that was labeled (included in threshold comment for context).
-   `postLabel`: The label that was just applied to a post by this account.
-   `timestamp`: The timestamp of the post label event.

**Logic:**

1.  **Find Matching Configurations**: It filters the `ACCOUNT_THRESHOLD_CONFIGS` to find all configurations that are concerned with the `postLabel`.
2.  **Track the Label**: For each matching configuration, it records the new post label for the account in Redis using `trackPostLabelForAccount`. This function stores the label with its timestamp in a sorted set.
3.  **Count Recent Labels**: It then uses `getPostLabelCountInWindow` to count how many posts from that account have received any of the labels specified in the configuration within the defined rolling window (`window` + `windowUnit`).
4.  **Check Threshold**: If the `count` is greater than or equal to the `threshold` defined in the configuration, it proceeds to take action.
5.  **Format Comment**: A detailed comment is generated including the threshold count, window configuration, triggering post URI, and post label.
6.  **Apply Moderation Actions**:
    -   It logs that the threshold has been met.
    -   It increments the `accountThresholdMetCounter` metric.
    -   Based on the booleans `toLabel` (defaults to true), `reportAcct`, and `commentAcct` in the configuration, it will:
        -   Apply a label to the account (`createAccountLabel`).
        -   Report the account (`createAccountReport`).
        -   Add a comment to the account's moderation record (`createAccountComment`).
    -   It also increments the `accountLabelsThresholdAppliedCounter` for each action taken.

### `loadThresholdConfigs(): AccountThresholdConfig[]`

This function returns the cached `ACCOUNT_THRESHOLD_CONFIGS`. The configurations are loaded and validated once at module initialization to avoid re-reading and re-validating the configuration file on every call.

## Supporting Functions

-   `normalizeLabels(labels: string | string[]): string[]`: A helper function that ensures the `labels` property from a config is always an array, even if it's defined as a single string.
-   `validateAndLoadConfigs(): AccountThresholdConfig[]`: This function is called once when the module is loaded. It iterates through `ACCOUNT_THRESHOLD_CONFIGS`, validates that each configuration has the required properties (`labels`, `threshold > 0`, `window > 0`), and then returns the valid configurations.

## Dependencies

-   **`../../rules/accountThreshold.js`**: Contains the `ACCOUNT_THRESHOLD_CONFIGS` array, which defines the rules for when to take action on an account.
-   **`./accountModeration.js`**: Provides the functions (`createAccountLabel`, `createAccountReport`, `createAccountComment`) to perform moderation actions on an account.
-   **`./logger.js`**: Used for logging information, warnings, and errors.
-   **`./metrics.js`**: Provides Prometheus counters for monitoring the behavior of this module.
-   **`./redis.js`**: Provides the functions (`trackPostLabelForAccount`, `getPostLabelCountInWindow`) for interacting with Redis to store and retrieve data about post labels.
-   **`./types.js`**: Defines the `AccountThresholdConfig` type.
