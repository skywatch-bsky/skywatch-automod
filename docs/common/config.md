# `config.ts`

This module is responsible for loading and exporting all configuration variables for the application. It uses the `dotenv` library to load environment variables from a `.env` file into `process.env`.

It provides default values for most variables, ensuring the application can run in a development environment with minimal setup.

## Configuration Variables

-   **`MOD_DID`**: The DID of the moderation account that will be performing the labeling and reporting actions.
    -   Loaded from `process.env.DID`.
    -   Default: `""`

-   **`OZONE_URL`**: The URL for the Ozone service. (Note: This variable is exported but does not appear to be used in the current codebase).
    -   Loaded from `process.env.OZONE_URL`.
    -   Default: `""`

-   **`OZONE_PDS`**: The hostname of the PDS (Personal Data Server) where the Ozone service is hosted. This is used to configure the `AtpAgent`.
    -   Loaded from `process.env.OZONE_PDS`.
    -   Default: `""`

-   **`BSKY_HANDLE`**: The handle (username) of the moderation bot account used for logging in.
    -   Loaded from `process.env.BSKY_HANDLE`.
    -   Default: `""`

-   **`BSKY_PASSWORD`**: The application password for the moderation bot account.
    -   Loaded from `process.env.BSKY_PASSWORD`.
    -   Default: `""`

-   **`HOST`**: The hostname that the metrics server will bind to.
    -   Loaded from `process.env.HOST`.
    -   Default: `"0.0.0.0"`

-   **`METRICS_PORT`**: The port for the Prometheus metrics server.
    -   Loaded from `process.env.METRICS_PORT`.
    -   Default: `4101`

-   **`FIREHOSE_URL`**: The WebSocket URL for the Bluesky firehose (Jetstream) service.
    -   Loaded from `process.env.FIREHOSE_URL`.
    -   Default: `"wss://jetstream.atproto.tools/subscribe"`

-   **`PLC_URL`**: The hostname of the PLC directory (DID registry) used for resolving `did:plc:` creation dates.
    -   Loaded from `process.env.PLC_URL`.
    -   Default: `"plc.directory"`

-   **`WANTED_COLLECTION`**: An array of AT Protocol collection names that the firehose client should subscribe to. The bot will only receive events for these collections.
    -   Default: `["app.bsky.feed.post", "app.bsky.actor.defs", "app.bsky.actor.profile"]`

-   **`CURSOR_UPDATE_INTERVAL`**: The interval in milliseconds at which the firehose cursor position is saved to disk.
    -   Loaded from `process.env.CURSOR_UPDATE_INTERVAL`.
    -   Default: `60000` (1 minute)

-   **`LABEL_LIMIT`** and **`LABEL_LIMIT_WAIT`**: These appear to be legacy or unused configuration variables related to a previous rate-limiting implementation. They are destructured from `process.env` but are not used elsewhere in the code.

-   **`REDIS_URL`**: The connection URL for the Redis server.
    -   Loaded from `process.env.REDIS_URL`.
    -   Default: `"redis://redis:6379"`
