import { describe } from "node:test";
import { PROFILE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import {
  createAccountReport,
  createAccountLabel,
  checkAccountLabels,
  createAccountComment,
} from "./moderation.js";
import { limit } from "./limits.js";

export const checkDescription = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
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
        logger.info(`Whitelisted DID: ${did}`);
        return;
      }
    }

    if (description) {
      if (checkProfiles?.description === true) {
        if (checkProfiles!.check.test(description)) {
          // Check if description is whitelisted
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(description)) {
              logger.info(`Whitelisted phrase found.`);
              return;
            }
          }

          if (checkProfiles!.toLabel === true) {
            logger.info(`Creating label for ${did}`);
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
          }

          if (checkProfiles!.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
          }

          if (checkProfiles!.commentAcct === true) {
            logger.info(`Commenting on account for ${did}`);
            createAccountComment(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
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
        logger.info(`Whitelisted DID: ${did}`);
        return;
      }
    }

    if (displayName) {
      if (checkProfiles?.displayName === true) {
        if (checkProfiles!.check.test(displayName)) {
          // Check if displayName is whitelisted
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(displayName)) {
              logger.info(`Whitelisted phrase found.`);
              return;
            }
          }

          if (checkProfiles!.toLabel === true) {
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
          }

          if (checkProfiles!.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
          }

          if (checkProfiles!.commentAcct === true) {
            createAccountComment(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
          }
        }
      }
    }
  });
};
