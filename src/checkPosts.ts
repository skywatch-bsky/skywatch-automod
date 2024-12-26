import {
  fundraising,
  altTech,
  fringeMedia,
  disinfoNetwork,
  sportsBetting,
} from "./constants.js";
import { Post } from "./types.js";
import logger from "./logger.js";
import { createPostLabel } from "./moderation.js";

export const checkPosts = async (post: Post[]) => {
  if (fundraising.test(post[0].check)) {
    logger.info(`${post[0].time}: Fundraising link found`);
    await createPostLabel(
      post[0].atURI,
      post[0].cid,
      "fundraising-link",
      `${post[0].time}: Fundraising link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (fringeMedia.test(post[0].check)) {
    logger.info(`${post[0].time}: Fringe media link found`);
    await createPostLabel(
      post[0].atURI,
      post[0].cid,
      "fringe-media",
      `${post[0].time}: Fringe media link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (altTech.test(post[0].check)) {
    logger.info(`${post[0].time}: Alt-tech link found`);
    await createPostLabel(
      post[0].atURI,
      post[0].cid,
      "alt-tech",
      `${post[0].time}: Alt-tech link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (disinfoNetwork.test(post[0].check)) {
    logger.info(`${post[0].time}: Disinfo network link`);
    await createPostLabel(
      post[0].atURI,
      post[0].cid,
      "disinformation-network",
      `${post[0].time}: Disinfo network link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
  if (sportsBetting.test(post[0].check)) {
    logger.info(`${post[0].time}: Sports betting link found`);
    await createPostLabel(
      post[0].atURI,
      post[0].cid,
      "sports-betting-link",
      `${post[0].time}: Sports betting link found in post at ${post[0].atURI} - ${post[0].check}`,
    );
  }
};
