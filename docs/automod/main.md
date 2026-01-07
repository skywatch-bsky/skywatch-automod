# `main.ts`

This is the main entry point for the Skywatch automoderator. It sets up the connection to the Bluesky firehose, listens for events, and dispatches them to the appropriate rule-checking modules.

## Initialization

1.  **Cursor Management**:
    -   On startup, it attempts to read a `cursor` value from `cursor.txt`. The cursor represents the last processed event timestamp, allowing the bot to resume from where it left off.
    -   If `cursor.txt` does not exist, it initializes the cursor to the current time.
    -   The cursor is periodically updated and written back to `cursor.txt` every `CURSOR_UPDATE_INTERVAL` milliseconds.

2.  **Jetstream (Firehose) Connection**:
    -   It creates a `Jetstream` instance, which connects to the Bluesky firehose at the `FIREHOSE_URL`.
    -   It subscribes to a specific set of collections defined in `WANTED_COLLECTION` (e.g., posts, profiles).
    -   It sets up event listeners for `open`, `close`, and `error` events to log the connection status.

3.  **Redis and Authentication**:
    -   It connects to the Redis server using `connectRedis`.
    -   It authenticates with the Bluesky API using the `login` function from `../common/agent.js`.
    -   Once authentication is complete, it starts the Jetstream connection.

4.  **Metrics Server**:
    -   It starts an Express server on `METRICS_PORT` to expose Prometheus metrics.

## Event Handling

The module listens for different types of events from the firehose and triggers the corresponding check functions.

### Post Creation (`jetstream.onCreate("app.bsky.feed.post", ...)`

This is the most complex event handler. When a new post is created, it performs a series of checks:

-   **Account Age**:
    -   If the post is a reply, it calls `checkAccountAge` to see if the author's account is new and if they are replying to a monitored DID.
    -   If the post is a quote post, it also calls `checkAccountAge` to check for interactions with monitored DIDs or posts.
-   **Facets (Rich Text Features)**:
    -   If the post has `facets`, it calls `checkFacetSpam` to detect hidden mentions.
    -   If any facet is a link, it extracts the URL and passes it to `checkPosts` for further analysis.
-   **Post Text**:
    -   If the post has text content, it passes the text to `checkPosts`.
-   **Embeds**:
    -   If the post has an external link embed (`app.bsky.embed.external`), it extracts the URL and passes it to `checkPosts`.
    -   If the post has a record with media embed that contains an external link, it also extracts the URL for `checkPosts`.

### Profile Updates (`jetstream.onUpdate` and `jetstream.onCreate` for `"app.bsky.actor.profile"`)

-   When a user's profile is created or updated, it checks if the `displayName` or `description` has changed.
-   If so, it calls `checkProfile` to run moderation rules against the new profile content.

### Handle Updates (`jetstream.on("identity", ...)`

-   When a user's handle changes (or is first seen), it receives an `identity` event.
-   It calls `checkHandle` to run moderation rules against the new handle.

### Starter Pack Creation (`jetstream.onCreate("app.bsky.graph.starterpack", ...)`)

-   When a user creates a new starter pack, it receives a creation event.
-   It calls `checkStarterPackThreshold` to check if the account has exceeded the threshold for creating starter packs within a time window.
-   This is useful for detecting follow-farming or coordinated campaign behaviour.

## Graceful Shutdown

-   The module listens for `SIGINT` and `SIGTERM` signals (e.g., from Ctrl+C or a process manager).
-   The `shutdown` function is called to:
    -   Save the latest cursor to `cursor.txt`.
    -   Close the Jetstream connection.
    -   Close the metrics server.
    -   Disconnect from Redis.

## Dependencies

-   **`@skyware/jetstream`**: For connecting to and handling events from the Bluesky firehose.
-   **`./agent.js`**: For authenticating with the Bluesky API.
-   **`./config.js`**: Provides configuration constants like URLs, ports, and intervals.
-   **`./logger.js`**: For structured logging.
-   **`./metrics.js`**: For starting the metrics server.
-   **`./redis.js`**: For connecting to and disconnecting from Redis.
-   **`./starterPackThreshold.js`**: For checking starter pack creation thresholds.
-   **Rule Modules (`./rules/**/*.ts`)**: Contains the actual moderation logic (`checkAccountAge`, `checkFacetSpam`, `checkHandle`, `checkPosts`, `checkProfile`).
