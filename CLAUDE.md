# Claude Code Instructions

**All imports in this document should be treated as if they were in the main prompt file.**

## MCP Orientation Instructions

@.claude/mcp-descriptions/github-mcp.mdc

NEVER USE A COMMAND-LINE TOOL WHEN AN MCP TOOL IS AVAILABLE. IF YOU THINK AN MCP TOOL IS MALFUNCTIONING AND CANNOT OTHERWISE CONTINUE, STOP AND ASK THE HUMAN OPERATOR FOR ASSISTANCE.

## Development Commands

### Running the Application

- `bun run start` - Run the main application (production mode)
- `bun run dev` - Run in development mode with file watching
- `bun i` - Install dependencies

### Code Quality

- `bun run format` - Format code using Prettier
- `bun run lint` - Run ESLint to check for issues
- `bun run lint:fix` - Automatically fix ESLint issues where possible

### Docker Deployment

- `docker build -pull -t skywatch-tools .` - Build Docker image
- `docker run -d -p 4101:4101 skywatch-autolabeler` - Run container

## Architecture Overview

This is a TypeScript rewrite of a Bash-based Bluesky content moderation system for the skywatch.blue independent labeler. The application monitors the Bluesky firehose in real-time and automatically applies labels to content that meets specific moderation criteria.

### Core Components

- **`main.ts`** - Entry point that sets up Jetstream WebSocket connection to monitor Bluesky firehose events (posts, profiles, handles, starter packs)
- **`agent.ts`** - Configures the AtpAgent for interacting with Ozone PDS for labeling operations
- **`constants.ts`** - Contains all moderation check definitions (PROFILE_CHECKS, POST_CHECKS, HANDLE_CHECKS)
- **`config.ts`** - Environment variable configuration and application settings
- **Check modules** - Individual modules for different content types:
  - `checkPosts.ts` - Analyzes post content and URLs
  - `checkHandles.ts` - Validates user handles
  - `checkProfiles.ts` - Examines profile descriptions and display names
  - `checkStarterPack.ts` - Reviews starter pack content

### Moderation Check System

The system uses a `Checks` interface to define moderation rules with the following properties:

- `label` - The label to apply when content matches
- `check` - RegExp pattern to match against content
- `whitelist` - Optional RegExp to exempt certain content
- `ignoredDIDs` - Array of DIDs to skip for this check
- `reportAcct/commentAcct/toLabel` - Actions to take when content matches

### Environment Configuration

The application requires several environment variables:

- Bluesky credentials (`BSKY_HANDLE`, `BSKY_PASSWORD`)
- Ozone server configuration (`OZONE_URL`, `OZONE_PDS`)
- Optional: firehose URL, ports, rate limiting settings

### Data Flow

1. Jetstream receives events from Bluesky firehose
2. Events are categorized by type (post, profile, handle, starter pack)
3. Appropriate check functions validate content against defined patterns
4. Matching content triggers labeling actions via Ozone PDS
5. Cursor position is periodically saved for resumption after restart

### Development Notes

- Uses Bun as the runtime and package manager
- Built with modern TypeScript and ESNext modules
- Implements rate limiting and error handling for API calls
- Supports both labeling and reporting workflows
- Includes metrics server on port 4101 for monitoring

See `src/developing_checks.md` for detailed instructions on creating new moderation checks.

## TODO

The code-reviewer has completed a comprehensive review of the codebase and identified several critical issues that need immediate attention:

  Immediate Blocking Issues

  - Missing constants.ts file (only example exists)
  - Unsafe type assertions in main.ts:152,158
  - Inadequate error handling for async operations

  High Priority Security & Reliability Concerns

  - Hardcoded DIDs should be moved to environment variables
  - Missing structured error handling and logging
  - No environment variable validation at startup

  Medium Priority Code Quality Issues

  - Duplicate profile checking logic needs refactoring
  - ESLint configuration needs TypeScript updates
  - Missing comprehensive test suite

  The reviewer noted that while the modular architecture is well-designed, there are critical execution flaws that must be addressed before this
  can be safely deployed to production.
