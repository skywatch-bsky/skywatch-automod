import {
  fundraising,
  altTech,
  fringeMedia,
  disinfoNetwork,
  sportsBetting,
  slur,
} from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import { createPostLabel, createAccountComment } from "./moderation.js";

export const checkPosts = async (post: Post[]) => {
  if (fundraising.test(post[0].check)) {
    logger.info("Fundraising link found");
    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "fundraising-link",
      `${post[0].time}: Fundraising link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
    /* createAccountComment(
      post[0].did,
      `${post[0].time}: Fundraising link found in post at ${post[0].atURI} - ${post[0].check}`,
    ); */
  }
  if (fringeMedia.test(post[0].check)) {
    logger.info("Fringe media link found");

    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "fringe-media",
      `${post[0].time}: Fringe media link found in post at ${post[0].atURI} - ${post[0].check}`,
    );

    createAccountComment(
      post[0].did,
      `${post[0].time}: Fringe media link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (altTech.test(post[0].check)) {
    logger.info("Alt-tech link found");

    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "alt-tech",
      `${post[0].time}: Alt-tech link found in post at ${post[0].atURI} - ${post[0].check}`,
    );

    createAccountComment(
      post[0].did,
      `${post[0].time}: Alt-tech link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (disinfoNetwork.test(post[0].check)) {
    logger.info("Disinfo network link");

    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "disinformation-network",
      `${post[0].time}: Disinfo network link found in post at ${post[0].atURI} - ${post[0].check}`,
    );

    createAccountComment(
      post[0].did,
      `${post[0].time}: Disinfo network link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (sportsBetting.test(post[0].check)) {
    logger.info("Sports betting link found");

    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "sports-betting-link",
      `${post[0].time}: Sports betting link found in post at ${post[0].atURI} - ${post[0].check}`,
    );

    createAccountComment(
      post[0].did,
      `${post[0].time}: Sports betting link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (slur.test(post[0].check)) {
    logger.info("Slur found");

    createPostLabel(
      post[0].atURI,
      post[0].cid,
      "contains-slur",
      `${post[0].time}: Slur found in post at ${post[0].atURI} - ${post[0].check}`,
    );

    createAccountComment(
      post[0].did,
      `${post[0].time}: Slur found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
};
