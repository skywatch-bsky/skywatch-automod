# `logger.ts`

This module provides a single, globally shared logger instance for the entire application. It uses the `pino` library, which is a high-performance, JSON-based logger.

## Configuration

The `pino` logger is configured with the following options:

-   **`level`**: The minimum log level to output.
    -   It is configured from the `LOG_LEVEL` environment variable.
    -   If `LOG_LEVEL` is not set, it defaults to `"info"`. This means `logger.debug()` messages will be ignored unless the level is explicitly set to `"debug"`.

-   **`formatters.level`**: This custom formatter ensures that the log level is output as a JSON property (e.g., `{"level": "info"}`).

-   **`timestamp`**: This custom function formats the timestamp as an ISO 8601 string within a JSON property (e.g., `,"time":"2025-11-12T12:00:00.000Z"`).

-   **`base: undefined`**: This option removes the default `pid` (process ID) and `hostname` properties from the log output, keeping the logs cleaner.

## `logger` Instance

-   `export const logger = pino(...)`: This creates and exports the singleton logger instance that all other modules import and use.

## Example Usage

```typescript
import { logger } from "./logger.js";

logger.info({ process: "MAIN", status: "starting" }, "Application is starting up");
// Output: {"level":"info","time":"...","process":"MAIN","status":"starting","msg":"Application is starting up"}

logger.debug({ did: "did:plc:123" }, "Checking user");
// Output (only if LOG_LEVEL=debug): {"level":"debug","time":"...","did":"did:plc:123","msg":"Checking user"}

logger.error({ error: new Error("Something failed") }, "An error occurred");
// Output: {"level":"error","time":"...","error":{...},"msg":"An error occurred"}
```

## Dependencies

-   **`pino`**: The underlying logging library.
