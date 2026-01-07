# `age.ts`

This module is responsible for checking the age of an account when it interacts (replies to or quotes) with specific, monitored accounts or posts. It is designed to identify and label newly created accounts that might be involved in coordinated harassment or spam campaigns.

## `InteractionContext` Interface

This interface defines the shape of the context object passed to `checkAccountAge`. It includes details about the interaction, such as:

-   `actorDid`: The DID of the user performing the action (required).
-   `atURI`: The URI of the reply or quote post (required).
-   `time`: The timestamp of the interaction (required).
-   `replyToDid`, `replyToPostURI`: Details about the parent post if the interaction is a reply.
-   `quotedDid`, `quotedPostURI`: Details about the quoted post if the interaction is a quote post.

## Key Functions

### `checkAccountAge(context: InteractionContext): Promise<void>`

This is the main function of the module. It is triggered by the `main.ts` event handler whenever a new post is a reply or a quote post.

**Logic:**

1.  **Configuration Check**: It first checks if any `ACCOUNT_AGE_CHECKS` are defined in the rules. If not, it exits.
2.  **Global Allowlist**: It checks if the `actorDid` is in the `GLOBAL_ALLOW` list. If so, it logs and exits.
3.  **Iterate Through Checks**: It loops through each configuration object in the `ACCOUNT_AGE_CHECKS` array.
4.  **Match Interaction**: For each check, it determines if the current interaction matches the criteria of the check. A match occurs if:
    -   The post is a reply to a DID in `monitoredDIDs`.
    -   The post is a reply to a post URI in `monitoredPostURIs`.
    -   The post is a quote of a DID in `monitoredDIDs`.
    -   The post is a quote of a post URI in `monitoredPostURIs`.
    If there's no match, it moves to the next check.
5.  **Expiration Check**: If a check has an `expires` date, it verifies that the check has not expired.
6.  **Get Creation Date**: It calls `getAccountCreationDate` to find out when the `actorDid`'s account was created. If the date can't be determined, it skips the check.
7.  **Check Time Window**: It defines a "flagging window" based on the `anchorDate` and `maxAgeDays` from the configuration. It then checks if the account's `creationDate` falls within this window.
8.  **Apply Label**: If the account was created within the window, it proceeds to label the account:
    -   It first calls `checkAccountLabels` to ensure the same label hasn't already been applied, preventing duplicates.
    -   If no label exists, it calls `createAccountLabel` to apply the configured label and comment.
    -   After applying a label, it `return`s to ensure only one label is applied per interaction, even if it matches multiple checks.

### `getAccountCreationDate(did: string): Promise<Date | null>`

This function attempts to determine when a user's account was created.

**Logic:**

1.  **PLC Directory (Primary Method)**: If the DID is a `did:plc:`, it tries to fetch the audit log from the PLC directory (`plc.directory`). The `createdAt` timestamp of the first operation in the log is considered the creation date. This is the most reliable method.
2.  **Profile Fallback**: If the PLC lookup fails or the DID is not a `did:plc:`, it falls back to fetching the user's profile using `agent.getProfile`. It then attempts to use the `createdAt` date from the profile data.
3.  **Failure**: If both methods fail, it logs a warning and returns `null`.

### `calculateAccountAge(creationDate: Date, referenceDate: Date): number`

A simple utility function that calculates the difference in days between two dates. It is used internally for age calculation but is not directly used by the main `checkAccountAge` logic, which compares dates directly.

## Dependencies

-   **`../../../../rules/accountAge.js`**: Provides the `ACCOUNT_AGE_CHECKS` configuration array.
-   **`../../../../rules/constants.js`**: Provides the `GLOBAL_ALLOW` list of DIDs that should never be moderated.
-   **`../../../common/accountModeration.js`**: Provides `createAccountLabel` and `checkAccountLabels` for applying and verifying labels.
-   **`../../../common/agent.js`**: Provides the authenticated `agent` for making API calls.
-   **`../../../common/config.js`**: Provides the `PLC_URL`.
-   **`../../../common/logger.js`**: For logging.
