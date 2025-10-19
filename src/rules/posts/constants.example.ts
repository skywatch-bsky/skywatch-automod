import type { Checks } from "../../types.js";

export const LINK_SHORTENER = /bit\.ly|tinyurl\.com|ow\.ly/i;

export const POST_CHECKS: Checks[] = [
  // Example 1: Spam detection
  {
    label: "spam",
    comment: "Post contains spam indicators",
    reportPost: true,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp(
      "click.*?here|limited.*?time.*?offer|act.*?now|100%.*?free",
      "i",
    ),
    whitelist: new RegExp("legitimate.*?offer", "i"),
  },

  // Example 2: Promotional content
  {
    label: "promotional",
    comment: "Promotional content detected",
    reportPost: false,
    reportAcct: false,
    commentAcct: false,
    toLabel: true,
    check: new RegExp("buy.*?now|discount.*?code|promo.*?link", "i"),
  },
];
