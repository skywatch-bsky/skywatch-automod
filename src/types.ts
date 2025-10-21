import type * as AppBskyRichtextFacet from "@atproto/ozone/dist/lexicon/types/app/bsky/richtext/facet.js";

export interface Checks {
  language?: string[];
  label: string;
  comment: string;
  description?: boolean;
  displayName?: boolean;
  reportAcct: boolean;
  commentAcct: boolean;
  reportPost?: boolean;
  toLabel: boolean;
  duration?: number;
  check: RegExp;
  whitelist?: RegExp;
  ignoredDIDs?: string[];
  starterPacks?: string[];
  knownVectors?: string[];
}

export interface Post {
  did: string;
  time: number;
  rkey: string;
  atURI: string;
  text: string;
  cid: string;
}

export interface Handle {
  did: string;
  time: number;
  handle: string;
}

export interface Profile {
  did: string;
  time: number;
  displayName?: string;
  description?: string;
}

export interface List {
  label: string;
  rkey: string;
}

// Re-export facet types from @atproto/ozone for convenience
export type Facet = AppBskyRichtextFacet.Main;
export type FacetIndex = AppBskyRichtextFacet.ByteSlice;
export type FacetMention = AppBskyRichtextFacet.Mention;
export type LinkFeature = AppBskyRichtextFacet.Link;
export type FacetTag = AppBskyRichtextFacet.Tag;

export interface AccountAgeCheck {
  monitoredDIDs?: string[]; // DIDs to monitor for replies (optional if monitoredPostURIs is provided)
  monitoredPostURIs?: string[]; // Specific post URIs to monitor for replies (optional if monitoredDIDs is provided)
  anchorDate: string; // ISO 8601 date string (e.g., "2025-01-15")
  maxAgeDays: number; // Maximum account age in days
  label: string; // Label to apply if account is too new
  comment: string; // Comment for the label
  expires?: string; // Optional expiration date (ISO 8601) - check will be skipped after this date
}

export interface AccountThresholdConfig {
  labels: string | string[]; // Single label or array for OR matching
  threshold: number; // Number of labeled posts required to trigger account action
  accountLabel: string; // Label to apply to the account
  accountComment: string; // Comment for the account action
  windowDays: number; // Rolling window in days
  reportAcct: boolean; // Whether to report the account
  commentAcct: boolean; // Whether to comment on the account
  toLabel?: boolean; // Whether to apply label (defaults to true)
}
