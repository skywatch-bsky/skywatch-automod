# `facets.ts`

This module is responsible for detecting "facet spam" in posts. Facet spam occurs when a user includes multiple hidden mentions in a post by layering several mention facets at the exact same byte position in the text. This is a form of platform manipulation used to notify many users without their mentions being visible.

## Constants

-   **`FACET_SPAM_THRESHOLD`**: The number of unique mentions at a single position required to trigger the spam detection. Currently set to `1`, meaning more than one unique DID mentioned at the same spot is considered spam.
-   **`FACET_SPAM_LABEL`**: The moderation label to be applied to the account, which is `"platform-manipulation"`.
-   **`FACET_SPAM_COMMENT`**: The comment attached to the moderation label.
-   **`FACET_SPAM_ALLOWLIST`**: A list of DIDs that are exempt from this check. This is for accounts that may have a legitimate reason for using complex facet arrangements.

## Key Function

### `checkFacetSpam(did: string, time: number, atURI: string, facets: Facet[] | null): Promise<void>`

This is the main function of the module, called from `main.ts` whenever a new post is created that contains facets.

**Parameters:**

-   `did`: The DID of the post's author.
-   `time`: The timestamp of the post creation event.
-   `atURI`: The URI of the post being checked.
-   `facets`: An array of facet objects from the post record, or `null` if none exist.

**Logic:**

1.  **Allowlist Check**: It first checks if the author's `did` is in the `FACET_SPAM_ALLOWLIST`. If so, it logs a debug message and exits.
2.  **Facet Existence**: It returns if the `facets` array is null or empty.
3.  **Group Mentions by Position**:
    -   It initializes a `Map` where keys are byte positions (e.g., `"0:1"`) and values are a `Set` of DIDs mentioned at that position.
    -   It iterates through each `facet` in the post.
    -   It only considers facets that are mentions (`app.bsky.richtext.facet#mention`).
    -   For each mention, it constructs a key from its `byteStart` and `byteEnd` and adds the mentioned `did` to the `Set` for that key. Using a `Set` automatically handles cases where the *same* DID is mentioned multiple times at the same position (which is likely a client bug, not spam) and only stores unique DIDs.
4.  **Check for Spam**:
    -   It then iterates through the `positionMap`.
    -   For each position, it checks if the `size` of the `Set` of DIDs is greater than the `FACET_SPAM_THRESHOLD`.
    -   If it is, spam is detected.
5.  **Apply Label**:
    -   It logs that facet spam has been detected, including the position and the count of unique mentions.
    -   It calls `createAccountLabel` to apply the `FACET_SPAM_LABEL` to the author's account.
    -   It then `return`s immediately to ensure the account is only labeled once per post, even if spam is detected at multiple positions.

## Dependencies

-   **`../../../common/accountModeration.js`**: Provides the `createAccountLabel` function.
-   **`../../../common/logger.js`**: For logging.
-   **`../../../common/types.js`**: Provides the `Facet` type definition.
