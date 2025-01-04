import { PROFILE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { createAccountReport, createAccountLabel } from "./moderation.js";

export const checkProfile = async (
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
    } else {
      let checkCount: number = 0; // Counter for checking if any checks are found

      // Check if description is enabled
      if (checkProfiles?.description === true) {
        if (checkProfiles!.check.test(description)) {
          if (checkProfiles?.whitelist) {
            if (checkProfiles?.whitelist.test(description)) {
              logger.info(`Whitelisted phrase found.`);
            }
          } else {
            logger.info(`${checkProfiles!.label} in description.`);
            checkCount++;
          }
        }
      }

      if (checkProfiles?.displayName === true) {
        if (checkProfiles!.check.test(displayName)) {
          if (checkProfiles?.whitelist) {
            if (checkProfiles?.whitelist.test(displayName)) {
              logger.info(`Whitelisted phrase found for: ${displayName}`);
            }
          } else {
            logger.info(
              `${checkProfiles!.label} in display name: ${displayName}`,
            );
            checkCount++;
          }
        }
      }

      if (checkCount === 0) return;

      if (checkProfiles.reportOnly === true) {
        logger.info(`Report only: ${did}`);
        createAccountReport(
          did,
          `${time}: ${checkProfiles!.comment} - ${displayName} - ${description}`,
        );
      } else {
        createAccountLabel(
          did,
          `${checkProfiles!.label}`,
          `${time}: ${checkProfiles!.comment}`,
        );
      }
    }
  });
};
