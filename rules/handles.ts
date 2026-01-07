import type { Checks } from "../src/types.js";

/**
 * Handle-based moderation checks
 *
 * Monitors user handles (usernames) for pattern matches.
 * Configure your checks below.
 */
export const HANDLE_CHECKS: Checks[] = [
  // Basic example - flag potential impersonation:
  // {
  //   label: "impersonation",
  //   comment: "Potential impersonation detected in handle",
  //   reportAcct: true,
  //   commentAcct: false,
  //   toLabel: false,
  //   check: new RegExp("official.*support", "i"),
  // },

  // Advanced example with optional fields:
  // {
  //   label: "suspicious-handle",
  //   comment: "Handle matches known spam pattern",
  //   reportAcct: true,
  //   commentAcct: false,
  //   toLabel: true,
  //   unlabel: true,                      // Remove label if handle changes
  //   check: new RegExp("crypto.*airdrop", "i"),
  //   whitelist: new RegExp("cryptography", "i"),  // Don't match legitimate use
  //   ignoredDIDs: ["did:plc:verified123"],
  // },
];
