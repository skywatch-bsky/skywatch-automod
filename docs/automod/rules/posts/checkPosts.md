# `checkPosts.ts`

This module is the core of content moderation for posts. It is responsible for scanning the text of new posts (and links within them) for rule violations.

## Key Function

### `checkPosts(post: Post[]): Promise<void>`

This is the main function of the module, called from `main.ts` whenever a new post is created or when a link is found in a post's facets or embeds.

**Parameters:**

-   `post`: An array containing a single `Post` object to be checked. The function is designed to handle an array, but currently, it only ever processes the first element, `post[0]`.

**Logic:**

The function performs a series of checks and actions on the post content:

1.  **Global Allowlist**: It first checks if the post author's `did` is in the `GLOBAL_ALLOW` list. If so, it logs a warning and immediately returns, skipping all other checks.

2.  **Link Shortener Resolution**:
    -   It tests the post's text against the `LINK_SHORTENER` regex.
    -   If a shortened link is found, it attempts to resolve it to its final destination URL using `getFinalUrl`.
    -   If resolution is successful, it replaces the shortened URL in the `post[0].text` with the final URL. This is crucial for detecting malicious links hidden behind shorteners.
    -   If resolution fails, it logs an error but continues with the original, un-resolved URL.

3.  **Language Detection**: It calls `getLanguage` to determine the primary language of the post's text.

4.  **Iterate Through Post Checks**: It then loops through each rule defined in the `POST_CHECKS` configuration array. For each rule, it performs the following:
    -   **Language Filter**: If the rule specifies a `language`, it checks if the detected language of the post matches. If not, it skips to the next rule.
    -   **Ignored DIDs**: It checks if the author's `did` is in the rule's specific `ignoredDIDs` list. If so, it skips to the next rule.
    -   **Pattern Matching**: It tests the post's text against the rule's `check` regular expression.
    -   **Whitelist Check**: If the pattern matches, it then checks for a `whitelist` regular expression in the rule. If the `whitelist` pattern *also* matches, it assumes this is a false positive, logs a debug message, and skips to the next rule.

5.  **Apply Actions**: If the main pattern matches and no whitelists or filters cause it to be skipped, it proceeds to apply moderation actions:
    -   **Starter Pack Check**: It calls `countStarterPacks` as an additional heuristic, which may independently label the account for follow-farming.
    -   **Post Labeling (`toLabel`)**: If `true`, it calls `createPostLabel` to apply the specified `label` to the post itself. It can also include a `duration` for temporary labels.
    -   **Post Reporting (`reportPost`)**: If `true`, it calls `createPostReport` to report the specific post to moderators.
    -   **Account Reporting (`reportAcct`)**: If `true`, it calls `createAccountReport` to report the author's entire account.
    -   **Account Commenting (`commentAcct`)**: If `true`, it calls `createAccountComment` to add a comment to the author's moderation record.

    All moderation actions are dispatched with `void` to prevent the main loop from being blocked by these asynchronous API calls.

## Dependencies

-   **`../../../rules/constants.js`**: Provides `GLOBAL_ALLOW` and `LINK_SHORTENER` constants.
-   **`../../../rules/posts.js`**: Provides the `POST_CHECKS` array, which contains the configuration for each post moderation rule.
-   **`../../common/accountModeration.js`**: Provides functions for account-level moderation actions.
-   **`../../common/moderation.js`**: Provides functions for post-level moderation actions.
-   **`../../common/logger.js`**: For logging.
-   **`../../common/types.js`**: Provides the `Post` type definition.
-   **`../../utils/getFinalUrl.js`**: For resolving shortened URLs.
-   **`../../utils/getLanguage.js`**: For detecting the language of the post text.
-   **`../account/countStarterPacks.js`**: For the secondary check on starter pack counts.
