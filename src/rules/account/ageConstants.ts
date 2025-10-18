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
  {
    monitoredDIDs: [
      "did:plc:b2ecyhl2z2tro25ltrcyiytd", // DHS
      "did:plc:iw2wxg46hm4ezguswhwej6t6", // actual whitehouse
      "did:plc:fhnl65q3us5evynqc4f2qak6", // HHS
      "did:plc:wrz4athzuf2u5js2ltrktiqk", // DOL
      "did:plc:3mqcgvyu4exg3pkx4bkfppih", // VA
      "did:plc:pqn2sfkx5klnytms4uwqt5wo", // Treasurer
      "did:plc:v4kvjftk6kr5ci3zqmfawwpb", // State
      "did:plc:rlymk4d5qmq5udjdznojmvel", // Interior
      "did:plc:f7a5etif42x56oyrbzuek6so", // USDA
      "did:plc:7kusimwlnf4v5jo757jvkeaj", // DOE
      "did:plc:jgq3vko3g6zg72457bda2snd", // SBA
      "did:plc:h2iujdjlry6fpniofjtiqqmb", // DoD
      "did:plc:jwncvpznkwe4luzvdroes45b", // CBP
      "did:plc:azfxx5mdxcuoc2bkuqizs4kd",
      "did:plc:vostkism5vbzjqfcmllmd6gz",
      "did:plc:etthv4ychwti4b6i2hhe76c2",
      "did:plc:swf7zddjselkcpbn6iw323gy",
      "did:plc:h3zq65wioggctyxpovfpi6ec",
      "did:plc:nofnc2xpdihktxkufkq7tn3w",
      "did:plc:quezcqejcqw6g5t3om7wldns",
      "did:plc:vlvqht2v3nsc4k7xaho6bjaf",
      "did:plc:syyfuvqiabipi5mf3x632qij",
      "did:plc:6vpxzm6mxjzcfvccnuw2pyd7",
      "did:plc:yxqdgravj27gtxkpqhrnzhlx",
      "did:plc:nrhrdxqa2v7hfxw2jnuy7rk7",
      "did:plc:pr27argcmniiwxp7d7facqwy",
      "did:plc:azfxx5mdxcuoc2bkuqizs4kd",
      "did:plc:y42muzveli3sjyr3tufaq765",
      "did:plc:22wazjq4e4yjafxlew2c6kov",
      "did:plc:iw64z65wzkmqvftssb2nldj5",
    ],
    anchorDate: "2025-10-17", // Date when harassment campaign started
    maxAgeDays: 7, // Flag accounts less than 7 days old
    label: "suspect-inauthentic",
    comment: "New account replying to monitored user during campaign",
  },
];
