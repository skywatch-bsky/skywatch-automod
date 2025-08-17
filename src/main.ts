import fs from 'node:fs';

import type {
  CommitCreateEvent,
  CommitUpdateEvent,
  IdentityEvent } from '@skyware/jetstream';
import {
  Jetstream,
} from '@skyware/jetstream';


import { checkHandle } from './checkHandles.js';
import { checkPosts } from './checkPosts.js';
import { checkDescription, checkDisplayName } from './checkProfiles.js';
import { checkStarterPack, checkNewStarterPack } from './checkStarterPack.js';
import {
  CURSOR_UPDATE_INTERVAL,
  FIREHOSE_URL,
  METRICS_PORT,
  WANTED_COLLECTION,
} from './config.js';
import logger from './logger.js';
import { startMetricsServer } from './metrics.js';
import type { Post, LinkFeature } from './types.js';

let cursor = 0;
let cursorUpdateInterval: NodeJS.Timeout;

function epochUsToDateTime(cursor: number): string {
  return new Date(cursor / 1000).toISOString();
}

try {
  logger.info('Trying to read cursor from cursor.txt...');
  cursor = Number(fs.readFileSync('cursor.txt', 'utf8'));
  logger.info(`Cursor found: ${cursor.toString()} (${epochUsToDateTime(cursor)})`);
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    cursor = Math.floor(Date.now() * 1000);
    logger.info(
      `Cursor not found in cursor.txt, setting cursor to: ${cursor.toString()} (${epochUsToDateTime(cursor)})`,
    );
    fs.writeFileSync('cursor.txt', cursor.toString(), 'utf8');
  } else {
    logger.error(error);
    process.exit(1);
  }
}

const jetstream = new Jetstream({
  wantedCollections: WANTED_COLLECTION,
  endpoint: FIREHOSE_URL,
  cursor,
});

jetstream.on('open', () => {
  if (jetstream.cursor) {
    logger.info(
      `Connected to Jetstream at ${FIREHOSE_URL} with cursor ${jetstream.cursor.toString()} (${epochUsToDateTime(jetstream.cursor)})`,
    );
  } else {
    logger.info(
      `Connected to Jetstream at ${FIREHOSE_URL}, waiting for cursor...`,
    );
  }
  cursorUpdateInterval = setInterval(() => {
    if (jetstream.cursor) {
      logger.info(
        `Cursor updated to: ${jetstream.cursor.toString()} (${epochUsToDateTime(jetstream.cursor)})`,
      );
      fs.writeFile('cursor.txt', jetstream.cursor.toString(), (err) => {
        if (err) logger.error(err);
      });
    }
  }, CURSOR_UPDATE_INTERVAL);
});

jetstream.on('close', () => {
  clearInterval(cursorUpdateInterval);
  logger.info('Jetstream connection closed.');
});

jetstream.on('error', (error) => {
  logger.error(`Jetstream error: ${error.message}`);
});

// Check for post updates

jetstream.onCreate(
  'app.bsky.feed.post',
  (event: CommitCreateEvent<'app.bsky.feed.post'>) => {
    try {
      const atURI = `at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`;
      const hasFacets = Object.hasOwn(event.commit.record, 'facets');
      const hasText = Object.hasOwn(event.commit.record, 'text');

      const tasks: Promise<void>[] = [];

      // Check if the record has facets
      if (hasFacets && event.commit.record.facets) {
        const hasLinkType = event.commit.record.facets.some((facet) =>
          facet.features.some(
            (feature) => feature.$type === 'app.bsky.richtext.facet#link',
          ),
        );

        if (hasLinkType) {
          const urls = event.commit.record.facets.flatMap((facet) =>
            facet.features.filter(
              (feature) => feature.$type === 'app.bsky.richtext.facet#link',
            ),
          )
            .map((feature: LinkFeature) => feature.uri);

          urls.forEach((url) => {
            const posts: Post[] = [
              {
                did: event.did,
                time: event.time_us,
                rkey: event.commit.rkey,
                atURI,
                text: url,
                cid: event.commit.cid,
              },
            ];
            tasks.push(checkPosts(posts).catch((error: unknown) => {
              logger.error(`Error checking post links for ${event.did}:`, error);
            }));
          });
        }
      } else if (hasText && event.commit.record.text) {
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
        tasks.push(checkPosts(posts).catch((error: unknown) => {
          logger.error(`Error checking post text for ${event.did}:`, error);
        }));
      }

      // Wait for all tasks to complete
      if (tasks.length > 0) {
        void Promise.allSettled(tasks);
      }
    } catch (error: unknown) {
      logger.error(`Error processing post event for ${event.did}:`, error);
    }
  },
);

// Check for profile updates
jetstream.onUpdate(
  'app.bsky.actor.profile',
  (event: CommitUpdateEvent<'app.bsky.actor.profile'>) => {
    try {
      const tasks: Promise<void>[] = [];

      if (event.commit.record.displayName || event.commit.record.description) {
        const displayName = event.commit.record.displayName ?? '';
        const description = event.commit.record.description ?? '';
        
        tasks.push(
          checkDescription(event.did, event.time_us, displayName, description)
            .catch((error: unknown) => {
              logger.error(`Error checking profile description for ${event.did}:`, error);
            })
        );
        
        tasks.push(
          checkDisplayName(event.did, event.time_us, displayName, description)
            .catch((error: unknown) => {
              logger.error(`Error checking profile display name for ${event.did}:`, error);
            })
        );
      }

      if (event.commit.record.joinedViaStarterPack) {
        tasks.push(
          checkStarterPack(event.did, event.time_us, event.commit.record.joinedViaStarterPack.uri)
            .catch((error: unknown) => {
              logger.error(`Error checking starter pack for ${event.did}:`, error);
            })
        );
      }

      // Wait for all tasks to complete
      if (tasks.length > 0) {
        void Promise.allSettled(tasks);
      }
    } catch (error: unknown) {
      logger.error(`Error processing profile update event for ${event.did}:`, error);
    }
  },
);

// Check for profile updates

jetstream.onCreate(
  'app.bsky.actor.profile',
  (event: CommitCreateEvent<'app.bsky.actor.profile'>) => {
    try {
      const tasks: Promise<void>[] = [];

      if (event.commit.record.displayName || event.commit.record.description) {
        const displayName = event.commit.record.displayName ?? '';
        const description = event.commit.record.description ?? '';
        
        tasks.push(
          checkDescription(event.did, event.time_us, displayName, description)
            .catch((error: unknown) => {
              logger.error(`Error checking profile description for ${event.did}:`, error);
            })
        );
        
        tasks.push(
          checkDisplayName(event.did, event.time_us, displayName, description)
            .catch((error: unknown) => {
              logger.error(`Error checking profile display name for ${event.did}:`, error);
            })
        );

        if (event.commit.record.joinedViaStarterPack) {
          tasks.push(
            checkStarterPack(event.did, event.time_us, event.commit.record.joinedViaStarterPack.uri)
              .catch((error: unknown) => {
                logger.error(`Error checking starter pack for ${event.did}:`, error);
              })
          );
        }

        // Wait for all tasks to complete
        if (tasks.length > 0) {
          void Promise.allSettled(tasks);
        }
      }
    } catch (error: unknown) {
      logger.error(`Error processing profile creation event for ${event.did}:`, error);
    }
  },
);

jetstream.onCreate(
  'app.bsky.graph.starterpack',
  (event: CommitCreateEvent<'app.bsky.graph.starterpack'>) => {
    try {
      const atURI = `at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`;
      const { name, description } = event.commit.record;

      void checkNewStarterPack(
        event.did,
        event.time_us,
        atURI,
        event.commit.cid,
        name,
        description,
      ).catch((error: unknown) => {
        logger.error(`Error checking new starter pack for ${event.did}:`, error);
      });
    } catch (error: unknown) {
      logger.error(`Error processing starter pack creation event for ${event.did}:`, error);
    }
  },
);

jetstream.onUpdate(
  'app.bsky.graph.starterpack',
  (event: CommitUpdateEvent<'app.bsky.graph.starterpack'>) => {
    try {
      const atURI = `at://${event.did}/app.bsky.feed.post/${event.commit.rkey}`;
      const { name, description } = event.commit.record;

      void checkNewStarterPack(
        event.did,
        event.time_us,
        atURI,
        event.commit.cid,
        name,
        description,
      ).catch((error: unknown) => {
        logger.error(`Error checking updated starter pack for ${event.did}:`, error);
      });
    } catch (error: unknown) {
      logger.error(`Error processing starter pack update event for ${event.did}:`, error);
    }
  },
);

// Check for handle updates
jetstream.on('identity', (event: IdentityEvent) => {
  try {
    if (event.identity.handle) {
      void checkHandle(event.identity.did, event.identity.handle, event.time_us)
        .catch((error: unknown) => {
          logger.error(`Error checking handle for ${event.identity.did}:`, error);
        });
    }
  } catch (error: unknown) {
    logger.error(`Error processing identity event for ${event.identity.did}:`, error);
  }
});

// Start metrics server with error handling
let metricsServer: ReturnType<typeof startMetricsServer> | undefined;
try {
  metricsServer = startMetricsServer(METRICS_PORT);
  logger.info(`Metrics server started on port ${METRICS_PORT.toString()}`);
} catch (error: unknown) {
  logger.error('Failed to start metrics server:', error);
  process.exit(1);
}

/* labelerServer.app.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    logger.error("Error starting server: %s", error);
  } else {
    logger.info(`Labeler server listening on ${address}`);
  }
});*/

// Start jetstream with error handling
try {
  jetstream.start();
  logger.info('Jetstream started successfully');
} catch (error: unknown) {
  logger.error('Failed to start jetstream:', error);
  process.exit(1);
}

function shutdown() {
  try {
    logger.info('Shutting down gracefully...');
    if (jetstream.cursor) {
      fs.writeFileSync('cursor.txt', jetstream.cursor.toString(), 'utf8');
    }
    jetstream.close();
    if (metricsServer) {
      metricsServer.close(() => {
        logger.info('Metrics server closed');
      });
    }
    logger.info('Shutdown completed successfully');
  } catch (error: unknown) {
    logger.error('Error shutting down gracefully:', error);
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Don't exit the process for unhandled rejections, just log them
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
