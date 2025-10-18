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

// Define the type for the link feature
export interface LinkFeature {
  $type: "app.bsky.richtext.facet#link";
  uri: string;
}

export interface List {
  label: string;
  rkey: string;
}

export interface FacetIndex {
  byteStart: number;
  byteEnd: number;
}

export interface Facet {
  index: FacetIndex;
  features: Array<{ $type: string; [key: string]: any }>;
}

export interface AccountAgeCheck {
  monitoredDIDs: string[]; // DIDs to monitor for replies
  anchorDate: string; // ISO 8601 date string (e.g., "2025-01-15")
  maxAgeDays: number; // Maximum account age in days
  label: string; // Label to apply if account is too new
  comment: string; // Comment for the label
  expires?: string; // Optional expiration date (ISO 8601) - check will be skipped after this date
}

