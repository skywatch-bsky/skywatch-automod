import { HANDLE_CHECKS } from "./constants.js";
import { logger } from "./logger.js";
import {
  createAccountReport,
  createAccountComment,
  createAccountLabel,
} from "./moderation.js";
import { GLOBAL_ALLOW } from "./constants.js";

export const checkHandle = async (
  did: string,
  handle: string,
  time: number,
) => {
  // Check if DID is whitelisted
  if (GLOBAL_ALLOW.includes(did)) {
    logger.warn(
      { process: "CHECKHANDLE", did, handle, time },
      "Global AllowListed DID",
    );
    return;
  }

  // iterate through the checks
  HANDLE_CHECKS.forEach((checkList) => {
    if (checkList.ignoredDIDs) {
      if (checkList.ignoredDIDs.includes(did)) {
        logger.debug(
          { process: "CHECKHANDLE", did, handle, time },
          "Whitelisted DID",
        );
        return;
      }
    }

    if (checkList.check.test(handle)) {
      // False-positive checks
      if (checkList.whitelist) {
        if (checkList.whitelist.test(handle)) {
          logger.debug(
            { process: "CHECKHANDLE", did, handle, time },
            "Whitelisted phrase found",
          );
          return;
        }
      }

      if (checkList.toLabel === true) {
        logger.info(
          { process: "CHECKHANDLE", did, handle, time, label: checkList.label },
          "Labeling account",
        );
        {
          createAccountLabel(
            did,
            `${checkList.label}`,
            `${time}: ${checkList.comment} - ${handle}`,
          );
        }
      }

      if (checkList.reportAcct === true) {
        logger.info(
          { process: "CHECKHANDLE", did, handle, time, label: checkList.label },
          "Reporting account",
        );
        createAccountReport(did, `${time}: ${checkList.comment} - ${handle}`);
      }

      if (checkList.commentAcct === true) {
        logger.info(
          { process: "CHECKHANDLE", did, handle, time, label: checkList.label },
          "Commenting on account",
        );
        createAccountComment(did, `${time}: ${checkList.comment} - ${handle}`);
      }
    }
  });
};
