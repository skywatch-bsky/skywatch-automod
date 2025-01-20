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

To run in docker:

```bash
docker build -pull -t skywatch-automod .
docker run -d -p 4101:4101 skywatch-automod
```

## Brief overview

Currently this tooling does one thing. It monitors the bluesky firehose and analyzes content for phrases which fit Skywatch's criteria for moderation. If the criteria is met, it can automatically label the content with the appropriate label.

In certain cases, where regexp will create too many false positives, it will flag content as a report against related to the account, so that it can be reviewed later.

For information on how to set-up your own checks, please see the [developing_checks.md](./src/developing_checks.md) file.

_TODO_:

- [ ] Consider how to write directly to OzonePDS database rather than using the API. May require running the same instance as Ozone to allow for direct database access.
- [ ] Add compose.yaml for easy deployment
- [ ] Make the metrics server work (or remove it)

Create a seperate program to watch OZONE_PDS firehose labels, and update the lists as needed. This will remove dependency on broken ruby tools created by aegis.
