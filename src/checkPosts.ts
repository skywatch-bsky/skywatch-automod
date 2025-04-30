import { POST_CHECKS } from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import {
  createPostLabel,
  createAccountReport,
  createAccountComment,
} from "./moderation.js";

export const checkPosts = async (post: Post[]) => {
  // Get a list of labels
  const labels: string[] = Array.from(
    POST_CHECKS,
    (postCheck) => postCheck.label,
  );

  // Destructure Post object
  const { did, time, atURI, text, cid } = post[0];

  // iterate through the labels
  labels.forEach((label) => {
    const checkPost = POST_CHECKS.find(
      (postCheck) => postCheck.label === label,
    );

    if (checkPost?.ignoredDIDs) {
      if (checkPost?.ignoredDIDs.includes(did)) {
        logger.info(`Whitelisted DID: ${did}`);
        return;
      }

      if (checkPost!.check.test(text)) {
        if (checkPost?.whitelist) {
          if (checkPost?.whitelist.test(text)) {
            logger.info(`Whitelisted phrase found"`);
            return;
          }
        }

        if (checkPost!.reportOnly === true) {
          logger.info(`${checkPost!.label} in post at ${atURI}`);
          logger.info(`Report only: ${did}`);
          createAccountReport(
            did,
            `${time}: ${checkPost?.comment} at ${atURI} with text "${text}"`,
          );
          return;
        } else {
          logger.info(`Labeling post: ${atURI}`);

          createPostLabel(
            post[0].atURI,
            post[0].cid,
            `${checkPost!.label}`,
            `${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
          );
          if (checkPost!.commentOnly === true) {
            logger.info(`Comment only: ${post[0].did}`);
            createAccountComment(
              post[0].did,
              `${post[0].time}: ${checkPost?.comment} at ${post[0].atURI} with text "${post[0].text}"`,
            );
            return;
          } else if (
            checkPost?.label === "fundraising-link" ||
            checkPost?.label === "twitter-x"
          ) {
            return; // skip fundraising links—hardcoded because of the insane volume by spammers.
          } else if (checkPost!.commentOnly === false) {
            logger.info(
              `Creating report for post ${post[0].atURI} on ${post[0].did}`,
            );
            createAccountReport(
              post[0].did,
              ` ${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
            );
          }
        }
      }
    }
  });
};
