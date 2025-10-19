import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TrackedLabelConfig } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MOD_DID = process.env.DID ?? "";
export const OZONE_URL = process.env.OZONE_URL ?? "";
export const OZONE_PDS = process.env.OZONE_PDS ?? "";
export const BSKY_HANDLE = process.env.BSKY_HANDLE ?? "";
export const BSKY_PASSWORD = process.env.BSKY_PASSWORD ?? "";
export const HOST = process.env.HOST ?? "127.0.0.1";
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4100;
export const METRICS_PORT = process.env.METRICS_PORT
  ? Number(process.env.METRICS_PORT)
  : 4101; // Left this intact from the code I adapted this from
export const FIREHOSE_URL =
  process.env.FIREHOSE_URL ?? "wss://jetstream.atproto.tools/subscribe";
export const PLC_URL = process.env.PLC_URL ?? "plc.directory";
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
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

/**
 * Validate a single tracked label configuration
 */
export function validateTrackedLabelConfig(
  config: unknown,
  index: number,
): config is TrackedLabelConfig {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(
      `Configuration at index ${index} is not an object: ${JSON.stringify(config)}`,
    );
  }

  const c = config as Record<string, unknown>;

  // Required fields
  // Label can be a string or array of strings
  if (typeof c.label === "string") {
    if (c.label.trim() === "") {
      throw new Error(
        `Configuration at index ${index} has invalid 'label': string cannot be empty`,
      );
    }
  } else if (Array.isArray(c.label)) {
    if (c.label.length === 0) {
      throw new Error(
        `Configuration at index ${index} has invalid 'label': array cannot be empty`,
      );
    }
    for (let i = 0; i < c.label.length; i++) {
      if (typeof c.label[i] !== "string" || c.label[i].trim() === "") {
        throw new Error(
          `Configuration at index ${index} has invalid 'label[${i}]': must be a non-empty string`,
        );
      }
    }
  } else {
    throw new Error(
      `Configuration at index ${index} has invalid 'label': must be a string or array of strings`,
    );
  }

  if (typeof c.threshold !== "number") {
    throw new Error(
      `Configuration at index ${index} has invalid 'threshold': must be a number`,
    );
  }

  if (c.threshold <= 0) {
    throw new Error(
      `Configuration at index ${index} has invalid 'threshold': must be greater than 0 (got ${c.threshold})`,
    );
  }

  if (!Number.isInteger(c.threshold)) {
    throw new Error(
      `Configuration at index ${index} has invalid 'threshold': must be an integer (got ${c.threshold})`,
    );
  }

  if (typeof c.accountLabel !== "string" || c.accountLabel.trim() === "") {
    throw new Error(
      `Configuration at index ${index} has invalid 'accountLabel': must be a non-empty string`,
    );
  }

  if (
    typeof c.accountComment !== "string" ||
    c.accountComment.trim() === ""
  ) {
    throw new Error(
      `Configuration at index ${index} has invalid 'accountComment': must be a non-empty string`,
    );
  }

  // Optional fields
  if (c.windowDays !== undefined) {
    if (typeof c.windowDays !== "number") {
      throw new Error(
        `Configuration at index ${index} has invalid 'windowDays': must be a number`,
      );
    }
    if (c.windowDays <= 0) {
      throw new Error(
        `Configuration at index ${index} has invalid 'windowDays': must be greater than 0 (got ${c.windowDays})`,
      );
    }
    if (!Number.isInteger(c.windowDays)) {
      throw new Error(
        `Configuration at index ${index} has invalid 'windowDays': must be an integer (got ${c.windowDays})`,
      );
    }
  }

  if (c.reportAcct !== undefined && typeof c.reportAcct !== "boolean") {
    throw new Error(
      `Configuration at index ${index} has invalid 'reportAcct': must be a boolean`,
    );
  }

  if (c.commentAcct !== undefined && typeof c.commentAcct !== "boolean") {
    throw new Error(
      `Configuration at index ${index} has invalid 'commentAcct': must be a boolean`,
    );
  }

  return true;
}

/**
 * Load and validate tracked labels configuration from JSON file
 */
export function loadTrackedLabels(): TrackedLabelConfig[] {
  const configPath = path.join(__dirname, "..", "tracked-labels.json");

  // Check if file exists
  if (!fs.existsSync(configPath)) {
    console.error(
      `FATAL: tracked-labels.json not found at ${configPath}`,
    );
    console.error(
      "Create this file using tracked-labels.example.json as a template",
    );
    process.exit(1);
  }

  // Read file
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(configPath, "utf-8");
  } catch (error) {
    console.error(
      `FATAL: Failed to read tracked-labels.json: ${error}`,
    );
    process.exit(1);
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch (error) {
    console.error(
      `FATAL: tracked-labels.json contains invalid JSON: ${error}`,
    );
    process.exit(1);
  }

  // Validate it's an array
  if (!Array.isArray(parsed)) {
    console.error(
      `FATAL: tracked-labels.json must contain an array, got ${typeof parsed}`,
    );
    process.exit(1);
  }

  // Validate each config
  try {
    parsed.forEach((config, index) => {
      validateTrackedLabelConfig(config, index);
    });
  } catch (error) {
    console.error(
      `FATAL: Invalid tracked label configuration: ${error}`,
    );
    process.exit(1);
  }

  console.log(
    `✓ Loaded ${parsed.length} tracked label configuration(s)`,
  );

  return parsed as TrackedLabelConfig[];
}

/**
 * Tracked labels configuration (loaded at startup)
 */
export const TRACKED_LABELS: TrackedLabelConfig[] = loadTrackedLabels();
