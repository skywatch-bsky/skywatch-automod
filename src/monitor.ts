import { describe } from "node:test";
import { PROFILE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { createAccountReport, createAccountLabel } from "./moderation.js";

export const monitorDescription = async (
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
        return logger.info(`Whitelisted DID: ${did}`);
      }
    }

    if (description) {
      if (checkProfiles?.description === true) {
        if (checkProfiles!.check.test(description)) {
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(description)) {
              logger.info(`Whitelisted phrase found.`);
              return;
            }
          } else {
            logger.info(`${checkProfiles!.label} in description for ${did}`);
          }

          if (checkProfiles!.reportOnly === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            return;
          } else {
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment}`,
            );
          }
        }
      }
    }
  });
};

export const monitorDisplayName = async (
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
        return logger.info(`Whitelisted DID: ${did}`);
      }
    }

    if (displayName) {
      if (checkProfiles?.displayName === true) {
        if (checkProfiles!.check.test(displayName)) {
          if (checkProfiles!.whitelist) {
            if (checkProfiles!.whitelist.test(displayName)) {
              logger.info(`Whitelisted phrase found.`);
              return;
            }
          } else {
            logger.info(`${checkProfiles!.label} in displayName for ${did}`);
          }

          if (checkProfiles!.reportOnly === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
            );
            return;
          } else {
            createAccountLabel(
              did,
              `${checkProfiles!.label}`,
              `${time}: ${checkProfiles!.comment}`,
            );
          }
        }
      }
    }
  });
};
