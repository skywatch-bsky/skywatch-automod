import { GLOBAL_ALLOW } from "../../../rules/constants.js";
import { HANDLE_CHECKS } from "../../../rules/handles.js";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "../../accountModeration.js";
import { logger } from "../../logger.js";

export const checkHandle = (
  did: string,
  handle: string,
  time: number,
): void => {
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

      if (checkList.toLabel) {
        void createAccountLabel(
          did,
          checkList.label,
          `${time.toString()}: ${checkList.comment} - ${handle}`,
        );
      }

      if (checkList.reportAcct) {
        logger.info(
          { process: "CHECKHANDLE", did, handle, time, label: checkList.label },
          "Reporting account",
        );
        void createAccountReport(did, `${time.toString()}: ${checkList.comment} - ${handle}`);
      }

      if (checkList.commentAcct) {
        void createAccountComment(
          did,
          `${time.toString()}: ${checkList.comment} - ${handle}`,
          `handle:${did}:${handle}`,
        );
      }
    }
  });
};
