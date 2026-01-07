# Developing Moderation Checks

This guide explains how to configure moderation rules for skywatch-automod.

## Overview

Moderation checks are defined in TypeScript files in the `rules/` directory. Each check uses regular expressions to match content and specifies what action to take when a match is found.

## Check Types

### Post Content Checks

File: `rules/posts.ts`

Monitors post text and embedded URLs for matches.

```typescript
import type { Checks } from "../src/types.js";

export const POST_CHECKS: Checks[] = [
  {
    label: "spam",
    comment: "Spam content detected in post",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("buy.*followers", "i"),
  },
];
```

### Handle Checks

File: `rules/handles.ts`

Monitors user handles for pattern matches.

```typescript
export const HANDLE_CHECKS: Checks[] = [
  {
    label: "impersonation",
    comment: "Potential impersonation detected",
    reportAcct: true,
    commentAcct: false,
    toLabel: false,
    check: new RegExp("official.*support", "i"),
  },
];
```

### Profile Checks

File: `rules/profiles.ts`

Monitors profile display names and descriptions.

```typescript
export const PROFILE_CHECKS: Checks[] = [
  {
    label: "spam-profile",
    comment: "Spam content in profile",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    displayName: true,  // Check display name
    description: true,  // Check description
    check: new RegExp("follow.*back", "i"),
  },
];
```

### Account Age Checks

File: `rules/accountAge.ts`

Labels accounts created after a specific date when they interact with monitored content.

```typescript
import type { AccountAgeCheck } from "../src/types.js";

export const ACCOUNT_AGE_CHECKS: AccountAgeCheck[] = [
  {
    monitoredDIDs: ["did:plc:abc123"],
    anchorDate: "2025-01-15",
    maxAgeDays: 7,
    label: "new-account-spam",
    comment: "New account replying to monitored user",
    expires: "2025-02-15",  // Optional expiration
  },
];
```

### Account Threshold Checks

File: `rules/accountThreshold.ts`

Applies account-level labels when an account accumulates multiple post-level violations within a time window.

```typescript
import type { AccountThresholdConfig } from "../src/types.js";

export const ACCOUNT_THRESHOLD_CONFIGS: AccountThresholdConfig[] = [
  {
    labels: ["spam", "scam"],  // Trigger on either label
    threshold: 3,
    accountLabel: "repeat-offender",
    accountComment: "Account exceeded spam threshold",
    window: 7,
    windowUnit: "days",  // Options: "minutes", "hours", "days"
    reportAcct: true,
    commentAcct: false,
    toLabel: true,
  },
];
```

### Starter Pack Threshold Checks

File: `rules/starterPackThreshold.ts`

Applies account-level labels when an account creates too many starter packs within a time window. Useful for detecting follow-farming and coordinated campaign behaviour.

```typescript
import type { StarterPackThresholdConfig } from "../src/types.js";

export const STARTER_PACK_THRESHOLD_CONFIGS: StarterPackThresholdConfig[] = [
  {
    threshold: 10,           // Account action triggered after 10 starter packs
    window: 7,               // Within this duration
    windowUnit: "days",      // Options: "minutes", "hours", "days"
    accountLabel: "follow-farming",
    accountComment: "Account created multiple starter packs in short period",
    toLabel: true,           // Whether to apply the label (default: true)
    reportAcct: true,        // Whether to report the account
    commentAcct: false,      // Whether to comment on the account
    allowlist: [],           // DIDs to exempt from this check
  },
];
```

## Check Configuration Fields

### Basic Fields (Required)

- `label` - Label to apply (string)
- `comment` - Comment for the moderation action (string)
- `reportAcct` - Create account report (boolean)
- `commentAcct` - Add comment to account (boolean)
- `toLabel` - Apply the label (boolean)
- `check` - Regular expression pattern (RegExp)

### Optional Fields

- `language` - Language codes to restrict check to (string[])
- `description` - Check profile descriptions (boolean)
- `displayName` - Check profile display names (boolean)
- `reportPost` - Create post report instead of just labeling (boolean)
- `duration` - Label duration in hours (number)
- `whitelist` - RegExp to exclude from matching (RegExp)
- `ignoredDIDs` - DIDs to skip checking (string[])
- `starterPacks` - Filter by starter pack membership (string[])
- `knownVectors` - Known attack vectors for tracking (string[])
- `trackOnly` - Track without applying label (boolean)
- `unlabel` - Remove existing label if content no longer matches (boolean)

### Threshold Configuration Fields

#### Account Threshold

- `labels` - Single label or array of labels to aggregate (string | string[])
- `threshold` - Number of labeled posts required to trigger account action (number)
- `window` - Rolling window duration (number)
- `windowUnit` - Unit for the rolling window: "minutes", "hours", or "days" (WindowUnit)
- `accountLabel` - Label to apply to the account (string)
- `accountComment` - Comment for the account action (string)
- `toLabel` - Whether to apply the label, defaults to true (boolean)
- `reportAcct` - Whether to report the account (boolean)
- `commentAcct` - Whether to comment on the account (boolean)

#### Starter Pack Threshold

- `threshold` - Number of starter packs required to trigger account action (number)
- `window` - Rolling window duration (number)
- `windowUnit` - Unit for the rolling window: "minutes", "hours", or "days" (WindowUnit)
- `accountLabel` - Label to apply to the account (string)
- `accountComment` - Comment for the account action (string)
- `toLabel` - Whether to apply the label, defaults to true (boolean)
- `reportAcct` - Whether to report the account (boolean)
- `commentAcct` - Whether to comment on the account (boolean)
- `allowlist` - DIDs to exempt from this check (string[])

## Examples

### Language-Specific Check

```typescript
{
  language: ["spa"],
  label: "spam-es",
  comment: "Spanish spam detected",
  reportAcct: false,
  commentAcct: false,
  toLabel: true,
  check: new RegExp("comprar seguidores", "i"),
}
```

### Temporary Label

```typescript
{
  label: "review-needed",
  comment: "Content flagged for review",
  reportAcct: true,
  commentAcct: false,
  toLabel: false,
  duration: 24,  // Label expires after 24 hours
  check: new RegExp("suspicious.*pattern", "i"),
}
```

### Whitelist Exception

```typescript
{
  label: "blocked-term",
  comment: "Blocked term used",
  reportAcct: false,
  commentAcct: false,
  toLabel: true,
  check: new RegExp("\\bterm\\b", "i"),
  whitelist: new RegExp("legitimate.*context", "i"),
}
```

### Ignored DIDs

```typescript
{
  label: "blocked-term",
  comment: "Blocked term used",
  reportAcct: false,
  commentAcct: false,
  toLabel: true,
  check: new RegExp("\\bterm\\b", "i"),
  ignoredDIDs: [
    "did:plc:trusted123",
    "did:plc:verified456",
  ],
}
```

## Global Configuration

### Allowlist

File: `rules/constants.ts`

DIDs in the global allowlist bypass all checks.

```typescript
export const GLOBAL_ALLOW: string[] = [
  "did:plc:trusted123",
  "did:plc:verified456",
];
```

### Link Shorteners

Pattern to match URL shorteners for special handling.

```typescript
export const LINK_SHORTENER = new RegExp(
  "bit\\.ly|tinyurl\\.com|goo\\.gl",
  "i"
);
```

## Best Practices

### Regular Expressions

- Use word boundaries (`\\b`) to avoid partial matches
- Test patterns thoroughly to minimize false positives
- Use case-insensitive matching (`i` flag) when appropriate
- Escape special regex characters

### Action Selection

- `toLabel: true` - Apply label immediately (use for clear violations)
- `reportAcct: true` - Create report for manual review (use for ambiguous cases)
- `commentAcct: true` - Create comment on account (probably can be depreciated)

### Performance

- Keep regex patterns simple and efficient
- Use language filters to reduce unnecessary checks
- Leverage whitelists instead of complex negative lookaheads

### Testing

After modifying rules:

```bash
bun test:run
```

Test specific rule modules:

```bash
bun test src/rules/posts/tests/
```

## Deployment

Rules are mounted as a volume in docker compose:

```yaml
volumes:
  - ./rules:/app/rules
```

Changes require automod rebuild:

```bash
docker compose up -d --build automod
```
