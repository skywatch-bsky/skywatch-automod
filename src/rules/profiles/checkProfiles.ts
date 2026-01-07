import { GLOBAL_ALLOW } from "../../../rules/constants.js";
import { PROFILE_CHECKS } from "../../../rules/profiles.js";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
  negateAccountLabel,
} from "../../accountModeration.js";
import { logger } from "../../logger.js";
import type { Checks } from "../../types.js";
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

  checkDescription(description: string): void {
    if (!description) return;
    this.performActions(description, "CHECKDESCRIPTION");
  }

  checkDisplayName(displayName: string): void {
    if (!displayName) return;
    this.performActions(displayName, "CHECKDISPLAYNAME");
  }

  checkBoth(displayName: string, description: string): void {
    const profile = `${displayName} ${description}`;
    if (!profile) return;
    this.performActions(profile, "CHECKPROFILE");
  }

  private performActions(
    content: string,
    processType: "CHECKPROFILE" | "CHECKDESCRIPTION" | "CHECKDISPLAYNAME",
  ): void {
    const matched = this.check.check.test(content);

    if (matched) {
      if (this.check.whitelist?.test(content)) {
        logger.debug(
          { process: processType, did: this.did, time: this.time, content },
          "Whitelisted phrase found",
        );
        return;
      }

      this.applyActions(content, processType);
    } else {
      if (this.check.unlabel) {
        this.removeLabel(content, processType);
      }
    }
  }

  private applyActions(content: string, processType: string): void {
    const formattedComment = `${this.time.toString()}: ${this.check.comment}\n\nContent: ${content}`;

    if (this.check.toLabel) {
      void createAccountLabel(this.did, this.check.label, formattedComment);
    }

    if (this.check.reportAcct) {
      void createAccountReport(this.did, formattedComment);
      logger.info(
        {
          process: processType,
          did: this.did,
          time: this.time,
          label: this.check.label,
        },
        "Reporting account",
      );
    }

    if (this.check.commentAcct) {
      void createAccountComment(
        this.did,
        formattedComment,
        `profile:${this.did}`,
      );
    }
  }

  private removeLabel(content: string, _processType: string): void {
    const formattedComment = `${this.check.comment}\n\nContent: ${content}`;
    void negateAccountLabel(this.did, this.check.label, formattedComment);
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
      checker.checkDescription(description);
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
      checker.checkDisplayName(displayName);
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
      checker.checkBoth(displayName, description);
    } else if (checkRule.description === true) {
      checker.checkDescription(description);
    } else if (checkRule.displayName === true) {
      checker.checkDisplayName(displayName);
    }
  }
};
