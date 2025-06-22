# Skywatch Automod

This project provides tools for automating moderation of the Bluesky social network. It listens to the Bluesky firehose stream, analyzes various types of content against user-defined rules, and performs moderation actions such as applying labels, reporting content, or leaving comments.

## Features

- **Real-time Moderation:** Monitors the Bluesky firehose in real-time.
- **Content-Aware Analysis:** Analyzes posts, user profiles (display names, descriptions), and handles
- **Flexible Rule Engine:** Uses regular expressions for defining moderation checks.
- **Variety of Actions:** Can apply labels, create reports (for posts or accounts), and post comments on accounts.
- **Configurable:** Highly configurable through environment variables and a central constants file.
- **Allowlisting:** Supports allowlisting for DIDs and text patterns to reduce false positives.
- **URL Unshortening:** Automatically resolves shortened URLs in posts before checking them.
- **Monitoring:** Exposes a Prometheus metrics endpoint to monitor its activity. (untested)
- **Resilient:** Persists the firehose cursor to gracefully handle restarts without missing events.

## How It Works

The application connects to the Bluesky firehose and subscribes to a set of collections (e.g., posts, profiles). When a new event is received, it is passed through a series of checks defined in `src/constants.ts`. These checks are categorized by content type:

- `POST_CHECKS`: For post content and links.
- `HANDLE_CHECKS`: For user handles.
- `PROFILE_CHECKS`: For user display names and descriptions.

If the content matches a check's criteria (and is not excluded by an allowlist), a corresponding moderation action is triggered. These actions (labeling, reporting, etc.) are performed using the Bluesky API.

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- `bun` package manager
- A Bluesky account for the bot.
- A Bluesky labeler account

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd skywatch-automod-public
bun install
```

### Configuration

There are two main configuration files you need to set up:

- **Checks (`src/constants.ts`):**
  This file defines the rules for your automod. You need to create it by copying the example file:

  ```bash
  cp src/constants.ts.example src/constants.ts
  ```

  Then, edit `src/constants.ts` to define your own checks. For detailed instructions on how to create checks, please see [developing_checks.md](./src/developing_checks.md).

- **Environment Variables (`.env`):**
  This file contains credentials and other runtime configuration. You will need to create a `.env` file and populate it with your specific values. You can use `.env.example` as a reference if it exists in the

### 3. Running the Application

Once configured, you can start the automod with:

```bash
bun run start
```

### 4. Running with Docker

You can also build and run the application as a Docker container.

```bash
# Build the container
docker build -pull -t skywatch-automod .

# Run the container
docker run -d -p 4101:4101 skywatch-automod
```

Make sure your `.env` file is present when building the Docker image, as it will be copied into the container.

#### Configuration Variables

The following environment variables are used for configuration:

| Variable                 | Description                                                      | Default                                   |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------------------- |
| `DID`                    | The DID of your moderation service for atproto-proxy headers.    | `""`                                      |
| `OZONE_URL`              | The URL of the Ozone service.                                    | `""`                                      |
| `OZONE_PDS`              | The Public Downstream Service for Ozone.                         | `""`                                      |
| `BSKY_HANDLE`            | The handle (username) of the bot's Bluesky account.              | `""`                                      |
| `BSKY_PASSWORD`          | The app password for the bot's Bluesky account.                  | `""`                                      |
| `HOST`                   | The host on which the server runs.                               | `127.0.0.1`                               |
| `PORT`                   | The port for the main application (currently unused).            | `4100`                                    |
| `METRICS_PORT`           | The port for the Prometheus metrics server.                      | `4101`                                    |
| `FIREHOSE_URL`           | The WebSocket URL for the Bluesky firehose.                      | `wss://jetstream.atproto.tools/subscribe` |
| `CURSOR_UPDATE_INTERVAL` | How often to save the firehose cursor to disk (in milliseconds). | `60000`                                   |
| `LABEL_LIMIT`            | (Optional) API call limit for labeling.                          | `undefined`                               |
| `LABEL_LIMIT_WAIT`       | (Optional) Wait time when label limit is hit.                    | `undefined`                               |
| `LOG_LEVEL`              | The logging level.                                               | `info`                                    |
