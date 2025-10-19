import { AccountAgeCheck } from "../../types.js";

/**
 * Account age monitoring configurations
 *
 * Each configuration monitors replies and/or quote posts to specified DIDs or posts
 * and labels accounts that were created within a specific time window.
 *
 * Example use cases:
 * - Monitor replies/quotes to high-profile accounts during harassment campaigns
 * - Flag sock puppet accounts created to participate in coordinated harassment
 * - Detect brigading on specific controversial posts
 */
export const ACCOUNT_AGE_CHECKS: AccountAgeCheck[] = [
  // Example: Monitor replies to specific accounts
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
  //
  // Example: Monitor replies to specific posts
  // {
  //   monitoredPostURIs: [
  //     "at://did:plc:example123/app.bsky.feed.post/abc123",
  //     "at://did:plc:example456/app.bsky.feed.post/def456",
  //   ],
  //   anchorDate: "2025-01-15",
  //   maxAgeDays: 7,
  //   label: "brigading-suspect",
  //   comment: "New account replying to specific targeted post",
  //   expires: "2025-02-15",
  // },
];
