export interface Checks {
  label: string;
  comment: string;
  description?: boolean;
  displayName?: boolean;
  reportOnly: boolean;
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

// Define the type for the index
export interface Index {
  byteEnd: number;
  byteStart: number;
}

// Define the Facet interface
export interface Facet {
  features: LinkFeature[];
  index: Index;
}

// Define the type for the image reference
export interface ImageRef {
  $link: string;
}

// Define the type for the image blob
export interface ImageBlob {
  $type: "blob";
  ref: ImageRef;
  mimeType: string;
  size: number;
}

// Define the type for the image
export interface Image {
  alt: string;
  image: ImageBlob;
}

// Define the type for the embed
export interface Embed {
  $type: "app.bsky.embed.images";
  images: Image[];
}

// Define the type for the record
export interface Record {
  $type: "app.bsky.feed.post";
  createdAt: string;
  embed: Embed;
  facets: Facet[];
  text: string;
}

export interface List {
  label: string;
  rkey: string;
}
