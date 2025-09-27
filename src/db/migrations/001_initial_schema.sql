-- Initial schema for label deduplication system
CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    did VARCHAR(255) NOT NULL,
    at_uri TEXT,
    label_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    negated BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'automod',
    CONSTRAINT unique_label UNIQUE(did, at_uri, label_value)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_labels_did ON labels(did);
CREATE INDEX IF NOT EXISTS idx_labels_at_uri ON labels(at_uri);
CREATE INDEX IF NOT EXISTS idx_labels_value ON labels(label_value);
CREATE INDEX IF NOT EXISTS idx_labels_negated ON labels(negated);

-- Label history for audit trail
CREATE TABLE IF NOT EXISTS label_history (
    id SERIAL PRIMARY KEY,
    did VARCHAR(255) NOT NULL,
    at_uri TEXT,
    label_value VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'negated', 'updated')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),
    metadata JSONB
);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_label_history_did ON label_history(did);
CREATE INDEX IF NOT EXISTS idx_label_history_timestamp ON label_history(timestamp);