import { DatabaseService } from "../db/database.js";
import { LabelSyncService } from "./labelSync.js";
import logger from "../logger.js";
import type { Label } from "../db/types.js";

export class LabelManager {
  private db: DatabaseService;
  private syncService: LabelSyncService | null = null;
  private dedupEnabled: boolean;
  private syncEnabled: boolean;

  constructor() {
    this.db = new DatabaseService();
    this.dedupEnabled =
      process.env.ENABLE_LABEL_DEDUP === "true" ||
      process.env.ENABLE_LABEL_DEDUP === "1";
    this.syncEnabled =
      process.env.ENABLE_LABEL_SYNC === "true" ||
      process.env.ENABLE_LABEL_SYNC === "1";

    if (this.syncEnabled) {
      this.syncService = new LabelSyncService(this.db);
    }
  }

  async initialize(): Promise<void> {
    try {
      if (this.dedupEnabled || this.syncEnabled) {
        logger.info("Initializing label manager with database support");

        const connected = await this.db.testConnection();
        if (!connected) {
          logger.error(
            "Failed to connect to database. Disabling dedup and sync features.",
          );
          this.dedupEnabled = false;
          this.syncEnabled = false;
          return;
        }

        await this.db.runMigrations();
        logger.info("Database migrations completed");

        if (this.syncEnabled && this.syncService) {
          logger.info("Starting label sync service");
          await this.syncService.start();
        }
      } else {
        logger.info("Label deduplication and sync are disabled");
      }
    } catch (error) {
      logger.error("Failed to initialize label manager:", error);
      this.dedupEnabled = false;
      this.syncEnabled = false;
    }
  }

  async shouldCreateLabel(
    did: string,
    atUri?: string,
    labelValue?: string,
  ): Promise<boolean> {
    if (!this.dedupEnabled) {
      return true;
    }

    try {
      const exists = await this.db.checkLabelExists(did, atUri, labelValue);

      if (exists) {
        // Log clearly whether it's a post or account label
        if (atUri) {
          logger.debug(
            `Post label already exists, skipping: ${labelValue || "any"} for ${atUri}`,
          );
        } else {
          logger.debug(
            `Account label already exists, skipping: ${labelValue || "any"} for ${did}`,
          );
        }
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error checking label existence, allowing creation:", error);
      return true;
    }
  }

  async shouldCreatePostLabel(
    atUri: string,
    labelValue: string,
  ): Promise<boolean> {
    if (!this.dedupEnabled) {
      return true;
    }

    try {
      // For posts, we only check if this specific URI already has this label
      // We don't care about the DID - a post can be labeled even if the account has the same label
      const exists = await this.db.checkPostLabelExists(atUri, labelValue);

      if (exists) {
        logger.debug(
          `Post label already exists, skipping: ${labelValue} for ${atUri}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error checking post label existence, allowing creation:", error);
      return true;
    }
  }

  async createLabel(
    did: string,
    atUri: string,
    labelValue: string,
    source: "automod" | "ozone" = "automod",
  ): Promise<Label | null> {
    if (!this.dedupEnabled) {
      logger.debug("Deduplication disabled, skipping database storage");
      return null;
    }

    try {
      const label = await this.db.addLabel({
        did,
        at_uri: atUri,
        label_value: labelValue,
        source,
        negated: false,
      });

      // Log with at_uri if it's a post label, otherwise just the DID for account labels
      if (atUri) {
        logger.debug(`Stored label in database: ${labelValue} for post: ${atUri}`);
      } else {
        logger.debug(`Stored label in database: ${labelValue} for account: ${did}`);
      }
      return label;
    } catch (error) {
      logger.error("Failed to store label in database:", error);
      return null;
    }
  }

  async batchCreateLabels(
    labels: Array<{
      did: string;
      atUri: string;
      labelValue: string;
      source?: "automod" | "ozone";
    }>,
  ): Promise<void> {
    if (!this.dedupEnabled || labels.length === 0) {
      return;
    }

    try {
      const newLabels = labels.map((l) => ({
        did: l.did,
        at_uri: l.atUri,
        label_value: l.labelValue,
        source: l.source || ("automod" as const),
        negated: false,
      }));

      await this.db.batchAddLabels(newLabels);
      logger.debug(`Batch stored ${labels.length} labels in database`);
    } catch (error) {
      logger.error("Failed to batch store labels:", error);
    }
  }

  async negateLabel(
    did: string,
    atUri?: string,
    labelValue?: string,
  ): Promise<void> {
    if (!this.dedupEnabled) {
      return;
    }

    try {
      await this.db.negateLabel(did, atUri, labelValue);
      logger.debug(`Negated label: ${labelValue || "all"} for ${did}`);
    } catch (error) {
      logger.error("Failed to negate label:", error);
    }
  }

  async getLabelsForDid(did: string): Promise<Label[]> {
    if (!this.dedupEnabled) {
      return [];
    }

    try {
      return await this.db.getLabelsForDid(did);
    } catch (error) {
      logger.error("Failed to get labels for DID:", error);
      return [];
    }
  }

  getSyncStatus(): {
    dedupEnabled: boolean;
    syncEnabled: boolean;
    syncStatus?: {
      isRunning: boolean;
      lastSeq: number;
      reconnectAttempts: number;
      connected: boolean;
    };
  } {
    const status: any = {
      dedupEnabled: this.dedupEnabled,
      syncEnabled: this.syncEnabled,
    };

    if (this.syncService) {
      status.syncStatus = this.syncService.getStatus();
    }

    return status;
  }

  async shutdown(): Promise<void> {
    logger.info("Shutting down label manager");

    if (this.syncService) {
      await this.syncService.stop();
    }

    await this.db.close();
  }
}
