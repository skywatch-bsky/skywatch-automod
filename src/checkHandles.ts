import { HANDLE_CHECKS } from "./constants.js";
import logger from "./logger.js";
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
  // Get a list of labels
  const labels: string[] = Array.from(
    HANDLE_CHECKS,
    (handleCheck) => handleCheck.label,
  );

  // iterate through the labels
  labels.forEach((label) => {
    const checkList = HANDLE_CHECKS.find(
      (handleCheck) => handleCheck.label === label,
    );

    if (checkList?.ignoredDIDs) {
      if (checkList.ignoredDIDs.includes(did)) {
        logger.info(`Whitelisted DID: ${did}`);
        return;
      }
    }

    if (checkList!.check.test(handle)) {
      // False-positive checks
      if (checkList?.whitelist) {
        if (checkList?.whitelist.test(handle)) {
          logger.info(`Whitelisted phrase found for: ${handle}`);
          return;
        }
      }

      if (checkList?.toLabel === true) {
        {
          createAccountLabel(
            did,
            `${checkList!.label}`,
            `${time}: ${checkList!.comment} - ${handle}`,
          );
        }
      }

      if (checkList?.reportAcct === true) {
        logger.info(`Report only: ${handle}`);
        createAccountReport(did, `${time}: ${checkList!.comment} - ${handle}`);
      }

      if (checkList?.commentAcct === true) {
        logger.info(`Comment only: ${handle}`);
        createAccountComment(did, `${time}: ${checkList!.comment} - ${handle}`);
      }
    }
  });
};
