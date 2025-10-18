import { AccountAgeCheck } from "../../types.js";

/**
 * Account age monitoring configurations
 *
 * Each configuration monitors replies to specified DIDs and labels accounts
 * that are newer than the threshold relative to the anchor date.
 *
 * Example use case:
 * - Monitor replies to high-profile accounts during harassment campaigns
 * - Flag sock puppet accounts created to participate in coordinated harassment
 */
export const ACCOUNT_AGE_CHECKS: AccountAgeCheck[] = [
  // Example configuration (disabled by default)
  // {
  //   monitoredDIDs: [
  //     "did:plc:example123", // High-profile account 1
  //     "did:plc:example456", // High-profile account 2
  //   ],
  //   anchorDate: "2025-01-15", // Date when harassment campaign started
  //   maxAgeDays: 7, // Flag accounts less than 7 days old
  //   label: "new-account-reply",
  //   comment: "New account replying to monitored user during campaign",
  //   expires: "2025-02-15", // Optional: automatically stop this check after this date
  // },
];
