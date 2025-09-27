import { isLoggedIn, agent } from "./agent.js";
import { limit } from "./limits.js";
import logger from "./logger.js";
import { createAccountLabel } from "./moderation.js";

export const countStarterPacks = async (did: string, time: number) => {
  await isLoggedIn;

  if (did in ["did:plc:gpunjjgvlyb4racypz3yfiq4"]) {
    logger.info(
      `[COUNTSTARTERPACKS]: ${time}: Account ${did} is a whitelisted.`,
    );
    return;
  }

  await limit(async () => {
    try {
      const profile = await agent.app.bsky.actor.getProfile({ actor: did });
      const starterPacks = profile.data.associated?.starterPacks;

      if (starterPacks && starterPacks.valueOf() > 20) {
        createAccountLabel(
          did,
          "follow-farming",
          `[COUNTSTARTERPACKS]: ${time}: Account ${did} has ${starterPacks} starter packs.`,
        );
      }
    } catch (error) {
      logger.error(
        `[COUNTSTARTERPACKS]: Error checking associated accounts: ${error}`,
      );
    }
  });
};
