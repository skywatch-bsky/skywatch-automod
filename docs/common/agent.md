# `agent.ts`

This module is central to the application's ability to interact with the Bluesky/AT Protocol network. It manages the authenticated session, handles rate limiting, and provides a global, ready-to-use `AtpAgent` instance for all other modules to use.

## Global `undici` Dispatcher

-   At the top level, `setGlobalDispatcher` is called to configure `undici` (the HTTP client used by `@atproto/api`) with custom timeouts for connection and keep-alive, improving network resilience.

## `customFetch` Wrapper

-   A custom `fetch` function is created to intercept all outgoing API requests made by the `AtpAgent`.
-   **Rate Limit Handling**: Its primary purpose is to inspect the response headers for `ratelimit-` headers (`limit`, `remaining`, `reset`, `policy`).
-   When these headers are found, it calls `updateRateLimitState` from the `limits.js` module to dynamically update the application's understanding of the current API rate limit status.

## `agent` Instance

-   `export const agent = new AtpAgent(...)`: This is the main export of the module. It's a single, global instance of `AtpAgent` that all other parts of the application import and use to make authenticated API calls.
-   It is configured with the `OZONE_PDS` as its service endpoint and uses the `customFetch` wrapper.

## Session Management and Authentication

The module implements a robust, multi-layered authentication and session management strategy.

### `performLogin(): Promise<boolean>`

-   Performs a fresh login to the Bluesky API using the `BSKY_HANDLE` and `BSKY_PASSWORD` from the configuration.
-   If successful, it saves the new session data using `saveSession` and schedules the next session refresh by calling `scheduleSessionRefresh`.
-   Returns `true` on success and `false` on failure.

### `refreshSession(): Promise<void>`

-   Uses the existing `agent.session` data to refresh the JWTs (JSON Web Tokens).
-   If successful, it saves the new session and schedules the next refresh.
-   If refreshing fails (e.g., the refresh token has expired), it falls back to calling `performLogin` to get a completely new session.

### `scheduleSessionRefresh(): void`

-   Calculates 80% of the JWT's typical 2-hour lifetime.
-   Uses `setTimeout` to call `refreshSession` automatically before the current session expires, ensuring the agent remains logged in continuously.

### `authenticate(): Promise<boolean>`

-   This is the core authentication logic.
-   It first tries to load a session from the file system using `loadSession`.
-   If a saved session exists, it attempts to resume it with `agent.resumeSession` and verifies it with a lightweight `getProfile` call. If successful, it returns `true`.
-   If resuming fails or no saved session exists, it calls `performLogin` to authenticate from scratch.

### `authenticateWithRetry(): Promise<void>`

-   This function wraps `authenticate` with a retry mechanism.
-   It will attempt to authenticate up to `MAX_LOGIN_RETRIES` (3) times with a delay between attempts.
-   If all attempts fail, it logs a fatal error and exits the application (`process.exit(1)`), as the bot cannot function without being authenticated.
-   It uses a `loginPromise` to ensure that if multiple parts of the app trigger authentication at once, the process only runs one time.

## Exports

-   **`agent`**: The global `AtpAgent` instance.
-   **`login`**: A function that can be called to initiate the authentication-with-retry process. This is called once at application startup in `main.ts`.
-   **`isLoggedIn`**: A `Promise` that resolves to `true` once the initial authentication is complete. Other modules can `await isLoggedIn` to ensure they don't try to make API calls before the agent is ready.

## Dependencies

-   **`@atproto/api`**: For the `AtpAgent`.
-   **`undici`**: For configuring the global HTTP client.
-   **`./config.js`**: Provides credentials (`BSKY_HANDLE`, `BSKY_PASSWORD`) and the service URL (`OZONE_PDS`).
-   **`./limits.js`**: Provides `updateRateLimitState` for the rate limit handling.
-   **`./logger.js`**: For logging.
-   **`./session.js`**: For loading and saving session data to the filesystem.
