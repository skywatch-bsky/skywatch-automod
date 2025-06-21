import { login } from "./agent.js";
import { langs, PROFILE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import {
  createAccountReport,
  createAccountLabel,
  createAccountComment,
} from "./moderation.js";
import { getLanguage } from "./utils.js";

export const checkDescription = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  const lang = await getLanguage(description);

  if (!langs.includes(lang)) {
    return;
  }

  const labels: string[] = Array.from(
    PROFILE_CHECKS,
    (profileCheck) => profileCheck.label,
  );

  // iterate through the labels
  labels.forEach((label) => {
    const checkProfiles = PROFILE_CHECKS.find(
      (profileCheck) => profileCheck.label === label,
    );

    // Check if DID is whitelisted
    if (checkProfiles?.ignoredDIDs) {
      if (checkProfiles.ignoredDIDs.includes(did)) {
        logger.info(`[CHECKDESCRIPTION]: Whitelisted DID: ${did}`);
        return;
      }
    }

    if (description) {
      if (checkProfiles?.description === true) {
        if (checkProfiles!.check.test(description)) {
          // Check if description is whitelisted
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(description)) {
              logger.info(`[CHECKDESCRIPTION]: Whitelisted phrase found.`);
              return;
            }
          }

          if (checkProfiles!.toLabel === true) {
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDESCRIPTION]: Labeling ${did} for ${checkProfiles!.label}`,
            );
          }

          if (checkProfiles!.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDESCRIPTION]: Reporting ${did} for ${checkProfiles!.label}`,
            );
          }

          if (checkProfiles!.commentAcct === true) {
            createAccountComment(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDESCRIPTION]: Commenting on ${did} for ${checkProfiles!.label}`,
            );
          }
        }
      }
    }
  });
};

export const checkDisplayName = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  const lang = await getLanguage(description);

  if (!langs.includes(lang)) {
    return;
  }

  // Get a list of labels
  const labels: string[] = Array.from(
    PROFILE_CHECKS,
    (profileCheck) => profileCheck.label,
  );

  // iterate through the labels
  labels.forEach((label) => {
    const checkProfiles = PROFILE_CHECKS.find(
      (profileCheck) => profileCheck.label === label,
    );

    // Check if DID is whitelisted
    if (checkProfiles?.ignoredDIDs) {
      if (checkProfiles.ignoredDIDs.includes(did)) {
        logger.info(`[CHECKDISPLAYNAME]: Whitelisted DID: ${did}`);
        return;
      }
    }

    if (displayName) {
      if (checkProfiles?.displayName === true) {
        if (checkProfiles!.check.test(displayName)) {
          // Check if displayName is whitelisted
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(displayName)) {
              logger.info(`[CHECKDISPLAYNAME]: Whitelisted phrase found.`);
              return;
            }
          }

          if (checkProfiles!.toLabel === true) {
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDISPLAYNAME]: Labeling ${did} for ${checkProfiles!.label}`,
            );
          }

          if (checkProfiles!.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDISPLAYNAME]: Reporting ${did} for ${checkProfiles!.label}`,
            );
          }

          if (checkProfiles!.commentAcct === true) {
            createAccountComment(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              `[CHECKDISPLAYNAME]: Commenting on ${did} for ${checkProfiles!.label}`,
            );
          }
        }
      }
    }
  });
};
