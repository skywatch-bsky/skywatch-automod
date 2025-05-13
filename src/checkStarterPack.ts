import { PROFILE_CHECKS, STARTERPACK_CHECKS } from "./constants.js";
import logger from "./logger.js";
import {
  createAccountLabel,
  createAccountReport,
  createPostLabel,
} from "./moderation.js";

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

export const checkNewStarterPack = async (
  did: string,
  time: number,
  atURI: string,
  cid: string,
  packName: string | undefined,
  description: string | undefined,
) => {
  const labels: string[] = Array.from(
    STARTERPACK_CHECKS,
    (SPCheck) => SPCheck.label,
  );

  labels.forEach((label) => {
    const checkList = PROFILE_CHECKS.find((SPCheck) => SPCheck.label === label);

    if (checkList?.knownVectors?.includes(did)) {
      createPostLabel(
        atURI,
        cid,
        `${checkList!.label}`,
        `${time}: Starter pack created by known vector for ${checkList!.label} at: ${atURI}"`,
      );
      createAccountReport(
        did,
        `${time}: Starter pack created by known vector for ${checkList!.label} at: ${atURI}"`,
      );
    }

    if (description) {
      if (checkList!.check.test(description)) {
        logger.info(`Labeling post: ${atURI}`);
        createPostLabel(
          atURI,
          cid,
          `${checkList!.label}`,
          `${time}: ${checkList!.comment} at ${atURI} with text "${description}"`,
        );
        createAccountReport(
          did,
          `${time}: ${checkList!.comment} at ${atURI} with text "${description}"`,
        );
      }
    }

    if (packName) {
      if (checkList!.check.test(packName)) {
        logger.info(`Labeling post: ${atURI}`);
        createPostLabel(
          atURI,
          cid,
          `${checkList!.label}`,
          `${time}: ${checkList!.comment} at ${atURI} with pack name "${packName}"`,
        );
        createAccountReport(
          did,
          `${time}: ${checkList!.comment} at ${atURI} with pack name "${packName}"`,
        );
      }
    }
  });
};
