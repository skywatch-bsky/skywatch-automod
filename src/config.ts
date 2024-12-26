import "dotenv/config";

export const modDID = process.env.DID ?? "";
export const ozoneURL = process.env.OZONE_URL ?? "";
export const ozonePDS = process.env.OZONE_PDS ?? "";
export const BSKY_HANDLE = process.env.BSKY_HANDLE ?? "";
export const BSKY_PASSWORD = process.env.BSKY_PASSWORD ?? "";
export const HOST = process.env.HOST ?? "127.0.0.1";
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4100;
export const METRICS_PORT = process.env.METRICS_PORT
  ? Number(process.env.METRICS_PORT)
  : 4101;
export const FIREHOSE_URL =
  process.env.FIREHOSE_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const WANTED_COLLECTION = "app.bsky.feed.post";
export const CURSOR_UPDATE_INTERVAL = process.env.CURSOR_UPDATE_INTERVAL
  ? Number(process.env.CURSOR_UPDATE_INTERVAL)
  : 60000;
