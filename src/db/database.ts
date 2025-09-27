import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import logger from "../logger.js";
import type {
  Database,
  Label,
  LabelHistory,
  NewLabel,
  NewLabelHistory,
} from "./types.js";

const { Pool } = pg;

export class DatabaseService {
  private db: Kysely<Database>;
  private pool: pg.Pool;

  constructor(connectionString?: string) {
    const poolSize = process.env.DATABASE_POOL_SIZE
      ? parseInt(process.env.DATABASE_POOL_SIZE)
      : 10;

    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
    });
  }

  async checkLabelExists(
    did: string,
    atUri?: string,
    labelValue?: string,
  ): Promise<boolean> {
    try {
      let query = this.db
        .selectFrom("labels")
        .select("id")
        .where("did", "=", did)
        .where("negated", "=", false);

      if (atUri !== undefined) {
        query = query.where("at_uri", "=", atUri);
      }

      if (labelValue !== undefined) {
        query = query.where("label_value", "=", labelValue);
      }

      const result = await query.executeTakeFirst();
      return !!result;
    } catch (error) {
      logger.error("Error checking label existence:", error);
      throw error;
    }
  }

  async checkPostLabelExists(
    atUri: string,
    labelValue: string,
  ): Promise<boolean> {
    try {
      // For posts, we only check if this specific URI already has this specific label
      // We don't include DID in the check - this allows posts to be labeled
      // even if the account has the same label
      const query = this.db
        .selectFrom("labels")
        .select("id")
        .where("at_uri", "=", atUri)
        .where("label_value", "=", labelValue)
        .where("negated", "=", false);

      const result = await query.executeTakeFirst();
      return !!result;
    } catch (error) {
      logger.error("Error checking post label existence:", error);
      throw error;
    }
  }

  async addLabel(label: NewLabel): Promise<Label> {
    try {
      const inserted = await this.db
        .insertInto("labels")
        .values({
          ...label,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      await this.addHistory({
        did: inserted.did,
        at_uri: inserted.at_uri,
        label_value: inserted.label_value,
        action: "created",
        source: label.source || "automod",
      });

      logger.debug(`Added label: ${label.label_value} for DID: ${label.did}`);
      return inserted;
    } catch (error: any) {
      if (error?.code === "23505") {
        logger.debug("Label already exists, skipping duplicate");
        const existing = await this.db
          .selectFrom("labels")
          .selectAll()
          .where("did", "=", label.did)
          .where("at_uri", "=", label.at_uri)
          .where("label_value", "=", label.label_value)
          .executeTakeFirst();
        return existing!;
      }
      logger.error("Error adding label:", error);
      throw error;
    }
  }

  async negateLabel(
    did: string,
    atUri?: string,
    labelValue?: string,
  ): Promise<void> {
    try {
      let query = this.db
        .updateTable("labels")
        .set({
          negated: true,
          updated_at: new Date().toISOString(),
        })
        .where("did", "=", did);

      if (atUri !== undefined) {
        query = query.where("at_uri", "=", atUri);
      }

      if (labelValue !== undefined) {
        query = query.where("label_value", "=", labelValue);
      }

      const result = await query.execute();

      if (result.length > 0) {
        await this.addHistory({
          did,
          at_uri: atUri || null,
          label_value: labelValue || "all",
          action: "negated",
          source: "ozone",
        });

        logger.debug(`Negated label(s) for DID: ${did}`);
      }
    } catch (error) {
      logger.error("Error negating label:", error);
      throw error;
    }
  }

  async getLabelsForDid(did: string): Promise<Label[]> {
    try {
      const labels = await this.db
        .selectFrom("labels")
        .selectAll()
        .where("did", "=", did)
        .where("negated", "=", false)
        .execute();

      return labels;
    } catch (error) {
      logger.error("Error getting labels for DID:", error);
      throw error;
    }
  }

  async batchAddLabels(labels: NewLabel[]): Promise<void> {
    if (labels.length === 0) return;

    try {
      const now = new Date().toISOString();
      const labelsWithTimestamps = labels.map((label) => ({
        ...label,
        created_at: now,
        updated_at: now,
      }));

      await this.db.transaction().execute(async (trx) => {
        await trx
          .insertInto("labels")
          .values(labelsWithTimestamps)
          .onConflict((oc) =>
            oc.columns(["did", "at_uri", "label_value"]).doNothing(),
          )
          .execute();

        const historyEntries: NewLabelHistory[] = labels.map((label) => ({
          did: label.did,
          at_uri: label.at_uri || null,
          label_value: label.label_value,
          action: "created",
          source: label.source || "automod",
        }));

        await trx.insertInto("label_history").values(historyEntries).execute();
      });

      logger.debug(`Batch added ${labels.length} labels`);
    } catch (error) {
      logger.error("Error batch adding labels:", error);
      throw error;
    }
  }

  private async addHistory(entry: NewLabelHistory): Promise<void> {
    try {
      await this.db
        .insertInto("label_history")
        .values({
          ...entry,
          timestamp: new Date().toISOString(),
        })
        .execute();
    } catch (error) {
      logger.error("Error adding history entry:", error);
    }
  }

  async runMigrations(): Promise<void> {
    try {
      logger.info("Running database migrations...");

      const client = await this.pool.connect();
      try {
        const migrationSql = `
          -- Initial schema for label deduplication system
          CREATE TABLE IF NOT EXISTS labels (
              id SERIAL PRIMARY KEY,
              did VARCHAR(255) NOT NULL,
              at_uri TEXT,
              label_value VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              negated BOOLEAN DEFAULT FALSE,
              source VARCHAR(50) DEFAULT 'automod',
              CONSTRAINT unique_label UNIQUE(did, at_uri, label_value)
          );

          -- Indexes for performance
          CREATE INDEX IF NOT EXISTS idx_labels_did ON labels(did);
          CREATE INDEX IF NOT EXISTS idx_labels_at_uri ON labels(at_uri);
          CREATE INDEX IF NOT EXISTS idx_labels_value ON labels(label_value);
          CREATE INDEX IF NOT EXISTS idx_labels_negated ON labels(negated);

          -- Label history for audit trail
          CREATE TABLE IF NOT EXISTS label_history (
              id SERIAL PRIMARY KEY,
              did VARCHAR(255) NOT NULL,
              at_uri TEXT,
              label_value VARCHAR(255) NOT NULL,
              action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'negated', 'updated')),
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              source VARCHAR(50),
              metadata JSONB
          );

          -- Index for history queries
          CREATE INDEX IF NOT EXISTS idx_label_history_did ON label_history(did);
          CREATE INDEX IF NOT EXISTS idx_label_history_timestamp ON label_history(timestamp);
        `;

        await client.query(migrationSql);
        logger.info("Database migrations completed successfully");
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Error running migrations:", error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();
      logger.info("Database connection successful");
      return true;
    } catch (error) {
      logger.error("Database connection failed:", error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      await this.db.destroy();
    } catch (error) {
      logger.debug('Database already destroyed:', error);
    }
  }
}
