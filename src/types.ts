export interface Checks {
  label: string;
  comment: string;
  description?: boolean;
  displayName?: boolean;
  reportOnly: boolean;
  commentOnly: boolean;
  check: RegExp;
  whitelist?: RegExp;
  ignoredDIDs?: string[];
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
