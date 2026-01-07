import { GLOBAL_ALLOW, LINK_SHORTENER } from "../../../rules/constants.js";
import { POST_CHECKS } from "../../../rules/posts.js";
import {
  createAccountComment,
  createAccountReport,
} from "../../accountModeration.js";
import { checkAccountThreshold } from "../../accountThreshold.js";
import { logger } from "../../logger.js";
import { moderationActionsFailedCounter } from "../../metrics.js";
import { createPostLabel, createPostReport } from "../../moderation.js";
import type { ModerationResult, Post } from "../../types.js";
import { getFinalUrl } from "../../utils/getFinalUrl.js";
import { getLanguage } from "../../utils/getLanguage.js";
import { countStarterPacks } from "../account/countStarterPacks.js";

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
  for (const checkPost of POST_CHECKS) {
    if (checkPost.language) {
      if (!checkPost.language.includes(lang)) {
        continue;
      }
    }

    if (checkPost.ignoredDIDs) {
      if (checkPost.ignoredDIDs.includes(post[0].did)) {
        logger.debug(
          { process: "CHECKPOSTS", did: post[0].did, atURI: post[0].atURI },
          "Whitelisted DID",
        );
        continue;
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
          continue;
        }
      }

      await countStarterPacks(post[0].did, post[0].time);

      const postURL = `https://pdsls.dev/${post[0].atURI}`;
      const formattedComment = `${checkPost.comment}\n\nPost: ${postURL}\n\nText: "${post[0].text}"`;

      const results: ModerationResult = { success: true, errors: [] };

      if (checkPost.toLabel) {
        try {
          await createPostLabel(
            post[0].atURI,
            post[0].cid,
            checkPost.label,
            formattedComment,
            checkPost.duration,
            post[0].did,
            post[0].time,
          );
        } catch (error) {
          results.success = false;
          results.errors.push({ action: "label", error });
        }
      } else if (checkPost.trackOnly) {
        try {
          await checkAccountThreshold(
            post[0].did,
            post[0].atURI,
            checkPost.label,
            post[0].time,
          );
        } catch (error) {
          // Threshold check failures are logged but don't add to results.errors
          // since it's not a direct moderation action
          logger.error(
            {
              process: "CHECKPOSTS",
              did: post[0].did,
              atURI: post[0].atURI,
              error,
            },
            "Account threshold check failed",
          );
        }
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
        try {
          await createPostReport(post[0].atURI, post[0].cid, formattedComment);
        } catch (error) {
          results.success = false;
          results.errors.push({ action: "report", error });
        }
      }

      if (checkPost.reportAcct) {
        logger.info(
          {
            process: "CHECKPOSTS",
            label: checkPost.label,
            did: post[0].did,
            atURI: post[0].atURI,
          },
          "Reporting account",
        );
        try {
          await createAccountReport(post[0].did, formattedComment);
        } catch (error) {
          results.success = false;
          results.errors.push({ action: "report", error });
        }
      }

      if (checkPost.commentAcct) {
        try {
          await createAccountComment(
            post[0].did,
            formattedComment,
            post[0].atURI,
          );
        } catch (error) {
          results.success = false;
          results.errors.push({ action: "comment", error });
        }
      }

      // Log and track any failures
      if (!results.success) {
        for (const error of results.errors) {
          logger.error(
            {
              process: "CHECKPOSTS",
              did: post[0].did,
              atURI: post[0].atURI,
              action: error.action,
              error: error.error,
            },
            "Moderation action failed",
          );
          moderationActionsFailedCounter.inc({
            action: error.action,
            target_type: "post",
          });
        }
      }
    }
  }
};
