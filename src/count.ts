import { isLoggedIn, agent } from "./agent.js";
import logger from "./logger.js";
import { limit } from "./limits.js";
import { createAccountLabel } from "./moderation.js";

export const countStarterPacks = async (did: string, time: number) => {
  await isLoggedIn;

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
