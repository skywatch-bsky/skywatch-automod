# Implementation Plan: Database-backed Label Tracking System

## Problem Statement

Accounts are being labeled multiple times because the autolabeler cannot detect existing labels on repositories. This leads to:

- Duplicate entries in lists
- Difficult removal processes
- Potential harassment feeling for users on listifications.app

## Solution Overview

Implement a PostgreSQL database to store and track labels for DIDs/AT-URIs, with a synchronization mechanism via the Ozone label subscription stream.

## Architecture Design

### Database Schema

```sql
-- Core labels table
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    did VARCHAR(255) NOT NULL,
    at_uri TEXT,
    label_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    negated BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'automod', -- 'automod' or 'ozone'
    UNIQUE(did, at_uri, label_value)
);

-- Index for fast lookups
CREATE INDEX idx_labels_did ON labels(did);
CREATE INDEX idx_labels_at_uri ON labels(at_uri);
CREATE INDEX idx_labels_value ON labels(label_value);
CREATE INDEX idx_labels_negated ON labels(negated);

-- Label history for audit trail
CREATE TABLE label_history (
    id SERIAL PRIMARY KEY,
    did VARCHAR(255) NOT NULL,
    at_uri TEXT,
    label_value VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'created', 'negated', 'updated'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),
    metadata JSONB
);
```

### Component Architecture

#### 1. Database Service (`src/services/database.ts`)

- Connection pooling with pg library
- Type-safe query construction using Kysely
- CRUD operations for labels
- Batch operations for efficiency
- Transaction support for atomic updates

#### 2. Label Sync Service (`src/services/labelSync.ts`)

- WebSocket connection to `com.atproto.label.subscribeLabels`
- DAG-CBOR decoding using @atcute
- Stream processing and backpressure handling
- Reconnection logic with exponential backoff

#### 3. Label Manager (`src/services/labelManager.ts`)

- High-level API for label operations
- Duplicate detection logic
- Label conflict resolution
- Integration with existing automod workflow

## Implementation Steps

### Phase 1: Database Infrastructure (Days 1-2)

1. **Set up PostgreSQL**

   - Add database connection config to `.env` and integrate with `src/validateEnv.ts`
   - Update `compose.yml` with PostgreSQL service for local development
   - Create migration system
   - Implement connection pooling

2. **Create Database Service**
   ```typescript
   // src/services/database.ts
   export class DatabaseService {
     async checkLabelExists(
       did: string,
       atUri?: string,
       labelValue?: string,
     ): Promise<boolean>;
     async addLabel(label: LabelRecord): Promise<void>;
     async negateLabel(
       did: string,
       atUri?: string,
       labelValue?: string,
     ): Promise<void>;
     async getLabelsForDid(did: string): Promise<LabelRecord[]>;
   }
   ```

### Phase 2: Label Subscription Stream (Days 3-4)

1. **Install Dependencies**

   ```json
   {
     "dependencies": {
       "@atcute/client": "^latest",
       "pg": "^8.11.0",
       "@types/pg": "^8.11.0",
       "ws": "^8.14.0",
       "kysely": "^0.27.0"
     }
   }
   ```

2. **Implement WebSocket Connection**

   ```typescript
   // src/services/labelSync.ts
   export class LabelSyncService {
     private ws: WebSocket;
     private reconnectAttempts = 0;

     async connect(): Promise<void>;
     async handleMessage(data: Buffer): Promise<void>;
     async processLabel(label: DecodedLabel): Promise<void>;
   }
   ```

3. **DAG-CBOR Decoding**
   - Use @atcute for decoding stream messages
   - Handle both label creation and negation events
   - Process seq values for ordering

### Phase 3: Integration with Automod (Days 5-6)

1. **Modify Label Creation Flow**

   ```typescript
   // Before adding a label
   const exists = await db.checkLabelExists(did, atUri, labelValue);
   if (!exists) {
     await createLabel(did, atUri, labelValue);
     await db.addLabel({ did, atUri, labelValue });
   }
   ```

2. **Add Deduplication Logic**
   - Check database before creating new labels
   - Log skipped duplicates for monitoring
   - Add metrics for duplicate prevention

### Phase 4: Testing & Monitoring (Day 7)

1. **Unit Tests**

   - Database operations
   - Label sync parsing
   - Deduplication logic

2. **Integration Tests**

   - End-to-end label creation flow
   - WebSocket reconnection scenarios
   - Database transaction handling

3. **Monitoring**
   - Label creation metrics
   - Duplicate prevention stats
   - Sync lag monitoring

## Configuration Requirements

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skywatch_labels
DATABASE_POOL_SIZE=10

# Ozone Connection
OZONE_LABEL_STREAM_URL=wss://ozone.skywatch.blue/xrpc/com.atproto.label.subscribeLabels
OZONE_RECONNECT_MAX_ATTEMPTS=5
OZONE_RECONNECT_DELAY_MS=1000

# Feature Flags
ENABLE_LABEL_DEDUP=true
ENABLE_LABEL_SYNC=true
```

## Migration Strategy

### Step 1: Deploy Database Schema

- Run migrations in production
- Verify indexes are created

### Step 2: Historical Data Import (Skipped)

- Per discussion, a historical backfill will not be performed.
- **Note:** This means the automod may initially re-apply labels that already exist in Ozone. The system will eventually converge as new labels are synced, but there will be a period of duplication for historical labels.

### Step 3: Enable Sync Service

- Start with read-only mode
- Monitor for errors
- Enable write mode after validation

### Step 4: Enable Deduplication

- Start with logging mode
- Analyze duplicate prevention metrics
- Enable blocking mode

## Error Handling & Recovery

### WebSocket Disconnections

- Exponential backoff with jitter
- Max retry attempts before alerting
- Resume from last processed seq

### Database Failures

- Connection pool recovery
- Transaction rollback on errors
- Fallback to non-deduplicated mode

### Label Conflicts

- **Resolution Strategy:** With two write sources (automod and Ozone), a clear hierarchy is needed. An explicit negation from the Ozone stream should always override a positive label from automod. The `LabelManager` will be responsible for enforcing this logic to prevent race conditions.
- Log all conflict resolutions for audit and review.
- Consider tools for manual review of complex conflict scenarios.

## Performance Considerations

### Database Optimization

- Batch inserts for bulk operations
- Prepared statements for common queries
- Connection pooling (10-20 connections)
- Regular VACUUM and ANALYZE

### Stream Processing

- Buffer management for high volume
- Batch database writes (100-500 labels)
- Async processing to avoid blocking

## Monitoring & Alerting

### Key Metrics

- Labels processed per minute
- Duplicates prevented count
- Sync lag (current seq vs latest)
- Database query performance
- WebSocket connection stability

### Alerts

- Sync disconnected > 5 minutes
- Database connection failures
- High duplicate rate (possible sync issue)
- Memory usage > threshold

## Rollback Plan

### Quick Disable

- Feature flag to disable deduplication
- Continue normal operation without checking

### Full Rollback

1. Disable sync service
2. Disable deduplication checks
3. Archive database for analysis
4. Resume previous workflow

## Success Criteria

- 0% duplicate labels created by automod
- < 100ms latency for label checks
- 99.9% uptime for sync service
- Complete sync within 5 seconds of label creation

## Timeline

- **Week 1**: Database setup, basic CRUD operations
- **Week 2**: Label sync service, WebSocket handling
- **Week 3**: Integration, testing, monitoring
- **Week 4**: Production deployment, monitoring

## Dependencies

- PostgreSQL 14+
- Node.js packages: pg, @atcute/client, ws
- Existing Ozone instance with label subscription endpoint
- Environment with WebSocket support

## Risks & Mitigations

| Risk                  | Impact | Mitigation                           |
| --------------------- | ------ | ------------------------------------ |
| WebSocket instability | High   | Robust reconnection logic, buffering |
| Database performance  | Medium | Indexes, connection pooling, caching |
| Sync lag              | Medium | Monitor lag, alert on threshold      |
| Data inconsistency    | High   | Transaction support, audit logs      |
