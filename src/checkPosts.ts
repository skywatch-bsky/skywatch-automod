import { LINK_SHORTENER, POST_CHECKS, langs } from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import {
  createPostLabel,
  createAccountReport,
  createAccountComment,
  createPostReport,
} from "./moderation.js";
import { getFinalUrl, getLanguage } from "./utils.js";

export const checkPosts = async (post: Post[]) => {
  // Get a list of labels
  const labels: string[] = Array.from(
    POST_CHECKS,
    (postCheck) => postCheck.label,
  );

  const urlRegex = /https?:\/\/[^\s]+/g;

  // Check for link shorteners
  if (LINK_SHORTENER.test(post[0].text)) {
    try {
      const url = post[0].text.match(urlRegex);
      if (url && LINK_SHORTENER.test(url[0])) {
        logger.info(`[CHECKPOSTS]: Checking shortened URL: ${url[0]}`);
        const finalUrl = await getFinalUrl(url[0]);
        if (finalUrl) {
          const originalUrl = post[0].text;
          post[0].text = post[0].text.replace(url[0], finalUrl);
          logger.info(
            `[CHECKPOSTS]: Shortened URL resolved: ${originalUrl} -> ${finalUrl}`,
          );
        }
      }
    } catch (error) {
      logger.error(
        `[CHECKPOSTS]: Failed to resolve shortened URL: ${post[0].text}`,
        error,
      );
      // Keep the original URL if resolution fails
    }
  }

  // Get the post's language
  const lang = await getLanguage(post[0].text);

  // iterate through the labels
  labels.forEach((label) => {
    const checkPost = POST_CHECKS.find(
      (postCheck) => postCheck.label === label,
    );

    if (checkPost?.language || checkPost?.language !== undefined) {
      if (!checkPost?.language.includes(lang)) {
        return;
      }
    }

    if (checkPost?.ignoredDIDs) {
      if (checkPost?.ignoredDIDs.includes(post[0].did)) {
        logger.info(`[CHECKPOSTS]: Whitelisted DID: ${post[0].did}`);
        return;
      }
    }

    if (checkPost!.check.test(post[0].text)) {
      // Check if post is whitelisted
      if (checkPost?.whitelist) {
        if (checkPost?.whitelist.test(post[0].text)) {
          logger.info(`[CHECKPOSTS]: Whitelisted phrase found"`);
          return;
        }
      }

      if (checkPost!.toLabel === true) {
        logger.info(
          `[CHECKPOSTS]: Labeling ${post[0].atURI} for ${checkPost!.label}`,
        );
        createPostLabel(
          post[0].atURI,
          post[0].cid,
          `${checkPost!.label}`,
          `${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.reportPost === true) {
        logger.info(
          `[CHECKPOSTS]: Reporting ${post[0].atURI} for ${checkPost!.label}`,
        );
        logger.info(`Reporting: ${post[0].atURI}`);
        createPostReport(
          post[0].atURI,
          post[0].cid,
          `${post[0].time}: ${checkPost!.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.reportAcct === true) {
        logger.info(
          `[CHECKPOSTS]: Reporting on ${post[0].did} for ${checkPost!.label} in ${post[0].atURI}`,
        );
        createAccountReport(
          post[0].did,
          `${post[0].time}: ${checkPost?.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost!.commentAcct === true) {
        logger.info(
          `[CHECKPOSTS]: Commenting on ${post[0].did} for ${checkPost!.label} in ${post[0].atURI}`,
        );
        createAccountComment(
          post[0].did,
          `${post[0].time}: ${checkPost?.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }
    }
  });
};
