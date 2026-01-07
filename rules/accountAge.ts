import type { AccountAgeCheck } from "../src/types.js";

/**
 * Account age monitoring configurations
 *
 * Labels new accounts that interact with monitored DIDs or posts.
 * Useful for protecting high-profile accounts from coordinated harassment.
 * Configure your checks below.
 */
export const ACCOUNT_AGE_CHECKS: AccountAgeCheck[] = [
  // Example - monitor replies to specific accounts:
  // {
  //   monitoredDIDs: ["did:plc:example123", "did:plc:example456"],
  //   anchorDate: "2025-01-15",           // Only check accounts created after this date
  //   maxAgeDays: 7,                      // Flag accounts younger than 7 days
  //   label: "new-account-reply",
  //   comment: "New account replying to monitored user",
  //   expires: "2025-02-15",              // Stop checking after this date
  // },

  // Example - monitor replies/quotes to specific posts:
  // {
  //   monitoredPostURIs: [
  //     "at://did:plc:xyz/app.bsky.feed.post/abc123",
  //     "at://did:plc:xyz/app.bsky.feed.post/def456",
  //   ],
  //   anchorDate: "2025-01-20",
  //   maxAgeDays: 3,
  //   label: "new-account-quote",
  //   comment: "New account quoting monitored post",
  // },

  // Example - combine both DID and post monitoring:
  // {
  //   monitoredDIDs: ["did:plc:high-profile"],
  //   monitoredPostURIs: ["at://did:plc:high-profile/app.bsky.feed.post/viral"],
  //   anchorDate: "2025-01-01",
  //   maxAgeDays: 14,
  //   label: "new-account-interaction",
  //   comment: "New account interacting with high-profile content",
  //   expires: "2025-03-01",
  // },
];
