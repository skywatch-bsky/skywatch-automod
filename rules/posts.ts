import type { Checks } from "../src/types.js";

/**
 * Post content moderation checks
 *
 * Monitors post text and embedded URLs for pattern matches.
 * Configure your checks below.
 */
export const POST_CHECKS: Checks[] = [
  // Basic example - label posts matching a pattern:
  // {
  //   label: "spam",
  //   comment: "Spam content detected in post",
  //   reportAcct: false,
  //   commentAcct: false,
  //   toLabel: true,
  //   check: new RegExp("buy.*followers", "i"),
  // },

  // Advanced example - all optional fields:
  // {
  //   label: "scam-link",
  //   comment: "Suspicious link detected",
  //   language: ["eng", "spa"],           // Only check posts in these languages
  //   reportAcct: true,                   // Create account report
  //   reportPost: true,                   // Create post report
  //   commentAcct: false,                 // Add comment to account record
  //   toLabel: true,                      // Apply the label
  //   trackOnly: false,                   // If true, track but don't take action
  //   unlabel: false,                     // If true, remove label when no longer matching
  //   duration: 24,                       // Label expires after 24 hours
  //   check: new RegExp("crypto.*giveaway", "i"),
  //   whitelist: new RegExp("legitimate-site\\.com", "i"),  // Skip if this matches
  //   ignoredDIDs: ["did:plc:trusted123"],                  // Skip these accounts
  //   starterPacks: ["at://did:plc:xyz/app.bsky.graph.starterpack/abc"],  // Only check members
  //   knownVectors: ["telegram-scam", "discord-spam"],      // Tracking tags
  // },
];
