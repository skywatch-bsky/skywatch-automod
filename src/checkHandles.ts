import { HANDLE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { Handle } from "./types.js";
import {
  createAccountReport,
  createAccountComment,
  createAccountLabel,
  checkAccountLabels,
} from "./moderation.js";
import { limit } from "./limits.js";

export const checkHandle = async (handle: Handle[]) => {
  const ActLabelChk = await limit(() => checkAccountLabels(handle[0].did));
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
      if (checkList.ignoredDIDs.includes(handle[0].did)) {
        logger.info(`Whitelisted DID: ${handle[0].did}`);
        return;
      }
    }

    if (checkList!.check.test(handle[0].handle)) {
      // False-positive checks
      if (checkList?.whitelist) {
        if (checkList?.whitelist.test(handle[0].handle)) {
          logger.info(`Whitelisted phrase found for: ${handle[0].handle}`);
          return;
        }
      }

      if (checkList?.toLabel === true) {
        {
          createAccountLabel(
            handle[0].did,
            `${checkList!.label}`,
            `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
          );
        }
      }

      if (checkList?.reportAcct === true) {
        logger.info(`Report only: ${handle[0].handle}`);
        createAccountReport(
          handle[0].did,
          `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
        );
      }

      if (checkList?.commentAcct === true) {
        logger.info(`Comment only: ${handle[0].handle}`);
        createAccountComment(
          handle[0].did,
          `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
        );
      }
    }
  });
};
