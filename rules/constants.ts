/**
 * Global allowlist for accounts that should bypass all checks
 *
 * Add DIDs here to exempt them from all moderation checks.
 */
export const GLOBAL_ALLOW: string[] = [
  // Example: "did:plc:trusted-account",
];

/**
 * URL shortener detection pattern
 *
 * Matched URLs are resolved to their final destination before checking.
 * Add domains for URL shorteners you want to expand.
 */
export const LINK_SHORTENER = new RegExp(
  [
    "bit\\.ly",
    "tinyurl\\.com",
    "t\\.co",
    "goo\\.gl",
    "ow\\.ly",
    "is\\.gd",
    "buff\\.ly",
    "rebrand\\.ly",
    "short\\.io",
  ].join("|"),
  "i",
);
