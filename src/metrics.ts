import express from "express";
import { Registry, collectDefaultMetrics, Counter, Gauge } from "prom-client";

import { logger } from "./logger.js";
import { isRedisConnected } from "./redis.js";

const register = new Registry();
collectDefaultMetrics({ register });

export const postsTrackedCounter = new Counter({
  name: "posts_tracked_total",
  help: "Total number of posts tracked for label threshold monitoring",
  labelNames: ["label_type"],
  registers: [register],
});

export const thresholdsMetCounter = new Counter({
  name: "thresholds_met_total",
  help: "Total number of times label thresholds have been met",
  labelNames: ["label_type", "account_label"],
  registers: [register],
});

export const accountActionsCounter = new Counter({
  name: "account_actions_triggered_total",
  help: "Total number of account-level actions triggered",
  labelNames: ["action_type", "label_type", "success"],
  registers: [register],
});

export const redisConnectedGauge = new Gauge({
  name: "redis_connected",
  help: "Redis connection status (1 = connected, 0 = disconnected)",
  registers: [register],
  async collect() {
    this.set(isRedisConnected() ? 1 : 0);
  },
});

const app = express();

app.get("/metrics", (req, res) => {
  register
    .metrics()
    .then((metrics) => {
      res.set("Content-Type", register.contentType);
      res.send(metrics);
    })
    .catch((ex: unknown) => {
      logger.error({ process: "METRICS", error: (ex as Error).message }, "Error serving metrics");
      res.status(500).end((ex as Error).message);
    });
});

app.get("/health", (req, res) => {
  const redisConnected = isRedisConnected();
  const status = redisConnected ? "healthy" : "unhealthy";
  const statusCode = redisConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    redis: redisConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

export const startMetricsServer = (port: number, host = "127.0.0.1") => {
  return app.listen(port, host, () => {
    logger.info({ process: "METRICS", host, port }, "Metrics server is listening");
  });
};
