import fs from "node:fs";
import {
  CommitCreateEvent,
  CommitUpdateEvent,
  IdentityEvent,
  Jetstream,
} from "@skyware/jetstream";
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
import { Handle, LinkFeature, Post } from "./types.js";

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
  cursor: cursor,
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
    const hasEmbed = event.commit.record.hasOwnProperty("embed");
    const hasFacets = event.commit.record.hasOwnProperty("facets");
    const hasText = event.commit.record.hasOwnProperty("text");

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
      const embed = event.commit.record.embed;
      if (
        embed &&
        (embed.$type === "app.bsky.embed.record" ||
          embed.$type === "app.bsky.embed.recordWithMedia")
      ) {
        const record =
          embed.$type === "app.bsky.embed.record"
            ? embed.record
            : embed.record.record;
        if (record && record.uri) {
          const quotedPostURI = record.uri;
          const quotedDid = quotedPostURI.split("/")[2]; // Extract DID from at://did/...

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

    // Check if the record has facets
    if (hasFacets) {
      // Check for facet spam (hidden mentions with duplicate byte positions)
      tasks.push(
        checkFacetSpam(
          event.did,
          event.time_us,
          atURI,
          event.commit.record.facets!,
        ),
      );

      const hasLinkType = event.commit.record.facets!.some((facet) =>
        facet.features.some(
          (feature) => feature.$type === "app.bsky.richtext.facet#link",
        ),
      );

      if (hasLinkType) {
        const urls = event.commit.record
          .facets!.flatMap((facet) =>
            facet.features.filter(
              (feature) => feature.$type === "app.bsky.richtext.facet#link",
            ),
          )
          .map((feature: LinkFeature) => feature.uri);

        urls.forEach((url) => {
          const posts: Post[] = [
            {
              did: event.did,
              time: event.time_us,
              rkey: event.commit.rkey,
              atURI: atURI,
              text: url,
              cid: event.commit.cid,
            },
          ];
          tasks.push(checkPosts(posts));
        });
      }
    }

    if (hasText) {
      const posts: Post[] = [
        {
          did: event.did,
          time: event.time_us,
          rkey: event.commit.rkey,
          atURI: atURI,
          text: event.commit.record.text,
          cid: event.commit.cid,
        },
      ];
      tasks.push(checkPosts(posts));
    }

    if (hasEmbed) {
      const embed = event.commit.record.embed;
      if (embed && embed.$type === "app.bsky.embed.external") {
        const posts: Post[] = [
          {
            did: event.did,
            time: event.time_us,
            rkey: event.commit.rkey,
            atURI: atURI,
            text: embed.external.uri,
            cid: event.commit.cid,
          },
        ];
        tasks.push(checkPosts(posts));
      }

      if (embed && embed.$type === "app.bsky.embed.recordWithMedia") {
        if (embed.media.$type === "app.bsky.embed.external") {
          const posts: Post[] = [
            {
              did: event.did,
              time: event.time_us,
              rkey: event.commit.rkey,
              atURI: atURI,
              text: embed.media.external.uri,
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
  async (event: CommitUpdateEvent<"app.bsky.actor.profile">) => {
    try {
      if (event.commit.record.displayName || event.commit.record.description) {
        checkDescription(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
        checkDisplayName(
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
  async (event: CommitCreateEvent<"app.bsky.actor.profile">) => {
    try {
      if (event.commit.record.displayName || event.commit.record.description) {
        checkDescription(
          event.did,
          event.time_us,
          event.commit.record.displayName as string,
          event.commit.record.description as string,
        );
        checkDisplayName(
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
jetstream.on("identity", async (event: IdentityEvent) => {
  if (event.identity.handle) {
    checkHandle(event.identity.did, event.identity.handle, event.time_us);
  }
});

const metricsServer = startMetricsServer(METRICS_PORT);

logger.info({ process: "MAIN" }, "Connecting to Redis");
await connectRedis();

jetstream.start();

async function shutdown() {
  try {
    logger.info({ process: "MAIN" }, "Shutting down gracefully");
    fs.writeFileSync("cursor.txt", jetstream.cursor!.toString(), "utf8");
    jetstream.close();
    metricsServer.close();
    await disconnectRedis();
  } catch (error) {
    logger.error({ process: "MAIN", error }, "Error shutting down gracefully");
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
