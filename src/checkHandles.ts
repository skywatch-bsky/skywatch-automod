import { HANDLE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { Handle } from "./types.js";
import { createAccountReport, createAccountLabel } from "./moderation.js";

export const checkHandle = async (handle: Handle[]) => {
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
        return logger.info(`Whitelisted DID: ${handle[0].did}`);
      }
    } else {
      if (checkList!.check.test(handle[0].handle)) {
        if (checkList?.whitelist) {
          // False-positive checks
          if (checkList?.whitelist.test(handle[0].handle)) {
            logger.info(`Whitelisted phrase found for: ${handle[0].handle}`);
            return;
          }
        } else {
          logger.info(`${checkList!.label} in handle: ${handle[0].handle}`);
        }

        if (checkList?.reportOnly === true) {
          logger.info(`Report only: ${handle[0].handle}`);
          createAccountReport(
            handle[0].did,
            `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
          );
        } else {
          createAccountLabel(
            handle[0].did,
            `${checkList!.label}`,
            `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
          );
        }
      }
    }
  });
};
