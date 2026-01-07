# `limits.ts`

This module implements a sophisticated rate limiting and concurrency management system for all outgoing API calls. Its primary goal is to ensure the application respects the API rate limits imposed by the Bluesky PDS while maximizing throughput.

## State Management

-   **`rateLimitState`**: A module-level object that holds the current understanding of the API rate limit. It includes:
    -   `limit`: The total number of requests allowed in the current window.
    -   `remaining`: The number of requests left in the current window.
    -   `reset`: A Unix timestamp (in seconds) indicating when the window will reset.
    -   `policy`: The rate limit policy string from the API header.
-   It is initialized with conservative default values but is designed to be dynamically updated by the `updateRateLimitState` function.

## Constants

-   **`SAFETY_BUFFER`**: The number of requests to keep in reserve. The system will pause and wait for the rate limit window to reset only when the `remaining` count drops to this level.
-   **`CONCURRENCY`**: The maximum number of API requests that can be in-flight simultaneously.

## Metrics

This module is heavily instrumented with Prometheus metrics to provide visibility into its performance:

-   **`rateLimitWaitsTotal` (Counter)**: Counts how many times the system had to pause due to hitting the `SAFETY_BUFFER`.
-   **`rateLimitWaitDuration` (Histogram)**: Measures the duration of each pause.
-   **`rateLimitRemaining` (Gauge)**: Tracks the current value of `rateLimitState.remaining`.
-   **`rateLimitTotal` (Gauge)**: Tracks the current value of `rateLimitState.limit`.
-   **`concurrentRequestsGauge` (Gauge)**: Shows the number of currently active, concurrent API requests.

## Key Functions

### `updateRateLimitState(state: Partial<RateLimitState>): void`

-   **Purpose**: To update the module's internal `rateLimitState`.
-   **Usage**: This function is called by the `customFetch` wrapper in `agent.ts` every time an API response with rate limit headers is received.
-   **Logic**: It merges the new partial state with the existing state and updates the corresponding Prometheus gauges.

### `awaitRateLimit(): Promise<void>`

-   **Purpose**: To pause execution if the rate limit is critically low.
-   **Logic**:
    1.  It checks if `rateLimitState.remaining` is less than or equal to the `SAFETY_BUFFER`.
    2.  If it is, it calculates the time remaining until the next `reset`.
    3.  It then waits for that duration using a `setTimeout` wrapped in a `Promise`.
    4.  It logs the wait and records metrics about the wait duration.

### `limit<T>(fn: () => Promise<T>): Promise<T>`

-   **Purpose**: This is the main exported function used to wrap all API calls. It manages both concurrency and rate limiting.
-   **Usage**: Every function that makes an API call (e.g., in `accountModeration.ts` and `moderation.ts`) is wrapped in `limit(async () => { ... })`.
-   **Logic**:
    1.  **Concurrency**: It uses the `p-ratelimit` library (`concurrencyLimiter`) to ensure that no more than `CONCURRENCY` instances of the wrapped function can run at the same time.
    2.  **Rate Limiting**: Once a "slot" in the concurrency limiter is acquired, it calls `await awaitRateLimit()` to potentially pause if the API rate limit is nearly exhausted.
    3.  **Execution**: After the potential pause, it executes the provided function `fn`.
    4.  **Metrics**: It increments and decrements the `concurrentRequestsGauge` to track the number of active requests.

## Dependencies

-   **`p-ratelimit`**: A library used to control the concurrency of promise-based functions.
-   **`prom-client`**: For creating and managing Prometheus metrics.
-   **`./logger.js`**: For logging warnings and debug information.
