import "dotenv/config";

export const MOD_DID = process.env.DID ?? "";
export const OZONE_URL = process.env.OZONE_URL ?? "";
export const OZONE_PDS = process.env.OZONE_PDS ?? "";
export const LIST_PDS = process.env.LIST_PDS ?? "";
export const LIST_HANDLE = process.env.LIST_HANDLE ?? "";
export const LIST_PASSWORD = process.env.LIST_PASSWORD ?? "";
export const BSKY_HANDLE = process.env.BSKY_HANDLE ?? "";
export const BSKY_PASSWORD = process.env.BSKY_PASSWORD ?? "";
export const HOST = process.env.HOST ?? "127.0.0.1";
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4100;
export const METRICS_PORT = process.env.METRICS_PORT
  ? Number(process.env.METRICS_PORT)
  : 4101; // Left this intact from the code I adapted this from
export const FIREHOSE_URL =
  process.env.FIREHOSE_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const WANTED_COLLECTION = [
  "app.bsky.feed.post",
  "app.bsky.actor.defs",
  "app.bsky.actor.profile",
];
export const CURSOR_UPDATE_INTERVAL = process.env.CURSOR_UPDATE_INTERVAL
  ? Number(process.env.CURSOR_UPDATE_INTERVAL)
  : 60000;
export const LABEL_LIMIT = process.env.LABEL_LIMIT;
export const LABEL_LIMIT_WAIT = process.env.LABEL_LIMIT_WAIT;
