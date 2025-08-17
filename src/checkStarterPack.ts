import { PROFILE_CHECKS, STARTERPACK_CHECKS } from './constants.js';
import logger from './logger.js';
import {
  createAccountLabel,
  createAccountReport,
  createPostLabel,
} from './moderation.js';

export const checkStarterPack = (
  did: string,
  time: number,
  atURI: string,
) => {
  try {
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
          logger.info(`Whitelisted DID: ${did}`); return;
        }
      }

      if (atURI) {
        if (checkProfiles?.starterPacks) {
          if (checkProfiles.starterPacks.includes(atURI)) {
            logger.info(`Account joined via starter pack at: ${atURI}`);
            void createAccountLabel(
              did,
              checkProfiles.label,
              `${time.toString()}: ${checkProfiles.comment} - Account joined via starter pack at: ${atURI}`,
            );
          }
        }
      }
    });
  } catch (error) {
    logger.error(`Error in checkStarterPack for ${did}:`, error);
    throw error;
  }
};

export const checkNewStarterPack = (
  did: string,
  time: number,
  atURI: string,
  cid: string,
  packName: string | undefined,
  description: string | undefined,
) => {
  try {
    const labels: string[] = STARTERPACK_CHECKS.map((SPCheck) => SPCheck.label);

    labels.forEach((label) => {
      const checkList = STARTERPACK_CHECKS.find((SPCheck) => SPCheck.label === label);

      if (checkList?.knownVectors?.includes(did)) {
        void createPostLabel(
          atURI,
          cid,
          checkList.label,
          `${time.toString()}: Starter pack created by known vector for ${checkList.label} at: ${atURI}"`,
        );
        void createAccountReport(
          did,
          `${time.toString()}: Starter pack created by known vector for ${checkList.label} at: ${atURI}"`,
        );
      }

      if (description) {
        if (checkList?.check.test(description)) {
          logger.info(`Labeling post: ${atURI}`);
          void createPostLabel(
            atURI,
            cid,
            checkList.label,
            `${time.toString()}: ${checkList.comment} at ${atURI} with text "${description}"`,
          );
          void createAccountReport(
            did,
            `${time.toString()}: ${checkList.comment} at ${atURI} with text "${description}"`,
          );
        }
      }

      if (packName) {
        if (checkList?.check.test(packName)) {
          logger.info(`Labeling post: ${atURI}`);
          void createPostLabel(
            atURI,
            cid,
            checkList.label,
            `${time.toString()}: ${checkList.comment} at ${atURI} with pack name "${packName}"`,
          );
          void createAccountReport(
            did,
            `${time.toString()}: ${checkList.comment} at ${atURI} with pack name "${packName}"`,
          );
        }
      }
    });
  } catch (error) {
    logger.error(`Error in checkNewStarterPack for ${did}:`, error);
    throw error;
  }
};
