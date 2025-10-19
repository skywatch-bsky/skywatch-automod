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
 * Track a labeled post and check if account-level action is needed.
 *
 * When a post is labeled with one of our tracked labels, this function:
 * 1. Finds the matching config in TRACKED_LABELS
 * 2. Records the post in Redis (sorted by timestamp)
 * 3. Checks if the threshold has been met
 * 4. Returns an action object if threshold is met
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
  // Find matching config for this label
  const config = TRACKED_LABELS.find((c) => c.label === label);

  // If label is not tracked, do nothing
  if (!config) {
    return null;
  }

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
        currentCount,
        threshold: config.threshold,
      },
      `Tracked post label - ${currentCount}/${config.threshold}`,
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
        `Threshold met for ${label} - triggering account action`,
      );

      return {
        type: "label-account",
        did,
        config,
        currentCount,
      };
    }

    return null;
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
        atURI,
        ...errorInfo,
      },
      "Failed to track post label",
    );

    // Don't throw - graceful degradation if Redis is down
    return null;
  }
}
