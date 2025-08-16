# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Skywatch Automod is a Bluesky social network moderation tool that monitors the firehose stream in real-time and performs automated moderation actions based on configurable rules. The application analyzes posts, profiles, handles, and starter packs against regex-based checks and can apply labels, create reports, or post comments.

## Development Commands

```bash
# Start the application
bun run start

# Development mode with auto-reload
bun run dev

# Code formatting
bun run format

# Linting
bun run lint
bun run lint:fix
```

## Required Configuration

Before running, you must:

1. **Create constants file**: `cp src/constants.ts.example src/constants.ts` and configure your moderation rules
2. **Create environment file**: Copy `.env.example` to `.env` and set required values:
   - `MOD_DID`: DID of your moderation service
   - `OZONE_URL`: Ozone service URL
   - `BSKY_HANDLE`: Bot's Bluesky handle
   - `BSKY_PASSWORD`: Bot's app password

## Architecture

The application uses a modular architecture with these key components:

- **main.ts**: Entry point that connects to Jetstream firehose and routes events to checkers
- **config.ts**: Environment variable configuration
- **constants.ts**: Moderation rule definitions (POST_CHECKS, PROFILE_CHECKS, HANDLE_CHECKS)
- **types.ts**: TypeScript interfaces for Checks, Post, Handle, Profile, etc.
- **Check modules**: Separate files for checking posts, profiles, handles, and starter packs
- **Moderation/Action modules**: Handle labeling, reporting, and commenting actions

### Event Flow

1. Jetstream receives events from Bluesky firehose
2. Events are categorized by type (posts, profiles, handles, starter packs)
3. Content is checked against relevant regex rules in constants.ts
4. Matching content triggers moderation actions (labels, reports, comments)
5. Cursor position is persisted to cursor.txt for graceful restarts

### Key Dependencies

- `@skyware/jetstream`: Bluesky firehose connection
- `@atproto/*`: AT Protocol libraries for Bluesky API
- `@skyware/labeler`: Labeling functionality
- Language detection via `lande` package
- Rate limiting with `bottleneck` and `p-ratelimit`

## Moderation Rules

Rules are defined in `src/constants.ts` with three categories:
- `POST_CHECKS`: For post content and embedded links
- `PROFILE_CHECKS`: For display names and descriptions
- `HANDLE_CHECKS`: For user handles

Each check supports regex patterns, whitelists, language targeting, and DID exemptions. See `src/developing_checks.md` for detailed rule creation guidance.