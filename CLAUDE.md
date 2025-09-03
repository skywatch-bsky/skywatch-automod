# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start the application
npm start
# or
npx tsx src/main.ts

# Development mode with auto-reload
npm run dev

# Code formatting and linting
npm run format        # Format code with Prettier
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
```

## Architecture Overview

This is a TypeScript-based Bluesky content moderation tool that monitors the AT Protocol firehose and automatically labels content based on configurable rules.

### Core Flow
1. **Firehose Connection**: Connects to Bluesky's Jetstream firehose via WebSocket to receive real-time events
2. **Event Processing**: Listens for specific collection types (posts, profiles, starter packs) 
3. **Content Checking**: Runs regex-based checks against content using patterns defined in `constants.ts`
4. **Moderation Actions**: Either labels content directly or creates reports for manual review

### Key Components

- **main.ts**: Entry point that sets up Jetstream connection and routes events to appropriate checkers
- **constants.ts**: Contains all regex patterns and check definitions (HANDLE_CHECKS, POST_CHECKS, PROFILE_CHECKS)
- **moderation.ts**: Handles the actual labeling/reporting logic via Ozone API
- **Check modules**: Specialized checkers for different content types:
  - `checkPosts.ts`: Validates post text and URLs
  - `checkProfiles.ts`: Checks display names and descriptions
  - `checkHandles.ts`: Validates user handles
  - `checkStarterPack.ts`: Monitors starter pack usage

### Configuration

Environment variables (via `.env`):
- `DID`: Moderator account DID
- `OZONE_URL`: Ozone moderation service URL
- `BSKY_HANDLE` / `BSKY_PASSWORD`: Authentication credentials
- `FIREHOSE_URL`: Jetstream WebSocket endpoint
- `LABEL_LIMIT` / `LABEL_LIMIT_WAIT`: Rate limiting configuration

### Adding New Checks

Define new checks in `constants.ts` following the pattern documented in `src/developing_checks.md`:
- `label`: Label to apply
- `check`: RegExp pattern to match
- `reportOnly`: If true, creates report instead of auto-labeling
- `whitelist`: Optional pattern for exceptions
- `ignoredDIDs`: List of DIDs to skip

### State Persistence

The application maintains cursor position in `cursor.txt` to resume from the last processed event after restarts.