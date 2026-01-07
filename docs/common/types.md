# `types.ts`

This module serves as a central repository for common TypeScript interfaces and type definitions used throughout the application. This helps ensure data consistency and provides type safety.

## Core Data Structures

-   **`Post`**: Represents a simplified post object, containing the essential fields needed for moderation checks.
    -   `did`, `time`, `rkey`, `atURI`, `text`, `cid`

-   **`Handle`**: Represents a user handle event.
    -   `did`, `time`, `handle`

-   **`Profile`**: Represents a user profile event.
    -   `did`, `time`, `displayName`, `description`

-   **`List`**: Represents a list object. (Note: This interface does not appear to be used in the current codebase).
    -   `label`, `rkey`

## Rule Configuration Interfaces

-   **`Checks`**: A comprehensive interface that defines the structure for a single moderation rule (used for posts, profiles, and handles).
    -   `check`: The primary `RegExp` used to test content.
    -   `whitelist`: An optional `RegExp` to prevent false positives.
    -   `label`: The moderation label to apply.
    -   `comment`: The text to include in the moderation action.
    -   `language`: An optional array of language codes to restrict the rule to.
    -   `ignoredDIDs`: An optional array of DIDs to exempt from the rule.
    -   `starterPacks`: An optional array of starter pack URIs to restrict the rule to members of those packs.
    -   `knownVectors`: An optional array of known vector strings for tracking purposes.
    -   Action booleans: `toLabel`, `reportPost`, `reportAcct`, `commentAcct`, `unlabel`, `trackOnly`.
    -   `duration`: An optional duration in hours for temporary labels.
    -   `description`, `displayName`: Booleans to specify which parts of a profile to check.

-   **`AccountAgeCheck`**: Defines the structure for a rule in the `accountAge.ts` module.
    -   `monitoredDIDs`, `monitoredPostURIs`: The targets of the monitoring.
    -   `anchorDate`, `maxAgeDays`: The time window for checking the account's creation date.
    -   `label`, `comment`: The action to take if the check passes.
    -   `expires`: An optional date after which the rule is no longer active.

-   **`WindowUnit`**: A type alias representing the unit for rolling time windows. Valid values are `"minutes"`, `"hours"`, or `"days"`.

-   **`AccountThresholdConfig`**: Defines the structure for a rule in the `accountThreshold.ts` module.
    -   `labels`: The post label(s) that contribute to the threshold (can be a single string or array for OR matching).
    -   `threshold`: The number of labels required to trigger the action.
    -   `window`: The rolling window duration (number).
    -   `windowUnit`: The unit for the rolling window (`WindowUnit`).
    -   `accountLabel`, `accountComment`: The label and comment for the resulting account action.
    -   Action booleans: `reportAcct`, `commentAcct`, `toLabel` (optional, defaults to true).

-   **`StarterPackThresholdConfig`**: Defines the structure for a rule in the `starterPackThreshold.ts` module.
    -   `threshold`: The number of starter packs required to trigger the action.
    -   `window`: The rolling window duration (number).
    -   `windowUnit`: The unit for the rolling window (`WindowUnit`).
    -   `accountLabel`, `accountComment`: The label and comment for the resulting account action.
    -   `toLabel`: Optional boolean to apply label (defaults to true).
    -   `reportAcct`: Optional boolean to report the account.
    -   `commentAcct`: Optional boolean to comment on the account.
    -   `allowlist`: Optional array of DIDs to exempt from this check.

## Re-exported Lexicon Types

-   For convenience, several facet-related types are re-exported directly from the `@atproto/ozone` library's generated lexicons. This avoids the need for other modules to have complex import paths.
    -   `Facet`
    -   `FacetIndex`
    -   `FacetMention`
    -   `LinkFeature`
    -   `FacetTag`
