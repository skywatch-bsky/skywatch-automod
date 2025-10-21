import type { Checks } from "../src/types.js";

/**
 * Profile-based moderation checks
 *
 * This file contains example values. Copy to profiles.ts and configure with your checks.
 */
export const PROFILE_CHECKS: Checks[] = [
  // Example check:
  // {
  //   label: "example-label",
  //   comment: "Example content found in profile",
  //   description: true,
  //   displayName: true,
  //   reportAcct: false,
  //   commentAcct: false,
  //   toLabel: true,
  //   check: new RegExp("example-pattern", "i"),
  // },
];
