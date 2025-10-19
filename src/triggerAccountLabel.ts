import { logger } from "./logger.js";
import {
  createAccountLabel,
  createAccountReport,
  createAccountComment,
} from "./moderation.js";
import type { AccountLabelAction } from "./trackPostLabel.js";

/**
 * Result of executing an account label action
 */
export interface AccountLabelResult {
  success: boolean;
  did: string;
  label: string;
  labeled?: boolean;
  reported?: boolean;
  commented?: boolean;
  error?: string;
}

/**
 * Execute an account-level action triggered by post label threshold.
 *
 * Based on the TrackedLabelConfig, this function:
 * 1. Always labels the account with config.accountLabel
 * 2. Optionally reports the account (if config.reportAcct is true)
 * 3. Optionally adds a comment (if config.commentAcct is true)
 *
 * @param action - The account label action to execute
 * @returns AccountLabelResult indicating what was done
 */
export async function triggerAccountLabel(
  action: AccountLabelAction,
): Promise<AccountLabelResult> {
  const { did, config, currentCount } = action;

  logger.info(
    {
      process: "TRIGGER_ACCOUNT_LABEL",
      did,
      postLabel: config.label,
      accountLabel: config.accountLabel,
      currentCount,
      threshold: config.threshold,
    },
    `Triggering account label for ${did} (${config.label} threshold met)`,
  );

  const result: AccountLabelResult = {
    success: false,
    did,
    label: config.accountLabel,
  };

  try {
    // Step 1: Always label the account
    await createAccountLabel(did, config.accountLabel, config.accountComment);
    result.labeled = true;

    logger.info(
      {
        process: "TRIGGER_ACCOUNT_LABEL",
        did,
        label: config.accountLabel,
      },
      `Labeled account ${did} with ${config.accountLabel}`,
    );

    // Step 2: Optionally report the account
    if (config.reportAcct) {
      await createAccountReport(did, config.accountComment);
      result.reported = true;

      logger.info(
        {
          process: "TRIGGER_ACCOUNT_LABEL",
          did,
        },
        `Reported account ${did}`,
      );
    }

    // Step 3: Optionally add a comment
    if (config.commentAcct) {
      await createAccountComment(did, config.accountComment);
      result.commented = true;

      logger.info(
        {
          process: "TRIGGER_ACCOUNT_LABEL",
          did,
        },
        `Commented on account ${did}`,
      );
    }

    result.success = true;

    logger.info(
      {
        process: "TRIGGER_ACCOUNT_LABEL",
        did,
        labeled: result.labeled,
        reported: result.reported,
        commented: result.commented,
      },
      `Successfully executed account action for ${did}`,
    );

    return result;
  } catch (error) {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : { error: String(error) };

    result.error =
      error instanceof Error ? error.message : String(error);

    logger.error(
      {
        process: "TRIGGER_ACCOUNT_LABEL",
        did,
        label: config.accountLabel,
        ...errorInfo,
      },
      `Failed to execute account action for ${did}`,
    );

    return result;
  }
}
