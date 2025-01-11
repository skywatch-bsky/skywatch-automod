import { PROFILE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { createAccountLabel } from "./moderation.js";

export const checkStarterPack = async (
  did: string,
  time: number,
  atURI: string,
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

    if (atURI) {
      if (checkProfiles?.starterPacks) {
        if (checkProfiles?.starterPacks.includes(atURI)) {
          logger.info(`Account joined via starter pack at: ${atURI}`);
          createAccountLabel(
            did,
            `${checkProfiles!.label}`,
            `${time}: ${checkProfiles!.comment} - Account joined via starter pack at: ${atURI}`,
          );
        }
      }
    }
  });
};
