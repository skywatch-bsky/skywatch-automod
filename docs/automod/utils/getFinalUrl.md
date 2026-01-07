# `getFinalUrl.ts`

This utility module provides a robust function for resolving a URL to its final destination, following any redirects. This is a critical security and moderation tool, as it allows the application to see the real URL hidden behind a link shortener.

## Key Function

### `getFinalUrl(url: string): Promise<string>`

This function takes a URL string and attempts to resolve it to its final destination.

**Parameters:**

-   `url`: The initial URL to resolve.

**Returns:**

-   A `Promise` that resolves to the final URL string after all redirects have been followed.
-   If the resolution fails (due to network errors, timeouts, etc.), the promise will reject with the underlying error.

**Logic:**

The function employs a two-stage fallback strategy to be both efficient and robust.

1.  **HEAD Request (Primary Method)**:
    -   It first attempts to resolve the URL using a `HEAD` request. This is the preferred method because it's faster and uses less bandwidth, as it only fetches the headers of the response, not the full content.
    -   The `redirect: "follow"` option tells the `fetch` API to automatically follow any HTTP 3xx redirects.
    -   A 15-second timeout is implemented using an `AbortController`. If the request takes too long, it will be aborted.
    -   A custom `User-Agent` header is sent to identify the bot.
    -   If the `HEAD` request is successful, the `response.url` property will contain the final URL after all redirects, which is then returned.

2.  **GET Request (Fallback Method)**:
    -   If the initial `HEAD` request fails for any reason (e.g., the server blocks `HEAD` requests, a network error occurs), the `catch` block is executed.
    -   Inside the `catch` block, it logs that the `HEAD` request failed and then retries the resolution using a `GET` request.
    -   The `GET` request follows the same logic: `redirect: "follow"`, a 15-second timeout, and a custom `User-Agent`.
    -   If the `GET` request is successful, it returns the final `response.url`.

3.  **Error Handling**:
    -   If the fallback `GET` request also fails, the function will log a warning and then re-throw the error, causing the promise to be rejected.
    -   It specifically checks for `AbortError` to log a more informative "Timeout resolving URL" message.
    -   It serializes error information to ensure structured logs.

## Dependencies

-   **`../logger.js`**: For logging debug messages and warnings.
