import express from "express";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";
import { HOST } from "./config.js";
import { logger } from "./logger.js";

const register = new Registry();
collectDefaultMetrics({ register });

export const labelsAppliedCounter = new Counter({
  name: "skywatch_labels_applied_total",
  help: "Total number of labels applied by type",
  labelNames: ["label_type", "target_type"],
  registers: [register],
});

export const labelsCachedCounter = new Counter({
  name: "skywatch_labels_cached_total",
  help: "Total number of labels skipped due to cache/existing label",
  labelNames: ["label_type", "target_type", "reason"],
  registers: [register],
});

export const unlabelsRemovedCounter: Counter = new Counter({
  name: "skywatch_labels_removed_total",
  help: "Total number of labels removed due to criteria no longer matching",
  labelNames: ["label_type", "target_type"],
  registers: [register],
});

export const accountLabelsThresholdAppliedCounter = new Counter({
  name: "skywatch_account_labels_threshold_applied_total",
  help: "Total number of account actions applied due to threshold",
  labelNames: ["account_label", "action"],
  registers: [register],
});

export const accountThresholdChecksCounter = new Counter({
  name: "skywatch_account_threshold_checks_total",
  help: "Total number of account threshold checks performed",
  labelNames: ["post_label"],
  registers: [register],
});

export const accountThresholdMetCounter = new Counter({
  name: "skywatch_account_threshold_met_total",
  help: "Total number of times account thresholds were met",
  labelNames: ["account_label"],
  registers: [register],
});

export const starterPackThresholdChecksCounter = new Counter({
  name: "skywatch_starter_pack_threshold_checks_total",
  help: "Total number of starter pack threshold checks performed",
  registers: [register],
});

export const starterPackThresholdMetCounter = new Counter({
  name: "skywatch_starter_pack_threshold_met_total",
  help: "Total number of times starter pack thresholds were met",
  labelNames: ["account_label"],
  registers: [register],
});

export const starterPackLabelsThresholdAppliedCounter = new Counter({
  name: "skywatch_starter_pack_labels_threshold_applied_total",
  help: "Total number of account actions applied due to starter pack threshold",
  labelNames: ["account_label", "action"],
  registers: [register],
});

export const moderationActionsFailedCounter = new Counter({
  name: "skywatch_moderation_actions_failed_total",
  help: "Total number of moderation actions that failed",
  labelNames: ["action", "target_type"],
  registers: [register],
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
      logger.error(
        { process: "METRICS", error: (ex as Error).message },
        "Error serving metrics",
      );
      res.status(500).end((ex as Error).message);
    });
});

export const startMetricsServer = (port: number) => {
  return app.listen(port, HOST, () => {
    logger.info(
      { process: "METRICS", host: HOST, port },
      "Metrics server is listening",
    );
  });
};
