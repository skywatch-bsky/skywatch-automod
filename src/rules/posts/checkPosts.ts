import { LINK_SHORTENER, POST_CHECKS } from "./constants.js";
import { Post } from "../../types.js";
import { logger } from "../../logger.js";
import { countStarterPacks } from "../account/countStarterPacks.js";
import {
  createPostLabel,
  createAccountReport,
  createAccountComment,
  createPostReport,
} from "../../moderation.js";
import { getLanguage } from "../../utils/getLanguage.js";
import { getFinalUrl } from "../../utils/getFinalUrl.js";
import { GLOBAL_ALLOW } from "../../constants.js";
import { trackPostLabel } from "../../trackPostLabel.js";
import { triggerAccountLabel } from "../../triggerAccountLabel.js";

export const checkPosts = async (post: Post[]) => {
  if (GLOBAL_ALLOW.includes(post[0].did)) {
    logger.warn(
      { process: "CHECKPOSTS", did: post[0].did, atURI: post[0].atURI },
      "Global AllowListed DID",
    );
    return;
  }

  const urlRegex = /https?:\/\/[^\s]+/gi;

  // Check for link shorteners
  if (LINK_SHORTENER.test(post[0].text)) {
    try {
      const url = post[0].text.match(urlRegex);
      if (url && LINK_SHORTENER.test(url[0])) {
        logger.debug(
          { process: "CHECKPOSTS", url: url[0], did: post[0].did },
          "Resolving shortened URL",
        );

        const finalUrl = await getFinalUrl(url[0]);
        if (finalUrl && finalUrl !== url[0]) {
          post[0].text = post[0].text.replace(url[0], finalUrl);
          logger.debug(
            {
              process: "CHECKPOSTS",
              originalUrl: url[0],
              resolvedUrl: finalUrl,
              did: post[0].did,
            },
            "Shortened URL resolved",
          );
        }
      }
    } catch (error) {
      const errorInfo =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : { error: String(error) };

      logger.error(
        {
          process: "CHECKPOSTS",
          text: post[0].text,
          did: post[0].did,
          atURI: post[0].atURI,
          ...errorInfo,
        },
        "Failed to resolve shortened URL",
      );
      // Keep the original URL if resolution fails
    }
  }

  // Get the post's language
  const lang = await getLanguage(post[0].text);

  // iterate through the checks
  POST_CHECKS.forEach((checkPost) => {
    if (checkPost.language) {
      if (!checkPost.language.includes(lang)) {
        return;
      }
    }

    if (checkPost.ignoredDIDs) {
      if (checkPost.ignoredDIDs.includes(post[0].did)) {
        logger.debug(
          { process: "CHECKPOSTS", did: post[0].did, atURI: post[0].atURI },
          "Whitelisted DID",
        );
        return;
      }
    }

    if (checkPost.check.test(post[0].text)) {
      // Check if post is whitelisted
      if (checkPost.whitelist) {
        if (checkPost.whitelist.test(post[0].text)) {
          logger.debug(
            { process: "CHECKPOSTS", did: post[0].did, atURI: post[0].atURI },
            "Whitelisted phrase found",
          );
          return;
        }
      }

      countStarterPacks(post[0].did, post[0].time);

      if (checkPost.toLabel === true) {
        logger.info(
          {
            process: "CHECKPOSTS",
            label: checkPost.label,
            did: post[0].did,
            atURI: post[0].atURI,
          },
          "Labeling post",
        );
        createPostLabel(
          post[0].atURI,
          post[0].cid,
          `${checkPost.label}`,
          `${post[0].time}: ${checkPost.comment} at ${post[0].atURI} with text "${post[0].text}"`,
          checkPost.duration,
        );

        // Track labeled post and potentially trigger account-level action
        trackPostLabel(post[0].did, post[0].atURI, checkPost.label)
          .then((action) => {
            if (action) {
              triggerAccountLabel(action);
            }
          })
          .catch((error) => {
            // Errors are already logged in trackPostLabel, silently ignore here
            // to prevent unhandled rejection warnings
          });
      }

      if (checkPost.reportPost === true) {
        logger.info(
          {
            process: "CHECKPOSTS",
            label: checkPost.label,
            did: post[0].did,
            atURI: post[0].atURI,
          },
          "Reporting post",
        );
        createPostReport(
          post[0].atURI,
          post[0].cid,
          `${post[0].time}: ${checkPost.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost.reportAcct === true) {
        logger.info(
          {
            process: "CHECKPOSTS",
            label: checkPost.label,
            did: post[0].did,
            atURI: post[0].atURI,
          },
          "Reporting account",
        );
        createAccountReport(
          post[0].did,
          `${post[0].time}: ${checkPost.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }

      if (checkPost.commentAcct === true) {
        logger.info(
          {
            process: "CHECKPOSTS",
            label: checkPost.label,
            did: post[0].did,
            atURI: post[0].atURI,
          },
          "Commenting on account",
        );
        createAccountComment(
          post[0].did,
          `${post[0].time}: ${checkPost.comment} at ${post[0].atURI} with text "${post[0].text}"`,
        );
      }
    }
  });
};
