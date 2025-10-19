# skywatch-tools

This is a rewrite of the original skywatch-tools project in TypeScript. The original project was written in Bash. The purpose of this project is to automate the moderation by the Bluesky independent labeler skywatch.blue

## Installation and Setup

To install dependencies:

```bash
bun i
```

Modify .env.example with your own values and rename it to .env

```bash
bun run start
```

To run with Docker Compose (recommended):

```bash
# Create required files
touch cursor.txt
cp .env.example .env
# Edit .env with your values

# Start services (automod + Redis)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

To run standalone Docker container (you'll need to provide your own Redis):

```bash
docker build -t skywatch-tools .
docker run -d \
  -p 4101:4101 \
  -e REDIS_URL=redis://your-redis-host:6379 \
  --env-file .env \
  -v $(pwd)/cursor.txt:/app/cursor.txt \
  skywatch-tools
```

## Brief overview

Currently this tooling does one thing. It monitors the bluesky firehose and analyzes content for phrases which fit Skywatch's criteria for moderation. If the criteria is met, it can automatically label the content with the appropriate label.

In certain cases, where regexp will create too many false positives, it will flag content as a report against related to the account, so that it can be reviewed later.

For information on how to set-up your own checks, please see the [developing_checks.md](./src/developing_checks.md) file.

## Post Label Tracking

The system includes automated tracking of labeled posts to detect repeat offenders. When configured labels accumulate on posts from the same account, the system automatically applies account-level actions.

### Configuration

**Redis Setup**

Redis is required for tracking labeled posts. Set the `REDIS_URL` environment variable:

```bash
REDIS_URL=redis://localhost:6379
```

**Tracked Labels Configuration**

Create `tracked-labels.json` in the project root to configure which labels to track:

```json
[
  {
    "label": "spam",
    "threshold": 5,
    "accountLabel": "repeat-spammer",
    "accountComment": "Account has posted spam content multiple times",
    "windowDays": 30,
    "reportAcct": true,
    "commentAcct": false
  }
]
```

**Configuration Fields:**

- `label` (required): The post label to track
- `threshold` (required): Number of labeled posts before triggering account action
- `accountLabel` (required): Label to apply to the account when threshold is met
- `accountComment` (required): Comment text for account reports/comments
- `windowDays` (optional): Only count posts within this many days (omit for all-time tracking)
- `reportAcct` (optional): Whether to report the account when threshold is met (default: false)
- `commentAcct` (optional): Whether to add a comment to the account when threshold is met (default: false)

See `tracked-labels.example.json` for complete examples.

### How It Works

1. When a post is labeled with a tracked label, the system records it in Redis
2. The system maintains a count of labeled posts per account per label
3. When the threshold is reached, the system automatically:
   - Labels the account with the configured `accountLabel`
   - Optionally reports the account (if `reportAcct: true`)
   - Optionally adds a comment (if `commentAcct: true`)
4. If `windowDays` is set, only posts within that time window are counted

### Data Storage

- Redis keys follow the pattern: `post-labels:{did}:{label}`
- Post URIs are stored in sorted sets with timestamps as scores
- Keys automatically expire after 30 days (sliding window)
- Old posts are pruned based on `windowDays` configuration

## Monitoring and Observability

The system exposes Prometheus metrics and health check endpoints for monitoring.

### Metrics Endpoint

Available at `http://localhost:4001/metrics` (configurable via `METRICS_PORT` environment variable)

**Custom Metrics:**

- `posts_tracked_total` - Counter for posts tracked by label type
  - Labels: `label_type`

- `thresholds_met_total` - Counter for label thresholds met
  - Labels: `label_type`, `account_label`

- `account_actions_triggered_total` - Counter for account-level actions triggered
  - Labels: `action_type` (label|report|comment), `label_type`, `success` (true|false)

- `redis_connected` - Gauge for Redis connection status (1=connected, 0=disconnected)

**Example Prometheus queries:**

```promql
# Rate of posts being tracked per label
rate(posts_tracked_total[5m])

# How many times each threshold has been met
thresholds_met_total

# Success rate of account labeling
sum(rate(account_actions_triggered_total{action_type="label",success="true"}[5m])) / sum(rate(account_actions_triggered_total{action_type="label"}[5m]))
```

### Health Check Endpoint

Available at `http://localhost:4001/health`

Returns HTTP 200 when healthy, HTTP 503 when unhealthy.

**Response format:**

```json
{
  "status": "healthy",
  "redis": "connected",
  "timestamp": "2025-01-18T12:34:56.789Z"
}
```

Use this endpoint for:
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Uptime monitoring systems
