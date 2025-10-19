import { PROFILE_CHECKS } from "../../rules/profiles/constants.js";
import { logger } from "../../logger.js";
import {
  createAccountReport,
  createAccountLabel,
  createAccountComment,
} from "../../moderation.js";
import { getLanguage } from "../../utils/getLanguage.js";
import { GLOBAL_ALLOW } from "../../constants.js";

export const checkDescription = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  const lang = await getLanguage(description);

  // Check if DID is whitelisted
  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKDESCRIPTION", did, time, displayName, description },
      "Global AllowListed DID",
    );
    return;
  }

  // iterate through the checks
  PROFILE_CHECKS.forEach((checkProfiles) => {
    if (checkProfiles.language) {
      if (!checkProfiles.language.includes(lang)) {
        return;
      }
    }

    // Check if DID is whitelisted
    if (checkProfiles.ignoredDIDs) {
      if (checkProfiles.ignoredDIDs.includes(did)) {
        logger.debug(
          { process: "CHECKDESCRIPTION", did, time, displayName, description },
          "Whitelisted DID",
        );
        return;
      }
    }

    if (description) {
      if (checkProfiles.description === true) {
        if (checkProfiles.check.test(description)) {
          // Check if description is whitelisted
          if (checkProfiles.whitelist) {
            if (checkProfiles.whitelist.test(description)) {
              logger.debug(
                {
                  process: "CHECKDESCRIPTION",
                  did,
                  time,
                  displayName,
                  description,
                },
                "Whitelisted phrase found",
              );
              return;
            }
          }

          if (checkProfiles.toLabel === true) {
            createAccountLabel(
              did,
              `${checkProfiles.label}`,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDESCRIPTION",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Labeling account",
            );
          }

          if (checkProfiles.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDESCRIPTION",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Reporting account",
            );
          }

          if (checkProfiles.commentAcct === true) {
            createAccountComment(
              did,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDESCRIPTION",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Commenting on account",
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
  // Check if DID is whitelisted
  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKDISPLAYNAME", did, time, displayName, description },
      "Global AllowListed DID",
    );
    return;
  }

  const lang = await getLanguage(description);

  // iterate through the checks
  PROFILE_CHECKS.forEach((checkProfiles) => {
    if (checkProfiles.language) {
      if (!checkProfiles.language.includes(lang)) {
        return;
      }
    }

    // Check if DID is whitelisted
    if (checkProfiles.ignoredDIDs) {
      if (checkProfiles.ignoredDIDs.includes(did)) {
        logger.debug(
          { process: "CHECKDISPLAYNAME", did, time, displayName, description },
          "Whitelisted DID",
        );
        return;
      }
    }

    if (displayName) {
      if (checkProfiles.displayName === true) {
        if (checkProfiles.check.test(displayName)) {
          // Check if displayName is whitelisted
          if (checkProfiles.whitelist) {
            if (checkProfiles.whitelist.test(displayName)) {
              logger.debug(
                {
                  process: "CHECKDISPLAYNAME",
                  did,
                  time,
                  displayName,
                  description,
                },
                "Whitelisted phrase found",
              );
              return;
            }
          }

          if (checkProfiles.toLabel === true) {
            createAccountLabel(
              did,
              `${checkProfiles.label}`,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDISPLAYNAME",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Labeling account",
            );
          }

          if (checkProfiles.reportAcct === true) {
            createAccountReport(
              did,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDISPLAYNAME",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Reporting account",
            );
          }

          if (checkProfiles.commentAcct === true) {
            createAccountComment(
              did,
              `${time}: ${checkProfiles.comment} - ${displayName} - ${description}`,
            );
            logger.info(
              {
                process: "CHECKDISPLAYNAME",
                did,
                time,
                displayName,
                description,
                label: checkProfiles.label,
              },
              "Commenting on account",
            );
          }
        }
      }
    }
  });
};
