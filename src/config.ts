import "dotenv/config";

export const MOD_DID = process.env.DID ?? "";
export const OZONE_URL = process.env.OZONE_URL ?? "";
export const OZONE_PDS = process.env.OZONE_PDS ?? "";
export const BSKY_HANDLE = process.env.BSKY_HANDLE ?? "";
export const BSKY_PASSWORD = process.env.BSKY_PASSWORD ?? "";
export const HOST = process.env.HOST ?? "0.0.0.0";
export const METRICS_PORT = process.env.METRICS_PORT
  ? Number(process.env.METRICS_PORT)
  : 4101; // Left this intact from the code I adapted this from
export const FIREHOSE_URL =
  process.env.FIREHOSE_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const PLC_URL = process.env.PLC_URL ?? "plc.directory";
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
export const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
