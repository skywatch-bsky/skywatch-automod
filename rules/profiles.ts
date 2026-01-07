import type { Checks } from "../src/types.js";

/**
 * Profile-based moderation checks
 *
 * Monitors profile display names and descriptions for pattern matches.
 * Configure your checks below.
 */
export const PROFILE_CHECKS: Checks[] = [
  // Basic example - check both displayName and description:
  // {
  //   label: "spam-profile",
  //   comment: "Spam content in profile",
  //   displayName: true,                  // Check display name
  //   description: true,                  // Check description
  //   reportAcct: false,
  //   commentAcct: false,
  //   toLabel: true,
  //   check: new RegExp("follow.*back.*guaranteed", "i"),
  // },

  // Advanced example - displayName only with unlabel:
  // {
  //   label: "impersonation-profile",
  //   comment: "Profile impersonating official account",
  //   displayName: true,
  //   description: false,                 // Only check display name
  //   reportAcct: true,
  //   commentAcct: false,
  //   toLabel: true,
  //   unlabel: true,                      // Remove label if profile changes
  //   check: new RegExp("official.*bluesky.*team", "i"),
  //   whitelist: new RegExp("parody|fan", "i"),
  //   ignoredDIDs: ["did:plc:actual-team-member"],
  // },
];
