import { isLoggedIn, agent } from "../../agent.js";
import { logger } from "../../logger.js";
import { limit } from "../../limits.js";
import { createAccountLabel } from "../../moderation.js";

const ALLOWED_DIDS = ["did:plc:gpunjjgvlyb4racypz3yfiq4"];

export const countStarterPacks = async (did: string, time: number) => {
  await isLoggedIn;

  if (ALLOWED_DIDS.includes(did)) {
    logger.debug(
      { process: "COUNTSTARTERPACKS", did, time },
      "Account is whitelisted",
    );
    return;
  }

  await limit(async () => {
    try {
      const profile = await agent.app.bsky.actor.getProfile({ actor: did });
      const starterPacks = profile.data.associated?.starterPacks;

      if (starterPacks && starterPacks.valueOf() > 20) {
        logger.info(
          {
            process: "COUNTSTARTERPACKS",
            did,
            time,
            starterPackCount: starterPacks.valueOf(),
          },
          "Labeling account with excessive starter packs",
        );

        createAccountLabel(
          did,
          "follow-farming",
          `${time}: Account has ${starterPacks} starter packs`,
        );
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
        { process: "COUNTSTARTERPACKS", did, time, ...errorInfo },
        "Error checking associated accounts",
      );
    }
  });
};
