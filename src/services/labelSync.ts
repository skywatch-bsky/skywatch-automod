import { WebSocket } from "ws";
import { decode } from "@atcute/cbor";
import { readCar } from "@atcute/car";
import logger from "../logger.js";
import { DatabaseService } from "../db/database.js";
import type { NewLabel } from "../db/types.js";

interface LabelEvent {
  seq: number;
  labels?: Array<{
    cid?: string;
    uri?: string;
    val?: string;
    neg?: boolean;
    src?: string;
    cts?: string;
  }>;
}

interface SubscribeLabelsMessage {
  seq?: number;
  labels?: LabelEvent["labels"];
}

export class LabelSyncService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private lastSeq = 0;
  private isRunning = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private db: DatabaseService;

  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelayMs: number;
  private readonly streamUrl: string;

  constructor(db: DatabaseService) {
    this.db = db;
    this.streamUrl =
      process.env.OZONE_LABEL_STREAM_URL ||
      "wss://ozone.skywatch.blue/xrpc/com.atproto.label.subscribeLabels";
    this.maxReconnectAttempts = parseInt(
      process.env.OZONE_RECONNECT_MAX_ATTEMPTS || "5",
    );
    this.reconnectDelayMs = parseInt(
      process.env.OZONE_RECONNECT_DELAY_MS || "1000",
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Label sync service is already running");
      return;
    }

    this.isRunning = true;
    logger.info("Starting label sync service");
    await this.connect();
  }

  async stop(): Promise<void> {
    logger.info("Stopping label sync service");
    this.isRunning = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async connect(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const url =
        this.lastSeq > 0
          ? `${this.streamUrl}?cursor=${this.lastSeq}`
          : this.streamUrl;

      logger.info(`Connecting to label stream: ${url}`);

      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        logger.info("Connected to label subscription stream");
        this.reconnectAttempts = 0;
      });

      this.ws.on("message", async (data: Buffer) => {
        try {
          await this.handleMessage(data);
        } catch (error) {
          logger.error("Error handling message:", error);
        }
      });

      this.ws.on("error", (error) => {
        logger.error("WebSocket error:", error);
      });

      this.ws.on("close", (code, reason) => {
        logger.info(
          `WebSocket closed: ${code} - ${reason?.toString() || "unknown"}`,
        );
        this.ws = null;

        if (this.isRunning) {
          this.scheduleReconnect();
        }
      });
    } catch (error) {
      logger.error("Failed to connect to label stream:", error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (
      !this.isRunning ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error(
          "Max reconnection attempts reached. Stopping sync service.",
        );
        this.isRunning = false;
      }
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = Math.random() * 1000;
    const totalDelay = Math.min(delay + jitter, 30000);

    logger.info(
      `Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${totalDelay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, totalDelay);
  }

  private async handleMessage(data: Buffer): Promise<void> {
    try {
      // Try to decode as CAR file first (for backfill messages)
      let decoded: SubscribeLabelsMessage;

      try {
        // Check if this is a CAR file (starts with specific bytes)
        if (data[0] === 0x0a && data[1] === 0xa1) {
          // This looks like a CAR file
          const car = await readCar(data);
          // CAR files contain the labels in the blocks
          decoded = car.blocks[0]?.value as SubscribeLabelsMessage;
        } else {
          // Regular CBOR-encoded message
          decoded = decode(data) as SubscribeLabelsMessage;
        }
      } catch (carError) {
        // If CAR parsing fails, try direct CBOR decode
        decoded = decode(data) as SubscribeLabelsMessage;
      }

      if (decoded.seq) {
        this.lastSeq = decoded.seq;
      }

      if (decoded.labels && decoded.labels.length > 0) {
        await this.processLabels(decoded.labels);
      }
    } catch (error) {
      logger.error("Failed to decode message:", error);
      logger.debug("Raw message data:", data.toString("hex").substring(0, 200));
    }
  }

  private async processLabels(
    labels: NonNullable<SubscribeLabelsMessage["labels"]>,
  ): Promise<void> {
    const labelsToAdd: NewLabel[] = [];
    const labelsToNegate: Array<{
      did: string;
      atUri?: string;
      labelValue?: string;
    }> = [];

    for (const label of labels) {
      if (!label.uri) continue;

      const did = this.extractDid(label.uri);
      if (!did) {
        logger.warn(`Could not extract DID from URI: ${label.uri}`);
        continue;
      }

      if (label.neg) {
        labelsToNegate.push({
          did,
          atUri: label.uri,
          labelValue: label.val,
        });
      } else if (label.val) {
        labelsToAdd.push({
          did,
          at_uri: label.uri,
          label_value: label.val,
          source: "ozone",
          negated: false,
        });
      }
    }

    if (labelsToAdd.length > 0) {
      try {
        await this.db.batchAddLabels(labelsToAdd);
        logger.info(`Synced ${labelsToAdd.length} new labels from Ozone`);
      } catch (error) {
        logger.error("Failed to add synced labels:", error);
      }
    }

    for (const negation of labelsToNegate) {
      try {
        await this.db.negateLabel(
          negation.did,
          negation.atUri,
          negation.labelValue,
        );
        logger.debug(
          `Negated label: ${negation.labelValue || "all"} for ${negation.did}`,
        );
      } catch (error) {
        logger.error("Failed to negate label:", error);
      }
    }
  }

  private extractDid(uri: string): string | null {
    const match = uri.match(/did:[^/]+/);
    return match ? match[0] : null;
  }

  getStatus(): {
    isRunning: boolean;
    lastSeq: number;
    reconnectAttempts: number;
    connected: boolean;
  } {
    return {
      isRunning: this.isRunning,
      lastSeq: this.lastSeq,
      reconnectAttempts: this.reconnectAttempts,
      connected: this.ws?.readyState === WebSocket.OPEN,
    };
  }
}
