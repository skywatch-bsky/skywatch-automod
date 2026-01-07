import { STARTER_PACK_THRESHOLD_CONFIGS } from "../rules/starterPackThreshold.js";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "./accountModeration.js";
import { logger } from "./logger.js";
import {
  starterPackLabelsThresholdAppliedCounter,
  starterPackThresholdChecksCounter,
  starterPackThresholdMetCounter,
} from "./metrics.js";
import {
  getStarterPackCountInWindow,
  trackStarterPackForAccount,
} from "./redis.js";
import type { StarterPackThresholdConfig } from "./types.js";

function validateAndLoadConfigs(): StarterPackThresholdConfig[] {
  if (STARTER_PACK_THRESHOLD_CONFIGS.length === 0) {
    logger.warn(
      { process: "STARTER_PACK_THRESHOLD" },
      "No starter pack threshold configs found",
    );
    return [];
  }

  for (const config of STARTER_PACK_THRESHOLD_CONFIGS) {
    if (config.threshold <= 0) {
      throw new Error(
        `Invalid starter pack threshold config: threshold must be positive`,
      );
    }
    if (config.window <= 0) {
      throw new Error(
        `Invalid starter pack threshold config: window must be positive`,
      );
    }
  }

  logger.info(
    { process: "STARTER_PACK_THRESHOLD", count: STARTER_PACK_THRESHOLD_CONFIGS.length },
    "Loaded starter pack threshold configs",
  );

  return STARTER_PACK_THRESHOLD_CONFIGS;
}

const cachedConfigs = validateAndLoadConfigs();

export function loadStarterPackThresholdConfigs(): StarterPackThresholdConfig[] {
  return cachedConfigs;
}

export async function checkStarterPackThreshold(
  did: string,
  starterPackUri: string,
  timestamp: number,
): Promise<void> {
  try {
    const configs = loadStarterPackThresholdConfigs();

    if (configs.length === 0) {
      return;
    }

    starterPackThresholdChecksCounter.inc();

    for (const config of configs) {
      // Check allowlist
      if (config.allowlist?.includes(did)) {
        logger.debug(
          { process: "STARTER_PACK_THRESHOLD", did, starterPackUri },
          "Account is in allowlist, skipping threshold check",
        );
        continue;
      }

      await trackStarterPackForAccount(
        did,
        starterPackUri,
        timestamp,
        config.window,
        config.windowUnit,
      );

      const count = await getStarterPackCountInWindow(
        did,
        config.window,
        config.windowUnit,
        timestamp,
      );

      logger.debug(
        {
          process: "STARTER_PACK_THRESHOLD",
          did,
          count,
          threshold: config.threshold,
          window: config.window,
          windowUnit: config.windowUnit,
        },
        "Checked starter pack threshold",
      );

      if (count >= config.threshold) {
        starterPackThresholdMetCounter.inc({ account_label: config.accountLabel });

        logger.info(
          {
            process: "STARTER_PACK_THRESHOLD",
            did,
            starterPackUri,
            accountLabel: config.accountLabel,
            count,
            threshold: config.threshold,
          },
          "Starter pack threshold met",
        );

        const shouldLabel = config.toLabel !== false;

        const formattedComment = `${config.accountComment}\n\nThreshold: ${count.toString()}/${config.threshold.toString()} in ${config.window.toString()} ${config.windowUnit}\n\nStarter Pack: ${starterPackUri}`;

        if (shouldLabel) {
          await createAccountLabel(did, config.accountLabel, formattedComment);
          starterPackLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "label",
          });
        }

        if (config.reportAcct) {
          await createAccountReport(did, formattedComment);
          starterPackLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "report",
          });
        }

        if (config.commentAcct) {
          const atURI = `starterpack-threshold-comment:${config.accountLabel}:${timestamp.toString()}`;
          await createAccountComment(did, formattedComment, atURI);
          starterPackLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "comment",
          });
        }
      }
    }
  } catch (error) {
    logger.error(
      { process: "STARTER_PACK_THRESHOLD", did, starterPackUri, error },
      "Error checking starter pack threshold",
    );
    throw error;
  }
}
