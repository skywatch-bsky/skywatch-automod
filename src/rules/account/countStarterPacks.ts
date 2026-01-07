import { createAccountLabel } from "../../accountModeration.js";
import { agent, isLoggedIn } from "../../agent.js";
import { limit } from "../../limits.js";
import { logger } from "../../logger.js";
import { moderationActionsFailedCounter } from "../../metrics.js";

const ALLOWED_DIDS = ["did:plc:example"];

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

        try {
          await createAccountLabel(
            did,
            "follow-farming",
            `${time.toString()}: Account has ${starterPacks.toString()} starter packs`,
          );
        } catch (labelError) {
          logger.error(
            { process: "COUNTSTARTERPACKS", did, time, error: labelError },
            "Failed to apply follow-farming label",
          );
          moderationActionsFailedCounter.inc({
            action: "label",
            target_type: "account",
          });
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
        { process: "COUNTSTARTERPACKS", did, time, ...errorInfo },
        "Error checking associated accounts",
      );
    }
  });
};
