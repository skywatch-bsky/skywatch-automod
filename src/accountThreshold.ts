import { ACCOUNT_THRESHOLD_CONFIGS } from "../rules/accountThreshold.js";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "./accountModeration.js";
import { logger } from "./logger.js";
import {
  accountLabelsThresholdAppliedCounter,
  accountThresholdChecksCounter,
  accountThresholdMetCounter,
} from "./metrics.js";
import {
  getPostLabelCountInWindow,
  trackPostLabelForAccount,
} from "./redis.js";
import { AccountThresholdConfig } from "./types.js";

function normalizeLabels(labels: string | string[]): string[] {
  return Array.isArray(labels) ? labels : [labels];
}

function validateAndLoadConfigs(): AccountThresholdConfig[] {
  if (!ACCOUNT_THRESHOLD_CONFIGS || ACCOUNT_THRESHOLD_CONFIGS.length === 0) {
    logger.warn(
      { process: "ACCOUNT_THRESHOLD" },
      "No account threshold configs found",
    );
    return [];
  }

  for (const config of ACCOUNT_THRESHOLD_CONFIGS) {
    const labels = normalizeLabels(config.labels);
    if (labels.length === 0) {
      throw new Error(
        `Invalid account threshold config: labels cannot be empty`,
      );
    }
    if (config.threshold <= 0) {
      throw new Error(
        `Invalid account threshold config: threshold must be positive`,
      );
    }
    if (config.windowDays <= 0) {
      throw new Error(
        `Invalid account threshold config: windowDays must be positive`,
      );
    }
  }

  logger.info(
    { process: "ACCOUNT_THRESHOLD", count: ACCOUNT_THRESHOLD_CONFIGS.length },
    "Loaded account threshold configs",
  );

  return ACCOUNT_THRESHOLD_CONFIGS;
}

// Load and cache configs at module initialization
const cachedConfigs = validateAndLoadConfigs();

export function loadThresholdConfigs(): AccountThresholdConfig[] {
  return cachedConfigs;
}

export async function checkAccountThreshold(
  did: string,
  postLabel: string,
  timestamp: number,
): Promise<void> {
  try {
    const configs = loadThresholdConfigs();

    const matchingConfigs = configs.filter((config) => {
      const labels = normalizeLabels(config.labels);
      return labels.includes(postLabel);
    });

    if (matchingConfigs.length === 0) {
      logger.debug(
        { process: "ACCOUNT_THRESHOLD", did, postLabel },
        "No matching threshold configs for post label",
      );
      return;
    }

    accountThresholdChecksCounter.inc({ post_label: postLabel });

    for (const config of matchingConfigs) {
      const labels = normalizeLabels(config.labels);

      await trackPostLabelForAccount(
        did,
        postLabel,
        timestamp,
        config.windowDays,
      );

      const count = await getPostLabelCountInWindow(
        did,
        labels,
        config.windowDays,
        timestamp,
      );

      logger.debug(
        {
          process: "ACCOUNT_THRESHOLD",
          did,
          labels,
          count,
          threshold: config.threshold,
          windowDays: config.windowDays,
        },
        "Checked account threshold",
      );

      if (count >= config.threshold) {
        accountThresholdMetCounter.inc({ account_label: config.accountLabel });

        logger.info(
          {
            process: "ACCOUNT_THRESHOLD",
            did,
            postLabel,
            accountLabel: config.accountLabel,
            count,
            threshold: config.threshold,
          },
          "Account threshold met",
        );

        const shouldLabel = config.toLabel !== false;

        if (shouldLabel) {
          await createAccountLabel(
            did,
            config.accountLabel,
            config.accountComment,
          );
          accountLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "label",
          });
        }

        if (config.reportAcct) {
          await createAccountReport(did, config.accountComment);
          accountLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "report",
          });
        }

        if (config.commentAcct) {
          const atURI = `threshold-comment:${config.accountLabel}:${timestamp}`;
          await createAccountComment(did, config.accountComment, atURI);
          accountLabelsThresholdAppliedCounter.inc({
            account_label: config.accountLabel,
            action: "comment",
          });
        }
      }
    }
  } catch (error) {
    logger.error(
      { process: "ACCOUNT_THRESHOLD", did, postLabel, error },
      "Error checking account threshold",
    );
    throw error;
  }
}
