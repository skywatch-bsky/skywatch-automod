# skywatch-automod

Automated moderation tooling for the Bluesky independent labeler skywatch.blue. Monitors the Bluesky firehose and applies labels based on configured moderation rules.

## Setup

Configure environment:

```bash
cp .env.example .env
# Edit .env with your credentials and configuration
```

Required environment variables:
- `BSKY_HANDLE` - Bluesky account handle
- `BSKY_PASSWORD` - Account password
- `MOD_DID` - Moderator DID
- `OZONE_PDS` - Ozone PDS URL
- `FIREHOSE_URL` - Jetstream firehose URL

Create cursor file (optional but recommended):

```bash
touch cursor.txt
```

## Running

Production:

```bash
docker compose up -d
```

Development mode with auto-reload:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

The service runs on port 4101 (metrics endpoint). Redis and Prometheus are included in the compose stack.

## Authentication

The application authenticates with Bluesky on startup and retries up to 3 times on failure. If all attempts fail, the application exits. Sessions are cached in `.session` (gitignored).

## Testing

```bash
bun test          # Watch mode
bun test:run      # Single run
bun test:coverage # With coverage
```

## How It Works

Monitors the Bluesky firehose via Jetstream and analyzes posts, profiles, and handles against configured moderation rules. When criteria are met, applies appropriate labels or creates moderation reports.

For developing custom checks, see [developing_checks.md](./rules/developing_checks.md).
