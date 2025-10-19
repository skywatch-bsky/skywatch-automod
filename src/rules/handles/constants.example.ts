import { Checks } from "../../types.js";

/**
 * Example handle check configurations
 *
 * This file demonstrates how to configure handle-based moderation rules.
 * Copy this file to constants.ts and customize for your labeler's needs.
 *
 * Each check can match against handles, display names, and/or descriptions
 * based on the flags you set (description: true, displayName: true).
 */

export const HANDLE_CHECKS: Checks[] = [
  // Example 1: Simple pattern matching with whitelist
  {
    label: "spam-indicator",
    comment: "Handle matches common spam patterns",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "follow.*?back|gain.*?followers|crypto.*?giveaway|free.*?money",
      "i",
    ),
    whitelist: new RegExp("legitimate.*?business", "i"),
  },

  // Example 2: Check specific domain patterns
  {
    label: "suspicious-domain",
    comment: "Handle uses suspicious domain pattern",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("(?:suspicious-site\\.example)", "i"),
  },

  // Example 3: Check with display name and description matching
  {
    label: "potential-impersonator",
    comment: "Account may be impersonating verified entities",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "official.*?support|customer.*?service.*?rep|verified.*?account",
      "i",
    ),
    // Exclude accounts that are actually legitimate
    ignoredDIDs: [
      "did:plc:example123", // Real customer support account
      "did:plc:example456", // Verified business account
    ],
  },

  // Example 4: Pattern with specific character variations
  {
    label: "suspicious-pattern",
    comment: "Handle contains suspicious character patterns",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "[a-z]{2,}[0-9]{6,}|random.*?numbers.*?[0-9]{4,}",
      "i",
    ),
    whitelist: new RegExp("year[0-9]{4}", "i"),
    ignoredDIDs: [
      "did:plc:example789", // Legitimate account with number pattern
    ],
  },

  // Example 5: Brand protection
  {
    label: "brand-impersonation",
    comment: "Potential brand impersonation detected",
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("example-?brand|cool-?company|awesome-?corp", "i"),
    whitelist: new RegExp(
      "anti-example-brand|not-cool-company|parody.*awesome-corp",
      "i",
    ),
    ignoredDIDs: [
      "did:plc:exampleabc", // Official brand account
      "did:plc:exampledef", // Authorized partner
    ],
  },
];
