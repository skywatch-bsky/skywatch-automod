# Technical Implementation Plan: PDS Host Check Module

## Overview
Implement a new module to check and moderate accounts based on their Personal Data Server (PDS) host. This will run when an account's handle is first seen, helping to identify and manage accounts from potentially malicious or untrusted PDS instances.

## Current Architecture Analysis

### Existing Patterns
- The codebase follows a consistent pattern for check modules:
  - `check*.ts` files implement the checking logic.
  - Check rules are defined in `src/constants.ts`.
  - Integration is handled via event listeners in `src/main.ts`.
  - Moderation actions are dispatched through `src/moderation.ts`.

### Key Components
1. **Check Module Pattern**: Each check module exports a function that takes relevant data (e.g., DID, handle), applies regex-based rules, and triggers moderation actions.
2. **Event System**: The application uses `@skyware/jetstream` to subscribe to the ATProto firehose. The `identity` event is fired when a user's handle is created or updated.
3. **Types**: Interfaces are well-defined in `src/types.ts`.

## Technical Challenges

### Challenge 1: Accessing PDS Information
The `IdentityEvent` from Jetstream provides the user's `did` and `handle`, but not their PDS host.

### Challenge 2: DID Document Resolution Required
To get the PDS host, we must resolve the user's DID to get their full DID Document and extract the `serviceEndpoint` from the `service` array.

## Implementation Approach

### 1. Add DID Resolution Capability
We will create a dedicated module for DID resolution that incorporates caching to manage performance and avoid rate limits.

### 2. Create PDS Check Module
A new `checkPDS.ts` module will use the resolver to get PDS info and apply moderation rules.

### 3. Integrate with Main Agent
The new check will be triggered by the existing `identity` event stream in `src/main.ts`.

## Detailed Implementation Steps

### 1. Update Dependencies
Add necessary packages for DID resolution and caching to `package.json`:
```bash
bun add @atproto/identity node-cache
```

### 2. Create a Caching DID Resolver
Create a new file `src/didResolver.ts` that uses `@atproto/identity` and `node-cache`.

```typescript
// src/didResolver.ts
import { DidResolver } from '@atproto/identity';
import NodeCache from 'node-cache';

// Cache DID documents for 10 minutes to reduce redundant lookups
const didCache = new NodeCache({ stdTTL: 600 });

const didResolver = new DidResolver({
  plcUrl: 'https://plc.directory',
});

export async function resolveDid(did: string): Promise<any | null> {
  const cachedDoc = didCache.get(did);
  if (cachedDoc) {
    return cachedDoc;
  }

  try {
    const doc = await didResolver.resolve(did);
    if (doc) {
      didCache.set(did, doc);
    }
    return doc;
  } catch (error) {
    // logger.error(`Failed to resolve DID ${did}:`, error);
    return null;
  }
}

export function extractPdsEndpoint(didDocument: any): string | null {
  const service = didDocument?.service?.find(
    (s: any) => s.id === '#atp_pds' && s.type === 'AtpPds',
  );
  return service?.serviceEndpoint || null;
}
```

### 3. Create PDS Check Module
Create a new file `src/checkPDS.ts`. This module will contain the core logic for checking the PDS host against predefined rules.

```typescript
// src/checkPDS.ts
import { PDS_CHECKS } from './constants.js';
import { resolveDid, extractPdsEndpoint } from './didResolver.js';
import { createAccountReport, createAccountComment, createAccountLabel } from './moderation.js';
import logger from './logger.js';

// Use a simple in-memory set to track DIDs that have been checked
const checkedDids = new Set<string>();

export const checkPDS = async (did: string, time: number) => {
  if (checkedDids.has(did)) {
    return; // Already checked this DID
  }

  const didDoc = await resolveDid(did);
  if (!didDoc) return;

  const pdsEndpoint = extractPdsEndpoint(didDoc);
  if (!pdsEndpoint) return;

  for (const check of PDS_CHECKS) {
    if (check.check.test(pdsEndpoint)) {
      // Logic for applying moderation...
      logger.info(`Found suspicious PDS: ${pdsEndpoint} for DID: ${did}`);
    }
  }

  checkedDids.add(did);
};
```

### 4. Define PDS Check Rules
Update `src/constants.ts` to include the new `PDS_CHECKS` array.

```typescript
// src/constants.ts (addition)
import { Checks } from './types.js';

export const PDS_CHECKS: Checks[] = [
  {
    label: 'suspicious-pds',
    comment: 'Account from a known malicious or untrusted PDS host.',
    check: /malicious-pds\.example\.com/i, // Example regex
    reportAcct: true,
    toLabel: true,
    commentAcct: false,
  },
  // Add more rules as needed
];
```

### 5. Integrate with Main Agent
Modify `src/main.ts` to call `checkPDS` from within the existing `identity` event listener.

```typescript
// src/main.ts (modification)
import { checkPDS } from './checkPDS.js';

// ... inside the jetstream.on("identity", ...) block
jetstream.on("identity", async (event: IdentityEvent) => {
  if (event.identity.handle) {
    checkHandle(event.identity.did, event.identity.handle, event.time_us);
  }
  // Add the new PDS check
  await checkPDS(event.identity.did, event.time_us);
});
```

## Implementation Considerations

- **Performance**: The DID document cache is critical. The in-memory `checkedDids` set prevents re-checking DIDs within a single session, further reducing load.
- **Error Handling**: The `didResolver` should gracefully handle resolution failures without crashing the agent.
- **Security**: PDS URLs should be treated as untrusted input.

## Testing Strategy
1.  **Unit Tests**:
    -   Test `didResolver.ts` for both `did:plc` and `did:web`, including cache hits/misses.
    -   Test `checkPDS.ts` logic with mock DID documents and various PDS endpoints.
2.  **Integration Tests**:
    -   Use mock Jetstream `identity` events to ensure `checkPDS` is called correctly.
    -   Verify that moderation actions are triggered as expected.

## Rollout Plan
1.  **Deploy with Logging Only**: Initially, disable moderation actions (`reportAcct`, `toLabel`) and only log matches to monitor for false positives.
2.  **Tune Rules**: Based on logs, refine the regex patterns and add whitelists if necessary.
3.  **Enable Moderation**: Once confidence is high, enable the moderation actions.

## Dependencies
- `@atproto/identity`: For DID resolution.
- `node-cache`: For in-memory caching of DID documents.
