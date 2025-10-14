import { HANDLE_CHECKS } from "./constants.js";
import { logger } from "./logger.js";
import {
  createAccountReport,
  createAccountComment,
  createAccountLabel,
} from "./moderation.js";

export const checkHandle = async (
  did: string,
  handle: string,
  time: number,
) => {
  // iterate through the checks
  HANDLE_CHECKS.forEach((checkList) => {
    if (checkList.ignoredDIDs) {
      if (checkList.ignoredDIDs.includes(did)) {
        logger.info(`Whitelisted DID: ${did}`);
        return;
      }
    }

    if (checkList.check.test(handle)) {
      // False-positive checks
      if (checkList.whitelist) {
        if (checkList.whitelist.test(handle)) {
          logger.info(`Whitelisted phrase found for: ${handle}`);
          return;
        }
      }

      if (checkList.toLabel === true) {
        logger.info(`[CHECKHANDLE]: Labeling ${did} for ${checkList.label}`);
        {
          createAccountLabel(
            did,
            `${checkList.label}`,
            `${time}: ${checkList.comment} - ${handle}`,
          );
        }
      }

      if (checkList.reportAcct === true) {
        logger.info(`[CHECKHANDLE]: Reporting ${did} for ${checkList.label}`);
        createAccountReport(did, `${time}: ${checkList.comment} - ${handle}`);
      }

      if (checkList.commentAcct === true) {
        logger.info(
          `[CHECKHANDLE]: Commenting on ${did} for ${checkList.label}`,
        );
        createAccountComment(did, `${time}: ${checkList.comment} - ${handle}`);
      }
    }
  });
};
