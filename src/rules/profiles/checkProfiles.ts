import { GLOBAL_ALLOW } from "../../../rules/constants.js";
import { PROFILE_CHECKS } from "../../../rules/profiles.js";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
  negateAccountLabel,
} from "../../accountModeration.js";
import { logger } from "../../logger.js";
import { moderationActionsFailedCounter } from "../../metrics.js";
import type { Checks, ModerationResult } from "../../types.js";
import { getLanguage } from "../../utils/getLanguage.js";

export class ProfileChecker {
  private check: Checks;
  private did: string;
  private time: number;

  constructor(check: Checks, did: string, time: number) {
    this.check = check;
    this.did = did;
    this.time = time;
  }

  async checkDescription(description: string): Promise<void> {
    if (!description) return;
    await this.performActions(description, "CHECKDESCRIPTION");
  }

  async checkDisplayName(displayName: string): Promise<void> {
    if (!displayName) return;
    await this.performActions(displayName, "CHECKDISPLAYNAME");
  }

  async checkBoth(displayName: string, description: string): Promise<void> {
    const profile = `${displayName} ${description}`;
    if (!profile) return;
    await this.performActions(profile, "CHECKPROFILE");
  }

  private async performActions(
    content: string,
    processType: "CHECKPROFILE" | "CHECKDESCRIPTION" | "CHECKDISPLAYNAME",
  ): Promise<void> {
    const matched = this.check.check.test(content);

    if (matched) {
      if (this.check.whitelist?.test(content)) {
        logger.debug(
          { process: processType, did: this.did, time: this.time, content },
          "Whitelisted phrase found",
        );
        return;
      }

      const result = await this.applyActions(content, processType);
      if (!result.success) {
        for (const error of result.errors) {
          logger.error(
            {
              process: processType,
              did: this.did,
              action: error.action,
              error: error.error,
            },
            "Moderation action failed",
          );
          moderationActionsFailedCounter.inc({
            action: error.action,
            target_type: "account",
          });
        }
      }
    } else {
      if (this.check.unlabel) {
        const result = await this.removeLabel(content, processType);
        if (!result.success) {
          for (const error of result.errors) {
            logger.error(
              {
                process: processType,
                did: this.did,
                action: error.action,
                error: error.error,
              },
              "Moderation action failed",
            );
            moderationActionsFailedCounter.inc({
              action: error.action,
              target_type: "account",
            });
          }
        }
      }
    }
  }

  private async applyActions(
    content: string,
    processType: string,
  ): Promise<ModerationResult> {
    const results: ModerationResult = { success: true, errors: [] };
    const formattedComment = `${this.time.toString()}: ${this.check.comment}\n\nContent: ${content}`;

    if (this.check.toLabel) {
      try {
        await createAccountLabel(this.did, this.check.label, formattedComment);
      } catch (error) {
        results.success = false;
        results.errors.push({ action: "label", error });
      }
    }

    if (this.check.reportAcct) {
      try {
        await createAccountReport(this.did, formattedComment);
        logger.info(
          {
            process: processType,
            did: this.did,
            time: this.time,
            label: this.check.label,
          },
          "Reporting account",
        );
      } catch (error) {
        results.success = false;
        results.errors.push({ action: "report", error });
      }
    }

    if (this.check.commentAcct) {
      try {
        await createAccountComment(
          this.did,
          formattedComment,
          `profile:${this.did}`,
        );
      } catch (error) {
        results.success = false;
        results.errors.push({ action: "comment", error });
      }
    }

    return results;
  }

  private async removeLabel(
    content: string,
    _processType: string,
  ): Promise<ModerationResult> {
    const results: ModerationResult = { success: true, errors: [] };
    const formattedComment = `${this.check.comment}\n\nContent: ${content}`;
    try {
      await negateAccountLabel(this.did, this.check.label, formattedComment);
    } catch (error) {
      results.success = false;
      results.errors.push({ action: "unlabel", error });
    }
    return results;
  }
}

export const checkDescription = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
): Promise<void> => {
  if (!description) return;

  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKDESCRIPTION", did, time, displayName, description },
      "Global AllowListed DID",
    );
    return;
  }

  for (const checkRule of PROFILE_CHECKS) {
    if (checkRule.language) {
      const lang = await getLanguage(description);
      if (!checkRule.language.includes(lang)) {
        continue;
      }
    }

    if (checkRule.ignoredDIDs?.includes(did)) {
      logger.debug(
        { process: "CHECKDESCRIPTION", did, time, displayName, description },
        "Whitelisted DID",
      );
      continue;
    }

    if (checkRule.description === true) {
      const checker = new ProfileChecker(checkRule, did, time);
      await checker.checkDescription(description);
    }
  }
};

export const checkDisplayName = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
): Promise<void> => {
  if (!displayName) return;

  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKDISPLAYNAME", did, time, displayName, description },
      "Global AllowListed DID",
    );
    return;
  }

  for (const checkRule of PROFILE_CHECKS) {
    if (checkRule.language) {
      const lang = await getLanguage(displayName);
      if (!checkRule.language.includes(lang)) {
        continue;
      }
    }

    if (checkRule.ignoredDIDs?.includes(did)) {
      logger.debug(
        { process: "CHECKDISPLAYNAME", did, time, displayName, description },
        "Whitelisted DID",
      );
      continue;
    }

    if (checkRule.displayName === true) {
      const checker = new ProfileChecker(checkRule, did, time);
      await checker.checkDisplayName(displayName);
    }
  }
};

export const checkProfile = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  const profile = `${displayName} ${description}`;
  const lang = await getLanguage(profile);

  // Check if DID is whitelisted at global level
  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKPROFILE", did, time, profile },
      "Global AllowListed DID",
    );
    return;
  }

  // Iterate through checks and delegate to ProfileChecker
  for (const checkRule of PROFILE_CHECKS) {
    // Language filter (same for all branches)
    if (checkRule.language) {
      if (!checkRule.language.includes(lang)) {
        continue;
      }
    }

    // DID whitelist (same for all branches)
    if (checkRule.ignoredDIDs?.includes(did)) {
      logger.debug(
        { process: "CHECKPROFILE", did, time, displayName, description },
        "Whitelisted DID",
      );
      continue;
    }

    // Dispatch to correct method based on check configuration
    const checker = new ProfileChecker(checkRule, did, time);

    if (checkRule.description === true && checkRule.displayName === true) {
      await checker.checkBoth(displayName, description);
    } else if (checkRule.description === true) {
      await checker.checkDescription(description);
    } else if (checkRule.displayName === true) {
      await checker.checkDisplayName(displayName);
    }
  }
};
