import type { StarterPackThresholdConfig } from "../src/types.js";

/**
 * Starter pack threshold configurations
 *
 * Labels accounts that create too many starter packs within a time window.
 * Useful for detecting follow-farming and coordinated campaign behaviour.
 * Configure your checks below.
 */
export const STARTER_PACK_THRESHOLD_CONFIGS: StarterPackThresholdConfig[] = [
  // Example - detect follow-farming:
  // {
  //   threshold: 10,                      // Trigger after 10 starter packs
  //   window: 7,                          // Within this duration
  //   windowUnit: "days",                 // Options: "minutes", "hours", "days"
  //   accountLabel: "follow-farming",
  //   accountComment: "Account created multiple starter packs in short period",
  //   toLabel: true,                      // Apply the label (default: true)
  //   reportAcct: true,                   // Create account report
  //   commentAcct: false,                 // Add comment to account record
  //   allowlist: ["did:plc:trusted123"],  // DIDs to exempt from this check
  // },

  // Example - stricter threshold for rapid creation:
  // {
  //   threshold: 5,
  //   window: 1,
  //   windowUnit: "hours",
  //   accountLabel: "spam-starterpack",
  //   accountComment: "Rapid starter pack creation detected",
  //   toLabel: false,
  //   reportAcct: true,
  //   commentAcct: true,
  // },
];
