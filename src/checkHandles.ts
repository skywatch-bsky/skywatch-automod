import { HANDLE_CHECKS } from "./constants.js";
import logger from "./logger.js";
import { Handle } from "./types.js";
import {
  createAccountReport,
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
          return;
        } else {
          if (ActLabelChk) {
            if (ActLabelChk.includes(checkList!.label)) {
              logger.info(
                `Label ${checkList!.label} already exists for ${did}`,
              );
              return;
            } else {
              createAccountLabel(
                handle[0].did,
                `${checkList!.label}`,
                `${handle[0].time}: ${checkList!.comment} - ${handle[0].handle}`,
              );
            }
          }
        }
      }
    }
  });
};
