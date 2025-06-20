import { POST_CHECKS } from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import {
  createPostLabel,
  createAccountReport,
  createAccountComment,
  createPostReport,
} from "./moderation.js";
import { LINK_SHORTENER } from "./constants.js";
import { getFinalUrl } from "./utils.js";

export const checkPosts = async (post: Post[]) => {
  // Get a list of labels
  const labels: string[] = Array.from(
    POST_CHECKS,
    (postCheck) => postCheck.label,
  );

  // Check for link shorteners
  try {
    // Use LINK_SHORTENER to extract the specific shortener URL
    const shortenerMatch = post[0].text.match(LINK_SHORTENER);

    if (shortenerMatch && shortenerMatch[0]) {
      // shortenerMatch[0] is the full matched shortener URL
      const matchedShortUrl = shortenerMatch[0];
      const finalUrl = await getFinalUrl(matchedShortUrl);

      if (finalUrl && finalUrl !== matchedShortUrl) {
        // Only replace if different
        // Replace only the shortened URL, not the entire post text
        post[0].text = post[0].text.replace(matchedShortUrl, finalUrl);
        logger.info(
          `Shortened URL resolved: ${matchedShortUrl} -> ${finalUrl}`,
        );
      } else if (finalUrl === matchedShortUrl) {
        logger.info(
          `Shortened URL resolved to itself (no change): ${matchedShortUrl}`,
        );
      }
    }
  } catch (error) {
    // It's good to log which URL specifically failed if possible
    const shortenerMatchForError = post[0].text.match(LINK_SHORTENER);
    const failedUrl = shortenerMatchForError
      ? shortenerMatchForError[0]
      : post[0].text;
    logger.error(`Failed to resolve shortened URL: ${failedUrl}`, error);
    // Keep the original URL if resolution fails
  }

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
