import { HANDLE_CHECKS } from './constants.js';
import logger from './logger.js';
import {
  createAccountReport,
  createAccountComment,
  createAccountLabel,
} from './moderation.js';

export const checkHandle = (
  did: string,
  handle: string,
  time: number,
) => {
  try {
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

      if (checkList?.check.test(handle)) {
      // False-positive checks
        if (checkList.whitelist) {
          if (checkList.whitelist.test(handle)) {
            logger.info(`Whitelisted phrase found for: ${handle}`);
            return;
          }
        }

        if (checkList.toLabel) {
          logger.info(`[CHECKHANDLE]: Labeling ${did} for ${checkList.label}`);
          {
            void createAccountLabel(
              did,
              checkList.label,
              `${time.toString()}: ${checkList.comment} - ${handle}`,
            );
          }
        }

        if (checkList.reportAcct) {
          logger.info(`[CHECKHANDLE]: Reporting ${did} for ${checkList.label}`);
          void createAccountReport(did, `${time.toString()}: ${checkList.comment} - ${handle}`);
        }

        if (checkList.commentAcct) {
          logger.info(
            `[CHECKHANDLE]: Commenting on ${did} for ${checkList.label}`,
          );
          void createAccountComment(did, `${time.toString()}: ${checkList.comment} - ${handle}`);
        }
      }
    });
  } catch (error) {
    logger.error(`Error in checkHandle for ${did}:`, error);
    throw error;
  }
};
