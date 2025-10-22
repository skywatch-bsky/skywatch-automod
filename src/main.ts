import fs from "node:fs";
import type {
  CommitCreateEvent,
  CommitUpdateEvent,
  IdentityEvent,
} from "@skyware/jetstream";
import { Jetstream } from "@skyware/jetstream";
import { login } from "./agent.js";
import {
  CURSOR_UPDATE_INTERVAL,
  FIREHOSE_URL,
  METRICS_PORT,
  WANTED_COLLECTION,
} from "./config.js";
import { logger } from "./logger.js";
import { startMetricsServer } from "./metrics.js";
import { connectRedis, disconnectRedis } from "./redis.js";
import { checkAccountAge } from "./rules/account/age.js";
import { checkFacetSpam } from "./rules/facets/facets.js";
import { checkHandle } from "./rules/handles/checkHandles.js";
import { checkPosts } from "./rules/posts/checkPosts.js";
import {
  checkDescription,
  checkDisplayName,
} from "./rules/profiles/checkProfiles.js";
import type { Post } from "./types.js";

let cursor = 0;
let cursorUpdateInterval: NodeJS.Timeout;

function epochUsToDateTime(cursor: number): string {
  return new Date(cursor / 1000).toISOString();
}

try {
  logger.info({ process: "MAIN" }, "Trying to read cursor from cursor.txt");
  cursor = Number(fs.readFileSync("cursor.txt", "utf8"));
  logger.info(
    { process: "MAIN", cursor, datetime: epochUsToDateTime(cursor) },
    "Cursor found",
  );
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "ENOENT") {
    cursor = Math.floor(Date.now() * 1000);
    logger.info(
      { process: "MAIN", cursor, datetime: epochUsToDateTime(cursor) },
      "Cursor not found in cursor.txt, setting cursor",
    );
    fs.writeFileSync("cursor.txt", cursor.toString(), "utf8");
  } else {
    logger.error({ process: "MAIN", error }, "Failed to read cursor");
    process.exit(1);
  }
}

const jetstream = new Jetstream({
  wantedCollections: WANTED_COLLECTION,
  endpoint: FIREHOSE_URL,
  cursor,
});

jetstream.on("open", () => {
  if (jetstream.cursor) {
    logger.info(
      {
        process: "MAIN",
        url: FIREHOSE_URL,
        cursor: jetstream.cursor,
        datetime: epochUsToDateTime(jetstream.cursor),
      },
      "Connected to Jetstream with cursor",
    );
  } else {
    logger.info(
      { process: "MAIN", url: FIREHOSE_URL },
      "Connected to Jetstream, waiting for cursor",
    );
  }
  cursorUpdateInterval = setInterval(() => {
    if (jetstream.cursor) {
      logger.info(
        {
          process: "MAIN",
          cursor: jetstream.cursor,
          datetime: epochUsToDateTime(jetstream.cursor),
        },
        "Cursor updated",
      );
      fs.writeFile("cursor.txt", jetstream.cursor.toString(), (err) => {
        if (err)
          logger.error(
            { process: "MAIN", error: err },
            "Failed to write cursor",
          );
      });
    }
  }, CURSOR_UPDATE_INTERVAL);
});

jetstream.on("close", () => {
  clearInterval(cursorUpdateInterval);
  logger.info({ process: "MAIN" }, "Jetstream connection closed");
});

jetstream.on("error", (error) => {
  logger.error({ process: "MAIN", error: error.message }, "Jetstream error");
});

// Check for post updates

jetstream.onCreate(
  "app.bsky.feed.post",
  (event: CommitCreateEvent<"app.bsky.feed.post">) => {
    const atURI = `at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`;
    const hasEmbed = Object.prototype.hasOwnProperty.call(
      event.commit.record,
      "embed",
    );
    const hasFacets = Object.prototype.hasOwnProperty.call(
      event.commit.record,
      "facets",
    );
    const hasText = Object.prototype.hasOwnProperty.call(
      event.commit.record,
      "text",
    );

    const tasks: Promise<void>[] = [];

    // Check account age for replies to monitored DIDs
    if (event.commit.record.reply) {
      const parentUri = event.commit.record.reply.parent.uri;
      const replyToDid = parentUri.split("/")[2]; // Extract DID from at://did/...

      tasks.push(
        checkAccountAge({
          actorDid: event.did,
          replyToDid,
          replyToPostURI: parentUri,
          atURI,
          time: event.time_us,
        }),
      );
    }

    // Check account age for quote posts
    if (hasEmbed) {
      const { embed } = event.commit.record;
      if (
        embed &&
        typeof embed === "object" &&
        "$type" in embed &&
        (embed.$type === "app.bsky.embed.record" ||
          embed.$type === "app.bsky.embed.recordWithMedia")
      ) {
        const record =
          embed.$type === "app.bsky.embed.record"
            ? (embed as { record: { uri?: string } }).record
            : (embed as { record: { record: { uri?: string } } }).record.record;
        if (record.uri && typeof record.uri === "string") {
          const quotedPostURI = record.uri;
          const quotedDid = quotedPostURI.split("/")[2]; // Extract DID from at://did/...
          if (quotedDid) {
            tasks.push(
              checkAccountAge({
                actorDid: event.did,
                quotedDid,
                quotedPostURI,
                atURI,
                time: event.time_us,
              }),
            );
          }
        }
      }
    }

    // Check if the record has facets
    if (hasFacets) {
      // Check for facet spam (hidden mentions with duplicate byte positions)
      const facets = event.commit.record.facets ?? null;
      tasks.push(checkFacetSpam(event.did, event.time_us, atURI, facets));

      const hasLinkType = facets?.some((facet) =>
        facet.features.some(
          (feature) => feature.$type === "app.bsky.richtext.facet#link",
        ),
      );

      if (hasLinkType && facets) {
        for (const facet of facets) {
          const linkFeatures = facet.features.filter(
            (feature) => feature.$type === "app.bsky.richtext.facet#link",
          );

          for (const feature of linkFeatures) {
            if ("uri" in feature && typeof feature.uri === "string") {
              const posts: Post[] = [
                {
                  did: event.did,
                  time: event.time_us,
                  rkey: event.commit.rkey,
                  atURI,
                  text: feature.uri,
                  cid: event.commit.cid,
                },
              ];
              tasks.push(checkPosts(posts));
            }
          }
        }
      }
    }

    if (hasText) {
      const posts: Post[] = [
        {
          did: event.did,
          time: event.time_us,
          rkey: event.commit.rkey,
          atURI,
          text: event.commit.record.text,
          cid: event.commit.cid,
        },
      ];
      tasks.push(checkPosts(posts));
    }

    if (hasEmbed) {
      const { embed } = event.commit.record;
      if (
        embed &&
        typeof embed === "object" &&
        "$type" in embed &&
        embed.$type === "app.bsky.embed.external"
      ) {
        const { external } = embed as { external: { uri: string } };
        const posts: Post[] = [
          {
            did: event.did,
            time: event.time_us,
            rkey: event.commit.rkey,
            atURI,
            text: external.uri,
            cid: event.commit.cid,
          },
        ];
        tasks.push(checkPosts(posts));
      }

      if (
        embed &&
        typeof embed === "object" &&
        "$type" in embed &&
        embed.$type === "app.bsky.embed.recordWithMedia"
      ) {
        const { media } = embed as {
          media: { $type: string; external?: { uri: string } };
        };
        if (media.$type === "app.bsky.embed.external" && media.external) {
          const posts: Post[] = [
            {
              did: event.did,
              time: event.time_us,
              rkey: event.commit.rkey,
              atURI,
              text: media.external.uri,
              cid: event.commit.cid,
            },
          ];
          tasks.push(checkPosts(posts));
        }
      }
    }
  },
);

// Check for profile updates
jetstream.onUpdate(
  "app.bsky.actor.profile",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
  async (event: CommitUpdateEvent<"app.bsky.actor.profile">) => {
    try {
      if (event.commit.record.displayName || event.commit.record.description) {
        void checkDescription(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
        void checkDisplayName(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
      }
    } catch (error) {
      logger.error({ process: "MAIN", error }, "Error checking profile");
    }
  },
);

// Check for profile updates

jetstream.onCreate(
  "app.bsky.actor.profile",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
  async (event: CommitCreateEvent<"app.bsky.actor.profile">) => {
    try {
      if (event.commit.record.displayName || event.commit.record.description) {
        void checkDescription(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
        void checkDisplayName(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
      }
    } catch (error) {
      logger.error({ process: "MAIN", error }, "Error checking profile");
    }
  },
);

// Check for handle updates
jetstream.on(
  "identity",
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-misused-promises
  async (event: IdentityEvent) => {
    if (event.identity.handle) {
      // checkHandle is sync but calls async functions with void
      checkHandle(event.identity.did, event.identity.handle, event.time_us);
    }
  },
);

const metricsServer = startMetricsServer(METRICS_PORT);

logger.info({ process: "MAIN" }, "Connecting to Redis");
await connectRedis();

logger.info({ process: "MAIN" }, "Authenticating with Bluesky");
await login();
logger.info({ process: "MAIN" }, "Authentication complete, starting Jetstream");

jetstream.start();

async function shutdown() {
  try {
    logger.info({ process: "MAIN" }, "Shutting down gracefully");
    if (jetstream.cursor !== undefined) {
      fs.writeFileSync("cursor.txt", jetstream.cursor.toString(), "utf8");
    }
    jetstream.close();
    metricsServer.close();
    await disconnectRedis();
  } catch (error) {
    logger.error({ process: "MAIN", error }, "Error shutting down gracefully");
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
