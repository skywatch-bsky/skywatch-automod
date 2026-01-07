# `checkHandles.ts`

This module is responsible for scanning user handles (e.g., `username.bsky.social`) for patterns that violate moderation rules. It is triggered whenever a user's handle is created or updated.

## Key Function

### `checkHandle(did: string, handle: string, time: number): void`

This is the main function of the module. It is called from the `main.ts` event handler for `identity` events from the firehose.

**Parameters:**

-   `did`: The DID of the user whose handle is being checked.
-   `handle`: The user handle string.
-   `time`: The timestamp of the identity event.

**Logic:**

The function iterates through a series of checks defined in the `HANDLE_CHECKS` configuration array. For each check, it performs the following steps:

1.  **Global Allowlist**: It first checks if the user's `did` is in the `GLOBAL_ALLOW` list. If so, it logs a warning and stops all further checks for this handle.

2.  **Per-Rule Ignored DIDs**: It checks if the `did` is in the specific `ignoredDIDs` list for the current rule. If so, it skips to the next rule.

3.  **Pattern Matching**: It uses the `check` regular expression from the rule to test against the `handle`.

4.  **Whitelist Check**: If the pattern matches, it then checks for a `whitelist` regular expression in the rule. If the `whitelist` pattern *also* matches, it assumes this is a false positive, logs a debug message, and stops processing this rule.

5.  **Apply Actions**: If the main pattern matches and the whitelist pattern does not, it proceeds to apply moderation actions based on the boolean flags in the rule configuration:
    -   `toLabel`: If `true`, it calls `createAccountLabel` to apply the specified `label` to the user's account.
    -   `reportAcct`: If `true`, it calls `createAccountReport` to report the account to moderators.
    -   `commentAcct`: If `true`, it calls `createAccountComment` to add a comment to the user's moderation record.

    Each action is called with a `formattedComment` that includes the timestamp, the rule's `comment`, and the handle that was flagged. The actions are dispatched with `void` to prevent the main loop from being blocked by these asynchronous operations.

## Dependencies

-   **`../../../../rules/constants.js`**: Provides the `GLOBAL_ALLOW` list of DIDs that are exempt from all checks.
-   **`../../../../rules/handles.js`**: Provides the `HANDLE_CHECKS` array, which contains the configuration for each handle moderation rule (regex patterns, labels, actions to take, etc.).
-   **`../../../common/accountModeration.js`**: Provides the functions (`createAccountLabel`, `createAccountReport`, `createAccountComment`) for performing moderation actions.
-   **`../../../common/logger.js`**: For logging.
