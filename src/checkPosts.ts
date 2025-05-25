import { POST_CHECKS } from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import {
  createPostLabel,
  createAccountReport,
  createAccountComment,
  createPostReport,
} from "./moderation.js";

export const checkPosts = async (post: Post[]) => {
  // Get a list of labels
  const labels: string[] = Array.from(
    POST_CHECKS,
    (postCheck) => postCheck.label,
  );

  // iterate through the labels
  labels.forEach((label) => {
    const checkPost = POST_CHECKS.find(
      (postCheck) => postCheck.label === label,
    );

    if (checkPost?.ignoredDIDs) {
      if (checkPost?.ignoredDIDs.includes(post[0].did)) {
        logger.info(`Whitelisted DID: ${post[0].did}`);
        return;
      }
    }

    if (checkPost!.check.test(post[0].text)) {
      // Check if post is whitelisted
      if (checkPost?.whitelist) {
        if (checkPost?.whitelist.test(post[0].text)) {
          logger.info(`Whitelisted phrase found"`);
          return;
        }
      }

      if (checkPost!.toLabel === true) {
        logger.info(`Labeling post: ${post[0].atURI} for ${checkPost!.label}`);
        createPostLabel(
          post[0].atURI,
          post[0].cid,
          `${checkPost!.label}`,
          `${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.reportPost === true) {
        logger.info(
          `Suspected ${checkPost!.label} in post at ${post[0].atURI}`,
        );
        logger.info(`Reporting: ${post[0].atURI}`);
        createPostReport(
          post[0].atURI,
          post[0].cid,
          `${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.reportAcct === true) {
        logger.info(`${checkPost!.label} in post at ${post[0].atURI}`);
        logger.info(`Report only: ${post[0].did}`);
        createAccountReport(
          post[0].did,
          `${post[0].time}: ${checkPost?.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.commentAcct === true) {
        logger.info(`Comment on account: ${post[0].did}`);
        createAccountComment(
          post[0].did,
          `${post[0].time}: ${checkPost?.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }
    }
  });
};
