# `session.ts`

This module provides simple file-based session persistence. It allows the application to save its authentication session to disk and load it again on the next startup. This avoids the need to perform a fresh login every time the bot is restarted, making startup faster and reducing unnecessary authentication requests.

## `SESSION_FILE_PATH`

-   A constant that defines the path to the session file: `.session` in the current working directory.

## `SessionData` Interface

-   Defines the structure of the session object that is saved to and loaded from the file. It includes essential fields like `accessJwt`, `refreshJwt`, `did`, and `handle`.

## Key Functions

### `loadSession(): SessionData | null`

-   **Purpose**: To load and validate the session from the `.session` file.
-   **Logic**:
    1.  It checks if the `.session` file exists. If not, it returns `null`.
    2.  It reads the file content, parses it as JSON, and casts it to the `SessionData` type.
    3.  It performs a basic validation to ensure the essential JWT and DID fields are present. If not, it logs a warning and returns `null`.
    4.  If the session is loaded and valid, it returns the `SessionData` object.
-   **Error Handling**: If any part of the process fails (e.g., file read error, JSON parse error), it logs the error and returns `null`, forcing a fresh authentication.

### `saveSession(session: SessionData): void`

-   **Purpose**: To save the current authentication session to the `.session` file.
-   **Usage**: This is called from `agent.ts` whenever a new session is created (after a fresh login) or an existing session is successfully refreshed.
-   **Logic**:
    1.  It serializes the `session` object into a formatted JSON string.
    2.  It writes the string to the `.session` file.
    3.  It sets the file permissions to `0o600` (`-rw-------`) using `chmodSync` to ensure the session file, which contains sensitive tokens, is only readable and writable by the user running the application.

### `clearSession(): void`

-   **Purpose**: To delete the `.session` file from disk.
-   **Usage**: This function is exported but does not appear to be actively used in the current application flow. It could be used to implement a "logout" feature.
-   **Logic**: It checks if the file exists and, if so, deletes it using `unlinkSync`.

## Dependencies

-   **`node:fs`**: Provides the file system functions for reading, writing, deleting, and changing permissions of the session file.
-   **`node:path`**: Used to construct the absolute path to the session file.
-   **`./logger.js`**: For logging session management activities and errors.
