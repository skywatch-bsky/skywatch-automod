import { magaTrump, troll, nazism, elonMusk } from "./constants.js";
import logger from "./logger.js";
import { Handle } from "./types.js";
import { createAccountLabel } from "./moderation.js";
import { IGNORED_DIDS } from "./whitelist.js";

export const checkHandle = async (handle: Handle[]) => {
  if (IGNORED_DIDS.includes(handle[0].did)) {
    return logger.info(`Ignoring DID: ${handle[0].did}`);
  } else {
    if (magaTrump.test(handle[0].handle)) {
      logger.info(`MAGA/Trump handle found: ${handle[0].handle}`);

      createAccountLabel(
        handle[0].did,
        "maga-trump",
        `${handle[0].time}: MAGA/Trump handle found: ${handle[0].handle}`,
      );
    }
    if (troll.test(handle[0].handle)) {
      logger.info(`Troll handle found: ${handle[0].handle}`);
      createAccountLabel(
        handle[0].did,
        "troll",
        `${handle[0].time}: Troll handle found: ${handle[0].handle}`,
      );
    }
    if (nazism.test(handle[0].handle)) {
      logger.info(`Nazi reference handle found: ${handle[0].handle}`);
      createAccountLabel(
        handle[0].did,
        "nazi-symbolism",
        `${handle[0].time}: Nazism handle found: ${handle[0].handle}`,
      );
    }
    if (elonMusk.test(handle[0].handle)) {
      logger.info(`Elon Musk handle found: ${handle[0].handle}`);
      createAccountLabel(
        handle[0].did,
        "elon-musk",
        `${handle[0].time}: Elon Musk handle found: ${handle[0].handle}`,
      );
    }
  }
};
