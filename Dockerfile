FROM oven/bun:latest
WORKDIR /app
RUN bun install --production
COPY . .
EXPOSE 4100
CMD ["bun", "run", "start"]
