import {
  CommitCreateEvent,
  CommitUpdateEvent,
  IdentityEvent,
  Jetstream,
} from "@skyware/jetstream";
import fs from "node:fs";

import {
  CURSOR_UPDATE_INTERVAL,
  FIREHOSE_URL,
  METRICS_PORT,
  WANTED_COLLECTION,
} from "./config.js";
import logger from "./logger.js";
import { startMetricsServer } from "./metrics.js";
import { Post, LinkFeature, Handle } from "./types.js";
import { checkPosts } from "./checkPosts.js";
import { checkHandle } from "./checkHandles.js";
import { checkProfile } from "./checkProfiles.js";

let cursor = 0;
let cursorUpdateInterval: NodeJS.Timeout;

function epochUsToDateTime(cursor: number): string {
  return new Date(cursor / 1000).toISOString();
}

try {
  logger.info("Trying to read cursor from cursor.txt...");
  cursor = Number(fs.readFileSync("cursor.txt", "utf8"));
  logger.info(`Cursor found: ${cursor} (${epochUsToDateTime(cursor)})`);
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "ENOENT") {
    cursor = Math.floor(Date.now() * 1000);
    logger.info(
      `Cursor not found in cursor.txt, setting cursor to: ${cursor} (${epochUsToDateTime(cursor)})`,
    );
    fs.writeFileSync("cursor.txt", cursor.toString(), "utf8");
  } else {
    logger.error(error);
    process.exit(1);
  }
}

const jetstream = new Jetstream({
  wantedCollections: WANTED_COLLECTION,
  endpoint: FIREHOSE_URL,
  cursor: cursor,
});

jetstream.on("open", () => {
  logger.info(
    `Connected to Jetstream at ${FIREHOSE_URL} with cursor ${jetstream.cursor} (${epochUsToDateTime(jetstream.cursor!)})`,
  );
  cursorUpdateInterval = setInterval(() => {
    if (jetstream.cursor) {
      logger.info(
        `Cursor updated to: ${jetstream.cursor} (${epochUsToDateTime(jetstream.cursor)})`,
      );
      fs.writeFile("cursor.txt", jetstream.cursor.toString(), (err) => {
        if (err) logger.error(err);
      });
    }
  }, CURSOR_UPDATE_INTERVAL);
});

jetstream.on("close", () => {
  clearInterval(cursorUpdateInterval);
  logger.info("Jetstream connection closed.");
});

jetstream.on("error", (error) => {
  logger.error(`Jetstream error: ${error.message}`);
});

// Check for post updates
jetstream.onCreate(
  "app.bsky.feed.post",
  (event: CommitCreateEvent<typeof WANTED_COLLECTION>) => {
    const atURI = `at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`;
    const hasFacets = event.commit.record.hasOwnProperty("facets");
    const hasText = event.commit.record.hasOwnProperty("text");

    const tasks: Promise<void>[] = [];

    // Check if the record has facets
    if (hasFacets) {
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
              check: url,
              cid: event.commit.cid,
            },
          ];
          tasks.push(checkPosts(posts));
        });
      }
    } else if (hasText) {
      const posts: Post[] = [
        {
          did: event.did,
          time: event.time_us,
          rkey: event.commit.rkey,
          atURI: atURI,
          check: event.commit.record.text,
          cid: event.commit.cid,
        },
      ];
      tasks.push(checkPosts(posts));
    }
  },
);

// Check for profile updates
jetstream.onUpdate(
  "app.bsky.actor.profile",
  (event: CommitUpdateEvent<typeof WANTED_COLLECTION>) => {
    try {
      const ret = checkProfile(
        event.did,
        event.time_us,
        event.commit.record.displayName,
        event.commit.record.description,
      );
    } catch (error) {
      logger.error(`Error checking profile:  ${error}`);
    }
  },
);

// Check for handle updates
jetstream.on("identity", async (event: IdentityEvent) => {
  const handle: Handle[] = [
    { did: event.did, handle: event.identity.handle, time: event.time_us },
  ];

  try {
    const ret = await checkHandle(handle);
  } catch (error) {
    logger.error(`Error checking handle: ${error}`);
  }
});

const metricsServer = startMetricsServer(METRICS_PORT);

/* labelerServer.app.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    logger.error("Error starting server: %s", error);
  } else {
    logger.info(`Labeler server listening on ${address}`);
  }
});*/

jetstream.start();

function shutdown() {
  try {
    logger.info("Shutting down gracefully...");
    fs.writeFileSync("cursor.txt", jetstream.cursor!.toString(), "utf8");
    jetstream.close();
    metricsServer.close();
  } catch (error) {
    logger.error(`Error shutting down gracefully: ${error}`);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
