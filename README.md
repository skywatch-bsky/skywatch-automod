# skywatch-tools

This is a rewrite of the original skywatch-tools project in TypeScript. The original project was written in Bash. The purpose of this project is to automate the moderation by the Bluesky independent labeler skywatch.blue

To install dependencies:

```bash
bun i
```

To run:

```bash
bun run start
```

## Docker

To run in docker:

```bash
docker build -pull -t skywatch-tools .
docker run -d -p 4101:4101 skywatch-autolabeler
```




This project was created using `bun init` in bun v1.1.37. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
