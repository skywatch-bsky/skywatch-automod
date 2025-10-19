# Description: Dockerfile for the Skywatch Tools
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies (cached layer)
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Expose the metrics port
EXPOSE 4101

# Run the application
CMD ["bun", "run", "start"]
