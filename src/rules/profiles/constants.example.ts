import type { Checks } from "../../types.js";

/**
 * Example profile check configurations
 *
 * This file demonstrates how to configure profile moderation rules.
 * Copy this file to constants.ts and customize for your labeler's needs.
 *
 * Profile checks can match against display names and/or descriptions.
 */

export const PROFILE_CHECKS: Checks[] = [
  // Example 1: Suspicious bio patterns
  {
    label: "suspicious-bio",
    comment: "Profile contains suspicious patterns",
    description: true,
    displayName: false,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "dm.*?for.*?promo|follow.*?for.*?follow|gain.*?followers",
      "i",
    ),
  },

  // Example 2: Display name checks
  {
    label: "impersonation-risk",
    comment: "Display name may indicate impersonation",
    description: false,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("official|verified|admin|support", "i"),
    whitelist: new RegExp("unofficial|parody|fan", "i"),
    ignoredDIDs: [
      "did:plc:example123", // Actual official account
    ],
  },

  // Example 3: Both display name and description
  {
    label: "crypto-spam",
    comment: "Profile suggests crypto spam activity",
    description: true,
    displayName: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("crypto.*?giveaway|nft.*?drop|airdrop", "i"),
  },
];
