import { logger } from "./logger.js";
import { TRACKED_LABELS } from "./config.js";
import { addPostAndCheckThreshold } from "./redis.js";
import { postsTrackedCounter, thresholdsMetCounter } from "./metrics.js";
import type { TrackedLabelConfig } from "./types.js";

/**
 * Action to take when a tracked label threshold is met
 */
export interface AccountLabelAction {
  type: "label-account";
  did: string;
  config: TrackedLabelConfig;
  currentCount: number;
}

/**
 * Helper function to check if a post label matches a config's label(s)
 */
function labelMatches(configLabel: string | string[], postLabel: string): boolean {
  if (typeof configLabel === "string") {
    return configLabel === postLabel;
  }
  return configLabel.includes(postLabel);
}

/**
 * Track a labeled post and check if account-level action is needed.
 *
 * When a post is labeled with one of our tracked labels, this function:
 * 1. Finds the matching config(s) in TRACKED_LABELS (a post label can match multiple configs)
 * 2. For each matching config, records the post in Redis (sorted by timestamp)
 * 3. Checks if the threshold has been met for each config
 * 4. Returns an action object if threshold is met
 *
 * Note: A single post label can trigger multiple account labels if it appears in
 * multiple configs. For example, "alt-tech" might contribute to both "amplifier"
 * and "repeat-offender" thresholds.
 *
 * @param did - The DID of the account that posted
 * @param atURI - The AT URI of the labeled post
 * @param label - The label that was applied to the post
 * @returns AccountLabelAction if threshold is met, null otherwise
 */
export async function trackPostLabel(
  did: string,
  atURI: string,
  label: string,
): Promise<AccountLabelAction | null> {
  // Find all matching configs for this label
  const matchingConfigs = TRACKED_LABELS.filter((c) => labelMatches(c.label, label));

  // If label is not tracked by any config, do nothing
  if (matchingConfigs.length === 0) {
    return null;
  }

  // Process each matching config
  // NOTE: If multiple configs match, we only return the first one that meets threshold
  // This is intentional - subsequent configs will be triggered on next label event
  for (const config of matchingConfigs) {
    try {
      // Record the post and get current count
      const currentCount = await addPostAndCheckThreshold(did, atURI, config);

      // Increment tracking metric
      postsTrackedCounter.inc({ label_type: label });

      logger.info(
        {
          process: "TRACK_LABEL",
          did,
          label,
          accountLabel: config.accountLabel,
          currentCount,
          threshold: config.threshold,
        },
        `Tracked post label - ${currentCount}/${config.threshold} for ${config.accountLabel}`,
      );

      // Check if threshold is met
      if (currentCount >= config.threshold) {
        // Increment threshold met metric
        thresholdsMetCounter.inc({
          label_type: label,
          account_label: config.accountLabel,
        });

        logger.warn(
          {
            process: "TRACK_LABEL",
            did,
            label,
            currentCount,
            threshold: config.threshold,
            accountLabel: config.accountLabel,
          },
          `Threshold met for ${config.accountLabel} - triggering account action`,
        );

        return {
          type: "label-account",
          did,
          config,
          currentCount,
        };
      }
    } catch (error) {
      const errorInfo =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : { error: String(error) };

      logger.error(
        {
          process: "TRACK_LABEL",
          did,
          label,
          accountLabel: config.accountLabel,
          atURI,
          ...errorInfo,
        },
        `Failed to track post label for ${config.accountLabel}`,
      );

      // Don't throw - graceful degradation if Redis is down
      // Continue to next config if there is one
    }
  }

  // No threshold met for any matching config
  return null;
}
