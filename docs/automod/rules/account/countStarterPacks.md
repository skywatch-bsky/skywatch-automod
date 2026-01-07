# `countStarterPacks.ts`

This module is responsible for checking if an account is associated with an excessive number of "starter packs." This is often an indicator of "follow farming" or other platform manipulation behaviors.

## `ALLOWED_DIDS`

A hardcoded array of DIDs that are exempt from this check. These are typically trusted accounts or accounts known to legitimately manage many starter packs.

## Key Function

### `countStarterPacks(did: string, time: number): Promise<void>`

This is the main function of the module. It is called from other rule modules (e.g., `checkPosts`) as an additional check when a post matches certain criteria.

**Parameters:**

-   `did`: The DID of the account to check.
-   `time`: The timestamp of the event that triggered the check.

**Logic:**

1.  **Authentication Check**: It ensures the agent is logged in by awaiting `isLoggedIn`.
2.  **Whitelist Check**: It checks if the `did` is in the `ALLOWED_DIDS` array. If it is, the function logs a debug message and returns immediately.
3.  **Rate Limiting**: The core logic is wrapped in the `limit` function to respect API rate limits.
4.  **Fetch Profile**: It fetches the user's profile using `agent.app.bsky.actor.getProfile`.
5.  **Check Starter Pack Count**:
    -   It accesses the `starterPacks` count from the `profile.data.associated` field.
    -   If the count exists and is greater than 20, it proceeds to label the account.
6.  **Apply Label**:
    -   It logs that it is labeling the account for excessive starter packs.
    -   It calls `createAccountLabel` with the `follow-farming` label and a comment indicating the number of starter packs found.
7.  **Error Handling**: If fetching the profile fails, it logs a detailed error message.

## Dependencies

-   **`../../../common/accountModeration.js`**: Provides the `createAccountLabel` function to apply moderation labels to accounts.
-   **`../../../common/agent.js`**: Provides the authenticated `agent` for making API calls and the `isLoggedIn` promise.
-   **`../../../common/limits.js`**: Provides the `limit` function to manage rate limiting for API calls.
-   **`../../../common/logger.js`**: For logging information, debug messages, and errors.
