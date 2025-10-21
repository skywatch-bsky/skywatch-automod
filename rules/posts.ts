import type { Checks } from "../src/types.js";

/**
 * Post content moderation checks
 *
 * This file contains example values. Copy to posts.ts and configure with your checks.
 */
export const POST_CHECKS: Checks[] = [
  // Example check:
  // {
  //   label: "example-label",
  //   comment: "Example content found in post",
  //   reportAcct: false,
  //   commentAcct: false,
  //   toLabel: true,
  //   check: new RegExp("example-pattern", "i"),
  // },
];
