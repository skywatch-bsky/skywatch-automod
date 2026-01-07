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
- `DID` - Moderator DID
- `OZONE_URL` - Ozone service URL
- `OZONE_PDS` - Ozone PDS hostname

Optional environment variables:
- `FIREHOSE_URL` - Jetstream firehose URL (default: `wss://jetstream.atproto.tools/subscribe`)
- `REDIS_URL` - Redis connection URL (default: `redis://redis:6379`)
- `HOST` - Metrics server bind address (default: `0.0.0.0`)
- `METRICS_PORT` - Metrics server port (default: `4101`)
- `PLC_URL` - PLC directory hostname (default: `plc.directory`)
- `CURSOR_UPDATE_INTERVAL` - Cursor save interval in ms (default: `60000`)
- `LABEL_LIMIT` - Rate limit for label operations
- `LABEL_LIMIT_WAIT` - Wait time for rate limiter

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

Monitors the Bluesky firehose via Jetstream and analyzes:
- **Posts** - Text content and embedded URLs
- **Profiles** - Display names and descriptions
- **Handles** - Username patterns
- **Starter packs** - Creation activity

When criteria are met, applies appropriate labels or creates moderation reports.

### Threshold Systems

Beyond pattern matching, the automod supports account-level threshold enforcement:

- **Account threshold** - Labels accounts that accumulate multiple post-level violations within a rolling time window
- **Starter pack threshold** - Labels accounts that create too many starter packs within a time window (useful for detecting follow-farming)

Both systems use Redis for time-windowed tracking and support configurable actions (label, report, comment).

For developing custom checks, see [developing_checks.md](./rules/developing_checks.md).
