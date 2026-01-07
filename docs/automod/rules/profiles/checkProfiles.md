# `checkProfiles.ts`

This module is responsible for scanning user profiles—specifically their display names and descriptions—for content that violates moderation rules. It is triggered whenever a user's profile is created or updated.

## `ProfileChecker` Class

This class encapsulates the logic for checking a piece of profile content (display name or description) against a single rule.

-   **`constructor(check: Checks, did: string, time: number)`**: Initializes the checker with the rule (`check`), the user's `did`, and the event `time`.
-   **`checkDescription(description: string)`**: A public method to run the check against the profile description.
-   **`checkDisplayName(displayName: string)`**: A public method to run the check against the display name.
-   **`checkBoth(displayName: string, description: string)`**: A public method that concatenates the display name and description and runs the check against the combined string.
-   **`performActions(...)`**: A private method that:
    1.  Tests the content against the rule's `check` regex.
    2.  If it matches, it checks against the `whitelist` regex to prevent false positives.
    3.  If it's a confirmed match, it calls `applyActions`.
    4.  If it does *not* match, it checks the `unlabel` flag and calls `removeLabel` if necessary.
-   **`applyActions(...)`**: A private method that applies the moderation actions (`createAccountLabel`, `createAccountReport`, `createAccountComment`) as specified by the boolean flags in the rule.
-   **`removeLabel(...)`**: A private method that calls `negateAccountLabel` to remove a previously applied label if the content no longer matches the rule's criteria.

## Key Functions

### `checkProfile(did: string, time: number, displayName: string, description: string)`

This is the main, consolidated function called from `main.ts` when a profile is created or updated. It orchestrates the checking process.

**Logic:**

1.  **Global Allowlist**: Checks if the `did` is in the `GLOBAL_ALLOW` list and returns if it is.
2.  **Language Detection**: It concatenates the display name and description and detects the language of the combined text.
3.  **Iterate Through Checks**: It loops through each rule in the `PROFILE_CHECKS` configuration array.
4.  **Filtering**: For each rule, it applies filters:
    -   **Language**: If the rule has a `language` filter, it skips the rule if the detected language doesn't match.
    -   **Ignored DIDs**: If the `did` is in the rule's `ignoredDIDs` list, it skips the rule.
5.  **Dispatch to `ProfileChecker`**:
    -   It creates a new `ProfileChecker` instance for the current rule.
    -   Based on the `description` and `displayName` boolean flags in the rule, it calls the appropriate method on the checker (`checkBoth`, `checkDescription`, or `checkDisplayName`).

### `checkDescription(...)` and `checkDisplayName(...)`

These are older, more specific functions that are still exported but are effectively superseded by the consolidated `checkProfile` function. They follow a similar logic but only operate on either the description or display name, respectively, and only for rules where the corresponding flag (`description: true` or `displayName: true`) is set.

## Dependencies

-   **`../../../../rules/constants.js`**: Provides the `GLOBAL_ALLOW` list.
-   **`../../../../rules/profiles.js`**: Provides the `PROFILE_CHECKS` array, which contains the configuration for each profile moderation rule.
-   **`../../../common/accountModeration.js`**: Provides functions for all account-level moderation actions (`createAccountLabel`, `createAccountReport`, `createAccountComment`, `negateAccountLabel`).
-   **`../../../common/logger.js`**: For logging.
-   **`../../../common/types.js`**: Provides the `Checks` type definition.
-   **`../../utils/getLanguage.js`**: For detecting the language of the profile text.
